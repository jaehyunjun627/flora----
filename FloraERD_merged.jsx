const GREEN = "#4A7C2F";
const MONGO_ORANGE = "#E8961E";
const TW = 188;
const RH = 22;
const HH = 34;

const TABLES = [
  // ═══ 👤 회원/인증 (파랑) ═══
  { id:"users", label:"USERS", x:520, y:30, color:"#D6EAF8", cols:[
    {n:"id",k:"PK"},{n:"email"},{n:"password_hash"},{n:"nickname"},{n:"phone"},
    {n:"profile_image_url"},{n:"profile_emoji"},{n:"role"},{n:"is_active"},
    {n:"points"},{n:"streak_days"},{n:"last_check_in"},
    {n:"farm_name"},{n:"seller_status"},
    {n:"created_at"},{n:"updated_at"}]},
  { id:"oauth", label:"OAUTH_ACCOUNTS", x:280, y:30, color:"#D6EAF8", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"provider"},{n:"provider_user_id"},{n:"created_at"}]},
  { id:"badges", label:"USER_BADGES", x:280, y:210, color:"#D6EAF8", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"badge_code"},{n:"badge_name"},{n:"earned_at"}]},

  // ═══ 📜 약관 (파랑) ═══
  { id:"terms", label:"TERMS", x:30, y:30, color:"#D6EAF8", cols:[
    {n:"id",k:"PK"},{n:"title"},{n:"content"},{n:"required"},{n:"version"},{n:"created_at"}]},
  { id:"consents", label:"USER_TERM_CONSENTS", x:30, y:244, color:"#D6EAF8", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"term_id",k:"FK"},{n:"consented"},{n:"consented_at"}]},

  // ═══ 🏪 상품 (주황) ═══
  { id:"products", label:"PRODUCTS", x:840, y:30, color:"#FFF3E0", cols:[
    {n:"id",k:"PK"},{n:"seller_id",k:"FK"},{n:"plant_id  (→Mongo)"},{n:"name"},
    {n:"price"},{n:"original_price"},{n:"stock_quantity"},
    {n:"category"},{n:"product_type"},
    {n:"is_group_buy"},{n:"group_buy_current"},
    {n:"rating"},{n:"review_count"},
    {n:"is_active"},{n:"created_at"}]},

  // ═══ 🛒 주문 (핑크) ═══
  { id:"cart", label:"CART_ITEMS", x:1120, y:30, color:"#FCE4EC", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"product_id",k:"FK"},{n:"quantity"},{n:"added_at"}]},
  { id:"orders", label:"ORDERS", x:1120, y:212, color:"#FCE4EC", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"order_number"},{n:"total_price"},
    {n:"status"},{n:"delivery_address"},
    {n:"recipient_name"},{n:"recipient_phone"},
    {n:"ordered_at"},{n:"updated_at"}]},
  { id:"oitems", label:"ORDER_ITEMS", x:1120, y:480, color:"#FCE4EC", cols:[
    {n:"id",k:"PK"},{n:"order_id",k:"FK"},{n:"product_id",k:"FK"},{n:"quantity"},{n:"unit_price"}]},
  { id:"payments", label:"PAYMENTS", x:1120, y:640, color:"#FCE4EC", cols:[
    {n:"id",k:"PK"},{n:"order_id",k:"FK"},{n:"pg_transaction_id"},{n:"amount"},
    {n:"method"},{n:"status"},{n:"paid_at"}]},

  // ═══ 🌱 캘린더/일기 (초록) ═══
  { id:"calendars", label:"PLANT_CALENDARS", x:520, y:446, color:"#E8F5E9", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"plant_id  (→Mongo)"},{n:"plant_nickname"},
    {n:"watering_cycle_days"},{n:"watering_next_date"},{n:"watering_is_done"},
    {n:"repot_date"},{n:"fertilize_date"},{n:"created_at"}]},
  { id:"diaries", label:"GROWTH_DIARIES", x:520, y:720, color:"#E8F5E9", cols:[
    {n:"id",k:"PK"},{n:"calendar_id",k:"FK"},{n:"recorded_date"},{n:"memo"},
    {n:"image_url"},{n:"created_at"}]},

  // ═══ 💬 커뮤니티 (틸) ═══
  { id:"posts", label:"COMMUNITY_POSTS", x:30, y:476, color:"#E0F2F1", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"title"},{n:"content"},
    {n:"category"},{n:"location_city"},{n:"view_count"},
    {n:"is_active"},{n:"created_at"},{n:"updated_at"}]},

  // ═══ 📸 다형성 (틸 연한) ═══
  { id:"images", label:"IMAGES", x:30, y:760, color:"#B2DFDB", cols:[
    {n:"id",k:"PK"},{n:"target_type"},{n:"target_id"},{n:"image_url"},{n:"sort_order"}]},
  { id:"comments", label:"COMMENTS", x:240, y:760, color:"#B2DFDB", cols:[
    {n:"id",k:"PK"},{n:"target_type"},{n:"target_id"},{n:"user_id",k:"FK"},
    {n:"parent_comment_id",k:"FK"},{n:"content"},{n:"is_active"},{n:"created_at"}]},
  { id:"likes", label:"LIKES", x:30, y:1000, color:"#B2DFDB", cols:[
    {n:"id",k:"PK"},{n:"target_type"},{n:"target_id"},{n:"user_id",k:"FK"},{n:"created_at"}]},

  // ═══ 📦 구독 (보라) ═══
  { id:"subs", label:"SUBSCRIPTIONS", x:840, y:430, color:"#EDE7F6", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"plan"},{n:"status"},
    {n:"next_delivery_date"},{n:"delivery_address"},
    {n:"subscribed_at"},{n:"updated_at"}]},
  { id:"anniv", label:"ANNIVERSARY_DELIVERIES", x:840, y:680, color:"#EDE7F6", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"subscription_id",k:"FK"},
    {n:"recipient_name"},{n:"anniversary_date"},
    {n:"handwritten_letter"},{n:"plant_id  (→Mongo)"},{n:"status"},{n:"created_at"}]},

  // ═══ 🎯 퀴즈 (노랑) ═══
  { id:"quizzes", label:"QUIZZES", x:240, y:1000, color:"#FFF9C4", cols:[
    {n:"id",k:"PK"},{n:"question"},{n:"option_1"},{n:"option_2"},
    {n:"option_3"},{n:"option_4"},{n:"answer_idx"},{n:"explanation"},{n:"reward_points"}]},
  { id:"qanswers", label:"QUIZ_ANSWERS", x:490, y:1000, color:"#FFF9C4", cols:[
    {n:"id",k:"PK"},{n:"user_id",k:"FK"},{n:"quiz_id",k:"FK"},
    {n:"selected"},{n:"correct"},{n:"answered_at"}]},

  // ═══ 🌸 축제 (핑크) ═══
  { id:"festivals", label:"FESTIVALS", x:730, y:1000, color:"#FCE4EC", cols:[
    {n:"id",k:"PK"},{n:"name"},{n:"emoji"},{n:"region"},
    {n:"start_date"},{n:"end_date"},{n:"description"},{n:"bg_color"}]},

  // ═══ 📢 공지/FAQ (갈색) ═══
  { id:"notices", label:"NOTICES", x:960, y:1000, color:"#EFEBE9", cols:[
    {n:"id",k:"PK"},{n:"admin_id",k:"FK"},{n:"title"},{n:"content"},
    {n:"tag"},{n:"is_pinned"},{n:"created_at"},{n:"updated_at"}]},
  { id:"faqs", label:"FAQS", x:1190, y:1000, color:"#EFEBE9", cols:[
    {n:"id",k:"PK"},{n:"question"},{n:"answer"},{n:"sort_order"}]},

  // ═══ 🍃 MongoDB (주황 강조) ═══
  { id:"m_plants", label:"plants  (MongoDB)", x:840, y:870, color:"#FFE0B2", isMongo:true, cols:[
    {n:"_id  (ObjectId)",k:"PK"},{n:"name"},{n:"scientificName"},{n:"birthFlowerDate"},
    {n:"flowerLanguage"},{n:"isToxicToPets"},{n:"careInfo {…}"},{n:"commonDiseases [{…}]"},
    {n:"tags []"},{n:"companions []"}]},
  { id:"m_diag", label:"plant_disease_diagnoses  (MongoDB)", x:1100, y:870, color:"#FFE0B2", isMongo:true, cols:[
    {n:"_id  (ObjectId)",k:"PK"},{n:"userId  (→Oracle)",k:"FK"},{n:"plantId  (→plants)"},{n:"imageUrl"},
    {n:"aiResult {…}"},{n:"prescriptions [{…}]"},{n:"diagnosedAt"}]},
];

