package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.dto.ProductDto;
import com.flora.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String category) {
        log.debug("상품 목록 조회: page={}, size={}, category={}", page, size, category);
        Page<ProductDto> products = productService.getProducts(page, size, category);
        return ResponseEntity.ok(
                ApiResponse.success("상품 목록 조회 성공", products)
        );
    }

    @GetMapping("/group-buy")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getGroupBuyProducts() {
        log.debug("단체구매 상품 목록 조회");
        List<ProductDto> products = productService.getGroupBuyProducts();
        return ResponseEntity.ok(
                ApiResponse.success("단체구매 상품 조회 성공", products)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        log.debug("상품 상세 조회: {}", id);
        ProductDto product = productService.getProduct(id);
        return ResponseEntity.ok(
                ApiResponse.success("상품 상세 조회 성공", product)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody ProductDto request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("상품 등록 요청: 사용자={}, 상품명={}", userId, request.getName());
        
        try {
            ProductDto result = productService.createProduct(request, userId);
            log.info("상품 등록 성공: 상품ID={}, 사용자={}", result.getId(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("상품이 등록되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("상품 등록 실패: 사용자={}, 상품명={}", userId, request.getName(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("상품 수정 요청: 상품ID={}, 사용자={}", id, userId);
        
        try {
            ProductDto result = productService.updateProduct(id, request, userId);
            log.info("상품 수정 성공: 상품ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("상품이 수정되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("상품 수정 실패: 상품ID={}, 사용자={}", id, userId, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("상품 삭제 요청: 상품ID={}, 사용자={}", id, userId);
        
        try {
            productService.deleteProduct(id, userId);
            log.info("상품 삭제 성공: 상품ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("상품이 삭제되었습니다.", null)
            );
        } catch (Exception e) {
            log.error("상품 삭제 실패: 상품ID={}, 사용자={}", id, userId, e);
            throw e;
        }
    }
}
