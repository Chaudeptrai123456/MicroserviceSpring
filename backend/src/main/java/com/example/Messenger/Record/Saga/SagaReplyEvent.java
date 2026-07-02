package com.example.Messenger.Record.Saga;

import java.io.Serializable;

public record SagaReplyEvent(
        String orderId,
        String status, // "STOCK_RESERVED" hoặc "STOCK_RESERVATION_FAILED"
        String message
) implements Serializable {}