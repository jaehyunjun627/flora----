-- ====================================================
-- 꽃담(Kkotdam) 신규 테이블 생성 스크립트 (Oracle XE)
-- Spring Boot 서버 재시작 시 Hibernate가 자동 생성하지만,
-- 아래 SQL을 Oracle에서 수동 실행해도 됩니다.
-- ====================================================

-- 1. USERS 테이블 컬럼 추가 (기존 테이블에 신규 컬럼)
ALTER TABLE USERS ADD (profile_emoji VARCHAR2(10));
ALTER TABLE USERS ADD (points NUMBER DEFAULT 0);
ALTER TABLE USERS ADD (streak_days NUMBER DEFAULT 0);
ALTER TABLE USERS ADD (last_check_in DATE);

-- 2. 커뮤니티 게시글
CREATE TABLE COMMUNITY_POSTS (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     NUMBER NOT NULL REFERENCES USERS(id),
    title       VARCHAR2(200) NOT NULL,
    content     CLOB,
    category    VARCHAR2(30),
    location_city VARCHAR2(50),
    view_count  NUMBER DEFAULT 0,
    is_active   NUMBER(1) DEFAULT 1,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- 3. 댓글
CREATE TABLE COMMENTS (
    id               NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    target_type      VARCHAR2(20) NOT NULL,
    target_id        NUMBER NOT NULL,
    user_id          NUMBER NOT NULL REFERENCES USERS(id),
    parent_comment_id NUMBER,
    content          CLOB,
    is_active        NUMBER(1) DEFAULT 1,
    created_at       TIMESTAMP
);

-- 4. 좋아요
CREATE TABLE LIKES (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    target_type VARCHAR2(20) NOT NULL,
    target_id   NUMBER NOT NULL,
    user_id     NUMBER NOT NULL REFERENCES USERS(id),
    created_at  TIMESTAMP
);

-- 5. 공지사항
CREATE TABLE NOTICES (
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id   NUMBER REFERENCES USERS(id),
    title      VARCHAR2(200) NOT NULL,
    content    CLOB,
    tag        VARCHAR2(20),
    is_pinned  NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 6. 퀴즈
CREATE TABLE QUIZZES (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question      CLOB NOT NULL,
    answer        VARCHAR2(200) NOT NULL,
    explanation   CLOB,
    choice1       VARCHAR2(200),
    choice2       VARCHAR2(200),
    choice3       VARCHAR2(200),
    choice4       VARCHAR2(200),
    reward_points NUMBER DEFAULT 10,
    created_at    TIMESTAMP
);

-- 7. 퀴즈 답변
CREATE TABLE QUIZ_ANSWERS (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       NUMBER NOT NULL REFERENCES USERS(id),
    quiz_id       NUMBER NOT NULL REFERENCES QUIZZES(id),
    is_correct    NUMBER(1) DEFAULT 0,
    answered_date DATE,
    created_at    TIMESTAMP
);

-- 8. 뱃지
CREATE TABLE USER_BADGES (
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    NUMBER NOT NULL REFERENCES USERS(id),
    badge_code VARCHAR2(30),
    badge_name VARCHAR2(50),
    earned_at  TIMESTAMP
);

-- 9. 식물 캘린더
CREATE TABLE PLANT_CALENDARS (
    id                  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             NUMBER NOT NULL REFERENCES USERS(id),
    plant_id            VARCHAR2(50),
    plant_nickname      VARCHAR2(50),
    watering_cycle_days NUMBER,
    watering_next_date  DATE,
    watering_is_done    NUMBER(1) DEFAULT 0,
    repot_date          DATE,
    fertilize_date      DATE,
    created_at          TIMESTAMP
);

-- 10. 성장 일기
CREATE TABLE GROWTH_DIARIES (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calendar_id   NUMBER NOT NULL REFERENCES PLANT_CALENDARS(id),
    recorded_date DATE,
    memo          CLOB,
    image_url     VARCHAR2(500),
    created_at    TIMESTAMP
);
