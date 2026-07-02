package com.example.Messenger.Record.Saga;

import java.io.Serializable;
import java.math.BigDecimal;

public record SagaOrderItem(
        String productId,
        int quantity,
        BigDecimal sellPrice
) implements Serializable {}