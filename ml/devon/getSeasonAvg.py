import pandas as pd

# Keep the mapping dictionaries the same
# Original mapping dictionaries remain the same
general_health_map = {
    "Excellent": 5,
    "Very Good": 4,
    "Normal": 3,
    "Slightly Unwell": 2,
    "Moderately Unwell": 1
}

sleep_quality_map = {
    "More than 10": 7,
    "9 - 10": 6,
    "8 - 9": 5,
    "8": 4,
    "7 - 8": 3,
    "5 - 7": 2,
    "5 or less": 1
}

soreness_map = {
    "Very sore/tight": 1,
    "Worse than normal": 2,
    "Normal": 3,
    "Very little soreness": 4,
    "Better than normal": 5,
    "No soreness": 6
}

mood_map = {
    "Feeling great - very relaxed": 6,
    "Feeling good - relaxed": 5,
    "Better than normal": 4,
    "Normal": 3,
    "Worse than normal": 2,
    "Very stressed": 1
}

stress_map = {
    "Very Stressed": 1,
    "Noticeably Stressed": 2,
    "3 Somewhat Stressed": 3,
    "Normal Level": 4,
    "Minimal Stress": 5,
    "0 Zero Stress": 6
}

def calculate_season_averages(df, variance_scale=1.0):  # Add variance scale parameter
    season_averages = {}
    
    for name, player_data in df.groupby(['First name', 'Last name']):
        player_name = f"{name[0]} {name[1]}"
        
        # Map values to numeric scores
        scores = pd.DataFrame()
        scores['health'] = player_data['How many hours did you sleep last night?'].map(general_health_map)
        scores['sleep'] = player_data['Do you feel some muscle soreness?'].map(sleep_quality_map)
        scores['soreness'] = player_data['How is your mood?'].map(soreness_map)
        scores['mood'] = player_data['How would you rate your level of stress? (academic, personal, sport etc.)'].map(mood_map)
        scores['stress'] = player_data['Comments'].map(stress_map)
        
        # Drop rows with any missing values
        scores = scores.dropna()
        
        if len(scores) < 2:
            continue
            
        # Normalize each category
        normalized = pd.DataFrame()
        normalized['health'] = (scores['health'] - 1) / (5 - 1)
        normalized['sleep'] = (scores['sleep'] - 1) / (7 - 1)
        normalized['soreness'] = (scores['soreness'] - 1) / (6 - 1)
        normalized['mood'] = (scores['mood'] - 1) / (6 - 1)
        normalized['stress'] = (scores['stress'] - 1) / (6 - 1)
        
        # Calculate averages and scaled variances
        averages = {
            'health_avg': round(normalized['health'].mean(), 4),
            'sleep_avg': round(normalized['sleep'].mean(), 4),
            'soreness_avg': round(normalized['soreness'].mean(), 4),
            'mood_avg': round(normalized['mood'].mean(), 4),
            'stress_avg': round(normalized['stress'].mean(), 4),
            # Add scaled variances
            'health_var': round(normalized['health'].var() * variance_scale, 4),
            'sleep_var': round(normalized['sleep'].var() * variance_scale, 4),
            'soreness_var': round(normalized['soreness'].var() * variance_scale, 4),
            'mood_var': round(normalized['mood'].var() * variance_scale, 4),
            'stress_var': round(normalized['stress'].var() * variance_scale, 4)
        }
        
        season_averages[player_name] = averages
    
    # Print in format ready to copy into code
    print("SEASON_AVERAGES = {")
    for player, stats in season_averages.items():
        print(f"    '{player}': {{")
        for metric, value in stats.items():
            print(f"        '{metric}': {value},")
        print("    },")
    print("}")

# Example usage with different variance scales
df = pd.read_csv('jan20.csv')
calculate_season_averages(df, variance_scale=0.5)