import pandas as pd
from scipy.signal import find_peaks
import sys

# Usage: python generate_sub_peaks.py sub_day.csv output_sub_peaks.csv

if len(sys.argv) != 3:
    print("Usage: python generate_sub_peaks.py sub_day.csv output_sub_peaks.csv")
    sys.exit(1)

try:
    sub_day = pd.read_csv(sys.argv[1], parse_dates=["Date"]).sort_values("Date").set_index("Date")
    series = sub_day["Subscribers"]
except Exception as e:
    print("Error reading input file or columns:", e)
    try:
        df = pd.read_csv(sys.argv[1])
        print("Columns in your file:", df.columns.tolist())
    except Exception as e2:
        print("Could not read file at all:", e2)
    sys.exit(1)

peaks, props = find_peaks(series, height=series.mean() + series.std(), distance=3)
peak_df = pd.DataFrame({
    "date": series.index[peaks],
    "value": series.values[peaks].round().astype(int)
})
peak_df.to_csv(sys.argv[2], index=False) 