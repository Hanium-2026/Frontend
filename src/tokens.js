// NEVO 디자인 토큰 — 단일 기준.
//
// 원칙 3가지 (화면 작업 시 반드시 지킬 것)
//  ① 무채색이 지면, 색은 신호.
//     bg/surface/line 위에 내용을 올리고, blue·ok·caution·danger는
//     아이콘·라벨·강조 텍스트·차트에만 쓴다. 넓은 면적을 색으로 칠하지 않는다.
//     예외는 화면당 하나뿐인 주요 행동 버튼.
//  ② 화면당 주인공은 하나. 큰 요소가 여럿이면 위계가 무너진다.
//  ③ 크기로 위계, 색으로 신호. 아래 스케일 밖의 인라인 숫자를 쓰지 않는다.

const T = {
  // ── 액센트 ──────────────────────────────────────────────
  // 의료 신뢰형: 채도를 낮춘 임상 블루. 넓게 써도 덜 튄다.
  blue: '#1B4F9C',
  blueDark: '#143A73',    // pressed
  blueDarker: '#0E2A55',
  blueSoft: '#E8EEF7',    // 아이콘 칩 배경
  blueWash: '#F2F6FB',    // 아주 옅은 강조 영역
  blueChip: '#D3E0F0',

  // ── 의미색 ──────────────────────────────────────────────
  // 위험도 3단계 전용. 카테고리 구분용으로 늘리지 말 것.
  ok: '#0F7A5F',
  okSoft: '#E4F1EC',
  caution: '#A96A00',
  cautionSoft: '#F7EEDC',
  danger: '#B3312A',
  dangerSoft: '#F7E9E8',

  // ── 중성 ────────────────────────────────────────────────
  ink: '#10161D',         // 숫자·제목
  ink2: '#1F2A35',
  body: '#3C4753',        // 본문
  muted: '#6B7885',       // 라벨·단위·비활성
  hair: '#E9EEF3',        // 아주 옅은 구분선
  line: '#E3E8ED',        // 구분선·테두리
  surface: '#FFFFFF',     // 카드
  bg: '#F4F6F8',          // 화면 지면

  // ── 폰트 ────────────────────────────────────────────────
  font: 'Pretendard-Regular',
  fontMedium: 'Pretendard-Medium',
  fontSemiBold: 'Pretendard-SemiBold',
  fontBold: 'Pretendard-Bold',
  fontExtraBold: 'Pretendard-ExtraBold',

  // ── 타이포 스케일 (노인 친화) ────────────────────────────
  // 5단계. 본문 최소 17, 캡션 최소 14 — 그 사이를 비워 위계를 만든다.
  // sub/label은 기존 호출부 호환용 별칭이며 각각 body/caption과 같은 값이다.
  fs: {
    display: 44,  // 큰 점수 — 화면당 하나
    title: 26,    // 화면 제목·상태 문구
    h: 20,        // 섹션 헤더·카드 제목
    body: 17,     // 기본 본문
    sub: 17,      // (별칭) = body
    label: 14,    // (별칭) = caption
    caption: 14,  // 라벨·단위. 최소 크기
  },

  // ── 간격 (8의 배수) ─────────────────────────────────────
  // 노약자 화면은 한 단계 위를 기본으로 쓴다(카드 안 lg→xl, 카드 사이 md→lg).
  sp: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },

  // ── 모서리 ──────────────────────────────────────────────
  radius: { sm: 8, md: 12, pill: 999 },

  // ── 그림자 (1종) ────────────────────────────────────────
  // 카드는 그림자가 아니라 배경과의 명도 차이로 구분한다.
  shadow: {
    shadowColor: '#10161D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  tap: 56,        // 주 버튼·터치 최소 높이
};

export default T;
