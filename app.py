from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import requests
import isodate
import tempfile
import re
from textblob import TextBlob
import numpy as np
import subprocess
import sys
import shutil
from dotenv import load_dotenv
import emoji
load_dotenv()

app = Flask(__name__)
# Allow CORS from GitHub Pages and localhost
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5001",
    "https://*.github.io",  # Allow all GitHub Pages domains
    "https://*.githubusercontent.com"  # Allow GitHub raw content
])

API_KEY = os.getenv('API_KEY')

# ===== API MODE ONLY =====
# Using YouTube API for data

# --- Serve static frontend ---
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/test')
def test_route():
    api_key_status = "API_KEY is set" if API_KEY else "API_KEY is NOT set"
    api_key_preview = API_KEY[:10] + "..." if API_KEY else "None"
    return jsonify({
        'status': 'Flask app is working', 
        'files': os.listdir('static/dashboard/assets'),
        'api_key_status': api_key_status,
        'api_key_preview': api_key_preview
    })

@app.route('/dashboard')
def serve_dashboard():
    print("DEBUG: Serving dashboard index.html")
    return send_from_directory('static/dashboard', 'index.html')

@app.route('/dashboard/<path:path>')
def serve_dashboard_static(path):
    print(f"DEBUG: Serving dashboard asset: {path}")
    return send_from_directory('static/dashboard', path)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# --- Helper functions (from api_pulled.py) ---
def get_all_videos_from_playlist(playlist_id):
    """Get all videos from a playlist (uploads playlist), with debug prints."""
    videos = []
    url = 'https://www.googleapis.com/youtube/v3/playlistItems'
    params = {
        'part': 'snippet,contentDetails',
        'playlistId': playlist_id,
        'maxResults': 50,
        'key': API_KEY
    }
    page = 1
    while True:
        resp = requests.get(url, params=params)
        try:
            resp.raise_for_status()
        except Exception:
            raise
        data = resp.json()
        for item in data.get('items', []):
            videos.append({
                'video_id': item['contentDetails']['videoId'],
                'title': item['snippet']['title'],
                'published_at': item['snippet']['publishedAt']
            })
        if 'nextPageToken' in data:
            params['pageToken'] = data['nextPageToken']
            page += 1
        else:
            break
    return videos

def get_video_details(video_ids):
    details = []
    url = 'https://www.googleapis.com/youtube/v3/videos'
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        params = {
            'id': ','.join(batch),
            'part': 'contentDetails,statistics',
            'key': API_KEY
        }
        resp = requests.get(url, params=params).json()
        for item in resp.get('items', []):
            vid = item['id']
            dur = item['contentDetails']['duration']
            stats = item.get('statistics', {})
            details.append({
                'video_id': vid,
                'duration': dur,
                'view_count': int(stats.get('viewCount', 0)),
                'like_count': int(stats.get('likeCount', 0)),
                'comment_count': int(stats.get('commentCount', 0))
            })
    return details

def filter_shorts(videos, details, max_seconds=60):
    details_map = {d['video_id']: d for d in details}
    shorts = []
    for v in videos:
        vid = v['video_id']
        if vid not in details_map:
            continue
        d = details_map[vid]
        seconds = isodate.parse_duration(d['duration']).total_seconds()
        if seconds <= max_seconds:
            shorts.append({
                'video_id': vid,
                'title': v['title'],
                'published_at': v['published_at'],
                'duration_seconds': seconds,
                'view_count': d['view_count'],
                'like_count': d['like_count'],
                'comment_count': d['comment_count']
            })
    return shorts

