-- =============================================
-- Flora 마이페이지 Oracle DDL 초기화 스크립트
-- =============================================

-- 기존 테이블 삭제 (역순 - FK 의존성 고려)
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE plant_card CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE user_badges CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE user_mission_log CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE attendance CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE calendar_events CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE plants CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE special_missions CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE missions CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE badges CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE level_config CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- =============================================
-- 1. USERS (사용자)
-- =============================================
CREATE TABLE users (
    user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR2(50)  NOT NULL,
    email         VARCHAR2(100) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    profile_image VARCHAR2(500),
    current_points NUMBER(10) DEFAULT 0 NOT NULL,
    current_level  NUMBER(3)  DEFAULT 1 NOT NULL,
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- =============================================
-- 2. LEVEL_CONFIG (레벨 설정)
-- =============================================
CREATE TABLE level_config (
    level_id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level_num           NUMBER(3)    NOT NULL UNIQUE,
    level_name          VARCHAR2(50) NOT NULL,
    min_points          NUMBER(10)   NOT NULL,
    max_points          NUMBER(10)   NOT NULL,
    benefit_description VARCHAR2(500),
    discount_rate       NUMBER(5,2) DEFAULT 0  -- 할인율(%)
);

-- =============================================
-- 3. PLANTS (사용자 식물)
-- =============================================
CREATE TABLE plants (
    plant_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id            NUMBER        NOT NULL,
    plant_name         VARCHAR2(100) NOT NULL,   -- 식물 종류명 (ex. 몬스테라)
    nickname           VARCHAR2(100),             -- 사용자 지정 애칭
    plant_type         VARCHAR2(50),              -- 분류 (다육, 관엽, 허브 등)
    image_url          VARCHAR2(500),
    status             VARCHAR2(20) DEFAULT 'HEALTHY'
                       CHECK (status IN ('HEALTHY','NEEDS_WATER','NEEDS_REPOTTING','SICK','DORMANT')),
    watering_interval  NUMBER(3) DEFAULT 7,       -- AI 권장 물주기 주기(일)
    repotting_interval NUMBER(3) DEFAULT 180,     -- AI 권장 분갈이 주기(일)
    last_watered_date  DATE,
    last_repotted_date DATE,
    added_date         DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_plants_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- 4. CALENDAR_EVENTS (캘린더 일정 - AI 배정)
-- =============================================
CREATE TABLE calendar_events (
    event_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      NUMBER        NOT NULL,
    plant_id     NUMBER,                          -- NULL 가능 (사용자 직접 등록)
    event_type   VARCHAR2(20)  NOT NULL
                 CHECK (event_type IN ('WATERING','REPOTTING','FERTILIZING','PRUNING','CHECKUP','CUSTOM')),
    event_title  VARCHAR2(200) NOT NULL,
    event_date   DATE          NOT NULL,
    is_completed NUMBER(1) DEFAULT 0 CHECK (is_completed IN (0,1)),
    completed_at TIMESTAMP,
    notes        VARCHAR2(1000),
    is_ai_generated NUMBER(1) DEFAULT 0 CHECK (is_ai_generated IN (0,1)),
    created_at   TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_events_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_events_plant FOREIGN KEY (plant_id) REFERENCES plants(plant_id) ON DELETE SET NULL
);

-- =============================================
-- 5. ATTENDANCE (출석 기록)
-- =============================================
CREATE TABLE attendance (
    attendance_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER NOT NULL,
    attendance_date DATE   NOT NULL,
    points_earned   NUMBER(5) DEFAULT 10,
    created_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uq_attendance UNIQUE (user_id, attendance_date),
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- 6. MISSIONS (기본 고정 미션)
-- =============================================
CREATE TABLE missions (
    mission_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mission_type VARCHAR2(20) NOT NULL CHECK (mission_type IN ('BASIC','SPECIAL')),
    title        VARCHAR2(200) NOT NULL,
    description  VARCHAR2(500),
    points       NUMBER(5) DEFAULT 20,
    icon         VARCHAR2(100),
    sort_order   NUMBER(3) DEFAULT 0,
    is_active    NUMBER(1) DEFAULT 1 CHECK (is_active IN (0,1))
);

-- =============================================
-- 7. SPECIAL_MISSIONS (매일 바뀌는 특별 미션 풀)
-- =============================================
CREATE TABLE special_missions (
    special_mission_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title              VARCHAR2(200) NOT NULL,
    description        VARCHAR2(500),
    points             NUMBER(5) DEFAULT 30,
    icon               VARCHAR2(100),
    day_index          NUMBER(3) NOT NULL UNIQUE  -- 0~N: 날짜 기반 순환 인덱스
);

-- =============================================
-- 8. USER_MISSION_LOG (미션 완료 기록)
-- =============================================
CREATE TABLE user_mission_log (
    log_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER      NOT NULL,
    mission_id     NUMBER,                  -- MISSIONS FK (기본미션)
    special_mission_id NUMBER,             -- SPECIAL_MISSIONS FK (특별미션)
    completed_date DATE DEFAULT SYSDATE NOT NULL,
    points_earned  NUMBER(5) DEFAULT 0,
    CONSTRAINT fk_log_user    FOREIGN KEY (user_id)    REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_log_mission FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE SET NULL,
    CONSTRAINT fk_log_special FOREIGN KEY (special_mission_id) REFERENCES special_missions(special_mission_id) ON DELETE SET NULL
);

-- =============================================
-- 9. BADGES (뱃지 정의)
-- =============================================
CREATE TABLE badges (
    badge_id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    badge_name            VARCHAR2(100) NOT NULL,
    badge_icon            VARCHAR2(500),            -- 아이콘 경로 또는 이모지
    description           VARCHAR2(500),
    badge_category        VARCHAR2(50)
                          CHECK (badge_category IN ('ATTENDANCE','MISSION','PLANT','LEVEL','SPECIAL')),
    required_condition    VARCHAR2(500),             -- 획득 조건 설명
    required_value        NUMBER(10) DEFAULT 1,      -- 조건 수치 (ex. 출석 30일)
    sort_order            NUMBER(3) DEFAULT 0
);

-- =============================================
-- 10. USER_BADGES (사용자 획득 뱃지)
-- =============================================
CREATE TABLE user_badges (
    user_badge_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER NOT NULL,
    badge_id       NUMBER NOT NULL,
    earned_date    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    is_selected    NUMBER(1) DEFAULT 0 CHECK (is_selected IN (0,1)),  -- 명함 대표 뱃지
    CONSTRAINT uq_user_badge  UNIQUE (user_id, badge_id),
    CONSTRAINT fk_ub_user     FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge    FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE
);

-- =============================================
-- 11. PLANT_CARD (식물명함 설정)
-- =============================================
CREATE TABLE plant_card (
    card_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          NUMBER       NOT NULL UNIQUE,
    selected_badge_id NUMBER,                       -- 명함에 표시할 뱃지
    card_color       VARCHAR2(20) DEFAULT '#4CAF50', -- 배경색 hex
    share_link_token VARCHAR2(100) UNIQUE,           -- 공유 링크 토큰
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_pc_user  FOREIGN KEY (user_id)           REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_pc_badge FOREIGN KEY (selected_badge_id) REFERENCES badges(badge_id) ON DELETE SET NULL
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX idx_plants_user       ON plants(user_id);
CREATE INDEX idx_events_user_date  ON calendar_events(user_id, event_date);
CREATE INDEX idx_events_plant      ON calendar_events(plant_id);
CREATE INDEX idx_attendance_user   ON attendance(user_id, attendance_date);
CREATE INDEX idx_mission_log_user  ON user_mission_log(user_id, completed_date);
CREATE INDEX idx_user_badges_user  ON user_badges(user_id);

-- =============================================
-- 기본 데이터 삽입
-- =============================================

-- 레벨 설정 (1~10레벨)
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (1, '새싹',        0,    499,  '가입 환영! 식물 일지 작성 기능 해금', 0);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (2, '초록이',      500,  1199, '식물 구매 3% 할인 쿠폰 지급', 3);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (3, '잎새',        1200, 2499, '식물 구매 5% 할인 + 무료 배송 쿠폰', 5);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (4, '가지',        2500, 4499, '식물 구매 7% 할인 + 월 1회 무료 분갈이 상담', 7);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (5, '꽃봉오리',    4500, 7499, '식물 구매 10% 할인 + 프리미엄 식물 조기 접근', 10);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (6, '만개한 꽃',   7500, 11499,'식물 구매 12% 할인 + 월간 케어 키트 50% 할인', 12);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (7, '열매',        11500,16999,'식물 구매 15% 할인 + VIP 식물 상담 서비스', 15);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (8, '고목',        17000,23999,'식물 구매 18% 할인 + 한정판 식물 선구매 권한', 18);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (9, '숲의 수호자', 24000,31999,'식물 구매 20% 할인 + 맞춤 식물 케어 플랜 제공', 20);
INSERT INTO level_config (level_num, level_name, min_points, max_points, benefit_description, discount_rate)
VALUES (10,'전설의 정원사',32000,9999999,'식물 구매 25% 할인 + 모든 혜택 + 명예의 전당 등재', 25);

-- 기본 미션 (고정)
INSERT INTO missions (mission_type, title, description, points, icon, sort_order)
VALUES ('BASIC', '캘린더 일정 체크',
        '캘린더를 눌러 오늘 일정과 다가오는 일정을 확인하세요.',
        20, '📅', 1);
INSERT INTO missions (mission_type, title, description, points, icon, sort_order)
VALUES ('BASIC', '식물 퀴즈 풀기',
        '메인 화면의 오늘의 식물 퀴즈를 풀어보세요.',
        20, '🌿', 2);

-- 특별 미션 풀 (매일 순환)
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('기르는 식물 상태 확인하기', '오늘 기르는 식물들의 상태를 직접 확인하고 기록해보세요.', 30, '🌱', 0);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('식물 사진 업로드하기', '기르는 식물의 오늘 모습을 사진으로 남겨보세요.', 30, '📷', 1);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('이웃 식물 구경하기', '다른 식물 집사의 식물을 구경하고 좋아요를 눌러보세요.', 30, '👀', 2);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('식물 일기 작성하기', '오늘 식물과 있었던 일을 짧게 기록해보세요.', 30, '📝', 3);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('물주기 완료 체크하기', '오늘 물을 준 식물의 캘린더 일정을 완료 처리해보세요.', 30, '💧', 4);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('식물 이름 맞추기 챌린지', '오늘의 식물 이름 맞추기 챌린지에 참여해보세요.', 30, '🎯', 5);
INSERT INTO special_missions (title, description, points, icon, day_index)
VALUES ('식물 케어 팁 읽기', '오늘의 식물 케어 팁을 읽고 내 식물에 적용해보세요.', 30, '💡', 6);

-- 뱃지 정의
-- 출석 관련
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('첫 발걸음', '🌱', '처음으로 출석 체크를 했어요!', 'ATTENDANCE', '출석 1일 달성', 1, 1);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('일주일 집사', '🌿', '7일 연속 출석했어요!', 'ATTENDANCE', '7일 연속 출석', 7, 2);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('한달 집사', '🌳', '30일 출석을 달성했어요!', 'ATTENDANCE', '누적 출석 30일', 30, 3);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('100일의 기적', '🏆', '100일 출석을 달성한 전설!', 'ATTENDANCE', '누적 출석 100일', 100, 4);

-- 식물 관련
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('첫 식물 등록', '🪴', '첫 번째 식물을 등록했어요!', 'PLANT', '식물 1개 등록', 1, 5);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('작은 정원', '🌻', '식물을 5개 이상 기르고 있어요!', 'PLANT', '식물 5개 이상 보유', 5, 6);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('식물 집사', '🌺', '식물을 10개 이상 기르는 집사!', 'PLANT', '식물 10개 이상 보유', 10, 7);

-- 미션 관련
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('미션 입문자', '⭐', '처음으로 미션을 완료했어요!', 'MISSION', '미션 1회 완료', 1, 8);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('미션 마스터', '🌟', '미션을 50회 이상 완료했어요!', 'MISSION', '미션 50회 완료', 50, 9);

-- 레벨 관련
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('레벨5 달성', '🥈', '레벨 5 꽃봉오리에 도달했어요!', 'LEVEL', '레벨 5 달성', 5, 10);
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('전설의 정원사', '👑', '최고 레벨 10에 도달한 전설!', 'LEVEL', '레벨 10 달성', 10, 11);

-- 특별 뱃지
INSERT INTO badges (badge_name, badge_icon, description, badge_category, required_condition, required_value, sort_order)
VALUES ('얼리버드', '🐦', '서비스 초기에 가입한 특별 멤버!', 'SPECIAL', '베타 기간 가입', 1, 12);

COMMIT;
