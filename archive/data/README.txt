# data directory

This directory contains the intermediate data files that are products of the feature analysis pipeline in the back_end.

## county[16|11]_data.csv

County provider and demographics data for the entire US by county for 2016 and 2011.

## county16_[pcfi|perc].csv

County principal component composition/prediction relevance for 2016 for the country.

## county16_[pcfi|perc]_[01-56].csv

County principal component composition/prediction relevance for 2016 split by state.

## tract[16|11]_data.csv

Census tract provider and demographics data for the entire US by tract for 2016 and 2011.

## make_data_tracts.py

A Python 3 script that splits tract[16|11]_data.csv into individual state files using the libraries `csv` and `pandas`

## tract[16|11]_data_[01-56].csv

Census tract provider and demographics data for 2016 and 2011 split by state.

## tract16_[pcfi|perc]_[01-56].csv

Census tract principal component composition/prediction relevance for 2016 split by state.
