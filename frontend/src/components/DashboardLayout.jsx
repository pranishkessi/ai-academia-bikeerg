// src/components/DashboardLayout.jsx
import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Button,
  Text,
  VStack,
  Heading,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import SpeedometerChart from "./SpeedometerChart";
import LineChartLive from "./LineChartLive";
import TaskUnlockList from "./TaskUnlockList";

function DashboardLayout({
  metrics,
  history,
  sessionActive,
  showSummary,
  lastSession,
  onStart,
  onStop,
}) {
  const thresholds = [0.002, 0.004, 0.006, 0.008];
  const unlocked = lastSession
    ? thresholds.filter((t) => lastSession.energy_kwh >= t).length
    : 0;
  const statusColor = metrics?.connected ? "green.500" : "red.500";

  return (
    <Flex direction="column" minH="100vh" overflow="hidden" px={[2, 4, 8]} py={2} bg="gray.50">
      {/* Row 1 - Start/Stop + Metrics */}
      <Grid templateColumns={["1fr", null, "repeat(7, 1fr)"]} gap={4} mb={4}>
        <GridItem colSpan={1}>
          <VStack spacing={2}>
            <Button colorScheme="green" size="lg" onClick={onStart}>Start</Button>
            <Button colorScheme="red" size="lg" onClick={onStop}>Stop</Button>
          </VStack>
        </GridItem>

        {[
          ["Power", `${metrics?.power_watts || 0} W`],
          ["Stroke", `${metrics?.stroke_rate || 0} SPM`],
          ["Distance", `${metrics?.distance_meters || 0} m`],
          ["Time", formatTime(metrics?.elapsed_time || 0)],
          ["Energy", `${(metrics?.energy_kwh || 0).toFixed(4)} kWh`],
          ["Status", metrics?.connected ? (
           <Box as="span" color="green.500">Connected</Box>
          ) : (
           <Box as="span" color="red.500">Not Connected</Box>
          )],
        ].map(([label, value]) => (
          <GridItem
            key={label}
            colSpan={1}
            bg="#cae8eb"
            borderRadius="md"
            textAlign="center"
            p={3}
            boxShadow="sm"
          >
            <Heading as="h3" size="sm" color="gray.600">
              {label}
            </Heading>
            <Text mt={2} fontWeight="bold" fontSize="lg">
              {value}
            </Text>
          </GridItem>
        ))}
      </Grid>

      {/* Row 2 - Charts */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={4}>
        <GridItem>
          <Box bg="#cae8eb" p={4} borderRadius="md" height="100%" boxShadow="sm">
            <Heading size="sm" mb={2}>Energy Speedometer</Heading>
            <SpeedometerChart energy={metrics?.energy_kwh || 0} />
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="#cae8eb" p={4} borderRadius="md" height="300px" overflow="hidden" boxShadow="sm">
            <Heading size="sm" mb={2}>Live Power & Stroke</Heading>
            <LineChartLive power={metrics?.power_watts || 0} stroke={metrics?.stroke_rate || 0} />
          </Box>
        </GridItem>
      </Grid>

      {/* Row 3 - AI Tasks + Animation Box */}
      <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap={4} mb={4} flexGrow={1}>
        <GridItem>
          <Box bg="#cae8eb" p={4} borderRadius="md" height="100%" boxShadow="sm">
            <TaskUnlockList energy={metrics?.energy_kwh || 0} />
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="#cae8eb" p={4} borderRadius="md" height="100%" boxShadow="sm" textAlign="center">
            <Text fontSize="sm" color="gray.400">[ Reserved for future AI avatar / animations ]</Text>
          </Box>
        </GridItem>
      </Grid>

      {/* Footer - Logo placement */}
      <Box w="100%" py={4} textAlign="center" borderTop="1px solid #CBD5E0">
        <Flex justify="center" align="center" gap={8}>
          <img src="/Logo.png" alt="Funder Logo" style={{ maxHeight: "90px" }} />
        </Flex>
      </Box>
    </Flex>
  );
}

const formatTime = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default DashboardLayout;
