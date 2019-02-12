
# coding: utf-8

# Imports
import pandas as pd
import csv

# Initialize list of ordered dicts that csv.DictReader will populate
data_od_list = []

# Define year
datecsv = '11' #'16'

# Open and read csv into data_od_list
with open('tract' + datecsv + '_data.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        data_od_list.append(row)

# Convert csv list to pandas dataframe
df = pd.DataFrame.from_dict(data_od_list)

# Function to ensure tract GEOID is 11 digits by appending lead zero
def make_11(s):
    if len(s) < 11:
        s = '0' + s
    return s

# Apply make_11() to tract column
df['tract'] = df['tract'].astype(str).apply(lambda x: make_11(x))

# For each state, write tract data to csv
for stateId in df['tract'].astype(str).str[:2].unique():
    df.loc[ df['tract'].astype(str).str[:2] == stateId ].to_csv('tract' + datecsv + '_data_' + stateId + '.csv', index=False)
