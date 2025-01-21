import pandas as pd
import numpy as np
from scipy import stats

# Maps remain the same as before
general_health_map = {
    "Exhausted - major fatigue": 1,
    "Very fatigued": 2,
    "Worse than normal": 3,
    "Normal": 4,
    "Minimal fatigue": 5,
    "Better than normal": 6,
    "No fatigue": 7
}

sleep_quality_map = {
    "Moderately Unwell": 1,
    "Slightly Unwell": 2,
    "Normal": 3,
    "Very Good": 4,
    "Excellent": 5
}

soreness_map = {
    "Horrible - Virtually no sleep": 1,
    "Disrupted": 2,
    "Worse than normal": 3,
    "Normal": 4,
    "Better than normal": 5,
    "Very good": 6,
    "Outstanding": 7
}

mood_map = {
    "Extremely sore/tight": 1,
    "Very sore/tight": 2,
    "Worse than normal": 3,
    "Normal": 4,
    "Very little soreness": 5,
    "Better than normal": 6,
    "No soreness": 7
}

stress_map = {
    "Very stressed": 1,
    "Worse than normal": 2,
    "Normal": 3,
    "Better than normal": 4,
    "Feeling good - relaxed": 5,
    "Feeling great - very relaxed": 6
}

def calculate_player_health_score(player_data):
    try:
        # Map values to numeric scores
        scores = pd.DataFrame()
        scores['health'] = player_data['How is your general health?'].map(general_health_map)
        scores['sleep'] = player_data['How was your sleep last night?'].map(sleep_quality_map)
        scores['soreness'] = player_data['Do you feel some muscle soreness?'].map(soreness_map)
        scores['mood'] = player_data['How is your mood?'].map(mood_map)
        scores['stress'] = player_data['How would you rate your level of stress? (academic, personal, sport etc.)'].map(stress_map)
        
        # Drop rows with any missing values
        scores = scores.dropna()
        
        if len(scores) < 2:
            return None
            
        # Normalize each category relative to its possible range
        normalized = pd.DataFrame()
        normalized['health'] = (scores['health'] - 1) / (7 - 1)  # Range 1-7
        normalized['sleep'] = (scores['sleep'] - 1) / (5 - 1)    # Range 1-5
        normalized['soreness'] = (scores['soreness'] - 1) / (7 - 1)  # Range 1-7
        normalized['mood'] = (scores['mood'] - 1) / (7 - 1)      # Range 1-7
        normalized['stress'] = (scores['stress'] - 1) / (6 - 1)  # Range 1-6
        
        # Calculate final score (20% each)
        final_score = (
            normalized['health'] * 0.2 +
            normalized['sleep'] * 0.2 +
            normalized['soreness'] * 0.2 +
            normalized['mood'] * 0.2 +
            normalized['stress'] * 0.2
        )
        
        return {
            'avg_score': final_score.mean(),
            'min_score': final_score.min(),
            'max_score': final_score.max(),
            'std_score': final_score.std(),
            'n_samples': len(scores),
            'invalid_entries': len(player_data) - len(scores),
            'health_avg': normalized['health'].mean(),
            'sleep_avg': normalized['sleep'].mean(),
            'soreness_avg': normalized['soreness'].mean(),
            'mood_avg': normalized['mood'].mean(),
            'stress_avg': normalized['stress'].mean(),
            # Add some additional stats
            'recent_trend': final_score.tail(5).mean() - final_score.head(5).mean(),  # Positive means improving
            'consistency': final_score.std(),  # Lower means more consistent
            # Store raw scores for reference
            'raw_health_avg': scores['health'].mean(),
            'raw_sleep_avg': scores['sleep'].mean(),
            'raw_soreness_avg': scores['soreness'].mean(),
            'raw_mood_avg': scores['mood'].mean(),
            'raw_stress_avg': scores['stress'].mean()
        }
        
    except Exception as e:
        print(f"Error processing player: {str(e)}")
        return None

# Read the CSV data
df = pd.read_csv('playerHealthData.csv')

# Calculate scores for each player
results = {}
for name, player_data in df.groupby(['First name', 'Last name']):
    player_name = f"{name[0]} {name[1]}"
    analysis = calculate_player_health_score(player_data)
    if analysis is not None:
        results[player_name] = analysis

# Create summary dataframe
summary_df = pd.DataFrame.from_dict(results, orient='index')

# Sort by average score
summary_df = summary_df.sort_values('avg_score', ascending=False)

# Print results
print("\nPlayer Health Score Analysis:")
print("\nOverall Scores (0-1 scale, higher is better):")
print(summary_df[['avg_score', 'min_score', 'max_score', 'std_score', 'n_samples', 'recent_trend', 'consistency']].round(3))

print("\nDetailed Component Analysis:")
for player in summary_df.index:
    print(f"\n{player}:")
    print(f"Overall Score: {summary_df.loc[player, 'avg_score']:.3f}")
    print("Component Scores (0-1 scale):")
    print(f"Health: {summary_df.loc[player, 'health_avg']:.3f}")
    print(f"Sleep: {summary_df.loc[player, 'sleep_avg']:.3f}")
    print(f"Soreness: {summary_df.loc[player, 'soreness_avg']:.3f}")
    print(f"Mood: {summary_df.loc[player, 'mood_avg']:.3f}")
    print(f"Stress: {summary_df.loc[player, 'stress_avg']:.3f}")
    print(f"Recent Trend: {summary_df.loc[player, 'recent_trend']:.3f}")
    print(f"Based on {summary_df.loc[player, 'n_samples']} valid entries")

# Calculate team averages for each component
print("\nTeam Averages:")
components = ['health_avg', 'sleep_avg', 'soreness_avg', 'mood_avg', 'stress_avg']
for component in components:
    print(f"{component}: {summary_df[component].mean():.3f}")