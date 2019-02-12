-- Sample query showing usage of relational database for aggregating and
-- joining provider and place data for analysis and visualization.
-- The results are written to a .csv file.
.headers on
.mode csv
.output ../analysis/data.csv

-- Query aggregating provider statistics and joining to county data.
-- This can be edited to draw whatever features are of interest for analysis.
SELECT
  geo.county AS county,
  name,
  ifnull(1000.0*prov_count / population, 0) AS prov_density,
  ifnull(prov_count, 0) AS prov_count,
  1.0 * population / land_sq_mi AS pop_density,
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
  pct_under_5_yr + pct_5_to_17_yr AS pct_lt_18_yr,
  pct_65_to_74_yr + pct_gt_75_yr AS pct_gt_65_yr,
  pct_with_disability
FROM geo LEFT OUTER JOIN
  (SELECT county, COUNT(npi) as prov_count
   FROM nppes
   GROUP BY county) AS grp_npi ON geo.county = grp_npi.county;
