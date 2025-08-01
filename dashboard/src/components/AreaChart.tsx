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
  width: propWidth,
  height: propHeight,
  color = "#cccccc",
  className = "",
  onHoverData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use prop dimensions if provided, otherwise use container size
        const width = propWidth || Math.max(containerWidth, 100);
        const height = propHeight || Math.max(containerHeight, 40);

        setDimensions({ width, height });
      }
    };

    updateDimensions();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [propWidth, propHeight]);

  // Canvas drawing effect - always called but only draws when dimensions are available
  useEffect(() => {
    if (
      !canvasRef.current ||
      data.length === 0 ||
      dimensions.width === 0 ||
      dimensions.height === 0
    )
      return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Safety check for data
      if (data.length < 2) {
        // Draw a simple line if only one data point
        ctx.beginPath();
        ctx.moveTo(10, dimensions.height - 10);
        ctx.lineTo(dimensions.width - 10, dimensions.height - 10);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      // Calculate scales
      const values = data.map((d) => d.value);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const valueRange = maxValue - minValue || 1;

      const xStep = (dimensions.width - 20) / (data.length - 1);
      const yScale = (dimensions.height - 20) / valueRange;

      // Create path for area chart
      ctx.beginPath();

      // Start at bottom-left
      ctx.moveTo(10, dimensions.height - 10);

      // Draw line through data points
      data.forEach((point, index) => {
        const x = 10 + index * xStep;
        const y = dimensions.height - 10 - (point.value - minValue) * yScale;
        ctx.lineTo(x, y);
      });

      // Close path to bottom-right
      ctx.lineTo(10 + (data.length - 1) * xStep, dimensions.height - 10);
      ctx.closePath();

      // Fill the area
      ctx.fillStyle = color;
      ctx.fill();

      // Draw the line on top
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = 10 + index * xStep;
        const y = dimensions.height - 10 - (point.value - minValue) * yScale;
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
        const y = dimensions.height - 10 - (point.value - minValue) * yScale;

        // Draw white circle background
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    } catch (error) {
      console.error("Error drawing AreaChart:", error);
      // Don't re-throw the error to prevent component crash
    }
  }, [data, dimensions.width, dimensions.height, color, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Safety check for data length
    if (data.length < 2) return;

    // Calculate which data point is being hovered
    const xStep = (dimensions.width - 20) / (data.length - 1);
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
    <div className={`area-chart-container ${className}`} ref={containerRef}>
      {dimensions.width === 0 || dimensions.height === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          Loading...
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="area-chart-canvas"
        />
      )}
    </div>
  );
};

export default AreaChart;
