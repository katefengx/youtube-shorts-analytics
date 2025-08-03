import React, { useState, useMemo, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const margin = { top: 15, right: 20, bottom: 50, left: 60 };
  const [hoverInfo, setHoverInfo] = useState<{
    duration: number;
    engagement: number;
  } | null>(null);

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container width, but maintain aspect ratio
        const width = Math.max(containerWidth - 32, 300); // 32px for padding
        const height = Math.min(containerHeight - 100, 350); // 100px for header and other elements

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

  const handleHover = (
    point: { duration: number; engagement: number } | null,
  ) => {
    setHoverInfo(point);
    onHoverPoint?.(point);
  };

  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

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

  // Don't render SVG until we have actual dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="scatterplot-container" ref={containerRef}>
        <div className="scatterplot-header">
          <h3>ENGAGEMENT RATE vs. DURATION</h3>
          <p className="scatterplot-subtitle">
            how duration affects engagement
          </p>
        </div>
        <div className="scatterplot-hover-info">Hover over a point</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="scatterplot-container" ref={containerRef}>
      <div className="scatterplot-header">
        <h3>ENGAGEMENT RATE vs. DURATION</h3>
        <p className="scatterplot-subtitle">how duration affects engagement</p>
      </div>
      <div className="scatterplot-hover-info">
        {hoverInfo
          ? `Duration: ${hoverInfo.duration}s · Engagement: ${(hoverInfo.engagement * 100).toFixed(1)}%`
          : "Hover over a point"}
      </div>
      <svg width={dimensions.width} height={dimensions.height}>
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
                  y={innerHeight + 15}
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
                  x={-10}
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
            y={innerHeight + 40}
            textAnchor="middle"
          >
            Duration (sec)
          </text>

          <text
            className="axis-label"
            x={-15}
            y={innerHeight / 2 - 30}
            textAnchor="middle"
            transform={`rotate(-90, -15, ${innerHeight / 2})`}
          >
            Engagement Rate
          </text>
        </g>
      </svg>
      <div className="scatterplot-note">
        Note: Engagement Rate is calculated using a weighted sum of likes and
        comments divided by views. The weights are derived from a linear
        regression model predicting engaged views.
      </div>
      <div className="scatterplot-equation">
        Formula: (0.78 × Comments + 0.22 × Likes) ÷ Views
      </div>
    </div>
  );
};

export default ScatterPlot;
