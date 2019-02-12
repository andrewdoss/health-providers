# health-providers

### Contents

- README.md see for motivation, citations, and project status
- /src/analysis - contains main analysis notebook
- /src/database - contains schema, sample queries, and SQLite .db file
- /src/visualization - placeholder for new D3.js visualization when complete
- /data/ - includes data files except for large NPI dataset (see section below)
- /archive/ - includes larger team project/D3 visualization from CSE6242 at
Georgia Tech

### Motivation

![Alt text](/assets/prov_shortages.png?raw=true "Choropleth Bias")<br>
(From in-progress analysis, mental health provider shortages using HRSA definition)

Many areas in the US face shortages of mental health providers. This can make
it difficult for primary care physicians to refer patients for the specialty
care that they need and can limit the availability for consultation in an acute
care setting.

There are existing workforce studies and most notably, the US Health Resources
and Services Administration (HRSA) publishes mental health provider shortage
areas. This work attempts to expand upon those available statistics. First,
the published workforce studies that I found tended to explore the association
between providers per capita and single or low-dimensional sets of independent
variables. This analysis attempts to study the joint association with several
independent variables at once.

Second, this analysis uses data from the National Provider Identifier (NPI)
registry. The registry exists to support Medicare/Medicaid billing, but is also
widely adopted by private insurance carriers. Therefore, it is expected to provide
good estimates for all types of providers who bill services to insurance
providers. As a secondary data source, there are some data quality issues that
I may write about further as this project progresses. However, researchers
at the University of Washington Center for Health Workforce Studies have published
papers and presentations indicating that the data can be useful for providing
workforce estimates.

Another advantage of the NPI dataset is that it provides individual provider
practice locations and taxonomies. This allows geocoding of individual provider
lat/lon coordinates and aggregation at arbitrary geography levels and over
subsets of provider disciplines. There are some limitations due to the
presence of group NPIs that are opaque to how many providers are covered.  

### Objectives

1. Aggregate provider data to compute distribution per capita and shortage
areas.

2. Fit models to explore the joint association of provider densities with
socioeconomic variables.

3. Create an interactive web visualization to present the results.

### Project Status

- See archive folder for completed prototype team project from CSE6242 at
Georgia Tech
- I am also working on an overhaul that will attempt to study a more narrow scope
(only county-level distribution) but with more thorough modeling and analysis. The
working state is available in the /src/ directory of the root of this repo

### Data and Citations

This initial exploratory analysis uses data from multiple public sources.

#### Provider Types Locations

Provider locations are sourced from the National Plan and Provider Enumeration
System. Due to the size of the database (>6 GB), the data is not provided
in this repo. However, the latest data file is available here:

http://download.cms.gov/nppes/NPI_Files.html

A SQLite script is provided that will automatically process the NPPES file and
other provided data files into a relational database that can be queried for analysis.
A sample query is also provided.

To bypass any work with the large file, a post-aggregation dataset is also provided
at /src/analysis/data.csv.

#### Population Data

Population data is sourced from the 2017 5-Year American Community Survey. The
files used are provided in the /data/ directory. The files can be downloaded at:

ACS data is freely available through the American Fact Finder download tool:

https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml
