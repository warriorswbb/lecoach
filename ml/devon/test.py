import pandas as pd
from scipy.stats import spearmanr
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler

# Load the data
file_path = 'playerHealthData.csv'  # Update with your actual file path
data = pd.read_csv(file_path)

# Relevant columns
quantity_col = "How many hours did you sleep last night?"
quality_col = "How was your sleep last night?"
player_col = "First name"  # Replace with the column representing players

# Define mappings for ordinal values
sleep_quantity_map = {
    "5 or less": 1,
    "5 - 7": 2,
    "7 - 8": 3,
    "8": 4,
    "8 - 9": 5,
    "9 - 10": 6,
    "More than 10": 7
}

sleep_quality_map = {
    "Horrible - Virtually no sleep": 1,
    "Disrupted": 2,
    "Worse than normal": 3,
    "Normal": 4,
    "Better than normal": 5,
    "Very good": 6,
    "Outstanding": 7
}

# Filter valid rows
valid_rows = data[quantity_col].isin(sleep_quantity_map.keys()) & data[quality_col].isin(sleep_quality_map.keys())
data_cleaned = data.loc[valid_rows].copy()

# Map ordinal values
data_cleaned["Sleep Quantity (Ordinal)"] = data_cleaned[quantity_col].map(sleep_quantity_map)
data_cleaned["Sleep Quality (Ordinal)"] = data_cleaned[quality_col].map(sleep_quality_map)

# Group by player and normalize rankings relative to each player's data
def normalize_group(group, col):
    return (group[col] - group[col].min()) / (group[col].max() - group[col].min())

# Apply ranking and normalization
data_cleaned["Ranked Quantity"] = data_cleaned.groupby(player_col)["Sleep Quantity (Ordinal)"].rank()
data_cleaned["Ranked Quality"] = data_cleaned.groupby(player_col)["Sleep Quality (Ordinal)"].rank()

data_cleaned["Normalized Quantity"] = data_cleaned.groupby(player_col).apply(
    lambda g: normalize_group(g, "Ranked Quantity")
).reset_index(drop=True)

data_cleaned["Normalized Quality"] = data_cleaned.groupby(player_col).apply(
    lambda g: normalize_group(g, "Ranked Quality")
).reset_index(drop=True)

# Select only the relevant columns
columns_to_keep = [
    "First name", 
    "How many hours did you sleep last night?",
    "How was your sleep last night?",
    "Sleep Quantity (Ordinal)",
    "Sleep Quality (Ordinal)",
    "Normalized Quantity",
    "Normalized Quality"
]
reduced_data = data_cleaned[columns_to_keep]

# Save the reduced data
reduced_data.to_csv("cleaned_normalized_sleep_data.csv", index=False)
print("Reduced data with relative normalization saved to 'cleaned_normalized_sleep_data.csv'.")