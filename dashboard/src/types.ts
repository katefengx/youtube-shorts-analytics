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
