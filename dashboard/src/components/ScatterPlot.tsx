import React, { useState, useMemo, useRef, useEffect } from "react";
import "./ScatterPlot.css";

interface DataPoint {
  engagement_rate: number;
  duration_seconds: number;
}

interface ScatterPlotProps {
  data: DataPoint[];
  onHoverPoint?: (
    info: { duration: number; engagement: number } | null,
  ) => void;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, onHoverPoint }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoverInfo, setHoverInfo] = useState<{
    duration: number;
    engagement: number;
  } | null>(null);

  const margin = { top: 20, right: 20, bottom: 50, left: 70 };

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleHover = (
    point: { duration: number; engagement: number } | null,
  ) => {
    setHoverInfo(point);
    onHoverPoint?.(point);
  };

  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  const xValues = useMemo(() => data.map((d) => d.duration_seconds), [data]);
  const yValues = useMemo(() => data.map((d) => d.engagement_rate), [data]);

  const xMin = Math.min(...xValues, 0);
  const xMax = Math.max(...xValues, 1);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 0.1);

  const xScale = useMemo(
    () => (value: number) => ((value - xMin) / (xMax - xMin)) * innerWidth,
    [xMin, xMax, innerWidth],
  );

  const yScale = useMemo(
    () => (value: number) =>
      innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight,
    [yMin, yMax, innerHeight],
  );

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="scatterplot-container">
        <div className="scatterplot-header">
          <h3>ENGAGEMENT RATE vs. DURATION</h3>
          <p>How duration affects engagement</p>
        </div>
        <div className="scatterplot-chart-area" ref={containerRef}>
          <div className="loading">Loading...</div>
        </div>
        <div className="scatterplot-note">
          Note: Engagement Rate is calculated using a weighted sum of likes and
          comments divided by views. The weights are derived from a linear
          regression model predicting engaged views.
        </div>
        <div className="scatterplot-equation">
          Engagement Rate = (0.78 × Comments + 0.22 × Likes) ÷ Views
        </div>
      </div>
    );
  }

  return (
    <div className="scatterplot-container">
      <div className="scatterplot-header">
        <h3>ENGAGEMENT RATE vs. DURATION</h3>
        <p>How duration affects engagement</p>
      </div>

      <div className="scatterplot-hover-info">
        {hoverInfo
          ? `Duration: ${hoverInfo.duration}s · Engagement: ${(hoverInfo.engagement * 100).toFixed(1)}%`
          : "Hover over a point"}
      </div>

      <div className="scatterplot-chart-area" ref={containerRef}>
        <svg width={dimensions.width} height={dimensions.height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const x = tick * innerWidth;
              const y = innerHeight - tick * innerHeight;
              return (
                <g key={`grid-${tick}`}>
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={innerHeight}
                    className="grid-line"
                  />
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    className="grid-line"
                  />
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              className="axis"
            />
            <line x1={0} y1={0} x2={0} y2={innerHeight} className="axis" />

            {/* X-axis ticks and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const x = tick * innerWidth;
              const value = Math.round(xMin + tick * (xMax - xMin));
              return (
                <g key={`x-tick-${tick}`}>
                  <line
                    x1={x}
                    y1={innerHeight}
                    x2={x}
                    y2={innerHeight + 5}
                    className="tick"
                  />
                  <text
                    x={x}
                    y={innerHeight + 20}
                    className="tick-label"
                    textAnchor="middle"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Y-axis ticks and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = innerHeight - tick * innerHeight;
              const value = (yMin + tick * (yMax - yMin)) * 100;
              return (
                <g key={`y-tick-${tick}`}>
                  <line x1={0} y1={y} x2={-5} y2={y} className="tick" />
                  <text
                    x={-10}
                    y={y + 4}
                    className="tick-label"
                    textAnchor="end"
                  >
                    {value.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* Data points */}
            {data.map((point, index) => (
              <circle
                key={index}
                cx={xScale(point.duration_seconds)}
                cy={yScale(point.engagement_rate)}
                r={4}
                className="data-point"
                onMouseEnter={() =>
                  handleHover({
                    duration: point.duration_seconds,
                    engagement: point.engagement_rate,
                  })
                }
                onMouseLeave={() => handleHover(null)}
              />
            ))}

            {/* Axis labels */}
            <text
              x={innerWidth / 2}
              y={innerHeight + 35}
              className="axis-label"
              textAnchor="middle"
            >
              Duration (seconds)
            </text>
            <text
              x={-15}
              y={innerHeight / 3}
              className="axis-label"
              textAnchor="middle"
              transform={`rotate(-90, -15, ${innerHeight / 2})`}
            >
              Engagement Rate (%)
            </text>
          </g>
        </svg>
      </div>

      <div className="scatterplot-equation">
        Engagement Rate = (0.78 × Comments + 0.22 × Likes) ÷ Views
      </div>

      <div className="scatterplot-note">
        Note: Engagement Rate is calculated using a weighted sum of likes and
        comments divided by views. The weights are derived from a linear
        regression model predicting engaged views.
      </div>
    </div>
  );
};

export default ScatterPlot;
