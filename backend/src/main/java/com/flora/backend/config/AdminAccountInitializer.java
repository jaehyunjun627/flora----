package com.flora.backend.config;

import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@flora.com";

        if (userRepository.existsByEmail(adminEmail)) {
            // 이미 존재하면 role만 ADMIN으로 보장
            userRepository.findByEmail(adminEmail).ifPresent(u -> {
                if (!"ADMIN".equals(u.getRole())) {
                    u.setRole("ADMIN");
                    userRepository.save(u);
                    log.info("기존 계정을 ADMIN으로 업그레이드: {}", adminEmail);
                } else {
                    log.info("관리자 계정 이미 존재: {}", adminEmail);
                }
            });
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode("admin1234"))
                .nickname("꽃담관리자")
                .role("ADMIN")
                .isActive(true)
                .points(0)
                .streakDays(0)
                .profileEmoji("🛡️")
                .termsAgreed(true)
                .build();

        userRepository.save(admin);
        log.info("✅ 관리자 계정 자동 생성 완료 → email: {} / pw: admin1234", adminEmail);
    }
}
