const T = {
  blue: '#3366FF',
  blueDark: '#1F4ED8',
  blueDarker: '#0F2D9C',
  blueSoft: '#E8EEFF',
  blueWash: '#F4F7FF',
  blueChip: '#D9E3FF',

  ok: '#10B981',
  okSoft: '#D6F4E5',
  caution: '#F59E0B',
  cautionSoft: '#FCEDC8',
  danger: '#EF4444',
  dangerSoft: '#FCE0E0',

  ink: '#0B1220',
  ink2: '#1E2638',
  body: '#3A4356',
  muted: '#6B7384',
  hair: '#E5E8EE',
  line: '#EEF0F4',
  surface: '#FFFFFF',
  bg: '#F5F6F9',
  bgWarm: '#F2F4F8',

  font: 'Pretendard-Regular',
  fontMedium: 'Pretendard-Medium',
  fontSemiBold: 'Pretendard-SemiBold',
  fontBold: 'Pretendard-Bold',
  fontExtraBold: 'Pretendard-ExtraBold',
  fontMono: 'Courier',

  // 노인 친화 타이포 스케일 (단일 기준). 본문 최소 17, 캡션 최소 14 — 9~13px 금지.
  fs: {
    display: 44,  // 큰 점수
    title: 26,    // 화면 제목·상태 문구
    h: 20,        // 섹션 헤더·카드 제목
    body: 17,     // 기본 본문
    sub: 16,      // 보조 본문(밀집 영역)
    label: 15,    // 라벨
    caption: 14,  // 최소 크기
  },
  tap: 56,        // 주 버튼/터치 최소 높이
};

export default T;
