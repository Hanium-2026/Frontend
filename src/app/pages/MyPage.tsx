import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Bell, MapPin, Settings, LogOut, Info, Activity, UserPlus } from "lucide-react";

function MyPageToggleRow({
  icon,
  label,
  defaultEnabled,
  noBorder,
  simple,
}: {
  icon: React.ReactNode;
  label: string;
  defaultEnabled: boolean;
  noBorder?: boolean;
  simple?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  if (simple) {
    return (
      <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors">
        <div className="flex items-center">
          {icon}
          <span className="font-medium text-slate-900 ml-3">{label}</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${
            enabled ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 flex items-center justify-between ${noBorder ? "" : "border-b border-slate-50"}`}>
      <div className="flex items-center">
        {icon}
        <span className="font-semibold text-slate-800 text-base ml-3">{label}</span>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0 ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
            enabled ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function MyPage() {
  const navigate = useNavigate();
  const [userType] = useState<'elderly' | 'guardian'>(() => {
    const stored = localStorage.getItem('userType');
    return (stored as 'elderly' | 'guardian') || 'elderly';
  });

  if (userType === 'guardian') {
    return (
      <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4 font-bold text-2xl">
              이
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">이영희</h1>
              <p className="text-slate-500 text-sm">보호자 계정</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">연결된 노약자</p>
              <p className="text-2xl font-bold text-slate-900">2명</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">이번 주 알림</p>
              <p className="text-2xl font-bold text-slate-900">3건</p>
            </div>
          </div>
        </div>

        <div className="h-2 bg-slate-50"></div>

        <div className="py-4">
          <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">설정</h3>
          <div>
            <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate("/settings/general")}>
              <div className="flex items-center">
                <Settings className="text-slate-400 mr-3" size={20} />
                <span className="font-medium text-slate-900">기본 설정</span>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
            <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate("/settings/notifications")}>
              <div className="flex items-center">
                <Bell className="text-slate-400 mr-3" size={20} />
                <span className="font-medium text-slate-900">알림 설정</span>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
          </div>
        </div>

        <div className="h-2 bg-slate-50"></div>

        <div className="py-4">
          <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">보호자 관리</h3>
          <div>
            <MyPageToggleRow icon={<Bell className="text-slate-400" size={20} />} label="위험 알림" defaultEnabled={true} simple />
            <MyPageToggleRow icon={<MapPin className="text-slate-400" size={20} />} label="위치 추적" defaultEnabled={true} simple />
            <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate("/guardian/register")}>
              <div className="flex items-center">
                <UserPlus className="text-slate-400 mr-3" size={20} />
                <span className="font-medium text-slate-900">노약자 연결 관리</span>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
          </div>
        </div>

        <div className="h-2 bg-slate-50"></div>

        <div className="py-4">
          <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">계정</h3>
          <div>
            <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center">
                <Info className="text-slate-400 mr-3" size={20} />
                <span className="font-medium text-slate-900">앱 정보</span>
              </div>
              <span className="text-sm text-slate-400">v1.0.0</span>
            </div>
            <div className="px-5 py-4 flex items-center active:bg-red-50 transition-colors" onClick={() => navigate("/login")}>
              <LogOut className="text-red-500 mr-3" size={20} />
              <span className="font-medium text-red-500">로그아웃</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 font-bold text-2xl">
            김
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">김철수</h1>
            <p className="text-slate-500 text-sm">노약자 계정</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">최근 보행 점수</p>
            <p className="text-2xl font-bold text-slate-900">87점</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">이번 주 측정</p>
            <p className="text-2xl font-bold text-slate-900">24회</p>
          </div>
        </div>
      </div>

      <div className="h-2 bg-slate-50"></div>

      <div className="py-4">
        <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">설정</h3>
        <div>
          <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate("/settings/general")}>
            <div className="flex items-center">
              <Settings className="text-slate-400 mr-3" size={20} />
              <span className="font-medium text-slate-900">기본 설정</span>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </div>
          <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate("/settings/notifications")}>
            <div className="flex items-center">
              <Bell className="text-slate-400 mr-3" size={20} />
              <span className="font-medium text-slate-900">알림 설정</span>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </div>
        </div>
      </div>

      <div className="h-2 bg-slate-50"></div>

      <div className="py-4">
        <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">측정 관리</h3>
        <div>
          <MyPageToggleRow icon={<MapPin className="text-slate-400" size={20} />} label="위치 공유" defaultEnabled={true} simple />
          <MyPageToggleRow icon={<Activity className="text-slate-400" size={20} />} label="백그라운드 자동 측정" defaultEnabled={true} simple />
        </div>
      </div>

      <div className="h-2 bg-slate-50"></div>

      <div className="py-4">
        <h3 className="px-5 text-xs font-bold text-slate-500 mb-3">계정</h3>
        <div>
          <div className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors">
            <div className="flex items-center">
              <Info className="text-slate-400 mr-3" size={20} />
              <span className="font-medium text-slate-900">앱 정보</span>
            </div>
            <span className="text-sm text-slate-400">v1.0.0</span>
          </div>
          <div className="px-5 py-4 flex items-center active:bg-red-50 transition-colors" onClick={() => navigate("/login")}>
            <LogOut className="text-red-500 mr-3" size={20} />
            <span className="font-medium text-red-500">로그아웃</span>
          </div>
        </div>
      </div>
    </div>
  );
}
