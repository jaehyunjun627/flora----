# Flora 프로젝트 — DB 구조 팀 공유 문서

> 작성일: 2026-03-25
> 기술 스택: Spring Boot 3.5 / Oracle XE (JPA) + MongoDB (Spring Data)

---

## 전체 구성 요약

| 구분 | 개수 | 설명 |
|------|------|------|
| Oracle 엔티티 (Entity) | **10개** | `backend/.../entity/` — JPA @Entity 클래스 |
| Oracle DTO | **10개** | `backend/.../dto/` — 각 엔티티와 1:1 대응, `from(Entity)` 팩토리 메서드 포함 |
| JPA Repository | **10개** | `backend/.../repository/jpa/` — Oracle 전용 |
| MongoDB 도큐먼트 (Document) | **2개** | `backend/.../document/` — @Document 클래스 |
| MongoDB Repository | **2개** | `backend/.../repository/mongo/` — MongoDB 전용 |
| **합계 (도메인 클래스)** | **12개** | 엔티티 10 + 도큐먼트 2 |

**DB 분리 설정:**
- `OracleConfig` → `@EnableJpaRepositories(basePackages = "...repository.jpa")`
- `MongoConfig` → `@EnableMongoRepositories(basePackages = "...repository.mongo")`

---

## Oracle DB 테이블 상세 (10개)

### 1. USERS

> **엔티티:** `User.java` | **DTO:** `UserDto.java` | **Repository:** `UserRepository`

**통합된 원본 테이블:** `USERS` + `OAUTH_ACCOUNTS` + `USER_BADGES` + `TERMS` + `USER_TERM_CONSENTS`
(23개 → 10개 통합 리팩토링 시 4개 테이블 흡수)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| email | String (unique) | 로그인 이메일 |
| passwordHash | String | 일반 로그인 비밀번호 해시 |
| nickname | String(30) | 사용자 닉네임 |
| phone | String(20) | 전화번호 |
| profileImageUrl | String | 프로필 이미지 URL |
| profileEmoji | String(10) | 프로필 이모지 |
| role | String(20) | 권한 (USER / ADMIN / SELLER), 기본값 USER |
| isActive | Boolean | 계정 활성화 여부 |
| points | Integer | 보유 포인트, 기본값 0 |
| streakDays | Integer | 연속 출석 일수 |
| lastCheckIn | LocalDate | 마지막 출석체크 날짜 |
| farmName | String(50) | 나의 농장 이름 (마이페이지) |
| sellerStatus | String(20) | 판매자 신청 상태 (PENDING / APPROVED 등) |
| businessName | String(100) | 사업자명 |
| businessNumber | String(20) | 사업자 등록번호 |
| oauthProvider | String(20) | OAuth 제공자 (KAKAO / GOOGLE 등) |
| oauthProviderUserId | String(100) | OAuth 제공자 측 사용자 ID |
| badges | String(500) | 보유 뱃지 목록 (쉼표 구분 문자열) |
| termsAgreed | Boolean | 이용약관 동의 여부 |
| termsAgreedAt | LocalDateTime | 이용약관 동의 시각 |
| createdAt | LocalDateTime | 가입일 (자동) |
| updatedAt | LocalDateTime | 수정일 (자동) |

**핵심 기능:**
- 일반 로그인(이메일+비밀번호) 및 OAuth 소셜 로그인 모두 지원 (oauthProvider 필드로 구분)
- 포인트·스트릭 관리 — 퀴즈 정답, 출석체크 등으로 포인트 적립
- 판매자 권한 신청 및 승인 흐름 내장
- 뱃지 시스템: 별도 테이블 없이 쉼표 구분 문자열로 단순 관리

---

### 2. PRODUCTS

> **엔티티:** `Product.java` | **DTO:** `ProductDto.java` | **Repository:** `ProductRepository`

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| seller | User (FK) | 판매자 (USERS.id 참조) |
| plantId | String(50) | MongoDB plants._id 참조 (식물 정보 연결) |
| name | String(100) | 상품명 |
| description | CLOB | 상품 설명 |
| imageUrl | String(500) | 대표 이미지 URL |
| price | BigDecimal | 판매가 |
| originalPrice | BigDecimal | 원가 (할인 전) |
| stockQuantity | Integer | 재고 수량 |
| category | String(30) | 카테고리 (식물/화분/비료 등) |
| productType | String(20) | 상품 유형 |
| isGroupBuy | Boolean | 공동구매 여부 |
| groupBuyCurrent | Integer | 공동구매 현재 참여자 수 |
| rating | BigDecimal(3,2) | 평균 평점 |
| reviewCount | Integer | 리뷰 수 |
| isActive | Boolean | 상품 노출 여부 |
| createdAt | LocalDateTime | 등록일 (자동) |

