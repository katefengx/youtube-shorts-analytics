import React from "react";
import "./EngagementBarChart.css";

type EngagementBarChartProps = {
  withFeaturePercentage: number;
  withoutFeaturePercentage: number;
  featureName: string;
  color?: string;
};

const EngagementBarChart: React.FC<EngagementBarChartProps> = ({
  withFeaturePercentage,
  withoutFeaturePercentage,
  featureName,
  color = "#E78383",
}) => {
  const maxPercentage = Math.max(
    withFeaturePercentage,
    withoutFeaturePercentage,
  );

  return (
    <div className="engagement-bar-chart_container">
      <div className="engagement-bar-chart_title">AVG. ENGAGEMENT</div>
      <div className="engagement-bar-chart_bars">
        <div className="engagement-bar-chart_bar-group">
          <div className="engagement-bar-chart_percentage">
            {withFeaturePercentage}%
          </div>
          <div
            className="engagement-bar-chart_bar with-feature"
            style={{
              height: `${(withFeaturePercentage / maxPercentage) * 100}%`,
              backgroundColor: color,
            }}
          ></div>
          <div className="engagement-bar-chart_label">with {featureName}</div>
        </div>

        <div className="engagement-bar-chart_bar-group">
          <div className="engagement-bar-chart_percentage">
            {withoutFeaturePercentage}%
          </div>
          <div
            className="engagement-bar-chart_bar without-feature"
            style={{
              height: `${(withoutFeaturePercentage / maxPercentage) * 100}%`,
              backgroundColor: "#ddd",
            }}
          ></div>
          <div className="engagement-bar-chart_label">
            without {featureName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementBarChart;
