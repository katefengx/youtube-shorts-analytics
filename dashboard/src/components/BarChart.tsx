import React, { useRef, useEffect } from "react";
import "./BarChart.css";

interface DataPoint {
  date: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onHoverData?: (data: { monthYear: string; value: string } | null) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 240,
  height = 80,
  color = "#cccccc",
  className = "",
  onHoverData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scales
    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    const barWidth = (width - 20) / data.length;
    const actualBarWidth = barWidth;
    const yScale = (height - 20) / valueRange;

    // Draw bars
    data.forEach((point, index) => {
      const x = 10 + index * barWidth;
      const barHeight = (point.value - minValue) * yScale;
      const y = height - 10 - barHeight;

      // Draw bar with solid color
      ctx.fillStyle = color;
      ctx.fillRect(x, y, actualBarWidth, barHeight);
    });
  }, [data, width, height, color]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which bar is being hovered
    const barWidth = (width - 20) / data.length;
    const barIndex = Math.floor((x - 10) / barWidth);

    if (barIndex >= 0 && barIndex < data.length) {
      const point = data[barIndex];
      const date = new Date(point.date);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const formattedValue =
        point.value >= 1000
          ? `${(point.value / 1000).toFixed(1)}K`
          : Math.round(point.value).toString();

      onHoverData?.({
        monthYear,
        value: formattedValue,
      });
    } else {
      onHoverData?.(null);
    }
  };

  const handleMouseLeave = () => {
    onHoverData?.(null);
  };

  return (
    <div className={`bar-chart-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bar-chart-canvas"
      />
    </div>
  );
};

export default BarChart;
