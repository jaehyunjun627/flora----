package com.flora.backend.config;

/**
 * 비즈니스 로직 실패 시 발생하는 예외
 * 예: 재고 부족, 이미 주문됨, 등등
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
