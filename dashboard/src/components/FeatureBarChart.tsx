import React from "react";
import "./FeatureBarChart.css";

interface EngagementData {
  withFeature: number;
  withoutFeature: number;
}

interface FeatureBarChartProps {
  hashtagData: EngagementData;
  emojiData: EngagementData;
}

const FeatureBarChart: React.FC<FeatureBarChartProps> = ({
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

  // Calculate relative heights based on the maximum value
  const maxValue = Math.max(
    hashtagData.withFeature,
    hashtagData.withoutFeature,
    emojiData.withFeature,
    emojiData.withoutFeature,
  );

  const maxHeight = 200;

  return (
    <div className="bars-container">
      {/* With hashtags */}
      <div className="bar-group">
        <div className="bar-value">{formatNumber(hashtagData.withFeature)}</div>
        <div
          className="bar with-feature"
          style={{
            height: `${(hashtagData.withFeature / maxValue) * maxHeight}px`,
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
            height: `${(hashtagData.withoutFeature / maxValue) * maxHeight}px`,
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
            height: `${(emojiData.withFeature / maxValue) * maxHeight}px`,
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
            height: `${(emojiData.withoutFeature / maxValue) * maxHeight}px`,
            backgroundColor: "#ddd",
          }}
        ></div>
        <div className="bar-label">without emojis</div>
      </div>
    </div>
  );
};

export default FeatureBarChart;
