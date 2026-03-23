-- ================================================
--  꽃담(Flora) Oracle DDL
--  DB  : Oracle XE (21c / 18c)
--  연결 : jdbc:oracle:thin:@localhost:1521:XE
--  계정 : system / 12345
-- ================================================

-- ------------------------------------------------
-- 0. 기존 테이블 제거 (재실행 대비, 역순 삭제)
-- ------------------------------------------------
BEGIN
    FOR t IN (
        SELECT table_name FROM user_tables
        WHERE table_name IN (
            'MISSION_LOG','MEMBER_BADGE','POINT_LOG',
            'PLANT_SCHEDULE','PLANT','BADGE','ATTENDANCE','MEMBER'
        )
    ) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- ------------------------------------------------
-- 1. MEMBER (회원)
-- ------------------------------------------------
CREATE TABLE MEMBER (
    MEMBER_ID   NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME    VARCHAR2(50)    NOT NULL UNIQUE,
    PASSWORD    VARCHAR2(255)   NOT NULL,
    EMAIL       VARCHAR2(100)   NOT NULL UNIQUE,
    NAME        VARCHAR2(50),
    CREATED_AT  DATE            DEFAULT SYSDATE NOT NULL
);

COMMENT ON TABLE  MEMBER              IS '회원';
COMMENT ON COLUMN MEMBER.MEMBER_ID   IS '회원 PK';
COMMENT ON COLUMN MEMBER.USERNAME    IS '로그인 아이디';
COMMENT ON COLUMN MEMBER.PASSWORD    IS '암호화된 비밀번호';
COMMENT ON COLUMN MEMBER.EMAIL       IS '이메일';
COMMENT ON COLUMN MEMBER.NAME        IS '이름(닉네임)';
COMMENT ON COLUMN MEMBER.CREATED_AT  IS '가입일';

-- ------------------------------------------------
-- 2. PLANT (식물)
-- ------------------------------------------------
CREATE TABLE PLANT (
    PLANT_ID        NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MEMBER_ID       NUMBER          NOT NULL,
    PLANT_NAME      VARCHAR2(100)   NOT NULL,
    NICKNAME        VARCHAR2(100),
    PLANT_TYPE      VARCHAR2(50),           -- 관엽식물, 다육식물, 허브 등
    CREATED_AT      DATE            DEFAULT SYSDATE NOT NULL,

    CONSTRAINT FK_PLANT_MEMBER FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE
);

COMMENT ON TABLE  PLANT                IS '회원이 키우는 식물';
COMMENT ON COLUMN PLANT.PLANT_ID      IS '식물 PK';
COMMENT ON COLUMN PLANT.MEMBER_ID     IS '회원 FK';
COMMENT ON COLUMN PLANT.PLANT_NAME    IS '식물 이름';
COMMENT ON COLUMN PLANT.NICKNAME      IS '식물 애칭';
COMMENT ON COLUMN PLANT.PLANT_TYPE    IS '식물 종류';

-- ------------------------------------------------
-- 3. PLANT_SCHEDULE (식물 케어 일정 / 캘린더)
-- ------------------------------------------------
CREATE TABLE PLANT_SCHEDULE (
    SCHEDULE_ID     NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PLANT_ID        NUMBER          NOT NULL,
    MEMBER_ID       NUMBER          NOT NULL,
    SCHEDULE_TYPE   VARCHAR2(20)    NOT NULL,   -- WATERING, REPOTTING, FERTILIZING, PRUNING, CHECKUP, CUSTOM
    TITLE           VARCHAR2(200)   NOT NULL,
    SCHEDULE_DATE   DATE            NOT NULL,
    IS_COMPLETED    NUMBER(1)       DEFAULT 0 NOT NULL,   -- 0: 미완료, 1: 완료
    IS_AI_GENERATED NUMBER(1)       DEFAULT 0 NOT NULL,   -- 0: 직접입력, 1: AI생성
    CREATED_AT      DATE            DEFAULT SYSDATE NOT NULL,

    CONSTRAINT FK_SCHEDULE_PLANT  FOREIGN KEY (PLANT_ID)
        REFERENCES PLANT(PLANT_ID) ON DELETE CASCADE,
    CONSTRAINT FK_SCHEDULE_MEMBER FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE,
    CONSTRAINT CK_SCHEDULE_TYPE CHECK (
        SCHEDULE_TYPE IN ('WATERING','REPOTTING','FERTILIZING','PRUNING','CHECKUP','CUSTOM')
    ),
    CONSTRAINT CK_SCHEDULE_COMPLETED CHECK (IS_COMPLETED IN (0,1)),
    CONSTRAINT CK_SCHEDULE_AI       CHECK (IS_AI_GENERATED IN (0,1))
);

