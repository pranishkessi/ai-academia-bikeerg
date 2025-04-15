import React, { useMemo, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Thresholds and Colors
const thresholds = [0.002, 0.004, 0.006, 0.008];
const segmentColors = ["#A0AEC0", "#63B3ED", "#F6AD55", "#48BB78"]; // 4 segments

function SpeedometerChart({ energy }) {
  const maxEnergy = thresholds[thresholds.length - 1] || 0.008;

  const backgroundSlices = [25, 25, 25, 25];
  const fraction = Math.min(energy / maxEnergy, 1);
  const progress = fraction * 100;
  const leftover = 100 - progress;

  // Build progress color slices based on thresholds met
  const progressSlices = useMemo(() => {
    const result = [];
    let last = 0;
    for (let i = 0; i < thresholds.length; i++) {
      const thresholdPercent = (thresholds[i] / maxEnergy) * 100;
      if (progress > thresholdPercent) {
        result.push({
          size: thresholdPercent - last,
          color: segmentColors[i],
        });
        last = thresholdPercent;
      } else {
        result.push({
          size: progress - last,
          color: segmentColors[i],
        });
        break;
      }
    }
    return result;
  }, [energy]);

  // Convert to dataset-friendly arrays
  const progressData = useMemo(() => {
    const sizes = progressSlices.map((s) => s.size);
    if (sizes.reduce((a, b) => a + b, 0) < progress) {
      sizes.push(progress - sizes.reduce((a, b) => a + b, 0));
    }
    return sizes;
  }, [progressSlices]);

  const progressColors = useMemo(() => {
    const colors = progressSlices.map((s) => s.color);
    if (colors.length < progressData.length) {
      colors.push(colors[colors.length - 1]); // extend last color
    }
    return colors;
  }, [progressSlices, progressData]);

  const chartData = useMemo(() => ({
    labels: ["Seg1", "Seg2", "Seg3", "Seg4", "Progress"],
    datasets: [
      {
        label: "Background Segments",
        data: backgroundSlices,
        backgroundColor: segmentColors,
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "65%",
        order: 1,
      },
      {
        label: "Progress",
        data: progressData.concat([leftover]),
        backgroundColor: progressColors.concat(["transparent"]),
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "68%",
        order: 2,
      },
    ],
  }), [progressData, progressColors]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: "easeOutCubic",
    },
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  }), []);

  return (
    <Box position="relative" height="150px" width="100%">
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
