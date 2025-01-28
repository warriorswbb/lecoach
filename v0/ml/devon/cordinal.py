import pandas as pd
import numpy as np
from statsmodels.miscmodels.ordinal_model import OrderedModel

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

def analyze_player_sleep(player_data):
    # Map the sleep values
    player_data['sleep_quantity_score'] = player_data['How many hours did you sleep last night?'].map(sleep_quantity_map)
    player_data['sleep_quality_score'] = player_data['How was your sleep last night?'].map(sleep_quality_map)
    
    # Drop rows where either sleep metric is NaN
    valid_data = player_data.dropna(subset=['sleep_quantity_score', 'sleep_quality_score'])
    
    if len(valid_data) < 10:  # Need reasonable sample size for ordinal regression
        return None
    
    try:
        # Fit ordinal regression model
        model = OrderedModel(valid_data['sleep_quality_score'], 
                           valid_data[['sleep_quantity_score']], 
                           distr='logit')
        
        results = model.fit(method='bfgs', maxiter=100)
        
        return {
            'coef': results.params['sleep_quantity_score'],
            'pvalue': results.pvalues['sleep_quantity_score'],
            'pseudo_r2': results.prsquared,
            'n_samples': len(valid_data),
            'std_err': results.bse['sleep_quantity_score'],
            'conf_int': results.conf_int().loc['sleep_quantity_score'],
            'invalid_entries': len(player_data) - len(valid_data)
        }
    except Exception as e:
        print(f"Error analyzing player {player_data['First name'].iloc[0]} {player_data['Last name'].iloc[0]}: {str(e)}")
        return None

# Analyze each player
results = {}
for name, player_data in df.groupby(['First name', 'Last name']):
    player_name = f"{name[0]} {name[1]}"
    analysis = analyze_player_sleep(player_data)
    if analysis is not None:
        results[player_name] = analysis

# Create summary dataframe
summary_df = pd.DataFrame.from_dict(results, orient='index')
summary_df = summary_df.sort_values('coef', ascending=False)

# Print results
print("\nOrdinal Regression Analysis by Player:")
print("\nResults Summary:")
pd.set_option('display.float_format', lambda x: '%.3f' % x)
print(summary_df)

# Print interpretation for each player
print("\nDetailed Interpretation:")
for player in summary_df.index:
    coef = summary_df.loc[player, 'coef']
    p_val = summary_df.loc[player, 'pvalue']
    ci_lower, ci_upper = summary_df.loc[player, 'conf_int']
    
    print(f"\n{player}:")
    print(f"Coefficient: {coef:.3f}")
    print(f"95% CI: ({ci_lower:.3f}, {ci_upper:.3f})")
    print(f"P-value: {p_val:.3f}")
    if p_val < 0.05:
        print("Significant relationship found")
        if coef > 0:
            print("More sleep is associated with better sleep quality")
        else:
            print("More sleep is associated with worse sleep quality")
    else:
        print("No significant relationship found")

# Calculate team-level statistics
print("\nTeam Statistics:")
print(f"Number of players with significant relationship (p < 0.05): {(summary_df['pvalue'] < 0.05).sum()}")
print(f"Average pseudo R-squared: {summary_df['pseudo_r2'].mean():.3f}")