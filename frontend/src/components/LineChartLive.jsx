import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function LineChartLive() {
  const chartRef = useRef(null);
  const MAX_POINTS = 30;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://127.0.0.1:8080/data");
        const data = await response.json();

        const chart = chartRef.current;
        if (chart) {
          const labels = chart.data.labels;
          const powerData = chart.data.datasets[0].data;
          const strokeData = chart.data.datasets[1].data;

          const now = new Date().toLocaleTimeString();

          labels.push(now);
          powerData.push(data.power_watts);
          strokeData.push(data.stroke_rate);

          if (labels.length > MAX_POINTS) {
            labels.shift();
            powerData.shift();
            strokeData.shift();
          }

          chart.update();
        }
      } catch (err) {
        console.error("LineChart error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Power (W)",
        data: [],
        borderColor: "#3182ce",
        backgroundColor: "#3182ce44",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Stroke Rate",
        data: [],
        borderColor: "#38a169",
        backgroundColor: "#38a16944",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 300 },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { beginAtZero: true },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 10, font: { size: 12 } },
      },
    },
  };

  return (
    <Line
      data={chartData}
      options={chartOptions}
      ref={chartRef}
    />
  );
}

export default LineChartLive;
