import { Redirect } from 'expo-router';
import { Platform, View, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import Text from '../src/components/Text';
import Logo from '../src/components/Logo';
import { useRouter } from 'expo-router';
import T from '../src/tokens';
import { tokenStore } from '../src/store/tokenStore';

// 앱을 열었을 때 첫 화면 — 확정 디자인 3e(스플래시). 네이티브 스플래시가 사라진 직후
// 아주 짧게 같은 장면을 이어 보여주고 실제 첫 화면으로 넘어간다.
const SPLASH_MS = 900;

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Logo width={76}/>
      <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display, letterSpacing: -0.9 }}>nevo</Text>
      <Text style={{ fontSize: T.fs.body, color: T.muted }}>걸음이 알려주는 건강 신호</Text>
    </View>
  );
}

function WebLanding() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink, marginBottom: 8 }}>NEVO 데모</Text>
      <Text style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>확인할 화면을 선택하세요</Text>

      <Pressable
        onPress={() => router.replace('/(elder)/')}
        style={{ width: 260, paddingVertical: 18, borderRadius: 16, backgroundColor: T.blue, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, fontFamily: T.fontBold, color: '#fff' }}>노약자 화면</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>ElderHome · 측정 · 기록 등</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/(caregiver)/')}
        style={{ width: 260, paddingVertical: 18, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: T.blue }}
      >
        <Text style={{ fontSize: 16, fontFamily: T.fontBold, color: T.blue }}>보호자 화면</Text>
        <Text style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>대시보드 · 알림 · 분석 등</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/(auth)/')}
        style={{ marginTop: 8 }}
      >
        <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontMedium }}>인증 플로우부터 보기</Text>
      </Pressable>
    </View>
  );
}

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (Platform.OS === 'web') return <WebLanding />;
  if (showSplash) return <Splash/>;
  if (tokenStore.isLoggedIn()) {
    return <Redirect href={tokenStore.getRole() === 'GUARDIAN' ? '/(caregiver)/' : '/(elder)/'}/>;
  }
  return <Redirect href="/(auth)/"/>;
}
