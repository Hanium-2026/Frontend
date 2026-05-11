import { useState } from "react";
import { ChevronRight } from "lucide-react";

/* ─── Reusable Toggle (큰 사이즈, 부드러운 파란색) ─── */
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-14 h-8 rounded-full relative transition-colors duration-300 shrink-0 ${
        enabled ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}


/* ─── Row Item (큰 글씨, 넓은 패딩) ─── */
function SettingRow({
  label,
  right,
  onClick,
}: {
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-5 hover:bg-gray-50 transition-colors text-left min-h-[68px]"
    >
      <span className="text-gray-900 text-lg">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        {right}
      </div>
    </button>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   기본 설정 페이지
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function GeneralSettingsPage() {
  const [language, setLanguage] = useState("ko");

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      {/* Profile Section - 넓은 여백, 큰 프로필 */}
      <button className="flex items-center justify-between px-6 py-7 mb-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mr-5 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xl mb-1">김철수</div>
            <div className="text-base text-gray-500">내 정보 · 프로필 관리</div>
          </div>
        </div>
        <ChevronRight size={24} className="text-gray-400" />
      </button>

      <div className="px-6 space-y-8">
        {/* 기본 설정 블록 - 은은한 그림자 */}
        <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
          <SettingRow
            label="언어"
            right={
              <>
                <span className="text-blue-500 font-semibold text-lg">한국어</span>
                <ChevronRight size={22} className="text-gray-400" />
              </>
            }
          />
          <div className="border-t border-gray-200" />
          <SettingRow label="알림" right={<ChevronRight size={22} className="text-gray-400" />} />
          <div className="border-t border-gray-200" />
          <SettingRow label="화면 테마 · 진동" right={<ChevronRight size={22} className="text-gray-400" />} />
          <div className="border-t border-gray-200" />
          <SettingRow label="큰 글씨 모드" right={<ChevronRight size={22} className="text-gray-400" />} />
        </div>

        {/* 측정 설정 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">측정 설정</h3>
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
            <SettingRow label="측정 빈도 설정" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="측정 리마인더" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="보행 데이터 관리" right={<ChevronRight size={22} className="text-gray-400" />} />
          </div>
        </div>

        {/* 보호자 연결 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">보호자 연결</h3>
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
            <SettingRow label="보호자 관리" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="데이터 공유 설정" right={<ChevronRight size={22} className="text-gray-400" />} />
          </div>
        </div>

        {/* 보안 및 개인정보 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">보안 및 개인정보</h3>
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
            <SettingRow label="비밀번호 변경" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="생체 인증 설정" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="개인정보 처리방침" right={<ChevronRight size={22} className="text-gray-400" />} />
          </div>
        </div>

        {/* 앱 정보 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">앱 정보</h3>
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
            <SettingRow
              label="버전 정보"
              right={<span className="text-gray-500 text-lg">v1.0.0</span>}
            />
            <div className="border-t border-gray-200" />
            <SettingRow label="고객센터" right={<ChevronRight size={22} className="text-gray-400" />} />
            <div className="border-t border-gray-200" />
            <SettingRow label="이용 약관" right={<ChevronRight size={22} className="text-gray-400" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   알림 설정 페이지
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function NotificationSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [dangerAlert, setDangerAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(true);
  const [measureReminder, setMeasureReminder] = useState(false);
  const [guardianAlert, setGuardianAlert] = useState(true);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      <div className="px-6 pt-7 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">알림 설정</h1>
        <p className="text-lg text-gray-500">
          알림 수신 방법과 종류를 설정합니다.
        </p>
      </div>

      <div className="px-6 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">기본 설정</h3>
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
            <SettingRow
              label="푸시 알림"
              right={
                <Toggle
                  enabled={pushEnabled}
                  onToggle={() => setPushEnabled(!pushEnabled)}
                />
              }
            />
          </div>
        </div>

        <div className={pushEnabled ? "" : "opacity-40 pointer-events-none"}>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">알림 종류</h3>
            <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
              <SettingRow
                label="위험 감지 알림"
                right={
                  <Toggle
                    enabled={dangerAlert}
                    onToggle={() => setDangerAlert(!dangerAlert)}
                  />
                }
              />
              <div className="border-t border-gray-200" />
              <SettingRow
                label="일일 보행 리포트"
                right={
                  <Toggle
                    enabled={dailyReport}
                    onToggle={() => setDailyReport(!dailyReport)}
                  />
                }
              />
              <div className="border-t border-gray-200" />
              <SettingRow
                label="측정 리마인더"
                right={
                  <Toggle
                    enabled={measureReminder}
                    onToggle={() => setMeasureReminder(!measureReminder)}
                  />
                }
              />
              <div className="border-t border-gray-200" />
              <SettingRow
                label="보호자 알림 전달"
                right={
                  <Toggle
                    enabled={guardianAlert}
                    onToggle={() => setGuardianAlert(!guardianAlert)}
                  />
                }
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">알림 방식</h3>
            <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm">
              <SettingRow
                label="알림 소리"
                right={
                  <Toggle
                    enabled={alertSound}
                    onToggle={() => setAlertSound(!alertSound)}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
