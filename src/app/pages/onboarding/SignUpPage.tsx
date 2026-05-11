import { useState } from "react";
import { useNavigate } from "react-router";
import { CircleCheck, ChevronRight, Activity, User, UserPlus } from "lucide-react";

export function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'elderly' | 'guardian' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/login');
    }
  };

  const handleSignup = () => {
    localStorage.setItem('userType', userType!);
    navigate('/permissions');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userType !== null;
      case 2: return name.trim().length > 0;
      case 3: return email.includes('@') && email.includes('.');
      case 4: return password.length >= 8;
      case 5: return confirmPassword === password && password.length >= 8;
      default: return false;
    }
  };

  return (
    <div className="size-full bg-white flex flex-col">
      <div className="bg-white px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={24} className="text-gray-600 rotate-180" />
          </button>
          <span className="text-base font-medium text-gray-400">
            {step} / {totalSteps}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6 overflow-y-auto">
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">어떤 유형의 사용자이신가요?</h1>
            <p className="text-base text-gray-500 mb-8">계정 유형을 선택해주세요</p>
            <div className="space-y-4">
              <button
                onClick={() => setUserType('elderly')}
                className={`w-full p-6 border-2 rounded-3xl transition-all text-left ${
                  userType === 'elderly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${userType === 'elderly' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <User size={32} className={userType === 'elderly' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">노인 사용자</h3>
                    <p className="text-sm text-gray-500 leading-snug">본인의 보행을 측정하고 관리합니다</p>
                  </div>
                  {userType === 'elderly' && (
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CircleCheck size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setUserType('guardian')}
                className={`w-full p-6 border-2 rounded-3xl transition-all text-left ${
                  userType === 'guardian' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${userType === 'guardian' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Activity size={32} className={userType === 'guardian' ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">보호자</h3>
                    <p className="text-sm text-gray-500 leading-snug">가족의 건강 상태를 모니터링합니다</p>
                  </div>
                  {userType === 'guardian' && (
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CircleCheck size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">이름을 입력해주세요</h1>
            <p className="text-base text-gray-500 mb-8">실명을 입력해주시면 됩니다</p>
            <div className="bg-gray-50 p-5 rounded-3xl">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                placeholder="홍길동"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일을 입력해주세요</h1>
            <p className="text-base text-gray-500 mb-8">로그인 시 사용할 이메일입니다</p>
            <div className="bg-gray-50 p-5 rounded-3xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                placeholder="example@email.com"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호를 설정해주세요</h1>
            <p className="text-base text-gray-500 mb-8">8자 이상 입력해주세요</p>
            <div className="bg-gray-50 p-5 rounded-3xl mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {password && (
              <div className="flex items-center gap-2 px-1">
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`text-sm ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  8자 이상
                </span>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호를 다시 입력해주세요</h1>
            <p className="text-base text-gray-500 mb-8">확인을 위해 한 번 더 입력해주세요</p>
            <div className="bg-gray-50 p-5 rounded-3xl mb-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-2 px-1">
                <div className={`w-2 h-2 rounded-full ${confirmPassword === password ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm ${confirmPassword === password ? 'text-green-600' : 'text-red-600'}`}>
                  {confirmPassword === password ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-4 rounded-3xl text-lg font-semibold transition-all ${
            canProceed() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === totalSteps ? '가입 완료' : '다음'}
        </button>
      </div>
    </div>
  );
}
