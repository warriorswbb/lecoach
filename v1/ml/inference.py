import os
import json
import joblib
import numpy as np

# Load model artifacts
def model_fn(model_dir):
    model_path = os.path.join(model_dir, 'models/win_probability_model.joblib')
    feature_path = os.path.join(model_dir, 'models/feature_list.joblib')
    
    model = joblib.load(model_path)
    features = joblib.load(feature_path)
    
    return {"model": model, "features": features}

# Process incoming request
def input_fn(request_body, request_content_type):
    if request_content_type == 'application/json':
        game_state = json.loads(request_body)['game_state']
        return game_state
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")

# Transform features
def predict_fn(game_state, model_data):
    model = model_data["model"]
    features = model_data["features"]
    
    # Create feature vector
    feature_vector = {}
    
    # Calculate total time remaining
    seconds_per_period = 600
    total_periods = 4
    
    # Check if we're in overtime
    is_overtime = game_state['period'] > total_periods
    
    # Calculate total seconds remaining
    if is_overtime:
        total_seconds_remaining = game_state['time_remaining'] / 10
    else:
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

# Return prediction
def output_fn(prediction, response_content_type):
    response = {
        'win_probability': prediction,
        'win_probability_percentage': round(prediction * 100, 1)
    }
    return json.dumps(response) 