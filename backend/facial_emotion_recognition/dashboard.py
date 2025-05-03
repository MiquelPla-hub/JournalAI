import streamlit as st
import json
import pandas as pd
import plotly.express as px
from datetime import datetime
import os

st.set_page_config(page_title="Emotion Analysis Dashboard", layout="wide")

# Title
st.title("Emotion Recognition Dashboard")

# Check if the JSON file exists
if not os.path.exists('emotion_database.json'):
    st.error("No emotion data found. Please run the emotion detection program first.")
    st.stop()

# Load the data
try:
    with open('emotion_database.json', 'r') as f:
        data = json.load(f)
except json.JSONDecodeError:
    st.error("Error reading the emotion database. The file might be empty or corrupted.")
    st.stop()

if not data:
    st.warning("No emotion data available yet. Please run the emotion detection program to collect data.")
    st.stop()

# Convert to DataFrame
df = pd.DataFrame(data)

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Sidebar filters
st.sidebar.header("Filters")
date_range = st.sidebar.date_input(
    "Select Date Range",
    value=(df['timestamp'].min().date(), df['timestamp'].max().date()),
    min_value=df['timestamp'].min().date(),
    max_value=df['timestamp'].max().date()
)

# Filter data based on date range
start_date = pd.Timestamp(date_range[0])
end_date = pd.Timestamp(date_range[1]) + pd.Timedelta(days=1)
filtered_df = df[(df['timestamp'] >= start_date) & (df['timestamp'] < end_date)]

# Main metrics
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Total Time Intervals", len(filtered_df))
with col2:
    total_detections = filtered_df['total_detections'].sum()
    st.metric("Total Emotion Detections", total_detections)
with col3:
    if not filtered_df.empty:
        most_common_overall = filtered_df['most_common_emotion'].mode()[0]
        st.metric("Most Common Emotion Overall", most_common_overall)

# Create tabs for different visualizations
tab1, tab2, tab3 = st.tabs(["Emotion Distribution", "Timeline Analysis", "Raw Data"])

with tab1:
    # Emotion distribution pie chart
    st.subheader("Emotion Distribution")
    all_emotions = [emotion for emotions in filtered_df['emotions'] for emotion in emotions]
    emotion_counts = pd.Series(all_emotions).value_counts()
    fig_pie = px.pie(values=emotion_counts.values, names=emotion_counts.index, title="Emotion Distribution")
    st.plotly_chart(fig_pie, use_container_width=True)

with tab2:
    # Timeline of most common emotions
    st.subheader("Emotion Timeline")
    fig_timeline = px.scatter(
        filtered_df,
        x='timestamp',
        y='most_common_emotion',
        color='most_common_emotion',
        size='total_detections',
        title="Emotion Timeline"
    )
    fig_timeline.update_layout(xaxis_title="Time", yaxis_title="Most Common Emotion")
    st.plotly_chart(fig_timeline, use_container_width=True)

    # Detection frequency over time
    st.subheader("Detection Frequency")
    fig_freq = px.line(
        filtered_df,
        x='timestamp',
        y='total_detections',
        title="Number of Detections Over Time"
    )
    st.plotly_chart(fig_freq, use_container_width=True)

with tab3:
    # Display raw data
    st.subheader("Raw Data")
    st.dataframe(filtered_df)

# Add a refresh button
if st.button("Refresh Data"):
    st.experimental_rerun() 