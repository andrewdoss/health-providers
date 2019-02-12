-- Sample queries for initial data analysis
.headers on
.separator ','
.mode csv

.output county16_fs.csv

SELECT
  county_16.geoid as county,
  perc_insured,
  avg_household_size,
  unemployment_rate,
  median_age,
  male,
  white_race,
  black_race,
  native_race,
  asian_race,
  hispanic_latino,
  other_language_home_poor_english as poor_english,
  ed_hs_grad + ed_some_college + ed_bachelors + ed_graduate_prof_deg as ed_hs_plus,
  ed_some_college + ed_bachelors + ed_graduate_prof_deg as ed_college_plus,
  median_income,
  below_poverty,
  ifnull(prov_count, 0) as prov_count,
  lat,
  lon,
  ifnull(1000.0*prov_count / total_pop, 0) as prov_density
FROM county_16 LEFT OUTER JOIN
  (SELECT geoid_short, COUNT(npi) as prov_count, AVG(lat) as avg_lat, AVG(long) as avg_long
  FROM nppes
  GROUP BY geoid_short) AS grp_npi ON county_16.geoid = grp_npi.geoid_short;

.output tract16_fs.csv
-- query joining 2016 county prov_density with other tract-level data
SELECT
  tract_16.geoid as tract,
  primary_ruca,
  perc_insured,
  total_pop / land_area as pop_density,
  avg_household_size,
  unemployment_rate,
  median_age,
  male,
  white_race,
  black_race,
  native_race,
  asian_race,
  hispanic_latino,
  other_language_home_poor_english as poor_english,
  ed_hs_grad + ed_some_college + ed_bachelors + ed_graduate_prof_deg as ed_hs_plus,
  ed_some_college + ed_bachelors + ed_graduate_prof_deg as ed_college_plus,
  median_income,
  below_poverty,
  lat,
  lon,
  prov_density
FROM tract_16 INNER JOIN
  (SELECT
     county_16.geoid as county,
     avg_lat,
     avg_long,
     ifnull(1000.0*prov_count / total_pop, 0) as prov_density
  FROM county_16 LEFT OUTER JOIN
    (SELECT
       geoid_short,
       COUNT(npi) as prov_count,
       AVG(lat) as avg_lat,
       AVG(long) as avg_long
     FROM nppes
     GROUP BY geoid_short) AS grp_npi
  ON county_16.geoid = grp_npi.geoid_short) AS county_16_pc
ON tract_16.geoid / 1000000 = county_16_pc.county;
