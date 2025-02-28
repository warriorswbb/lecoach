import json
from lambda_function import lambda_handler

def test_api_gateway_format():
    # This mimics how API Gateway would format the request
    api_gateway_event = {
        "body": json.dumps({
            "game_state": {
                "score_margin": 2,
                "home_score": 80,
                "away_score": 78,
                "time_remaining": 100,
                "period": 4,
                "is_home_offense": False,
                "bonus": True,
                "double_bonus": True,
                "timeouts_remaining_home": 1,
                "timeouts_remaining_away": 2,
                "points_last_minute": 10,
                "lead_changes": 15
            }
        }),
        "resource": "/win-probability",
        "path": "/win-probability",
        "httpMethod": "POST",
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
    # Call the lambda handler with API Gateway format
    response = lambda_handler(api_gateway_event, None)
    
    # Print the result
    print("API Gateway test response:")
    print(json.dumps(response, indent=2))
    
    if response.get('statusCode') == 200:
        body = json.loads(response['body'])
        print(f"\nWin probability via API Gateway: {body['win_probability']:.4f} ({body['win_probability_percentage']}%)")
        print("✅ API Gateway test passed!")
    else:
        print(f"❌ API Gateway test failed with status: {response.get('statusCode')}")

if __name__ == "__main__":
    test_api_gateway_format() 