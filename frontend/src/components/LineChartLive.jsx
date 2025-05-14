// src/components/LineChartLive.jsx
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function LineChartLive({ power, stroke }) {
  const MAX_POINTS = 30;

  const [chartLabels, setChartLabels] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [strokeData, setStrokeData] = useState([]);

  useEffect(() => {
    const now = new Date().toLocaleTimeString();

    setChartLabels((prev) => [...prev.slice(-MAX_POINTS + 1), now]);
    setPowerData((prev) => [...prev.slice(-MAX_POINTS + 1), power]);
    setStrokeData((prev) => [...prev.slice(-MAX_POINTS + 1), stroke]);
  }, [power, stroke]);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Power (W)",
        data: powerData,
        borderColor: "#3182ce",
        backgroundColor: "rgba(49, 130, 206, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Stroke Rate",
        data: strokeData,
        borderColor: "#38a169",
        backgroundColor: "rgba(56, 161, 105, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: "easeOutQuart",
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
        ticks: { maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 200,
        title: { display: true, text: "Value" },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12 }, boxWidth: 12 },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "260px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default LineChartLive;
