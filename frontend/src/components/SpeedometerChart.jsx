import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

function SpeedometerChart({ energy }) {
  const thresholds = [0.002, 0.004, 0.006, 0.008]; // Adjustable thresholds
  const colors = ["#A0AEC0", "#63B3ED", "#F6AD55", "#48BB78"]; // gray, blue, orange, green

  // Chart Data with useMemo to prevent rerenders
  const chartData = useMemo(() => ({
    labels: ["0-0.002", "0.002-0.004", "0.004-0.006", "0.006-0.008"],
    datasets: [
      {
        data: [1, 1, 1, 1],
        backgroundColor: thresholds.map((t, i) =>
          energy >= t ? colors[i] : "#E2E8F0" // gray.200
        ),
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "80%",
      },
    ],
  }), [energy]);

  // Chart Options with useMemo
  const chartOptions = useMemo(() => ({
    plugins: {
      tooltip: { enabled: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  }), []);

  // Clock-hand angle logic
  const angle = useMemo(() => {
    const maxEnergy = 0.008; // max range
    const percent = Math.min(energy / maxEnergy, 1);
    return -90 + percent * 180;
  }, [energy]);

  return (
    <Box position="relative" height="200px">
      {/* Donut Gauge */}
      <Doughnut data={chartData} options={chartOptions} />

      {/* Needle / Clock Pointer */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        height="80px"
        width="2px"
        bg="black"
        transform={`translate(-50%, -100%) rotate(${angle}deg)`}
        transformOrigin="bottom center"
        zIndex={2}
      />

      {/* Energy Display */}
      <Text
        position="absolute"
        bottom="5px"
        width="100%"
        textAlign="center"
        fontWeight="bold"
      >
        {energy.toFixed(4)} kWh
      </Text>
    </Box>
  );
}

export default SpeedometerChart;
