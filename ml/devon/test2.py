import pandas as pd

# Read the CSV data
df = pd.read_csv('playerHealthData.csv')

# Get unique values and their counts
unique_values = df['How was your sleep last night?'].value_counts()

print("Unique values in 'How was your sleep last night?' column:")
print("\nValue counts:")
for value, count in unique_values.items():
    print(f"{value}: {count}")