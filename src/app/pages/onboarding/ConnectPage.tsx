import { useNavigate } from "react-router";
import appLogo from "../../../imports/nevologowithname.png";

export function ConnectPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white p-6 pt-10">
      <div className="flex items-center gap-3 mb-4">
        <img src={appLogo} alt="NEVO" className="w-12 h-12 object-contain" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">보호자를<br/>연결해주세요</h2>
      <p className="text-slate-500 text-lg mb-8">안전한 관리를 위해 가족이나<br/>보호자와 계정을 연결합니다.</p>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
        <label className="block font-bold text-slate-700 mb-3 text-lg">초대 코드 입력</label>
        <input
          type="text"
          placeholder="보호자의 6자리 코드"
          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.2em] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 uppercase"
          maxLength={6}
        />
        <p className="text-center text-sm text-slate-500 mt-4">
          보호자 앱에서 발급된 코드를 입력하세요.
        </p>
      </div>

      <div className="mt-auto space-y-4 pb-4">
        <button
          onClick={() => navigate("/elderly/main")}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-xl shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          연결 완료하기
        </button>
        <button
          onClick={() => navigate("/elderly/main")}
          className="w-full text-slate-500 font-medium py-3 text-lg hover:text-slate-700"
        >
          나중에 연결하기
        </button>
      </div>
    </div>
  );
}
