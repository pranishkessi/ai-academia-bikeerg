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
import { Doughnut, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS,
  ArcElement,
  Tooltip, 
  Legend, 
  Title, 
  LineElement,
  PointElement, 
  LinearScale,
  CategoryScale 
} from "chart.js";

// Register all required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

function App() {
  const [data, setData] = useState(null);
  const [ setLoading] = useState(true);
  const [chartLabels, setChartLabels] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [strokeData, setStrokeData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/data");
      const newData = response.data;
      setData(newData);
      setLoading(false); // ✅ Mark loading as done

      const timestamp = new Date().toLocaleTimeString();
      setChartLabels((prev) => [...prev.slice(-20), timestamp]);
      setPowerData((prev) => [...prev.slice(-20), newData.power_watts]);
      setStrokeData((prev) => [...prev.slice(-20), newData.stroke_rate]);
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

  // Energy Doughnut Chart
  const energyGoal = 0.5;
  const energyUsed = data?.energy_kwh ?? 0;

  const energyChartData = {
    labels: ["Energy Used", "Remaining"],
    datasets: [
      {
        label: "Energy (kWh)",
        data: [energyUsed, Math.max(energyGoal - energyUsed, 0)],
        backgroundColor: ["#3182ce", "#e2e8f0"],
        hoverOffset: 10,
      },
    ],
  };

  const energyChartOptions = {
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  // Live Line Chart
  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Power (W)",
        data: powerData,
        borderColor: "rgba(49, 130, 206, 1)",
        backgroundColor: "rgba(49, 130, 206, 0.2)",
        tension: 0.4,
      },
      {
        label: "Stroke Rate (spm)",
        data: strokeData,
        borderColor: "#ECC94B",
        backgroundColor: "rgba(236, 201, 75, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  

  return (
<Box
  bg="gray.100"
  minH="100vh"
  p={6}
  display="flex"
  justifyContent="center"
  alignItems="center"
>
  <Box
    bg={cardBg}
    width="100%"
    maxW="1400px"
    height="95vh"
    rounded="2xl"
    shadow="2xl"
    p={6}
    display="grid"
    gridTemplateColumns="1fr 1fr 2fr"
    gap={6}
    alignItems="start"
  >
    {/* Left Column - Metrics & Buttons */}
    <VStack align="start" spacing={4}>
      <Heading size="md"> Metrics</Heading>
      {data && (
        <>
          <Text fontSize="md"> <strong>Power:</strong> {data.power_watts} watts</Text>
          <Text fontSize="md"> <strong>Stroke:</strong> {data.stroke_rate} spm</Text>
          <Text fontSize="md"> <strong>Distance:</strong> {data.distance_meters} m</Text>
          <Text fontSize="md"> <strong>Time:</strong> {formatTime(data.elapsed_time)}</Text>
          <Text fontSize="md"> <strong>Energy:</strong> {data.energy_kwh} kWh</Text>
          <Text fontSize="md"> <strong>Status:</strong> {data.session_active ? "Active" : "Paused"}</Text>
        </>
      )}
      <HStack mt={4}>
        <Button colorScheme="green" onClick={startSession}>
          Start
        </Button>
        <Button colorScheme="red" onClick={stopSession}>
          Stop
        </Button>
      </HStack>
    </VStack>

    {/* Center Column - Doughnut */}
    <VStack spacing={4} justify="center" align="center">
      <Heading size="sm"> Energy Used</Heading>
      <Box boxSize="250px">
        <Doughnut data={energyChartData} options={energyChartOptions} />
      </Box>
    </VStack>

    {/* Right Column - Line Chart */}
    <VStack spacing={4} align="center">
      <Heading size="sm"> Live Power & Stroke</Heading>
      <Box width="100%" height="100%">
        <Line data={lineChartData} options={lineChartOptions} />
      </Box>
    </VStack>
  </Box>
</Box>


  );
}

export default App;
