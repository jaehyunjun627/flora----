-- ====================================================
-- 꽃담(Kkotdam) 더미 데이터 삽입 스크립트
-- Oracle SQL Developer에서 실행하세요
-- 순서 중요: USERS → PRODUCTS → COMMUNITY_POSTS → NOTICES
-- ====================================================

-- ============================================================
-- 1. 유저 (비밀번호 전부 'password123' BCrypt 해시)
-- ============================================================
INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('admin@flora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '꽃담관리자', 'ADMIN', 1, 500, 30, '🛡️', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('seller1@flora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '초록마켓', 'SELLER', 1, 200, 15, '🌿', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('seller2@flora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '꽃길농원', 'SELLER', 1, 180, 10, '🌸', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('user1@flora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '식물러버', 'USER', 1, 120, 7, '🌱', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('user2@flora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '화분수집가', 'USER', 1, 80, 3, '🪴', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================
-- 2. 상품 (seller_id는 위에서 생성된 USERS의 id 참조)
--    Oracle IDENTITY는 1부터 시작 가정 — 실제 id 확인 후 맞춰주세요
--    SELECT id, nickname FROM USERS WHERE role IN ('SELLER','ADMIN');
-- ============================================================
INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '몬스테라 델리시오사', '열대 분위기의 대형 잎이 특징인 인기 관엽식물입니다. 반음지에서도 잘 자라며 공기 정화 효과가 뛰어납니다.', 28000, 35000, 30, '식물', 'PLANT', 0, 4.5, 24, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '산세베리아 (스투키)', '공기 정화 식물의 대명사. 물을 자주 주지 않아도 잘 자라 초보자에게 추천합니다.', 15000, 18000, 50, '식물', 'PLANT', 0, 4.7, 38, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '스투키 미니 화분세트', '귀여운 미니 사이즈 스투키 3개 세트. 책상 위 인테리어로 딱 좋습니다.', 22000, 27000, 20, '식물', 'PLANT', 0, 4.3, 12, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (3, '빨간 장미 꽃다발 (10송이)', '싱싱한 빨간 장미 10송이 꽃다발. 기념일, 생일 선물로 인기 최고입니다.', 35000, 42000, 15, '꽃', 'FLOWER', 0, 4.8, 56, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (3, '혼합 튤립 꽃다발 (15송이)', '봄의 기운을 담은 알록달록 튤립 꽃다발. 노랑, 분홍, 보라 혼합입니다.', 29000, 35000, 25, '꽃', 'FLOWER', 0, 4.6, 31, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (3, '수국 단품 (1줄기)', '풍성한 꽃송이가 매력적인 수국. 파스텔톤 색상이 인테리어와 잘 어울립니다.', 8000, 10000, 40, '꽃', 'FLOWER', 0, 4.4, 19, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '테라코타 화분 (중형)', '통기성이 좋은 이탈리안 테라코타 화분. 지름 18cm, 관엽식물에 적합합니다.', 12000, 15000, 60, '화분/소품', 'POT', 0, 4.2, 8, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '세라믹 화분 세트 (3종)', '미니멀 디자인의 흰색 세라믹 화분 3종 세트. 소형 다육식물에 최적입니다.', 18000, 22000, 35, '화분/소품', 'POT', 0, 4.5, 14, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (3, '식물 영양제 (앰플 10개입)', '식물 생장 촉진 고농축 앰플. 물 줄 때 1개씩 꽂아주면 됩니다.', 9500, 12000, 80, '비료/토양', 'SUPPLY', 0, 4.1, 22, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (3, '배합 분갈이 흙 (5L)', '펄라이트, 코코피트, 부엽토 최적 배합. 대부분의 실내식물에 바로 사용 가능합니다.', 7000, 9000, 100, '비료/토양', 'SUPPLY', 0, 4.6, 45, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '스테인리스 물조리개 (1L)', '긴 주둥이로 좁은 화분에도 물주기 편한 스테인리스 조리개. 녹슬지 않아 오래 사용 가능합니다.', 16500, 20000, 25, '원예도구', 'TOOL', 0, 4.3, 9, 1, CURRENT_TIMESTAMP);

INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, rating, review_count, is_active, created_at)
VALUES (2, '원예 가위 세트 (3종)', '전정가위, 적심가위, 미니 가위 3종 세트. 초보 가드너를 위한 입문 세트입니다.', 13000, 16000, 40, '원예도구', 'TOOL', 0, 4.4, 17, 1, CURRENT_TIMESTAMP);

-- 단체구매 상품
INSERT INTO PRODUCTS (seller_id, name, description, price, original_price, stock_quantity, category, product_type, is_group_buy, group_buy_current, rating, review_count, is_active, created_at)
VALUES (3, '[단체구매] 프리미엄 장미 꽃다발 (20송이)', '20명 이상 모이면 특가로 드립니다! 프리미엄 장미 20송이 대형 꽃다발.', 45000, 65000, 50, '꽃', 'FLOWER', 1, 8, 4.9, 3, 1, CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================
-- 3. 커뮤니티 게시글
-- ============================================================
INSERT INTO COMMUNITY_POSTS (user_id, title, content, category, view_count, is_active, created_at, updated_at)
VALUES (4, '몬스테라 잎이 노랗게 변해요 ㅠㅠ', '구매한지 2주 됐는데 아랫잎부터 노랗게 변하고 있어요. 물은 일주일에 한번 주는데 뭐가 문제일까요?', '질문', 42, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO COMMUNITY_POSTS (user_id, title, content, category, view_count, is_active, created_at, updated_at)
VALUES (5, '베란다 텃밭 시작했어요!', '올봄에 처음으로 베란다 텃밭 도전했습니다. 상추, 바질, 방울토마토 심었는데 잘 자라고 있어요 ㅎㅎ 같이 텃밭 하시는 분 계신가요?', '자유', 87, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO COMMUNITY_POSTS (user_id, title, content, category, view_count, is_active, created_at, updated_at)
VALUES (4, '공기정화 식물 추천해주세요', '새집으로 이사했는데 공기정화 효과 좋은 식물 추천 부탁드려요. 반려동물(고양이)이 있어서 독성 없는 걸로요!', '질문', 63, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO COMMUNITY_POSTS (user_id, title, content, category, view_count, is_active, created_at, updated_at)
VALUES (5, '다육이 분갈이 성공!', '처음으로 다육이 분갈이 해봤어요. 뿌리가 엄청 건강하더라고요. 배합토는 꽃담 마켓에서 산 거 썼는데 추천드립니다!', '자유', 34, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO COMMUNITY_POSTS (user_id, title, content, category, view_count, is_active, created_at, updated_at)
VALUES (4, '선인장도 죽이는 저도 키울 수 있는 식물?', '식물 키우기 재능이 없어서 선인장도 말린 적 있는 저도 살릴 수 있는 식물이 있을까요? ㅜ', '질문', 119, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================
-- 4. 공지사항
-- ============================================================
INSERT INTO NOTICES (admin_id, title, content, tag, is_pinned, created_at, updated_at)
VALUES (1, '꽃담 서비스 오픈 안내', '안녕하세요, 꽃담입니다! 식물과 꽃을 사랑하는 모든 분들을 위한 플랫폼을 오픈했습니다. 많은 이용 부탁드립니다.', '공지', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO NOTICES (admin_id, title, content, tag, is_pinned, created_at, updated_at)
VALUES (1, '5월 정기구독 이벤트 안내', '5월 한 달간 정기구독 신청 시 첫 달 20% 할인 혜택을 드립니다. 지금 바로 신청하세요!', '이벤트', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO NOTICES (admin_id, title, content, tag, is_pinned, created_at, updated_at)
VALUES (1, '배송 지연 안내 (4월 30일)', '물류 사정으로 인해 4월 30일 주문 건은 배송이 1-2일 지연될 수 있습니다. 양해 부탁드립니다.', '안내', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================
-- 확인 쿼리
-- ============================================================
SELECT '유저' AS 구분, COUNT(*) AS 건수 FROM USERS
UNION ALL
SELECT '상품', COUNT(*) FROM PRODUCTS
UNION ALL
SELECT '게시글', COUNT(*) FROM COMMUNITY_POSTS
UNION ALL
SELECT '공지사항', COUNT(*) FROM NOTICES;
