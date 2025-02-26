# %% [markdown]
# # Basketball Win Probability Model
# 
# This notebook walks through the process of building a win probability model using play-by-play data.
# 
# ## Approach
# 1. Extract play-by-play data from the database
# 2. Process features and create training labels
# 3. Train a logistic regression model
# 4. Evaluate the model
# 5. Calculate play impacts

# %% [Cell 1] - Import libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import brier_score_loss, log_loss, accuracy_score
from sklearn.calibration import calibration_curve
import joblib
import sys
import os

# Add the project root to the path so we can import our database modules
sys.path.append(os.path.abspath('../..'))
from v1.db.db import SessionLocal, engine
from v1.db.models import PlayByPlay, Game, Team

# Configure plot style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)

# %% [markdown]
# ## 1. Data Extraction
# 
# First, we'll extract play-by-play data and game outcomes from our database.

# %% [Cell 2] - Extract data
def extract_play_by_play_data():
    """
    Extract play-by-play data from the database and merge with game outcomes.
    """
    with SessionLocal() as session:
        # Get all games
        games_query = session.query(
            Game.game_id,
            Game.team_one,
            Game.team_two,
            Game.team_one_score,
            Game.team_two_score
        ).all()
        
        games_df = pd.DataFrame(games_query, columns=['game_id', 'team_one', 'team_two', 'team_one_score', 'team_two_score'])
        # Add a column indicating if home team won (1) or away team won (0)
        games_df['home_win'] = (games_df['team_one_score'] > games_df['team_two_score']).astype(int)
        
        # Get all play-by-play data
        pbp_query = session.query(PlayByPlay).all()
        
        # Convert to DataFrame
        pbp_data = []
        for play in pbp_query:
            pbp_data.append({
                'id': play.id,
                'game_id': play.game_id,
                'period': play.period,
                'time_remaining': play.time_remaining,
                'seconds_remaining': play.seconds_remaining,
                'score_margin': play.score_margin,
                'home_score': play.home_score,
                'away_score': play.away_score,
                'is_home_offense': play.is_home_offense,
                'bonus': play.bonus,
                'double_bonus': play.double_bonus,
                'timeouts_remaining_home': play.timeouts_remaining_home,
                'timeouts_remaining_away': play.timeouts_remaining_away,
                'points_last_minute': play.points_last_minute,
                'lead_changes': play.lead_changes,
                'largest_lead': play.largest_lead
            })
        
        pbp_df = pd.DataFrame(pbp_data)
        
        # Merge play-by-play with game outcomes
        merged_df = pd.merge(pbp_df, games_df[['game_id', 'home_win']], on='game_id')
        
        print(f"Extracted {len(merged_df)} plays from {len(games_df)} games")
        
        return merged_df

# Extract the data
pbp_data = extract_play_by_play_data()
pbp_data.head()

# %% [markdown]
# ## 2. Feature Engineering
# 
# Now we'll prepare features for our model. Some features need transformation or interaction terms.

# %% [Cell 3] - Engineer features
def engineer_features(df):
    """
    Create and transform features for the win probability model.
    """
    # Make a copy to avoid modifying the original
    X = df.copy()
    
    # Target variable
    y = X['home_win']
    
    # Transform time remaining - higher impact as game progresses
    # Using log transformation to emphasize late-game situations
    X['time_remaining_transformed'] = np.log1p(X['seconds_remaining'])
    
    # Relative score (normalized by total points to handle different game paces)
    X['total_score'] = X['home_score'] + X['away_score']
    X['score_margin_pct'] = X['score_margin'] / X['total_score'].replace(0, 1)  # Avoid division by zero
    
    # Interaction: Score margin × time remaining
    # Score differences matter more as time decreases
    X['margin_time_interaction'] = X['score_margin'] * (1 / np.log1p(X['seconds_remaining'] + 1))
    
    # Game phase indicators
    X['is_first_half'] = (X['period'] <= 2).astype(int)
    X['is_last_period'] = (X['period'] >= 4).astype(int)
    X['is_last_two_min'] = (X['seconds_remaining'] <= 120).astype(int)
    
    # Possession value (offense opportunity)
    X['home_has_ball'] = X['is_home_offense'].astype(int)
    
    # Momentum indicators
    X['timeout_advantage'] = X['timeouts_remaining_home'] - X['timeouts_remaining_away']
    
    # Select features for the model
    features = [
        'score_margin', 'score_margin_pct', 'time_remaining_transformed',
        'margin_time_interaction', 'is_first_half', 'is_last_period',
        'is_last_two_min', 'home_has_ball', 'timeout_advantage',
        'bonus', 'double_bonus', 'points_last_minute', 'lead_changes'
    ]
    
    return X[features], y

# Engineer features
X, y = engineer_features(pbp_data)

# Display the features
X.head()

# %% [markdown]
# ## 3. Train Test Split
# 
# We'll split our data into training and test sets, making sure to split by games rather than individual plays to avoid data leakage.

