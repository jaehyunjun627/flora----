# Flora (꽃담) 프로젝트 - 강의자료
## 사용된 모든 기술 개념 총정리

---

# 목차

1. [프로젝트 전체 구조](#1-프로젝트-전체-구조)
2. [백엔드 - Java / Spring Boot](#2-백엔드---java--spring-boot)
3. [데이터베이스 - Oracle + MongoDB](#3-데이터베이스---oracle--mongodb)
4. [보안 - Spring Security + JWT](#4-보안---spring-security--jwt)
   - 4-6. [Authentication 객체로 현재 사용자 얻기](#4-6-authentication-객체로-현재-사용자-얻기)
5. [프론트엔드 - React](#5-프론트엔드---react)
6. [HTTP 통신 - Axios](#6-http-통신---axios)
7. [빌드 도구 - Gradle / Vite](#7-빌드-도구---gradle--vite)
8. [외부 API 연동](#8-외부-api-연동)
9. [아키텍처 패턴 총정리](#9-아키텍처-패턴-총정리)

---

# 1. 프로젝트 전체 구조

## 1-1. 시스템 아키텍처

```
[사용자 브라우저]
      ↕  HTTP (port 5173)
[React 프론트엔드] ─── Vite 개발서버
      ↕  REST API / JSON (port 8080)
[Spring Boot 백엔드]
      ↕                    ↕
[Oracle DB]          [MongoDB]
(관계형 데이터)      (문서형 데이터)
      ↕
[외부 API: Pixabay, Forest API, OpenAI]
```

## 1-2. 폴더 구조 요약

```
flora----/
├── backend/                    ← Spring Boot 프로젝트
│   └── src/main/java/com/flora/backend/
│       ├── config/             ← 설정 클래스 (Security, JWT, DB 등)
│       ├── controller/         ← REST API 엔드포인트 (16개)
│       ├── service/            ← 비즈니스 로직 (17개)
│       ├── repository/
│       │   ├── jpa/            ← Oracle용 JPA 레포지토리 (14개)
│       │   └── mongo/          ← MongoDB 레포지토리 (3개)
│       ├── entity/             ← Oracle 테이블 매핑 클래스 (15개)
│       ├── document/           ← MongoDB 컬렉션 매핑 클래스 (3개)
│       └── dto/                ← 데이터 전송 객체 (12개)
│
└── frontend/kkotdam/           ← React 프로젝트
    └── src/
        ├── api/                ← Axios API 호출 모듈 (9개)
        ├── components/         ← 재사용 컴포넌트 (11개)
        ├── contexts/           ← React Context (전역 상태)
        └── pages/              ← 화면 페이지 (27개)
```

---

# 2. 백엔드 - Java / Spring Boot

## 2-1. Spring Boot란?

- **정의**: Java로 웹 서버를 만드는 프레임워크. 복잡한 설정 없이 빠르게 REST API 서버를 만들 수 있음
- **핵심 특징**: 내장 Tomcat 서버 포함 → jar 파일 하나로 실행 가능
- **이 프로젝트 버전**: Spring Boot 3.5.12 + Java 17

```java
// FloraBackendApplication.java - 시작점
@SpringBootApplication   // ← 이 어노테이션 하나로 Spring Boot 앱 시작
public class FloraBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FloraBackendApplication.class, args);
    }
}
```

---

## 2-2. MVC 패턴 (Model-View-Controller)

**흐름**: 요청 → Controller → Service → Repository → DB → 응답

```
HTTP 요청
   ↓
Controller     ← @RestController: URL 매핑, 요청/응답 처리
   ↓
Service        ← @Service: 비즈니스 로직 (실제 처리)
   ↓
Repository     ← @Repository: DB 접근
   ↓
Entity/Document ← DB 테이블/컬렉션과 1:1 매핑
```

### Controller 예시 개념
```java
@RestController              // REST API 컨트롤러 선언
@RequestMapping("/api/products")  // 기본 URL 경로
public class ProductController {

    @GetMapping             // GET /api/products
    public ResponseEntity<?> getProducts() { ... }

    @PostMapping            // POST /api/products
    public ResponseEntity<?> createProduct(@RequestBody ProductDto dto) { ... }

    @GetMapping("/{id}")    // GET /api/products/1
    public ResponseEntity<?> getProduct(@PathVariable Long id) { ... }

    @PutMapping("/{id}")    // PUT /api/products/1
    public ResponseEntity<?> updateProduct(@PathVariable Long id, ...) { ... }

    @DeleteMapping("/{id}") // DELETE /api/products/1
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) { ... }
}
```

### HTTP 메서드 의미
| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET    | 조회 | 상품 목록 가져오기 |
| POST   | 생성 | 새 상품 등록 |
| PUT    | 전체 수정 | 상품 전체 정보 수정 |
| PATCH  | 부분 수정 | 상품 재고만 수정 |
| DELETE | 삭제 | 상품 삭제 |

---

## 2-3. REST API 설계

- **REST**: URL로 자원(Resource)을 표현, HTTP 메서드로 행위를 표현하는 설계 방식
- **ResponseEntity**: HTTP 상태코드 + 응답 바디를 함께 반환하는 객체

```java
// 성공 응답 (200 OK)
return ResponseEntity.ok(data);

// 생성 성공 (201 Created)
return ResponseEntity.status(HttpStatus.CREATED).body(result);

// 클라이언트 오류 (400 Bad Request)
return ResponseEntity.badRequest().body("잘못된 요청");

// 인증 오류 (401 Unauthorized)
return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");

// 권한 오류 (403 Forbidden)
return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한 없음");

// 찾을 수 없음 (404 Not Found)
return ResponseEntity.notFound().build();
```

---

## 2-4. DTO (Data Transfer Object) 패턴

- **왜 필요한가?**: Entity(DB 테이블 매핑)를 그대로 외부에 노출하면 보안 문제 + 과도한 데이터 전송
- **DTO**: 필요한 데이터만 골라서 전달하는 전용 객체

```
[Client] ←── DTO ──→ [Controller] ←── Entity ──→ [DB]
              (필요한 필드만)        (DB 테이블 구조)
```

```java
// 나쁜 예: Entity 직접 반환 (비밀번호 같은 민감정보 노출 위험)
public User getUser() { return userRepository.findById(1L); }

// 좋은 예: DTO로 필요한 것만 반환
public UserDto getUser() {
    User user = userRepository.findById(1L);
    return new UserDto(user.getId(), user.getNickname(), user.getEmail());
    // 비밀번호는 포함하지 않음!
}
```

---

## 2-5. JPA (Java Persistence API) & Hibernate

- **JPA**: Java에서 DB 테이블을 객체(클래스)로 다루는 표준 스펙
- **Hibernate**: JPA를 실제로 구현한 라이브러리 (SQL을 자동 생성)

### Entity 클래스 (DB 테이블 ↔ Java 클래스)
```java
@Entity                    // 이 클래스는 DB 테이블이다
@Table(name = "products")  // 테이블명 지정
public class Product {

    @Id                    // 기본 키(Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 자동 증가
    private Long id;

    @Column(nullable = false)  // NOT NULL 컬럼
    private String name;

    @ManyToOne             // 관계: 여러 상품 → 하나의 판매자
    @JoinColumn(name = "seller_id")
    private User seller;
}
```

### 테이블 관계 어노테이션
| 어노테이션 | 의미 | 예시 |
|-----------|------|------|
| @OneToMany | 1:N | 주문 1개 → 주문아이템 여러개 |
| @ManyToOne | N:1 | 주문아이템 여러개 → 주문 1개 |
| @OneToOne  | 1:1 | 사용자 1명 → 프로필 1개 |
| @ManyToMany| N:M | 상품 ↔ 태그 |

### 실제 적용 예시 - 주문과 주문아이템 (1:N 관계)

장바구니에 상품 3개를 담고 주문하면 → `Order` 1개 + `OrderItem` 3개가 생성됩니다.

```java
// Order.java - 주문 (1)
@Entity
public class Order {
    @Id @GeneratedValue
    private Long id;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    // cascade: Order 저장/삭제 시 OrderItem도 함께 처리
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalPrice;  // 전체 합계
}

// OrderItem.java - 주문 아이템 (N)
@Entity
public class OrderItem {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")  // FK: ORDER_ITEMS.order_id → ORDERS.id
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
    private BigDecimal unitPrice;
}
```

**왜 이렇게 설계하나?**
- 주문 1개에 여러 상품을 담을 수 있음
- 주문 취소 시 `cascade`로 OrderItem도 자동 삭제
- 상품별 수량/단가를 각각 기록 → 추후 환불/부분취소 가능

### JPA Repository (SQL 없이 DB 조회)
```java
// interface만 선언하면 Spring이 구현체 자동 생성
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 메서드 이름만으로 쿼리 자동 생성!
    List<Product> findByCategory(String category);
    List<Product> findByPriceLessThan(int price);
    Page<Product> findAll(Pageable pageable);  // 페이징 처리

    // 직접 쿼리 작성 (복잡한 경우)
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword%")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
}
```

---

## 2-6. Spring Data MongoDB

- **언제 씀?**: 구조가 자주 바뀌는 데이터, 중첩 구조의 복잡한 데이터
- **이 프로젝트에서**: 식물 상세 정보(태그, 질병, 동반식물 등 복잡한 구조)

```java
@Document(collection = "plants")  // MongoDB 컬렉션 매핑
public class Plant {
    @Id
    private String id;             // MongoDB는 String ObjectId 사용
    private String name;
    private List<String> tags;     // 배열 그대로 저장 가능
    private Map<String, Object> careInfo;  // 유연한 구조
}

// JPA Repository와 같은 방식으로 사용
public interface PlantRepository extends MongoRepository<Plant, String> {
    List<Plant> findByNameContaining(String keyword);
}
```

---

## 2-7. 페이징(Pagination)

- **왜 필요?**: 상품 1000개를 한번에 전송하면 느리고 비효율적
- **해결**: 한 번에 일정 개수씩 나눠서 전달

```java
// Controller
@GetMapping
public ResponseEntity<?> getProducts(
    @RequestParam(defaultValue = "0") int page,   // 현재 페이지
    @RequestParam(defaultValue = "10") int size   // 페이지당 항목 수
) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Product> products = productService.getProducts(pageable);
    return ResponseEntity.ok(products);
}

// 응답 구조
{
  "content": [...],     // 실제 데이터
  "totalPages": 5,      // 전체 페이지 수
  "totalElements": 47,  // 전체 항목 수
  "number": 0           // 현재 페이지
}
```

---

## 2-8. 파일 업로드

```java
@PostMapping("/upload")
public ResponseEntity<?> uploadFile(
    @RequestParam("file") MultipartFile file   // 업로드된 파일
) {
    // 파일 크기/타입 검증
    if (file.getSize() > 5 * 1024 * 1024) {   // 5MB 초과
        return ResponseEntity.badRequest().body("파일 크기 초과");
    }
    if (!file.getContentType().startsWith("image/")) {  // 이미지만
        return ResponseEntity.badRequest().body("이미지만 가능");
    }

    // UUID로 고유한 파일명 생성 (중복 방지)
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    Path path = Paths.get("uploads/" + fileName);
    Files.copy(file.getInputStream(), path);

    return ResponseEntity.ok("/uploads/" + fileName);
}
```

---

## 2-9. 전역 예외 처리

- **@ControllerAdvice**: 모든 컨트롤러에서 발생하는 예외를 한 곳에서 처리

```java
@RestControllerAdvice   // 모든 컨트롤러의 예외를 여기서 처리
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(403).body("권한이 없습니다");
    }
}
```

---

## 2-10. @Transactional (트랜잭션)

- **트랜잭션**: "전부 성공하거나, 전부 실패하거나" — 중간 상태가 없어야 하는 DB 작업 묶음
- **왜 필요한가?**: 주문 처리처럼 여러 DB 작업이 하나의 흐름으로 묶여야 할 때

```java
// @Transactional 없을 때의 위험
public void createOrder() {
    재고확인();       // ✅ 성공
    주문저장();       // ✅ 성공
    재고차감();       // ❌ 오류 발생!
    장바구니삭제();   // 실행 안 됨
    // 결과: 주문은 저장됐는데 재고는 안 깎임 → 데이터 불일치
}

// @Transactional 있을 때
@Transactional
public void createOrder() {
    재고확인();       // ✅ 성공
    주문저장();       // ✅ 성공
    재고차감();       // ❌ 오류 발생!
    // → 위에서 성공한 "주문저장"도 자동 롤백 → DB 원상복구
}
```

### readOnly 옵션
```java
// 조회만 하는 메서드: readOnly=true로 성능 최적화
@Transactional(readOnly = true)
public List<ProductDto> getProducts() {
    // DB에 변경이 없으므로 변경감지(Dirty Checking) 생략 → 빠름
    return productRepository.findAll();
}

// 데이터 변경이 있는 메서드: readOnly 없이
@Transactional
public ProductDto createProduct(ProductDto dto) {
    Product saved = productRepository.save(...);
    return ProductDto.from(saved);
}
```

### 이 프로젝트에서의 패턴
```java
@Service
@Transactional(readOnly = true)   // 클래스 기본값: 조회용
public class OrderService {

    // 조회 메서드 → 기본값(readOnly=true) 적용
    public List<OrderDto> getMyOrders(Long userId) { ... }

    @Transactional   // 변경 메서드만 별도 선언 (readOnly 덮어씀)
    public OrderDto createOrder(...) { ... }

    @Transactional
    public OrderDto cancelOrder(...) { ... }
}
```

---

## 2-11. @Valid + Bean Validation (입력값 검증)

- **목적**: 잘못된 데이터가 서비스 로직까지 들어오기 전에 걸러내기
- **동작**: DTO 필드에 규칙 선언 → Controller에서 `@Valid` 하나로 자동 검증

```java
// ProductDto.java - 필드에 규칙 선언
public class ProductDto {

    @NotBlank(message = "상품명은 필수입니다")
    @Size(min = 2, max = 100, message = "상품명은 2~100자 사이여야 합니다")
    private String name;

    @NotNull(message = "가격은 필수입니다")
    @Positive(message = "가격은 0보다 커야 합니다")
    private BigDecimal price;

    @Min(value = 0, message = "재고는 음수일 수 없습니다")
    private Integer stockQuantity;

    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}
```

```java
// Controller - @Valid 하나로 위 규칙 전부 자동 검증
@PostMapping
public ResponseEntity<?> createProduct(
    @Valid @RequestBody ProductDto dto   // ← 규칙 위반 시 자동으로 400 반환
) {
    return ResponseEntity.ok(productService.create(dto));
}
```

### 검증 실패 시 흐름
```
클라이언트가 price: -1 전송
      ↓
@Valid가 @Positive 위반 감지
      ↓
MethodArgumentNotValidException 발생
      ↓
GlobalExceptionHandler가 잡아서
      ↓
{ "success": false, "message": "가격은 0보다 커야 합니다" } 반환 (400)
```

### 주요 검증 어노테이션
| 어노테이션 | 검증 내용 |
|-----------|----------|
| `@NotNull` | null 불허 |
| `@NotBlank` | null, 빈 문자열, 공백 불허 |
| `@Size(min, max)` | 문자열 길이 범위 |
| `@Email` | 이메일 형식 |
| `@Positive` | 양수만 허용 |
| `@Min(n)` / `@Max(n)` | 최솟값 / 최댓값 |

---

## 2-12. ApiResponse\<T\> 공통 응답 래퍼

- **문제**: API마다 응답 형태가 다르면 프론트가 매번 다르게 처리해야 함
- **해결**: 모든 응답을 동일한 구조로 감싸기

```java
// ApiResponse.java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;          // 제네릭: 어떤 타입이든 담을 수 있음
    private String error;
    private long timestamp;
}
```

```java
// 성공 응답
ApiResponse.success("상품 등록 완료", productDto)
// → { "success": true, "message": "상품 등록 완료", "data": {...}, "timestamp": 17136... }

// 실패 응답
ApiResponse.error("가격은 0보다 커야 합니다")
// → { "success": false, "error": "가격은 0보다 커야 합니다", "data": null, "timestamp": 17136... }
```

```javascript
// 프론트엔드에서 통일된 처리
const response = await productApi.create(data);
if (response.success) {
    // 성공 처리
    console.log(response.data);   // 실제 데이터
} else {
    // 실패 처리
    alert(response.error);        // 에러 메시지
}
```

**장점**: 프론트가 `response.success`만 보면 성공/실패 판단 가능. 오류 메시지 형식 통일.

---

## 2-14. Lombok

- **목적**: 반복되는 getter/setter/생성자 코드를 어노테이션으로 자동 생성

```java
@Getter              // 모든 필드의 getter 자동 생성
@Setter              // 모든 필드의 setter 자동 생성
@NoArgsConstructor   // 기본 생성자 자동 생성
@AllArgsConstructor  // 모든 필드 포함 생성자 자동 생성
@Builder             // 빌더 패턴 자동 생성
@ToString            // toString() 자동 생성
public class ProductDto {
    private Long id;
    private String name;
    private int price;
}

// Builder 패턴 사용 예시
ProductDto dto = ProductDto.builder()
    .id(1L)
    .name("장미")
    .price(15000)
    .build();
```

---

## 2-15. CORS (Cross-Origin Resource Sharing)

- **문제**: 프론트(5173 포트)에서 백엔드(8080 포트)로 요청하면 브라우저가 차단
- **해결**: 백엔드에서 허용된 출처(Origin)를 명시적으로 설정

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")           // API 경로
            .allowedOrigins(
                "http://localhost:5173",         // Vite 개발서버
                "http://localhost:3000"          // React 개발서버
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true);             // 쿠키/인증 허용
    }
}
```

---

# 3. 데이터베이스 - Oracle + MongoDB

## 3-1. 이중 DB 전략 (Polyglot Persistence)

| 구분 | Oracle (관계형) | MongoDB (문서형) |
|------|----------------|-----------------|
| 저장 | 테이블, 행, 열 | 컬렉션, 도큐먼트 |
| 구조 | 고정 스키마 | 유연한 스키마 |
| 관계 | JOIN으로 연결 | 중첩 구조로 포함 |
| 이 프로젝트 | 사용자, 주문, 상품, 게시글 | 식물 상세정보, 진단기록 |

### 왜 두 가지를 같이 쓰나?
```
Oracle에 저장하기 좋은 데이터:
  - 사용자 정보 (고정된 구조)
  - 주문/결제 (정확성, 트랜잭션 중요)
  - 게시글/댓글 (관계형 쿼리 필요)

MongoDB에 저장하기 좋은 데이터:
  - 식물 정보 (학명, 태그, 질병목록, 동반식물... 구조가 식물마다 다름)
  - 진단 기록 (이미지, AI 응답 등 자유 형식)
```

---

## 3-2. Oracle 연결 설정

```yaml
# application.yml
spring:
  datasource:
    url: ${DB_URL:jdbc:oracle:thin:@localhost:1521/XEPDB1}   # 환경변수 우선, 없으면 기본값(로컬)
    username: ${DB_USERNAME:system}
    password: ${DB_PASSWORD:12345}                           # 배포 시 반드시 환경변수로 교체
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    hibernate:
      ddl-auto: update   # Entity 변경 시 테이블 자동 수정
    show-sql: true       # 실행되는 SQL 콘솔에 출력
```

> **주의**: 로컬 개발에서는 기본값이 적용되지만, 배포 환경에서는 반드시 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` 환경변수를 설정해야 합니다. 기본값이 코드에 남아있어도 실제 배포 서버에서는 환경변수가 우선 적용됩니다.

---

## 3-3. Spring Profile (환경별 설정 분리)

- **문제**: 개발할 때와 배포할 때 설정이 달라야 함 (DB 주소, SQL 로그, DDL 정책 등)
- **해결**: Profile로 환경을 나눠 설정 파일을 분리

```
application.yml          ← 공통 설정 (항상 적용)
application-dev.yml      ← 개발환경 전용 설정
application-prod.yml     ← 운영환경 전용 설정
```

```yaml
# application-dev.yml (개발용)
spring:
  jpa:
    hibernate:
      ddl-auto: update    # Entity 바뀌면 테이블 자동 수정
    show-sql: true        # 실행 SQL을 콘솔에 출력
logging:
  level:
    com.flora.backend: DEBUG  # 디버그 로그 전부 출력
```

```yaml
# application-prod.yml (배포용)
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # 테이블 구조만 검증 (자동 수정 안 함)
    show-sql: false       # SQL 미출력 (성능 + 보안)
logging:
  level:
    com.flora.backend: WARN   # 경고/오류만 출력
```

### Profile 전환 방법
```bash
# 개발: 환경변수로 지정
SPRING_PROFILES_ACTIVE=dev

# 배포: prod로 변경
SPRING_PROFILES_ACTIVE=prod

# application.yml에서 기본값 지정 (환경변수 없으면 dev 적용)
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
```

### ddl-auto 옵션 차이
| 값 | 동작 | 사용 시점 |
|----|------|----------|
| `update` | Entity 변경 시 테이블 자동 수정 | 개발 중 |
| `validate` | DB 스키마가 Entity와 맞는지 확인만 | 배포 |
| `create` | 시작할 때 테이블 새로 생성 (기존 데이터 삭제!) | 초기 개발 |
| `none` | 아무것도 안 함 | 직접 관리할 때 |

---

## 3-4. HikariCP (커넥션 풀)

- **문제**: DB 연결(Connection) 생성은 비용이 큼. 요청마다 새로 만들면 느림
- **해결**: 미리 여러 연결을 만들어 풀(Pool)에 보관, 필요할 때 빌려쓰고 반납

```
요청1 ─┐
요청2 ─┼─→ [Connection Pool] ←→ Oracle DB
요청3 ─┘      (10개 유지)
```

---

# 4. 보안 - Spring Security + JWT

## 4-1. 인증 vs 인가

| 구분 | 인증 (Authentication) | 인가 (Authorization) |
|------|----------------------|---------------------|
| 질문 | "당신이 누구입니까?" | "당신이 이걸 할 수 있습니까?" |
| 방법 | 로그인 (ID/PW 확인) | 권한 확인 (ROLE 체크) |
| 예시 | 로그인 성공 | SELLER만 상품 등록 가능 |

---

## 4-2. JWT (JSON Web Token)

- **기존 방식 (세션)**: 서버가 로그인 상태를 메모리에 저장 → 서버 확장 어려움
- **JWT 방식**: 토큰에 사용자 정보를 담아서 클라이언트가 보관 → 서버는 무상태(Stateless)

### JWT 구조
```
eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOjF9  .  SflKxwRJSMeKKF2QT4fwpMeJf
       ↑                          ↑                      ↑
   Header                      Payload                Signature
  (알고리즘 정보)            (사용자 정보)             (위조 방지 서명)
```

### JWT 흐름
```
1. 로그인 요청 (ID/PW)
         ↓
2. 서버: ID/PW 검증 후 JWT 토큰 발급
         ↓
3. 클라이언트: localStorage에 토큰 저장
         ↓
4. 이후 API 요청 시 헤더에 토큰 첨부
   Authorization: Bearer eyJhbGci...
         ↓
5. 서버: 토큰 검증 → 사용자 확인 → 요청 처리
```

### JwtTokenProvider (토큰 생성/검증)
```java
@Component
public class JwtTokenProvider {

    private final String SECRET_KEY = "FloraSecretKey2026...";
    private final long EXPIRATION = 86400000; // 24시간 (밀리초)

    // 토큰 생성
    public String generateToken(Long userId, String role) {
        return Jwts.builder()
            .claim("userId", userId)
            .claim("role", role)
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
            .signWith(getSigningKey())   // 서명 (위조 방지)
            .compact();
    }

    // 토큰에서 사용자 ID 추출
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claims.get("userId", Long.class);
    }
}
```

---

## 4-3. JwtAuthenticationFilter (필터)

- 모든 HTTP 요청이 Controller에 도달하기 전에 토큰을 검증하는 관문

```
HTTP 요청
    ↓
JwtAuthenticationFilter  ← 토큰 확인 (없으면 401)
    ↓
SecurityContext에 사용자 정보 저장
    ↓
Controller 실행
```

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // 1. 헤더에서 토큰 추출
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);  // "Bearer " 제거

            // 2. 토큰 검증
            if (jwtTokenProvider.validateToken(token)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);

                // 3. SecurityContext에 사용자 정보 저장
                // → 이후 어디서든 현재 사용자 정보 접근 가능
                UsernamePasswordAuthenticationToken auth = ...;
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);  // 다음 단계로 전달
    }
}
```

---

## 4-4. Spring Security 설정

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())           // REST API는 CSRF 불필요
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // 세션 미사용
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()          // 로그인/회원가입은 누구나
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()  // 상품 조회는 누구나
                .requestMatchers("/api/admin/**").hasRole("ADMIN")    // 관리자만
                .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")  // 판매자, 관리자
                .anyRequest().authenticated()                         // 나머지는 로그인 필요
            )
            .addFilterBefore(jwtAuthenticationFilter, ...);           // JWT 필터 등록
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // 비밀번호 해시 암호화
    }
}
```

---

## 4-5. Authentication 객체로 현재 사용자 얻기

- **목적**: "지금 이 요청을 보낸 사람이 누구인가?" → Controller에서 꺼내 쓰는 방법
- **흐름**: JWT 토큰 → `JwtAuthenticationFilter` → `SecurityContext` → `Authentication`

```
HTTP 요청 (Authorization: Bearer eyJ...)
         ↓
JwtAuthenticationFilter
  - 토큰 파싱 → userId=5 추출
  - Authentication 객체 생성 → SecurityContext에 저장
         ↓
Controller 메서드
  - Authentication 파라미터로 자동 주입
  - getPrincipal() → userId=5
```

```java
// Controller에서 현재 로그인 사용자 ID 얻기
@PostMapping
public ResponseEntity<?> createProduct(
    @RequestBody ProductDto dto,
    Authentication authentication   // Spring이 자동으로 주입
) {
    Long userId = (Long) authentication.getPrincipal();  // JWT에서 추출한 userId
    return ResponseEntity.ok(productService.create(dto, userId));
}

// 또는 @AuthenticationPrincipal 어노테이션으로도 가능
@GetMapping("/me")
public ResponseEntity<?> getMyInfo(
    @AuthenticationPrincipal Long userId  // 더 간결한 방법
) {
    return ResponseEntity.ok(authService.getUser(userId));
}
```

### 실제 코드 흐름 연결
```java
// 1. JwtAuthenticationFilter.java - 토큰 파싱 후 SecurityContext 저장
Long userId = jwtTokenProvider.getUserIdFromToken(token);
UsernamePasswordAuthenticationToken auth =
    new UsernamePasswordAuthenticationToken(userId, null, authorities);
SecurityContextHolder.getContext().setAuthentication(auth);
// → Principal = userId (Long 타입)

// 2. ProductController.java - SecurityContext에서 꺼내 씀
Long userId = (Long) authentication.getPrincipal();
productService.createProduct(dto, userId);

// 3. ProductService.java - userId로 DB 조회
User seller = userRepository.findById(userId)
    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
```

---

## 4-6. BCrypt 비밀번호 암호화

- **원칙**: 비밀번호는 절대 평문으로 저장하면 안됨
- **BCrypt**: 단방향 해시 함수 → 원문 복원 불가, Salt 자동 적용

```java
// 회원가입 시: 비밀번호 암호화 후 저장
String rawPassword = "myPassword123";
String encoded = passwordEncoder.encode(rawPassword);
// encoded = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// 로그인 시: 입력값과 저장된 해시 비교
boolean matches = passwordEncoder.matches(rawPassword, encoded); // true
```

---

# 5. 프론트엔드 - React

## 5-1. React란?

- **정의**: Facebook이 만든 UI 라이브러리. 컴포넌트 단위로 화면을 구성
- **핵심 개념**: 상태(State) 변경 → 자동으로 화면 재렌더링

---

## 5-2. 컴포넌트 (Component)

- UI를 독립적인 재사용 가능한 조각으로 나누는 단위

```jsx
// 재사용 가능한 버튼 컴포넌트
// components/Button.jsx
function Button({ text, onClick, variant = "primary" }) {
    return (
        <button className={`btn btn-${variant}`} onClick={onClick}>
            {text}
        </button>
    );
}

// 사용 (어디서든 재사용)
<Button text="구매하기" onClick={handleBuy} />
<Button text="취소" onClick={handleCancel} variant="secondary" />
```

---

## 5-3. useState (상태 관리)

- **상태(State)**: 컴포넌트 내부에서 변하는 데이터. 변경되면 화면이 자동으로 다시 그려짐

```jsx
import { useState } from 'react';

function CartPage() {
    const [items, setItems] = useState([]);        // 장바구니 목록
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [count, setCount] = useState(0);         // 수량

    // 상태 변경 → 화면 자동 업데이트
    const addItem = (product) => {
        setItems([...items, product]);  // 새 배열로 교체
    };

    return (
        <div>
            <p>총 {items.length}개</p>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}
```

---

## 5-4. useEffect (사이드 이펙트)

- **목적**: 컴포넌트가 렌더링될 때 실행할 작업 (API 호출, 구독, 타이머 등)

```jsx
import { useState, useEffect } from 'react';

function ProductListPage() {
    const [products, setProducts] = useState([]);

    // 컴포넌트 첫 마운트 시 실행 ([] = 의존성 없음)
    useEffect(() => {
        const fetchProducts = async () => {
            const data = await productApi.getProducts();
            setProducts(data);
        };
        fetchProducts();
    }, []);  // ← 빈 배열: 최초 1회만 실행

    // category가 바뀔 때마다 재실행
    useEffect(() => {
        fetchProductsByCategory(category);
    }, [category]);  // ← category 변경 시 재실행
}
```

---

## 5-5. React Router (라우팅)

- **목적**: URL에 따라 다른 컴포넌트(페이지)를 보여줌
- **SPA (Single Page Application)**: 페이지 전환 시 새로고침 없이 컴포넌트만 교체

```jsx
// App.jsx - 라우팅 설정
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />  {/* 동적 파라미터 */}
                <Route path="/cart" element={<CartPage />} />
            </Routes>
        </BrowserRouter>
    );
}
```

```jsx
// 페이지 이동
import { useNavigate, useParams, Link } from 'react-router-dom';

function ProductDetailPage() {
    const { id } = useParams();          // URL의 :id 값 가져오기
    const navigate = useNavigate();      // 프로그래밍 방식 이동

    return (
        <div>
            <Link to="/products">목록으로</Link>   {/* 링크 */}
            <button onClick={() => navigate('/cart')}>장바구니</button>
        </div>
    );
}
```

---

## 5-6. Context API (전역 상태 관리)

- **문제**: 로그인 정보를 모든 컴포넌트가 필요 → Props로 계속 내려주면 복잡함 (Props Drilling)
- **해결**: Context로 전역 상태 공유 → 어느 컴포넌트에서든 직접 접근

```jsx
// contexts/AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);      // 로그인한 사용자
    const [token, setToken] = useState(
        localStorage.getItem('token')            // localStorage에서 복원
    );

    const login = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);
        localStorage.setItem('token', tokenValue);  // 저장
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');           // 삭제
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 어느 컴포넌트에서든 사용
function Header() {
    const { user, logout } = useContext(AuthContext);
    return <div>{user ? `${user.nickname}님` : '로그인'}</div>;
}
```

---

## 5-7. 조건부 렌더링

```jsx
function ProductCard({ product, isLoggedIn }) {
    return (
        <div>
            <h3>{product.name}</h3>

            {/* 조건부 렌더링 방법 1: && 연산자 */}
            {isLoggedIn && <button>장바구니 담기</button>}

            {/* 조건부 렌더링 방법 2: 삼항 연산자 */}
            {product.stock > 0
                ? <span className="in-stock">구매가능</span>
                : <span className="out-of-stock">품절</span>
            }

            {/* 조건부 렌더링 방법 3: if문 */}
            {loading ? <Spinner /> : <ProductList />}
        </div>
    );
}
```

---

## 5-8. 리스트 렌더링

```jsx
function ProductListPage() {
    const [products, setProducts] = useState([]);

    return (
        <div>
            {products.map(product => (
                // key는 필수! React가 리스트 항목을 구분하는데 사용
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

---

## 5-9. 폼 처리 (Controlled Component)

```jsx
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();  // 페이지 새로고침 방지!

        try {
            const result = await authApi.login({ email, password });
            login(result.user, result.token);
            navigate('/');
        } catch (error) {
            alert('로그인 실패: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}                        // React가 값 제어
                onChange={(e) => setEmail(e.target.value)}  // 변경 시 상태 업데이트
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">로그인</button>
        </form>
    );
}
```

---

# 6. HTTP 통신 - Axios

## 6-1. Axios 기본 설정

```javascript
// api/index.js - Axios 인스턴스 생성
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',          // 모든 요청의 기본 URL
    timeout: 10000,           // 10초 타임아웃
});

// 요청 인터셉터: 모든 요청 전에 실행
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // 토큰 자동 첨부
    }
    return config;
});

