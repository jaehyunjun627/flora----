package com.flora.backend.config;

import com.flora.backend.entity.Festival;
import com.flora.backend.repository.jpa.FestivalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * FESTIVALS 테이블이 비어 있을 경우, 대표적인 한국 꽃 축제 데이터를 시드.
 * - 위도/경도는 축제 개최 장소의 실제 좌표(공공데이터/관광공사 기반 참고값)
 * - 실제 TourAPI 연동 시에는 이 시더 대신 TourApiService가 upsert 수행
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(20)
public class FestivalDataInitializer implements CommandLineRunner {

    private final FestivalRepository festivalRepository;

    @Override
    public void run(String... args) {
        long count = festivalRepository.count();
        if (count > 0) {
            log.info("Festival 테이블에 이미 {}개 데이터가 있어 seed를 건너뜁니다.", count);
            return;
        }
        log.info("Festival 테이블이 비어 있어 꽃 축제 시드 데이터를 추가합니다.");

        int year = LocalDate.now().getYear();

        List<Festival> festivals = List.of(
            Festival.builder()
                .name("진해 군항제")
                .emoji("🌸")
                .region("경남 창원")
                .startDate(LocalDate.of(year, 3, 25))
                .endDate(LocalDate.of(year, 4, 3))
                .description("대한민국 대표 벚꽃 축제. 여좌천 로망스다리와 경화역 벚꽃길을 따라 수십만 그루의 벚꽃이 만개합니다.")
                .bgColor("#FFD6E0")
                .latitude(35.1490)
                .longitude(128.6803)
                .address("경남 창원시 진해구 여좌동")
                .detailUrl("https://www.changwon.go.kr/cwportal/10101/10395/10396.web")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/39/2712639_image2_1.jpg")
                .contentId("seed-jinhae")
                .build(),

            Festival.builder()
                .name("여의도 봄꽃축제")
                .emoji("🌸")
                .region("서울 영등포")
                .startDate(LocalDate.of(year, 4, 4))
                .endDate(LocalDate.of(year, 4, 10))
                .description("국회의사당 뒤편 윤중로 벚꽃길에서 열리는 서울 대표 봄꽃 축제. 약 1,886그루의 벚꽃이 장관을 이룹니다.")
                .bgColor("#FFE2EC")
                .latitude(37.5282)
                .longitude(126.9177)
                .address("서울 영등포구 여의동로 330 (윤중로)")
                .detailUrl("https://www.ydp.go.kr/www/contents.do?key=2395")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/85/2639785_image2_1.jpg")
                .contentId("seed-yeouido")
                .build(),

            Festival.builder()
                .name("구례 산수유꽃축제")
                .emoji("💛")
                .region("전남 구례")
                .startDate(LocalDate.of(year, 3, 15))
                .endDate(LocalDate.of(year, 3, 24))
                .description("지리산 자락 산동면 일대를 샛노랗게 물들이는 산수유꽃 축제. 봄의 시작을 알리는 대표 축제입니다.")
                .bgColor("#FFF4C2")
                .latitude(35.2739)
                .longitude(127.5186)
                .address("전남 구례군 산동면 지리산온천로 102-8")
                .detailUrl("https://www.gurye.go.kr/tour/index.gurye")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/47/2713747_image2_1.jpg")
                .contentId("seed-sansuyu")
                .build(),

            Festival.builder()
                .name("광양 매화축제")
                .emoji("🌼")
                .region("전남 광양")
                .startDate(LocalDate.of(year, 3, 8))
                .endDate(LocalDate.of(year, 3, 17))
                .description("섬진강변 청매실농원 일대에서 펼쳐지는 매화 축제. 10만 그루의 매화가 은은한 향기와 함께 봄을 엽니다.")
                .bgColor("#FFE0F0")
                .latitude(35.0872)
                .longitude(127.6489)
                .address("전남 광양시 다압면 섬진강매화로 1563-1")
                .detailUrl("https://www.gwangyang.go.kr/tour/contents.do?mId=0103010000")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/40/2713740_image2_1.jpg")
                .contentId("seed-maehwa")
                .build(),

            Festival.builder()
                .name("고양 국제꽃박람회")
                .emoji("🌷")
                .region("경기 고양")
                .startDate(LocalDate.of(year, 4, 26))
                .endDate(LocalDate.of(year, 5, 12))
                .description("국내 최대 규모의 국제 꽃 박람회. 고양호수공원 일대에서 세계 각국의 화훼 작품과 튤립·장미 정원이 펼쳐집니다.")
                .bgColor("#FFD5D5")
                .latitude(37.6547)
                .longitude(126.7626)
                .address("경기 고양시 일산동구 호수로 595 (고양호수공원)")
                .detailUrl("https://www.flower.or.kr")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/26/2713526_image2_1.jpg")
                .contentId("seed-goyang")
                .build(),

            Festival.builder()
                .name("태안 세계튤립축제")
                .emoji("🌷")
                .region("충남 태안")
                .startDate(LocalDate.of(year, 4, 12))
                .endDate(LocalDate.of(year, 5, 12))
                .description("코리아플라워파크에서 펼쳐지는 300만 송이 튤립 축제. 네덜란드 분위기의 풍차와 함께 화려한 꽃밭을 즐길 수 있습니다.")
                .bgColor("#FFD8A8")
                .latitude(36.8072)
                .longitude(126.1611)
                .address("충남 태안군 안면읍 꽃지해안로 400")
                .detailUrl("https://www.tulipfestival.kr")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/81/2713581_image2_1.jpg")
                .contentId("seed-taean")
                .build(),

            Festival.builder()
                .name("이천 산수유마을 축제")
                .emoji("💛")
                .region("경기 이천")
                .startDate(LocalDate.of(year, 3, 29))
                .endDate(LocalDate.of(year, 3, 31))
                .description("백사면 도립리 산수유마을에서 열리는 노란 산수유꽃 축제. 수령 500년의 고목들이 봄을 알립니다.")
                .bgColor("#FFF0B8")
                .latitude(37.3066)
                .longitude(127.4389)
                .address("경기 이천시 백사면 경사로 466")
                .detailUrl("https://www.2000ricefestival.or.kr")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/85/2713585_image2_1.jpg")
                .contentId("seed-icheon")
                .build(),

            Festival.builder()
                .name("함평 나비대축제")
                .emoji("🦋")
                .region("전남 함평")
                .startDate(LocalDate.of(year, 4, 26))
                .endDate(LocalDate.of(year, 5, 6))
                .description("자운영·유채꽃이 만개한 들판에서 펼쳐지는 나비 축제. 꽃과 나비가 어우러진 환상적인 풍경을 감상할 수 있습니다.")
                .bgColor("#E8D5FF")
                .latitude(35.0667)
                .longitude(126.5167)
                .address("전남 함평군 함평읍 곤재로 27")
                .detailUrl("https://www.hampyeong.go.kr/festival")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/80/2713580_image2_1.jpg")
                .contentId("seed-hampyeong")
                .build(),

            Festival.builder()
                .name("보성 녹차 & 꽃 페스티벌")
                .emoji("🍃")
                .region("전남 보성")
                .startDate(LocalDate.of(year, 5, 3))
                .endDate(LocalDate.of(year, 5, 6))
                .description("보성 녹차밭과 함께 철쭉·진달래·야생화가 어우러진 초록·분홍의 봄 축제.")
                .bgColor("#D0F0D0")
                .latitude(34.7423)
                .longitude(127.0763)
                .address("전남 보성군 보성읍 녹차로 763-67")
                .detailUrl("https://www.boseong.go.kr/festival")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/14/2713514_image2_1.jpg")
                .contentId("seed-boseong")
                .build(),

            Festival.builder()
                .name("에버랜드 튤립축제")
                .emoji("🌷")
                .region("경기 용인")
                .startDate(LocalDate.of(year, 3, 21))
                .endDate(LocalDate.of(year, 5, 6))
                .description("포시즌스 가든에서 120만 송이의 튤립이 펼치는 초대형 꽃 축제. 야간 개장 시 조명과 함께하는 튤립이 특히 아름답습니다.")
                .bgColor("#FFD8E2")
                .latitude(37.2936)
                .longitude(127.2025)
                .address("경기 용인시 처인구 포곡읍 에버랜드로 199")
                .detailUrl("https://www.everland.com")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/72/2713572_image2_1.jpg")
                .contentId("seed-everland")
                .build(),

            Festival.builder()
                .name("신안 튤립축제")
                .emoji("🌷")
                .region("전남 신안")
                .startDate(LocalDate.of(year, 4, 5))
                .endDate(LocalDate.of(year, 4, 14))
                .description("임자도 대광해수욕장에서 열리는 바다와 튤립이 만나는 축제. 수백만 송이 튤립이 장관을 이룹니다.")
                .bgColor("#FFC5DE")
                .latitude(35.0778)
                .longitude(126.0761)
                .address("전남 신안군 임자면 대광해변길 233")
                .detailUrl("https://www.shinan.go.kr/tour")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/23/2713523_image2_1.jpg")
                .contentId("seed-sinan")
                .build(),

            Festival.builder()
                .name("제주 유채꽃축제")
                .emoji("💛")
                .region("제주 서귀포")
                .startDate(LocalDate.of(year, 3, 29))
                .endDate(LocalDate.of(year, 4, 7))
                .description("가시리 녹산로를 따라 10km 이어지는 유채꽃 길. 한라산을 배경으로 한 샛노란 꽃밭이 봄 제주를 대표합니다.")
                .bgColor("#FFF0B5")
                .latitude(33.3849)
                .longitude(126.7658)
                .address("제주 서귀포시 표선면 녹산로 464-65")
                .detailUrl("https://www.visitjeju.net")
                .imageUrl("https://tong.visitkorea.or.kr/cms/resource/89/2713589_image2_1.jpg")
                .contentId("seed-jeju-yuchae")
                .build()
        );

        festivalRepository.saveAll(festivals);
        log.info("Festival seed 완료: {}개", festivals.size());
    }
}
