import React, { useEffect, useState } from "react";
import type { DashboardData } from "./types";
import "./ShortsDashboard.css";
import DonutChart from "./components/DonutChart";
import EngagementBarChart from "./components/EngagementBarChart";
import TimeFilter from "./components/TimeFilter";
import AreaChart from "./components/AreaChart";
import TopPerformingShorts from "./components/TopPerformingShorts";
import ScatterPlot from "./components/ScatterPlot";

const ShortsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]);
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
  const [pendingRange, setPendingRange] = useState<[number, number]>([0, 0]);
  const [activeFilters, setActiveFilters] = useState<{
    hashtags?: boolean;
    emojis?: boolean;
  }>({});

  // Fetch all available dates on mount
  useEffect(() => {
    fetch("/api/shorts_data")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          // Extract and sort unique dates
          const dates = Array.from(
            new Set(data.data.map((row: any) => row.date)),
          ) as string[];
          dates.sort();
          setAllDates(dates);
          setSliderRange([0, dates.length - 1]);
          setSelectedRange([0, dates.length - 1]);
          setPendingRange([0, dates.length - 1]);
        }
      });
  }, []);

  // Fetch dashboard data when selectedRange changes and allDates is loaded
  useEffect(() => {
    if (allDates.length === 0) return;
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];
    setLoading(true);
    setError(null);
    let url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedRange, allDates]);

  const handleFilterChange = (filter: {
    type: string;
    hasFeature: boolean;
  }) => {
    // Update active filters
    const newFilters = { ...activeFilters };
    if (filter.type === "hashtags") {
      newFilters.hashtags = filter.hasFeature;
    } else if (filter.type === "emojis") {
      newFilters.emojis = filter.hasFeature;
    }
    setActiveFilters(newFilters);

    setLoading(true);

    // Make a new API call with filter parameters
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];

    let url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

    // Add filter parameters
    if (newFilters.hashtags !== undefined) {
      url += `&hashtag_filter=${newFilters.hashtags}`;
    }
    if (newFilters.emojis !== undefined) {
      url += `&emoji_filter=${newFilters.emojis}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const resetFilters = () => {
    setActiveFilters({});
    setLoading(true);

    // Make a new API call without filter parameters
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];

    const url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Use dashboardData directly since filtering is now handled server-side
  const filteredData = dashboardData;

  if (error) return <div>Error: {error}</div>;
  if (!dashboardData || !filteredData)
    return <div>No dashboard data available.</div>;

  return (
    <div className="dashboard-container" style={{ position: "relative" }}>
      {loading && <div className="dashboard-loading-overlay"></div>}

      {/* Header Section with Right Side Content */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">
              Youtube Shorts Caption Performance Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Track how different captions impact your Shorts' success.
            </p>
            <div className="summary-metrics">
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.total_shorts}
                </span>
                <span className="summary-metric-label">SHORTS POSTED</span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.avg_shorts_per_day}
                </span>
                <span className="summary-metric-label">
                  AVG. SHORTS PER DAY
                </span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.avg_words || "6.92"}
                </span>
                <span className="summary-metric-label">WORDS PER CAPTION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="header-right-content">
          {/* Date Range Section */}
          <div className="date-range-section">
            <TimeFilter
              allDates={allDates}
              sliderRange={sliderRange}
              pendingRange={pendingRange}
              onPendingRangeChange={setPendingRange}
              onSelectedRangeChange={setSelectedRange}
            />
          </div>

          {/* Performance Metrics */}
          <div className="performance-metrics">
            <div className="metric-card">
              <span className="metric-value">
                {filteredData.summary.avg_views}
              </span>
              <span className="metric-label">AVG. VIEWS</span>
              {filteredData.time_series_data?.views && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.views.map((item) => ({
                      date: item.date,
                      value: item.view_count,
                    }))}
                    width={120}
                    height={40}
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-value">
                {filteredData.summary.avg_likes}
              </span>
              <span className="metric-label">AVG. LIKES</span>
              {filteredData.time_series_data?.likes && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.likes.map((item) => ({
                      date: item.date,
                      value: item.like_count,
                    }))}
                    width={120}
                    height={40}
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-value">
                {filteredData.summary.avg_comments}
              </span>
              <span className="metric-label">AVG. COMMENTS</span>
              {filteredData.time_series_data?.comments && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.comments.map(
                      (item) => ({
                        date: item.date,
                        value: item.comment_count,
                      }),
                    )}
                    width={120}
                    height={40}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Engagement Analysis */}
        <div className="engagement-analysis">
          <div className="donut-header">
            <div className="donut-instruction">
              Click on sections in the charts to filter the dashboard by hashtag
              and emoji use.
            </div>
            {(activeFilters.hashtags !== undefined ||
              activeFilters.emojis !== undefined) && (
              <button
                className="reset-filters-btn"
                onClick={resetFilters}
                title="Reset all filters"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Hashtag Section */}
          <div className="engagement-section">
            <div className="engagement-charts">
              <DonutChart
                usage_percentage={filteredData.hashtag_stats.usage_percentage}
                non_usage_percentage={
                  filteredData.hashtag_stats.non_usage_percentage
                }
                label={`USE`}
                icon={<span>#</span>}
                title="hashtags"
                description={`${filteredData.hashtag_stats.avg_hashtags_per_video} hashtags per Short with hashtags`}
                onFilterChange={handleFilterChange}
              />
              <EngagementBarChart
                withFeaturePercentage={
                  filteredData.hashtag_stats.engagement_with
                }
                withoutFeaturePercentage={
                  filteredData.hashtag_stats.engagement_without
                }
                featureName="hashtags"
              />
            </div>
          </div>

          {/* Emoji Section */}
          <div className="engagement-section">
            <div className="engagement-charts">
              <DonutChart
                usage_percentage={filteredData.emoji_stats.usage_percentage}
                non_usage_percentage={
                  filteredData.emoji_stats.non_usage_percentage
                }
                label={`USE`}
                icon={<span>😀</span>}
                title="emojis"
                description={`${filteredData.emoji_stats.avg_emojis_per_video} emojis per Short with emojis`}
                onFilterChange={handleFilterChange}
              />
              <EngagementBarChart
                withFeaturePercentage={filteredData.emoji_stats.engagement_with}
                withoutFeaturePercentage={
                  filteredData.emoji_stats.engagement_without
                }
                featureName="emojis"
              />
            </div>
          </div>
        </div>

        {/* Top Performing Shorts */}
        <TopPerformingShorts topShorts={filteredData.top_shorts} />

        {/* Scatter Plot */}
        <ScatterPlot
          data={filteredData.scatter_data.duration_vs_engagement}
          width={600}
          height={400}
          margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
          onHoverPoint={(point) => {
            if (point) {
              console.log(
                `Hovered point - Duration: ${point.duration}, Engagement: ${point.engagement}`,
              );
            } else {
              console.log("Hover cleared");
            }
          }}
        />

        {/* Sentiment Section */}
        <div className="sentiment-section">
          <div className="section-title">SENTIMENT ANALYSIS</div>
          <div className="section-subtitle">
            avg. likes across caption sentiments (TextBlob)
          </div>
          <div className="sentiment-chart">
            {/* Placeholder for sentiment bar chart */}
            <div
              style={{
                height: "150px",
                display: "flex",
                alignItems: "end",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "60%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "100%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "40%",
                  borderRadius: "4px",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                NEGATIVE
              </span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                NEUTRAL
              </span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                POSITIVE
              </span>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: "2rem" }}>
            POSTING SCHEDULE
          </div>
          <div className="section-subtitle">
            how many Shorts are posted each day
          </div>
          <div className="posting-schedule-chart">
            {/* Placeholder for posting schedule bar chart */}
            <div
              style={{
                height: "120px",
                display: "flex",
                alignItems: "end",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "80%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "90%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "70%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ff6b6b",
                  height: "100%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "60%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "50%",
                  borderRadius: "4px",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#ddd",
                  height: "40%",
                  borderRadius: "4px",
                }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#666" }}>M</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>T</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>W</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>T</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>F</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>S</span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
