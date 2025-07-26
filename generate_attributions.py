import pandas as pd
import sys

# Usage: python generate_attributions.py sub_peaks.csv clean_shorts_data.csv output_attributions.csv

if len(sys.argv) != 4:
    print("Usage: python generate_attributions.py sub_peaks.csv clean_shorts_data.csv output_attributions.csv")
    sys.exit(1)

peaks = pd.read_csv(sys.argv[1], parse_dates=["date"])
shorts = pd.read_csv(sys.argv[2], parse_dates=["date"])

# Check if there's any overlap
if peaks["date"].max() < shorts["date"].min() or peaks["date"].min() > shorts["date"].max():
    # Create an empty file with an error message
    with open(sys.argv[3], 'w') as f:
        f.write("error,message\n")
        f.write("no_overlap,No date overlap between subscriber peaks and shorts data. Please ensure the uploaded CSV file matches the channel ID.\n")
    sys.exit(0)

LOOKBACK_DAYS = 7
top_k = 3
attrib_rows = []
for _, peak in peaks.iterrows():
    pk_date = peak["date"]
    subs_val = peak["value"]
    window = shorts[(shorts["date"] >= pk_date - pd.Timedelta(days=LOOKBACK_DAYS)) & (shorts["date"] < pk_date)]
    if window.empty:
        continue
    top_videos = window.sort_values("view_count", ascending=False).head(top_k)
    for _, vid in top_videos.iterrows():
        attrib_rows.append({
            "peak_date": pk_date,
            "subs_at_peak": subs_val,
            "candidate_video_id": vid["video_id"],
            "candidate_date": vid["date"],
            "title": vid["title"],
            "views": vid["view_count"],
            "likes": vid.get("like_count", 0),
            "comments": vid.get("comment_count", 0),
        })

if not attrib_rows:
    with open(sys.argv[3], 'w') as f:
        f.write("error,message\n")
        f.write("no_attributions,No attributions found. The subscriber peaks may not align with the shorts data.\n")
else:
    attrib_df = pd.DataFrame(attrib_rows)
    attrib_df.to_csv(sys.argv[3], index=False) 