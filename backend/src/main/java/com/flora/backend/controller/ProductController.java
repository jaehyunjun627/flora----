package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.ProductRequest;
import com.flora.backend.dto.ProductResponse;
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

    // 상품 목록 (카테고리 필터, 페이징)
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(productService.getProducts(page, size, category));
    }

    // 공동구매 목록
    @GetMapping("/group-buy")
    public ResponseEntity<List<ProductResponse>> getGroupBuyProducts() {
        return ResponseEntity.ok(productService.getGroupBuyProducts());
    }

    // 상품 상세
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    // 상품 등록 (로그인 필요)
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(productService.createProduct(request, userId));
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(productService.updateProduct(id, request, userId));
    }

    // 상품 삭제 (비활성화)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
}
