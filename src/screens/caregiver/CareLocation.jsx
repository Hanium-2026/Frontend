import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import EventSource from 'react-native-sse';
import T from '../../tokens';
import Icon from '../../icons';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';
import { getMyWards } from '../../api/links';
import { locationStreamUrl } from '../../api/location';
import { tokenStore } from '../../store/tokenStore';

const CARE_TABS = [
  { icon: 'home', label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell', label: '알림', path: '/(caregiver)/alerts' },
  { icon: 'pin', label: '위치', path: '/(caregiver)/location' },
  { icon: 'doc', label: '리포트', path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정', path: '/(caregiver)/settings' },
];

function fmtWhen(iso) {
  if (!iso) return '아직 수신 전';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전 업데이트';
  if (diff < 60) return `${diff}분 전 업데이트`;
  return `${Math.floor(diff / 60)}시간 전 업데이트`;
}

export default function CareLocation() {
  const router = useRouter();
  const sourceRef = useRef(null);
  const [wards, setWards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let alive = true;
    getMyWards()
      .then((list) => {
        if (!alive) return;
        const next = list ?? [];
        setWards(next);
        setSelectedId((prev) => prev ?? next[0]?.wardId ?? null);
      })
      .catch(() => {
        if (alive) {
          setWards([]);
          setStatus('error');
        }
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setStatus(wards.length === 0 ? 'empty' : 'idle');
      return undefined;
    }

    sourceRef.current?.close?.();
    setLocation(null);
    setStatus('connecting');

    const token = tokenStore.getAccess();
    const source = new EventSource(locationStreamUrl(selectedId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    sourceRef.current = source;

    const onOpen = () => setStatus('connected');
    const onError = () => setStatus((prev) => prev === 'connected' ? 'stale' : 'error');
    const onLocation = (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        setLocation(data);
        setStatus('connected');
      } catch {
        setStatus('error');
      }
    };

    source.addEventListener('open', onOpen);
    source.addEventListener('error', onError);
    source.addEventListener('location', onLocation);
    source.addEventListener('message', onLocation);

    return () => {
      source.removeEventListener('open', onOpen);
      source.removeEventListener('error', onError);
      source.removeEventListener('location', onLocation);
      source.removeEventListener('message', onLocation);
      source.close();
      if (sourceRef.current === source) sourceRef.current = null;
    };
  }, [selectedId, wards.length]);

  const selectedWard = useMemo(() => wards.find((w) => String(w.wardId) === String(selectedId)), [wards, selectedId]);
  const lat = location?.latitude;
  const lng = location?.longitude;
  const online = status === 'connected' && location;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ height: 420, backgroundColor: '#E8EDF2', overflow: 'hidden' }}>
        <Svg width="100%" height={420} viewBox="0 0 402 420">
          <Rect width="402" height="420" fill="#E8EDF2"/>
          {[0,1,2,3,4,5,6].map(i => (
            <Rect key={`h${i}`} x="0" y={26+i*60} width="402" height="8" fill="#fff"/>
          ))}
          {[0,1,2,3,4,5,6].map(i => (
            <Rect key={`v${i}`} x={26+i*60} y="0" width="8" height="420" fill="#fff"/>
          ))}
          <Rect x="220" y="80" width="120" height="80" rx="10" fill="#D6EAD8"/>
          <Rect x="60" y="280" width="100" height="120" rx="10" fill="#D6EAD8"/>
          <Path d="M0 320 Q 80 300 160 320 T 320 300 T 402 320 L 402 350 Q 320 330 240 350 T 80 330 T 0 350 Z" fill="#BFD8EF"/>
          <Path d="M 80 80 Q 110 110 150 130 Q 200 150 230 200 Q 250 240 270 290 Q 280 320 250 330"
            fill="none" stroke={T.blue} strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" opacity="0.8"/>
          <Circle cx="80" cy="80" r="9" fill="#fff" stroke={T.blue} strokeWidth="3"/>
          <Circle cx="250" cy="330" r={online ? 24 : 18} fill={online ? T.blue : T.muted} opacity="0.18"/>
          <Circle cx="250" cy="330" r="12" fill={online ? T.blue : T.muted}/>
          <Circle cx="250" cy="330" r="5" fill="#fff"/>
        </Svg>

        <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Icon.arrowLeft width={18} height={18} color={T.body}/>
          </Pressable>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 }}>
            {status === 'connecting' ? <ActivityIndicator color={T.blue}/> : <Avatar name={selectedWard?.name || '가족'} size={26}/>}
            <View>
              <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink, lineHeight: 16 }}>{selectedWard?.name || '연동 가족 없음'}</Text>
              <Text style={{ fontSize: 10, color: online ? T.ok : T.muted, fontFamily: T.fontSemiBold, marginTop: 2 }}>{online ? '● 실시간 연결' : '● 위치 대기'}</Text>
            </View>
          </View>
          <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Icon.more width={18} height={18} color={T.body}/>
          </Pressable>
        </View>

        {wards.length > 1 && (
          <View style={{ position: 'absolute', left: 16, right: 16, top: 110, flexDirection: 'row', gap: 8 }}>
            {wards.map((w) => (
              <Pressable key={w.wardId} onPress={() => setSelectedId(w.wardId)} style={{ paddingHorizontal: 12, height: 34, borderRadius: 12, backgroundColor: String(selectedId) === String(w.wardId) ? T.blue : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: String(selectedId) === String(w.wardId) ? '#fff' : T.body }}>{w.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100, marginTop: -24, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 10 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.line, alignSelf: 'center', marginBottom: 14 }}/>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.3 }}>현재 위치</Text>
            <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{fmtWhen(location?.recordedAt)}</Text>
          </View>
          <Pill tone={online ? 'ok' : 'neutral'}>{online ? '수신 중' : '대기'}</Pill>
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          {[
            ['위도', lat != null ? lat.toFixed(6) : '--'],
            ['경도', lng != null ? lng.toFixed(6) : '--'],
            ['상태', status === 'error' ? '오류' : status === 'connecting' ? '연결중' : online ? '실시간' : '대기'],
          ].map(([l, v], i) => (
            <View key={i} style={{ flex: 1, backgroundColor: T.bg, borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 10.5, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
              <Text style={{ fontSize: 13, fontFamily: T.fontExtraBold, color: T.ink, marginTop: 4 }}>{v}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 11.5, color: T.muted, lineHeight: 18, marginTop: 14 }}>
          노약자 SOS 화면에서 위치를 전송하면 이 화면에 최신 좌표가 실시간으로 반영됩니다.
        </Text>
      </View>

      <TabBar tabs={CARE_TABS} active={2}/>
    </View>
  );
}
