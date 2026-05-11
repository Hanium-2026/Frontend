import { useEffect } from "react";
import { useNavigate } from "react-router";
import appLogo from "../../../imports/nevologowithname.png";

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <img
        src={appLogo}
        alt="NEVO Logo"
        className="w-28 h-28 object-contain"
      />
    </div>
  );
}
