import React, { useState } from "react";
import BarChart from "./BarChart";
import "./KPICard.css";

interface KPICardProps {
  title: string;
  value: string | number;
  timeSeriesData?: Array<{ date: string; value: number }>;
  className?: string;
  onHoverData?: (data: { monthYear: string; value: string } | null) => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  timeSeriesData,
  className = "",
  onHoverData,
}) => {
  const [hoverInfo, setHoverInfo] = useState<{
    monthYear: string;
    value: string;
  } | null>(null);

  const handleHoverData = (
    data: { monthYear: string; value: string } | null,
  ) => {
    setHoverInfo(data);
    onHoverData?.(data);
  };

  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-card-title">{title}</div>
      <div className="kpi-card-content">
        <div className="kpi-card-value">{value}</div>
        <div className="kpi-hover-info">
          {hoverInfo && `${hoverInfo.monthYear}: ${hoverInfo.value}`}
        </div>
      </div>
      {timeSeriesData && timeSeriesData.length > 0 ? (
        <div className="kpi-chart-container">
          <BarChart
            data={timeSeriesData}
            width={240}
            height={80}
            onHoverData={handleHoverData}
          />
        </div>
      ) : null}
    </div>
  );
};

export default KPICard;
