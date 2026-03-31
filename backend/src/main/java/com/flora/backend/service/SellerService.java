package com.flora.backend.service;

import com.flora.backend.dto.OrderDto;
import com.flora.backend.dto.ProductDto;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ===== 대시보드 통계 =====
    public Map<String, Object> getDashboardStats(Long sellerId) {
        validateSeller(sellerId);
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalProducts", productRepository.countBySellerId(sellerId));
        stats.put("totalOrders", orderRepository.countByProductSellerId(sellerId));
        stats.put("pendingOrders", orderRepository.countByProductSellerIdAndStatus(sellerId, "PENDING"));
        stats.put("preparingOrders", orderRepository.countByProductSellerIdAndStatus(sellerId, "PREPARING"));
        stats.put("shippingOrders", orderRepository.countByProductSellerIdAndStatus(sellerId, "SHIPPING"));
        stats.put("deliveredOrders", orderRepository.countByProductSellerIdAndStatus(sellerId, "DELIVERED"));

        // 총 매출
        List<Order> allOrders = orderRepository.findByProductSellerIdOrderByOrderedAtDesc(sellerId);
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .map(Order::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }

    // ===== 주문 관리 =====
    public List<OrderDto> getSellerOrders(Long sellerId, String status) {
        validateSeller(sellerId);
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByProductSellerIdAndStatusOrderByOrderedAtDesc(sellerId, status);
        } else {
            orders = orderRepository.findByProductSellerIdOrderByOrderedAtDesc(sellerId);
        }
        return orders.stream().map(OrderDto::from).collect(Collectors.toList());
    }

    public OrderDto getSellerOrder(Long orderId, Long sellerId) {
        validateSeller(sellerId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        if (order.getProduct() == null || !order.getProduct().getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("본인 상품의 주문만 조회할 수 있습니다");
        }
        return OrderDto.from(order);
    }

    // 주문 확인 (PENDING → PREPARING)
    @Transactional
    public OrderDto confirmOrder(Long orderId, Long sellerId) {
        Order order = getOrderForSeller(orderId, sellerId);
        if (!order.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("신규 주문만 확인 처리할 수 있습니다 (현재: " + order.getStatus() + ")");
        }
        order.setStatus("PREPARING");
        order.setPaymentStatus("PAID");
        order.setPaidAt(LocalDateTime.now());
        return OrderDto.from(orderRepository.save(order));
    }

    // 배송 시작 (PREPARING → SHIPPING)
    @Transactional
    public OrderDto shipOrder(Long orderId, Long sellerId, String courierName, String trackingNumber) {
        Order order = getOrderForSeller(orderId, sellerId);
        if (!order.getStatus().equals("PREPARING")) {
            throw new IllegalArgumentException("배송준비 상태의 주문만 발송 처리할 수 있습니다 (현재: " + order.getStatus() + ")");
        }
        if (courierName == null || courierName.isBlank()) {
            throw new IllegalArgumentException("택배사를 선택해주세요");
        }
        if (trackingNumber == null || trackingNumber.isBlank()) {
            throw new IllegalArgumentException("송장번호를 입력해주세요");
        }
        order.setStatus("SHIPPING");
        order.setCourierName(courierName);
        order.setTrackingNumber(trackingNumber);
        order.setShippedAt(LocalDateTime.now());
        return OrderDto.from(orderRepository.save(order));
    }

    // 배송 완료 (SHIPPING → DELIVERED)
    @Transactional
    public OrderDto deliverOrder(Long orderId, Long sellerId) {
        Order order = getOrderForSeller(orderId, sellerId);
        if (!order.getStatus().equals("SHIPPING")) {
            throw new IllegalArgumentException("배송중 상태의 주문만 배송완료 처리할 수 있습니다 (현재: " + order.getStatus() + ")");
        }
        order.setStatus("DELIVERED");
        order.setDeliveredAt(LocalDateTime.now());
        return OrderDto.from(orderRepository.save(order));
    }

    // ===== 상품 관리 =====
    public List<ProductDto> getSellerProducts(Long sellerId) {
        validateSeller(sellerId);
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream().map(ProductDto::from).collect(Collectors.toList());
    }

    @Transactional
    public ProductDto updateProduct(Long productId, ProductDto req, Long sellerId) {
        Product product = getProductForSeller(productId, sellerId);
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());
        product.setPrice(req.getPrice());
        product.setOriginalPrice(req.getOriginalPrice());
        product.setStockQuantity(req.getStockQuantity());
        product.setCategory(req.getCategory());
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        Product product = getProductForSeller(productId, sellerId);
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductDto toggleProductActive(Long productId, Long sellerId) {
        Product product = getProductForSeller(productId, sellerId);
        product.setIsActive(!product.getIsActive());
        return ProductDto.from(productRepository.save(product));
    }

    // ===== 헬퍼 =====
    private void validateSeller(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        if (!"SELLER".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("판매자 권한이 필요합니다");
        }
    }

    private Order getOrderForSeller(Long orderId, Long sellerId) {
        validateSeller(sellerId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        if (order.getProduct() == null || order.getProduct().getSeller() == null
                || !order.getProduct().getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("본인 상품의 주문만 관리할 수 있습니다");
        }
        return order;
    }

    private Product getProductForSeller(Long productId, Long sellerId) {
        validateSeller(sellerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("본인 상품만 관리할 수 있습니다");
        }
        return product;
    }
}