function tH(cols) { return HH + cols.length * RH + 8; }

function getAnc(tid, side) {
  const t = TABLES.find(x => x.id === tid);
  if (!t) return [0,0];
  const h = tH(t.cols);
  if (side === "T") return [t.x + TW / 2, t.y];
  if (side === "B") return [t.x + TW / 2, t.y + h];
  if (side === "L") return [t.x, t.y + h / 2];
  if (side === "R") return [t.x + TW, t.y + h / 2];
}

const CONNS = [
  // USERS 방사형
  { from:"users", fs:"L", to:"oauth",     ts:"R", cp1:[470,130], cp2:[490,120] },
  { from:"users", fs:"L", to:"badges",    ts:"R", cp1:[460,220], cp2:[490,310] },
  { from:"users", fs:"L", to:"consents",  ts:"R", cp1:[420,280], cp2:[300,350] },
  { from:"users", fs:"R", to:"products",  ts:"L", cp1:[780,130], cp2:[800,200] },
  { from:"users", fs:"R", to:"cart",      ts:"L", cp1:[800,100], cp2:[1060,110] },
  { from:"users", fs:"R", to:"orders",    ts:"L", cp1:[800,200], cp2:[1060,350] },
  { from:"users", fs:"B", to:"calendars", ts:"T", cp1:[614,410], cp2:[614,420] },
  { from:"users", fs:"L", to:"posts",     ts:"T", cp1:[400,330], cp2:[124,450] },
  { from:"users", fs:"R", to:"subs",      ts:"T", cp1:[780,300], cp2:[934,400] },
  { from:"users", fs:"B", to:"qanswers",  ts:"T", cp1:[614,440], cp2:[584,970] },
  { from:"users", fs:"R", to:"notices",   ts:"T", cp1:[810,350], cp2:[1054,970] },
  { from:"users", fs:"R", to:"anniv",     ts:"L", cp1:[800,340], cp2:[790,830] },
  { from:"users", fs:"L", to:"likes",     ts:"T", cp1:[380,350], cp2:[124,970] },
  // comments → users
  { from:"users", fs:"L", to:"comments",  ts:"T", cp1:[410,340], cp2:[334,730] },

  // TERMS chain
  { from:"terms", fs:"B", to:"consents",  ts:"T", cp1:[124,210], cp2:[124,218] },

  // PRODUCTS chain
  { from:"products", fs:"L", to:"cart",    ts:"B", cp1:[1070,180], cp2:[1214,176] },
  { from:"products", fs:"R", to:"oitems",  ts:"L", cp1:[1090,280], cp2:[1070,570] },

  // ORDERS chain
  { from:"orders", fs:"B", to:"oitems",   ts:"T", cp1:[1214,465], cp2:[1214,455] },
  { from:"orders", fs:"B", to:"payments", ts:"T", cp1:[1214,470], cp2:[1214,615] },

  // CALENDAR chain
  { from:"calendars", fs:"B", to:"diaries", ts:"T", cp1:[614,700], cp2:[614,695] },

  // SUBSCRIPTION chain
  { from:"subs", fs:"B", to:"anniv",      ts:"T", cp1:[934,650], cp2:[934,655] },

  // QUIZ chain
  { from:"quizzes", fs:"R", to:"qanswers", ts:"L", cp1:[460,1120], cp2:[460,1120] },

  // MongoDB 점선 연결
  { from:"products", fs:"B", to:"m_plants", ts:"T", cp1:[934,400], cp2:[934,845], dashed:true },
  { from:"calendars", fs:"R", to:"m_plants", ts:"L", cp1:[760,620], cp2:[810,960], dashed:true },
  { from:"m_diag", fs:"L", to:"m_plants",  ts:"R", cp1:[1080,1000], cp2:[1060,960], dashed:true },
];

