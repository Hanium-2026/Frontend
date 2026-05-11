import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, MapPin, Bell, UserPlus, ChevronRight, CircleCheck, TriangleAlert, TrendingDown, Clock, SquareActivity, OctagonAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from "recharts";

const MOCK_USERS = [
  { id: '1', name: '김철수', relation: '아버지', status: 'caution', statusText: '주의 필요 (다리 끌림)', location: '자택', lastUpdate: '10분 전', score: 72 },
  { id: '2', name: '이영희', relation: '어머니', status: 'normal', statusText: '매우 안정적', location: '동네 공원', lastUpdate: '방금 전', score: 95 },
];

export function GuardianMainPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">보호자 대시보드</p>
          <h1 className="text-2xl font-bold text-slate-900">연결된 노약자</h1>
        </div>
        <button
          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm active:bg-blue-700 transition-colors"
          onClick={() => navigate("/guardian/register")}
        >
          <UserPlus size={20} />
        </button>
      </div>

      {/* Alert Summary */}
      <div className="px-5 mb-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">위험 알림</h3>
              <p className="text-slate-600 text-xs">최근 7일간 0건</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Cards */}
      <div className="px-5">
        <h3 className="text-base font-bold text-slate-900 mb-3">관리 대상</h3>

        {MOCK_USERS.map((user) => (
          <div
            key={user.id}
            onClick={() => navigate(`/analysis-results/${user.id}`)}
            className="bg-white border border-slate-100 rounded-xl p-4 mb-3 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-3 ${
                    user.status === 'danger'
                      ? 'bg-red-50 text-red-600'
                      : user.status === 'caution'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-green-50 text-green-600'
                  }`}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{user.name}</h4>
                    <span className="text-xs text-slate-500">{user.relation}</span>
                  </div>
                  <div className="flex items-center mt-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === 'danger'
                          ? 'bg-red-500'
                          : user.status === 'caution'
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-semibold ${
                        user.status === 'danger'
                          ? 'text-red-600'
                          : user.status === 'caution'
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {user.statusText}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Activity size={12} className="text-blue-600 mr-1" />
                  <span className="text-xs text-slate-500">안정성 점수</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{user.score}점</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <MapPin size={12} className="text-blue-600 mr-1" />
                  <span className="text-xs text-slate-500">위치</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{user.location}</p>
                <p className="text-xs text-slate-400">{user.lastUpdate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisResultDetailPage() {
  const navigate = useNavigate();
  // Assume user '1' (Kim Chul-soo, caution)
  const [activeTab, setActiveTab] = useState('analysis');

  const gaitData = [
    { name: '월', score: 85, id: '1' },
    { name: '화', score: 82, id: '2' },
    { name: '수', score: 78, id: '3' },
    { name: '목', score: 80, id: '4' },
    { name: '금', score: 75, id: '5' },
    { name: '토', score: 70, id: '6' },
    { name: '오늘', score: 72, id: '7' },
  ];

  const balanceData = [
    { name: '왼발', value: 45, fill: '#ef4444' }, // Left dragging
    { name: '오른발', value: 55, fill: '#3b82f6' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto no-scrollbar pb-24">
      <div className="p-4 space-y-4 pt-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 border-2 border-orange-200 rounded-full flex items-center justify-center font-bold text-2xl mr-4 shadow-sm relative">
              김
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <TriangleAlert size={12} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">김철수</h2>
                <span className="text-sm text-slate-500">아버지</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-semibold text-orange-600">주의 상태 (다리 끌림)</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'analysis' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}
            >
              보행 분석
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'location' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}
            >
              실시간 위치
            </button>
          </div>
        </div>
        {activeTab === 'analysis' && (
          <>
            {/* Stability Trend Chart */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <SquareActivity size={18} className="mr-2 text-blue-500" /> 주간 보행 안정성 추이
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">최근 7일간 점수가 감소하고 있습니다.</p>
                </div>
                <div className="text-3xl font-extrabold text-orange-500 flex items-center">
                  72<span className="text-base font-medium text-slate-400 ml-1 mt-2">점</span>
                </div>
              </div>
              
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gaitData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center mb-6">
                <TrendingDown size={18} className="mr-2 text-blue-500" /> 좌우 비대칭 분석
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="w-1/2 pr-4 border-r border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">왼쪽 (위험)</span>
                    <span className="text-lg font-extrabold text-red-500">45%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-tight">왼쪽 다리 끌림 현상이<br/>반복 감지됨</p>
                </div>
                <div className="w-1/2 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">오른쪽</span>
                    <span className="text-lg font-extrabold text-blue-500">55%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-tight">정상 체중 부하 패턴<br/>유지 중</p>
                </div>
              </div>
            </div>
            
            {/* Recent Alerts */}
            <h3 className="text-lg font-bold text-slate-800 px-2 mt-2">최근 알림</h3>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full mr-3 shrink-0 mt-0.5">
                <TriangleAlert size={16} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">다리 끌림 3회 감지</h4>
                  <span className="text-xs text-slate-500">오늘 오후 2:30</span>
                </div>
                <p className="text-sm text-slate-600 leading-snug">오늘 산책 중 왼쪽 다리의 끌림 패턴이 평소보다 높게 측정되었습니다.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            {/* Map Placeholder UI */}
            <div className="bg-slate-200 w-full h-72 rounded-3xl overflow-hidden relative border border-slate-300 shadow-inner">
              {/* Fake Map Elements */}
              <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center opacity-50">
                {/* Cross grid to look like map */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiPjwvcmVjdD4KPHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
              </div>
              
              {/* Fake path route */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 20 80 Q 30 60, 50 50 T 80 30" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4 4" />
              </svg>

              {/* Fake Location Marker */}
              <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-md"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full absolute top-0 left-0 animate-ping opacity-75"></div>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg mt-2 absolute -left-8 whitespace-nowrap border border-slate-100 font-bold text-xs text-slate-800">
                  현재 위치
                </div>
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-700 active:bg-slate-50"><MapPin size={20} /></button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-3">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">현재 위치</h3>
                    <p className="text-sm text-slate-500">서울특별시 강남구 테헤란로 123</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">10분 전</div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mr-3">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">최근 활동</h3>
                  <p className="text-sm text-slate-500">집 주변 산책 (약 45분 소요)</p>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-md active:bg-slate-800 transition-colors">
              안전 구역 설정하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}