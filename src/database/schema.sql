-- Import raw provider NPI file from NPPES
.mode csv
DROP TABLE IF EXISTS temp_nppes;
.import ../../data/npidata_pfile_20050523-20181209.csv temp_nppes

--Create table to filter out irrelevant columns, non-US and type-2 (org.) NPIs
DROP TABLE IF EXISTS temp_nppes2;
CREATE TABLE temp_nppes2 (
  npi INTEGER NOT NULL PRIMARY KEY,
  first_line_business TEXT,
  second_line_business TEXT,
  city_business TEXT,
  state_business TEXT,
  postal_code_business TEXT,
  deactivation_date TEXT,
  reactivation_date TEXT,
  gender TEXT,
  taxonomy_1 TEXT,
  taxonomy_switch_1 TEXT,
  taxonomy_2 TEXT,
  taxonomy_switch_2 TEXT,
  taxonomy_3 TEXT,
  taxonomy_switch_3 TEXT,
  taxonomy_4 TEXT,
  taxonomy_switch_4 TEXT,
  taxonomy_5 TEXT,
  taxonomy_switch_5 TEXT,
  taxonomy_6 TEXT,
  taxonomy_switch_6 TEXT,
  taxonomy_7 TEXT,
  taxonomy_switch_7 TEXT,
  taxonomy_8 TEXT,
  taxonomy_switch_8 TEXT,
  taxonomy_9 TEXT,
  taxonomy_switch_9 TEXT,
  taxonomy_10 TEXT,
  taxonomy_switch_10 TEXT,
  taxonomy_11 TEXT,
  taxonomy_switch_11 TEXT,
  taxonomy_12 TEXT,
  taxonomy_switch_12 TEXT,
  taxonomy_13 TEXT,
  taxonomy_switch_13 TEXT,
  taxonomy_14 TEXT,
  taxonomy_switch_14 TEXT,
  taxonomy_15 TEXT,
  taxonomy_switch_15 TEXT);

INSERT INTO temp_nppes2
  SELECT
    NPI,
    "Provider First Line Business Practice Location Address",
    "Provider Second Line Business Practice Location Address",
    "Provider Business Practice Location Address City Name",
    "Provider Business Practice Location Address State Name",
    "Provider Business Practice Location Address Postal Code",
    "NPI Deactivation Date",
    "NPI Reactivation Date",
    "Provider Gender Code",
    "Healthcare Provider Taxonomy Code_1",
    "Healthcare Provider Primary Taxonomy Switch_1",
    "Healthcare Provider Taxonomy Code_2",
    "Healthcare Provider Primary Taxonomy Switch_2",
    "Healthcare Provider Taxonomy Code_3",
    "Healthcare Provider Primary Taxonomy Switch_3",
    "Healthcare Provider Taxonomy Code_4",
    "Healthcare Provider Primary Taxonomy Switch_4",
    "Healthcare Provider Taxonomy Code_5",
    "Healthcare Provider Primary Taxonomy Switch_5",
    "Healthcare Provider Taxonomy Code_6",
    "Healthcare Provider Primary Taxonomy Switch_6",
    "Healthcare Provider Taxonomy Code_7",
    "Healthcare Provider Primary Taxonomy Switch_7",
    "Healthcare Provider Taxonomy Code_8",
    "Healthcare Provider Primary Taxonomy Switch_8",
    "Healthcare Provider Taxonomy Code_9",
    "Healthcare Provider Primary Taxonomy Switch_9",
    "Healthcare Provider Taxonomy Code_10",
    "Healthcare Provider Primary Taxonomy Switch_10",
    "Healthcare Provider Taxonomy Code_11",
    "Healthcare Provider Primary Taxonomy Switch_11",
    "Healthcare Provider Taxonomy Code_12",
    "Healthcare Provider Primary Taxonomy Switch_12",
    "Healthcare Provider Taxonomy Code_13",
    "Healthcare Provider Primary Taxonomy Switch_13",
    "Healthcare Provider Taxonomy Code_14",
    "Healthcare Provider Primary Taxonomy Switch_14",
    "Healthcare Provider Taxonomy Code_15",
    "Healthcare Provider Primary Taxonomy Switch_15"
  FROM temp_nppes
  WHERE "Provider Business Practice Location Address Country Code (If outside U.S.)" = 'US'
    AND "Entity Type Code" = 1
    AND "Provider Business Practice Location Address State Name" != 'AS'
    AND "Provider Business Practice Location Address State Name" != 'GU'
    AND "Provider Business Practice Location Address State Name" != 'MH'
    AND "Provider Business Practice Location Address State Name" != 'FM'
    AND "Provider Business Practice Location Address State Name" != 'MP'
    AND "Provider Business Practice Location Address State Name" != 'PW'
    AND "Provider Business Practice Location Address State Name" != 'PR'
    AND "Provider Business Practice Location Address State Name" != 'VI';