function ConnLine({ c }) {
  const [x1, y1] = getAnc(c.from, c.fs);
  const [x2, y2] = getAnc(c.to, c.ts);
  const [cp1x, cp1y] = c.cp1;
  const [cp2x, cp2y] = c.cp2;
  const pathD = `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
  const color = c.dashed ? MONGO_ORANGE : GREEN;

  const CF = 13, CS = 7;
  const cfLines = {
    L: [`M${x2},${y2} L${x2-CF},${y2-CS}`, `M${x2},${y2} L${x2-CF},${y2}`, `M${x2},${y2} L${x2-CF},${y2+CS}`],
    R: [`M${x2},${y2} L${x2+CF},${y2-CS}`, `M${x2},${y2} L${x2+CF},${y2}`, `M${x2},${y2} L${x2+CF},${y2+CS}`],
    T: [`M${x2},${y2} L${x2-CS},${y2-CF}`, `M${x2},${y2} L${x2},${y2-CF}`, `M${x2},${y2} L${x2+CS},${y2-CF}`],
    B: [`M${x2},${y2} L${x2-CS},${y2+CF}`, `M${x2},${y2} L${x2},${y2+CF}`, `M${x2},${y2} L${x2+CS},${y2+CF}`],
  }[c.ts] || [];

  const BS = 8;
  const barD = (c.fs === "L" || c.fs === "R")
    ? `M${x1},${y1 - BS} L${x1},${y1 + BS}`
    : `M${x1 - BS},${y1} L${x1 + BS},${y1}`;

  return (
    <g>
      <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"
        strokeDasharray={c.dashed ? "6 3" : "none"} />
      {!c.dashed && cfLines.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ))}
      {!c.dashed && (
        <path d={barD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {c.dashed && (
        <>
          <circle cx={x2} cy={y2} r="3.5" fill={MONGO_ORANGE} opacity="0.7" />
          <circle cx={x1} cy={y1} r="3.5" fill={MONGO_ORANGE} opacity="0.7" />
        </>
      )}
    </g>
  );
}

function TableCard({ t }) {
  const isMongo = t.isMongo;
  return (
    <div style={{
      position: "absolute", left: t.x, top: t.y, width: TW,
      background: "#FFFFFF",
      borderRadius: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.11)",
      overflow: "hidden",
      fontFamily: "'Courier New', 'Consolas', monospace",
      border: isMongo ? `2px solid ${MONGO_ORANGE}` : "none",
    }}>
      <div style={{
        background: t.color || "#C8C8C8",
        padding: "7px 10px 6px",
        fontWeight: "800",
        fontSize: 9.2,
        letterSpacing: "0.05em",
        color: isMongo ? "#7A4800" : "#2a2a2a",
        borderBottom: "1.5px solid rgba(0,0,0,0.08)",
      }}>
        {t.label}
      </div>
      {t.cols.map((col, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 10px",
          height: RH,
          fontSize: 10.5,
          borderTop: i === 0 ? "none" : "1px solid #F2F2F2",
          background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
        }}>
          <span style={{
            color: col.k === "PK" ? "#1a1a1a" : col.k === "FK" ? "#666" : "#444",
            fontWeight: col.k === "PK" ? 700 : 400,
            fontSize: col.n.length > 22 ? 9 : 10.5,
          }}>
            {col.n}
          </span>
          {col.k && (
            <span style={{
              fontSize: 8, fontWeight: 700,
              color: col.k === "PK" ? "#555" : "#999",
              letterSpacing: "0.04em",
            }}>
              {col.k}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FloraERD() {
  const W = 1420, H = 1340;
  return (
    <div style={{ background: "#F0F4E8", minHeight: "100vh", overflow: "auto" }}>
      <div style={{
        padding: "20px 28px 0",
        fontFamily: "'Courier New', monospace",
        fontSize: 13, fontWeight: 700, color: "#2D5016",
        letterSpacing: "0.07em",
      }}>
        🌿 꽃히는 삶 (FLORA) — DATABASE SCHEMA (Oracle 23 + MongoDB 2)
      </div>

      <div style={{
        display: "flex", gap: 16, padding: "8px 28px 14px",
        fontFamily: "'Courier New', monospace", fontSize: 10, color: "#5A5A40",
        alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:8.5, fontWeight:700, color:"#555" }}>PK</span> Primary Key
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:8.5, fontWeight:700, color:"#999" }}>FK</span> Foreign Key
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <svg width="34" height="10" style={{overflow:"visible"}}>
            <line x1="0" y1="5" x2="26" y2="5" stroke={GREEN} strokeWidth="1.4"/>
            <line x1="0" y1="1" x2="0" y2="9" stroke={GREEN} strokeWidth="2"/>
            <path d="M26,5 L15,0.5 M26,5 L15,5 M26,5 L15,9.5" stroke={GREEN} strokeWidth="1.4" fill="none"/>
          </svg>
          1:N (Oracle FK)
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <svg width="34" height="10" style={{overflow:"visible"}}>
            <line x1="0" y1="5" x2="26" y2="5" stroke={MONGO_ORANGE} strokeWidth="1.4" strokeDasharray="5 2.5"/>
            <circle cx="0" cy="5" r="3" fill={MONGO_ORANGE} opacity="0.7"/>
            <circle cx="26" cy="5" r="3" fill={MONGO_ORANGE} opacity="0.7"/>
          </svg>
          MongoDB 참조
        </span>
        <span>│</span>
        {[
          {bg:"#D6EAF8",t:"👤 회원"},{bg:"#FFF3E0",t:"🏪 상품"},{bg:"#FCE4EC",t:"🛒 주문"},
          {bg:"#E8F5E9",t:"🌱 캘린더"},{bg:"#E0F2F1",t:"💬 커뮤니티"},{bg:"#B2DFDB",t:"📸 다형성"},
          {bg:"#EDE7F6",t:"📦 구독"},{bg:"#FFF9C4",t:"🎯 퀴즈"},{bg:"#EFEBE9",t:"📢 공지"},
          {bg:"#FFE0B2",t:"🍃 MongoDB"},
        ].map((d,i) => (
          <span key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
            <span style={{width:11,height:11,borderRadius:3,background:d.bg,border:"1px solid rgba(0,0,0,0.12)"}}/>
            <span style={{fontSize:9.5}}>{d.t}</span>
          </span>
        ))}
      </div>

      <div style={{ position: "relative", width: W, height: H, marginLeft: 18 }}>
        <svg style={{ position:"absolute", top:0, left:0, width:W, height:H, pointerEvents:"none" }}>
          {CONNS.map((c, i) => <ConnLine key={i} c={c} />)}
        </svg>
        {TABLES.map(t => <TableCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}
