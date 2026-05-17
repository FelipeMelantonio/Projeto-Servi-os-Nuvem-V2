package com.example.cloudcart.service;

import com.example.cloudcart.dto.CartItemRequestDTO;
import com.example.cloudcart.entity.CartItem;
import com.example.cloudcart.entity.Product;
import com.example.cloudcart.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    public List<CartItem> getCart(String sessionId) {
        return cartItemRepository.findBySessionId(sessionId);
    }

    @Transactional
    public CartItem addItem(String sessionId, CartItemRequestDTO dto) {
        Product product = productService.findById(dto.productId());

        if (product.getStockQuantity() < dto.quantity()) {
            throw new RuntimeException("Estoque insuficiente para: " + product.getName());
        }

        return cartItemRepository.findBySessionIdAndProductId(sessionId, dto.productId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + dto.quantity();
                    if (product.getStockQuantity() < newQty) {
                        throw new RuntimeException("Estoque insuficiente para: " + product.getName());
                    }
                    existing.setQuantity(newQty);
                    return cartItemRepository.save(existing);
                })
                .orElseGet(() -> {
                    CartItem item = CartItem.builder()
                            .sessionId(sessionId)
                            .product(product)
                            .quantity(dto.quantity())
                            .build();
                    return cartItemRepository.save(item);
                });
    }

    @Transactional
    public CartItem updateQuantity(String sessionId, Long productId, Integer quantity) {
        CartItem item = cartItemRepository.findBySessionIdAndProductId(sessionId, productId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado no carrinho"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Estoque insuficiente para: " + product.getName());
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(String sessionId, Long productId) {
        cartItemRepository.findBySessionIdAndProductId(sessionId, productId)
                .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }
}
