package com.example.Messenger.Entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Entity
@Data
@Table(
        name = "product",
        indexes = {
                @Index(name = "idx_product_price", columnList = "price"),
                @Index(name = "idx_product_category", columnList = "category_id")
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Product {
    @Id
    private String id;

    private LocalDate createdAt;

    private LocalDate updateAt;

    private String name;

    @Column(length = 2000)
    private String description;

    private Integer quantity;

    @Column(precision = 19, scale = 2)
    private BigDecimal price;

    @Column(precision = 19, scale = 2)
    private BigDecimal avgCost;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> images = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("products")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Feature> features = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Discount> discounts = new HashSet<>();
    public  Product(){}
    public Product(String id, LocalDate createdAt, String name, String description, BigDecimal price) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.description = description;
        this.price = price;
    }
    public BigDecimal getCurrentDiscountPercentage() {

        LocalDate today = LocalDate.now();

        return discounts.stream()
                .filter(d -> d.getStartDate() != null && d.getEndDate() != null)
                .filter(d -> !today.isBefore(d.getStartDate()) && !today.isAfter(d.getEndDate()))
                .map(d -> d.getPercentage())
                .max(BigDecimal::compareTo)   // nếu có nhiều discount → lấy lớn nhất
                .orElse(BigDecimal.ZERO);
    }

    public BigDecimal getCurrentPrice() {

        BigDecimal basePrice = price == null ? BigDecimal.ZERO : price;

        BigDecimal discount = Optional.ofNullable(getCurrentDiscountPercentage())
                .orElse(BigDecimal.ZERO);
        return basePrice.multiply(BigDecimal.ONE.subtract(discount));
    }
    public void addDiscount(Discount discount) {
        discounts.add(discount);
        discount.setProduct(this);
    }

    public void removeDiscount(Discount discount) {
        discounts.remove(discount);
        discount.setProduct(null);
    }

    // Getters / Setters
    public Set<Discount> getDiscounts() {
        return discounts;
    }

    public void setDiscounts(Set<Discount> discounts) {
        this.discounts = discounts;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    public Set<Image> getImages() {
        return images;
    }

    public void setImages(Set<Image> images) {
        this.images = images;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Set<Feature> getFeatures() {
        return features;
    }

    public void setFeatures(Set<Feature> features) {
        this.features = features;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getUpdateAt() {
        return updateAt;
    }

    public void setUpdateAt(LocalDate updateAt) {
        this.updateAt = updateAt;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getAvgCost() {
        return avgCost;
    }

    public void setAvgCost(BigDecimal avgCost) {
        this.avgCost = avgCost;
    }
}
