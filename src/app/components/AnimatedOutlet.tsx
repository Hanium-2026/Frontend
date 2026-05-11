import { useLocation, useOutlet, useNavigationType } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useEffect } from "react";

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const navigationType = useNavigationType();

  const outletRef = useRef(outlet);
  useEffect(() => {
    outletRef.current = outlet;
  }, [outlet]);

  const isBack = navigationType === "POP";

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={{ x: isBack ? "-100%" : "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isBack ? "30%" : "-30%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full flex-1 flex flex-col"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
