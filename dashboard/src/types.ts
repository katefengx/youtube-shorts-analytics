// src/types.ts
export interface ShortData {
  video_id: string;
  title: string;
  published_at: string;
  date: string;
  time: string;
  hour: number;
  duration_seconds: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  has_hashtags: boolean;
  hashtag_count: number;
  has_emojis: boolean;
  emoji_count: number;
  clean_title: string;
  num_words: number;
  sentiment_polarity: number;
  sentiment: string;
  day_of_week: string;
}

export interface DashboardData {
  summary: {
    total_shorts: number;
    avg_views: string;
    avg_likes: string;
    avg_comments: string;
    avg_words: number;
    avg_shorts_per_day: number;
    avg_views_raw: number;
    avg_likes_raw: number;
    avg_comments_raw: number;
  };
  hashtag_stats: {
    usage_percentage: number;
    non_usage_percentage: number;
    avg_hashtags_per_video: number;
    avg_views_with: number;
    avg_views_without: number;
  };
  emoji_stats: {
    usage_percentage: number;
    non_usage_percentage: number;
    avg_emojis_per_video: number;
    avg_views_with: number;
    avg_views_without: number;
  };
  sentiment_stats: {
    [key: string]: number;
  };
  posting_schedule: {
    [key: string]: number;
  };
  top_shorts: Array<{
    title: string;
    view_count: number;
    like_count: number;
    comment_count: number;
  }>;
  scatter_data: {
    duration_vs_engagement: Array<{
      duration_seconds: number;
      engagement_rate: number;
    }>;
  };
  time_series_data: {
    views: Array<{
      date: string;
      view_count: number;
    }>;
    likes: Array<{
      date: string;
      like_count: number;
    }>;
    comments: Array<{
      date: string;
      comment_count: number;
    }>;
  };
}

export interface TimeRange {
  label: string;
  startDate: string;
  endDate: string;
}
