Starting point: Since you don't have pregame odds, starting at 50/50 is reasonable. Over time, you could develop a pregame model based on team strength metrics, but 50/50 works as a starting point.
End state: Correct, at the end of the game, the probability will be 100/0 depending on who won.
Training approach: You'll want to use your play-by-play data to train a model that predicts the probability of winning at any given game state.

Here's how I'd approach it:
Data preparation:

For each play in your dataset, create a set of features representing the game state at that moment (score differential, time remaining, possession, etc.)
Label each play with the final outcome (whether the home team won or lost)

Model building:

Use logistic regression (as mentioned in your design doc) to predict win probability
For each play, the model will output a probability from 0-1
To get the "impact" of a play, you'd calculate the difference between the win probability before and after the play

Key features to consider:

Score differential
Time remaining in game
Quarter/period
Possession
Bonus situation
Timeouts remaining
Team strength indicators (if available)
Recent momentum (runs, etc.)

Implementation process:

Extract all these features from your PlayByPlay table
Split your 5k games into training and validation sets
Train your logistic regression model
Evaluate the model on your validation set
Deploy the model to calculate win probabilities for each play in real-time

For the "impact" calculation, you'd store the win probability after each play, then calculate the difference when a new play occurs. That delta is your win probability added/lost metric.


Accuracy: 81.6%
Brier Score: 0.1235 (lower is better, with 0.25 representing random guessing)
Log Loss: 0.3805 (measures probability calibration)