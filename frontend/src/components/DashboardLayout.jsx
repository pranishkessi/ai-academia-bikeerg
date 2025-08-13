// src/components/DashboardLayout.jsx
import React from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Flex,
} from "@chakra-ui/react";
import SpeedometerChart from "./SpeedometerChart";
import LineChartLive from "./LineChartLive";
import AITaskImageGrid from "./AITaskImageGrid";
import AvatarDisplay from "./AvatarDisplay";
import { useAvatarMessages } from "../hooks/useAvatarMessages";

function DashboardLayout({ metrics, onStart, onStop, sessionActive }) {
  const energy = metrics?.energy_kwh || 0;
  const power = metrics?.power_watts || 0;
  const stroke = metrics?.stroke_rate || 0;
  const distance = metrics?.distance_meters || 0;
  const time = metrics?.elapsed_time || 0;
  const status = metrics?.connected ? "Connected" : "Not Connected";

  const unlockedTasks = [
    { label: "Einfache Google-Suche", threshold: 0.002 },
    { label: "Sound recognition", threshold: 0.004 },
    { label: "Speech-to-text transcription", threshold: 0.006 },
    { label: "LLM (ChatGPT response)", threshold: 0.008 },
  ];

  const { message } = useAvatarMessages({
    energy,
    elapsedTime: time,
    sessionActive,
    unlockedTasks,
  });

  return (
    <VStack spacing={4} w="100vw" h="100vh" p={4} bg="#cbdfe6">
      {/* Top Metrics & Controls */}
      <Grid templateColumns="repeat(9, 1fr)" gap={4} w="100%">
        {/* Start/Stop + Language */}
        <GridItem colSpan={1}>
          <VStack spacing={4} align="start">
            <HStack spacing={4}>
              <Button
                onClick={onStart}
                bg="green.500"
                color="white"
                borderRadius="full"
                height="120px"
                width="120px"
                fontSize="md"
                fontWeight="bold"
                _hover={{ bg: "green.600" }}
              >
                START
              </Button>
              <Button
                onClick={onStop}
                bg="red.500"
                color="white"
                borderRadius="full"
                height="120px"
                width="120px"
                fontSize="md"
                fontWeight="bold"
                _hover={{ bg: "red.600" }}
              >
                STOP
              </Button>
            </HStack>
            <HStack spacing={4} pt={4}>
              <Button size="sm">DE</Button>
              <Button size="sm">EN</Button>
            </HStack>
          </VStack>
        </GridItem>

        {/* Metrics */}
        {[
          { label: "Power", value: `${power} W` },
          { label: "Stroke", value: `${stroke} RPM` },
          { label: "Distance", value: `${distance} m` },
          { label: "Time", value: formatTime(time) },
          { label: "Energy", value: `${energy.toFixed(4)} kWh` },
          {
            label: "Status",
            value: (
              <Text color={metrics?.connected ? "green.500" : "red.500"}>
                {status}
              </Text>
            ),
          },
        ].map((item, idx) => (
          <GridItem
            key={idx}
            p={1}
            bg="white"
            borderRadius="md"
            textAlign="center"
            boxShadow="sm"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Heading size="sm" color="gray.600">
              {item.label}
            </Heading>
            <Box mt={1} fontWeight="bold" fontSize="lg">
              {item.value}
            </Box>
          </GridItem>
        ))}
        {/* Rightmost column was used for test buttons — now unused */}
        <GridItem />
      </Grid>

      {/* Main Dashboard: 70-30 Split */}
      <Grid templateColumns="7fr 3fr" gap={4} w="100%" flex={1}>
        {/* LEFT (70%) */}
        <GridItem>
          <Grid templateRows="1fr 1fr" gap={4} h="100%">
            {/* Speedometer + Chart */}
            <Grid templateColumns="1fr 1fr" gap={4}>
              <Flex p={4} bg="#cae8eb" borderRadius="md" boxShadow="md" justify="center" align="center">
                <SpeedometerChart energy={energy} />
              </Flex>
              <Flex p={4} bg="#cae8eb" borderRadius="md" boxShadow="md" height="100%">
                <LineChartLive power={power} stroke={stroke} />
              </Flex>
            </Grid>

            {/* Tasks */}
            <Flex p={4} bg="#cae8eb" borderRadius="md" boxShadow="md" align="flex-start" justify="flex-start">
              <AITaskImageGrid energy={energy} />
            </Flex>
          </Grid>
        </GridItem>

        {/* RIGHT (30%) */}
        <GridItem>
          <Box
            p={4}
            bg="#cae8eb"
            borderRadius="md"
            boxShadow="md"
            h="100%"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            alignItems="center"
            position="relative"
          >
            <AvatarDisplay message={message} />
          </Box>
        </GridItem>
      </Grid>

      {/* Footer: Logos */}
      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        pt={2}
        w="100%"
        borderTop="1px solid #CBD5E0"
        bg="white"
        py={4}
        px={6}
        borderRadius="md"
      >
        {["/BMFTR_Logo2.png", "/INIT_Logo.png", "/KI_Akademie_OWL_Logo.jpg", "/visual.png"].map((src, idx) => (
          <Box key={idx} display="flex" justifyContent="center" alignItems="center">
            <Image src={src} alt={`Logo ${idx + 1}`} maxH="130px" />
          </Box>
        ))}
      </Grid>
    </VStack>
  );
}

const formatTime = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default DashboardLayout;
