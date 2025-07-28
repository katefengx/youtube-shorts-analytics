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
  /** called whenever you hover a point (or leave it) */
  onHoverPoint?: (
    info: { duration: number; engagement: number } | null,
  ) => void;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, onHoverPoint }) => {
  const width = 700;
  const height = 400;
  const margin = { top: 30, right: 20, bottom: 50, left: 70 };
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
    () => data.map((d: DataPoint) => d.duration_seconds),
    [data],
  );
  const yValues = useMemo(
    () => data.map((d: DataPoint) => d.engagement_rate),
    [data],
  );

  const xMin = Math.min(...xValues, 0);
  const xMax = Math.max(...xValues, 1);
  // Adjust y-axis to show more of the distribution by using a smaller range
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 0.1); // Cap at 10% engagement rate for better visualization

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
      <div className="scatterplot-header">
        <h3>ENGAGEMENT RATE vs. DURATION</h3>
        <p className="scatterplot-subtitle">how duration affects engagement</p>
      </div>
      <div className="scatterplot-hover-info">
        {hoverInfo
          ? `Duration: ${hoverInfo.duration}s · Engagement: ${(hoverInfo.engagement * 100).toFixed(1)}%`
          : "Hover over a point"}
      </div>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* X-axis line */}
          <line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            className="axis axis-x"
          />

          {/* Y-axis line */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} className="axis axis-y" />

          {/* X-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const x = tick * innerWidth;
            return (
              <g key={`x-tick-${tick}`}>
                <line
                  x1={x}
                  y1={innerHeight}
                  x2={x}
                  y2={innerHeight + 5}
                  className="axis-tick"
                />
                <text
                  x={x}
                  y={innerHeight + 20}
                  className="axis-tick-label"
                  textAnchor="middle"
                >
                  {Math.round(xMin + tick * (xMax - xMin))}
                </text>
              </g>
            );
          })}

          {/* Y-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = innerHeight - tick * innerHeight;
            const value = yMin + tick * (yMax - yMin);
            return (
              <g key={`y-tick-${tick}`}>
                <line x1={0} y1={y} x2={-5} y2={y} className="axis-tick" />
                <text
                  x={-15}
                  y={y + 4}
                  className="axis-tick-label"
                  textAnchor="end"
                >
                  {Math.round(value * 100)}%
                </text>
              </g>
            );
          })}

          {data.map((d: DataPoint, i: number) => (
            <circle
              key={i}
              className="dot"
              cx={xScale(d.duration_seconds)}
              cy={yScale(d.engagement_rate)}
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
            y={innerHeight + margin.bottom - 5}
            textAnchor="middle"
          >
            Duration (sec)
          </text>

          <text
            className="axis-label"
            transform={`translate(${-margin.left + 20}, ${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            Engagement Rate
          </text>
        </g>
      </svg>
      <div className="scatterplot-note">
        Note: Engagement Rate is calculated as (Likes + Comments) ÷ Views
      </div>
    </div>
  );
};

export default ScatterPlot;
