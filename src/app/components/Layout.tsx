import { Outlet, useNavigate, useLocation } from "react-router";
import { Bell, User, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedOutlet } from "./AnimatedOutlet";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSplash = location.pathname === "/" || location.pathname === "/onboarding";
  const isAuth = ["/login", "/signup"].includes(location.pathname);
  const hideNav = isSplash || isAuth || location.pathname.includes("/measure") || location.pathname.includes("/analyzing") || location.pathname === "/permissions" || location.pathname === "/elderly/prep" || location.pathname === "/connect";
  const hideHeader = isSplash || location.pathname === "/onboarding";

  const isElderly = location.pathname.startsWith("/elderly");
  const isGuardian = location.pathname.startsWith("/guardian");

  // Get userType from localStorage
  const [userType, setUserType] = useState<"elderly" | "guardian">(() => {
    const stored = localStorage.getItem('userType');
    return (stored as "elderly" | "guardian") || "elderly";
  });

  useEffect(() => {
    // Update userType based on path or localStorage
    if (isElderly) {
      setUserType("elderly");
      localStorage.setItem('userType', 'elderly');
    } else if (isGuardian) {
      setUserType("guardian");
      localStorage.setItem('userType', 'guardian');
    } else {
      // For common pages, keep the stored userType
      const stored = localStorage.getItem('userType');
      if (stored) {
        setUserType(stored as "elderly" | "guardian");
      }
    }
  }, [isElderly, isGuardian]);

  const handleBack = () => {
    navigate(-1);
  };

  const getHomePath = () => userType === "elderly" ? "/elderly/main" : "/guardian/main";

  return (
    <div className="h-screen bg-slate-200 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full h-full sm:h-[844px] sm:max-w-[390px] bg-white sm:rounded-[40px] sm:shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] border-slate-900 mx-auto">
        {/* Header */}
        {!hideHeader && (
          <header className="h-14 flex items-center px-4 shrink-0 bg-white z-20 justify-between border-b border-gray-100">
            <div className="flex items-center">
              {!isAuth && location.pathname !== "/elderly/main" && location.pathname !== "/guardian/main" && (
                <button onClick={handleBack} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
              )}
            </div>

            {!isAuth && (
              <div className="flex items-center space-x-2">
                <button onClick={() => navigate("/notifications")} className="p-2 text-slate-700 hover:bg-slate-100 rounded-full relative">
                  <Bell size={22} />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
            )}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white relative flex flex-col">
          <AnimatedOutlet />
        </main>

        {/* Bottom Nav */}
        {!hideNav && (
          <nav className="h-16 bg-white flex shrink-0 justify-around items-center px-2 z-20 border-t border-gray-100">
            <button
              onClick={() => navigate(getHomePath())}
              className={`flex flex-col items-center justify-center w-16 h-full ${location.pathname === getHomePath() ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <Home size={24} />
              <span className="text-[10px] mt-1 font-medium">홈</span>
            </button>
            <button
              onClick={() => navigate("/mypage")}
              className={`flex flex-col items-center justify-center w-16 h-full ${location.pathname === "/mypage" ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <User size={24} />
              <span className="text-[10px] mt-1 font-medium">내 정보</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}