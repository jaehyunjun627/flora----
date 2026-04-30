package com.flora.backend.service;

import com.flora.backend.dto.OrderDto;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
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

        // 재고 검증 및 차감
        for (CartItem item : cartItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(item.getProduct().getName() + " 재고가 부족합니다");
            }
        }

        // 첫번째 상품 기준으로 주문 생성 (통합 구조)
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

        Order savedOrder = orderRepository.save(order);

        // 판매자에게 새 주문 알림
        if (firstItem.getProduct().getSeller() != null) {
            notificationService.create(
                firstItem.getProduct().getSeller(),
                "NEW_ORDER",
                user.getNickname() + "님이 '" + firstItem.getProduct().getName() + "' 상품을 주문했습니다",
                savedOrder.getId(),
                "ORDER"
            );
        }

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

    /**
     * 예약 발송 주문 생성 (단일 구매 / 구독 첫 회차).
     * 장바구니 의존 없이 클라이언트가 보낸 정보로 직접 주문을 생성합니다.
     * 주문 내역(/api/orders) 에서 정상 조회됩니다.
     */
    @Transactional
    public OrderDto createScheduledOrder(Map<String, Object> req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        String productName       = (String) req.get("productName");
        String deliveryAddress   = (String) req.get("deliveryAddress");
        String recipientName     = (String) req.get("recipientName");
        String recipientPhone    = (String) req.get("recipientPhone");
        String deliveryMemo      = (String) req.get("deliveryMemo");
        String paymentMethod     = (String) req.get("paymentMethod");
        Object totalPriceObj     = req.get("totalPrice");
        Object qtyObj            = req.get("quantity");
        String scheduledDateStr  = (String) req.get("scheduledDeliveryDate");

        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException("상품명이 필요합니다");
        }
        if (deliveryAddress == null || deliveryAddress.isBlank()) {
            throw new IllegalArgumentException("배송지를 입력해주세요");
        }
        if (recipientName == null || recipientName.isBlank()) {
            throw new IllegalArgumentException("수령인을 입력해주세요");
        }
        if (recipientPhone == null || recipientPhone.isBlank()) {
            throw new IllegalArgumentException("연락처를 입력해주세요");
        }

        BigDecimal totalPrice = totalPriceObj == null
                ? BigDecimal.ZERO
                : new BigDecimal(totalPriceObj.toString());
        Integer quantity = qtyObj == null ? 1 : Integer.valueOf(qtyObj.toString());

        LocalDate scheduledDate = null;
        if (scheduledDateStr != null && !scheduledDateStr.isBlank()) {
            try { scheduledDate = LocalDate.parse(scheduledDateStr); }
            catch (Exception e) {
                throw new IllegalArgumentException("배송 희망일 형식이 올바르지 않습니다");
            }
        }

        Order order = Order.builder()
                .user(user)
                .orderNumber(generateOrderNumber())
                .totalPrice(totalPrice)
                .status("PENDING")
                .deliveryAddress(deliveryAddress)
                .recipientName(recipientName)
                .recipientPhone(recipientPhone)
                .deliveryMemo(deliveryMemo)
                .quantity(quantity)
                .unitPrice(quantity > 0 ? totalPrice.divide(BigDecimal.valueOf(quantity), java.math.RoundingMode.HALF_UP) : totalPrice)
                .paymentMethod(paymentMethod)
                .paymentStatus("PAID")
                .paidAt(LocalDateTime.now())
                .scheduledDeliveryDate(scheduledDate)
                .manualProductName(productName)
                .build();
        Order saved = orderRepository.save(order);
        return OrderDto.from(saved);
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

        // 재고 복구
        if (order.getProduct() != null) {
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