// 응답 인터셉터: 모든 응답 후에 실행
api.interceptors.response.use(
    (response) => response,     // 성공 시 그대로 반환
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');   // 토큰 만료 시 삭제
            window.location.href = '/login';    // 로그인 페이지로 이동
        }
        return Promise.reject(error);
    }
);

export default api;
```

## 6-2. API 모듈화

```javascript
// api/productApi.js
import api from './index';

export const productApi = {
    // 상품 목록 조회 (쿼리 파라미터)
    getProducts: (page = 0, category = '') =>
        api.get('/products', { params: { page, category } })
           .then(res => res.data),

    // 상품 상세 조회
    getProduct: (id) =>
        api.get(`/products/${id}`).then(res => res.data),

    // 상품 등록 (multipart/form-data - 이미지 포함)
    createProduct: (formData) =>
        api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),

    // 상품 수정
    updateProduct: (id, data) =>
        api.put(`/products/${id}`, data).then(res => res.data),

    // 상품 삭제
    deleteProduct: (id) =>
        api.delete(`/products/${id}`).then(res => res.data),
};
```

---

## 6-3. async/await

- **문제**: API 호출은 비동기(시간이 걸림). 결과를 기다리지 않으면 undefined 반환
- **해결**: async/await로 비동기 코드를 동기처럼 작성

```javascript
// 콜백 방식 (구식, 복잡)
api.get('/products').then(res => {
    api.get(`/products/${res.data[0].id}`).then(detail => {
        // 콜백 지옥...
    });
});

