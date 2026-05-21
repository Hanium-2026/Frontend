import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import T from '../../tokens';
import Icon from '../../icons';
import IMUTrace from '../../components/IMUTrace';
import { scoreWindow } from '../../api';
import { sessionStore } from '../../store/sessionStore';

const WINDOW = 128;   // 2.56초 @ 50Hz
const STRIDE = 64;    // 1.28초마다 분석
const HZ_MS = 20;     // ~50Hz

export default function ElderMeasure() {
  const router = useRouter();

  const bufRef = useRef([]);          // [[ax,ay,az,gx,gy,gz], ...]
  const gyroRef = useRef([0, 0, 0]);  // 최신 자이로
  const sinceRef = useRef(0);         // 마지막 전송 이후 쌓인 샘플 수
  const inflightRef = useRef(false);
  const accRef = useRef({ scores: [], cadences: [], suspected: 0 });  // 세션 누적(걷기만)

  const [result, setResult] = useState(null);   // {score, riskLevel, error, ratio}
  const [count, setCount] = useState(0);         // 분석한 윈도우 수
  const [status, setStatus] = useState('센서 준비 중...');
  const [trace, setTrace] = useState({ x: null, y: null, z: null });  // 실시간 3축 파형

  useEffect(() => {
    Accelerometer.setUpdateInterval(HZ_MS);
    Gyroscope.setUpdateInterval(HZ_MS);

    const gSub = Gyroscope.addListener(({ x, y, z }) => {
      gyroRef.current = [x, y, z];
    });

    const aSub = Accelerometer.addListener(({ x, y, z }) => {
      const [gx, gy, gz] = gyroRef.current;
      const buf = bufRef.current;
      buf.push([x, y, z, gx, gy, gz]);
      if (buf.length > 256) buf.splice(0, buf.length - 256);  // 메모리 캡 (슬라이딩)
      sinceRef.current += 1;

      if (buf.length >= WINDOW &&
          sinceRef.current >= STRIDE &&
          !inflightRef.current) {
        sinceRef.current = 0;
        const win = buf.slice(buf.length - WINDOW);
        inflightRef.current = true;
        setStatus('분석 중...');
        scoreWindow(win)
          .then((r) => {
            if (!r) { setStatus('응답 오류'); return; }
            if (r.activityState === 'WALKING' && r.score != null) {
              setResult(r);
              setCount((c) => c + 1);
              setStatus('측정 중');
              const a = accRef.current;
              a.scores.push(r.score);
              a.cadences.push(r.cadence ?? 0);
              if (r.riskLevel === 'SUSPECTED') a.suspected += 1;
            } else if (r.activityState === 'STATIONARY') {
              setResult({ activityState: 'STATIONARY' });
              setStatus('정지 · 보행 대기');
            } else {
              setStatus('대기 중 (샘플 부족)');
            }
          })
          .catch(() => setStatus('서버 연결 실패 — IP/같은 WiFi 확인'))
          .finally(() => { inflightRef.current = false; });
      }
    });

    // 파형은 점수계산과 별개로 ~150ms마다 갱신 (50Hz 리렌더는 과부하)
    const traceTimer = setInterval(() => {
      const buf = bufRef.current;
      if (buf.length < 8) return;
      const seg = buf.slice(Math.max(0, buf.length - 80));
      setTrace({ x: seg.map((s) => s[0]), y: seg.map((s) => s[1]), z: seg.map((s) => s[2]) });
    }, 150);

    return () => { aSub.remove(); gSub.remove(); clearInterval(traceTimer); };
  }, []);

  const stationary = result?.activityState === 'STATIONARY';
  const suspected = result?.riskLevel === 'SUSPECTED';
  const accent = stationary ? '#9DB2D4' : suspected ? '#FF6B6B' : '#5EEAD4';
  const score = stationary ? null : result?.score;
  const circ = 666;
  const offset = score != null ? circ * (1 - score / 100) : circ * 0.999;

  const centerText = stationary ? '걸으면 측정이 시작돼요'
    : result?.score != null ? (suspected ? '이상 보행 의심' : '정상 보행')
    : '걸음 데이터 수집 중';

  const stats = [
    ['케이던스', (!stationary && result?.cadence != null) ? String(result.cadence) : '—', '/분'],
    ['비율', (!stationary && result?.ratio != null) ? `${result.ratio.toFixed(2)}x` : '—', ''],
    ['구간', String(count), '회'],
  ];

  const finish = () => {
    const a = accRef.current;
    const n = a.scores.length;
    const avg = (arr) => Math.round(arr.reduce((x, y) => x + y, 0) / arr.length);
    sessionStore.set(n > 0 ? {
      windows: n,
      avgScore: avg(a.scores),
      minScore: Math.round(Math.min(...a.scores)),
      maxScore: Math.round(Math.max(...a.scores)),
      avgCadence: avg(a.cadences),
      suspectedRatio: Math.round((a.suspected / n) * 100),
      riskLevel: (a.suspected / n) > 0.3 ? 'SUSPECTED' : 'NORMAL',
      at: Date.now(),
    } : null);
    router.push('/(elder)/result');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1430' }}>
      <View style={{ position: 'absolute', top: -120, left: -80, width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(51,102,255,0.45)' }}/>
      <View style={{ position: 'absolute', bottom: 80, right: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(123,91,217,0.35)' }}/>

      <View style={{ flex: 1, paddingTop: 54, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color="#fff"/>
          </Pressable>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: T.fontSemiBold, letterSpacing: 1.5 }}>{status}</Text>
          <View style={{ width: 36 }}/>
        </View>

        <View style={{ marginTop: 38, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold, fontSize: 14 }}>주머니에 넣고 평소처럼 걸어주세요</Text>
          <View style={{ marginTop: 18, width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
              <Circle cx="120" cy="120" r="106" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none"/>
              <Circle cx="120" cy="120" r="106" stroke={accent} strokeWidth="4" fill="none"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 120 120)"/>
              <Circle cx="120" cy="120" r="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
              <Circle cx="120" cy="120" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold, letterSpacing: 1 }}>보행 점수</Text>
              <Text style={{ fontSize: 64, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -3, lineHeight: 68, marginTop: 4 }}>
                {stationary ? '정지' : score != null ? Math.round(score) : '--'}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, marginTop: 8, color: accent }}>
                {centerText}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>가속도 (3축)</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>x · y · z</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <IMUTrace width={324} height={36} color="#7DA9FF" data={trace.x}/>
            <IMUTrace width={324} height={36} color="#A78BFA" data={trace.y}/>
            <IMUTrace width={324} height={36} color="#5EEAD4" data={trace.z}/>
          </View>
        </View>

        <View style={{ marginTop: 22, flexDirection: 'row', gap: 10 }}>
          {stats.map(([l, v, s], k) => (
            <View key={k} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>{l}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4 }}>
                <Text style={{ fontSize: 20, fontFamily: T.fontExtraBold, color: '#fff' }}>{v}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{s}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          onPress={finish}
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#fff', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 16 }}>
          <View style={{ width: 28, height: 28, backgroundColor: T.blue, borderRadius: 6 }}/>
        </Pressable>
      </View>
    </View>
  );
}
