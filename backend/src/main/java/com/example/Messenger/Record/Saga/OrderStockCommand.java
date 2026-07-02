package com.example.Messenger.Record.Saga;

import java.io.Serializable;
import java.util.List;

public record OrderStockCommand(
        String orderId,
        List<SagaOrderItem> items
) implements Serializable {}