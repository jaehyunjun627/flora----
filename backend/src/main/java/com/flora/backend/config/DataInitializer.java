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
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FestivalRepository festivalRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("초기 더미 데이터 확인 중...");

        if (userRepository.findByEmail("seller1@flora.com").isEmpty()) {
            log.info("셀러 계정 삽입 중...");
            insertUsers();
        }

        if (productRepository.count() == 0) {
            log.info("상품 더미 데이터 삽입 중...");
            insertProducts();
        }

        if (festivalRepository.count() == 0) {
            log.info("축제 더미 데이터 삽입 중...");
            insertFestivals();
        }

        log.info("초기 더미 데이터 확인 완료.");

        log.info("초기 더미 데이터 삽입 완료.");
    }

    private void insertUsers() {
        String pw = passwordEncoder.encode("password123");

        userRepository.save(User.builder()
                .email("admin@flora.com").passwordHash(pw).nickname("꽃담관리자")
                .role("ADMIN").isActive(true).points(500).streakDays(30).profileEmoji("🛡️").build());

        userRepository.save(User.builder()
                .email("seller1@flora.com").passwordHash(pw).nickname("초록마켓")
                .role("SELLER").isActive(true).points(200).streakDays(15).profileEmoji("🌿").build());

        userRepository.save(User.builder()
                .email("seller2@flora.com").passwordHash(pw).nickname("꽃길농원")
                .role("SELLER").isActive(true).points(180).streakDays(10).profileEmoji("🌸").build());

        userRepository.save(User.builder()
                .email("user1@flora.com").passwordHash(pw).nickname("식물러버")
                .role("USER").isActive(true).points(120).streakDays(7).profileEmoji("🌱").build());

        userRepository.save(User.builder()
                .email("user2@flora.com").passwordHash(pw).nickname("화분수집가")
                .role("USER").isActive(true).points(80).streakDays(3).profileEmoji("🪴").build());
    }

    private void insertProducts() {
        User seller1 = userRepository.findByEmail("seller1@flora.com").orElseThrow();
        User seller2 = userRepository.findByEmail("seller2@flora.com").orElseThrow();

        // 식물
        saveProduct(seller1, "몬스테라 델리시오사", "열대 분위기의 대형 잎이 특징인 인기 관엽식물입니다. 반음지에서도 잘 자라며 공기 정화 효과가 뛰어납니다.", 28000, 35000, 30, "식물", 4.5, 24);
        saveProduct(seller1, "산세베리아 (스투키)", "공기 정화 식물의 대명사. 물을 자주 주지 않아도 잘 자라 초보자에게 추천합니다.", 15000, 18000, 50, "식물", 4.7, 38);
        saveProduct(seller1, "스투키 미니 화분세트", "귀여운 미니 사이즈 스투키 3개 세트. 책상 위 인테리어로 딱 좋습니다.", 22000, 27000, 20, "식물", 4.3, 12);

        // 꽃
        saveProduct(seller2, "빨간 장미 꽃다발 (10송이)", "싱싱한 빨간 장미 10송이 꽃다발. 기념일, 생일 선물로 인기 최고입니다.", 35000, 42000, 15, "꽃", 4.8, 56);
        saveProduct(seller2, "혼합 튤립 꽃다발 (15송이)", "봄의 기운을 담은 알록달록 튤립 꽃다발. 노랑, 분홍, 보라 혼합입니다.", 29000, 35000, 25, "꽃", 4.6, 31);
        saveProduct(seller2, "수국 단품 (1줄기)", "풍성한 꽃송이가 매력적인 수국. 파스텔톤 색상이 인테리어와 잘 어울립니다.", 8000, 10000, 40, "꽃", 4.4, 19);

        // 화분/소품
        saveProduct(seller1, "테라코타 화분 (중형)", "통기성이 좋은 테라코타 화분. 지름 18cm, 관엽식물에 적합합니다.", 12000, 15000, 60, "화분/소품", 4.2, 8);
        saveProduct(seller1, "세라믹 화분 세트 (3종)", "미니멀 디자인의 흰색 세라믹 화분 3종 세트. 소형 다육식물에 최적입니다.", 18000, 22000, 35, "화분/소품", 4.5, 14);

        // 비료/토양
        saveProduct(seller2, "식물 영양제 앰플 (10개입)", "식물 생장 촉진 고농축 앰플. 물 줄 때 1개씩 꽂아주면 됩니다.", 9500, 12000, 80, "비료/토양", 4.1, 22);
        saveProduct(seller2, "배합 분갈이 흙 (5L)", "펄라이트, 코코피트, 부엽토 최적 배합. 대부분의 실내식물에 바로 사용 가능합니다.", 7000, 9000, 100, "비료/토양", 4.6, 45);

        // 원예도구
        saveProduct(seller1, "스테인리스 물조리개 (1L)", "긴 주둥이로 좁은 화분에도 물주기 편한 스테인리스 조리개.", 16500, 20000, 25, "원예도구", 4.3, 9);
        saveProduct(seller1, "원예 가위 세트 (3종)", "전정가위, 적심가위, 미니 가위 3종 세트. 초보 가드너를 위한 입문 세트.", 13000, 16000, 40, "원예도구", 4.4, 17);
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

    private void insertFestivals() {
        festivalRepository.save(Festival.builder()
                .name("고양 국제 꽃박람회").emoji("🌸").category("꽃축제").region("경기")
                .location("경기 고양시 일산서구").organizer("고양시")
                .lat(37.6584).lng(126.7756)
                .startDate(LocalDate.of(2026, 4, 25)).endDate(LocalDate.of(2026, 5, 10))
                .description("경기 북부 최대 규모의 꽃 축제입니다. 튤립, 장미, 수국 등 100여 종의 꽃이 전시됩니다.")
                .bgColor("#fce4ec").tags("봄꽃,가족,체험").build());

        festivalRepository.save(Festival.builder()
                .name("서울 식물원 봄꽃 페스타").emoji("🌿").category("수목원").region("서울")
                .location("서울 강서구 마곡동").organizer("서울시")
                .lat(37.5707).lng(126.8269)
                .startDate(LocalDate.of(2026, 4, 5)).endDate(LocalDate.of(2026, 5, 27))
                .description("마곡 서울식물원에서 열리는 봄꽃 페스타입니다. 온실 특별 전시와 야외 정원 프로그램을 즐길 수 있어요.")
                .bgColor("#e8f5e9").tags("온실,워크숍,봄").build());

        festivalRepository.save(Festival.builder()
                .name("태안 세계 튤립 축제").emoji("🌷").category("꽃축제").region("충남")
                .location("충남 태안군").organizer("태안군")
                .lat(36.7455).lng(126.2982)
                .startDate(LocalDate.of(2026, 4, 10)).endDate(LocalDate.of(2026, 4, 30))
                .description("서해안 최대 규모 튤립 축제입니다. 300만 송이의 튤립 물결과 야간 조명 이벤트가 펼쳐집니다.")
                .bgColor("#fce4ec").tags("튤립,야간,포토존").build());

        festivalRepository.save(Festival.builder()
                .name("함평 나비·곤충 축제").emoji("🦋").category("체험").region("전남")
                .location("전남 함평군").organizer("함평군")
                .lat(35.0661).lng(126.5169)
                .startDate(LocalDate.of(2026, 5, 1)).endDate(LocalDate.of(2026, 5, 10))
                .description("전남 함평에서 열리는 생태 축제입니다. 나비와 식물이 공존하는 생태 정원을 관람할 수 있어요.")
                .bgColor("#f3e5f5").tags("나비,생태,체험").build());

        festivalRepository.save(Festival.builder()
                .name("서울 성수 식물 마켓위크").emoji("🛍️").category("마켓").region("서울")
                .location("서울 성동구 성수동").organizer("성수 팝업파크")
                .lat(37.5445).lng(127.0558)
                .startDate(LocalDate.of(2026, 5, 22)).endDate(LocalDate.of(2026, 5, 25))
                .description("성수동 팝업 단지에서 열리는 식물 마켓 위크입니다. 희귀 식물 딜러들이 한 자리에 모여요.")
                .bgColor("#fff3e0").tags("팝업,인디브랜드,희귀식물").build());
    }
}
