import React, { useEffect, useState } from "react";
import type { DashboardData } from "./types";
import { API_BASE_URL } from "./config";
import "./ShortsDashboard.css";
import DonutEngagement from "./components/DonutEngagement";
import TimeFilter from "./components/TimeFilter";
import AreaChart from "./components/AreaChart";
import TopPerformingShorts from "./components/TopPerformingShorts";
import ScatterPlot from "./components/ScatterPlot";
import SentimentAnalysis from "./components/SentimentAnalysis";
import PostingSchedule from "./components/PostingSchedule";

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
    fetch(`${API_BASE_URL}/api/shorts_data`)
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
    let url = `${API_BASE_URL}/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;
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

    let url = `${API_BASE_URL}/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

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

    const url = `${API_BASE_URL}/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

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
              <span className="metric-label">AVG. VIEWS</span>
              <span className="metric-value">
                {filteredData.summary.avg_views}
              </span>
              {filteredData.time_series_data?.views && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.views.map((item) => ({
                      date: item.date,
                      value: item.view_count,
                    }))}
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-label">AVG. LIKES</span>
              <span className="metric-value">
                {filteredData.summary.avg_likes}
              </span>

              {filteredData.time_series_data?.likes && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.likes.map((item) => ({
                      date: item.date,
                      value: item.like_count,
                    }))}
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-label">AVG. COMMENTS</span>
              <span className="metric-value">
                {filteredData.summary.avg_comments}
              </span>
              {filteredData.time_series_data?.comments && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.comments.map(
                      (item) => ({
                        date: item.date,
                        value: item.comment_count,
                      }),
                    )}
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
          {/* Donut Charts Stacked */}
          <DonutEngagement
            hashtagData={filteredData.hashtag_stats}
            emojiData={filteredData.emoji_stats}
            activeFilters={{
              hashtags: activeFilters.hashtags ?? false,
              emojis: activeFilters.emojis ?? false,
            }}
            resetFilters={resetFilters}
            onFilterChange={handleFilterChange}
            filteredData={filteredData}
          />
        </div>

        <div className="middle-column">
          {/* Top Performing Shorts */}
          <div className="top-shorts-section">
            <TopPerformingShorts topShorts={filteredData.top_shorts} />
          </div>

          {/* Scatter Plot */}
          <div className="scatter-section">
            <ScatterPlot
              data={filteredData.scatter_data.duration_vs_engagement}
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
          </div>
        </div>

        <div className="right-column">
          {/* Sentiment Analysis Component */}
          <div className="sentiment-section">
            <SentimentAnalysis sentimentStats={filteredData.sentiment_stats} />
          </div>

          {/* Posting Schedule Component */}
          <div className="posting-schedule-section">
            <PostingSchedule postingSchedule={filteredData.posting_schedule} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
