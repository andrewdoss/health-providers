'''
Run this script from the command line.
The first argument after the script is the filename to read data from.
The second argument after the script is the geography level to process -
the options are "tract" and "county".
This script assumes that the first column of the input file is a geoid and
that the last column is the response (provider density).
'''

import sys
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import Ridge

# Define list of states for loop
state2fips = {'AL': 1,
              'AK': 2,
              'AZ': 4,
              'AR': 5,
              'CA': 6,
              'CO': 8,
              'CT': 9,
              'DE': 10,
              'DC': 11,
              'FL': 12,
              'GA': 13,
              'HI': 15,
              'ID': 16,
              'IL': 17,
              'IN': 18,
              'IA': 19,
              'KS': 20,
              'KY': 21,
              'LA': 22,
              'ME': 23,
              'MD': 24,
              'MA': 25,
              'MI': 26,
              'MN': 27,
              'MS': 28,
              'MO': 29,
              'MT': 30,
              'NE': 31,
              'NV': 32,
              'NH': 33,
              'NJ': 34,
              'NM': 35,
              'NY': 36,
              'NC': 37,
              'ND': 38,
              'OH': 39,
              'OK': 40,
              'OR': 41,
              'PA': 42,
              'RI': 44,
              'SC': 45,
              'SD': 46,
              'TN': 47,
              'TX': 48,
              'UT': 49,
              'VT': 50,
              'VA': 51,
              'WA': 53,
              'WV': 54,
              'WI': 55,
              'WY': 56}

def feature_percentiles(x):
    '''Returns percentile of each feature for each instance in x, an np array
    of feature data.
    Citation: https://stackoverflow.com/questions/44607537/convert-array-into-percentiles
    '''
    xp = np.zeros(x.shape)
    # Loop over columns, computing percentiles and storing in xp
    for j in np.arange(x.shape[1]):
        xt = x[:,j]
        low_ptile = np.array([len(np.where(xt<=i)[0])/len(xt)*100 for i in xt])
        high_ptile = np.array([100 - len(np.where(xt>=i)[0])/len(xt)*100 for i in xt])
        xp[:,j] = (low_ptile + high_ptile) / 2
    return xp

# Read in command line arguments.
file = sys.argv[1]
geo = sys.argv[2]
if geo == 'county':
    level = 1000
elif geo == 'tract':
    level = 1000000000

# Load data
df = pd.read_csv(file, encoding='latin')

# First process feature percentiles and predictive power for all geographies
# relative to the entire US.
df_us = df.copy()

# Drop rows with missing data
df_us.dropna(inplace=True)

# Convert features, response, and log(response) to numpy arrays
x = df_us.iloc[:,1:-1].values
y = df_us.iloc[:,-1].values
logy = np.log(df_us.iloc[:,-1].values + 1)

# Standardize and run PCA on the feature data
sc = StandardScaler()
std_x = sc.fit_transform(x)
pca = PCA()
pca_x = pca.fit_transform(std_x)

# Compute percentile rankings for pca-space features
xp = feature_percentiles(pca_x)

# Run gridsearch on ridge regression to find optimal hp's
gs = GridSearchCV(Ridge(),
                  {'alpha': [0.1, 0.3, 0.6, 1, 3, 6.0, 10, 30, 60, 100]},
                  n_jobs=1, cv=10, scoring='neg_mean_squared_error')
gs.fit(pca_x, logy)

# Store PCA component compositions and feature importance ranks
r = Ridge(**gs.best_estimator_.get_params())
r.fit(pca_x, logy)
feat_imp = np.reshape(r.coef_, (1, len(r.coef_)))
pca_comp = pca.components_
pcfi_US = pd.DataFrame(np.vstack((feat_imp, pca_comp)),
                                 columns=df_us.columns[1:-1])

# Store pca-space features
pc_labels = ['PC#' + str(i) for i in range(1,xp.shape[1]+1)]
data_US = pd.DataFrame(np.hstack((np.reshape(df_us.values[:,0],(xp.shape[0],1)),xp)), columns=[df_us.columns[0]]+pc_labels)
data_US[geo] = pd.to_numeric(data_US[geo], downcast='integer')

# Write results files to disk
data_US.to_csv('data_' + 'US' + '.csv', index=False, float_format='%.2f')
pcfi_US.to_csv('pcfi_' + '_' + 'US' + '.csv', index=True, index_label='PC', float_format='%.5f')

print('National complete.')

if geo == 'county':
    # list to hold all resulting dataframes for concatenation at the end
    concat_US = [] 

# Process all geographies within a state, unless number of samples is less than 
# 20, then use national level values from above. 
for state in state2fips.keys():
    df_temp = df.loc[df[geo] // level == state2fips[state]].copy()

    fips = str(state2fips[state])
    if len(fips) == 1:
        fips = '0' + fips

    # Drop rows with missing data
    df_temp.dropna(inplace=True)

    # Convert features, response, and log(response) to numpy arrays
    x = df_temp.iloc[:,1:-1].values
    y = df_temp.iloc[:,-1].values
    logy = np.log(df_temp.iloc[:,-1].values + 1)
    
    # Compute feature ranks and importance if samples >= 20, else use national
    # comparison from above
    if x.shape[0] >= 20:

        # Standardize and run PCA on the feature data
        sc = StandardScaler()
        std_x = sc.fit_transform(x)
        pca = PCA()
        pca_x = pca.fit_transform(std_x)
    
        # Compute percentile rankings for pca-space features
        xp = feature_percentiles(pca_x)
    
        # Run gridsearch on ridge regression to find optimal hp's
        gs = GridSearchCV(Ridge(),
                          {'alpha': [0.1, 0.3, 0.6, 1, 3, 6.0, 10, 30, 60, 100]},
                          n_jobs=1, cv=10, scoring='neg_mean_squared_error')
        gs.fit(pca_x, logy)
    
        # Store PCA component compositions and feature importance ranks
        r = Ridge(**gs.best_estimator_.get_params())
        r.fit(pca_x, logy)
        feat_imp = np.reshape(r.coef_, (1, len(r.coef_)))
        pca_comp = pca.components_
        pcfi = pd.DataFrame(np.vstack((feat_imp, pca_comp)),
                                         columns=df_temp.columns[1:-1])
    
        # Store original features, response, and pca-space features
        pc_labels = ['PC#' + str(i) for i in range(1,xp.shape[1]+1)]
        data = pd.DataFrame(np.hstack((np.reshape(df_temp.values[:,0],(xp.shape[0],1)),xp)), columns=[df_temp.columns[0]]+pc_labels)
        data[geo] = pd.to_numeric(data[geo], downcast='integer')
        
    else:
        
        # Downselect state values from US-level dataframes
        data = data_US.loc[data_US[geo] // level == state2fips[state]].copy()
        pcfi = pcfi_US.copy()
        
    # Write results files to disk
    data.to_csv(geo + '16_perc_' + fips + '.csv', index=False, float_format='%.2f')
    pcfi.to_csv(geo + '16_pcfi_' + fips + '.csv', index=True, index_label='PC', float_format='%.5f')
    
    if geo == 'county':
        # list to hold all resulting dataframes for concatenation at the end
        concat_US.append(data)
    
    print(state + ' complete.')
    
if geo == 'county':
    all_counties = pd.concat(concat_US)
    # Write df for percentiles for all US counties
    all_counties.to_csv('county16_perc.csv', index=False, float_format='%.2f')