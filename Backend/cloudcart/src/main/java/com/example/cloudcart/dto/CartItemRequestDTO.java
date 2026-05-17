package com.example.cloudcart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequestDTO(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
) {}
