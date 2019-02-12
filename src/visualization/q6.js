// The official D3 API documentation https://github.com/topojson/topojson+ and
// this tutorial were key resources: https://bl.ocks.org/mbostock/3306362
// Color shades were sourced from: https://www.w3schools.com/colors/colors_picker.asp?colorhex=663399
// The tool tip feature was based off of this demo: https://github.com/Caged/d3-tip

// Create svg
width = 1100;
height = 825;
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// Scale for fill colors
colorBins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
colors = ['#ffffff','#e6d9f2','#ccb3e6','#b38cd9','#9966cc','#8040bf','#663399',
          '#4d2673','#33194d', '#1a0d26'];
var cScale = d3.scale.threshold()
    .domain(colorBins)
    .range(colors);

// Create a new geographic path generator with default settings
// Syntax adapted from tutorial referenced at top
var projection = d3.geo.albersUsa()
                   .scale(1100)
                   .translate([width / 2, height / 2]);
var pathGen = d3.geo.path()
                    .projection(projection);


// Use queue to load data files
d3.queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "education.csv")
    .defer(d3.csv, "education_details.csv")
    .await(generateMap);

function generateMap(error, us, education, education_details) {
  if (error) throw error;

  // Extract education rates and convert to integers
  var educationRates = {};
  var countyStats = {};
  for (var i = 0; i < education.length; i++) {
    educationRates[education[i]['id']] = +education[i]['percent_educated'];
    countyStats[education[i]['id']] = [+education[i]['percent_educated']];
    countyStats[education[i]['id']].push(education[i]['name']);
  }

  for (var i = 0; i < Object.keys(countyStats).length; i++) {
    countyStats[education_details[i]['id']].push(education_details[i]['qualified_professionals']);
    countyStats[education_details[i]['id']].push(education_details[i]['high_school']);
    countyStats[education_details[i]['id']].push(education_details[i]['middle_school_or_lower']);
  }

  // Initialize a tooltip, this documentation used:
  // https://github.com/Caged/d3-tip/blob/master/docs/updating-tooltip-content.md#tiphtml
  tip = d3.tip().attr('class', 'd3-tip')
                .html(function(d) {
                  return "County: " + countyStats[d.id][1] + "<br />"
                         + "Percentage Educated: " + countyStats[d.id][0]
                         + "<br />" + "Qualified Professionals: " +
                         countyStats[d.id][2] + "<br />" +
                         "High school graduates: " + countyStats[d.id][3] +
                         "<br />" + "Middle school or lower graduates: " +
                         countyStats[d.id][4]
                });

  // Offset tooltip to right side
  tip.direction('n');
  tip.offset([-20, 0]);

  // Call the tooltip on the visualization
  var vis = svg.call(tip);

  // Generate the counties with tooltip events
  svg.append("g")
     .attr("class", "counties")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.counties).features)
     .enter().append("path")
     .attr("d", pathGen)
     .style("fill", function(d) { return cScale(educationRates[d.id]); })
     .on("mouseover", tip.show)
     .on("mouseout", tip.hide);

  svg.append("text")
     .text("EDUCATION STATISTICS")
     .attr("x", width / 2)
     .attr("y", 0.1 * height)
     .attr("class", "title");

  // Create a legend
  blockHeight = height / 30;
  blockWidth = width / 30;
  for (i = 0; i < colorBins.length; i++) {
    svg.append("rect")
       .attr("x", 0.9 * width)
       .attr("y", 0.3 * height + i * blockHeight)
       .attr("height", blockHeight)
       .attr("width", blockWidth)
       .attr("fill", colors[i])
       .attr("class", "leg-block");
       }
   for (i = 0; i < colorBins.length; i++) {
     svg.append("text")
        .text(colorBins[i] + "%")
        .attr("x", 0.9 * width + blockWidth + 2)
        .attr("y", 0.3 * height + i * blockHeight + 0.5 * blockWidth)
        .attr("class", "leg-label");
        }

}
