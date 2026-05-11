import { useNavigate } from "react-router";
import appLogo from "../../../imports/nevologowithname.png";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (type: "elderly" | "guardian") => {
    localStorage.setItem('userType', type);
    if (type === "elderly") navigate("/permissions");
    else navigate("/guardian/main");
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 pt-12">
      <div className="mb-10 text-center">
        <div className="inline-flex w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 p-3">
          <img src={appLogo} alt="NEVO" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">환영합니다</h2>
        <p className="text-slate-500 text-lg">NEVO로 건강을 관리하세요</p>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            defaultValue="user@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            defaultValue="12345678"
          />
        </div>
      </div>

      <div className="space-y-3 mb-auto">
        <button
          onClick={() => handleLogin("elderly")}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition-all"
        >
          노인 사용자 (본인) 로그인
        </button>
        <button
          onClick={() => handleLogin("guardian")}
          className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-blue-600 border border-blue-200 font-bold py-4 rounded-xl text-lg transition-all"
        >
          보호자용 로그인
        </button>
      </div>

      <div className="mt-8 text-center text-slate-500 pb-4">
        계정이 없으신가요?{" "}
        <span
          className="text-blue-600 font-bold cursor-pointer hover:underline"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </span>
      </div>
    </div>
  );
}