DROP TABLE temp_nppes;

--Filter down to only taxonomies of interest (core mental health providers)
DROP TABLE IF EXISTS taxonomies;
.import ../../data/taxonomies.csv taxonomies

DROP TABLE IF EXISTS temp_nppes3;
CREATE TABLE temp_nppes3 (
  npi INTEGER NOT NULL PRIMARY KEY,
  first_line_business TEXT,
  second_line_business TEXT,
  city_business TEXT,
  state_business TEXT,
  postal_code_business TEXT,
  deactivation_date TEXT,
  reactivation_date TEXT,
  gender TEXT,
  taxonomy TEXT);

--Join on primary taxonomy only, which can be one of 15 columns as denoted by
--boolean flag columns
INSERT INTO temp_nppes3
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_1 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_1 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_1 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_2 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_2 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_2 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_3 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_3 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_3 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_4 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_4 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_4 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_5 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_5 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_5 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_6 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_6 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_6 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_7 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_7 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_7 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_8 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_8 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_8 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_9 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_9 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_9 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_10 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_10 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_10 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_11 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_11 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_11 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_12 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_12 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_12 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_13 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_13 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_13 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_14 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_14 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_14 = 'Y'
UNION
SELECT
  npi,
  first_line_business,
  second_line_business,
  city_business,
  state_business,
  postal_code_business,
  deactivation_date,
  reactivation_date,
  gender,
  taxonomy_15 as taxonomy
FROM temp_nppes2 INNER JOIN taxonomies
  ON temp_nppes2.taxonomy_15 LIKE taxonomies.id || '%'
WHERE taxonomy_switch_15 = 'Y';

DROP TABLE temp_nppes2;
DROP TABLE taxonomies;

-- Need to join provider practice ZIPs to approximate counties
-- ZIPs can map to multiple counties, so used county with highest
-- % business from each ZIP. For the very rare cases of tied % business, I break
-- ties aritrarily using the higher county number. This is all an approximation,
-- the only precise solution would be to use a geocoding service to map each
-- provider address to individual counties. However, this approach is an OK
-- first cut for exploratory analysis and visualization.
DROP TABLE IF EXISTS temp_zip_2_county;
.import ../../data/ZIP_COUNTY_092018.csv temp_zip_2_county

DROP TABLE IF EXISTS zip_2_county;
CREATE TABLE zip_2_county (
  zip INTEGER NOT NULL PRIMARY KEY,
  county INTEGER);

-- First finds maximum business ratio per zip, then joins to corresponding
-- county
INSERT INTO zip_2_county
  SELECT temp_zip_2_county.zip, MAX(temp_zip_2_county.county) as county
  FROM (temp_zip_2_county INNER JOIN
        (SELECT zip, MAX(bus_ratio) as bus_ratio
         FROM temp_zip_2_county
         WHERE bus_ratio > 0
         GROUP BY zip) as max_counties
         ON temp_zip_2_county.zip = max_counties.zip
         AND temp_zip_2_county.bus_ratio = max_counties.bus_ratio)
  GROUP BY temp_zip_2_county.zip;

