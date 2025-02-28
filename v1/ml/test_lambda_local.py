import json
from lambda_function import lambda_handler

def test_lambda_function():
    # Create a sample game state (similar to what your API will send)
    test_event = {
        "game_state": {
            "score_margin": 5,
            "home_score": 70,
            "away_score": 65,
            "time_remaining": 300,
            "period": 4,
            "is_home_offense": True,
            "bonus": True,
            "double_bonus": False,
            "timeouts_remaining_home": 2,
            "timeouts_remaining_away": 1,
            "points_last_minute": 6,
            "lead_changes": 8
        }
    }
    
    # Call the lambda handler directly
    response = lambda_handler(test_event, None)
    
    # Print the result
    print("Lambda function response:")
    print(json.dumps(response, indent=2))
    
    # Check if we got a valid response
    if response.get('statusCode') == 200:
        body = json.loads(response['body'])
        print(f"\nWin probability: {body['win_probability']:.4f} ({body['win_probability_percentage']}%)")
        print("✅ Test passed!")
    else:
        print(f"❌ Test failed with status: {response.get('statusCode')}")
        if 'body' in response:
            print(f"Error: {response['body']}")

if __name__ == "__main__":
    test_lambda_function() 