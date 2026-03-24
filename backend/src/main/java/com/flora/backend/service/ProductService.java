package com.flora.backend.service;

import com.flora.backend.dto.ProductRequest;
import com.flora.backend.dto.ProductResponse;
import com.flora.backend.entity.Product;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.ProductRepository;
import com.flora.backend.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 전체 상품 목록 (페이징)
    public Page<ProductResponse> getProducts(int page, int size, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products;
        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndIsActiveTrue(category, pageable);
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
        }
        return products.map(ProductResponse::from);
    }

    // 상품 상세
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + id));
        return ProductResponse.from(product);
    }

    // 공동구매 목록
    public List<ProductResponse> getGroupBuyProducts() {
        return productRepository.findByIsGroupBuyTrueAndIsActiveTrue()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    // 상품 등록 (판매자)
    @Transactional
    public ProductResponse createProduct(ProductRequest req, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Product product = Product.builder()
                .seller(seller)
                .name(req.getName())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .price(req.getPrice())
                .originalPrice(req.getOriginalPrice())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .category(req.getCategory())
                .productType(req.getProductType())
                .plantId(req.getPlantId())
                .isGroupBuy(req.getIsGroupBuy() != null ? req.getIsGroupBuy() : false)
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    // 상품 수정
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest req, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + id));

        if (!product.getSeller().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 상품만 수정할 수 있습니다");
        }

        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());
        product.setPrice(req.getPrice());
        product.setOriginalPrice(req.getOriginalPrice());
        product.setStockQuantity(req.getStockQuantity());
        product.setCategory(req.getCategory());

        return ProductResponse.from(productRepository.save(product));
    }

    // 상품 삭제 (비활성화)
    @Transactional
    public void deleteProduct(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + id));

        if (!product.getSeller().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 상품만 삭제할 수 있습니다");
        }
        product.setIsActive(false);
        productRepository.save(product);
    }
}
