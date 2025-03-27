import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  Spinner,
  useColorModeValue,
  HStack
} from "@chakra-ui/react";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/data");
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startSession = async () => {
    await axios.post("http://127.0.0.1:8080/start");
  };

  const stopSession = async () => {
    await axios.post("http://127.0.0.1:8080/stop");
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Box
      bg="gray.100"
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <Box bg={cardBg} p={6} rounded="xl" shadow="lg" textAlign="center">
        <VStack spacing={4}>
          <Heading size="md">🚴‍♂️ Concept2 BikeErg PM5 Data</Heading>

          {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
              <Text>⚡ <strong>Power:</strong> {data.power_watts} watts</Text>
              <Text>🚲 <strong>Stroke Rate:</strong> {data.stroke_rate} spm</Text>
              <Text>📏 <strong>Distance:</strong> {data.distance_meters} meters</Text>
              <Text>⏳ <strong>Elapsed Time:</strong> {data.elapsed_time} sec</Text>
              <Text>🔋 <strong>Energy:</strong> {data.energy_kwh} kWh</Text>
              <Text>📡 <strong>Status:</strong> {data.session_active ? "Active" : "Paused"}</Text>
            </>
          )}

          <HStack>
            <Button colorScheme="green" onClick={startSession}>
              Start Session
            </Button>
            <Button colorScheme="red" onClick={stopSession}>
              Stop Session
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

export default App;
