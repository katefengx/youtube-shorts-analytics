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
  has_hashtags: boolean;
  hashtag_count: number;
  has_emojis: boolean;
  emoji_count: number;
  clean_title: string;
  caps_percentage: number;
  title_length: number;
  sentiment_polarity: number;
  sentiment_subjectivity: number;
  time_since_last_post: number;
}

export interface DashboardData {
  summary: {
    total_shorts: number;
    avg_views: string;
    avg_likes: string;
    avg_comments: string;
    avg_views_raw: number;
    avg_likes_raw: number;
    avg_comments_raw: number;
  };
  hashtag_stats: {
    usage_percentage: number;
    avg_hashtags_per_video: number;
  };
  emoji_stats: {
    usage_percentage: number;
    avg_emojis_per_video: number;
  };
  top_shorts: Array<{
    title: string;
    view_count: number;
    like_count: number;
    comment_count: number;
  }>;
  scatter_data: {
    caps_vs_views: Array<{
      caps_percentage: number;
      view_count: number;
    }>;
    length_vs_views: Array<{
      title_length: number;
      view_count: number;
    }>;
  };
}