// async/await 방식 (현대적, 깔끔)
async function loadData() {
    try {
        const products = await api.get('/products');          // 기다림
        const detail = await api.get(`/products/${products.data[0].id}`);  // 기다림
        return detail.data;
    } catch (error) {
        console.error('오류:', error.message);
    }
}
```

---

# 7. 빌드 도구 - Gradle / Vite

## 7-1. Gradle (백엔드 빌드 도구)

```groovy
// build.gradle - 프로젝트 설정 및 의존성 관리
dependencies {
    // Spring Boot 기본 웹 (REST API)
    implementation 'org.springframework.boot:spring-boot-starter-web'

    // JPA (Oracle DB 연동)
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // MongoDB 연동
    implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'

    // Spring Security (인증/인가)
    implementation 'org.springframework.boot:spring-boot-starter-security'

    // JWT 라이브러리
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'

    // Lombok (코드 자동 생성)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

### Gradle 주요 명령어
```bash
./gradlew bootRun    # 개발 서버 실행
./gradlew build      # 빌드 (jar 파일 생성)
./gradlew test       # 테스트 실행
./gradlew clean      # 빌드 결과물 삭제
```

---

## 7-2. Vite (프론트엔드 빌드 도구)

- **이전**: Webpack (느림) → **현재**: Vite (매우 빠름)
- **HMR (Hot Module Replacement)**: 코드 수정 시 페이지 새로고침 없이 즉시 반영

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // /api로 시작하는 요청을 백엔드로 전달 (CORS 우회)
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            // 이미지 파일도 백엔드에서 서빙
            '/uploads': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    }
});
```

**Proxy의 역할**: 프론트(5173) → `/api/products` 요청 → Vite가 백엔드(8080)로 전달 → 브라우저는 같은 출처로 인식 (CORS 문제 없음)

---

# 8. 외부 API 연동

## 8-1. Pixabay API (이미지 검색)

```java
@Service
public class PixabayService {

