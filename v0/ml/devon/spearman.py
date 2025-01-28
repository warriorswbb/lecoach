import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler

# Read the CSV data
df = pd.read_csv('playerHealthData.csv')

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
    "Moderately Unwell": 1,
    "Slightly Unwell": 2,
    "Normal": 3,
    "Very Good": 4,
    "Excellent": 5
}

# Function to safely map values
def safe_map(value, mapping):
    try:
        return mapping.get(value, np.nan)
    except:
        return np.nan

# Function to perform analysis for each player
def analyze_player_sleep(player_data):
    # Safely map the sleep values
    player_data['sleep_quantity_score'] = player_data['How many hours did you sleep last night?'].apply(
        lambda x: safe_map(x, sleep_quantity_map)
    )
    player_data['sleep_quality_score'] = player_data['How was your sleep last night?'].apply(
        lambda x: safe_map(x, sleep_quality_map)
    )
    
    # Drop rows where either sleep metric is NaN
    valid_data = player_data.dropna(subset=['sleep_quantity_score', 'sleep_quality_score'])
    
    # Need at least 2 points for correlation
    if len(valid_data) < 2:
        print(f"Insufficient data for player {player_data['First name'].iloc[0]} {player_data['Last name'].iloc[0]}")
        return None
    
    try:
        # Calculate Spearman correlation
        correlation, p_value = stats.spearmanr(
            valid_data['sleep_quantity_score'], 
            valid_data['sleep_quality_score']
        )
        
        # Calculate mean values
        mean_quantity = valid_data['sleep_quantity_score'].mean()
        mean_quality = valid_data['sleep_quality_score'].mean()
        
        return {
            'correlation': correlation,
            'p_value': p_value,
            'n_samples': len(valid_data),
            'mean_quantity': mean_quantity,
            'mean_quality': mean_quality,
            'invalid_entries': len(player_data) - len(valid_data)
        }
    except Exception as e:
        print(f"Error analyzing player {player_data['First name'].iloc[0]} {player_data['Last name'].iloc[0]}: {str(e)}")
        return None

# Group by player and analyze
results = {}
for name, player_data in df.groupby(['First name', 'Last name']):
    player_name = f"{name[0]} {name[1]}"
    analysis = analyze_player_sleep(player_data)
    if analysis is not None:
        results[player_name] = analysis

# Create a summary dataframe
summary_df = pd.DataFrame.from_dict(results, orient='index')
summary_df = summary_df.sort_values('correlation', ascending=False)

# Print results
print("\nSleep Quality-Quantity Correlation Analysis by Player:")
print("\nCorrelation Summary:")
print(summary_df.round(3))

# Calculate overall team statistics
print("\nTeam Statistics:")
print(f"Average correlation: {summary_df['correlation'].mean():.3f}")
print(f"Number of players with significant correlation (p < 0.05): "
      f"{(summary_df['p_value'] < 0.05).sum()}")
print(f"Total invalid/skipped entries across all players: {summary_df['invalid_entries'].sum()}")

# Create visualization of correlations
plt.figure(figsize=(12, 6))
plt.bar(summary_df.index, summary_df['correlation'])
plt.xticks(rotation=45, ha='right')
plt.title('Sleep Quality-Quantity Correlation by Player')
plt.ylabel('Spearman Correlation Coefficient')
plt.tight_layout()
plt.savefig('sleep_correlations.png')

# Create a scatter plot for the player with the highest correlation
if len(summary_df) > 0:  # Check if we have any results
    highest_corr_player = summary_df.index[0]
    player_data = df[df['First name'] + ' ' + df['Last name'] == highest_corr_player].copy()
    
    # Safely map values
    player_data['sleep_quantity_score'] = player_data['How many hours did you sleep last night?'].apply(
        lambda x: safe_map(x, sleep_quantity_map)
    )
    player_data['sleep_quality_score'] = player_data['How was your sleep last night?'].apply(
        lambda x: safe_map(x, sleep_quality_map)
    )
    
    # Drop invalid entries
    player_data = player_data.dropna(subset=['sleep_quantity_score', 'sleep_quality_score'])
    
    if len(player_data) > 0:
        plt.figure(figsize=(8, 6))
        plt.scatter(player_data['sleep_quantity_score'], player_data['sleep_quality_score'])
        plt.title(f'Sleep Quality vs Quantity for {highest_corr_player}')
        plt.xlabel('Sleep Quantity Score')
        plt.ylabel('Sleep Quality Score')
        plt.savefig('highest_correlation_scatter.png')