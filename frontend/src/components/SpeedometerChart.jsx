import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Example thresholds
const thresholds = [0.002, 0.004, 0.006, 0.008];
const segmentColors = ["#A0AEC0", "#63B3ED", "#F6AD55", "#48BB78"]; // 4 slices
const bgColor = "#E2E8F0"; // leftover color for each threshold slice

function SpeedometerChart({ energy }) {
  // The maximum energy for the gauge
  const maxEnergy = thresholds[thresholds.length - 1] || 0.008;

  // Background slices (4 segments, each 25)
  const backgroundSlices = [25, 25, 25, 25];

  // Determine the fraction of the half-circle we should fill
  const fraction = Math.min(energy / maxEnergy, 1);
  const progress = fraction * 100;      // used portion
  const leftover = 100 - progress;      // leftover portion

  // Figure out which color the arc should be (based on highest threshold crossed)
  const arcColor = useMemo(() => {
    // If energy < first threshold => index=0
    // If energy < second threshold => index=1, and so forth
    let colorIndex = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (energy >= thresholds[i]) colorIndex = i;
    }
    // Keep colorIndex within array bounds
    return segmentColors[colorIndex];
  }, [energy]);

  // The chart data: 2 datasets
  const chartData = useMemo(() => ({
    labels: ["Seg1", "Seg2", "Seg3", "Seg4", "Used", "Leftover"],
    datasets: [
      // (A) The 4 color-coded background segments
      {
        label: "Threshold Segments",
        data: backgroundSlices, // 25% each for a half circle
        backgroundColor: segmentColors,
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "70%", // thickness of ring
        order: 1, // draw behind
      },
      // (B) The single progress arc
      {
        label: "Progress Arc",
        data: [progress, leftover],
        backgroundColor: [arcColor, "transparent"], // arc color + leftover
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "78%", // slightly smaller => lies inside
        order: 2, // draw on top
      },
    ],
  }), [energy, arcColor]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  }), []);

  return (
    <Box position="relative" height="220px" width="100%">
      <Text fontWeight="bold" textAlign="center" mb={2}>
        Energy Speedometer
      </Text>
      <Box position="relative" height="100%">
        <Doughnut data={chartData} options={chartOptions} />
        <Text textAlign="center" mt={2} fontSize="lg" fontWeight="bold">
          {energy.toFixed(4)} kWh
        </Text>
      </Box>
    </Box>
  );
}

export default SpeedometerChart;
