// App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  ChakraProvider,
  VStack,
  Text,
  Spinner,
  useToast,
  ScaleFade,
} from "@chakra-ui/react";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Inactive");
  const toast = useToast();
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8080/data");
        setData(response.data);
        setStatus(response.data.session_active ? "Active" : "Inactive");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    if (isRunning) {
      toast({
        title: "Session already running.",
        description: "You must stop the current session before starting a new one.",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8080/start");
      setStatus("Active");
      setIsRunning(true);
      setSessionEnded(false);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const handleStop = async () => {
    try {
      await axios.post("http://127.0.0.1:8080/stop");
      setStatus("Inactive");
      setIsRunning(false);
      setSessionEnded(true);
    } catch (error) {
      console.error("Error stopping session:", error);
    }
  };

  if (!data) {
    return (
      <ChakraProvider>
        <Box p={8} textAlign="center">
          <Text mb={4}>Loading session data...</Text>
          <Spinner size="xl" />
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <VStack p={4} spacing={6} align="stretch">
        <DashboardLayout
          metrics={{
            power: data.power_watts,
            stroke: data.stroke_rate,
            distance: data.distance_meters,
            time: formatTime(data.elapsed_time),
            energy: data.energy_kwh,
            status: status,
          }}
          onStart={handleStart}
          onStop={handleStop}
          energy={data.energy_kwh}
        />

{sessionEnded && (
  <ScaleFade initialScale={0.9} in={sessionEnded}>
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      bg="white"
      borderRadius="lg"
      boxShadow="2xl"
      p={6}
      maxW="500px"
      width="90%"
      border="2px solid #CBD5E0"
      zIndex={1000}
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="blue.700">
        Session Summary
      </Text>

      {/* Close Button */}
      <Box position="absolute" top="10px" right="10px">
        <button
          onClick={() => setSessionEnded(false)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#999",
          }}
          aria-label="Close Summary"
        >
          ✖
        </button>
      </Box>

      <VStack align="start" spacing={2}>
        <Text><strong>Elapsed Time:</strong> {formatTime(data.elapsed_time)}</Text>
        <Text><strong>Distance:</strong> {data.distance_meters} meters</Text>
        <Text><strong>Energy:</strong> {data.energy_kwh} kWh</Text>
        <Text><strong>Tasks Unlocked:</strong> {
          ["0.002", "0.004", "0.006", "0.008"].filter(t => data.energy_kwh >= parseFloat(t)).length
        } / 4</Text>
      </VStack>
    </Box>
  </ScaleFade>
)}

      </VStack>
    </ChakraProvider>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default App;
