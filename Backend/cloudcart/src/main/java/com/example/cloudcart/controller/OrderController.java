package com.example.cloudcart.controller;

import com.example.cloudcart.entity.Order;
import com.example.cloudcart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{sessionId}")
    public List<Order> getOrders(@PathVariable String sessionId) {
        return orderService.getOrdersBySession(sessionId);
    }

    @GetMapping("/detail/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PostMapping("/{sessionId}/checkout")
    public ResponseEntity<Order> checkout(@PathVariable String sessionId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(sessionId));
    }
}
