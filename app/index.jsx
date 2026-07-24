import { Redirect } from 'expo-router';
import { Platform, View, Pressable } from 'react-native';
import Text from '../src/components/Text';
import { useRouter } from 'expo-router';
import T from '../src/tokens';
import { tokenStore } from '../src/store/tokenStore';

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
  if (Platform.OS === 'web') return <WebLanding />;
  if (tokenStore.isLoggedIn()) {
    return <Redirect href={tokenStore.getRole() === 'GUARDIAN' ? '/(caregiver)/' : '/(elder)/'}/>;
  }
  return <Redirect href="/(auth)/"/>;
}
