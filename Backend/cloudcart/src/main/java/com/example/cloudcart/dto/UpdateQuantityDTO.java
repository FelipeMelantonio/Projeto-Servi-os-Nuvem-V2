package com.example.cloudcart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateQuantityDTO(
        @NotNull @Min(0) Integer quantity
) {}
