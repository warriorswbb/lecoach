import pandas as pd
import numpy as np
from scipy import stats

# Read the CSV data
df = pd.read_csv('playerHealthData.csv')

# Same mapping dictionaries
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

def rank_normalize(series):
    """Convert to percentile ranks"""
    ranks = stats.rankdata(series)
    return (ranks - 1) / (len(ranks) - 1)

def analyze_player_sleep(player_data):
    # Map the sleep values
    player_data['sleep_quantity_score'] = player_data['How many hours did you sleep last night?'].map(sleep_quantity_map)
    player_data['sleep_quality_score'] = player_data['How was your sleep last night?'].map(sleep_quality_map)
    
    # Drop rows where either sleep metric is NaN
    valid_data = player_data.dropna(subset=['sleep_quantity_score', 'sleep_quality_score'])
    
    if len(valid_data) < 2:
        return None
    
    try:
        # Perform rank-based normalization for each metric
        valid_data['quantity_normalized'] = rank_normalize(valid_data['sleep_quantity_score'])
        valid_data['quality_normalized'] = rank_normalize(valid_data['sleep_quality_score'])
        
        # Calculate correlation using normalized values
        correlation, p_value = stats.pearsonr(
            valid_data['quantity_normalized'],
            valid_data['quality_normalized']
        )
        
        return {
            'correlation': correlation,
            'p_value': p_value,
            'n_samples': len(valid_data),
            'mean_quantity': valid_data['sleep_quantity_score'].mean(),
            'mean_quality': valid_data['sleep_quality_score'].mean(),
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
print("\nRank-Normalized Sleep Quality-Quantity Correlation Analysis by Player:")
print("\nCorrelation Summary:")
print(summary_df.round(3))

# Calculate overall team statistics
print("\nTeam Statistics:")
print(f"Average correlation: {summary_df['correlation'].mean():.3f}")
print(f"Number of players with significant correlation (p < 0.05): "
      f"{(summary_df['p_value'] < 0.05).sum()}")
print(f"Total invalid/skipped entries across all players: {summary_df['invalid_entries'].sum()}")

# Print detailed analysis for significant correlations
print("\nDetailed Analysis of Significant Correlations (p < 0.05):")
sig_players = summary_df[summary_df['p_value'] < 0.05]
for player in sig_players.index:
    corr = sig_players.loc[player, 'correlation']
    p_val = sig_players.loc[player, 'p_value']
    n = sig_players.loc[player, 'n_samples']
    print(f"\n{player}:")
    print(f"Correlation: {corr:.3f}")
    print(f"P-value: {p_val:.3f}")
    print(f"Sample size: {n}")