**핵심 기능:**
- MongoDB의 식물 정보(plantId)와 연결해 식물 상세 정보를 상품에 활용
- 공동구매 기능 내장 (isGroupBuy, groupBuyCurrent)
- 판매자별 상품 관리 (seller FK)

---

### 3. ORDERS

> **엔티티:** `Order.java` | **DTO:** `OrderDto.java` | **Repository:** `OrderRepository`

**통합된 원본 테이블:** `ORDERS` + `ORDER_ITEMS` + `PAYMENTS`
(단일 상품 주문을 전제로 3개 테이블 통합)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| user | User (FK) | 주문자 |
| orderNumber | String(30) (unique) | 주문 번호 |
| totalPrice | BigDecimal | 주문 총액 |
| status | String(20) | 주문 상태 (PENDING / PAID / SHIPPED / DELIVERED / CANCELLED) |
| deliveryAddress | String | 배송지 주소 |
| recipientName | String(30) | 수령인 이름 |
| recipientPhone | String(20) | 수령인 연락처 |
| product | Product (FK) | 주문 상품 |
| quantity | Integer | 수량 |
| unitPrice | BigDecimal | 주문 시점 단가 |
| pgTransactionId | String(100) | PG사 거래 ID |
| paymentMethod | String(20) | 결제 수단 (CARD / KAKAOPAY 등) |
| paymentStatus | String(20) | 결제 상태 (PENDING / PAID / REFUNDED) |
| paidAt | LocalDateTime | 결제 완료 시각 |
| orderedAt | LocalDateTime | 주문 시각 (자동) |
| updatedAt | LocalDateTime | 수정일 (자동) |

**핵심 기능:**
- 주문·결제 정보를 단일 레코드로 관리 (MVP 단계에서 단순화)
- 주문 상태와 결제 상태를 별도 필드로 분리해 추적 가능
- PG사 연동을 위한 pgTransactionId 보관

---

### 4. CART_ITEMS

> **엔티티:** `CartItem.java` | **DTO:** `CartItemDto.java` | **Repository:** `CartItemRepository`

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| user | User (FK) | 장바구니 소유자 |
| product | Product (FK) | 담은 상품 |
| quantity | Integer | 수량 |
| addedAt | LocalDateTime | 장바구니 추가 시각 |

**핵심 기능:**
- 사용자별 장바구니 관리
- 동일 상품을 여러 번 담으면 quantity 업데이트 방식으로 처리

---

### 5. POSTS

> **엔티티:** `Post.java` | **DTO:** `PostDto.java` | **Repository:** `PostRepository`

**통합된 원본 테이블:** `COMMUNITY_POSTS` + `NOTICES` + `LIKES`
(category 필드로 게시글 종류 구분, likeCount 카운터로 LIKES 테이블 대체)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| user | User (FK) | 작성자 |
| title | String(200) | 제목 |
| content | CLOB | 본문 내용 |
| category | String(30) | 게시판 종류 (COMMUNITY / NOTICE / QNA 등) |
| locationCity | String(50) | 지역 (도시 이름) |
| viewCount | Integer | 조회수 |
| likeCount | Integer | 좋아요 수 (카운터 방식) |
| isPinned | Boolean | 공지사항 상단 고정 여부 |
| tag | String(20) | 태그 |
| isActive | Boolean | 게시글 활성화 여부 (삭제 소프트 처리) |
| createdAt | LocalDateTime | 작성일 (자동) |
| updatedAt | LocalDateTime | 수정일 (자동) |

**핵심 기능:**
- 하나의 테이블로 커뮤니티 게시글 / 공지사항 / Q&A 모두 처리 (category로 구분)
- 좋아요: 별도 LIKES 테이블 없이 likeCount 정수 카운터로 단순화
- isPinned로 공지 상단 고정 지원
- isActive = false 처리로 소프트 삭제 구현

---

### 6. COMMENTS

> **엔티티:** `Comment.java` | **DTO:** `CommentDto.java` | **Repository:** `CommentRepository`

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| targetType | String(20) | 댓글 대상 타입 (POST / PRODUCT / DIARY 등) |
| targetId | Long | 대상 ID |
| user | User (FK) | 작성자 |
| parentCommentId | Long | 대댓글 부모 ID (null이면 최상위 댓글) |
| content | CLOB | 댓글 내용 |
| isActive | Boolean | 활성화 여부 (소프트 삭제) |
| createdAt | LocalDateTime | 작성일 (자동) |

**핵심 기능:**
- 게시글, 상품, 일기 등 여러 타겟에 범용으로 사용 가능 (targetType + targetId 조합)
- parentCommentId를 통한 대댓글(1단계) 지원

---

### 7. PLANT_CALENDARS

> **엔티티:** `PlantCalendar.java` | **DTO:** `PlantCalendarDto.java` | **Repository:** `PlantCalendarRepository`

