package com.flora.backend.config;

import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FestivalRepository festivalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        ensureSeller("seller1@flora.com", "초록마켓", "🌿");
        ensureSeller("seller2@flora.com", "꽃길농원", "🌸");
        ensureProducts();
        ensureFestivals();
    }

    @Transactional
    public void ensureSeller(String email, String nickname, String emoji) {
        if (userRepository.findByEmail(email).isPresent()) return;
        try {
            userRepository.save(User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("password123"))
                    .nickname(nickname).role("SELLER")
                    .isActive(true).points(100).streakDays(5).profileEmoji(emoji).build());
            log.info("셀러 계정 생성: {}", email);
        } catch (Exception e) {
            log.warn("셀러 계정 생성 스킵 (이미 존재): {}", email);
        }
    }

    @Transactional
    public void ensureProducts() {
        if (productRepository.count() > 0) return;

        // DB에 있는 셀러 중 아무나 사용
        List<User> sellers = userRepository.findAll().stream()
                .filter(u -> "SELLER".equals(u.getRole()) || "ADMIN".equals(u.getRole()))
                .toList();

        if (sellers.isEmpty()) {
            log.warn("셀러 계정이 없어 상품 더미 데이터를 건너뜁니다.");
            return;
        }

        User s1 = sellers.get(0);
        User s2 = sellers.size() > 1 ? sellers.get(1) : sellers.get(0);

        log.info("상품 더미 데이터 삽입 중...");
        saveProduct(s1, "몬스테라 델리시오사", "열대 분위기의 대형 잎이 특징인 인기 관엽식물입니다.", 28000, 35000, 30, "식물", 4.5, 24);
        saveProduct(s1, "산세베리아 (스투키)", "공기 정화 식물의 대명사. 초보자에게 추천합니다.", 15000, 18000, 50, "식물", 4.7, 38);
        saveProduct(s1, "스투키 미니 화분세트", "귀여운 미니 사이즈 스투키 3개 세트.", 22000, 27000, 20, "식물", 4.3, 12);
        saveProduct(s2, "빨간 장미 꽃다발 (10송이)", "싱싱한 빨간 장미 10송이 꽃다발.", 35000, 42000, 15, "꽃", 4.8, 56);
        saveProduct(s2, "혼합 튤립 꽃다발 (15송이)", "봄의 기운을 담은 알록달록 튤립 꽃다발.", 29000, 35000, 25, "꽃", 4.6, 31);
        saveProduct(s2, "수국 단품 (1줄기)", "풍성한 꽃송이가 매력적인 수국.", 8000, 10000, 40, "꽃", 4.4, 19);
        saveProduct(s1, "테라코타 화분 (중형)", "통기성이 좋은 테라코타 화분. 지름 18cm.", 12000, 15000, 60, "화분/소품", 4.2, 8);
        saveProduct(s1, "세라믹 화분 세트 (3종)", "미니멀 디자인의 흰색 세라믹 화분 3종 세트.", 18000, 22000, 35, "화분/소품", 4.5, 14);
        saveProduct(s2, "식물 영양제 앰플 (10개입)", "식물 생장 촉진 고농축 앰플.", 9500, 12000, 80, "비료/토양", 4.1, 22);
        saveProduct(s2, "배합 분갈이 흙 (5L)", "펄라이트, 코코피트, 부엽토 최적 배합.", 7000, 9000, 100, "비료/토양", 4.6, 45);
        saveProduct(s1, "스테인리스 물조리개 (1L)", "긴 주둥이로 좁은 화분에도 편한 물조리개.", 16500, 20000, 25, "원예도구", 4.3, 9);
        saveProduct(s1, "원예 가위 세트 (3종)", "전정가위, 적심가위, 미니 가위 3종 세트.", 13000, 16000, 40, "원예도구", 4.4, 17);
        log.info("상품 더미 데이터 삽입 완료.");
    }

    private void saveProduct(User seller, String name, String desc, int price, int originalPrice,
                             int stock, String category, double rating, int reviewCount) {
        productRepository.save(Product.builder()
                .seller(seller).name(name).description(desc)
                .price(BigDecimal.valueOf(price))
                .originalPrice(BigDecimal.valueOf(originalPrice))
                .stockQuantity(stock).category(category)
                .rating(BigDecimal.valueOf(rating)).reviewCount(reviewCount)
                .isActive(true).isGroupBuy(false).build());
    }

    @Transactional
    public void ensureFestivals() {
        if (festivalRepository.count() > 0) return;
        log.info("축제 더미 데이터 삽입 중...");
        festivalRepository.save(Festival.builder().name("고양 국제 꽃박람회").emoji("🌸").category("꽃축제").region("경기")
                .location("경기 고양시 일산서구").organizer("고양시").lat(37.6584).lng(126.7756)
                .startDate(LocalDate.of(2026, 4, 25)).endDate(LocalDate.of(2026, 5, 10))
                .description("경기 북부 최대 규모의 꽃 축제입니다.").bgColor("#fce4ec").tags("봄꽃,가족,체험").build());
        festivalRepository.save(Festival.builder().name("서울 식물원 봄꽃 페스타").emoji("🌿").category("수목원").region("서울")
                .location("서울 강서구 마곡동").organizer("서울시").lat(37.5707).lng(126.8269)
                .startDate(LocalDate.of(2026, 4, 5)).endDate(LocalDate.of(2026, 5, 27))
                .description("마곡 서울식물원에서 열리는 봄꽃 페스타입니다.").bgColor("#e8f5e9").tags("온실,워크숍,봄").build());
        festivalRepository.save(Festival.builder().name("태안 세계 튤립 축제").emoji("🌷").category("꽃축제").region("충남")
                .location("충남 태안군").organizer("태안군").lat(36.7455).lng(126.2982)
                .startDate(LocalDate.of(2026, 4, 10)).endDate(LocalDate.of(2026, 4, 30))
                .description("서해안 최대 규모 튤립 축제입니다.").bgColor("#fce4ec").tags("튤립,야간,포토존").build());
        festivalRepository.save(Festival.builder().name("함평 나비·곤충 축제").emoji("🦋").category("체험").region("전남")
                .location("전남 함평군").organizer("함평군").lat(35.0661).lng(126.5169)
                .startDate(LocalDate.of(2026, 5, 1)).endDate(LocalDate.of(2026, 5, 10))
                .description("전남 함평에서 열리는 생태 축제입니다.").bgColor("#f3e5f5").tags("나비,생태,체험").build());
        festivalRepository.save(Festival.builder().name("서울 성수 식물 마켓위크").emoji("🛍️").category("마켓").region("서울")
                .location("서울 성동구 성수동").organizer("성수 팝업파크").lat(37.5445).lng(127.0558)
                .startDate(LocalDate.of(2026, 5, 22)).endDate(LocalDate.of(2026, 5, 25))
                .description("성수동에서 열리는 식물 마켓 위크입니다.").bgColor("#fff3e0").tags("팝업,인디브랜드,희귀식물").build());
    }
}
