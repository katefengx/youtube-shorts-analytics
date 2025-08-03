import FeatureBarChart from "./FeatureBarChart";
import DonutChart from "./DonutChart";
import "./DonutEngagement.css";

interface DonutEngagementProps {
  activeFilters: { hashtags: boolean; emojis: boolean };
  resetFilters: () => void;
  hashtagData: any;
  emojiData: any;
  onFilterChange: (filter: { type: string; hasFeature: boolean }) => void;
  filteredData: {
    hashtag_stats: {
      avg_views_with: number;
      avg_views_without: number;
    };
    emoji_stats: {
      avg_views_with: number;
      avg_views_without: number;
    };
  };
}

const DonutEngagement: React.FC<DonutEngagementProps> = ({
  activeFilters,
  resetFilters,
  hashtagData,
  emojiData,
  onFilterChange,
  filteredData,
}) => {
  return (
    <div className="engagement-section">
      <div className="donut-chart_title">
        <h3>FEATURE PERFORMANCE</h3>
        <p className="donut-chart_subtitle">hashtag and emoji usage analysis</p>
        <div className="donut-instruction">
          Click on sections in the charts to filter the dashboard by hashtag and
          emoji use.
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

      <div className="donut-charts-stacked">
        <DonutChart
          usage_percentage={hashtagData.usage_percentage}
          non_usage_percentage={hashtagData.non_usage_percentage}
          label={`USE`}
          icon={<span>#</span>}
          title="hashtags"
          description={`${hashtagData.avg_hashtags_per_video} hashtags per Shorts with hashtags`}
          onFilterChange={onFilterChange}
        />
        <DonutChart
          usage_percentage={emojiData.usage_percentage}
          non_usage_percentage={emojiData.non_usage_percentage}
          label={`USE`}
          icon={<span>😀</span>}
          title="emojis"
          description={`${emojiData.avg_emojis_per_video} emojis per Shorts with emojis`}
          onFilterChange={onFilterChange}
        />
      </div>
      {/* Combined Bar Chart */}
      <div className="combined-bar-chart">
        <div className="bar-chart-header">
          <h4>FEATURE PERFORMANCE</h4>
          <p className="bar-chart-subtitle">
            average views with and without features
          </p>
        </div>
        <FeatureBarChart
          hashtagData={{
            withFeature: filteredData.hashtag_stats.avg_views_with,
            withoutFeature: filteredData.hashtag_stats.avg_views_without,
          }}
          emojiData={{
            withFeature: filteredData.emoji_stats.avg_views_with,
            withoutFeature: filteredData.emoji_stats.avg_views_without,
          }}
        />
      </div>
    </div>
  );
};

export default DonutEngagement;
