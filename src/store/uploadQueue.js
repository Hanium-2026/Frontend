// 오프라인 업로드 큐 — 세션 분당 데이터/종료/분석 업로드가 네트워크 실패로 유실되지 않도록
// 로컬에 쌓아뒀다가 재시도한다. storage.js(SecureStore)를 그대로 쓴다 — expo-sqlite 등 새
// 네이티브 의존성을 추가하면 새 EAS dev build가 필요해지므로, 큐 항목 크기가 작다는 점을
// 이용해 기존 저장소로 해결한다.
//
// 재시도 대상은 네트워크 레벨 실패(fetch 자체가 throw)뿐이다. 서버가 정상 응답한 실패
// (ApiError, 4xx 등)는 재시도해도 같은 결과이므로 버린다. 백엔드가 분당 데이터 업로드를
// ON CONFLICT (session_id, minute_at) DO NOTHING으로 처리해 같은 데이터를 몇 번 보내도
// 안전하다(AGENTS.md '오프라인 큐' 참고) — 그래서 무작정 재전송해도 된다.
//
// sessionId가 없는 entry(오프라인 상태에서 측정을 시작해 ensureSession() 자체가 실패했던
// 경우)는 flush 시점에 ensureSession()을 다시 시도해 해소한다. 그 시도마저 실패하면 이번
// flush는 거기서 멈추고(순서 보장을 위해 뒤 entry는 건드리지 않음) 다음 기회에 다시 시도한다.
import { getItem, setItem } from './storage';
import { uploadData, stopSession, uploadAnalysis, ensureSession } from '../api/session';
import { ApiError } from '../api/client';

const KEY = 'nevo.uploadQueue';
let seq = 0;
const nextId = () => `${Date.now()}-${seq++}`;

async function readQueue() {
  const raw = await getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

const writeQueue = (list) => setItem(KEY, JSON.stringify(list));

// entry: { type: 'data'|'stop'|'analysis', sessionId, data?, payload? }
// sessionId는 nullable — 아직 세션을 못 구했으면 null로 넣고 flush가 나중에 채운다.
export async function enqueue(entry) {
  const list = await readQueue();
  list.push({ id: nextId(), createdAt: Date.now(), ...entry });
  await writeQueue(list);
}

function send(entry, sessionId) {
  if (entry.type === 'data') return uploadData(sessionId, entry.data);
  if (entry.type === 'stop') return stopSession(sessionId);
  if (entry.type === 'analysis') return uploadAnalysis(sessionId, entry.payload);
  return Promise.resolve();
}

let flushing = null;

// 큐를 순서대로 비운다. 이미 flush 중이면 그 완료를 그대로 기다린다(중복 실행 방지).
export function flushUploadQueue() {
  if (!flushing) flushing = run().finally(() => { flushing = null; });
  return flushing;
}

async function run() {
  const list = await readQueue();
  if (!list.length) return;

  let resolvedSessionId;      // 이번 flush에서 한 번만 ensureSession()을 시도 — null-id entry들이 공유
  let triedResolve = false;
  let remaining = [];

  for (let i = 0; i < list.length; i++) {
    const entry = list[i];
    let sid = entry.sessionId;

    if (!sid) {
      if (!triedResolve) {
        triedResolve = true;
        try { resolvedSessionId = (await ensureSession())?.sessionId ?? null; }
        catch { resolvedSessionId = null; }
      }
      sid = resolvedSessionId;
    }

    if (!sid) {
      // 세션 id를 못 구했다 — 순서 보장을 위해 여기서부터는 다음 flush로 미룬다.
      remaining = list.slice(i);
      break;
    }

    try {
      await send(entry, sid);
      // 성공 — 큐에서 빠진다(remaining에 안 넣음)
    } catch (e) {
      if (e instanceof ApiError) {
        // 서버가 정상 응답한 실패 — 재시도해도 같은 결과이므로 버린다.
      } else {
        // 네트워크 레벨 실패 — 순서 보장을 위해 여기서부터는 다음 flush로 미룬다.
        remaining = list.slice(i);
        break;
      }
    }
  }

  if (remaining.length !== list.length) await writeQueue(remaining);
}
