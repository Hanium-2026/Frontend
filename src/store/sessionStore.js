// 측정 세션 요약을 측정화면 → 결과화면으로 전달하는 간단 스토어.
let _summary = null;

export const sessionStore = {
  get: () => _summary,
  set: (s) => { _summary = s; },
};
