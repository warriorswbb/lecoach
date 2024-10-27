import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np

@st.cache_data
def load_data(file_path):
    # Load data and handle nulls
    data = pd.read_csv(file_path, usecols=['shot_x', 'shot_y', 'season', 'play_actor_team', 'play_actor_player'])
    
    # Drop rows where both shot_x and shot_y are null
    data = data.dropna(subset=['shot_x', 'shot_y'], how='all')
    
    # Fill single null values with 0
    data['shot_x'] = data['shot_x'].fillna(0)
    data['shot_y'] = data['shot_y'].fillna(0)
    
    return data

# Load the data
file_path = 'play_by_play.csv'  # Make sure to use the correct path
data = load_data(file_path)

# Sidebar dropdowns for filtering
seasons = data['season'].unique()
teams = np.append("All Teams", data['play_actor_team'].unique())  # Add an "All Teams" option
players = np.append("All Players", data['play_actor_player'].unique())  # Add an "All Players" option

selected_season = st.sidebar.selectbox("Select Season", options=seasons, index=0)
selected_player = st.sidebar.selectbox("Select Player", options=players, index=0)

# If a specific player is selected, set team filter to "All Teams"
if selected_player != "All Players":
    selected_team = "All Teams"
else:
    selected_team = st.sidebar.selectbox("Select Team", options=teams, index=0)

# Add sliders for adjusting visualization
std_dev_multiplier = st.sidebar.slider("Standard Deviation Multiplier", 1.0, 5.0, 3.0, step=0.1)
density_threshold = st.sidebar.slider("Density Threshold", 0, 10, 1, step=1)

# Filter data based on selections
filtered_data = data[(data['season'] == selected_season)]

if selected_player != "All Players":
    filtered_data = filtered_data[filtered_data['play_actor_player'] == selected_player]
elif selected_team != "All Teams":
    filtered_data = filtered_data[filtered_data['play_actor_team'] == selected_team]

# Calculate density and adjust color scale based on non-zero density distribution
hist, x_edges, y_edges = np.histogram2d(filtered_data['shot_x'], filtered_data['shot_y'], bins=50)
density_values = hist.flatten()
non_zero_density = density_values[density_values > density_threshold]  # Apply density threshold

mean_density = np.mean(non_zero_density)
std_density = np.std(non_zero_density)

# Set dynamic color scale range based on non-zero densities and standard deviation multiplier
zmin = max(0, mean_density - std_density)
zmax = mean_density + std_dev_multiplier * std_density

# Display the contour plot
st.title("🏀 USports Shot Charts")

fig = px.density_contour(filtered_data, x='shot_x', y='shot_y', title=f"Shot Position Density Contour Plot {selected_season} - {selected_team if selected_team != 'All Teams' else 'All Teams'} - {selected_player if selected_player != 'All Players' else 'All Players'}")
fig.update_traces(contours_coloring="heatmap", colorscale="Viridis")

# Apply the dynamic scale, ignoring zero-density points
fig.update_layout(
    coloraxis_colorbar=dict(
        title="Density",
        tickvals=list(np.arange(zmin, zmax, (zmax - zmin) / 10)),  # Ticks adjusted based on dynamic range
    )
)
fig.update_traces(zmin=zmin, zmax=zmax)  # Set dynamic range for the color scale

fig.update_layout(width=700, height=700, xaxis_title="Shot X", yaxis_title="Shot Y")

st.plotly_chart(fig)
