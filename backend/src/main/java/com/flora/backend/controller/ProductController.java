package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.ProductDto;
import com.flora.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<Page<ProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(productService.getProducts(page, size, category));
    }

    @GetMapping("/group-buy")
    public ResponseEntity<List<ProductDto>> getGroupBuyProducts() {
        return ResponseEntity.ok(productService.getGroupBuyProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestBody ProductDto request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(productService.createProduct(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(productService.updateProduct(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
}
