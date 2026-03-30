package com.example.Messenger.Service.Implement;

import com.example.Messenger.Entity.InventoryLog;
import com.example.Messenger.Entity.Product;
import com.example.Messenger.Entity.StockImport;
import com.example.Messenger.Record.Type.InventoryType;
import com.example.Messenger.Repository.InventoryLogRepository;
import com.example.Messenger.Repository.ProductRepository;
import com.example.Messenger.Repository.StockImportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.example.Messenger.Record.Type.InventoryType.IMPORT;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final ProductRepository productRepository;
    private final InventoryLogRepository logRepository;
    private final StockImportRepository stockImportRepository;
    public InventoryService(ProductRepository productRepository, InventoryLogRepository logRepository, StockImportRepository stockImportRepository) {
        this.productRepository = productRepository;
        this.logRepository = logRepository;
        this.stockImportRepository = stockImportRepository;
    }
    @Transactional
    public void importStock(
            String productId,
            int quantity,
            double importPrice,
            String supplier,
            String note,
            String refId
    ) {
        Product product = productRepository
                .lockById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        boolean exists = logRepository
                .existsByProductIdAndRefIdAndType(
                        productId,
                        refId,
                        IMPORT
                );
        if (exists) {
            // đã import rồi → bỏ qua
            return;
        }
        StockImport stockImport = new StockImport();
        stockImport.setProduct(product);
        stockImport.setQuantity(quantity);
        stockImport.setImportPrice(importPrice);
        stockImport.setSupplier(supplier);
        stockImport.setNote(note);

        stockImportRepository.save(stockImport);

        int beforeQty = product.getQuantity();
        int afterQty = beforeQty + quantity;

        product.setQuantity(afterQty);
        productRepository.save(product);

        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setType(IMPORT);
        log.setQuantity(quantity);
        log.setUnitPrice(importPrice);
        log.setRefId(refId);
        logRepository.save(log);
    }
    @Transactional
    public void importFromStockImport(Long stockImportId) {
        StockImport stockImport = stockImportRepository
                .findById(stockImportId)
                .orElseThrow(() -> new RuntimeException("StockImport not found"));

        Product product = productRepository
                .lockById(stockImport.getProduct().getId())
                .orElseThrow();

        // chống nhập trùng
        boolean existed = logRepository.existsByProductAndRefIdAndType(
                product,
                stockImportId.toString(),
                IMPORT
        );

        if (existed) return;

        // 1️⃣ tăng kho
        product.setQuantity(
                product.getQuantity() + stockImport.getQuantity()
        );

        // 2️⃣ ghi inventory log
        logRepository.save(new InventoryLog(
                product,
                IMPORT,
                stockImport.getQuantity(),
                stockImport.getImportPrice(),
                stockImportId.toString()
        ));
    }
    @Transactional
    public void importStock(String productId,
                            int quantity,
                            double importPrice,
                            String importRef) {

        Product product = productRepository
                .lockById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setQuantity(product.getQuantity() + quantity);

        logRepository.save(new InventoryLog(
                product,
                IMPORT,
                quantity,
                importPrice,
                importRef
        ));
    }

    @Transactional
    public void sell(String productId,
                     int quantity,
                     String orderId, String warehouseId) {

        Product product = productRepository
                .lockById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < quantity) {
            throw new RuntimeException("OUT OF STOCK");
        }

        // chống double submit
        if (logRepository.existsByProductAndRefIdAndType(
                product, orderId, InventoryType.SALE)) {
            return;
        }

        product.setQuantity(product.getQuantity() - quantity);

        logRepository.save(new InventoryLog(
                product,
                InventoryType.SALE,
                -quantity,
                product.getPrice().doubleValue(),
                "OrderId " + orderId + " warehouseID: " + warehouseId
        ));
    }

    /**
     * =========================
     * HUỶ ĐƠN → HOÀN KHO
     * =========================
     */
    @Transactional
    public void cancelOrder(String orderId) {

        List<InventoryLog> saleLogs =
                logRepository.findByRefId(orderId);

        for (InventoryLog log : saleLogs) {
            if (log.getType() != InventoryType.SALE) continue;

            Product product = productRepository
                    .lockById(log.getProduct().getId())
                    .orElseThrow();

            product.setQuantity(
                    product.getQuantity() - log.getQuantity()
            );

            logRepository.save(new InventoryLog(
                    product,
                    InventoryType.CANCEL,
                    -log.getQuantity(),
                    log.getUnitPrice(),
                    orderId
            ));
        }
    }


    @Transactional
    public void adjustStock(String productId,
                            int newQuantity,
                            String reason) {

        Product product = productRepository
                .lockById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + productId)
                );

        if (newQuantity < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        int diff = newQuantity - product.getQuantity();

        product.setQuantity(newQuantity);

        InventoryLog log = new InventoryLog(
                product,
                InventoryType.ADJUST,
                diff,
                product.getPrice().doubleValue(),
                reason
        );

        logRepository.save(log);
    }
}