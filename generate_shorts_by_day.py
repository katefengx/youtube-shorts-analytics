import pandas as pd
import sys

# Usage: python generate_shorts_by_day.py clean_shorts_data.csv output_shorts_by_day.csv

if len(sys.argv) != 3:
    print("Usage: python generate_shorts_by_day.py clean_shorts_data.csv output_shorts_by_day.csv")
    sys.exit(1)

shorts = pd.read_csv(sys.argv[1])
by_day = shorts.groupby('date').agg(
    video_ids=('video_id', lambda x: ', '.join(x)),
    titles=('title', lambda x: ', '.join(x)),
    avg_views=('view_count', 'mean'),
    total_views=('view_count', 'sum'),
    count_shorts=('title', 'count'),
    avg_likes=('like_count', 'mean'),
    total_likes=('like_count', 'sum'),
    avg_comments=('comment_count', 'mean'),
    total_comments=('comment_count', 'sum'),
    avg_duration=('duration_seconds', 'mean'),
    total_duration=('duration_seconds', 'sum'),
).reset_index()
by_day['thumbnail_urls'] = by_day['video_ids'].apply(
    lambda id_str: ','.join([
        f'https://img.youtube.com/vi/{vid.strip()}/hqdefault.jpg' for vid in id_str.split(',')
    ])
)
by_day.to_csv(sys.argv[2], index=False) 