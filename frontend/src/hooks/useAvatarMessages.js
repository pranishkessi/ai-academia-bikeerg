import { useState, useEffect, useRef } from "react";
import { UNLOCKS, countUnlocked } from "../constants/unlocks";

/**
 * Unified message output:
 *   { text: string, kind: "default"|"success"|"warning"|"info"|"unlock" }
 */
export function useAvatarMessages({ energy, elapsedTime, sessionActive, unlockedTasks }) {
  const [message, setMessage] = useState({
    text: "WILLKOMMEN! Wenn Sie bereit sind, in die Pedale zu treten, drücken Sie zum Starten die grüne Taste (START).",
    kind: "info",
  });

  // Track previous values to detect transitions and keep last session totals
  const prevEnergyRef = useRef(0);
  const prevSessionActiveRef = useRef(sessionActive);
  const lastSessionEnergyRef = useRef(0);
  const lastMinuteShownRef = useRef(-1);

  // ---- SESSION START / STOP ----
  useEffect(() => {
    const wasActive = prevSessionActiveRef.current;

    // START: transitioned from false -> true
    if (!wasActive && sessionActive) {
      setMessage({ text: "Session gestartet! Treten Sie weiter in die Pedale, um Strom zu erzeugen. Und schalten Sie die erste KI-Aufgabe frei.", kind: "success" });
      // reset periodic pointers for new session
      lastMinuteShownRef.current = -1;
    }

    // While active, continuously remember last energy (to show after stop even if parent resets)
    if (sessionActive) {
      lastSessionEnergyRef.current = energy;
    }

    // STOP: transitioned from true -> false
    if (wasActive && !sessionActive) {
      const finalEnergy = lastSessionEnergyRef.current ?? energy ?? 0;

      const unlockedCount = countUnlocked(finalEnergy);
      const totalTasks = UNLOCKS.length;

      // One-line (concise)
      setMessage({
        text: `Session ended. You generated ${Number(finalEnergy).toFixed(3)} kWh • Tasks unlocked: ${unlockedCount} / ${totalTasks}`,
        kind: "info",
      });

      // If you prefer two lines, use this instead and enable whiteSpace="pre-line" (see step 3):
      // setMessage({
      //   text: `Session ended. You generated ${Number(finalEnergy).toFixed(3)} kWh!\nTasks unlocked: ${unlockedCount} / ${totalTasks}`,
      //   kind: "info",
      // });
    }

    prevSessionActiveRef.current = sessionActive;
  }, [sessionActive, energy]); // energy needed to keep lastSessionEnergyRef fresh

  // ---- TASK UNLOCKS (once per threshold crossing) ----
  useEffect(() => {
    const prevEnergy = prevEnergyRef.current;
    if (energy > prevEnergy) {
      const newlyUnlocked = unlockedTasks.find(
        (task) => energy >= task.threshold && prevEnergy < task.threshold
      );
      if (newlyUnlocked) {
        setMessage({ text: `Unlocked: ${newlyUnlocked.label} 🔓`, kind: "unlock" });
      }
    }
    prevEnergyRef.current = energy;
  }, [energy, unlockedTasks]);

  // ---- PERIODIC MOTIVATION / TRIVIA (every full minute) ----
  useEffect(() => {
    if (!sessionActive) return;
    const minute = Math.floor((elapsedTime || 0) / 60);
    if (minute > 0 && minute !== lastMinuteShownRef.current) {
      lastMinuteShownRef.current = minute;
      if (minute % 2 === 1) {
        setMessage({ text: "Keep going — you're powering AI magic! ⚡", kind: "success" });
      } else {
        setMessage({ text: "Did you know? 0.03 kWh can run voice AI!", kind: "info" });
      }
    }
  }, [elapsedTime, sessionActive]);

  return { message, setMessage };
}
