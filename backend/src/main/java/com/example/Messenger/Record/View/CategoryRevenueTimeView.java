package com.example.Messenger.Record.View;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface CategoryRevenueTimeView {
    LocalDate getDate();
    String getCategory();
    BigDecimal getRevenue();
    BigDecimal getCost();
    BigDecimal getMargin();
}
