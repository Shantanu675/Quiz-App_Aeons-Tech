import { useEffect, useState } from 'react';

export default function Timer({ seconds, onExpire }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) {
      onExpire();
      return;
    }
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [time, onExpire]);

  const mm = Math.floor(time / 60);
  const ss = (time % 60).toString().padStart(2, '0');
  return <div className="text-red-500 font-bold">Time Left: {mm}:{ss}</div>;
}