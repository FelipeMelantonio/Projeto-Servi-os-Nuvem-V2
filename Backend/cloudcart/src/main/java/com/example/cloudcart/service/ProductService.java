package com.example.cloudcart.service;

import com.example.cloudcart.dto.ProductRequestDTO;
import com.example.cloudcart.entity.Product;
import com.example.cloudcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + id));
    }

    public Product create(ProductRequestDTO dto) {
        Product product = Product.builder()
                .name(dto.name())
                .description(dto.description())
                .category(dto.category())
                .imageUrl(dto.imageUrl())
                .price(dto.price())
                .stockQuantity(dto.stockQuantity())
                .build();
        return productRepository.save(product);
    }

    public Product update(Long id, ProductRequestDTO dto) {
        Product product = findById(id);
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setCategory(dto.category());
        product.setImageUrl(dto.imageUrl());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
