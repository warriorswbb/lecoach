import pandas as pd
import statsmodels.api as sm
from statsmodels.miscmodels.ordinal_model import OrderedModel

# Load your dataset
data = pd.read_csv('playerHealthData.csv')

# Define the mapping for Sleep Quantity
sleep_quantity_map = {
    "5 or less": 1,
    "5 - 7": 2,
    "7 - 8": 3,
    "8": 4,
    "8 - 9": 5,
    "9 - 10": 6,
    "More than 10": 7
}

# Define the mapping for Sleep Quality
sleep_quality_map = {
    "Horrible - Virtually no sleep": 1,
    "Disrupted": 2,
    "Worse than normal": 3,
    "Normal": 4,
    "Better than normal": 5,
    "Very good": 6,
    "Outstanding": 7
}

# Map the Sleep Quantity and Sleep Quality columns to ordinal values
data['Sleep_Quantity_Ordinal'] = data['How many hours did you sleep last night?'].map(sleep_quantity_map)
data['Sleep_Quality_Ordinal'] = data['How was your sleep last night?'].map(sleep_quality_map)

# Check mappings and drop NaN rows
print(data[['Sleep_Quantity_Ordinal', 'Sleep_Quality_Ordinal']].head())  # Debug mappings
data = data.dropna(subset=['Sleep_Quantity_Ordinal', 'Sleep_Quality_Ordinal'])

# Ensure data isn't empty after preprocessing
print(f"Data shape after preprocessing: {data.shape}")
if data.empty:
    raise ValueError("No data available for regression after preprocessing. Check your mappings or input data.")

# Independent variable: Sleep Quantity (Ordinal)
X = data[['Sleep_Quantity_Ordinal']]
X = sm.add_constant(X)  # Add intercept

# Ensure X is not empty
print(f"Independent variable shape: {X.shape}")
print(X.head())  # Debug independent variable

# Dependent variable: Sleep Quality (Ordinal)
y = data['Sleep_Quality_Ordinal']

# Fit the ordinal logistic regression model
model = OrderedModel(y, X, distr='logit')  # You can use 'probit' instead of 'logit'
result = model.fit(method='bfgs')

# Print the regression results
print(result.summary())
