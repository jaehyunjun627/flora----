package com.flora.backend.service;

import com.flora.backend.dto.OrderDto;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public List<OrderDto> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderedAtDesc(userId)
                .stream().map(OrderDto::from).collect(Collectors.toList());
    }

    public OrderDto getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문만 조회할 수 있습니다");
        }
        return OrderDto.from(order);
    }

    // 장바구니 첫번째 상품으로 주문 생성 (단일 상품 주문)
    @Transactional
    public OrderDto createOrderFromCart(OrderDto req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByAddedAtDesc(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어있습니다");
        }

        // 장바구니 전체 총액 계산
        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 재고 검증
        for (CartItem item : cartItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(item.getProduct().getName() + " 재고가 부족합니다");
            }
        }

        CartItem firstItem = cartItems.get(0);
        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .totalPrice(totalPrice)
                .status("PENDING")
                .deliveryAddress(req.getDeliveryAddress())
                .recipientName(req.getRecipientName())
                .recipientPhone(req.getRecipientPhone())
                .product(firstItem.getProduct())
                .quantity(firstItem.getQuantity())
                .unitPrice(firstItem.getProduct().getPrice())
                .build();

        // 전체 장바구니 아이템을 OrderItem으로 저장
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            orderItems.add(OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getProduct().getPrice())
                    .build());
        }
        order.getItems().addAll(orderItems);

        Order savedOrder = orderRepository.save(order);

        // 판매자별 알림 발송
        cartItems.stream()
                .filter(item -> item.getProduct().getSeller() != null)
                .collect(Collectors.groupingBy(item -> item.getProduct().getSeller().getId()))
                .forEach((sellerId, sellerItems) -> {
                    User seller = sellerItems.get(0).getProduct().getSeller();
                    String productNames = sellerItems.stream()
                            .map(i -> i.getProduct().getName())
                            .collect(Collectors.joining(", "));
                    notificationService.create(
                            seller,
                            "NEW_ORDER",
                            user.getNickname() + "님이 '" + productNames + "' 상품을 주문했습니다",
                            savedOrder.getId(),
                            "ORDER"
                    );
                });

        // 재고 차감
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // 장바구니 비우기
        cartItemRepository.deleteByUserId(userId);

        return OrderDto.from(savedOrder);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문만 취소할 수 있습니다");
        }
        if (!order.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("처리 중인 주문은 취소할 수 없습니다");
        }

        order.setStatus("CANCELLED");

        // 전체 OrderItem 재고 복구
        if (!order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        } else if (order.getProduct() != null) {
            // 구버전 단일 상품 주문 호환
            Product product = order.getProduct();
            product.setStockQuantity(product.getStockQuantity() + order.getQuantity());
            productRepository.save(product);
        }

        return OrderDto.from(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "ORD" + timestamp + random;
    }
}
