# topojson

This directory contains the topojson files that provide the state, county, and tract features for drawing the maps

## us2016.topo.json

The entire US map that contains state features. The browser interface draws the <path> elements using this JSON file.

## 2016_[01-56].topo.json

Individual state maps that contain county and tract features. The browser interface draws the <path> elements using 
these JSON files.

## generate_topo.bash

This Ubuntu bash script downloads the shapefiles directly from the Census Bureau website, then uses the 
`topojson-client` command line interface to convert to TopoJSON format, create features, create id handles, simplify and quantize.

## package.json

This JSON file allows a developer to type `npm install` with this director as the present working directory, then
it runs the generate_topo.bash file and generates any missing topo.json files.
