package com.example.Messenger.Record.Request;

import java.util.List;

public record ProductRequest(
        String name,
        String description,
        double price,
        double avgCost,
        int quantity,
        String categoryId,
        List<String> images,
        List<FeatureRequest> features,
        List<String> imagesBase64
) {}