DROP TABLE temp_zip_2_county;

-- Finally, I map providers to counties to allow easier querying in combination
-- with census data. Technically, the address data could be further normalized,
-- but the dataset is small and updates are only expected in full-batch
-- refreshes so I prefer the convenience of keeping city, county, and state
DROP TABLE IF EXISTS nppes;
CREATE TABLE nppes (
  npi INTEGER NOT NULL PRIMARY KEY,
  first_line_business TEXT,
  second_line_business TEXT,
  city_business TEXT,
  state_business TEXT,
  deactivation_date TEXT,
  reactivation_date TEXT,
  gender TEXT,
  taxonomy TEXT,
  county INTEGER);

INSERT INTO nppes
  SELECT
    npi,
    first_line_business,
    second_line_business,
    city_business,
    state_business,
    deactivation_date,
    reactivation_date,
    gender,
    taxonomy,
    county
  FROM
    temp_nppes3 INNER JOIN zip_2_county
    ON substr(temp_nppes3.postal_code_business,1,5) = zip_2_county.zip;

DROP TABLE temp_nppes3;
DROP TABLE zip_2_county;

-- Load in the Census Bureau data

-- ACS 2017 data table S0601 (general population features)
DROP TABLE IF EXISTS temp_s0601;
.import ../../data/ACS_17_5YR_S0601_with_ann.csv temp_s0601

DROP TABLE IF EXISTS s0601;
CREATE TABLE s0601 (
  county INTEGER NOT NULL PRIMARY KEY,
  name TEXT,
  population INTEGER,
  median_age REAL,
  pct_male REAL,
  pct_white REAL,
  pct_black REAL,
  pct_native REAL,
  pct_asian REAL,
  pct_hawaii_pac REAL,
  pct_hisp_latino REAL,
  pct_other_lang_good_eng REAL,
  pct_other_lang_poor_eng REAL,
  pct_married REAL,
  pct_highest_ed_lt_hs REAL,
  pct_highest_ed_hs REAL,
  pct_highest_ed_bach REAL,
  pct_highest_ed_grad_prof REAL,
  median_income REAL,
  pct_poverty REAL,
  pct_citizenship REAL,
  pct_under_5_yr REAL,
  pct_5_to_17_yr REAL,
  pct_65_to_74_yr REAL,
  pct_gt_75_yr REAL);

INSERT INTO s0601
  SELECT
    Id2,
    Geography,
    "Total; Estimate; Total population",
    "Total; Estimate; Median age (years)",
    "Total; Estimate; SEX  Male",
    "Total; Estimate; RACE AND HISPANIC OR LATINO ORIGIN  One race  White",
    "Total; Estimate; RACE AND HISPANIC OR LATINO ORIGIN  One race  Black or African American",
    "Total; Estimate; RACE AND HISPANIC OR LATINO ORIGIN  One race  American Indian and Alaska Native",
    "Total; Estimate; RACE AND HISPANIC OR LATINO ORIGIN  One race  Asian",
    "Total; Estimate; RACE AND HISPANIC OR LATINO ORIGIN  One race  Native Hawaiian and Other Pacific Islander",
    "Total; Estimate; Hispanic or Latino origin (of any race)",
    "Total; Estimate; LANGUAGE SPOKEN AT HOME AND ABILITY TO SPEAK ENGLISH  Population 5 years and over  Speak language other than English  Speak English very well",
    "Total; Estimate; LANGUAGE SPOKEN AT HOME AND ABILITY TO SPEAK ENGLISH  Population 5 years and over  Speak language other than English  Speak English less than very well",
    "Total; Estimate; MARITAL STATUS  Population 15 years and over  Now married, except separated",
    "Total; Estimate; EDUCATIONAL ATTAINMENT  Population 25 years and over  Less than high school graduate",
    "Total; Estimate; EDUCATIONAL ATTAINMENT  Population 25 years and over  High school graduate (includes equivalency)",
    "Total; Estimate; EDUCATIONAL ATTAINMENT  Population 25 years and over  Bachelor's degree",
    "Total; Estimate; EDUCATIONAL ATTAINMENT  Population 25 years and over  Graduate or professional degree",
    "Total; Estimate; Median income (dollars)",
    "Total; Estimate; POVERTY STATUS IN THE PAST 12 MONTHS  Population for whom poverty status is determined  Below 100 percent of the poverty level",
    "Total; Estimate; PERCENT ALLOCATED  Citizenship status",
    "Total; Estimate; AGE  Under 5 years",
    "Total; Estimate; AGE  5 to 17 years",
    "Total; Estimate; AGE  65 to 74 years",
    "Total; Estimate; AGE  75 years and over"
  FROM temp_s0601;

