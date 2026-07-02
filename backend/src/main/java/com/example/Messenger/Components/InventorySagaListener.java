package com.example.Messenger.Components;

import com.example.Messenger.Entity.*;
import com.example.Messenger.Record.Saga.OrderStockCommand;
import com.example.Messenger.Record.Saga.SagaOrderItem;
import com.example.Messenger.Record.Saga.SagaReplyEvent;
import com.example.Messenger.Repository.ProductRepository;
import com.example.Messenger.Repository.WarehouseStockRepository;
import com.example.Messenger.Service.Implement.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
public class InventorySagaListener {

    private final WarehouseStockRepository warehouseStockRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public InventorySagaListener(WarehouseStockRepository warehouseStockRepository,
                                 ProductRepository productRepository,
                                 InventoryService inventoryService,
                                 KafkaTemplate<String, Object> kafkaTemplate) {
        this.warehouseStockRepository = warehouseStockRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "inventory-commands", groupId = "inventory-saga-group")
    @Transactional
    public void handleReserveStock(OrderStockCommand command) {
        try {
            // 1. Tìm nhà kho tối ưu nhất có đủ hàng cho toàn bộ danh sách sản phẩm
            Warehouse bestWarehouse = selectBestWarehouseForSaga(command.items());

            // 2. Tiến hành trừ kho từng sản phẩm trong nhà kho được chọn
            for (SagaOrderItem item : command.items()) {
                Product product = productRepository.findById(item.productId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + item.productId()));

                // Tìm lượng tồn kho cụ thể của sản phẩm trong kho này
                WarehouseStock stock = warehouseStockRepository
                        .findByWarehouseAndProduct(bestWarehouse, product)
                        .orElseThrow(() -> new RuntimeException("Sản phẩm " + product.getName() + " không có sẵn trong kho chọn"));

                if (stock.getQuantity() < item.quantity()) {
                    throw new RuntimeException("Số lượng tồn kho không đủ cho sản phẩm: " + product.getName());
                }

                // Thực hiện trừ tồn kho vật lý
                stock.setQuantity(stock.getQuantity() - item.quantity());
                warehouseStockRepository.save(stock);

                // Ghi nhật ký biến động kho (giữ nguyên logic gốc của Châu)
                inventoryService.sell(item.productId(), item.quantity(), command.orderId(), bestWarehouse.getId());
            }

            // 3. Gửi phản hồi thành công về topic "saga-replies"
            SagaReplyEvent successReply = new SagaReplyEvent(
                    command.orderId(),
                    "STOCK_RESERVED",
                    "Đã giữ hàng thành công tại kho: " + bestWarehouse.getName()
            );
            kafkaTemplate.send("saga-replies", command.orderId(), successReply);

        } catch (Exception e) {
            // 4. Nếu có bất kỳ lỗi nào (hết hàng, lỗi DB...), gửi phản hồi thất bại về để hủy đơn
            SagaReplyEvent failureReply = new SagaReplyEvent(
                    command.orderId(),
                    "STOCK_RESERVATION_FAILED",
                    e.getMessage()
            );
            kafkaTemplate.send("saga-replies", command.orderId(), failureReply);
        }
    }

    // Thuật toán chọn kho hàng tối ưu nhất của Châu được chuyển đổi sang định dạng Saga
    private Warehouse selectBestWarehouseForSaga(List<SagaOrderItem> items) {
        Map<Warehouse, Integer> warehouseScore = new HashMap<>();

        for (SagaOrderItem item : items) {
            List<Warehouse> warehouses = warehouseStockRepository
                    .findWarehousesWithEnoughStock(item.productId(), item.quantity());

            if (warehouses.isEmpty()) {
                throw new RuntimeException("Không tìm thấy kho hàng nào có đủ số lượng cho sản phẩm: " + item.productId());
            }

            for (Warehouse w : warehouses) {
                warehouseScore.merge(w, 1, Integer::sum);
            }
        }

        return warehouseScore.entrySet()
                .stream()
                .max(
                        Comparator.comparing(Map.Entry<Warehouse, Integer>::getValue)
                                .thenComparing(e -> warehouseStockRepository.sumQuantityByWarehouse(e.getKey()))
                )
                .map(Map.Entry::getKey)
                .orElseThrow(() -> new RuntimeException("Không có kho hàng phù hợp"));
    }
}

