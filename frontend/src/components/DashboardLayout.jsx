// src/components/DashboardLayout.jsx
import React, { useEffect, useRef, useState } from "react";
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
  // ────────────────────────────────────────────────────────────────────────────
  // Live metrics (props from parent)
  // ────────────────────────────────────────────────────────────────────────────
  const energy = metrics?.energy_kwh || 0;
  const power = metrics?.power_watts || 0;
  const stroke = metrics?.stroke_rate || 0;
  const distance = metrics?.distance_meters || 0;
  const time = metrics?.elapsed_time || 0;
  const status = metrics?.connected ? "Connected" : "Not Connected";

  // ────────────────────────────────────────────────────────────────────────────
  // Tunables
  // ────────────────────────────────────────────────────────────────────────────
  const TASK_THRESHOLDS = [0.002, 0.004, 0.006, 0.008]; // kWh
  const FINAL_UNLOCK_DELAY_MS = 2500;                    // debounce before auto-end
  const IDLE_LIMIT_SEC = 60;                             // end after 60s idle
  const WARNING_BEFORE_END_SEC = 10;                     // 10→0 countdown
  const SESSION_START_GRACE_SEC = 5;                     // ignore idle for first 5s
  const MIN_ACTIVE_POWER = 3;                            // filter watt noise

  // ────────────────────────────────────────────────────────────────────────────
  // Avatar messages
  // ────────────────────────────────────────────────────────────────────────────
  const unlockedTasks = [
    { label: "6 Google-Suchanfragen", threshold: 0.002 },
    { label: "Bilderkennung", threshold: 0.004 },
    { label: "20 ChatGpt-Abfragen", threshold: 0.006 },
    { label: "Text zu Audio", threshold: 0.008 },
  ];

  const { message } = useAvatarMessages({
    energy,
    elapsedTime: time,
    sessionActive,
    unlockedTasks,
  });

  // High-priority override for warnings/completion notes
  const [overrideMessage, setOverrideMessage] = useState(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Refs & local state for guards and timers
  // ────────────────────────────────────────────────────────────────────────────
  const allUnlockedRef = useRef(false);
  const finalUnlockTimerRef = useRef(null);

  const lastActiveRef = useRef(Date.now());
  const idleTickerRef = useRef(null);
  const infoTimeoutRef = useRef(null);

  const onStopRef = useRef(onStop);             // <— keep callback stable
  useEffect(() => { onStopRef.current = onStop; }, [onStop]);

  const [idleSeconds, setIdleSeconds] = useState(0);
  const [idleCountdown, setIdleCountdown] = useState(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Reset idle machinery and show a tiny "started" note on (re)start
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionActive) {
      lastActiveRef.current = Date.now();
      setIdleSeconds(0);
      setIdleCountdown(null);
      setOverrideMessage(null);

      clearTimeout(infoTimeoutRef.current);
      setOverrideMessage({ kind: "info", text: "Session started — let’s roll 🚴" });
      infoTimeoutRef.current = setTimeout(() => setOverrideMessage(null), 1500);
    }
    return () => {
      clearTimeout(infoTimeoutRef.current);
    };
  }, [sessionActive]);

  // ────────────────────────────────────────────────────────────────────────────
  // Activity detector — refresh lastActive when power/stroke show motion
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return;

    const isActiveNow = (power ?? 0) > MIN_ACTIVE_POWER || (stroke ?? 0) > 0;
    if (isActiveNow) {
      lastActiveRef.current = Date.now();

      // If countdown/warning was visible, cancel it and show a brief info
      if (idleCountdown !== null || overrideMessage?.kind === "warning") {
        setIdleCountdown(null);
        setOverrideMessage({ kind: "info", text: "Toll! Countdown abgebrochen — weiter geht‘s" });
        clearTimeout(infoTimeoutRef.current);
        infoTimeoutRef.current = setTimeout(() => setOverrideMessage(null), 2000);
      }
    }
  }, [power, stroke, sessionActive, idleCountdown, overrideMessage]);

  // ────────────────────────────────────────────────────────────────────────────
  // Idle ticker (1s) — 5s grace → warn at 50s → end at 60s
  // NOTE: depends ONLY on sessionActive so we don't recreate every tick.
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return;

    clearInterval(idleTickerRef.current);
    idleTickerRef.current = setInterval(() => {
      const idleSec = Math.floor((Date.now() - lastActiveRef.current) / 1000);
      setIdleSeconds(idleSec);

      // Grace window right after session start
      if (idleSec < SESSION_START_GRACE_SEC) {
        if (idleCountdown !== null) setIdleCountdown(null);
        if (overrideMessage?.kind === "warning") setOverrideMessage(null);
        return;
      }

      const warnAt = IDLE_LIMIT_SEC - WARNING_BEFORE_END_SEC; // e.g., 50
      if (idleSec >= warnAt && idleSec < IDLE_LIMIT_SEC) {
        const remaining = IDLE_LIMIT_SEC - idleSec; // 10..1
        if (idleCountdown !== remaining) setIdleCountdown(remaining);
        setOverrideMessage({
          kind: "warning",
          text: `Sind Sie da?\nTreten Sie weiter in die Pedale oder die Sitzung endet in ${remaining} Sekunde${remaining === 1 ? "" : "n"}…`,
        });
      } else if (idleSec >= IDLE_LIMIT_SEC) {
        setIdleCountdown(null);
        setOverrideMessage(null);
        onStopRef.current && onStopRef.current({ reason: "idle-timeout" });
      } else {
        // Below warning threshold → hide any warning
        if (idleCountdown !== null) setIdleCountdown(null);
        if (overrideMessage?.kind === "warning") setOverrideMessage(null);
      }
    }, 1000);

    return () => clearInterval(idleTickerRef.current);
  }, [sessionActive]); // ⬅ keep deps minimal

  // ────────────────────────────────────────────────────────────────────────────
  // [AUTO-END FINAL THRESHOLDS] — stop once all 4 thresholds are met
  // IMPORTANT: do NOT clear the timeout on energy changes (that was the bug).
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return;

    const unlocked = TASK_THRESHOLDS.filter((t) => energy >= t).length;
    if (unlocked === TASK_THRESHOLDS.length && !allUnlockedRef.current) {
      allUnlockedRef.current = true;

      setOverrideMessage({
        kind: "success",
        text: "Erstaunlich! Sie haben alle KI-Aufgaben freigeschaltet. Jetzt endet die Sitzung automatisch",
      });

      // Schedule the stop once — do not cancel if energy keeps updating.
      clearTimeout(finalUnlockTimerRef.current);
      finalUnlockTimerRef.current = setTimeout(() => {
        setOverrideMessage(null);
        onStopRef.current && onStopRef.current({ reason: "completed" });
      }, FINAL_UNLOCK_DELAY_MS);
    }
    // NOTE: no cleanup here on purpose.
  }, [energy, sessionActive]);

  // ────────────────────────────────────────────────────────────────────────────
  // Cleanup when session stops or component unmounts
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) {
      allUnlockedRef.current = false;
      setOverrideMessage(null);
      setIdleCountdown(null);
      setIdleSeconds(0);
      clearInterval(idleTickerRef.current);
      clearTimeout(finalUnlockTimerRef.current);
      clearTimeout(infoTimeoutRef.current);
    }
    return () => {
      clearInterval(idleTickerRef.current);
      clearTimeout(finalUnlockTimerRef.current);
      clearTimeout(infoTimeoutRef.current);
    };
  }, [sessionActive]);

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
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
                isDisabled={sessionActive}
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
                onClick={() => onStop && onStop({ reason: "manual" })}
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
          { label: "Leistung", value: `${power} W` },
          { label: "Schlaganfall", value: `${stroke} RPM` },
          { label: "Distanz", value: `${distance} m` },
          { label: "Zeit", value: formatTime(time) },
          { label: "Energie", value: `${energy.toFixed(4)} kWh` },
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

        {/* Rightmost placeholder for balance */}
        <GridItem />
      </Grid>

      {/* Main Dashboard: 70-30 Split */}
      <Grid templateColumns="7fr 3fr" gap={4} w="100%" flex={1}>
        {/* LEFT (70%) */}
        <GridItem>
          <Grid templateRows="1fr 1fr" gap={4} h="100%">
            {/* Speedometer + Chart */}
            <Grid templateColumns="1fr 1fr" gap={4}>
              <Flex
                p={4}
                bg="#cae8eb"
                borderRadius="md"
                boxShadow="md"
                justify="center"
                align="center"
              >
                <SpeedometerChart energy={energy} />
              </Flex>
              <Flex
                p={4}
                bg="#cae8eb"
                borderRadius="md"
                boxShadow="md"
                height="100%"
              >
                <LineChartLive power={power} stroke={stroke} />
              </Flex>
            </Grid>

            {/* Tasks */}
            <Flex
              p={4}
              bg="#cae8eb"
              borderRadius="md"
              boxShadow="md"
              align="flex-start"
              justify="flex-start"
            >
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
            {/* overrideMessage takes priority over hook's message */}
            <AvatarDisplay message={overrideMessage || message} />
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
        {[
          "/BMFTR_Logo2.png",
          "/INIT_Logo.png",
          "/KI_Akademie_OWL_Logo.jpg",
          "/visual.png",
        ].map((src, idx) => (
          <Box
            key={idx}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
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
