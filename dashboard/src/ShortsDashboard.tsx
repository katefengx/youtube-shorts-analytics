import React, { useEffect, useState } from "react";
import type { DashboardData } from "./types";
import "./ShortsDashboard.css";

const ShortsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ShortsDashboard: Starting to fetch data...");

    // Fetch dashboard data
    fetch("/api/dashboard_data")
      .then((res) => {
        console.log("ShortsDashboard: Dashboard response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("ShortsDashboard: Received dashboard data:", data);
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("ShortsDashboard: Failed to fetch dashboard data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboardData) return <div>No dashboard data available.</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          How are your Shorts captions performing?
        </h1>
        <div className="timeline-bar"></div>
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards - KPI Row */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-title">AVG. VIEWS</div>
            <div className="card-value">{dashboardData.summary.avg_views}</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. LIKES</div>
            <div className="card-value">{dashboardData.summary.avg_likes}</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. COMMENTS</div>
            <div className="card-value">
              {dashboardData.summary.avg_comments}
            </div>
            <div className="sparkline"></div>
          </div>
        </div>

        {/* Donut Charts Column */}
        <div className="donut-charts">
          <div className="donut-instruction">
            Click on sections in the donut charts to filter charts
          </div>
          <div className="donut-card">
            <div className="donut-chart">
              <div className="donut-icon">#</div>
              <div className="donut-label">
                {dashboardData.hashtag_stats.usage_percentage}%
              </div>
            </div>
            <div className="donut-description">
              {dashboardData.hashtag_stats.avg_hashtags_per_video} avg hashtags
              per video
            </div>
          </div>
          <div className="donut-card">
            <div className="donut-chart">
              <div className="donut-icon">😀</div>
              <div className="donut-label">
                {dashboardData.emoji_stats.usage_percentage}%
              </div>
            </div>
            <div className="donut-description">
              {dashboardData.emoji_stats.avg_emojis_per_video} avg emojis per
              video
            </div>
          </div>
        </div>

        {/* Scatter Charts */}
        <div className="scatter-charts">
          <div className="scatter-card">
            <div className="scatter-title">
              How does % of capitalized letters affect the number of views?
            </div>
            <div className="scatter-chart">
              <div className="scatter-axis x"></div>
              <div className="scatter-axis y"></div>
              <div className="scatter-dots">
                {dashboardData.scatter_data.caps_vs_views.map(
                  (point, index) => {
                    const maxViews = Math.max(
                      ...dashboardData.scatter_data.caps_vs_views.map(
                        (p) => p.view_count,
                      ),
                    );
                    const maxCaps = Math.max(
                      ...dashboardData.scatter_data.caps_vs_views.map(
                        (p) => p.caps_percentage,
                      ),
                    );
                    const left = `${(point.caps_percentage / maxCaps) * 100}%`;
                    const top = `${100 - (point.view_count / maxViews) * 100}%`;
                    return (
                      <div
                        key={index}
                        className="scatter-dot"
                        style={{ left, top }}
                      ></div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
          <div className="scatter-card">
            <div className="scatter-title">
              How does caption length affect the number of views?
            </div>
            <div className="scatter-chart">
              <div className="scatter-axis x"></div>
              <div className="scatter-axis y"></div>
              <div className="scatter-dots">
                {dashboardData.scatter_data.length_vs_views.map(
                  (point, index) => {
                    const maxViews = Math.max(
                      ...dashboardData.scatter_data.length_vs_views.map(
                        (p) => p.view_count,
                      ),
                    );
                    const maxLength = Math.max(
                      ...dashboardData.scatter_data.length_vs_views.map(
                        (p) => p.title_length,
                      ),
                    );
                    const left = `${(point.title_length / maxLength) * 100}%`;
                    const top = `${100 - (point.view_count / maxViews) * 100}%`;
                    return (
                      <div
                        key={index}
                        className="scatter-dot"
                        style={{ left, top }}
                      ></div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Shorts */}
        <div className="top-shorts">
          <div className="top-shorts-title">TOP PERFORMING SHORTS</div>
          {dashboardData.top_shorts.map((short, index) => {
            const maxViews = Math.max(
              ...dashboardData.top_shorts.map((s) => s.view_count),
            );
            const progressPercentage = (short.view_count / maxViews) * 100;
            return (
              <div
                key={index}
                className={`short-caption ${index === 0 ? "active" : ""}`}
              >
                {short.title}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Chart */}
        <div className="large-chart">TBD</div>

        {/* Small Cards */}
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>

        {/* Wide Card */}
        <div className="wide-card">TBD</div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
