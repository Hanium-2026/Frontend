// 앱 전역 글씨 크기 설정. 안드로이드 시스템 글씨 크기(4단계)를 그대로 미러링한 인앱 접근성 설정.
// 계정이 아니라 "기기 설정"이라 로컬(secure-store)에 저장한다. 배율 상한 1.3×로 UI 깨짐 방지.
// 커스텀 Text 래퍼(components/Text.jsx)가 이 배율을 fontSize/lineHeight에 곱한다.
import { useSyncExternalStore } from 'react';
import { getItem, setItem } from './storage';

const KEY = 'nevo.fontScale';

// key/label/scale — 안드로이드 4단계와 동일. 순서대로 설정 화면에 노출.
export const FONT_SCALE_OPTIONS = [
  { key: 'small',  label: '작게', scale: 0.85 },
  { key: 'normal', label: '보통', scale: 1.0 },
  { key: 'large',  label: '크게', scale: 1.15 },
  { key: 'xlarge', label: '아주 크게', scale: 1.3 },
];
// 화면 안내문("기본값은 «크게»입니다")과 실제 기본값이 어긋나 있던 것을 바로잡음.
const DEFAULT_KEY = 'large';
const scaleOf = (key) => FONT_SCALE_OPTIONS.find((o) => o.key === key)?.scale ?? 1;

let _key = DEFAULT_KEY;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export const fontScale = {
  // 앱 시작 시 1회 호출 — 디스크 → 메모리.
  async load() {
    const v = await getItem(KEY);
    if (v && FONT_SCALE_OPTIONS.some((o) => o.key === v)) { _key = v; emit(); }
    return _key;
  },
  getKey: () => _key,
  getScale: () => scaleOf(_key),
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  async set(key) {
    if (!FONT_SCALE_OPTIONS.some((o) => o.key === key) || key === _key) return;
    _key = key;
    emit();
    await setItem(KEY, key);
  },
};

// 배율 구독 훅 — 값이 바뀌면 사용하는 컴포넌트가 리렌더된다.
export const useFontScale = () =>
  useSyncExternalStore(fontScale.subscribe, fontScale.getScale, fontScale.getScale);

// 선택된 프리셋 key 구독 훅(설정 화면 라디오 표시용).
export const useFontScaleKey = () =>
  useSyncExternalStore(fontScale.subscribe, fontScale.getKey, fontScale.getKey);
