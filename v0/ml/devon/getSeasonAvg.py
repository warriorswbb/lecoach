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

def calculate_season_averages(df, variance_scale=1.0):
    season_averages = {}
    
    # Print total number of unique players at start
    total_players = df.groupby(['First name', 'Last name']).ngroups
    print(f"Total unique players in dataset: {total_players}")
    
    # Define default "normal" values for each metric (normalized values)
    default_values = {
        'health': (3 - 1) / (5 - 1),  # "Normal" = 3 on 1-5 scale
        'sleep': (4 - 1) / (7 - 1),   # "8" = 4 on 1-7 scale
        'soreness': (3 - 1) / (6 - 1), # "Normal" = 3 on 1-6 scale
        'mood': (3 - 1) / (6 - 1),     # "Normal" = 3 on 1-6 scale
        'stress': (4 - 1) / (6 - 1)    # "Normal Level" = 4 on 1-6 scale
    }

    # Define default variance (you might want to adjust this value)
    default_variance = 0.01 * variance_scale
    
    for name, player_data in df.groupby(['First name', 'Last name']):
        player_name = f"{name[0]} {name[1]}"
        print(f"\nProcessing player: {player_name}")
        print(f"Number of entries: {len(player_data)}")
        
        try:
            # Map values to numeric scores
            scores = pd.DataFrame()
            scores['health'] = player_data['How many hours did you sleep last night?'].map(general_health_map)
            scores['sleep'] = player_data['Do you feel some muscle soreness?'].map(sleep_quality_map)
            scores['soreness'] = player_data['How is your mood?'].map(soreness_map)
            scores['mood'] = player_data['How would you rate your level of stress? (academic, personal, sport etc.)'].map(mood_map)
            scores['stress'] = player_data['Comments'].map(stress_map)
            
            # Print number of null values in each column
            null_counts = scores.isnull().sum()
            print(f"Null values per category:\n{null_counts}")
            
            averages = {}
            
            # Define the normalization ranges for each metric
            norm_ranges = {
                'health': (1, 5),
                'sleep': (1, 7),
                'soreness': (1, 6),
                'mood': (1, 6),
                'stress': (1, 6)
            }
            
            # Process each metric independently
            for metric, (min_val, max_val) in norm_ranges.items():
                metric_data = scores[metric].dropna()  # Drop nulls only for this metric
                
                if len(metric_data) >= 2:  # Only process if we have at least 2 valid entries
                    # Normalize the data
                    normalized = (metric_data - min_val) / (max_val - min_val)
                    
                    # Calculate and store average and variance
                    averages[f'{metric}_avg'] = round(normalized.mean(), 4)
                    averages[f'{metric}_var'] = round(normalized.var() * variance_scale, 4)
                    print(f"{metric}: processed {len(metric_data)} entries")
                else:
                    # Use default values if not enough data
                    averages[f'{metric}_avg'] = round(default_values[metric], 4)
                    averages[f'{metric}_var'] = round(default_variance, 4)
                    print(f"{metric}: using default normal value (insufficient data)")
            
            # Now we'll always add the player since we have defaults
            season_averages[player_name] = averages
            print(f"Successfully processed {player_name}")
            
        except Exception as e:
            print(f"Error processing {player_name}: {str(e)}")
            continue

    print(f"\nFinal number of players processed: {len(season_averages)}")
    
    # Print in format ready to copy into code
    print("\nSEASON_AVERAGES = {")
    for player, stats in season_averages.items():
        print(f"    '{player}': {{")
        for metric, value in stats.items():
            print(f"        '{metric}': {value},")
        print("    },")
    print("}")

# Example usage with different variance scales
df = pd.read_csv('jan20.csv')
calculate_season_averages(df, variance_scale=0.5)