    @Value("${pixabay.api.key}")  // application.yml에서 키 주입
    private String apiKey;

    public List<String> searchImages(String keyword) {
        String url = "https://pixabay.com/api/?key=" + apiKey
                   + "&q=" + URLEncoder.encode(keyword, "UTF-8")
                   + "&image_type=photo";

        // RestTemplate으로 외부 API 호출
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        List<Map<String, Object>> hits = (List) response.get("hits");
        return hits.stream()
            .map(hit -> (String) hit.get("webformatURL"))
            .collect(Collectors.toList());
    }
}
```

## 8-2. OpenAI API (식물 질병 진단)

```java
@Service
public class OpenAiService {

    public String diagnosePlant(String imageBase64) {
        // GPT-4o-mini에게 이미지 분석 요청
        // 프롬프트: "이 식물의 상태를 분석하고 질병 여부를 알려주세요"
        // 응답: 진단 결과 텍스트 반환
    }
}
```

## 8-3. 외부 API 사용 시 주의사항

```yaml
# application.yml - API 키는 코드에 하드코딩 금지!
external:
  pixabay:
    api-key: ${PIXABAY_API_KEY:}    # 환경변수 없으면 빈 문자열 (앱 시작은 됨, 기능만 비활성)
  forest:
    api-key: ${FOREST_API_KEY:}
  openai:
    api-key: ${OPENAI_API_KEY:}

