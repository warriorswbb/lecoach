import pandas as pd

# Read the CSV data
df = pd.read_csv('playerHealthData.csv')

# Columns to analyze
columns = [
    'How is your general health?',
    'How was your sleep last night?',
    'How many hours did you sleep last night?',
    'Do you feel some muscle soreness?',
    'How is your mood?',
    'How would you rate your level of stress? (academic, personal, sport etc.)'
]

# Print value counts for each column
for column in columns:
    print(f"\nUnique values in '{column}':")
    print("\nValue counts:")
    value_counts = df[column].value_counts()
    for value, count in value_counts.items():
        print(f"{value}: {count}")
    print("-" * 80)