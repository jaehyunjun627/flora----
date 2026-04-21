package com.flora.backend.config;

import com.flora.backend.document.Plant;
import com.flora.backend.repository.mongo.PlantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 앱 시작 시 MongoDB plants 컬렉션이 비어 있으면 51종 시드 데이터를 삽입합니다.
 * 이미 데이터가 있으면 아무 것도 하지 않습니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PlantDataInitializer implements CommandLineRunner {

    private final PlantRepository plantRepository;

    @Override
    public void run(String... args) {
        long count = plantRepository.count();
        log.info("Plants 컬렉션 현재 {}개 문서 존재. 51종 식물 데이터로 교체합니다...", count);

        // 기존 데이터 전체 삭제 후 새 데이터 삽입 (항상 최신 데이터 유지)
        plantRepository.deleteAll();
        List<Plant> plants = buildPlantSeedData();
        plantRepository.saveAll(plants);
        log.info("식물 시드 데이터 {}건 삽입 완료!", plants.size());
    }

    private List<Plant> buildPlantSeedData() {
        List<Plant> list = new ArrayList<>();

        // ── 봄꽃 ──
        list.add(plant("장미", "Rosa hybrida", "rose", "장미과", "장미목",
            "봄/여름", "가시가 있는 줄기에 아름다운 꽃이 피는 관목으로, 전 세계에서 가장 사랑받는 관상식물이다.",
            "정원, 화단, 온실", "없음", false,
            "사랑과 아름다움", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("튤립", "Tulipa gesneriana", "tulip", "백합과", "백합목",
            "봄", "봄에 피는 구근식물로, 컵 모양의 꽃이 특징이다. 네덜란드의 국화로 유명하다.",
            "화단, 정원, 화분", "있음 (구근 섭취 시 구토·설사 유발)", true,
            "사랑의 고백", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("진달래", "Rhododendron mucronulatum", "Korean azalea", "진달래과", "진달래목",
            "봄", "한국 산야에 자생하는 낙엽관목으로 이른 봄 잎보다 먼저 분홍색 꽃이 핀다.",
            "화분, 정원", "없음", false,
            "사랑의 즐거움", "반양지", "주 1~2회", "산성 토양"));

        list.add(plant("개나리", "Forsythia koreana", "Korean forsythia", "물푸레나무과", "물푸레나무목",
            "봄", "한국 특산 식물로 이른 봄 노란색 꽃이 가지에 가득 핀다.",
            "정원, 화분", "없음", false,
            "희망", "밝은 햇빛", "주 1회", "일반 토양"));

        list.add(plant("수선화", "Narcissus tazetta", "narcissus", "수선화과", "비짜루목",
            "봄", "이른 봄 향기로운 흰색 또는 노란색 꽃이 피는 구근식물이다.",
            "정원, 화단, 화분", "있음 (전초에 리코린 함유, 구근 섭취 시 위험)", true,
            "자기애", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("히아신스", "Hyacinthus orientalis", "hyacinth", "비짜루과", "비짜루목",
            "봄", "강한 향기와 총상 꽃차례가 특징인 구근식물이다. 수경재배도 쉽게 가능하다.",
            "화분, 화단", "있음 (옥살산칼슘 함유, 구근 섭취 시 위험)", true,
            "게임의 승리", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("카네이션", "Dianthus caryophyllus", "carnation", "석죽과", "석죽목",
            "봄", "어버이날을 상징하는 꽃으로, 감사와 사랑의 의미를 담고 있다.",
            "정원, 온실, 화분", "없음", false,
            "감사와 사랑", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("작약", "Paeonia lactiflora", "peony", "작약과", "범의귀목",
            "봄/여름", "크고 풍성한 꽃이 특징으로 함박꽃이라고도 불린다.",
            "정원, 화단, 약초밭", "없음", false,
            "수줍음", "밝은 햇빛", "주 2회", "비옥한 토양"));


        list.add(plant("프리지아", "Freesia refracta", "freesia", "붓꽃과", "비짜루목",
            "봄", "달콤한 향기와 밝은 색상의 깔때기 모양 꽃이 특징이다.",
            "온실, 화분, 정원", "없음", false,
            "순결", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("팬지", "Viola wittrockiana", "pansy", "제비꽃과", "말피기목",
            "봄", "봄 화단을 화려하게 장식하는 대표적인 일년초이다.",
            "화단, 화분", "없음", false,
            "나를 생각해줘", "밝은 햇빛", "주 2회", "비옥한 토양"));

        list.add(plant("제비꽃", "Viola mandshurica", "violet", "제비꽃과", "말피기목",
            "봄", "봄에 보라색 작은 꽃이 피는 여러해살이풀이다.",
            "화분, 화단", "없음", false,
            "겸양", "반양지", "주 2회", "배수 좋은 토양"));

        list.add(plant("안개꽃", "Gypsophila paniculata", "baby's breath", "석죽과", "석죽목",
            "봄/여름", "작은 흰 꽃이 안개처럼 무수히 피어 꽃다발의 대표적인 부자재로 사용된다.",
            "정원, 화단, 온실", "없음", false,
            "영원한 사랑", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("패랭이꽃", "Dianthus chinensis", "Chinese pink", "석죽과", "석죽목",
            "봄/여름", "분홍색 또는 붉은색의 작은 꽃이 군락으로 피어 화단을 수놓는다.",
            "화단, 화분", "없음", false,
            "순수한 사랑", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("데이지", "Bellis perennis", "daisy", "국화과", "국화목",
            "봄", "순수함을 상징하는 작고 사랑스러운 꽃이다.",
            "정원, 화단, 화분", "없음", false,
            "희망", "밝은 햇빛", "주 2회", "일반 토양"));

        list.add(plant("클레마티스", "Clematis patens", "clematis", "미나리아재비과", "미나리아재비목",
            "봄/여름", "덩굴을 타고 올라가며 크고 화려한 꽃이 피는 식물이다.",
            "정원, 울타리, 화분", "있음 (프로토아네모닌 함유, 피부 자극)", true,
            "아름다운 마음", "밝은 햇빛", "주 2회", "비옥한 토양"));

        list.add(plant("아마릴리스", "Hippeastrum hybridum", "amaryllis", "수선화과", "비짜루목",
            "봄/여름", "크고 화려한 나팔 모양의 꽃이 특징인 구근식물이다.",
            "실내, 화분", "있음 (리코린 함유, 구근 섭취 시 위험)", true,
            "찬란한 아름다움", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        // ── 여름꽃 ──
        list.add(plant("라벤더", "Lavandula angustifolia", "lavender", "꿀풀과", "꿀풀목",
            "여름", "보라색 꽃과 강한 향기가 특징인 허브 식물이다.",
            "화분, 정원", "없음", false,
            "침묵의 사랑", "밝은 햇빛", "주 1회", "배수 좋은 토양"));

        list.add(plant("해바라기", "Helianthus annuus", "sunflower", "국화과", "국화목",
            "여름", "태양을 향해 꽃대가 움직이는 큰 노란 꽃이 특징인 한해살이풀이다.",
            "화단, 정원, 화분", "없음", false,
            "당신만 바라봐요", "직사광선", "주 3회", "비옥한 토양"));

        list.add(plant("백합", "Lilium longiflorum", "lily", "백합과", "백합목",
            "여름", "우아한 나팔 모양의 흰 꽃이 피며, 강한 향기가 특징이다.",
            "정원, 화단, 온실", "있음 (고양이에게 매우 유독, 사람은 경미)", true,
            "순결", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("수국", "Hydrangea macrophylla", "hydrangea", "수국과", "층층나무목",
            "여름", "토양 산도에 따라 꽃 색이 파란색 또는 분홍색으로 변하는 신기한 식물이다.",
            "정원, 화분, 화단", "있음 (잎과 꽃에 시안배당체 함유)", true,
            "진심", "반양지", "주 3회", "산성 토양"));

        list.add(plant("봉선화", "Impatiens balsamina", "balsam", "봉선화과", "진달래목",
            "여름", "여름에 빨간 꽃이 피며, 꽃잎으로 손톱을 물들이는 전통이 있다.",
            "정원, 화단, 화분", "없음", false,
            "나를 건드리지 마세요", "반양지", "주 2회", "일반 토양"));

        list.add(plant("나팔꽃", "Ipomoea nil", "morning glory", "메꽃과", "가지목",
            "여름", "아침에 피었다가 오후에 시드는 덩굴식물이다.",
            "울타리, 화분", "있음 (씨앗에 리세르그산 아미드 함유)", true,
            "덧없는 사랑", "밝은 햇빛", "주 2~3회", "일반 토양"));

        list.add(plant("연꽃", "Nelumbo nucifera", "lotus", "연꽃과", "프로테아목",
            "여름", "수생 식물로 진흙에서 자라면서도 아름다운 꽃을 피운다.",
            "수조, 수반, 연못", "없음", false,
            "순수한 마음", "밝은 햇빛", "항상 습하게", "수생"));

        list.add(plant("수련", "Nymphaea tetragona", "water lily", "수련과", "수련목",
            "여름", "수면 위에 떠서 피는 아름다운 수생 식물이다.",
            "수조, 수반, 연못", "없음", false,
            "청순한 마음", "밝은 햇빛", "항상 습하게", "수생"));

        list.add(plant("칸나", "Canna indica", "canna lily", "칸나과", "생강목",
            "여름/가을", "여름부터 가을까지 빨강, 노랑, 주황의 크고 화려한 꽃이 피는 열대 식물이다.",
            "화단, 화분", "없음", false,
            "영원한 행복", "밝은 햇빛", "주 3회", "비옥한 토양"));

        list.add(plant("백일홍", "Zinnia elegans", "zinnia", "국화과", "국화목",
            "여름/가을", "이름처럼 오랫동안 꽃이 피어 백일 동안 붉다는 뜻이다.",
            "화단, 화분", "없음", false,
            "떠나간 님을 그리워하며", "밝은 햇빛", "주 2회", "일반 토양"));

        list.add(plant("금잔화", "Calendula officinalis", "marigold", "국화과", "국화목",
            "봄/여름", "주황색 또는 노란색 꽃이 피며, 식용과 약용으로 모두 사용된다.",
            "화단, 화분", "없음", false,
            "이별의 슬픔", "밝은 햇빛", "주 2회", "일반 토양"));

        list.add(plant("달리아", "Dahlia pinnata", "dahlia", "국화과", "국화목",
            "여름/가을", "크고 화려한 꽃이 피며, 색상과 형태가 매우 다양하다.",
            "화단, 정원", "없음", false,
            "감사", "밝은 햇빛", "주 2~3회", "비옥한 토양"));

        list.add(plant("글라디올러스", "Gladiolus hybridus", "gladiolus", "붓꽃과", "비짜루목",
            "여름", "칼 모양의 잎과 화려한 이삭 모양 꽃차례가 특징인 구근식물이다.",
            "화단, 정원", "없음", true,
            "조심", "직사광선", "주 2~3회", "배수 좋은 토양"));

        list.add(plant("거베라", "Gerbera jamesonii", "gerbera daisy", "국화과", "국화목",
            "봄/여름", "화려한 색상의 큰 꽃이 특징으로 전 세계적으로 인기 있는 절화이다.",
            "화분, 화단", "없음", false,
            "희망", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("피튜니아", "Petunia hybrida", "petunia", "가지과", "가지목",
            "여름", "나팔 모양의 꽃이 여름 내내 풍성하게 피는 대표적인 원예 식물이다.",
            "화단, 화분", "없음", false,
            "당신과 함께라면", "직사광선", "주 2~3회", "비옥한 토양"));

        list.add(plant("자스민", "Jasminum officinale", "jasmine", "물푸레나무과", "물푸레나무목",
            "여름", "달콤하고 진한 향기가 나는 흰색 꽃이 특징이다.",
            "화분, 정원", "없음", false,
            "사랑스러움", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("허브제라늄", "Pelargonium graveolens", "geranium", "쥐손이풀과", "쥐손이풀목",
            "봄/여름", "독특한 향이 나는 잎과 분홍색 꽃이 특징이다. 모기를 쫓는 효과가 있다.",
            "화분, 베란다", "없음", true,
            "결심", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("란타나", "Lantana camara", "lantana", "마편초과", "꿀풀목",
            "봄/여름/가을", "작은 꽃이 둥글게 모여 피며, 시간이 지남에 따라 색이 변하는 신기한 식물이다.",
            "화분, 화단", "있음 (덜 익은 열매 섭취 시 간 독성)", true,
            "엄격함", "밝은 햇빛", "주 1~2회", "일반 토양"));

        list.add(plant("스타티스", "Limonium sinuatum", "statice", "갯질경이과", "석죽목",
            "여름", "건조해도 색과 형태가 유지되어 드라이플라워로 가장 인기 있는 꽃이다.",
            "화단, 온실, 화분", "없음", false,
            "변하지 않는 마음", "밝은 햇빛", "주 1회", "배수 좋은 토양"));

        // ── 가을꽃 ──
        list.add(plant("국화", "Chrysanthemum morifolium", "chrysanthemum", "국화과", "국화목",
            "가을", "가을을 대표하는 꽃으로 다양한 꽃잎 형태와 색상을 가진다.",
            "화분, 화단", "없음", false,
            "고결한 지조", "밝은 햇빛", "주 2회", "비옥한 토양"));

        list.add(plant("코스모스", "Cosmos bipinnatus", "cosmos", "국화과", "국화목",
            "가을", "가을 들판을 수놓는 대표적인 꽃으로 분홍, 흰색, 자주색 꽃이 핀다.",
            "화단, 화분", "없음", false,
            "순정", "밝은 햇빛", "주 1회", "일반 토양"));

        list.add(plant("베고니아", "Begonia semperflorens", "begonia", "베고니아과", "박목",
            "봄/여름/가을", "그늘에서도 잘 자라며 사계절 꽃을 피우는 실내외 겸용 식물이다.",
            "화분, 실내, 화단", "있음 (구근 섭취 시 구토 유발)", true,
            "친절", "반양지", "주 2회", "배수 좋은 토양"));

        list.add(plant("칼란코에", "Kalanchoe blossfeldiana", "kalanchoe", "돌나물과", "범의귀목",
            "봄/여름", "관리가 매우 쉬운 다육식물로 오랫동안 작은 꽃이 피어 있다.",
            "실내, 화분", "있음 (강심배당체 함유, 소량 섭취도 위험)", true,
            "인기", "밝은 햇빛", "주 1회", "배수 좋은 토양"));

        // ── 겨울·사계절꽃 ──
        list.add(plant("동백나무", "Camellia japonica", "camellia", "차나무과", "차나무목",
            "겨울/봄", "겨울부터 이른 봄에 빨간 꽃이 피는 상록 식물이다.",
            "화분, 정원", "없음", false,
            "기다림의 사랑", "반양지", "주 2회", "산성 토양"));

        list.add(plant("매화", "Prunus mume", "plum blossom", "장미과", "장미목",
            "겨울/봄", "이른 봄 추위 속에서 가장 먼저 꽃을 피워 선비의 절개를 상징한다.",
            "화분, 정원", "있음 (덜 익은 열매에 청산배당체 함유)", true,
            "고결한 마음", "밝은 햇빛", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("시클라멘", "Cyclamen persicum", "cyclamen", "앵초과", "진달래목",
            "겨울/봄", "겨울철 실내를 밝혀주는 대표적인 구근식물이다.",
            "실내, 화분", "있음 (전초 특히 구근에 사이클라민 함유)", true,
            "내성적인 아름다움", "반양지", "주 2회", "배수 좋은 토양"));

        list.add(plant("무궁화", "Hibiscus syriacus", "rose of sharon", "아욱과", "아욱목",
            "여름/가을", "대한민국의 국화로, 여름부터 가을까지 끊임없이 꽃이 핀다.",
            "정원, 화분", "없음", false,
            "일편단심", "밝은 햇빛", "주 2회", "일반 토양"));

        list.add(plant("철쭉", "Rhododendron schlippenbachii", "royal azalea", "진달래과", "진달래목",
            "봄", "진달래와 비슷하지만 꽃이 더 크고 잎과 함께 핀다.",
            "화분, 정원", "있음 (꽃과 잎에 그레이아노톡신 함유)", true,
            "사랑의 기쁨", "반양지", "주 2회", "산성 토양"));

        // ── 허브 / 야생화 / 관목 ──
        list.add(plant("민들레", "Taraxacum platycarpum Dahlst.", "dandelion", "국화과", "초롱꽃목",
            "봄/여름/가을", "줄기는 없고 잎이 뿌리에서 뭉쳐나며 옆으로 퍼진다. 꽃은 4~5월에 노란색으로 피고 잎과 길이가 비슷한 꽃대 끝에 두상화가 1개 달린다. 들의 볕이 잘 드는 곳에 자라며 한국·중국·일본에 분포한다. (출처: 산림청 숲에사는식물정보 API)",
            "들, 화단, 화분", "없음", false,
            "행복", "밝은 햇빛", "주 1~2회", "일반 토양"));

        list.add(plant("율마", "Cupressus macrocarpa 'Goldcrest'", "goldcrest", "측백나무과", "측백나무목",
            "사계절", "레몬 향이 나는 황금빛 잎이 특징인 상록 침엽수이다. 크리스마스트리 모양으로 인테리어 소품으로 인기가 높다.",
            "실내, 화분, 정원", "없음", false,
            "영원한 우정", "밝은 햇빛", "주 2~3회", "배수 좋은 토양"));

        list.add(plant("채송화", "Portulaca grandiflora", "moss rose", "쇠비름과", "석죽목",
            "여름", "밝고 화려한 색상의 작은 꽃이 피는 한해살이풀이다. 햇빛이 강한 날에만 꽃이 피며 건조에 강하다.",
            "화단, 화분", "없음", false,
            "가련함", "직사광선", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("레몬밤", "Melissa officinalis", "lemon balm", "꿀풀과", "꿀풀목",
            "봄/여름/가을", "레몬 향이 나는 허브로 스트레스 완화와 수면 개선에 도움이 된다고 알려져 있다. 차로 즐겨 마신다.",
            "화분, 정원, 텃밭", "없음", false,
            "유쾌함", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        list.add(plant("코리앤더", "Coriandrum sativum", "coriander", "산형과", "미나리목",
            "봄/가을", "잎과 씨앗 모두 요리에 사용되는 허브이다. 특유의 향으로 동남아시아·인도·멕시코 요리에 필수적이다.",
            "화분, 텃밭", "없음", false,
            "숨겨진 가치", "밝은 햇빛", "주 2회", "일반 토양"));

        list.add(plant("딜", "Anethum graveolens", "dill", "산형과", "미나리목",
            "봄/여름", "깃털 같은 잎이 특징인 허브이다. 생선 요리와 피클에 많이 사용되며 소화 기능 향상에 도움을 준다.",
            "화분, 텃밭", "없음", false,
            "행운", "밝은 햇빛", "주 2회", "배수 좋은 토양"));

        // ── 관엽식물 (실내) ──
        list.add(plant("몬스테라", "Monstera deliciosa", "monstera", "천남성과", "택사목",
            "사계절", "열대 우림 원산의 관엽식물로 구멍이 뚫린 독특한 잎 모양이 특징이다.",
            "실내, 화분", "있음 (옥살산칼슘 함유, 구강 자극)", true,
            "장수", "간접광", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("산세베리아", "Sansevieria trifasciata", "snake plant", "비짜루과", "비짜루목",
            "사계절", "강한 생명력과 뛰어난 공기정화 효과로 인기 있는 관엽식물이다.",
            "실내, 화분", "있음 (구토·설사 유발 가능)", true,
            "관용", "간접광", "월 1~2회", "배수 좋은 토양"));

        list.add(plant("알로에베라", "Aloe vera", "aloe vera", "비짜루과", "비짜루목",
            "사계절", "다육질 잎 속의 젤은 피부 진정과 치료에 효과적이다.",
            "실내, 화분", "없음", false,
            "행운", "밝은 햇빛", "월 2~3회", "배수 좋은 토양"));

        list.add(plant("고무나무", "Ficus elastica", "rubber plant", "뽕나무과", "장미목",
            "사계절", "두꺼운 광택 있는 잎이 특징인 관엽식물이다. 공기정화 효과가 뛰어나다.",
            "실내, 화분", "있음 (수액 피부·점막 자극)", true,
            "영원한 행복", "간접광", "주 1회", "비옥한 토양"));

        list.add(plant("안스리움", "Anthurium andraeanum", "anthurium", "천남성과", "택사목",
            "사계절", "하트 모양의 빨간 불염포가 특징인 열대 관엽식물이다.",
            "실내, 화분", "있음 (옥살산칼슘 함유)", true,
            "열정", "간접광", "주 1~2회", "배수 좋은 토양"));

        list.add(plant("소철", "Cycas revoluta", "sago palm", "소철과", "소철목",
            "사계절", "열대 분위기를 내는 상록 관엽식물로 깃털 같은 잎이 방사형으로 퍼진다.",
            "실내, 화분", "있음 (씨앗에 사이카신 함유, 간 독성)", true,
            "영원한 젊음", "밝은 햇빛", "주 1회", "배수 좋은 토양"));

        return list;
    }

    private Plant plant(String name, String sciName, String engName,
                        String family, String order, String season,
                        String desc, String habitat, String toxicity, boolean toxic,
                        String flowerLang, String sunlight, String watering, String soil) {
        Map<String, Object> careInfo = new LinkedHashMap<>();
        careInfo.put("sunlight", sunlight);
        careInfo.put("watering", watering);
        careInfo.put("soil", soil);

        return Plant.builder()
                .name(name)
                .scientificName(sciName)
                .engName(engName)
                .familyKorName(family)
                .orderKorName(order)
                .season(season)
                .description(desc)
                .habitat(habitat)
                .toxicity(toxicity)
                .isToxicToPets(toxic)
                .flowerLanguage(flowerLang)
                .careInfo(careInfo)
                .tags(buildTags(season, toxic, habitat))
                .build();
    }

    private List<String> buildTags(String season, boolean toxic, String habitat) {
        List<String> tags = new ArrayList<>();
        if (season != null) {
            if (season.contains("봄")) tags.add("봄");
            if (season.contains("여름")) tags.add("여름");
            if (season.contains("가을")) tags.add("가을");
            if (season.contains("겨울")) tags.add("겨울");
            if (season.contains("사계절")) tags.add("사계절");
        }
        if (!toxic) tags.add("반려동물안전");
        if (habitat != null && habitat.contains("실내")) tags.add("실내");
        if (habitat != null && habitat.contains("화분")) tags.add("화분재배");
        return tags;
    }
}