# %% [Cell 4] - Split data
def split_by_games(pbp_data, test_size=0.3, random_state=42):
    """
    Split the data by games to avoid data leakage.
    """
    # Get unique game IDs
    game_ids = pbp_data['game_id'].unique()
    
    # Split game IDs into train and test
    train_games, test_games = train_test_split(game_ids, test_size=test_size, random_state=random_state)
    
    # Get train and test indices
    train_indices = pbp_data[pbp_data['game_id'].isin(train_games)].index
    test_indices = pbp_data[pbp_data['game_id'].isin(test_games)].index
    
    return train_indices, test_indices

# Get train/test indices
train_indices, test_indices = split_by_games(pbp_data)

# Split the data
X_train, y_train = X.loc[train_indices], y.loc[train_indices]
X_test, y_test = X.loc[test_indices], y.loc[test_indices]

print(f"Training data: {X_train.shape[0]} plays from {len(pbp_data.loc[train_indices, 'game_id'].unique())} games")
print(f"Testing data: {X_test.shape[0]} plays from {len(pbp_data.loc[test_indices, 'game_id'].unique())} games")

# %% [markdown]
# ## 4. Train the Model
# 
# Now we'll train a logistic regression model.

# %% [Cell 5] - Train model
def train_model(X_train, y_train):
    """
    Train a logistic regression model for win probability.
    """
    # Create and train the model
    model = LogisticRegression(C=1.0, class_weight='balanced', max_iter=1000)
    model.fit(X_train, y_train)
    
    # Display feature importance
    coefficients = pd.DataFrame({
        'Feature': X_train.columns,
        'Coefficient': model.coef_[0]
    }).sort_values('Coefficient', ascending=False)
    
    return model, coefficients

# Train the model
model, coefficients = train_model(X_train, y_train)

# Display feature importance
plt.figure(figsize=(10, 8))
sns.barplot(x='Coefficient', y='Feature', data=coefficients)
plt.title('Feature Importance')
plt.tight_layout()
plt.show()

# Display coefficients
coefficients

# %% [markdown]
# ## 5. Evaluate the Model
# 
# Let's evaluate our model using appropriate metrics for probability predictions.

# %% [Cell 6] - Evaluate model
def evaluate_model(model, X_test, y_test):
    """
    Evaluate the win probability model.
    """
    # Get predictions
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = model.predict(X_test)
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    brier = brier_score_loss(y_test, y_pred_proba)
    log = log_loss(y_test, y_pred_proba)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Brier Score: {brier:.4f} (lower is better)")
    print(f"Log Loss: {log:.4f} (lower is better)")
    
    # Plot calibration curve
    plt.figure(figsize=(10, 8))
    prob_true, prob_pred = calibration_curve(y_test, y_pred_proba, n_bins=10)
    plt.plot(prob_pred, prob_true, marker='o', linewidth=2)
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('Predicted Probability')
    plt.ylabel('True Probability')
    plt.title('Calibration Curve')
    plt.grid(True)
    plt.show()
    
    # Plot win probability over time for a few games
    sample_games = pbp_data.loc[test_indices, 'game_id'].unique()[:3]
    
    plt.figure(figsize=(15, 10))
    for i, game_id in enumerate(sample_games):
        game_data = pbp_data[pbp_data['game_id'] == game_id].sort_values('seconds_remaining', ascending=False)
        game_features = X.loc[game_data.index]
        win_probs = model.predict_proba(game_features)[:, 1]
        
        plt.subplot(len(sample_games), 1, i+1)
        plt.plot(game_data['seconds_remaining'], win_probs)
        plt.axhline(y=0.5, color='r', linestyle='--')
        plt.title(f"Game ID: {game_id} - {'Home Win' if game_data['home_win'].iloc[0] == 1 else 'Away Win'}")
        plt.xlabel('Seconds Remaining')
        plt.ylabel('Home Win Probability')
        plt.grid(True)
    
    plt.tight_layout()
    plt.show()
    
    return y_pred_proba

# Evaluate the model
y_pred_proba = evaluate_model(model, X_test, y_test)

# %% [markdown]
# ## 6. Calculate Play Impact
# 
# Now let's calculate the impact of each play by measuring the change in win probability.

# %% [Cell 7] - Calculate play impact
def calculate_play_impact(model, pbp_data, X):
    """
    Calculate the impact (win probability added) for each play.
    """
    # Get a sample game for demonstration
    sample_game_id = pbp_data['game_id'].iloc[0]
    game_data = pbp_data[pbp_data['game_id'] == sample_game_id].sort_values('seconds_remaining', ascending=False)
    game_features = X.loc[game_data.index]
    
    # Predict win probabilities
    win_probs = model.predict_proba(game_features)[:, 1]
    
    # Add win probability to the game data
    game_data = game_data.copy()
    game_data['win_probability'] = win_probs
    
    # Calculate win probability added (WPA)
    game_data['win_probability_prev'] = game_data['win_probability'].shift(1)
    game_data['wpa'] = game_data['win_probability'] - game_data['win_probability_prev']
    
    # Display the plays with highest impact
    impact_plays = game_data.sort_values('wpa', ascending=False).head(10)
    print(f"Top 10 highest impact plays for game {sample_game_id}:")
    
    for i, (_, play) in enumerate(impact_plays.iterrows(), 1):
        print(f"{i}. WPA: {play['wpa']:.4f}, Period: {play['period']}, Time Remaining: {play['seconds_remaining']} sec")
    
    # Plot win probability with key moments highlighted
    plt.figure(figsize=(12, 6))
    plt.plot(game_data['seconds_remaining'], game_data['win_probability'], 'b-')
    
    # Highlight top 5 impact plays
    top5_impacts = game_data.sort_values('wpa', ascending=False).head(5)
    plt.scatter(top5_impacts['seconds_remaining'], top5_impacts['win_probability'], 
                color='red', s=100, zorder=5)
    
    plt.axhline(y=0.5, color='r', linestyle='--')
    plt.title(f"Win Probability Chart for Game {sample_game_id}")
    plt.xlabel('Seconds Remaining')
    plt.ylabel('Home Win Probability')
    plt.grid(True)
    plt.show()
    
    return game_data

