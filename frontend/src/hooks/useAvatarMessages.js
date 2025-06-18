import { useState, useEffect } from "react";

export function useAvatarMessages({ energy, elapsedTime, sessionActive, unlockedTasks }) {
  const [message, setMessage] = useState(null);
  const [prevEnergy, setPrevEnergy] = useState(0);

  useEffect(() => {
    if (sessionActive && elapsedTime < 2) {
      setMessage({ type: "toast", text: "Let’s go! I’m tracking your energy!" });
    }

    if (!sessionActive && elapsedTime > 0) {
      setMessage({ type: "toast", text: "Great work! Here's your summary." });
    }

    if (energy > prevEnergy) {
      const newlyUnlocked = unlockedTasks.find(
        (task) => energy >= task.threshold && prevEnergy < task.threshold
      );
      if (newlyUnlocked) {
        setMessage({ type: "bubble", text: `Nice! You just unlocked "${newlyUnlocked.label}" 🔓` });
      }
    }

    setPrevEnergy(energy);
  }, [energy, sessionActive, elapsedTime]);

  useEffect(() => {
    if (sessionActive && elapsedTime > 0 && elapsedTime % 60 === 0) {
      setMessage({ type: "float", text: "Keep going — you're doing great! 💪" });
    }
  }, [elapsedTime]);

  // ✅ Ensure test function is returned
  return {
    message,
    clearMessage: () => setMessage(null),
    testSetMessage: (msg) => setMessage(msg),
  };
}
