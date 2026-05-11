import { useNavigate } from "react-router";
import { Activity, MapPin, Bell } from "lucide-react";
import appLogo from "../../../imports/nevologowithname.png";

export function PermissionsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white p-6 pt-8">
      <div className="mb-8 text-center">
        <div className="inline-flex w-16 h-16 bg-white rounded-full items-center justify-center mb-4 p-2">
          <img src={appLogo} alt="NEVO" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">원활한 사용을 위해<br/>권한이 필요합니다</h2>
        <p className="text-slate-500">다음 권한들을 허용해주세요.</p>
      </div>

      <div className="space-y-4 mb-auto">
        <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mr-4 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-lg">동작 및 피트니스</h3>
            <p className="text-sm text-slate-500 leading-snug">걸음 수와 보행 데이터를 분석하기 위해 모션 센서 접근이 필요합니다.</p>
          </div>
        </div>

        <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mr-4 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-lg">위치 정보</h3>
            <p className="text-sm text-slate-500 leading-snug">위급 상황 발생 시 보호자에게 정확한 위치를 전송하기 위해 필요합니다.</p>
          </div>
        </div>

        <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mr-4 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1 text-lg">알림</h3>
            <p className="text-sm text-slate-500 leading-snug">보행 분석 결과와 중요한 위험 알림을 받기 위해 필요합니다.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pb-4">
        <button
          onClick={() => navigate("/connect")}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-xl shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          확인하고 계속하기
        </button>
      </div>
    </div>
  );
}
