import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import {
  Box,
  ChakraProvider,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import DashboardLayout from "./components/DashboardLayout";
import TaskUnlockList from "./components/TaskUnlockList";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Inactive");
  const toast = useToast();
  const [sessionEnded, setSessionEnded] = useState(false);


  // Fetch data from backend API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/data");
      setData(response.data);

      // Automatically update status from backend
      if (response.data.session_active) {
        setStatus("Active");
      } else {
        setStatus("Inactive");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Always poll the backend every second
  useEffect(() => {
    fetchData(); // initial fetch
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
      setSessionEnded(true); // show summary
    } catch (error) {
      console.error("Error stopping session:", error);
    }
  };

  // Show loading spinner until backend returns active session
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
        />

        <Box>
          <TaskUnlockList energy={data.energy_kwh} />
        </Box>
        {sessionEnded && (
  <Box p={4} mt={6} bg="blue.50" borderRadius="md" boxShadow="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
    Session Summary
    </Text>
    <Text>Elapsed Time: {formatTime(data.elapsed_time)}</Text>
    <Text>Distance: {data.distance_meters} meters</Text>
    <Text>Energy: {data.energy_kwh} kWh</Text>
    <Text>Tasks Unlocked: {
      // Count how many tasks were unlocked
      ["0.002", "0.004", "0.006", "0.008"].filter(t => data.energy_kwh >= parseFloat(t)).length
    } / 4
    </Text>
  </Box>
)}

      </VStack>
    </ChakraProvider>
  );
}

// Helper to format seconds into MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default App;
