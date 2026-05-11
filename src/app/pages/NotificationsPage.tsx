import { Activity, MapPin, Info } from "lucide-react";

export function NotificationsPage() {
  const notifications = [
    { id: 1, type: "danger", title: "위험 감지 알림", desc: "김철수님의 보행에서 높은 불균형이 감지되었습니다.", time: "10분 전" },
    { id: 2, type: "info", title: "주간 리포트 도착", desc: "이번 주 보행 분석 리포트가 생성되었습니다.", time: "2시간 전" },
    { id: 3, type: "location", title: "위치 이탈 알림", desc: "김철수님이 설정된 안전 구역을 벗어났습니다.", time: "어제" },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-2 px-2">알림 센터</h2>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start">
            <div className={`p-2.5 rounded-full mr-3 shrink-0 ${
              notif.type === 'danger' ? 'bg-red-100 text-red-600' :
              notif.type === 'location' ? 'bg-orange-100 text-orange-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {notif.type === 'danger' && <Activity size={20} />}
              {notif.type === 'location' && <MapPin size={20} />}
              {notif.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900 text-base">{notif.title}</h3>
                <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
              </div>
              <p className="text-slate-600 text-sm leading-snug">{notif.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
