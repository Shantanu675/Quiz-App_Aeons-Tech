import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react"; // install lucide-react if not already

export default function Timer({ seconds, onExpire }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) {
      onExpire();
      return;
    }
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [time, onExpire]);

  const mm = Math.floor(time / 60);
  const ss = (time % 60).toString().padStart(2, "0");

  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border
                 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg my-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Clock className="w-6 h-6" />
      </motion.div>
      <span>
        {mm}:{ss}
      </span>
    </motion.div>
  );
}
