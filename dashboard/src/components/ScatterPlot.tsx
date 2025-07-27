import React, { useState, useMemo } from "react";
import "./ScatterPlot.css";

// define your data shape right here
interface DataPoint {
  engagement_rate: number;
  duration_seconds: number;
}

interface ScatterPlotProps {
  /** array of points, each with a duration in seconds and an engagement rate (0–1) */
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  /** called whenever you hover a point (or leave it) */
  onHoverPoint?: (
    info: { duration: number; engagement: number } | null,
  ) => void;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  onHoverPoint,
}) => {
  const [hoverInfo, setHoverInfo] = useState<{
    duration: number;
    engagement: number;
  } | null>(null);

  const handleHover = (
    point: { duration: number; engagement: number } | null,
  ) => {
    setHoverInfo(point);
    onHoverPoint?.(point);
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xValues = useMemo(
    () => data.map((d: DataPoint) => d.engagement_rate),
    [data], // might need to change to scatterData
  );
  const yValues = useMemo(
    () => data.map((d: DataPoint) => d.duration_seconds),
    [data],
  );

  const xMin = Math.min(...xValues, 0);
  const xMax = Math.max(...xValues, 1);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 1);

  const xScale = useMemo(
    () => (v: number) => ((v - xMin) / (xMax - xMin)) * innerWidth,
    [xMin, xMax, innerWidth],
  );

  const yScale = useMemo(
    () => (v: number) =>
      innerHeight - ((v - yMin) / (yMax - yMin)) * innerHeight,
    [yMin, yMax, innerHeight],
  );

  return (
    <div className="scatterplot-container">
      <div className="scatterplot-hover-info">
        {hoverInfo
          ? `Duration: ${hoverInfo.duration}s · Engagement: ${(hoverInfo.engagement * 100).toFixed(1)}%`
          : "Hover over a point"}
      </div>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            className="axis axis-x"
          />
          <line x1={0} y1={0} x2={0} y2={innerHeight} className="axis axis-y" />

          {data.map((d: DataPoint, i: number) => (
            <circle
              key={i}
              className="dot"
              cx={xScale(d.engagement_rate)}
              cy={yScale(d.duration_seconds)}
              r={5}
              onMouseEnter={() =>
                handleHover({
                  duration: d.duration_seconds,
                  engagement: d.engagement_rate,
                })
              }
              onMouseLeave={() => handleHover(null)}
            />
          ))}

          <text
            className="axis-label"
            x={innerWidth / 2}
            y={innerHeight + margin.bottom - 8}
            textAnchor="middle"
          >
            Engagement Rate
          </text>

          <text
            className="axis-label"
            transform={`translate(${-margin.left + 12}, ${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            Duration (seconds)
          </text>
        </g>
      </svg>
    </div>
  );
};

export default ScatterPlot;
