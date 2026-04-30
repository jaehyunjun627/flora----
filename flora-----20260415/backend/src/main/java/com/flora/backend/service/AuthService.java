package com.flora.backend.service;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.UserDto;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserDto signup(UserDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다");
        }

        String role = "USER";
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("SELLER")) {
            role = "SELLER";
        }

        // 약관 동의 필수 체크 (이용약관, 개인정보)
        if (!Boolean.TRUE.equals(request.getTermsAgreed()) || !Boolean.TRUE.equals(request.getPrivacyAgreed())) {
            throw new IllegalArgumentException("필수 약관(이용약관/개인정보)에 동의해 주세요");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean marketing = Boolean.TRUE.equals(request.getMarketingAgreed());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .phone(request.getPhone())
                .role(role)
                .sellerStatus(role.equals("SELLER") ? "APPROVED" : null)
                .businessName(role.equals("SELLER") ? request.getBusinessName() : null)
                .businessNumber(role.equals("SELLER") ? request.getBusinessNumber() : null)
                .isActive(true)
                .points(0)
                .streakDays(0)
                .termsAgreed(true)
                .termsAgreedAt(now)
                .privacyAgreed(true)
                .privacyAgreedAt(now)
                .marketingAgreed(marketing)
                .marketingAgreedAt(marketing ? now : null)
                .agreedTerms(request.getAgreedTerms())
                .build();

        user = userRepository.save(user);
        String token = jwtTokenProvider.createToken(user.getId(), user.getEmail(), user.getRole());

        UserDto response = UserDto.from(user);
        response.setToken(token);
        return response;
    }

    public UserDto login(UserDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
        }
        if (!user.getIsActive()) {
            throw new IllegalArgumentException("비활성화된 계정입니다");
        }

        String token = jwtTokenProvider.createToken(user.getId(), user.getEmail(), user.getRole());

        UserDto response = UserDto.from(user);
        response.setToken(token);
        return response;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
