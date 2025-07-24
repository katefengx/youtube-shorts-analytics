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
load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv('API_KEY')

# ===== MODE SELECTION =====
# Set to 'API' to use YouTube API, or 'CSV' to use local data
MODE = 'API'  # Change this to 'API' when you want to use the real API

# CSV file paths for local data mode
MOCK_API_DATA_PATH = 'data/mock_api_data.csv'  # Mock YouTube API response data
MOCK_USER_UPLOAD_PATH = 'data/mock_user_upload.csv'  # Mock user's uploaded subscriber data

# --- Serve static frontend ---
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

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
    total_stats = pd.read_csv(shorts_path)
    total_stats['published_at'] = pd.to_datetime(total_stats['published_at'], utc=True)
    total_stats['date'] = total_stats['published_at'].dt.date
    total_stats['time'] = total_stats['published_at'].dt.time
    total_stats['hour'] = total_stats['published_at'].dt.hour
            
    # Filter for Shorts after a certain date
    start_date = pd.Timestamp('2022-06-05', tz='UTC')
    shorts = total_stats[total_stats['published_at'] >= start_date].copy()
    
    # Add features
    shorts['has_hashtags'] = shorts['title'].str.contains('#', na=False)
    shorts['hashtag_count'] = shorts['title'].str.count('#')
    shorts['has_emojis'] = shorts['title'].str.contains(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F1E0-\U0001F1FF]', regex=True, na=False)
    shorts['emoji_count'] = shorts['title'].str.count(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F1E0-\U0001F1FF]')
    
    def clean_title(title):
        return re.sub(r'#\S+', '', title).strip()
    def caps_percentage(title):
        if not title:
            return 0
        total_alpha = sum(c.isalpha() for c in title)
        if total_alpha == 0:
            return 0
        upper_alpha = sum(c.isupper() for c in title)
        return (upper_alpha / total_alpha) * 100

    shorts['clean_title'] = shorts['title'].apply(clean_title)
    shorts['caps_percentage'] = shorts['clean_title'].apply(caps_percentage)
    shorts['title_length'] = shorts['clean_title'].str.len()
    def compute_sentiment(text):
        blob = TextBlob(text)
        return blob.sentiment.polarity, blob.sentiment.subjectivity
    sentiments = shorts['clean_title'].apply(compute_sentiment)
    shorts['sentiment_polarity'] = sentiments.apply(lambda x: x[0])
    shorts['sentiment_subjectivity'] = sentiments.apply(lambda x: x[1])
    shorts = shorts.sort_values('published_at')
    shorts['time_since_last_post'] = shorts['published_at'].diff().dt.total_seconds().fillna(0)

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
            'avg_views_per_short': float(shorts['view_count'].mean())
        }
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_channel():
    try:
        channel_id = request.form.get('channelId')
        csv_file = request.files.get('csvFile')
        
        if MODE == 'API':
            # ===== API MODE =====
            if not channel_id or not csv_file:
                return jsonify({'error': 'Channel ID and CSV file are required.'}), 400
            if not re.match(r'^UC[\w-]{22}$', channel_id):
                return jsonify({'error': 'Invalid channel ID format.'}), 400
            
            with tempfile.TemporaryDirectory() as tmpdir:
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
                
                # --- Run new scripts ---
                sub_peaks_path = os.path.join(tmpdir, 'sub_peaks.csv')
                attributions_path = os.path.join(tmpdir, 'attributions.csv')
                shorts_by_day_path = os.path.join(tmpdir, 'shorts_by_day.csv')
                # 1. Generate sub_peaks.csv
                processed = process_analytics_data(shorts_path)
                # Save processed shorts_data as CSV for downstream scripts
                processed_shorts_path = os.path.join(tmpdir, 'processed_shorts.csv')
                pd.DataFrame(processed['shorts_data'])[
                    [
                        'video_id', 'title', 'published_at', 'date', 'time', 'hour',
                        'duration_seconds', 'view_count', 'like_count', 'comment_count',
                        'has_hashtags', 'hashtag_count', 'has_emojis', 'emoji_count',
                        'clean_title', 'caps_percentage', 'title_length',
                        'sentiment_polarity', 'sentiment_subjectivity', 'time_since_last_post'
                    ]
                ].to_csv(processed_shorts_path, index=False)
                shutil.copy(processed_shorts_path, 'data/processed_shorts.csv')
                # Use processed_shorts_path for downstream scripts
                subprocess.run([sys.executable, 'generate_sub_peaks.py', csv_path, sub_peaks_path], check=True)
                subprocess.run([sys.executable, 'generate_attributions.py', sub_peaks_path, processed_shorts_path, attributions_path], check=True)
                subprocess.run([sys.executable, 'generate_shorts_by_day.py', processed_shorts_path, shorts_by_day_path], check=True)
                # Load outputs
                sub_peaks_df = pd.read_csv(sub_peaks_path)
                attributions_df = pd.read_csv(attributions_path)
                shorts_by_day_df = pd.read_csv(shorts_by_day_path)
                sub_stats_df = pd.read_csv(csv_path)
                # Convert to records
                sub_peaks = sub_peaks_df.to_dict('records')
                attributions = attributions_df.to_dict('records')
                shorts_by_day = shorts_by_day_df.to_dict('records')
                sub_stats = sub_stats_df.to_dict('records')
                
                # Debug logging
                print("DEBUG: sub_peaks length:", len(sub_peaks))
                print("DEBUG: attributions length:", len(attributions))
                print("DEBUG: shorts_by_day length:", len(shorts_by_day))
                print("DEBUG: sub_stats length:", len(sub_stats))
                print("DEBUG: processed keys:", list(processed.keys()))
                print("DEBUG: processed['shorts_data'] length:", len(processed.get('shorts_data', [])))
                print("DEBUG: processed['daily_data'] length:", len(processed.get('daily_data', [])))
                
                response_data = {
                    'success': True,
                    'data': processed,
                    'sub_peaks': sub_peaks,
                    'attributions': attributions,
                    'shorts_by_day': shorts_by_day,
                    'sub_stats': sub_stats,
                    'message': 'Analysis completed successfully'
                }
                print("DEBUG: Response data keys:", list(response_data.keys()))
                print("DEBUG: Response data structure:", {k: type(v) for k, v in response_data.items()})
                return jsonify(response_data)
        
        elif MODE == 'CSV':
            # ===== CSV MODE =====
            print(f"CSV MODE: Using mock API data and uploaded subscriber stats")
            
            if not csv_file:
                return jsonify({'error': 'CSV file is required in CSV mode.'}), 400
            
            # Check if mock API data exists
            if not os.path.exists(MOCK_API_DATA_PATH):
                return jsonify({'error': f'Mock API data file not found: {MOCK_API_DATA_PATH}'}), 404
            
            with tempfile.TemporaryDirectory() as tmpdir:
                # Save the uploaded CSV file (subscriber analytics)
                sub_stats_path = os.path.join(tmpdir, 'sub_stats.csv')
                csv_file.save(sub_stats_path)
                print(f"DEBUG: Saved uploaded subscriber stats to {sub_stats_path}")
                
                # Use mock API data as shorts data
                shorts_path = os.path.join(tmpdir, 'shorts.csv')
                mock_api_data = pd.read_csv(MOCK_API_DATA_PATH)
                mock_api_data.to_csv(shorts_path, index=False)
                print(f"DEBUG: Using mock API data with {len(mock_api_data)} rows as shorts data")
                
                # Process the mock API data (shorts)
                processed = process_analytics_data(shorts_path)
                
                # Convert uploaded subscriber data to the expected format
                sub_stats = pd.read_csv(sub_stats_path).to_dict('records')
                
                # Run the analysis scripts
                sub_peaks_path = os.path.join(tmpdir, 'sub_peaks.csv')
                attributions_path = os.path.join(tmpdir, 'attributions.csv')
                shorts_by_day_path = os.path.join(tmpdir, 'shorts_by_day.csv')
                
                # Save processed shorts_data as CSV for downstream scripts
                processed_shorts_path = os.path.join(tmpdir, 'processed_shorts.csv')
                pd.DataFrame(processed['shorts_data'])[
                    [
                        'video_id', 'title', 'published_at', 'date', 'time', 'hour',
                        'duration_seconds', 'view_count', 'like_count', 'comment_count',
                        'has_hashtags', 'hashtag_count', 'has_emojis', 'emoji_count',
                        'clean_title', 'caps_percentage', 'title_length',
                        'sentiment_polarity', 'sentiment_subjectivity', 'time_since_last_post'
                    ]
                ].to_csv(processed_shorts_path, index=False)
                shutil.copy(processed_shorts_path, 'data/processed_shorts.csv')
                
                # Run the analysis scripts
                subprocess.run([sys.executable, 'generate_sub_peaks.py', sub_stats_path, sub_peaks_path], check=True)
                subprocess.run([sys.executable, 'generate_attributions.py', sub_peaks_path, processed_shorts_path, attributions_path], check=True)
                subprocess.run([sys.executable, 'generate_shorts_by_day.py', processed_shorts_path, shorts_by_day_path], check=True)
                
                # Load outputs
                sub_peaks_df = pd.read_csv(sub_peaks_path)
                attributions_df = pd.read_csv(attributions_path)
                shorts_by_day_df = pd.read_csv(shorts_by_day_path)
                
                # Convert to records
                sub_peaks = sub_peaks_df.to_dict('records')
                attributions = attributions_df.to_dict('records')
                shorts_by_day = shorts_by_day_df.to_dict('records')
                
                # Debug logging
                print("DEBUG: sub_peaks length:", len(sub_peaks))
                print("DEBUG: attributions length:", len(attributions))
                print("DEBUG: shorts_by_day length:", len(shorts_by_day))
                print("DEBUG: sub_stats length:", len(sub_stats))
                print("DEBUG: processed keys:", list(processed.keys()))
                print("DEBUG: processed['shorts_data'] length:", len(processed.get('shorts_data', [])))
                print("DEBUG: processed['daily_data'] length:", len(processed.get('daily_data', [])))
                
                response_data = {
                    'success': True,
                    'data': processed,
                    'sub_peaks': sub_peaks,
                    'attributions': attributions,
                    'shorts_by_day': shorts_by_day,
                    'sub_stats': sub_stats,
                    'message': 'Analysis completed successfully (CSV mode)'
                }
                
                print("DEBUG: CSV MODE - Response data keys:", list(response_data.keys()))
                return jsonify(response_data)
        
        else:
            return jsonify({'error': f'Invalid mode: {MODE}. Use "API" or "CSV".'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shorts_data', methods=['GET'])
def get_processed_shorts_data():
    processed_shorts_path = 'data/processed_shorts.csv'
    if not os.path.exists(processed_shorts_path):
        return jsonify({'error': f'Processed shorts data not found at {processed_shorts_path}'}), 404
    df = pd.read_csv(processed_shorts_path)
    data = df.to_dict('records')
    return jsonify({'data': data})

@app.route('/dashboard')
def serve_dashboard():
    return send_from_directory('static/dashboard', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000) 