# Calculate play impact
impact_data = calculate_play_impact(model, pbp_data, X)

# %% [markdown]
# ## 7. Save the Model
# 
# Finally, let's save our trained model so we can use it in production.

# %% [Cell 8] - Save model
def save_model(model, filename='win_probability_model.joblib'):
    """
    Save the trained model to disk.
    """
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Save the model
    model_path = os.path.join('models', filename)
    joblib.dump(model, model_path)
    
    print(f"Model saved to {model_path}")
    
    # Save feature list
    feature_path = os.path.join('models', 'feature_list.joblib')
    joblib.dump(list(X.columns), feature_path)
    
    print(f"Feature list saved to {feature_path}")

# Save the model
save_model(model)

# %% [markdown]
# ## 8. Using the Model in Production
# 
# Here's an example of how to use the saved model to calculate win probability for new plays.

# %% [Cell 9] - Use model in production
def load_model(filename='win_probability_model.joblib'):
    """
    Load the trained model from disk.
    """
    model_path = os.path.join('models', filename)
    feature_path = os.path.join('models', 'feature_list.joblib')
    
    model = joblib.load(model_path)
    features = joblib.load(feature_path)
    
    return model, features

def predict_win_probability(model, features, game_state):
    """
    Predict win probability for a given game state.
    """
    # Create feature vector
    feature_vector = {}
    
    # Basic features
    feature_vector['score_margin'] = game_state['score_margin']
    feature_vector['time_remaining_transformed'] = np.log1p(game_state['seconds_remaining'])
    
    # Derived features
    total_score = game_state['home_score'] + game_state['away_score']
    feature_vector['score_margin_pct'] = game_state['score_margin'] / max(total_score, 1)
    feature_vector['margin_time_interaction'] = game_state['score_margin'] * (1 / np.log1p(game_state['seconds_remaining'] + 1))
    
    # Game phase
    feature_vector['is_first_half'] = 1 if game_state['period'] <= 2 else 0
    feature_vector['is_last_period'] = 1 if game_state['period'] >= 4 else 0
    feature_vector['is_last_two_min'] = 1 if game_state['seconds_remaining'] <= 120 else 0
    
    # Other features
    feature_vector['home_has_ball'] = 1 if game_state['is_home_offense'] else 0
    feature_vector['timeout_advantage'] = game_state['timeouts_remaining_home'] - game_state['timeouts_remaining_away']
    feature_vector['bonus'] = 1 if game_state['bonus'] else 0
    feature_vector['double_bonus'] = 1 if game_state['double_bonus'] else 0
    feature_vector['points_last_minute'] = game_state['points_last_minute']
    feature_vector['lead_changes'] = game_state['lead_changes']
    
    # Create DataFrame with the right features in the right order
    feature_df = pd.DataFrame([{f: feature_vector.get(f, 0) for f in features}])
    
    # Predict probability
    win_prob = model.predict_proba(feature_df)[0, 1]
    
    return win_prob

# Example usage
model, features = load_model()

# Example game state
game_state = {
    'score_margin': 5,            # Home team up by 5
    'home_score': 70,
    'away_score': 65,
    'seconds_remaining': 300,      # 5 minutes left
    'period': 4,                  # 4th quarter
    'is_home_offense': True,      # Home team has the ball
    'bonus': True,                # Team in bonus
    'double_bonus': False,
    'timeouts_remaining_home': 2,
    'timeouts_remaining_away': 1,
    'points_last_minute': 6,
    'lead_changes': 8
}

win_prob = predict_win_probability(model, features, game_state)
print(f"Home team win probability: {win_prob:.4f} ({win_prob*100:.1f}%)")

# %% [markdown]
# ## 9. Conclusion
# 
# This notebook has demonstrated the complete process of building a win probability model using play-by-play data. The key steps were:
# 
# 1. Data extraction from the database
# 2. Feature engineering to create predictive variables
# 3. Splitting data by games to prevent data leakage
# 4. Training a logistic regression model
# 5. Evaluating the model with appropriate metrics
# 6. Calculating play impact based on win probability changes
# 7. Saving and loading the model for production use
# 
# This model can now be integrated into your application to provide real-time win probability estimates and highlight high-impact plays. 