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
    label: "Local image or sound recognition",
    threshold: 0.004,
    description: "Your energy is enough to power local AI for object or sound recognition!",
  },
  {
    label: "Speech-to-text transcription",
    threshold: 0.006,
    description: "You can now convert speech into text using AI-powered transcription!",
  },
  {
    label: "LLM inference (ChatGPT response)",
    threshold: 0.008,
    description: "Your energy can now power an entire language model like ChatGPT!",
  },
];

function TaskUnlockList({ energy }) {
  const hasFiredRef = useRef(false);
  const energyValue = parseFloat(energy) || 0;
  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);

  // 🎉 Fire confetti once when final threshold is met
  useEffect(() => {
    if (energyValue >= 0.008 && !hasFiredRef.current) {
      hasFiredRef.current = true;

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

      confetti({
        particleCount: 50,
        spread: 100,
        startVelocity: 30,
        decay: 0.9,
        scalar: 0.75,
        origin: { y: 0.6 },
      });
    }
  }, [energyValue]);

  // Tooltip appears only for the newly unlocked task
  useEffect(() => {
    const newlyUnlocked = tasks.findIndex(
      (task, i) =>
        energyValue >= task.threshold &&
        (i === tasks.length - 1 || energyValue < tasks[i + 1].threshold)
    );
    setActiveTooltipIndex(newlyUnlocked >= 0 ? newlyUnlocked : null);
  }, [energyValue]);

  return (
    <Box
      bg="gray.50"
      p={4}
      borderRadius="lg"
      boxShadow="md"
      mt={6}
      width="100%"
    >
      <Heading size="sm" mb={3}>
        AI Tasks Unlocked
      </Heading>
      <VStack align="start" spacing={3}>
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
