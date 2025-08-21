import React, { useRef, useState } from "react";
import "./PostingSchedule.css";

interface PostingScheduleProps {
  videosPerDay: {
    [key: string]: number;
  };
  timeBuckets: {
    [key: string]: number;
  };
  heatMapData?: {
    videos_posted: {
      [hour: number]: {
        [day: string]: number;
      };
    };
    views: {
      [hour: number]: {
        [day: string]: number;
      };
    };
    likes: {
      [hour: number]: {
        [day: string]: number;
      };
    };
    comments: {
      [hour: number]: {
        [day: string]: number;
      };
    };
  };
}

const PostingSchedule: React.FC<PostingScheduleProps> = ({
  videosPerDay: _videosPerDay,
  timeBuckets: _timeBuckets,
  heatMapData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedMetric, setSelectedMetric] = useState<
    "videos_posted" | "views" | "likes" | "comments"
  >("videos_posted");

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

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  return (
    <div className="posting-schedule" ref={containerRef}>
      <div className="schedule-header">
        <h3>POSTING SCHEDULE</h3>
        <p className="schedule-subtitle">
          success by posting time (
          {Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>
      </div>

      <div className="schedule-summary">
        <div className="sort-controls">
          <div className="sort-buttons">
            <button
              className={`sort-button ${selectedMetric === "videos_posted" ? "active" : ""}`}
              onClick={() => setSelectedMetric("videos_posted")}
            >
              VIDEOS
            </button>
            <button
              className={`sort-button ${selectedMetric === "views" ? "active" : ""}`}
              onClick={() => setSelectedMetric("views")}
            >
              VIEWS
            </button>
            <button
              className={`sort-button ${selectedMetric === "likes" ? "active" : ""}`}
              onClick={() => setSelectedMetric("likes")}
            >
              LIKES
            </button>
            <button
              className={`sort-button ${selectedMetric === "comments" ? "active" : ""}`}
              onClick={() => setSelectedMetric("comments")}
            >
              COMMENTS
            </button>
          </div>
        </div>
      </div>

      {/* Heat Map */}
      {heatMapData &&
        (() => {
          // Check if there's any data to display
          const hasAnyData = Array.from({ length: 24 }, (_, hour) =>
            dayOrder.some(
              (day) => (heatMapData?.videos_posted?.[hour]?.[day] || 0) > 0,
            ),
          ).some((hasVideos) => hasVideos);

          // Don't render anything if there's no data
          if (!hasAnyData) {
            return null;
          }

          return (
            <div className="heat-map-section">
              <h4 className="heat-map-title">Success by Day & Time</h4>
              <div className="heat-map-container">
                <div className="heat-map">
                  {/* Day labels (x-axis) */}
                  <div className="day-labels">
                    {dayOrder.map((day) => (
                      <div key={day} className="day-label">
                        {day.slice(0, 3)}
                      </div>
                    ))}
                  </div>

                  {/* Heat map grid */}
                  <div className="heat-map-grid">
                    {Array.from({ length: 24 }, (_, hour) => {
                      // Check if this hour has any videos posted across all days
                      const hasAnyVideos = dayOrder.some(
                        (day) =>
                          (heatMapData?.videos_posted?.[hour]?.[day] || 0) > 0,
                      );

                      // Skip hours with no videos
                      if (!hasAnyVideos) return null;

                      return (
                        <div key={hour} className="heat-map-row">
                          <div className="hour-label">
                            {(() => {
                              // Convert UTC hour to local hour
                              const utcDate = new Date(
                                Date.UTC(2024, 0, 1, hour),
                              );
                              const localHour = utcDate.getHours();
                              return new Date(
                                2024,
                                0,
                                1,
                                localHour,
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                hour12: true,
                                timeZone:
                                  Intl.DateTimeFormat().resolvedOptions()
                                    .timeZone,
                              });
                            })()}
                          </div>
                          {dayOrder.map((day) => {
                            const value =
                              heatMapData?.[selectedMetric]?.[hour]?.[day] || 0;
                            const maxValue = heatMapData?.[selectedMetric]
                              ? Math.max(
                                  ...Object.values(
                                    heatMapData[selectedMetric],
                                  ).flatMap((hourData) =>
                                    Object.values(hourData),
                                  ),
                                )
                              : 0;
                            const intensity =
                              maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
                            const backgroundColor = `rgba(231, 131, 131, ${intensity})`;

                            const metricLabel =
                              selectedMetric === "videos_posted"
                                ? "videos"
                                : selectedMetric === "views"
                                  ? "total views"
                                  : selectedMetric === "likes"
                                    ? "total likes"
                                    : "total comments";

                            // For total values, we can show data even with 1 video
                            const displayValue = formatNumber(value);
                            const displayLabel = metricLabel;

                            // Convert UTC hour to local hour
                            const utcDate = new Date(
                              Date.UTC(2024, 0, 1, hour),
                            );
                            const localHour = utcDate.getHours();
                            const localTimeString = new Date(
                              2024,
                              0,
                              1,
                              localHour,
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              hour12: true,
                              timeZone:
                                Intl.DateTimeFormat().resolvedOptions()
                                  .timeZone,
                            });

                            return (
                              <div
                                key={day}
                                className="heat-map-cell"
                                style={{ backgroundColor }}
                                title={`${day} ${localTimeString}: ${displayValue} ${displayLabel}`}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="heat-map-legend">
                  <span>Low</span>
                  <div className="legend-gradient">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="legend-cell"
                        style={{
                          backgroundColor: `rgba(231, 131, 131, ${i / 9})`,
                        }}
                      />
                    ))}
                  </div>
                  <span>High</span>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default PostingSchedule;
