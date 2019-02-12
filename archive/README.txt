This project was a collaborative effort of Mohit Aggarwal, James Boyle, Nathan Cook, Andrew Doss, and Suzi Pike.

DESCRIPTION 
This package allows medical professionals and administrators to explore the availability
of mental health providers via an interactive geographic representation. Principal
component analysis and regularized regression analysis were used to derive metrics that
provide insight into which combinations of sociodemographic attributes have power to
objectively predict provider density. Straightforward quantile (percentile) mapping
was also performed to communicate which predictors were most distinctive to each area.

The package consists of 5 primary components:
1. a database of provider and demographic information, 
2. code to implement a principal component analysis, 
3. a set of intermediate datasets resulting from the analysis, 
4. a set of topographical files, and 
5. a browser front end to allow user interaction with the datasets.

INSTALLATION 
For viewing the intermediate datasets and interacting with them via the topography in
the browser, simply copy the `front_end` directory to your local machine, and install
the Firefox browser. For more insight into how to generate the topographical files,
follow the README.md in the `topojson` folder, which will include the use of a bash
shell (Ubuntu was used for this project). All d3 and jQuery dependencies are taken
care of in the lib folder or by direct link to a URL.

For building the database and running the principal component/regression analysis code,
copy the `back_end` directory to your local machine, ensure you have Python 3, pandas, 
numpy, sklearn, and sqlite3 installed, then follow the README.md files in the `database`
and `feature_analysis_pipeline` folders. Building the database will require download of
the large source data files from a OneDrive link provided in the README.md for the
database directory. 


EXECUTION
In the `front_end` folder, open `team03.html` with the Firefox browser configured for 
minimum zoom threshold of 90%. A map of the United States is drawn. Individual states 
are selectable via mouseover and click.

Once an individual state is selected, it is drawn in the left 2/3 of the browser window,
with counties colored per their values of the attribute selected in the dropdown select
box in the upper left. Colors and the legend will be updated as different attributes
are selected. Tooltip with county name and selected attribute value for that county is
visible upon mouseover.

Individual counties are selectable via mouseover and click. Upon selection, the map is
rescaled to fill the view with the selected county. On the right 1/3 of the browser
window, a table with all of the available attributes for the selected county in the
years 2016 and 2011, as well as the trend difference between the two, is displayed in
the top half. In the lower half, a scatterplot of Principal Components is displayed with
percentile of selected county relative to the rest of the state on the vertical axis
and relevance for predicting provider density on the horizontal axis. The scatterplot 
points are colored green for principal components that are predictive of more mental
health provider density and colored red for principal components that are predictive of
less mental health provider density. A mouseover of a datapoint displays the 5 highest
magnitude contributions of attributes toward that principal component. 

Clicking a second time on a selected county zooms back out to the entire state and
deselects the county. However, clicking on another county visible in the zoomed view
selects the newly clicked county and recenters and rescales to fill the view with the
newly selected county. The table and scatterplot are updated for the new county.

Buttons above the map allow for selection of census tracts instead of counties.
Functionality for census tracts is the same with respect to colors, tooltips, table
display, and scatterplot. Because of the wide range of tract area, it is recommended
to select a county of interest, then toggle to tract view, but this is not necessary.

Another set of buttons above the map allow for the selection of an earlier year. The
earlier year's data is used to update the map coloring and index. Likewise, the trend
difference from the earlier to the later year is selectable. For the trend data, a
divergent scale is used to highlight upward and downward trends. Trend data on the
map is only available for attributes that are present in both years' datasets. The
table will display `NaN` for any missing information for the selected feature, whether
county or tract.

The `Change State` button brings the user back to the entire US map, clearing out the
table and scatterplot display.
