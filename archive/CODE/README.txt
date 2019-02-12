# CODE

This is the CSE 6242 OAN Team 03 code for the project

## front_end

The front end consists of a Javascript-driven website, `team03.html`. See README file for more details.

## back_end 

See back_end directory for database and feature_pipeline references including detailed supplemental README files.

## Dependencies

### To run the app
- Firefox 63.0.3 (64-bit) or later [only requirement to run the app]. Firefox minimum zoom threshold is 90%.

### To split tract data into individual states
- Python 3.5+
- pandas 0.23.4+

### To download topographical shapefiles 
In the Ubuntu environment:
- bash
- Node.js v11.1.0+ (which includes npm 6.4.1+)

#### When running `npm install` in the topojson directory, the `package.json` configuration file will direct npm
to install the following
    "d3-scale": "^1.0.4",
    "d3-scale-chromatic": "^1.1.0",
    "d3-geo-projection": "^1.2.1",
    "ndjson-cli": "^0.3.0",
    "shapefile": "^0.5.9",
    "topojson-server": "^2.0.0",
    "topojson-client": "^2.1.0",
    "topojson-simplify": "^2.0.0"

### To build the database
- SQLite3 3.16.2+

### To perform the analysis
- Python 3.5+
- numpy 1.13.3+
- pandas 0.23.4+
- scikit-learn 0.20.0+ 
