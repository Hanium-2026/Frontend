import { RouterProvider } from "react-router";
import { router } from "./routes";
import { MeasurementProvider } from "./context/MeasurementContext";

export default function App() {
  return (
    <MeasurementProvider>
      <RouterProvider router={router} />
    </MeasurementProvider>
  );
}