COMMENT ON TABLE  PLANT_SCHEDULE                   IS '식물 케어 일정 (캘린더)';
COMMENT ON COLUMN PLANT_SCHEDULE.SCHEDULE_TYPE    IS '일정 유형: WATERING/REPOTTING/FERTILIZING/PRUNING/CHECKUP/CUSTOM';
COMMENT ON COLUMN PLANT_SCHEDULE.IS_COMPLETED     IS '완료 여부 (0:미완료 1:완료)';
COMMENT ON COLUMN PLANT_SCHEDULE.IS_AI_GENERATED  IS 'AI 자동생성 여부';

-- ------------------------------------------------
-- 4. ATTENDANCE (출석 기록)
-- ------------------------------------------------
CREATE TABLE ATTENDANCE (
    ATTENDANCE_ID   NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MEMBER_ID       NUMBER  NOT NULL,
    ATTEND_DATE     DATE    NOT NULL,

    CONSTRAINT FK_ATTEND_MEMBER  FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_ATTEND_DATE    UNIQUE (MEMBER_ID, ATTEND_DATE)  -- 하루 1회
);

COMMENT ON TABLE  ATTENDANCE                 IS '출석 기록';
COMMENT ON COLUMN ATTENDANCE.ATTEND_DATE    IS '출석 날짜 (시간 제외, TRUNC 처리 권장)';

-- ------------------------------------------------
-- 5. MISSION_LOG (출석 미션 완료 기록)
-- ------------------------------------------------
CREATE TABLE MISSION_LOG (
    MISSION_LOG_ID  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MEMBER_ID       NUMBER          NOT NULL,
    MISSION_DATE    DATE            NOT NULL,
    MISSION_ID      VARCHAR2(20)    NOT NULL,   -- 'calendar', 'quiz', 'special'
    COMPLETED_AT    DATE            DEFAULT SYSDATE NOT NULL,

    CONSTRAINT FK_MISSION_MEMBER FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_MISSION_DAY    UNIQUE (MEMBER_ID, MISSION_DATE, MISSION_ID)
);

COMMENT ON TABLE  MISSION_LOG                  IS '오늘의 출석 미션 완료 기록';
COMMENT ON COLUMN MISSION_LOG.MISSION_DATE    IS '미션 수행 날짜';
COMMENT ON COLUMN MISSION_LOG.MISSION_ID      IS '미션 구분: calendar / quiz / special';

-- ------------------------------------------------
-- 6. BADGE (뱃지 마스터)
-- ------------------------------------------------
CREATE TABLE BADGE (
    BADGE_ID        NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    BADGE_KEY       VARCHAR2(50)    NOT NULL UNIQUE,  -- 코드성 키 (예: plant_beginner)
    BADGE_NAME      VARCHAR2(100)   NOT NULL,
    BADGE_ICON      VARCHAR2(10),                      -- 이모지
    DESCRIPTION     VARCHAR2(500),
    CONDITION_DESC  VARCHAR2(200)                      -- 획득 조건 설명
);

COMMENT ON TABLE  BADGE                    IS '뱃지 마스터';
COMMENT ON COLUMN BADGE.BADGE_KEY         IS '뱃지 코드 키';
COMMENT ON COLUMN BADGE.BADGE_ICON        IS '이모지 아이콘';
COMMENT ON COLUMN BADGE.CONDITION_DESC    IS '획득 조건 설명';