**통합된 원본 테이블:** `PLANT_CALENDARS` + `GROWTH_DIARIES`
(식물 관리 일정과 성장 일기를 한 테이블에 통합)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| user | User (FK) | 소유자 |
| plantId | String(50) | MongoDB plants._id 참조 |
| plantNickname | String(50) | 사용자가 붙인 식물 별명 |
| wateringCycleDays | Integer | 물주기 주기 (일 단위) |
| wateringNextDate | LocalDate | 다음 물주기 날짜 |
| wateringIsDone | Boolean | 오늘 물주기 완료 여부 |
| repotDate | LocalDate | 분갈이 예정/완료 날짜 |
| fertilizeDate | LocalDate | 비료주기 날짜 |
| diaryMemo | CLOB | 성장 일기 메모 내용 |
| diaryImageUrl | String | 성장 일기 첨부 이미지 URL |
| diaryRecordedDate | LocalDate | 일기 기록 날짜 |
| createdAt | LocalDateTime | 생성일 (자동) |

**핵심 기능:**
- 식물 관리 알림 기능의 핵심 (물주기 주기·다음 날짜 자동 계산)
- MongoDB 식물 정보와 plantId로 연결
- 성장 일기: 사진 + 텍스트 메모를 함께 저장
- 사용자별 여러 식물 등록 가능

---

### 8. QUIZZES

> **엔티티:** `Quiz.java` | **DTO:** `QuizDto.java` | **Repository:** `QuizRepository`

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| question | String | 퀴즈 문제 |
| option1 | String | 보기 1 (필수) |
| option2 | String | 보기 2 (필수) |
| option3 | String | 보기 3 (선택) |
| option4 | String | 보기 4 (선택) |
| answerIdx | Integer | 정답 인덱스 (1~4) |
| explanation | CLOB | 해설 |
| rewardPoints | Integer | 정답 시 지급 포인트, 기본값 10 |

**핵심 기능:**
- 최대 4지선다 퀴즈 지원 (보기 3, 4는 선택)
- 정답 시 포인트 지급 (USERS.points와 연동)
- 오늘의 식물 퀴즈 기능의 데이터 소스

---

### 9. FESTIVALS

> **엔티티:** `Festival.java` | **DTO:** `FestivalDto.java` | **Repository:** `FestivalRepository`

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| name | String(100) | 축제명 |
| emoji | String(10) | 축제 대표 이모지 |
| region | String(50) | 개최 지역 |
| startDate | LocalDate | 축제 시작일 |
| endDate | LocalDate | 축제 종료일 |
| description | CLOB | 축제 설명 |
| bgColor | String(20) | 카드 배경색 (HEX 코드) |

**핵심 기능:**
- 전국 꽃 축제 정보 제공
- 시작일·종료일 기반으로 현재 진행 중 / 예정 필터링
- bgColor 필드로 프론트 카드 UI 색상 동적 지정

---

### 10. SUBSCRIPTIONS

> **엔티티:** `Subscription.java` | **DTO:** `SubscriptionDto.java` | **Repository:** `SubscriptionRepository`

**통합된 원본 테이블:** `SUBSCRIPTIONS` + `ANNIVERSARY_DELIVERIES`
(정기구독과 기념일 배송 기능 통합)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Long (PK) | 자동 증가 |
| user | User (FK) | 구독 사용자 |
| plan | String(20) | 구독 플랜 (BASIC / PREMIUM 등) |
| status | String(20) | 구독 상태 (ACTIVE / PAUSED / CANCELLED), 기본값 ACTIVE |
| nextDeliveryDate | LocalDate | 다음 배송 예정일 |
| deliveryAddress | String | 배송지 |
| recipientName | String(30) | 수령인 이름 (기념일 배송용) |
| anniversaryDate | LocalDate | 기념일 날짜 |
| handwrittenLetter | CLOB | 손편지 내용 |
| plantId | String(50) | MongoDB plants._id 참조 |
| subscribedAt | LocalDateTime | 구독 시작일 |
| updatedAt | LocalDateTime | 수정일 (자동) |

**핵심 기능:**
- 정기 배송 구독 관리 (플랜 종류, 배송 주기)
- 기념일 꽃다발 배송 기능 내장 (anniversaryDate, handwrittenLetter)
- MongoDB 식물 정보와 연결 (plantId)

---

## MongoDB 컬렉션 상세 (2개)

### 1. plants 컬렉션

> **도큐먼트:** `Plant.java` | **Repository:** `PlantRepository`

