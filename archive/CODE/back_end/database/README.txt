### Dataset Directory

- /src is a directory for source data (.csv) files. They are too large for GitHub,
  so you must download the directory contents from this OneDrive folder to your local
  machine:
  https://gtvault-my.sharepoint.com/:f:/g/personal/adoss7_gatech_edu/Evze41DZvadNv9E57MGRHfoBjcigRjlu3ExLfiSBgueTwg?e=C3hoEQ
- schema.sql is an SQLite 3 script that will build the database, assuming the source
  files are downloaded from OneDrive to /src
- fp_queries.sql provides a version of the queries used to extract .csv files for input
  into the PCA/regression feature analysis pipeline (feature_pipeline.py)
- /data_references provides reference material/meta data related to the source datasets 

#### Source data was derived from the following sources 

- Census data from https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml
- NPPES (Provider counts and locations by taxonomy) https://nppes.cms.hhs.gov/#/
- RUCA https://www.ers.usda.gov/data-products/rural-urban-commuting-area-codes.aspx
- Provider Taxonomy Descriptions http://www.wpc-edi.com/reference/codelists/healthcare/health-care-provider-taxonomy-code-set/
- Initial geocoding of provider addresses to lat/long and Census tracts https://www.census.gov/geo/maps-data/data/geocoder.html
- Secondary geocoding of provider addresses to lat/long and Census tracts https://geoservices.tamu.edu/

Note: Only a subset of the NPPES dataset was used, as detailed in schema.sql. The subset
being used had to be manually geocoded in small batches. The majority of the data was
geocoded in batches of 10k providers using the Census bureau geocoding service
referenced above. The remaining addresses (some of which could not match in the Census
bureau tool) were geocoded using the Texas A&M service also referenced above. The
results are provided in the OneDrive link above at geocode_final.csv. Unfortunately,
there is no way to provide a simple script due to the manual nature of this process
involving Web Application GUI's. The basic steps are:

(1) Create account (for Texas A&M service)
(2) query database to extract subset of providers from NPPES data as a .csv file with
    address data and NPI as a unique ID/key
(3) Navigate to the links provided above. Follow instructions on the web pages to 
    upload batches from the .csv file.
(4) Reassemble the batches into a single .csv that includes NPI as well as new geocoded
    features (e.g. latitude, longitude, tract, county)

If any support is required, please contact adoss7@gatech.edu. 

#### How to use the database

You should not need to use the database to view the finished tool, as the final
processed datafiles are provided in the front-end directory. However, in case you wish
to recreate the intermediate data files or explore project extensions, there are two
options:

(1) (Recommended) Download the built data.db SQLite3 file from OneDrive (currently, only
accessible for people with Georgia Tech)

https://gtvault-my.sharepoint.com/:u:/g/personal/adoss7_gatech_edu/EWk7zJB8nqxJuyLz6mAkpo0BQHQB0m7Ux2X9EzPgZvN2Xw?e=ok8wGi

Otherwise, download all source data files to the src directory and run:

$ sqlite3 data.db < schema.sql

To attempt to build your own database file from source.

In general, you can load the database and write queries for view on the command
line or preferably export your desired analysis view directly to .csv. Here is an
example of opening the database and exporting the percentage insured and median
income per census tract to a .csv (prompt $ omitted so you can copy/paste):

sqlite3 data.db
.headers on
.mode csv
.output analysis_file.csv

SELECT geoid, perc_insured, median_income
FROM tract_16;

A second more complicated example that outputs providers per capita per tract
(ignored tracts with 0 providers, see fp_queries for more complex query examples):

(from command line)
sqlite3 data.db

(from sqlite prompt)
.headers on
.mode csv
.output provider_density.csv

SELECT tract_16.geoid, 1.0*prov_count / total_pop as prov_density
FROM
  (SELECT geoid, COUNT(npi) as prov_count
  FROM nppes
  GROUP BY geoid) AS grp_npi INNER JOIN tract_16 ON grp_npi.geoid = tract_16.geoid;

Note: you will get several insertion warnings/exceptions when you run this. This is OK
and is because I decided to leave the headers in the .csv files for human
reference. SQLite rejects the headers which is OK because the schema.sql includes
the column names.