DROP TABLE temp_s0601;

-- ACS 2017 data table S1101 (household features)
DROP TABLE IF EXISTS temp_s1101;
.import ../../data/ACS_17_5YR_S1101_with_ann.csv temp_s1101

DROP TABLE IF EXISTS s1101;
CREATE TABLE s1101 (
  county INTEGER NOT NULL PRIMARY KEY,
  avg_household_size REAL,
  pct_household_w_minors REAL,
  pct_female_head_single_mom REAL,
  pct_single_unit_housing REAL,
  pct_multi_unit_housing REAL,
  pct_home_owners REAL);

INSERT INTO s1101
  SELECT
    Id2,
    "Total; Estimate; Average household size",
    "Total; Estimate; Total households  SELECTED HOUSEHOLDS BY TYPE  Households with one or more people under 18 years",
    "Female householder, no husband present, family household; Estimate; Total households  SELECTED HOUSEHOLDS BY TYPE  Households with one or more people under 18 years",
    "Total; Estimate; UNITS IN STRUCTURE  1unit structures",
    "Total; Estimate; UNITS IN STRUCTURE  2ormoreunit structures",
    "Total; Estimate; HOUSING TENURE  Owneroccupied housing units"
  FROM temp_s1101;

DROP TABLE temp_s1101;

-- ACS 2017 data table S1810 (disabilities data)
DROP TABLE IF EXISTS temp_s1810;
.import ../../data/ACS_17_5YR_S1810_with_ann.csv temp_s1810

DROP TABLE IF EXISTS s1810;
CREATE TABLE s1810 (
  county INTEGER NOT NULL PRIMARY KEY,
  pct_with_disability REAL);

INSERT INTO s1810
  SELECT
    Id2,
    "Percent with a disability; Estimate; Total civilian noninstitutionalized population"
  FROM temp_s1810;

DROP TABLE temp_s1810;

-- ACS 2017 data table S2101 - (veterans data)
DROP TABLE IF EXISTS temp_s2101;
.import ../../data/ACS_17_5YR_S2101_with_ann.csv temp_s2101

DROP TABLE IF EXISTS s2101;
CREATE TABLE s2101 (
  county INTEGER NOT NULL PRIMARY KEY,
  pct_veterans REAL);

INSERT INTO s2101
  SELECT
    Id2,
    "Percent Veterans; Estimate; Civilian population 18 years and over"
  FROM temp_s2101;

DROP TABLE temp_s2101;

-- ACS 2017 data table S2301 (employment data)
DROP TABLE IF EXISTS temp_s2301;
.import ../../data/ACS_17_5YR_S2301_with_ann.csv temp_s2301

DROP TABLE IF EXISTS s2301;
CREATE TABLE s2301 (
  county INTEGER NOT NULL PRIMARY KEY,
  pct_labor_participation REAL,
  pct_unemployment REAL);

