package com.flora.backend.service;

import com.flora.backend.dto.OrderRequest;
import com.flora.backend.dto.OrderResponse;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 내 주문 목록
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderedAtDesc(userId)
                .stream().map(OrderResponse::from).collect(Collectors.toList());
    }

    // 주문 상세
    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문만 조회할 수 있습니다");
        }
        return OrderResponse.from(order);
    }

    // 장바구니 → 주문 생성
    @Transactional
    public OrderResponse createOrderFromCart(OrderRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByAddedAtDesc(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어있습니다");
        }

        // 재고 검증
        for (CartItem item : cartItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(
                        item.getProduct().getName() + " 재고가 부족합니다");
            }
        }

        // 총 금액 계산
        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 주문 생성
        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .totalPrice(totalPrice)
                .status("PENDING")
                .deliveryAddress(req.getDeliveryAddress())
                .recipientName(req.getRecipientName())
                .recipientPhone(req.getRecipientPhone())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 주문 아이템 생성 + 재고 차감
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            orderItemRepository.save(orderItem);

            // 재고 차감
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // 장바구니 비우기
        cartItemRepository.deleteByUserId(userId);

        // 저장된 주문 다시 조회 (orderItems 로딩)
        Order fullOrder = orderRepository.findById(savedOrder.getId()).get();
        return OrderResponse.from(fullOrder);
    }

    // 주문 취소
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문만 취소할 수 있습니다");
        }
        if (!order.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("처리 중인 주문은 취소할 수 없습니다");
        }

        order.setStatus("CANCELLED");

        // 재고 복구
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        return OrderResponse.from(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "ORD" + timestamp + random;
    }
}
