import React from "react";
import "./CombinedEngagementBarChart.css";

interface EngagementData {
  withFeature: number;
  withoutFeature: number;
}

interface CombinedEngagementBarChartProps {
  hashtagData: EngagementData;
  emojiData: EngagementData;
}

const CombinedEngagementBarChart: React.FC<CombinedEngagementBarChartProps> = ({
  hashtagData,
  emojiData,
}) => {
  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  // Calculate heights based on actual values
  // Use a scale factor to make bars visible (e.g., 1 pixel per 1000 views)
  const scaleFactor = 0.001; // 1 pixel per 1000 views

  return (
    <div className="combined-engagement-chart">
      <div className="chart-header">
        <h4>AVG. VIEWS</h4>
        <h5>with and without features</h5>
      </div>

      <div className="bars-container">
        {/* With hashtags */}
        <div className="bar-group">
          <div className="bar-value">
            {formatNumber(hashtagData.withFeature)}
          </div>
          <div
            className="bar with-feature"
            style={{
              height: `${hashtagData.withFeature * scaleFactor}px`,
              backgroundColor: "#e78383",
            }}
          ></div>
          <div className="bar-label">with hashtags</div>
        </div>

        {/* Without hashtags */}
        <div className="bar-group">
          <div className="bar-value">
            {formatNumber(hashtagData.withoutFeature)}
          </div>
          <div
            className="bar without-feature"
            style={{
              height: `${hashtagData.withoutFeature * scaleFactor}px`,
              backgroundColor: "#ddd",
            }}
          ></div>
          <div className="bar-label">without hashtags</div>
        </div>

        {/* With emojis */}
        <div className="bar-group">
          <div className="bar-value">{formatNumber(emojiData.withFeature)}</div>
          <div
            className="bar with-feature"
            style={{
              height: `${emojiData.withFeature * scaleFactor}px`,
              backgroundColor: "#e78383",
            }}
          ></div>
          <div className="bar-label">with emojis</div>
        </div>

        {/* Without emojis */}
        <div className="bar-group">
          <div className="bar-value">
            {formatNumber(emojiData.withoutFeature)}
          </div>
          <div
            className="bar without-feature"
            style={{
              height: `${emojiData.withoutFeature * scaleFactor}px`,
              backgroundColor: "#ddd",
            }}
          ></div>
          <div className="bar-label">without emojis</div>
        </div>
      </div>
    </div>
  );
};

export default CombinedEngagementBarChart;
