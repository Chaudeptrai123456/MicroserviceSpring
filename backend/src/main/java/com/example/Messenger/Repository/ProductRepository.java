package com.example.Messenger.Repository;

import com.example.Messenger.Entity.Product;


import com.example.Messenger.Record.View.CategoryRevenueTimeView;
import com.example.Messenger.Record.View.OverviewTimeView;
import com.example.Messenger.Record.View.ProductRevenueTimeView;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> lockById(@Param("id") String id);
    // Tìm theo tên product
    List<Product> findByNameContainingIgnoreCase(String name);

    // Tìm theo category
    List<Product> findByCategoryName(String categoryName);

    // Tìm theo feature
    List<Product> findByFeaturesNameContainingIgnoreCase(String featureName);
    @Query("""
    SELECT DISTINCT p FROM Product p
    LEFT JOIN p.features f
    WHERE 
        (:categoryId IS NOT NULL AND p.category.id = :categoryId)
        OR (:minPrice IS NOT NULL AND p.price >= :minPrice)
        OR (:maxPrice IS NOT NULL AND p.price <= :maxPrice)
        OR (:featureName IS NOT NULL AND LOWER(f.name) LIKE LOWER(CONCAT('%', :featureName, '%')))
        OR (:featureValue IS NOT NULL AND LOWER(f.value) LIKE LOWER(CONCAT('%', :featureValue, '%')))
    """)
    Page<Product> searchProducts(
            String categoryId,
            Double minPrice,
            Double maxPrice,
            String featureName,
            String featureValue,
            Pageable pageable
    );
//    @Query(nativeQuery = true,value = """
//           SELECT
//               COALESCE(
//                    SUM(oi.quantity * (oi.sell_price - oi.cost_price))::NUMERIC,
//                    0::NUMERIC
//               ) AS revenue,
//               p.name AS name
//            FROM order_item oi
//            JOIN product p ON oi.product_id = p.id
//            GROUP BY p.name;
//
//           """)
//    List<RevenueProductsView> getRevenueOfProduct();
    @Query(
            nativeQuery = true,value= """
            SELECT
                DATE(o.created_at) AS date,
                c.name AS category,
            
                SUM(oi.quantity * oi.sell_price)::NUMERIC AS revenue,
                SUM(oi.quantity * oi.cost_price)::NUMERIC AS cost,
            
                SUM(oi.quantity * (oi.sell_price - oi.cost_price))
                / NULLIF(SUM(oi.quantity * oi.sell_price), 0)
                * 100 AS margin
            
            FROM category c
            JOIN product p ON p.category_id = c.id
            JOIN order_item oi ON oi.product_id = p.id
            JOIN orders o ON o.id = oi.order_id
            
            GROUP BY DATE(o.created_at), c.name
            ORDER BY date;
            
            """
    )
    List<CategoryRevenueTimeView> getCategoryInfoByTime();

    @Query(nativeQuery = true,value = """
            SELECT
                DATE(o.created_at) AS date,
            
                SUM(oi.quantity * oi.sell_price)::NUMERIC AS revenue,
                SUM(oi.quantity * oi.cost_price)::NUMERIC AS cost,
            
                SUM(oi.quantity * (oi.sell_price - oi.cost_price))::NUMERIC AS profit,
            
                SUM(oi.quantity * (oi.sell_price - oi.cost_price))
                / NULLIF(SUM(oi.quantity * oi.sell_price), 0)
                * 100 AS margin
            
            FROM order_item oi
            JOIN orders o ON o.id = oi.order_id
            
            GROUP BY DATE(o.created_at)
            ORDER BY date;
            
            """)
    List<OverviewTimeView> getInfoOfOrderByTime();

    @Query(
            nativeQuery = true,
            value = """
                    SELECT\s
                        DATE(o.created_at) AS date,
                        p.name AS name,
                        COALESCE(
                            SUM(oi.quantity * oi.sell_price)::NUMERIC,0
                        ) AS revenue,
                        COALESCE(
                            SUM(oi.quantity * oi.cost_price)::NUMERIC,0
                        ) AS cost,
                        COALESCE(
                            SUM(oi.quantity * (oi.sell_price - oi.cost_price))
                            / NULLIF(SUM(oi.quantity * oi.sell_price), 0) * 100,0
                        ) AS margin
                    FROM product p
                    JOIN order_item oi ON oi.product_id = p.id
                    JOIN orders o ON o.id = oi.order_id
                    WHERE DATE(o.created_at) BETWEEN :fromDate AND :toDate
                    GROUP BY DATE(o.created_at), p.name
                    ORDER BY date;
    """
    )
    List<ProductRevenueTimeView> getProductRevenueByDay(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

}
