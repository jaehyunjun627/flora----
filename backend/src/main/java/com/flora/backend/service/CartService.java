package com.flora.backend.service;

import com.flora.backend.dto.CartItemDto;
import com.flora.backend.entity.CartItem;
import com.flora.backend.entity.Product;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.CartItemRepository;
import com.flora.backend.repository.jpa.ProductRepository;
import com.flora.backend.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItemDto> getCartItems(Long userId) {
        return cartItemRepository.findByUserIdOrderByAddedAtDesc(userId)
                .stream().map(CartItemDto::from).collect(Collectors.toList());
    }

    @Transactional
    public CartItemDto addToCart(CartItemDto req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        if (!product.getIsActive()) {
            throw new IllegalArgumentException("판매 중인 상품이 아닙니다");
        }
        if (product.getStockQuantity() < req.getQuantity()) {
            throw new IllegalArgumentException("재고가 부족합니다");
        }

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, req.getProductId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + req.getQuantity());
            return CartItemDto.from(cartItemRepository.save(item));
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(req.getQuantity())
                .build();

        return CartItemDto.from(cartItemRepository.save(cartItem));
    }

    @Transactional
    public CartItemDto updateQuantity(Long cartItemId, Integer quantity, Long userId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다"));

        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 장바구니만 수정할 수 있습니다");
        }
        if (item.getProduct().getStockQuantity() < quantity) {
            throw new IllegalArgumentException("재고가 부족합니다");
        }

        item.setQuantity(quantity);
        return CartItemDto.from(cartItemRepository.save(item));
    }

    @Transactional
    public void removeItem(Long cartItemId, Long userId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다"));

        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 장바구니만 삭제할 수 있습니다");
        }
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