INSERT INTO s2301
  SELECT
    Id2,
    "Labor Force Participation Rate; Estimate; Population 16 years and over",
    "Unemployment rate; Estimate; Population 16 years and over"
  FROM temp_s2301;

DROP TABLE temp_s2301;

-- ACS 2017 data table S2701 (insurance data)
DROP TABLE IF EXISTS temp_s2701;
.import ../../data/ACS_17_5YR_S2701_with_ann.csv temp_s2701

DROP TABLE IF EXISTS s2701;
CREATE TABLE s2701 (
  county INTEGER NOT NULL PRIMARY KEY,
  pct_civ_uninsured REAL);

INSERT INTO s2701
  SELECT
    Id2,
    "Percent Uninsured; Estimate; Civilian noninstitutionalized population"
  FROM temp_s2701;

DROP TABLE temp_s2701;

-- USCB county centroids
DROP TABLE IF EXISTS temp_latlon;
.import ../../data/2017_Gaz_counties_national.csv temp_latlon

DROP TABLE IF EXISTS latlon;
CREATE TABLE latlon (
  county INTEGER NOT NULL PRIMARY KEY,
  land_sq_mi REAL,
  lat REAL,
  lon REAL);

INSERT INTO latlon
  SELECT
    GEOID,
    ALAND_SQMI,
    INTPTLAT,
    INTPTLONG
  FROM temp_latlon;

DROP TABLE temp_latlon;

-- Merge the census data tables together
CREATE TABLE temp_geo AS
SELECT *
FROM latlon INNER JOIN
  (SELECT *
   FROM s2701 INNER JOIN
     (SELECT *
      FROM s2101 INNER JOIN
       (SELECT *
        FROM s1101 INNER JOIN
         (SELECT *
          FROM s2301 INNER JOIN
           (SELECT *
            FROM s0601 INNER JOIN s1810
            ON s0601.county = s1810.county) AS temp1
          ON s2301.county = temp1.county) AS temp2
        ON s1101.county = temp2.county) AS temp3
      ON s2101.county = temp3.county) AS temp4
   ON s2701.county = temp4.county) AS temp5
ON latlon.county = temp5.county;

DROP TABLE s0601;
DROP TABLE s1810;
DROP TABLE s2301;
DROP TABLE s1101;
DROP TABLE s2101;
DROP TABLE s2701;
DROP TABLE latlon;

DROP TABLE IF EXISTS geo;
CREATE TABLE geo AS
SELECT
  county,
  name,
  land_sq_mi,
  lat,
  lon,
  pct_civ_uninsured,
  pct_veterans,
  avg_household_size,
  pct_household_w_minors,
  pct_female_head_single_mom,
  pct_single_unit_housing,
  pct_multi_unit_housing,
  pct_home_owners,
  pct_labor_participation,
  pct_unemployment,
  population,
  median_age,
  pct_male,
  pct_white,
  pct_black,
  pct_native,
  pct_asian,
  pct_hawaii_pac,
  pct_hisp_latino,
  pct_other_lang_good_eng,
  pct_other_lang_poor_eng,
  pct_married,
  pct_highest_ed_lt_hs,
  pct_highest_ed_hs,
  pct_highest_ed_bach,
  pct_highest_ed_grad_prof,
  median_income,
  pct_poverty,
  pct_citizenship,
  pct_under_5_yr,
  pct_5_to_17_yr,
  pct_65_to_74_yr,
  pct_gt_75_yr,
  pct_with_disability
FROM temp_geo;

DROP TABLE temp_geo;

-- Remove dropped tables from file on disk
VACUUM;

-- This results in a simple database with two relations.
-- nppes has a tuple for every provider in the selected set of taxonomies. The
-- npi number is the primary key. nppes uses county FIPS id as a foregin key
-- to allow mapping to the second relation geo, which holds various social,
-- demographic, and economic statistics for each county.

-- See queries.sql for a sample query used to aggregate and export a dataset
-- for analysis and visualization.
