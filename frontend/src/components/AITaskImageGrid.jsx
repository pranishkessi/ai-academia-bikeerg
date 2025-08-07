import React from "react";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const segmentColors = ["#A0AEC0", "#63B3ED", "#F6AD55", "#48BB78"];

const TASKS = [
  {
    id: "google",
    threshold: 0.002,
    lockedImg: "/MYSTERY_1.1.png",
    unlockedImg: "/MYSTERY_REVELED_1.png",
  },
  {
    id: "sound",
    threshold: 0.004,
    lockedImg: "/MYSTERY_2.2.png",
    unlockedImg: "/MYSTERY_REVELED_2.png",
  },
  {
    id: "stt",
    threshold: 0.006,
    lockedImg: "/MYSTERY_3.3.png",
    unlockedImg: "/MYSTERY_REVELED_1.png",
  },
  {
    id: "llm",
    threshold: 0.008,
    lockedImg: "/MYSTERY_4.4.png",
    unlockedImg: "/MYSTERY_REVELED_2.png",
  },
];

function AITaskImageGrid({ energy }) {
  const hasCelebrated = React.useRef([false, false, false, false]);

  React.useEffect(() => {
    TASKS.forEach((task, idx) => {
      if (
        energy >= task.threshold &&
        !hasCelebrated.current[idx]
      ) {
        hasCelebrated.current[idx] = true;
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, scalar: 0.85 });
      }
    });
  }, [energy]);

  return (
    <SimpleGrid columns={4} spacing={6} w="100%" py={2} minChildWidth="220px" maxH="220px" alignItems="start">
      {TASKS.map((task, idx) => {
        const unlocked = Number(energy) >= task.threshold;
        const borderColor = segmentColors[idx];

        return (
          <Box
            key={task.id}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={unlocked ? "unlocked" : "locked"}
                src={unlocked ? task.unlockedImg : task.lockedImg}
                alt={unlocked ? "Unlocked" : "Locked"}
                style={{
                  width: "70%",
                  height: "70%",
                  objectFit: "contain",
                  border: `18px solid ${borderColor}`,
                  borderRadius: "1.5rem",
                  boxShadow: "0 6px 30px 0 rgba(30,30,30,0.10)",
                  transition: "border-color 0.2s",
                  background: "#cae8eb",
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

export default AITaskImageGrid;
