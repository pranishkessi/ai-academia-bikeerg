import React from "react";
import {
  Box,
  Text,
  VStack,
  Heading,
  HStack,
  Icon,
  ScaleFade,
} from "@chakra-ui/react";
import { FaLock, FaUnlock } from "react-icons/fa";

const tasks = [
  {
    label: "🔍 Simple Google search query",
    threshold: 0.002,
  },
  {
    label: "🧠 Local image or sound recognition",
    threshold: 0.007,
  },
  {
    label: "📝 Speech-to-text transcription",
    threshold: 0.009,
  },
  {
    label: "🤖 LLM inference (ChatGPT response)",
    threshold: 0.02,
  },
];

function TaskUnlockList({ energy }) {
  const energyValue = parseFloat(energy); // Ensure it's numeric

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
        🔓 AI Tasks Unlocked
      </Heading>
      <VStack align="start" spacing={3}>
        {tasks.map((task, idx) => {
          const unlocked = energyValue >= task.threshold;

          return (
            <ScaleFade key={idx} initialScale={0.9} in={true}>
              <HStack
                spacing={3}
                w="100%"
                justify="space-between"
                p={2}
                borderRadius="md"
                bg={unlocked ? "green.50" : "gray.100"}
                border="1px solid"
                borderColor={unlocked ? "green.300" : "gray.300"}
              >
                <HStack>
                  <Icon
                    as={unlocked ? FaUnlock : FaLock}
                    color={unlocked ? "green.500" : "gray.400"}
                  />
                  <Text>{task.label}</Text>
                </HStack>
                <Text
                  fontWeight="bold"
                  color={unlocked ? "green.500" : "gray.500"}
                >
                  {unlocked ? "UNLOCKED" : "LOCKED"}
                </Text>
              </HStack>
            </ScaleFade>
          );
        })}
      </VStack>
    </Box>
  );
}

export default TaskUnlockList;