```
db.plants
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| _id | String (ObjectId) | MongoDB 자동 생성 ID |
| name | String | 식물 한국어 이름 |
| scientificName | String | 학명 |
| birthFlowerDate | String | 탄생화 날짜 (예: "3월 5일") |
| flowerLanguage | String | 꽃말 |
| isToxicToPets | Boolean | 반려동물 독성 여부 |
| careInfo | Map\<String, Object\> | 관리 정보 (물주기, 햇빛, 온도, 토양 등 유연한 구조) |
| commonDiseases | List\<Map\<String, Object\>\> | 주요 병해충 정보 목록 |
| tags | List\<String\> | 검색 태그 목록 (예: ["다육", "실내", "초보자"]) |
| companions | List\<String\> | 함께 키우면 좋은 식물 목록 |

**Repository 제공 쿼리:**
```java
List<Plant> findByNameContaining(String name);       // 이름 검색
List<Plant> findByTagsContaining(String tag);        // 태그 필터
List<Plant> findByIsToxicToPets(Boolean isToxic);   // 독성 여부 필터
```

**핵심 기능:**
- 식물도감 페이지의 핵심 데이터 소스
- `careInfo`를 `Map<String, Object>`로 설계해 식물마다 다른 관리 항목을 유연하게 저장
- `isToxicToPets` 필드로 반려동물 보호자 필터링 지원
- Oracle의 PRODUCTS, PLANT_CALENDARS, SUBSCRIPTIONS에서 plantId(ObjectId)로 참조됨

**현재 등록 식물 수:** 51종
(자체 관리 식물 DB — `ForestApiService.java`의 `ALL_PLANTS` 정적 배열로 관리)

---

### 2. plant_disease_diagnoses 컬렉션

> **도큐먼트:** `PlantDiseaseDiagnosis.java` | **Repository:** `PlantDiseaseDiagnosisRepository`

```
db.plant_disease_diagnoses
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| _id | String (ObjectId) | MongoDB 자동 생성 ID |
| userId | Long | Oracle USERS.id 참조 |
| plantId | String | MongoDB plants._id 참조 |
| imageUrl | String | 진단에 사용된 식물 사진 URL |
| aiResult | Map\<String, Object\> | AI 진단 결과 (병명, 확률, 심각도 등) |
| prescriptions | List\<Map\<String, Object\>\> | 처방 목록 (처치 방법, 약품 등) |
| diagnosedAt | LocalDateTime | 진단 수행 시각 |

**핵심 기능:**
- 식물 병해 AI 진단 이력 저장
- `aiResult`를 `Map<String, Object>`로 설계해 AI 모델 변경 시에도 응답 구조 유연하게 수용
- `prescriptions` 리스트로 복수의 처방 방법 저장 가능
- Oracle userId + MongoDB plantId 양쪽을 참조해 진단 맥락 보존
- 진단 이력 조회 → 마이페이지 병해 진단 내역에서 활용

---

## 아키텍처 요약 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                  Oracle XE DB                        │
│                                                     │
│  USERS ←── PRODUCTS ←── ORDERS                     │
│    │            │                                   │
│    ├── CART_ITEMS                                   │
│    ├── POSTS ←── COMMENTS                          │
│    ├── PLANT_CALENDARS ─────┐                      │
│    ├── SUBSCRIPTIONS ───────┼──→ MongoDB plantId   │
│    ├── QUIZZES              │                      │
│    └── FESTIVALS            │                      │
│                             │                      │
└─────────────────────────────┼──────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────┐
│                  MongoDB                             │
│                                                     │
│  plants  ←──────────────────┘                      │
│  plant_disease_diagnoses                            │
│      (userId → Oracle USERS.id 역참조)             │
└─────────────────────────────────────────────────────┘
```

---

## DTO 목록

각 DTO는 해당 엔티티와 1:1 대응하며, `static from(Entity e)` 팩토리 메서드를 통해 엔티티 → DTO 변환을 수행합니다.

| DTO 클래스 | 대응 엔티티 | 위치 |
|------------|-------------|------|
| UserDto | User | `dto/UserDto.java` |
| ProductDto | Product | `dto/ProductDto.java` |
| OrderDto | Order | `dto/OrderDto.java` |
| CartItemDto | CartItem | `dto/CartItemDto.java` |
| PostDto | Post | `dto/PostDto.java` |
| CommentDto | Comment | `dto/CommentDto.java` |
| PlantCalendarDto | PlantCalendar | `dto/PlantCalendarDto.java` |
| QuizDto | Quiz | `dto/QuizDto.java` |
| FestivalDto | Festival | `dto/FestivalDto.java` |
| SubscriptionDto | Subscription | `dto/SubscriptionDto.java` |

---

## 서비스·컨트롤러 구성 (참고)

**Service (10개):** AuthService, CartService, CommunityService, OrderService, MyPageService, PlantCalendarService, ProductService, QuizService, ForestApiService, PixabayService

**Controller (12개):** AuthController, CartController, CommunityController, NoticeController, OrderController, ProductController, PlantCalendarController, QuizController, MyPageController, ExternalApiController, FileUploadController, HealthController
