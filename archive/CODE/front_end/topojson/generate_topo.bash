#!/bin/bash

# The ACS 5-Year Estimate vintage.
YEAR=2016

if [ ! -f cb_${YEAR}_us_state_500k.zip ]; then
    curl 'https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_state_500k.zip' -o cb_${YEAR}_us_state_500k.zip
    unzip -o cb_${YEAR}_us_state_500k.zip cb_${YEAR}_us_state_500k.shp cb_${YEAR}_us_state_500k.dbf
fi

# Construct TopoJSON for states 
if [ ! -f us${YEAR}.topo.json ]; then
  geo2topo -n \
          states=<(shp2json -n cb_${YEAR}_us_state_500k.shp \
                  | ndjson-map 'd.id = d.properties.GEOID, d') \
      | toposimplify -p 1e-3 \
      | topoquantize 1e8 \
      > us${YEAR}.topo.json
fi

# Download county information and hold in reserve to combine with tract/state information

if [ ! -f cb_${YEAR}_us_county_500k.zip ]; then
    curl 'https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_county_500k.zip' -o cb_${YEAR}_us_county_500k.zip
    unzip -o cb_${YEAR}_us_county_500k.zip cb_${YEAR}_us_county_500k.shp cb_${YEAR}_us_county_500k.dbf
fi

if [ ! -f cty.json ]; then
    shp2json -n cb_${YEAR}_us_county_500k.shp | ndjson-map 'd.id = d.properties.GEOID, d' > cty.json
fi


# Now get the tract information for individual states

# The state FIPS codes.
STATES="01 02 04 05 06 08 09 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 44 45 46 47 48 49 50 51 53 54 55 56"

# Download the census tract boundaries.
# Extract the shapefile (.shp) and dBASE (.dbf).
# Download the census tract population estimates.
for STATE in ${STATES}; do
  if [ ! -f cb_${YEAR}_${STATE}_tract_500k.shp ]; then
    curl -o cb_${YEAR}_${STATE}_tract_500k.zip \
      "https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_${STATE}_tract_500k.zip"
    unzip -o \
      cb_${YEAR}_${STATE}_tract_500k.zip \
      cb_${YEAR}_${STATE}_tract_500k.shp \
      cb_${YEAR}_${STATE}_tract_500k.dbf
  fi
done



for STATE in ${STATES}; do
  echo ${STATE}
  echo cb_${YEAR}_${STATE}_tract_500k.shp
  echo ${YEAR}_${STATE}.topo.json
  geo2topo -n \
    tracts=<(shp2json -n cb_${YEAR}_${STATE}_tract_500k.shp \
             | ndjson-map 'd.id = d.properties.GEOID, d') \
    counties=<(ndjson-filter "d.properties.STATEFP == ${STATE}" < cty.json) \
    | toposimplify -p 1e-6 -f \
    | topoquantize 1e6 \
    > ${YEAR}_${STATE}.topo.json
done