# --- Analytics processing (from cleaning_data.ipynb) ---
def process_analytics_data(shorts_path):
    w_comment_norm = 0.7842535737762139 # see Mikayla_Stats_Pull in google colab
    w_like_norm = 0.21574642622378612 # see Mikayla_Stats_Pull in google colab
    total_stats = pd.read_csv(shorts_path)
    
    # Clean NaN values in numeric columns before calculations
    total_stats['view_count'] = total_stats['view_count'].fillna(0)
    total_stats['like_count'] = total_stats['like_count'].fillna(0)
    total_stats['comment_count'] = total_stats['comment_count'].fillna(0)
    total_stats['duration_seconds'] = total_stats['duration_seconds'].fillna(0)
    
    # Calculate engagement rate with safe division
    total_stats['engagement_rate'] = (total_stats['comment_count'] * w_comment_norm + total_stats['like_count'] * w_like_norm) / total_stats['view_count'].replace(0, 1)
    total_stats['num_words'] = total_stats['title'].str.split().str.len()
    total_stats['published_at'] = pd.to_datetime(total_stats['published_at'], utc=True)
    total_stats['date'] = total_stats['published_at'].dt.date
    total_stats['time'] = total_stats['published_at'].dt.time
    total_stats['hour'] = total_stats['published_at'].dt.hour
            
    # Filter for Shorts after a certain date
    # start_date = pd.Timestamp('2022-06-05', tz='UTC')
    # shorts = total_stats[total_stats['published_at'] >= start_date].copy()
    shorts = total_stats.copy()
    
    # Add features
    # Handle NaN titles by filling with empty string
    shorts['title'] = shorts['title'].fillna('')
    
    shorts['has_hashtags'] = shorts['title'].str.contains('#', na=False)
    shorts['hashtag_count'] = shorts['title'].str.count('#')

    shorts['has_emojis'] = shorts['title'].apply(lambda x: emoji.emoji_count(str(x)) > 0)
    shorts['emoji_count'] = shorts['title'].apply(lambda x: emoji.emoji_count(str(x)))
    
    def clean_title(title):
        return re.sub(r'#\S+', '', title).strip()

    shorts['clean_title'] = shorts['title'].apply(clean_title)
    shorts['title_length'] = shorts['title'].str.len()
    def compute_sentiment(text):
        blob = TextBlob(text)
        return blob.sentiment.polarity
    shorts['sentiment_polarity'] = shorts['clean_title'].apply(compute_sentiment)
    shorts['sentiment'] = shorts['sentiment_polarity'].apply(lambda x: 'positive' if x > 0 else 'negative' if x < 0 else 'neutral')
    

    shorts['day_of_week'] = pd.to_datetime(shorts['date']).dt.day_name()
    shorts = shorts.sort_values('published_at')

    # Group by day
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
            f'https://img.youtube.com/vi/{vid.strip()}/hqdefault.jpg'
            for vid in id_str.split(',')
        ])
    )

    shorts = shorts.replace([np.nan, np.inf, -np.inf], None)
    by_day = by_day.replace([np.nan, np.inf, -np.inf], None)

    # Convert date and time objects to strings for JSON serialization
    shorts_dict = shorts.to_dict('records')
    for record in shorts_dict:
        if 'time' in record and record['time'] is not None:
            record['time'] = str(record['time'])
        if 'date' in record and record['date'] is not None:
            record['date'] = str(record['date'])
    daily_dict = by_day.to_dict('records')
    for record in daily_dict:
        if 'date' in record and record['date'] is not None:
            record['date'] = str(record['date'])
    
    return {
        'shorts_data': shorts_dict,
        'daily_data': daily_dict,
        'summary': {
            'total_shorts': len(shorts),
            'date_range': {
                'start': str(shorts['published_at'].min()),
                'end': str(shorts['published_at'].max())
            },
            'total_views': int(shorts['view_count'].sum()),
            'avg_views_per_short': float(shorts['view_count'].mean()) if len(shorts) > 0 else 0
        }
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_channel():
    try:
        channel_id = request.form.get('channelId')
        csv_file = request.files.get('csvFile')
        
        print(f"DEBUG: API MODE - channel_id: {channel_id}")
        print(f"DEBUG: API MODE - csv_file: {csv_file}")
        print(f"DEBUG: API MODE - csv_file.filename: {csv_file.filename if csv_file else 'None'}")
        
        if not channel_id:
            return jsonify({'error': 'Channel ID is required.'}), 400
        if not re.match(r'^UC[\w-]{22}$', channel_id):
            return jsonify({'error': 'Invalid channel ID format.'}), 400
        
        with tempfile.TemporaryDirectory() as tmpdir:
            # Check if this is a dummy CSV file (channel-only analysis)
            is_channel_only = not csv_file or csv_file.filename == 'dummy.csv'
            
            if not is_channel_only:
                # Full analysis with CSV
                if not csv_file:
                    return jsonify({'error': 'CSV file is required for full analysis.'}), 400
                
                csv_path = os.path.join(tmpdir, 'stats.csv')
                csv_file.save(csv_path)
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                'part': 'contentDetails',
                'id': channel_id,
                'key': API_KEY
            }
            resp = requests.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            if not data.get('items'):
                return jsonify({'error': 'Channel not found or invalid channel ID.'}), 404
            uploads_playlist_id = data['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            videos = get_all_videos_from_playlist(uploads_playlist_id)
            video_ids = [v['video_id'] for v in videos]
            details = get_video_details(video_ids)
            shorts = filter_shorts(videos, details)
            shorts_path = os.path.join(tmpdir, 'shorts.csv')
            pd.DataFrame(shorts).to_csv(shorts_path, index=False)
            
            # Process analytics data
            processed = process_analytics_data(shorts_path)
            
            # Save processed shorts_data as CSV for downstream scripts
            processed_shorts_path = os.path.join(tmpdir, 'processed_shorts.csv')
            pd.DataFrame(processed['shorts_data'])[
                [
                    'video_id', 'title', 'published_at', 'date', 'time', 'hour',
                    'duration_seconds', 'view_count', 'like_count', 'comment_count', 'engagement_rate',
                    'has_hashtags', 'hashtag_count', 'has_emojis', 'emoji_count',
                    'clean_title', 'num_words',
                    'sentiment_polarity', 'sentiment', 'day_of_week'
                ]
            ].to_csv(processed_shorts_path, index=False)
            shutil.copy(processed_shorts_path, 'data/processed_shorts.csv')
            
            if is_channel_only:
                # Channel-only analysis - return data
                response_data = {
                    'success': True,
                    'data': processed,
                    'message': 'Channel analysis completed successfully.'
                }
                return jsonify(response_data)
            else:
                # Full analysis with CSV
                sub_peaks_path = os.path.join(tmpdir, 'sub_peaks.csv')
                attributions_path = os.path.join(tmpdir, 'attributions.csv')
                shorts_by_day_path = os.path.join(tmpdir, 'shorts_by_day.csv')
                
                # Run analysis scripts
                script_dir = os.path.dirname(os.path.abspath(__file__))
                try:
                    result = subprocess.run([sys.executable, os.path.join(script_dir, 'generate_sub_peaks.py'), csv_path, sub_peaks_path], 
                                          check=True, capture_output=True, text=True, cwd=script_dir)
                except subprocess.CalledProcessError as e:
                    print(f"DEBUG: generate_sub_peaks.py failed with error: {e}")
                    print(f"DEBUG: stdout: {e.stdout}")
                    print(f"DEBUG: stderr: {e.stderr}")
                    raise
                
                try:
                    result = subprocess.run([sys.executable, os.path.join(script_dir, 'generate_attributions.py'), sub_peaks_path, processed_shorts_path, attributions_path], 
                                          check=True, capture_output=True, text=True, cwd=script_dir)
                except subprocess.CalledProcessError as e:
                    print(f"DEBUG: generate_attributions.py failed with error: {e}")
                    print(f"DEBUG: stdout: {e.stdout}")
                    print(f"DEBUG: stderr: {e.stderr}")
                    raise
                
                try:
                    result = subprocess.run([sys.executable, os.path.join(script_dir, 'generate_shorts_by_day.py'), processed_shorts_path, shorts_by_day_path], 
                                          check=True, capture_output=True, text=True, cwd=script_dir)
                except subprocess.CalledProcessError as e:
                    print(f"DEBUG: generate_shorts_by_day.py failed with error: {e}")
                    print(f"DEBUG: stdout: {e.stdout}")
                    print(f"DEBUG: stderr: {e.stderr}")
                    raise
                
                # Load outputs
                sub_peaks_df = pd.read_csv(sub_peaks_path)
                
                # Check if attributions file contains an error message
                try:
                    attributions_df = pd.read_csv(attributions_path)
                    if 'error' in attributions_df.columns and 'message' in attributions_df.columns:
                        error_row = attributions_df.iloc[0]
                        if error_row['error'] == 'no_overlap':
                            return jsonify({'error': 'No date overlap between subscriber peaks and shorts data. Please ensure the uploaded CSV file matches the channel ID.'}), 400
                        elif error_row['error'] == 'no_attributions':
                            return jsonify({'error': 'No attributions found. The subscriber peaks may not align with the shorts data.'}), 400
                except Exception as e:
                    return jsonify({'error': 'Failed to process attributions data.'}), 500
                
                shorts_by_day_df = pd.read_csv(shorts_by_day_path)
                sub_stats_df = pd.read_csv(csv_path)
                
                # Convert to records
                sub_peaks = sub_peaks_df.to_dict('records')
                attributions = attributions_df.to_dict('records')
                shorts_by_day = shorts_by_day_df.to_dict('records')
                sub_stats = sub_stats_df.to_dict('records')
                
                response_data = {
                    'success': True,
                    'data': processed,
                    'sub_peaks': sub_peaks,
                    'attributions': attributions,
                    'shorts_by_day': shorts_by_day,
                    'sub_stats': sub_stats,
                    'message': 'Analysis completed successfully.'
                }
                return jsonify(response_data)
            
    except Exception as e:
        import traceback
        print(f"DEBUG: Exception occurred: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/shorts_data', methods=['GET'])
def get_processed_shorts_data():
    print("DEBUG: /api/shorts_data endpoint called")
    processed_shorts_path = 'data/processed_shorts.csv'
    if not os.path.exists(processed_shorts_path):
        print("DEBUG: processed_shorts.csv not found")
        return jsonify({'data': []})
    df = pd.read_csv(processed_shorts_path)
    
    # Replace NaN values with None for JSON serialization
    df = df.replace([np.nan, np.inf, -np.inf], None)
    
    data = df.to_dict('records')
    print(f"DEBUG: Returning {len(data)} records from processed_shorts.csv")
    return jsonify({'data': data})

@app.route('/api/dashboard_data', methods=['GET'])
def get_dashboard_data():
    """Get processed dashboard data from processed_shorts.csv with calculated statistics."""
    print("DEBUG: /api/dashboard_data endpoint called")
    processed_shorts_path = 'data/processed_shorts.csv'
    
    if not os.path.exists(processed_shorts_path):
        print("DEBUG: processed_shorts.csv not found")
        return jsonify({'error': 'No processed shorts data available'}), 404
    
    try:
        df = pd.read_csv(processed_shorts_path)
        
        # Get date range parameters from query string
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get filter parameters from query string (support multiple filters)
        hashtag_filter = request.args.get('hashtag_filter')  # 'true', 'false', or None
        emoji_filter = request.args.get('emoji_filter')  # 'true', 'false', or None
        sentiment_filter = request.args.get('sentiment_filter')  # 'positive', 'negative', 'neutral', or None
        
        print(f"DEBUG: Received filters - hashtag: {hashtag_filter}, emoji: {emoji_filter}, sentiment: {sentiment_filter}")
        
        # Filter data by date range if provided
        if start_date and end_date:
            print(f"DEBUG: Filtering data from {start_date} to {end_date}")
            df['date'] = pd.to_datetime(df['date'])
            df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
            print(f"DEBUG: Date filtered data contains {len(df)} records")
        
        # Apply hashtag filter if provided
        if hashtag_filter is not None:
            has_hashtags = hashtag_filter.lower() == 'true'
            df = df[df['has_hashtags'] == has_hashtags]
            print(f"DEBUG: Filtered by hashtags (has_hashtags={has_hashtags}), {len(df)} records remaining")
        
        # Apply emoji filter if provided
        if emoji_filter is not None:
            has_emojis = emoji_filter.lower() == 'true'
            df = df[df['has_emojis'] == has_emojis]
            print(f"DEBUG: Filtered by emojis (has_emojis={has_emojis}), {len(df)} records remaining")
        
        # Apply sentiment filter if provided
        if sentiment_filter is not None:
            print(f"DEBUG: Before sentiment filtering - unique sentiment values: {df['sentiment'].unique()}")
            print(f"DEBUG: Looking for sentiment: '{sentiment_filter.lower()}'")
            df = df[df['sentiment'] == sentiment_filter.lower()]
            print(f"DEBUG: Filtered by sentiment ({sentiment_filter}), {len(df)} records remaining")
            print(f"DEBUG: After filtering - unique sentiment values: {df['sentiment'].unique()}")
        
        # Calculate dashboard statistics
        total_shorts = len(df)
        avg_views = float(df['view_count'].mean()) if total_shorts > 0 else 0
        avg_likes = float(df['like_count'].mean()) if total_shorts > 0 else 0
        avg_comments = float(df['comment_count'].mean()) if total_shorts > 0 else 0
        avg_words = float(df['num_words'].mean()) if total_shorts > 0 else 0
        
        # Calculate average shorts per day
        df['date'] = pd.to_datetime(df['date'])
        shorts_per_day = df.groupby('date').size()
        avg_shorts_per_day = float(shorts_per_day.mean()) if len(shorts_per_day) > 0 else 0
        
        # Hashtag statistics
        shorts_with_hashtags = df[df['has_hashtags'] == True]
        shorts_without_hashtags = df[df['has_hashtags'] == False]
        hashtag_usage_percentage = (len(shorts_with_hashtags) / total_shorts) * 100 if total_shorts > 0 else 0
        avg_hashtags_per_video = float(shorts_with_hashtags['hashtag_count'].mean()) if len(shorts_with_hashtags) > 0 else 0
        
        # Hashtag average views
        # Handle NaN and infinite values
        hashtag_views_with = shorts_with_hashtags['view_count'].replace([np.inf, -np.inf], np.nan).dropna()
        hashtag_views_without = shorts_without_hashtags['view_count'].replace([np.inf, -np.inf], np.nan).dropna()
        
        avg_views_with_hashtags = float(hashtag_views_with.mean()) if len(hashtag_views_with) > 0 else 0
        avg_views_without_hashtags = float(hashtag_views_without.mean()) if len(hashtag_views_without) > 0 else 0
        
        # Emoji statistics
        shorts_with_emojis = df[df['has_emojis'] == True]
        shorts_without_emojis = df[df['has_emojis'] == False]
        emoji_usage_percentage = (len(shorts_with_emojis) / total_shorts) * 100 if total_shorts > 0 else 0
        avg_emojis_per_video = float(shorts_with_emojis['emoji_count'].mean()) if len(shorts_with_emojis) > 0 else 0
        
        # Emoji average views
        # Handle NaN and infinite values
        emoji_views_with = shorts_with_emojis['view_count'].replace([np.inf, -np.inf], np.nan).dropna()
        emoji_views_without = shorts_without_emojis['view_count'].replace([np.inf, -np.inf], np.nan).dropna()
        
        avg_views_with_emojis = float(emoji_views_with.mean()) if len(emoji_views_with) > 0 else 0
        avg_views_without_emojis = float(emoji_views_without.mean()) if len(emoji_views_without) > 0 else 0
        
        # Top performing shorts (by views)
        top_shorts = df.nlargest(5, 'view_count')[['title', 'view_count', 'like_count', 'comment_count']].to_dict('records')
        print(f"DEBUG: Top shorts after filtering: {len(top_shorts)} shorts")
        
        # Sentiment analysis
        if sentiment_filter is not None:
            # If filtering by sentiment, only show that sentiment's count
            sentiment_stats = {sentiment_filter.lower(): len(df)}
        else:
            # If no sentiment filter, show all sentiment counts
            sentiment_stats = df['sentiment'].value_counts().to_dict()
        print(f"DEBUG: Sentiment stats after filtering: {sentiment_stats}")
        

        
        # Videos posted per day of the week (horizontal bar chart)
        videos_per_day = df['day_of_week'].value_counts().to_dict()
        print(f"DEBUG: videos_per_day data: {videos_per_day}")
        
        # Time distribution analysis (success by posting time)
        # Group by hour and calculate average views
        time_success_data = df.groupby('hour')['view_count'].mean().replace([np.nan, np.inf, -np.inf], 0).to_dict()
        print(f"DEBUG: time_success_data: {time_success_data}")
        
        # Create time buckets for better visualization
        time_buckets = {
            'Early Morning (6-9 AM)': df[(df['hour'] >= 6) & (df['hour'] < 9)]['view_count'].mean(),
            'Morning (9-12 PM)': df[(df['hour'] >= 9) & (df['hour'] < 12)]['view_count'].mean(),
            'Afternoon (12-3 PM)': df[(df['hour'] >= 12) & (df['hour'] < 15)]['view_count'].mean(),
            'Late Afternoon (3-6 PM)': df[(df['hour'] >= 15) & (df['hour'] < 18)]['view_count'].mean(),
            'Evening (6-9 PM)': df[(df['hour'] >= 18) & (df['hour'] < 21)]['view_count'].mean(),
            'Night (9-12 AM)': df[(df['hour'] >= 21) | (df['hour'] < 6)]['view_count'].mean()
        }
        # Replace NaN values with 0
        time_buckets = {k: v if not pd.isna(v) else 0 for k, v in time_buckets.items()}
        print(f"DEBUG: time_buckets: {time_buckets}")
        
        # Create heat map data for different metrics (hour vs day of week) with median values
        heat_map_data = {
            'videos_posted': {},
            'views': {},
            'likes': {},
            'comments': {}
        }
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for hour in range(24):
            heat_map_data['videos_posted'][hour] = {}
            heat_map_data['views'][hour] = {}
            heat_map_data['likes'][hour] = {}
            heat_map_data['comments'][hour] = {}
            
            for day in day_order:
                day_hour_data = df[(df['day_of_week'] == day) & (df['hour'] == hour)]
                if len(day_hour_data) > 0:
                    # For videos posted, count the number of videos
                    heat_map_data['videos_posted'][hour][day] = int(len(day_hour_data))
                    
                    # For other metrics, use total values (sum)
                    # This shows the total volume of engagement at each time slot
                    heat_map_data['views'][hour][day] = int(day_hour_data['view_count'].sum())
                    heat_map_data['likes'][hour][day] = int(day_hour_data['like_count'].sum())
                    heat_map_data['comments'][hour][day] = int(day_hour_data['comment_count'].sum())
                else:
                    heat_map_data['videos_posted'][hour][day] = 0
                    heat_map_data['views'][hour][day] = 0
                    heat_map_data['likes'][hour][day] = 0
                    heat_map_data['comments'][hour][day] = 0
        
        print(f"DEBUG: heat_map_data created with {len(heat_map_data)} metrics")
        
        # Prepare scatter plot data (duration vs engagement rate)
        scatter_data = {
            'duration_vs_engagement': df[['duration_seconds', 'engagement_rate']].dropna().to_dict('records'),
        }
        print(f"DEBUG: Scatter data points after filtering: {len(scatter_data['duration_vs_engagement'])} points")
        
            # Prepare time series data for sparklines
        # Group by week and calculate weekly averages
        df['date'] = pd.to_datetime(df['date'])
        
        # Create week column (Monday as start of week)
        df['month_start'] = df['date'].dt.to_period('M').dt.start_time
        
        monthly_stats = df.groupby('month_start').agg({
            'view_count': 'mean',
            'like_count': 'mean', 
            'comment_count': 'mean'
        }).reset_index()
        
        # Replace NaN values with 0 for JSON serialization
        monthly_stats = monthly_stats.replace([np.nan, np.inf, -np.inf], 0)
        
        # Rename week_start back to date for frontend compatibility
        monthly_stats = monthly_stats.rename(columns={'month_start': 'date'})
        
        # Sort by date and format for frontend
        monthly_stats = monthly_stats.sort_values('date')
        time_series_data = {
            'views': monthly_stats[['date', 'view_count']].to_dict('records'),
            'likes': monthly_stats[['date', 'like_count']].to_dict('records'),
            'comments': monthly_stats[['date', 'comment_count']].to_dict('records')
        }
        
        # Format numbers for display
        def format_number(num):
            if num >= 1000000:
                return f"{num/1000000:.1f}M"
            elif num >= 1000:
                return f"{num/1000:.1f}K"
            else:
                return f"{num:.0f}"
        
        dashboard_data = {
            'summary': {
                'total_shorts': total_shorts,
                'avg_views': format_number(avg_views),
                'avg_likes': format_number(avg_likes),
                'avg_comments': format_number(avg_comments),
                'avg_words': round(avg_words, 2),
                'avg_shorts_per_day': round(avg_shorts_per_day, 1),
                'avg_views_raw': avg_views,
                'avg_likes_raw': avg_likes,
                'avg_comments_raw': avg_comments
            },
            'hashtag_stats': {
                'usage_percentage': round(hashtag_usage_percentage, 1),
                'non_usage_percentage': round(100 - hashtag_usage_percentage, 1),
                'avg_hashtags_per_video': round(avg_hashtags_per_video, 1),
                'avg_views_with': round(avg_views_with_hashtags, 1),
                'avg_views_without': round(avg_views_without_hashtags, 1)
            },
            'emoji_stats': {
                'usage_percentage': round(emoji_usage_percentage, 1),
                'non_usage_percentage': round(100 - emoji_usage_percentage, 1),
                'avg_emojis_per_video': round(avg_emojis_per_video, 1),
                'avg_views_with': round(avg_views_with_emojis, 1),
                'avg_views_without': round(avg_views_without_emojis, 1)
            },
            'sentiment_stats': sentiment_stats,
            'videos_per_day': videos_per_day,
            'time_success_data': time_success_data,
            'time_buckets': time_buckets,
            'heat_map_data': heat_map_data,
            'top_shorts': top_shorts,
            'scatter_data': scatter_data,
            'time_series_data': time_series_data
        }
        
        print(f"DEBUG: Returning dashboard data with {total_shorts} shorts")
        return jsonify(dashboard_data)
        
    except Exception as e:
        print(f"DEBUG: Error processing dashboard data: {str(e)}")
        return jsonify({'error': f'Failed to process dashboard data: {str(e)}'}), 500

if __name__ == '__main__':
    # Use production settings for Railway deployment
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False) 