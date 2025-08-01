import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./DonutChart.css";

type DonutChartProps = {
  usage_percentage: number;
  non_usage_percentage: number;
  label: string;
  icon: React.ReactNode;
  description: string;
  color?: string;
  title: string;
  onFilterChange?: (filter: { type: string; hasFeature: boolean }) => void;
};

const DonutChart: React.FC<DonutChartProps> = ({
  usage_percentage,
  non_usage_percentage,
  label,
  icon,
  description,
  color = "#E78383",
  title,
  onFilterChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 150, height: 150 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container size, but maintain aspect ratio and reasonable minimums
        const size = Math.min(containerWidth, containerHeight, 200);
        const width = Math.max(size, 100);
        const height = Math.max(size, 100);

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
  }, []);

  const data = [
    { name: "use", value: usage_percentage },
    { name: "do not use", value: non_usage_percentage },
  ];

  // Calculate radius based on chart size
  const outerRadius = Math.min(dimensions.width, dimensions.height) * 0.4;
  const innerRadius = outerRadius * 0.6;

  // Don't render chart until we have actual dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="donut-chart_container" ref={containerRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="donut-chart_container" ref={containerRef}>
      <PieChart width={dimensions.width} height={dimensions.height}>
        <Tooltip
          formatter={(value, name) => [`${value}% ${name} ${title}`, null]}
          labelFormatter={() => ""}
          wrapperStyle={{
            backgroundColor: "#fff",
            zIndex: 1000,
            fontWeight: "bold",
          }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          stroke="none"
          startAngle={90}
          endAngle={-270}
          onClick={(entry) => {
            if (onFilterChange) {
              const hasFeature = entry.name === "use";
              onFilterChange({ type: title, hasFeature });
            }
          }}
        >
          <Cell fill={color} />
          <Cell fill="#ddd" />
        </Pie>
      </PieChart>
      <div className="donut-chart_label">
        <div className="donut-chart_icon">{icon}</div>
        <div className="donut-chart_text">{label}</div>
      </div>
      <div className="donut-chart_description">{description}</div>
    </div>
  );
};

export default DonutChart;
