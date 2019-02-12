This directory provides intermediate data files (from the SQLite database) and a Python 
script that takes the intermediate data files as input and outputs the final files
for the front-end visualization (see front_end/data).

Python 3 and the following packages are required to run the script:
sys, numpy, pandas, sklearn

The script must be run twice - once to process county data, and once to process tract data.

The script should be run from the command line and takes two input arguments:
- argument 1: the filename (county16_fs.csv or tract16_fs.csv)
- argument 2: the geography level being processed (county or tract, must match file)

Example call for processing county data:

$ python feature_pipeline.py county16_fs.csv county 

Note: if new files are used with different features, the first column must be a FIPS
GEOID appropriate to the geography level being processed and the last column must be
the response feature of interest (provider density in the main project case)

Note: headers were renamed after this script using a GUI find/replace in a text editor. There
is no script for this reformatting, so header and corresponding populated names may vary in the
final web page view if similar reformatting is not completed after this step. However, the
files will still work, simply with different versions of the variable names.  


 