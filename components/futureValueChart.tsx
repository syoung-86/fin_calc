import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface FutureValueChartProps {
  data: { year: number; value: number; monthlyContribution: number }[];
}

const FutureValueChart: React.FC<FutureValueChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: "Future Value",
        data: data.map(d => d.value),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Future Value Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value (R)",
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <>
      <div
        style={{
          minHeight: "500px",
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
        }}>
        <Line data={chartData} options={options} />
      </div>
    </>
  );
};

export default FutureValueChart;
