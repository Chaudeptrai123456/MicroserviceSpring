package com.example.Messenger.Record.View;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface OverviewTimeView {
    LocalDate getDate();
    BigDecimal getRevenue();
    BigDecimal getCost();
    BigDecimal getProfit();
    BigDecimal getMargin();
}
