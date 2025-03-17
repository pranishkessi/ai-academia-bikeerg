import { useState, useEffect } from "react";
import axios from "axios";
import { ChakraProvider, Box, Text, Button, VStack, Spinner } from "@chakra-ui/react";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from FastAPI
  useEffect(() => {
    axios.get("http://127.0.0.1:8080/data")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
        setLoading(false);
      });
  }, []);

  return (
    <ChakraProvider>
      <VStack minH="100vh" justify="center" bg="gray.100" p={5}>
        <Box bg="white" p={6} rounded="md" shadow="lg" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Concept2 BikeErg PM5 Data
          </Text>

          {loading && <Spinner size="xl" />}
          {error && <Text color="red.500">{error}</Text>}
          
          {data && (
            <>
              <Text>⚡ Power: <strong>{data.power_watts} watts</strong></Text>
              <Text>🚴 Stroke Rate: <strong>{data.stroke_rate} spm</strong></Text>
              <Text>📏 Distance: <strong>{data.distance_meters} meters</strong></Text>
              <Text>⏳ Elapsed Time: <strong>{data.elapsed_time} sec</strong></Text>
              <Text>🔋 Energy: <strong>{data.energy_kwh} kWh</strong></Text>
            </>
          )}

          <Button colorScheme="blue" mt={4} onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