-- ------------------------------------------------
-- 7. MEMBER_BADGE (회원 획득 뱃지)
-- ------------------------------------------------
CREATE TABLE MEMBER_BADGE (
    MEMBER_BADGE_ID NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MEMBER_ID       NUMBER  NOT NULL,
    BADGE_ID        NUMBER  NOT NULL,
    EARNED_AT       DATE    DEFAULT SYSDATE NOT NULL,
    IS_EQUIPPED     NUMBER(1) DEFAULT 0 NOT NULL,   -- 1: 명함에 장착

    CONSTRAINT FK_MB_MEMBER  FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE,
    CONSTRAINT FK_MB_BADGE   FOREIGN KEY (BADGE_ID)
        REFERENCES BADGE(BADGE_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_MB         UNIQUE (MEMBER_ID, BADGE_ID),
    CONSTRAINT CK_MB_EQUIP   CHECK (IS_EQUIPPED IN (0,1))
);

COMMENT ON TABLE  MEMBER_BADGE                IS '회원이 획득한 뱃지';
COMMENT ON COLUMN MEMBER_BADGE.IS_EQUIPPED   IS '명함 장착 여부 (0:미장착 1:장착)';

-- ------------------------------------------------
-- 8. POINT_LOG (포인트 적립/사용 내역)
-- ------------------------------------------------
CREATE TABLE POINT_LOG (
    POINT_LOG_ID    NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MEMBER_ID       NUMBER          NOT NULL,
    POINT_TYPE      VARCHAR2(20)    NOT NULL,   -- EARN / USE
    AMOUNT          NUMBER          NOT NULL,
    REASON          VARCHAR2(200),              -- 적립/사용 사유
    CREATED_AT      DATE            DEFAULT SYSDATE NOT NULL,

    CONSTRAINT FK_POINT_MEMBER  FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER(MEMBER_ID) ON DELETE CASCADE,
    CONSTRAINT CK_POINT_TYPE    CHECK (POINT_TYPE IN ('EARN','USE')),
    CONSTRAINT CK_POINT_AMOUNT  CHECK (AMOUNT > 0)
);

COMMENT ON TABLE  POINT_LOG               IS '포인트 적립/사용 내역';
COMMENT ON COLUMN POINT_LOG.POINT_TYPE   IS 'EARN: 적립, USE: 사용';
COMMENT ON COLUMN POINT_LOG.AMOUNT       IS '포인트 양 (항상 양수, 타입으로 방향 구분)';

-- ================================================
--  인덱스
-- ================================================
CREATE INDEX IDX_PLANT_MEMBER       ON PLANT(MEMBER_ID);
CREATE INDEX IDX_SCHEDULE_MEMBER    ON PLANT_SCHEDULE(MEMBER_ID);
CREATE INDEX IDX_SCHEDULE_DATE      ON PLANT_SCHEDULE(SCHEDULE_DATE);
CREATE INDEX IDX_ATTEND_MEMBER      ON ATTENDANCE(MEMBER_ID);
CREATE INDEX IDX_ATTEND_DATE        ON ATTENDANCE(ATTEND_DATE);
CREATE INDEX IDX_MISSION_MEMBER     ON MISSION_LOG(MEMBER_ID, MISSION_DATE);
CREATE INDEX IDX_MEMBER_BADGE       ON MEMBER_BADGE(MEMBER_ID);
CREATE INDEX IDX_POINT_MEMBER       ON POINT_LOG(MEMBER_ID);

-- ================================================
--  기본 뱃지 데이터 INSERT
-- ================================================
INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('plant_beginner', '식물 입문가', '🌱', '첫 식물을 등록한 가드너', '식물 1종 등록');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('tree_lover', '나무 소녀', '🌳', '나무를 사랑하는 가드너', '나무 종류 식물 3종 이상 등록');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('watering_master', '물주기 달인', '💧', '물주기를 빠짐없이 완료', '물주기 일정 30회 완료');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('first_purchase', '첫 구매', '🛒', '첫 번째 구매 완료', '앱에서 첫 구매');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('plant_collector', '식물 컬렉터', '🪴', '다양한 식물을 수집', '식물 5종 이상 등록');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('streak_7', '7일 연속 출석', '🔥', '7일 연속 출석 달성', '7일 연속 출석');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('streak_30', '30일 개근', '🏆', '30일 연속 출석 달성', '30일 연속 출석');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('mission_master', '미션 마스터', '⭐', '오늘의 미션 올클리어 10회', '출석 미션 전체 완료 10회');

INSERT INTO BADGE (BADGE_KEY, BADGE_NAME, BADGE_ICON, DESCRIPTION, CONDITION_DESC)
VALUES ('seedling', '새싹', '🌿', '포인트 100P 달성', '누적 포인트 100P 이상');

COMMIT;

-- ================================================
--  테스트용 샘플 데이터 (선택 실행)
-- ================================================
-- 회원
INSERT INTO MEMBER (USERNAME, PASSWORD, EMAIL, NAME)
VALUES ('testuser', '$2a$10$examplehashedpassword', 'test@flora.com', '초희');

-- 식물
INSERT INTO PLANT (MEMBER_ID, PLANT_NAME, NICKNAME, PLANT_TYPE)
VALUES (1, '몬스테라', '몬이', '관엽식물');

INSERT INTO PLANT (MEMBER_ID, PLANT_NAME, NICKNAME, PLANT_TYPE)
VALUES (1, '선인장', '선이', '선인장');

-- 출석
INSERT INTO ATTENDANCE (MEMBER_ID, ATTEND_DATE)
VALUES (1, TRUNC(SYSDATE));

INSERT INTO ATTENDANCE (MEMBER_ID, ATTEND_DATE)
VALUES (1, TRUNC(SYSDATE) - 1);

INSERT INTO ATTENDANCE (MEMBER_ID, ATTEND_DATE)
VALUES (1, TRUNC(SYSDATE) - 2);

-- 포인트 적립
INSERT INTO POINT_LOG (MEMBER_ID, POINT_TYPE, AMOUNT, REASON)
VALUES (1, 'EARN', 50, '출석 체크');

INSERT INTO POINT_LOG (MEMBER_ID, POINT_TYPE, AMOUNT, REASON)
VALUES (1, 'EARN', 30, '출석 미션 완료');

INSERT INTO POINT_LOG (MEMBER_ID, POINT_TYPE, AMOUNT, REASON)
VALUES (1, 'EARN', 20, '일기 작성');

-- 뱃지 획득
INSERT INTO MEMBER_BADGE (MEMBER_ID, BADGE_ID, IS_EQUIPPED)
VALUES (1, 1, 1);  -- 식물 입문가 (장착)

INSERT INTO MEMBER_BADGE (MEMBER_ID, BADGE_ID, IS_EQUIPPED)
VALUES (1, 6, 0);  -- 7일 연속 출석

COMMIT;
