import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MeasurementContextType {
  isMeasuring: boolean;
  score: number;
  time: number;
  startMeasurement: () => void;
  stopMeasurement: () => void;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [score, setScore] = useState(100);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMeasuring) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
        setScore((prev) => {
          // Simulate realistic score fluctuation
          const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newScore = prev + variation;
          return Math.min(100, Math.max(60, newScore));
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMeasuring]);

  const startMeasurement = () => {
    setIsMeasuring(true);
    setScore(100);
    setTime(0);
  };

  const stopMeasurement = () => {
    setIsMeasuring(false);
  };

  return (
    <MeasurementContext.Provider value={{ isMeasuring, score, time, startMeasurement, stopMeasurement }}>
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurement() {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error("useMeasurement must be used within a MeasurementProvider");
  }
  return context;
}
