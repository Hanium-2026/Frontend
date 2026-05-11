import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Activity, Play, Square, TriangleAlert, CircleCheck, Info, Check, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMeasurement } from "../context/MeasurementContext";

export function ElderlyMainPage() {
  const navigate = useNavigate();
  const { isMeasuring, score, time, stopMeasurement } = useMeasurement();

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-slate-500 text-sm font-medium mb-1">안녕하세요</p>
        <h1 className="text-2xl font-bold text-slate-900">김철수님</h1>
      </div>

      {/* Main Score Card */}
      {!isMeasuring && (
        <div className="px-5 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center mb-2">
              <Activity size={20} className="mr-2" />
              <span className="text-sm font-medium opacity-90">나의 보행 점수</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">87</span>
              <span className="text-xl ml-1 opacity-90">점</span>
            </div>
            <p className="text-sm mt-2 opacity-80">정상 상태입니다</p>
          </div>
        </div>
      )}

      {/* Measuring Card */}
      {isMeasuring && (
        <div className="px-5 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-white rounded-2xl"
            />
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <Activity className="animate-pulse mr-2" size={20} />
                <span className="text-lg font-bold">측정 중입니다</span>
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-lg ml-1 opacity-90">점</span>
              </div>
              <div className="flex items-center justify-between text-sm opacity-90">
                <span>측정 시간</span>
                <span className="font-bold text-lg">
                  {Math.floor(time / 60).toString().padStart(2, '0')}:
                  {(time % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopMeasurement();
              navigate("/elderly/analyzing");
            }}
            className="w-full mt-3 bg-white border border-slate-200 text-red-500 font-bold py-4 rounded-xl text-base active:bg-slate-50 transition-colors"
          >
            측정 중지
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {!isMeasuring && (
        <div className="px-5 mb-6">
          <button
            onClick={() => navigate("/elderly/prep")}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base shadow-sm active:bg-blue-700 transition-colors"
          >
            지금 측정하기
          </button>
        </div>
      )}

      {/* Recent Results Section */}
      <div className="px-5">
        <h3 className="text-base font-bold text-slate-900 mb-3">최근 분석 결과</h3>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div
            onClick={() => navigate("/analysis-results/1")}
            className="p-3 mb-2 active:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-3">
                  <CircleCheck size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">정상 상태 · 92점</h4>
                  <p className="text-slate-500 text-sm">어제 오후 2:30 측정</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          <div
            onClick={() => navigate("/analysis-results/2")}
            className="p-3 mb-2 active:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-3">
                  <CircleCheck size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">정상 상태 · 85점</h4>
                  <p className="text-slate-500 text-sm">3일 전</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          <div
            onClick={() => navigate("/analysis-results/3")}
            className="p-3 mb-2 active:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-3">
                  <CircleCheck size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">정상 상태 · 88점</h4>
                  <p className="text-slate-500 text-sm">5일 전</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          <div
            onClick={() => navigate("/analysis-results/4")}
            className="p-3 mb-2 active:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mr-3">
                  <TriangleAlert size={24} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">주의 필요 · 72점</h4>
                  <p className="text-slate-500 text-sm">1주일 전</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          <div
            onClick={() => navigate("/analysis-results/5")}
            className="p-3 active:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-3">
                  <CircleCheck size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">정상 상태 · 90점</h4>
                  <p className="text-slate-500 text-sm">2주일 전</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ElderlyPrepPage() {
  const navigate = useNavigate();
  const { startMeasurement } = useMeasurement();

  return (
    <div className="flex flex-col h-full bg-white p-6 justify-between">
      <div className="pt-12 flex-1 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-8 border-4 border-blue-100">
          <Info size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">정확한 측정을 위해<br/>준비해주세요</h2>
        
        <div className="space-y-6 mt-8 text-left w-full max-w-[280px]">
          <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4 shadow-sm border border-slate-200">1</div>
            <p className="text-xl font-bold text-slate-700">휴대폰을 주머니에<br/>넣어주세요</p>
          </div>
          <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4 shadow-sm border border-slate-200">2</div>
            <p className="text-xl font-bold text-slate-700">평소처럼 편하게<br/>걸어주세요</p>
          </div>
          <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4 shadow-sm border border-slate-200">3</div>
            <p className="text-xl font-bold text-slate-700">최소 3분 이상<br/>걸어야 합니다</p>
          </div>
        </div>
      </div>

      <div className="pb-8 space-y-4">
        <button 
          onClick={() => {
            startMeasurement();
            navigate("/elderly/main");
          }}
          className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-5 rounded-2xl text-2xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2"
        >
          <Play fill="currentColor" size={28} />
          <span>시작하기</span>
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-slate-100 active:bg-slate-200 text-slate-600 font-bold py-5 rounded-2xl text-xl transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

export function ElderlyMeasuringPage() {
  const navigate = useNavigate();
  const { time, stopMeasurement } = useMeasurement();
  
  // Keep formatTime locally if still accessed directly occasionally, though it's mainly on main now
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-blue-600 text-white p-6 justify-between">
      <div className="pt-16 flex-1 flex flex-col items-center text-center">
        <h2 className="text-3xl font-extrabold mb-2 text-white">보행 측정 중</h2>
        <p className="text-blue-100 text-lg font-medium mb-12">평소처럼 편안하게 걸어주세요</p>
        
        {/* Radar Animation */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-12">
          <motion.div 
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-24 h-24 bg-white/30 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            className="absolute w-24 h-24 bg-white/20 rounded-full"
          />
          <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl text-blue-600">
            <Activity size={56} />
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl p-6 w-full backdrop-blur-sm border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-blue-100">측정 시간</span>
            <span className="text-4xl font-extrabold tabular-nums tracking-tight">{formatTime(time)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-100">걸음 수</span>
            <span className="text-3xl font-extrabold tabular-nums flex items-end">
              {time * 2} <span className="text-lg font-bold text-blue-200 ml-1 pb-1">걸음</span>
            </span>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center bg-blue-700/50 py-3 px-6 rounded-full border border-blue-500/30">
          <Info size={20} className="mr-2 text-blue-200" />
          <span className="text-blue-100 font-medium">화면을 꺼도 계속 측정됩니다</span>
        </div>
      </div>

      <div className="pb-8">
        <button 
          onClick={() => {
            stopMeasurement();
            navigate("/elderly/analyzing");
          }}
          className="w-full bg-white text-red-500 font-bold py-5 rounded-2xl text-2xl shadow-xl flex items-center justify-center space-x-3 active:bg-slate-50 transition-colors"
        >
          <Square fill="currentColor" size={28} />
          <span>측정 종료하기</span>
        </button>
      </div>
    </div>
  );
}

export function ElderlyAnalyzingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/elderly/result");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 border-8 border-slate-200 border-t-blue-600 rounded-full mb-8 shadow-sm"
      />
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">AI가 데이터를<br/>분석하고 있습니다</h2>
      <p className="text-xl text-slate-500 font-medium">잠시만 기다려주세요...</p>
    </div>
  );
}

export function ElderlyResultPage() {
  const navigate = useNavigate();
  
  // Can be 'normal', 'caution', 'danger'
  const status = 'caution';

  const styles = {
    normal: { bg: 'bg-green-500', lightBg: 'bg-green-50', text: 'text-green-600', icon: CircleCheck, title: '정상', desc: '오늘 보행 상태가 아주 좋습니다!' },
    caution: { bg: 'bg-orange-500', lightBg: 'bg-orange-50', text: 'text-orange-600', icon: TriangleAlert, title: '주의 필요', desc: '평소보다 다리 끌림이 약간 감지되었습니다.' },
    danger: { bg: 'bg-red-500', lightBg: 'bg-red-50', text: 'text-red-600', icon: Activity, title: '위험 감지', desc: '보행 불균형이 심합니다. 주의가 필요합니다.' }
  };

  const currentStyle = styles[status];
  const Icon = currentStyle.icon;

  return (
    <div className="flex flex-col h-full bg-white p-6 justify-between pt-12">
      <div className="flex-1 flex flex-col items-center text-center">
        <div className={`w-32 h-32 ${currentStyle.bg} text-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white ring-4 ring-opacity-20 ${status === 'caution' ? 'ring-orange-500' : ''}`}>
          <Icon size={64} />
        </div>
        
        <h2 className={`text-4xl font-extrabold ${currentStyle.text} mb-4 tracking-tight`}>{currentStyle.title}</h2>
        <p className="text-2xl text-slate-700 font-bold mb-8 leading-snug px-4">{currentStyle.desc}</p>
        
        <div className="bg-slate-50 w-full rounded-[2rem] p-6 border border-slate-100 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <span className="text-xl font-bold text-slate-600">안정성 점수</span>
            <span className={`text-3xl font-extrabold ${currentStyle.text}`}>72점</span>
          </div>
          <div className="flex items-center text-slate-500">
            <Check size={24} className="text-blue-500 mr-2" />
            <span className="text-lg font-medium">보호자에게 결과가 자동 전송되었습니다.</span>
          </div>
        </div>
      </div>

      <div className="pb-8 mt-8 space-y-4">
        <button 
          onClick={() => navigate("/elderly/main")}
          className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-5 rounded-2xl text-2xl shadow-lg transition-transform hover:scale-[1.02]"
        >
          확인
        </button>
      </div>
    </div>
  );
}
