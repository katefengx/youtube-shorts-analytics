import React, { useRef, useEffect, useState } from "react";
import "./PostingSchedule.css";

interface PostingScheduleProps {
  postingSchedule: {
    [key: string]: number;
  };
  avgViewsPerDay?: {
    [key: string]: number;
  };
}

const PostingSchedule: React.FC<PostingScheduleProps> = ({
  postingSchedule,
  avgViewsPerDay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    data: any;
  }>({
    show: false,
    x: 0,
    y: 0,
    data: null,
  });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container size, but maintain reasonable minimums
        const width = Math.max(containerWidth, 200);
        const height = Math.max(containerHeight, 100);

        setDimensions({ width, height });
      }
    };

    // Initial dimensions calculation
    updateDimensions();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also update on next tick to ensure dimensions are available
    const timeoutId = setTimeout(updateDimensions, 0);

    // Force update after a short delay to catch any CSS changes
    const forceUpdateId = setTimeout(updateDimensions, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
      clearTimeout(forceUpdateId);
    };
  }, []);

  // Also update dimensions when the component re-renders
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container size, but maintain reasonable minimums
        const width = Math.max(containerWidth, 200);
        const height = Math.max(containerHeight, 100);

        setDimensions({ width, height });
      }
    };

    // Update dimensions after render
    const timeoutId = setTimeout(updateDimensions, 0);
    return () => clearTimeout(timeoutId);
  });

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container size, but maintain reasonable minimums
        const width = Math.max(containerWidth, 200);
        const height = Math.max(containerHeight, 100);

        setDimensions({ width, height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define the order of days
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Use average views per day data
  const dataToUse = avgViewsPerDay || postingSchedule;

  // Calculate total for percentage calculations
  const total = Object.values(postingSchedule).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Find the maximum value for scaling
  const maxValue = Math.max(...Object.values(dataToUse), 1);

  // Get the best performing day
  const bestPerformingDay = Object.entries(dataToUse).reduce((a, b) =>
    dataToUse[a[0]] > dataToUse[b[0]] ? a : b,
  )[0];

  // Use responsive width based on container
  const maxWidth = Math.min(dimensions.width * 0.6, 180);

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  // Calculate average videos per day
  const avgVideosPerDay = total / 7;

  // Prepare donut chart data
  const donutData = dayOrder.map((day) => ({
    day,
    count: postingSchedule[day] || 0,
    percentage: total > 0 ? ((postingSchedule[day] || 0) / total) * 100 : 0,
  }));

  // Donut chart colors - variations of #E78383
  const colors = [
    "#e78383", // Original
    "#d47373", // Darker
    "#f19393", // Lighter
    "#c16363", // Even darker
    "#f9a3a3", // Even lighter
    "#b05353", // Very dark
    "#ffb3b3", // Very light
  ];

  const handleDonutMouseMove = (event: React.MouseEvent, item: any) => {
    if (item.count > 0) {
      setTooltip({
        show: true,
        x: event.clientX,
        y: event.clientY,
        data: item,
      });
    }
  };

  const handleDonutMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  return (
    <div className="posting-schedule" ref={containerRef}>
      <div className="schedule-header">
        <h3>POSTING SCHEDULE</h3>
        <p className="schedule-subtitle">
          average views for videos posted on each day
        </p>
      </div>

      <div className="schedule-summary">
        <div className="most-active-day">
          <span className="active-label">Best Day for Views:</span>
          <span className="active-value">{bestPerformingDay}</span>
        </div>
      </div>

      <div className="schedule-chart">
        <div className="chart-bars-horizontal">
          {dayOrder.map((day) => {
            const value = dataToUse[day] || 0;
            // Calculate width relative to the maximum value
            const width = maxValue > 0 ? (value / maxValue) * maxWidth : 0;
            const isBestPerforming = day === bestPerformingDay;

            return (
              <div key={day} className="chart-row">
                <div className="day-label-horizontal">{day}</div>
                <div className="bar-container">
                  <div
                    className={`chart-bar-horizontal ${isBestPerforming ? "most-active" : ""}`}
                    style={{ width: `${width}px` }}
                    title={`${day}: ${formatNumber(value)} avg views for videos posted on this day`}
                  >
                    {value > 0 && (
                      <span className="bar-value">{formatNumber(value)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="schedule-stats">
        <div className="stat-item">
          <span className="stat-value">{avgVideosPerDay.toFixed(1)}</span>
          <span className="stat-label">Avg Videos/Day</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {dayOrder.filter((day) => (postingSchedule[day] || 0) > 0).length}
          </span>
          <span className="stat-label">Active Days</span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="donut-chart-section">
        <h4 className="donut-title">Video Distribution by Day</h4>
        <div className="donut-chart">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="20"
            />
            {(() => {
              let currentAngle = -90; // Start from top
              return donutData.map((item, index) => {
                if (item.count === 0) return null;
                const angle = (item.percentage / 100) * 360;
                const x1 = 60 + 50 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 60 + 50 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 =
                  60 + 50 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 =
                  60 + 50 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                  `M ${x1} ${y1}`,
                  `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                ].join(" ");

                currentAngle += angle;

                return (
                  <path
                    key={item.day}
                    d={pathData}
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="20"
                    strokeLinecap="butt"
                    onMouseMove={(e) => handleDonutMouseMove(e, item)}
                    onMouseLeave={handleDonutMouseLeave}
                    style={{ cursor: "pointer" }}
                  />
                );
              });
            })()}
          </svg>
        </div>
        <div className="donut-legend">
          {donutData
            .filter((item) => item.count > 0)
            .map((item, index) => (
              <div key={item.day} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="legend-text">{item.day}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && tooltip.data && (
        <div
          className="donut-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            zIndex: 1000,
          }}
        >
          <div className="tooltip-content">
            <strong>{tooltip.data.day}</strong>
            <br />
            {tooltip.data.count} videos ({tooltip.data.percentage.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default PostingSchedule;
