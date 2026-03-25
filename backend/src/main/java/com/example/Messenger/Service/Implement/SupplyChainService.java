package com.example.Messenger.Service.Implement;

import com.example.Messenger.Entity.Product;
import com.example.Messenger.Entity.StockImport;
import com.example.Messenger.Entity.Warehouse;
import com.example.Messenger.Entity.WarehouseStock;
import com.example.Messenger.Record.Type.InventoryType;
import com.example.Messenger.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional()
public class SupplyChainService {

    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final StockImportRepository stockImportRepository;
    private final InventoryService inventoryService;
    private final InventoryLogRepository inventoryLogRepository;
    @Autowired
    public SupplyChainService(WarehouseRepository warehouseRepository, ProductRepository productRepository, WarehouseStockRepository warehouseStockRepository, StockImportRepository stockImportRepository, InventoryService inventoryService, InventoryLogRepository inventoryLogRepository) {
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.warehouseStockRepository = warehouseStockRepository;
        this.stockImportRepository = stockImportRepository;
        this.inventoryService = inventoryService;
        this.inventoryLogRepository = inventoryLogRepository;
    }
    @Transactional
    public void importStock(
            String warehouseId,
            String productId,
            Integer quantity,
            BigDecimal importPrice,
            String supplier,
            String note
    ) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Product product = productRepository.lockById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        StockImport stockImport = new StockImport();
        stockImport.setWarehouse(warehouse);
        stockImport.setProduct(product);
        stockImport.setQuantity(quantity);
        stockImport.setImportPrice(importPrice.doubleValue());
        stockImport.setSupplier(supplier);
        stockImport.setNote(note);

        stockImportRepository.save(stockImport);

        WarehouseStock stock = warehouseStockRepository
                .findByWarehouseAndProductForUpdate(warehouse.getId(), product.getId())
                .orElseGet(() -> {
                    WarehouseStock ws = new WarehouseStock();
                    ws.setWarehouse(warehouse);
                    ws.setProduct(product);
                    ws.setQuantity(0);
                    return ws;
                });

        int oldStock = stock.getQuantity();
        int newStock = oldStock + quantity;

        stock.setQuantity(newStock);
        warehouseStockRepository.save(stock);

        BigDecimal oldAvgCost = product.getAvgCost() == null
                ? BigDecimal.ZERO
                : product.getAvgCost();

        BigDecimal totalCost = oldAvgCost.multiply(BigDecimal.valueOf(oldStock))
                        .add(importPrice.multiply(BigDecimal.valueOf(quantity)));

        BigDecimal newAvgCost =totalCost.divide(BigDecimal.valueOf(newStock), 2, java.math.RoundingMode.HALF_UP);

        product.setAvgCost(newAvgCost);

        inventoryService.importStock(
                productId,
                quantity,
                importPrice.doubleValue(),
                supplier,
                note,
                "IMPORT_" + stockImport.getId()
        );
    }
    public Map<String, Integer> stockByWarehouse(String productId) {

        List<Object[]> rows = inventoryLogRepository.sumByWarehouse(productId);

        return rows.stream()
                .collect(Collectors.toMap(
                        r -> (String) r[0],   // warehouseId
                        r -> ((Number) r[1]).intValue()
                ));
    }
}