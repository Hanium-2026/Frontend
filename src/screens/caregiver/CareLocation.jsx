import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { NaverMapView, NaverMapMarkerOverlay, NaverMapPathOverlay } from '@mj-studio/react-native-naver-map';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EventSource from 'react-native-sse';
import T from '../../tokens';
import Icon from '../../icons';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';
import { getMyWards } from '../../api/links';
import { locationStreamUrl, getLocationHistory } from '../../api/location';
import { tokenStore } from '../../store/tokenStore';

const CARE_TABS = [
  { icon: 'home', label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell', label: '알림', path: '/(caregiver)/alerts' },
  { icon: 'pin', label: '위치', path: '/(caregiver)/location' },
  { icon: 'user', label: '내정보', path: '/(caregiver)/profile' },
];

// 좌표 수신 전 기본 카메라 — 대한민국 전역이 보이도록 축소.
const DEFAULT_CAMERA = { latitude: 36.5, longitude: 127.8, zoom: 6.5 };

// 오늘 동선 표시 색상(연두색).
const TRAIL_COLOR = '#7ED957';

function fmtWhen(iso) {
  if (!iso) return '아직 수신 전';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전 업데이트';
  if (diff < 60) return `${diff}분 전 업데이트`;
  return `${Math.floor(diff / 60)}시간 전 업데이트`;
}

export default function CareLocation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sourceRef = useRef(null);
  const mapRef = useRef(null);
  const [wards, setWards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading');
  const [trail, setTrail] = useState([]); // 오늘 동선 좌표열

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

    let alive = true;
    sourceRef.current?.close?.();
    setLocation(null);
    setStatus('connecting');
    setTrail([]);

    // 오늘 동선 이력 로드(백엔드 history 엔드포인트 도입 전까진 실패 → 빈 동선으로 스킵).
    getLocationHistory(selectedId)
      .then((points) => {
        if (!alive) return;
        setTrail((points ?? []).map((p) => ({ latitude: p.latitude, longitude: p.longitude })));
      })
      .catch(() => {});

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
        if (data.latitude != null && data.longitude != null) {
          setTrail((prev) => [...prev, { latitude: data.latitude, longitude: data.longitude }]);
        }
      } catch {
        setStatus('error');
      }
    };

    source.addEventListener('open', onOpen);
    source.addEventListener('error', onError);
    source.addEventListener('location', onLocation);
    source.addEventListener('message', onLocation);

    return () => {
      alive = false;
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

  useEffect(() => {
    if (lat == null || lng == null) return;
    mapRef.current?.animateCameraTo({ latitude: lat, longitude: lng, zoom: 16, duration: 600, easing: 'EaseOut' });
  }, [lat, lng]);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ height: 420, backgroundColor: '#E8EDF2', overflow: 'hidden' }}>
        <NaverMapView ref={mapRef} style={{ width: '100%', height: '100%' }} initialCamera={DEFAULT_CAMERA}>
          {trail.length >= 2 && (
            <NaverMapPathOverlay coords={trail} width={5} color={TRAIL_COLOR} outlineWidth={1} outlineColor="#4CAF3D"/>
          )}
          {lat != null && lng != null && (
            <NaverMapMarkerOverlay
              latitude={lat}
              longitude={lng}
              anchor={{ x: 0.5, y: 1 }}
              caption={{ text: selectedWard?.name || '보호 대상' }}
            />
          )}
        </NaverMapView>

        <View style={{ position: 'absolute', top: insets.top + 10, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Icon.arrowLeft width={18} height={18} color={T.body}/>
          </Pressable>
          <View style={{ flex: 1, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 }}>
            {status === 'connecting' ? <ActivityIndicator color={T.blue}/> : <Avatar name={selectedWard?.name || '가족'} size={26}/>}
            <View>
              <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink, lineHeight: 16 }}>{selectedWard?.name || '연동 가족 없음'}</Text>
              <Text style={{ fontSize: 10, color: online ? T.ok : T.muted, fontFamily: T.fontSemiBold, marginTop: 2 }}>{online ? '● 실시간 연결' : '● 위치 대기'}</Text>
            </View>
          </View>
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
          어르신 앱이 켜져있는 동안 자동으로 위치가 전송되어 이 화면에 실시간으로 반영됩니다.
        </Text>
      </View>

      <TabBar tabs={CARE_TABS} active={2}/>
    </View>
  );
}
