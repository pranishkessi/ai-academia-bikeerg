import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Text,
  VStack,
  Heading,
  HStack,
  Icon,
  Tooltip,
  ScaleFade,
} from "@chakra-ui/react";
import { FaLock, FaUnlock } from "react-icons/fa";
import confetti from "canvas-confetti";

const tasks = [
  {
    label: "Simple Google search query",
    threshold: 0.002,
    description: "You can now power a Google search query using the generated energy!",
  },
  {
    label: "Sound recognition",
    threshold: 0.004,
    description: "Your energy is enough to power local AI for object or sound recognition!",
  },
  {
    label: "Speech-to-text transcription",
    threshold: 0.006,
    description: "You can now convert speech into text using AI-powered transcription!",
  },
  {
    label: "LLM (ChatGPT response)",
    threshold: 0.008,
    description: "Your energy can now power an entire language model like ChatGPT!",
  },
];

function TaskUnlockList({ energy }) {
  const energyValue = parseFloat(energy) || 0;

  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);
  const hasFiredRefs = useRef(new Array(tasks.length).fill(false));
  const prevEnergyRef = useRef(0);

  // 🔄 Reset state when a new session starts (i.e. energy drops sharply)
  useEffect(() => {
    if (energyValue < 0.001 && prevEnergyRef.current >= 0.001) {
      setActiveTooltipIndex(null);
      hasFiredRefs.current = new Array(tasks.length).fill(false);
    }
    prevEnergyRef.current = energyValue;
  }, [energyValue]);

  // 🎉 Confetti + Tooltip logic per threshold
  useEffect(() => {
    tasks.forEach((task, idx) => {
      if (energyValue >= task.threshold && !hasFiredRefs.current[idx]) {
        hasFiredRefs.current[idx] = true;

        // Confetti animation
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          scalar: 0.9,
        });

        // Set tooltip for that task only
        setActiveTooltipIndex(idx);
      }
    });
  }, [energyValue]);

  return (
    <Box
      bg="transparent"
      p={4}
      borderRadius="md"
      minHeight="320px"
      maxHeight="320px"
      overflowY="auto"
    >
      <Heading size="sm" mb={3}>
        AI Tasks
      </Heading>
      <VStack align="start" spacing={3} maxHeight="250px" overflow="auto">
        {tasks.map((task, idx) => {
          const unlocked = energyValue >= task.threshold;
          const showTooltip = idx === activeTooltipIndex;

          return (
            <ScaleFade in={true} key={idx}>
              <Tooltip
                hasArrow
                placement="right"
                label={showTooltip ? task.description : ""}
                isOpen={showTooltip}
                shouldWrapChildren
              >
                <HStack
                  spacing={3}
                  p={3}
                  borderRadius="md"
                  width="100%"
                  bg={unlocked ? "green.50" : "gray.100"}
                  borderWidth={unlocked ? "1px" : "0px"}
                  borderColor={unlocked ? "green.400" : "gray.200"}
                >
                  <Icon
                    as={unlocked ? FaUnlock : FaLock}
                    color={unlocked ? "green.500" : "gray.400"}
                  />
                  <Text fontWeight="medium" color={unlocked ? "green.700" : "gray.600"}>
                    {task.label}
                  </Text>
                  <Text
                    ml="auto"
                    fontWeight="bold"
                    color={unlocked ? "green.500" : "gray.500"}
                  >
                    {unlocked ? "UNLOCKED" : "LOCKED"}
                  </Text>
                </HStack>
              </Tooltip>
            </ScaleFade>
          );
        })}
      </VStack>
    </Box>
  );
}

export default TaskUnlockList;
