import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./DonutChart.css";

type DonutChartProps = {
  value: number;
  label: string;
  icon: React.ReactNode;
  description: string;
  color?: string;
  title: string;
  onFilterChange?: (filter: { type: string; hasFeature: boolean }) => void;
};

const DonutChart: React.FC<DonutChartProps> = ({
  value,
  label,
  icon,
  description,
  color = "#E78383",
  title,
  onFilterChange,
}) => {
  const data = [
    { name: "use", value },
    { name: "do not use", value: 100 - value },
  ];
  return (
    <div className="donut-chart_container">
      <PieChart width={200} height={200}>
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
          innerRadius={50}
          outerRadius={80}
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
      <div className="donut-chart_breakdown">
        {value}% use {title} • {100 - value}% don't use {title}
      </div>
      <div className="donut-chart_description">{description}</div>
    </div>
  );
};

export default DonutChart;
