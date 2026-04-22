package com.flora.backend.config;

/**
 * 중복된 리소스 생성 시 발생하는 예외
 * 예: 중복된 이메일, 중복된 상품명, 등등
 */
public class DuplicateException extends RuntimeException {
    public DuplicateException(String message) {
        super(message);
    }

    public DuplicateException(String message, Throwable cause) {
        super(message, cause);
    }
}
