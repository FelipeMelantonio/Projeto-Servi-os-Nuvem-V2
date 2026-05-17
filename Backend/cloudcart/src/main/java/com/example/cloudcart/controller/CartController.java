package com.example.cloudcart.controller;

import com.example.cloudcart.dto.CartItemRequestDTO;
import com.example.cloudcart.dto.UpdateQuantityDTO;
import com.example.cloudcart.entity.CartItem;
import com.example.cloudcart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{sessionId}")
    public List<CartItem> getCart(@PathVariable String sessionId) {
        return cartService.getCart(sessionId);
    }

    @PostMapping("/{sessionId}/items")
    public ResponseEntity<CartItem> addItem(
            @PathVariable String sessionId,
            @Valid @RequestBody CartItemRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItem(sessionId, dto));
    }

    @PutMapping("/{sessionId}/items/{productId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable String sessionId,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateQuantityDTO dto) {
        CartItem updated = cartService.updateQuantity(sessionId, productId, dto.quantity());
        if (updated == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{sessionId}/items/{productId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable String sessionId,
            @PathVariable Long productId) {
        cartService.removeItem(sessionId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearCart(@PathVariable String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }
}
