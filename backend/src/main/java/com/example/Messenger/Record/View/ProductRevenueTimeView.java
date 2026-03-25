package com.example.Messenger.Record.View;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ProductRevenueTimeView {

    LocalDate getDate();     // DATE(o.created_at) AS date

    String getName();        // p.name AS name

    BigDecimal getRevenue(); // AS revenue

    BigDecimal getCost();    // AS cost

    BigDecimal getMargin();  // AS margin (%)
}
