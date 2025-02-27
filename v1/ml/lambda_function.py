import json
import os
import joblib
import numpy as np
import base64

# Load model on cold start (only happens occasionally)
model_path = os.path.join(os.path.dirname(__file__), 'models/win_probability_model.joblib')
feature_path = os.path.join(os.path.dirname(__file__), 'models/feature_list.joblib')

model = joblib.load(model_path)
features = joblib.load(feature_path)

def predict_win_probability(game_state):
    """
    Predict win probability based on game state
    """
    # Create feature vector
    feature_vector = {}
    
    # Calculate total time remaining
    seconds_per_period = 600  # 10 minutes per period
    total_periods = 4  # Regular game has 4 periods
    
    # Check if we're in overtime
    is_overtime = game_state['period'] > total_periods
    
    # Calculate total seconds remaining properly - using time_remaining/10 to match original model
    if is_overtime:
        # For overtime: just the time remaining in current period
        total_seconds_remaining = game_state['time_remaining'] / 10
    else:
        # For regulation: regular calculation
        total_seconds_remaining = ((total_periods - game_state['period']) * seconds_per_period) + \
                                 (game_state['time_remaining'] / 10)
    
    # Basic features
    feature_vector['score_margin'] = game_state['score_margin']
    feature_vector['time_remaining_transformed'] = np.log1p(total_seconds_remaining)
    
    # Game completion percentage
    total_game_seconds = total_periods * seconds_per_period
    if is_overtime:
        feature_vector['game_completion_pct'] = 1.0 + ((game_state['period'] - total_periods) / 10)
    else:
        feature_vector['game_completion_pct'] = 1 - (total_seconds_remaining / total_game_seconds)
    
    # Derived features
    total_score = game_state['home_score'] + game_state['away_score']
    feature_vector['score_margin_pct'] = game_state['score_margin'] / max(total_score, 1)
    feature_vector['margin_time_interaction'] = game_state['score_margin'] * (1 / np.log1p(total_seconds_remaining + 1))
    
    # Game phase
    feature_vector['is_first_half'] = 1 if game_state['period'] <= 2 else 0
    feature_vector['is_last_period'] = 1 if game_state['period'] >= 4 else 0
    feature_vector['is_overtime'] = 1 if is_overtime else 0
    feature_vector['is_last_two_min'] = 1 if total_seconds_remaining <= 120 else 0
    
    # Other features
    feature_vector['home_has_ball'] = 1 if game_state['is_home_offense'] else 0
    feature_vector['timeout_advantage'] = game_state['timeouts_remaining_home'] - game_state['timeouts_remaining_away']
    feature_vector['bonus'] = 1 if game_state['bonus'] else 0
    feature_vector['double_bonus'] = 1 if game_state['double_bonus'] else 0
    feature_vector['points_last_minute'] = game_state['points_last_minute']
    feature_vector['lead_changes'] = game_state['lead_changes']
    
    # Create feature dataframe with correct order
    import pandas as pd
    feature_df = pd.DataFrame([{f: feature_vector.get(f, 0) for f in features}])
    
    # Predict probability
    win_prob = float(model.predict_proba(feature_df)[0, 1])
    
    return win_prob

def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    try:
        # Parse the game state from the request
        if 'body' in event:
            # Handle API Gateway format
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
            game_state = body['game_state']
        else:
            # Direct invocation
            game_state = event['game_state']
        
        # Calculate win probability
        win_prob = predict_win_probability(game_state)
        
        # Return the result
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Enable CORS for browser access
            },
            'body': json.dumps({
                'win_probability': win_prob,
                'win_probability_percentage': round(win_prob * 100, 1)
            })
        }
    except Exception as e:
        # Log error and return error response
        print(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        } 