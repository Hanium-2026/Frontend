import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { SplashPage } from "./pages/onboarding/SplashPage";
import { OnboardingPage } from "./pages/onboarding/OnboardingPage";
import { LoginPage } from "./pages/onboarding/LoginPage";
import { SignUpPage } from "./pages/onboarding/SignUpPage";
import { PermissionsPage } from "./pages/onboarding/PermissionsPage";
import { ConnectPage } from "./pages/onboarding/ConnectPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { MyPage } from "./pages/MyPage";
import { GeneralSettingsPage, NotificationSettingsPage } from "./pages/SettingsPages";
import {
  ElderlyMainPage,
  ElderlyPrepPage,
  ElderlyMeasuringPage,
  ElderlyAnalyzingPage,
  ElderlyResultPage,
} from "./pages/ElderlyPages";
import {
  GuardianMainPage,
  AnalysisResultDetailPage,
} from "./pages/GuardianPages";
import { GuardianRegisterPage } from "./pages/GuardianRegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: SplashPage },
      { path: "onboarding", Component: OnboardingPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignUpPage },
      { path: "permissions", Component: PermissionsPage },
      { path: "connect", Component: ConnectPage },

      // Elderly Flow
      { path: "elderly/main", Component: ElderlyMainPage },
      { path: "elderly/prep", Component: ElderlyPrepPage },
      { path: "elderly/measure", Component: ElderlyMeasuringPage },
      { path: "elderly/analyzing", Component: ElderlyAnalyzingPage },
      { path: "elderly/result", Component: ElderlyResultPage },

      // Guardian Flow
      { path: "guardian/main", Component: GuardianMainPage },
      { path: "guardian/register", Component: GuardianRegisterPage },

      // Shared Analysis Results
      { path: "analysis-results/:analysisResultId", Component: AnalysisResultDetailPage },

      // Common
      { path: "notifications", Component: NotificationsPage },
      { path: "mypage", Component: MyPage },
      { path: "settings/general", Component: GeneralSettingsPage },
      { path: "settings/notifications", Component: NotificationSettingsPage },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
