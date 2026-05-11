import { useState } from "react";
import { useNavigate } from "react-router";
import {
  UserPlus,
  Phone,
  User,
  Calendar,
  Heart,
  ChevronDown,
  CheckCircle2,
  Link2,
  QrCode,
  MessageSquare,
  ArrowRight,
  Smartphone,
} from "lucide-react";

type RegisterMethod = "phone" | "qr" | "code" | null;

export function GuardianRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<RegisterMethod>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    birthYear: "",
    medicalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const relations = ["아버지", "어머니", "할아버지", "할머니", "배우자", "기타"];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
    }, 1500);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-4 pt-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">등록 완료!</h2>
            <p className="text-slate-500 mb-2">
              <span className="font-bold text-slate-700">{formData.name || "노약자"}</span>님이
              성공적으로 등록되었습니다.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              노약자 기기에서 연결을 수락하면 보행 데이터를 확인할 수 있습니다.
            </p>
            <button
              onClick={() => navigate("/guardian/main")}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-md active:bg-blue-700 transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto no-scrollbar pb-24">
      <div className="p-4 pt-6 flex-1 space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">노약자 등록</h1>
          <p className="text-slate-500 text-sm mb-5">
            보호 대상 노약자를 등록하고 보행 상태를 모니터링하세요.
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                    s <= step ? "bg-blue-500" : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-xs font-bold ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}>
              연결 방법
            </span>
            <span className={`text-xs font-bold ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}>
              기본 정보
            </span>
            <span className={`text-xs font-bold ${step >= 3 ? "text-blue-600" : "text-slate-400"}`}>
              건강 메모
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1">
        {/* Step 1: Connection Method */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-1">연결 방법 선택</h2>
            <p className="text-sm text-slate-500 mb-4">
              노약자의 기기와 연결할 방법을 선택해주세요.
            </p>

            <button
              onClick={() => setMethod("phone")}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                method === "phone"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  method === "phone"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Phone size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">전화번호로 초대</h3>
                <p className="text-sm text-slate-500 leading-snug">
                  노약자의 전화번호를 입력하면 SMS로 앱 설치 및 연결 링크를 보냅니다.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMethod("qr")}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                method === "qr"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  method === "qr"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <QrCode size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">QR 코드 스캔</h3>
                <p className="text-sm text-slate-500 leading-snug">
                  노약자 기기에서 QR 코드를 스캔하여 즉시 연결합니다.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMethod("code")}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                method === "code"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  method === "code"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Link2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">연결 코드 입력</h3>
                <p className="text-sm text-slate-500 leading-snug">
                  노약자 앱에 표시된 6자리 코드를 직접 입력합니다.
                </p>
              </div>
            </button>

            {/* QR Code Display */}
            {method === "qr" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center mt-2">
                <div className="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 p-4">
                  {/* Fake QR Code */}
                  <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-[2px]">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48].includes(i) ||
                          Math.random() > 0.5
                            ? "bg-white"
                            : "bg-slate-900"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  노약자 기기의 카메라로 이 QR코드를 스캔해주세요
                </p>
              </div>
            )}

            {/* Code Input */}
            {method === "code" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-2">
                <p className="text-sm text-slate-500 mb-4">
                  노약자 앱의 설정 &gt; 보호자 연결에서 표시된 코드를 입력하세요.
                </p>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-xl font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.value && target.nextElementSibling) {
                          (target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 mb-1">기본 정보 입력</h2>
            <p className="text-sm text-slate-500 mb-4">
              등록할 노약자의 기본 정보를 입력해주세요.
            </p>

            {/* Name */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">이름</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="노약자 이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">전화번호</label>
              <div className="relative">
                <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Relation */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">관계</label>
              <div className="relative">
                <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full pl-11 pr-10 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="" disabled>관계를 선택하세요</option>
                  {relations.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Birth Year */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">출생연도</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  placeholder="예: 1955"
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Health Memo */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 mb-1">건강 메모 (선택)</h2>
            <p className="text-sm text-slate-500 mb-4">
              기존 진단 이력이나 특이사항을 메모해두면 분석에 도움이 됩니다.
            </p>

            {/* Quick Tags */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">관련 질환 선택</label>
              <div className="flex flex-wrap gap-2">
                {["파킨슨병", "치매", "뇌졸중", "관절염", "당뇨", "고혈압", "골다공증", "기타"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const notes = formData.medicalNotes;
                        if (notes.includes(tag)) {
                          setFormData({
                            ...formData,
                            medicalNotes: notes.replace(tag, "").replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "").trim(),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            medicalNotes: notes ? `${notes}, ${tag}` : tag,
                          });
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        formData.medicalNotes.includes(tag)
                          ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Free Text */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">추가 메모</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  placeholder="예: 왼쪽 무릎 인공관절 수술 이력, 지팡이 사용 중..."
                  rows={4}
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-bold text-blue-900 text-sm mb-3">등록 정보 요약</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">이름</span>
                  <span className="font-bold text-slate-800">{formData.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">전화번호</span>
                  <span className="font-bold text-slate-800">{formData.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">관계</span>
                  <span className="font-bold text-slate-800">{formData.relation || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">출생연도</span>
                  <span className="font-bold text-slate-800">{formData.birthYear || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">연결 방법</span>
                  <span className="font-bold text-slate-800">
                    {method === "phone" ? "SMS 초대" : method === "qr" ? "QR 스캔" : "코드 입력"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl active:bg-slate-200 transition-colors"
          >
            이전
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) {
              if (step === 1 && !method) return;
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={step === 1 && !method || isSubmitting}
          className={`flex-1 font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
            (step === 1 && !method) || isSubmitting
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-blue-600 text-white active:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : step === 3 ? (
            "등록하기"
          ) : (
            <>
              다음 <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
