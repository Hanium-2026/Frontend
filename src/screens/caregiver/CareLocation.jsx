import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { NaverMapView, NaverMapMarkerOverlay, NaverMapPathOverlay } from '@mj-studio/react-native-naver-map';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EventSource from 'react-native-sse';
import T from '../../tokens';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';
import { getMyWards } from '../../api/links';
import { locationStreamUrl, getLocationHistory } from '../../api/location';
import { tokenStore } from '../../store/tokenStore';

const CARE_TABS = [
  { label: '대시보드', path: '/(caregiver)/' },
  { label: '알림', path: '/(caregiver)/alerts' },
  { label: '위치', path: '/(caregiver)/location' },
  { label: '내정보', path: '/(caregiver)/profile' },
];

// 좌표 수신 전 기본 카메라 — 대한민국 전역이 보이도록 축소.
const DEFAULT_CAMERA = { latitude: 36.5, longitude: 127.8, zoom: 6.5 };

// 오늘 동선 표시 색상(연두색).
const TRAIL_COLOR = '#7ED957';

function fmtWhen(iso) {
  if (!iso) return '아직 수신 전';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전 수신';
  if (diff < 60) return `${diff}분 전 수신`;
  return `${Math.floor(diff / 60)}시간 전 수신`;
}

export default function CareLocation() {
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
        if (alive) { setWards([]); setStatus('error'); }
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

    // 오늘 동선 이력 로드.
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
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.xl, paddingBottom: T.sp.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink }}>위치</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: T.sp.sm,
          paddingHorizontal: T.sp.md, paddingVertical: T.sp.xs, borderRadius: T.radius.sm,
          backgroundColor: online ? T.okSoft : T.line,
        }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: online ? T.ok : T.muted }}/>
          <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontSemiBold, color: online ? T.ok : T.muted }}>
            {online ? '수신 중' : status === 'connecting' ? '연결 중' : '대기'}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.xs, paddingBottom: 100, gap: T.sp.lg }} showsVerticalScrollIndicator={false}>
        <Card pad={0}>
          <View style={{ padding: T.sp.lg, flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
            {status === 'connecting'
              ? <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={T.blue}/></View>
              : <Avatar name={selectedWard?.name || '가족'} size={44}/>}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{selectedWard?.name ? `${selectedWard.name}님` : '연동 가족 없음'}</Text>
              <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 2 }}>{fmtWhen(location?.recordedAt)}</Text>
            </View>
          </View>
          {wards.length > 1 && (
            <View style={{ flexDirection: 'row', gap: T.sp.sm, paddingHorizontal: T.sp.lg, paddingBottom: T.sp.lg }}>
              {wards.map((w) => (
                <Pressable key={w.wardId} onPress={() => setSelectedId(w.wardId)} style={{
                  paddingHorizontal: T.sp.md, height: 34, borderRadius: T.radius.sm,
                  backgroundColor: String(selectedId) === String(w.wardId) ? T.blue : T.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontBold, color: String(selectedId) === String(w.wardId) ? '#fff' : T.body }}>{w.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        <View style={{ borderRadius: 18, overflow: 'hidden', height: 380 }}>
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
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={2}/>
    </View>
  );
}
