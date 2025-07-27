import React, { useRef, useEffect, useState } from "react";
import "./AreaChart.css";

interface DataPoint {
  date: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onHoverData?: (data: { monthYear: string; value: string } | null) => void;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  width = 240,
  height = 80,
  color = "#cccccc",
  className = "",
  onHoverData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

    const xStep = (width - 20) / (data.length - 1);
    const yScale = (height - 20) / valueRange;

    // Create path for area chart
    ctx.beginPath();

    // Start at bottom-left
    ctx.moveTo(10, height - 10);

    // Draw line through data points
    data.forEach((point, index) => {
      const x = 10 + index * xStep;
      const y = height - 10 - (point.value - minValue) * yScale;
      ctx.lineTo(x, y);
    });

    // Close path to bottom-right
    ctx.lineTo(10 + (data.length - 1) * xStep, height - 10);
    ctx.closePath();

    // Fill the area
    ctx.fillStyle = color;
    ctx.fill();

    // Draw the line on top
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = 10 + index * xStep;
      const y = height - 10 - (point.value - minValue) * yScale;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw hover dot if hovering
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const point = data[hoverIndex];
      const x = 10 + hoverIndex * xStep;
      const y = height - 10 - (point.value - minValue) * yScale;

      // Draw white circle background
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [data, width, height, color, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which data point is being hovered
    const xStep = (width - 20) / (data.length - 1);
    const dataIndex = Math.round((x - 10) / xStep);

    if (dataIndex >= 0 && dataIndex < data.length) {
      const point = data[dataIndex];
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
      setHoverIndex(dataIndex);
    } else {
      onHoverData?.(null);
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    onHoverData?.(null);
    setHoverIndex(null);
  };

  return (
    <div className={`area-chart-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="area-chart-canvas"
      />
    </div>
  );
};

export default AreaChart;