# 실제 배포 시 환경변수 설정:
# PIXABAY_API_KEY=실제키값
# FOREST_API_KEY=실제키값
# OPENAI_API_KEY=실제키값
```

> **핵심 원칙**: `${환경변수명:기본값}` 형식에서 `:` 뒤를 비워두면(`:`만 있으면) 환경변수 미설정 시 빈 문자열로 처리되어 앱이 시작됩니다. 기본값을 아예 안 쓰면(`${PIXABAY_API_KEY}`) 환경변수 없을 때 앱 자체가 실행되지 않으니 주의합니다.

---

# 9. 아키텍처 패턴 총정리

## 9-1. 레이어드 아키텍처 (Layered Architecture)

```
┌──────────────────────────────────────┐
│  Controller Layer (프레젠테이션 계층)   │  ← HTTP 요청/응답, 입력 검증
├──────────────────────────────────────┤
│  Service Layer (비즈니스 로직 계층)     │  ← 핵심 비즈니스 규칙 처리
├──────────────────────────────────────┤
│  Repository Layer (데이터 접근 계층)    │  ← DB CRUD 작업
├──────────────────────────────────────┤
│  Entity/Document (데이터 모델)          │  ← DB 테이블/컬렉션 매핑
└──────────────────────────────────────┘
```

**각 계층의 책임**:
- **Controller**: "어떤 URL에서 무슨 데이터를 받고 반환할까?"
- **Service**: "실제 비즈니스 로직은 어떻게 처리할까? (재고 확인, 권한 확인 등)"
- **Repository**: "DB에서 어떻게 조회/저장할까?"

---

## 9-2. 이 프로젝트의 전체 기술 스택 정리

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **백엔드 언어** | Java | 17 LTS | 서버 프로그래밍 |
| **백엔드 프레임워크** | Spring Boot | 3.5.12 | REST API 서버 |
| **ORM** | Spring Data JPA (Hibernate) | - | Oracle DB 연동 |
| **NoSQL** | Spring Data MongoDB | - | MongoDB 연동 |
| **보안** | Spring Security + JWT | - | 인증/인가 |
| **비밀번호 암호화** | BCrypt | - | 단방향 해시 |
| **코드 단순화** | Lombok | - | Getter/Setter 자동 생성 |
| **빌드 도구(백)** | Gradle | 8.x | 의존성 관리, 빌드 |
| **관계형 DB** | Oracle 21c XE | - | 사용자/주문/상품 등 |
| **문서형 DB** | MongoDB | - | 식물정보/진단기록 |
| **프론트 언어** | JavaScript (ES6+) | - | UI 프로그래밍 |
| **UI 프레임워크** | React | 19.2.4 | 컴포넌트 기반 UI |
| **라우팅** | React Router DOM | 7.13.1 | SPA 라우팅 |
| **HTTP 클라이언트** | Axios | 1.13.6 | REST API 호출 |
| **전역 상태** | React Context API | - | 로그인 상태 관리 |
| **빌드 도구(프론트)** | Vite | 8.0.1 | 개발서버, 번들링 |
| **외부 API** | Pixabay | - | 식물 이미지 검색 |
| **외부 API** | Forest API | - | 국가표준식물목록 |
| **외부 API** | OpenAI gpt-4o-mini | - | 식물 질병 진단 AI |

---

## 9-3. 데이터 흐름 전체 예시 - "상품 구매" 시나리오

```
1. 사용자가 [구매하기] 버튼 클릭
         ↓
2. [React] handleBuy() 호출
         ↓
3. [Axios] POST /api/orders
   Headers: { Authorization: "Bearer eyJ..." }
   Body: { productId: 1, quantity: 2, address: "서울..." }
         ↓
4. [Vite Proxy] → http://localhost:8080/api/orders 로 전달
         ↓
5. [JwtAuthenticationFilter] 토큰 검증 → userId=1 확인
         ↓
6. [OrderController] @PostMapping 실행
         ↓
7. [OrderService] 비즈니스 로직:
   - 상품 재고 확인 (ProductRepository)
   - 주문 생성 (OrderRepository.save())
   - 장바구니 아이템 → OrderItem 변환 저장 (cascade로 자동 INSERT)
   - 재고 차감, 장바구니 비우기 (CartRepository)
         ↓
8. [Oracle DB] INSERT INTO orders ... / INSERT INTO order_items ...
         ↓
9. [Controller] ResponseEntity.ok(orderDto) 반환
         ↓
10. [React] 응답 받아 주문완료 페이지로 이동
```

---

*이 강의자료는 Flora(꽃담) 프로젝트 코드 기반으로 작성되었습니다.*
*2026년 4월 기준*
