/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-undef */

// This code has been adapted from tutorials at
// https://medium.com/@ccanipe/building-a-u-s-election-basemap-with-d3-js-and-topojson-fa4b5ab5175d
// https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c
// https://gist.github.com/mbostock/2522624ada2c1f9e0fafb75cca09442b#file-topo-svg

// global variable stateId
// Identifies the currently drawn state, empty string '' when the US
var stateId = ''
var countyId = ''
var tractId = ''
var selectedState // This is the reference to the currently selected state object
var selectedCounty // This is the reference to the currently selected county
var selectedTract // This is the reference to the currently selected tract

// global variables newYear and oldYear
var newYear = '2016'
var oldYear = '2011'

// POTENTIAL CONFUSION ALERT, a javascript "Map" is a data structure and has nothing to do with drawing a map
// I'm using JS Map instead of d3.map because it's deprecated in d3
// https://github.com/d3/d3-collection

// global variable countyData
// holds the data for the counties of each state when the state is drawn
var countyData = new Map()
countyData.set(newYear, new Map())
countyData.set(oldYear, new Map())
countyData.set('trend', new Map())
countyData.set('perc', new Map())

// global variable tractData
// holds the data for the tracts of each state when the state is drawn
var tractData = new Map()
tractData.set(newYear, new Map())
tractData.set(oldYear, new Map())
tractData.set('trend', new Map())
tractData.set('perc', new Map())

// global variable pcfiData
// holds the data for the county or tract level principal components and feature importance data
var pcfiData = new Map()
pcfiData.set('county', new Map())
pcfiData.set('tract', new Map())

// function MyMap
// The core of the app, loading the information, setting default color, and creating the map
var MyMap = function (opts) {
  // load in arguments from config object
  this.geo = opts.geo
  this.element = opts.element
  this.view = opts.view
  this.year = opts.year
  this.sElement = opts.sElement

  // Not used, yet
  this.colors = {
    blank: '#CCC' // Would add additional colors to our lookup here
  }

  // create the Map
  this.drawMap()
  // if (stateId) { this.drawScatterPlot() }
  this.setView()
  this.update()
}

// MyMap method drawMap
// Does most of the heavy lifting
MyMap.prototype.drawMap = function () {
  _this = this
  // Set width/height/margins
  this.setDimensions('mapGraphic')

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 50])
    .html(function (d) {
      if (d.properties.GEOID.length === 2) {
        return '<p>' +
      d.properties.NAME +
      '</p>'
      } else if (d.properties.GEOID.length === 5) {
        return '<p>' +
      d.properties.NAME + ' County' +
      '</p>' +
      '<p>' + d3.select('.select-drop').property('value') + ': ' +
      d3.format(',.2r')(countyData.get(_this.year).get(d.properties.GEOID).get(d3.select('.select-drop').property('value'))) +
      '</p>'
      } else if (d.properties.GEOID.length === 11) {
        return '<p> Tract ' +
      d.properties.NAME +
      '</p>' +
      '<p>' + d3.select('.select-drop').property('value') + ': ' +
      d3.format(',.2r')(tractData.get(_this.year).get(d.properties.GEOID).get(d3.select('.select-drop').property('value'))) +
      '</p>'
      }
    })

  // Not sure what this does
  this.element.innerHTML = ''

  this.homeButton() // Add click functionality to home button

  // Add on change functionality to dropdown
  d3.select('.select-drop')
    .on('change', function () {
      _this.update()
    })

  // Adds the svg to the map area
  this.svg = d3.select(this.element).append('svg')

  // Sizes svg to fit the map area
  this.element.style.width = this.mapwidth
  this.svg.attr('width', this.mapwidth)
  this.svg.attr('height', this.mapheight)

  this.centered = null // Store path data if map is zoomed to path
  this.isZoomed = false // Store path data if map is zoomed to path
  this.maxZoom = 5 // Level to zoom into when area or region is clicked.
  this.lineStroke = 0.5 // Stroke width to maintain at various zoom levels.

  // Append the map to a <g> element
  this.plot = this.svg.append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    .attr('class', 'map-g')
    .call(tip)

  // Append legend
  this.colorLegendG = this.svg.append('g')
    .attr('class', 'legendQuant')
    .attr('transform', 'translate(0,0)')

  this.resetProjection() // Set the projection according to width/height

  /* DRAW THE MAP FEATURES */
  var _this = this // Store value of this for use inside selection-nested functions

  // Plot the paths
  if (this.view === 'states') {
    d3.select('.statelabel').style('display', 'none')
    d3.select('.controls').style('display', 'none') // Hide the controls

    // Draw the states
    this.plot.selectAll('path')
      .data(topojson.feature(this.geo, this.geo.objects.states).features)
      .enter().append('path')
      .attr('d', _this.path)
      .attr('class', 'feature') // This class lets us style things like fill/stroke when hovering
  } else if (this.view === 'counties' || this.view === 'tracts') {
    this.refreshDropDown() // Add options from data and onchange functionality to dropdown

    d3.select('.statelabel').style('display', 'block')
    d3.select('.controls').style('display', 'block') // Show the controls

    // append a <g> element for the counties
    var counties = this.plot.append('g')
      .attr('class', 'counties-g')

    // Draw the counties
    counties.selectAll('path')
      .data(topojson.feature(this.geo, this.geo.objects.counties).features)
      .enter().append('path')
      .attr('d', _this.path)
      .attr('class', 'county feature') // Multiple classes allow for multiple styles

    // append a <g> element for the tracts
    var tracts = this.plot.append('g')
      .attr('class', 'tracts-g')

    // Draw the tracts
    tracts.selectAll('path')
      .data(topojson.feature(this.geo, this.geo.objects.tracts).features)
      .enter().append('path')
      .attr('d', _this.path)
      .attr('class', 'tract feature') // Multiple classes allow for multiple styles
  }

  // Assign mouse events to all geographies
  // eslint-disable-next-line no-unused-vars
  var features = this.plot.selectAll('.feature') // Any thing with class 'feature'
    .on('mouseover', tip.show) // Show the tooltip when the mouse is over the feature
    .on('mouseout', tip.hide) // Hide the tooltip when the mouse leaves the feature
    .on('mousedown', tip.hide) // Upon depressing the mouse to click, hide the tooltip
    .on('click', function (d) {
      var el = this
      if (!stateId) { // Completely remove the tip when switching from US to state
        d3.selectAll('.d3-tip').remove()
      }
      _this.clicked(d, el) // Call the 'clicked()' function
    }) //
}

// MyMap method setDimensions
// Ensure the map is filling the available space
MyMap.prototype.setDimensions = function (graphic) {
  // define width, height and margin
  if (graphic === 'mapGraphic') {
    this.mapwidth = this.element.offsetWidth
    this.mapheight = this.element.offsetHeight // Determine desired height here
  } else if (graphic === 'spGraphic') {
    this.width = this.sElement.offsetWidth
    this.height = this.sElement.offsetHeight // Determine desired height here
  }
  this.margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
}

// MyMap method homeButton
// The home <button> is already created in the HTML
// This method adds click functionality
MyMap.prototype.homeButton = function () {
  d3.select('.home-btn')
    .on('click', function () {
      selectedState = undefined
      selectedCounty = undefined
      selectedTract = undefined
      d3.select('.statelabel').style('display', 'none')
      d3.select('.controls').style('display', 'none') // Hide the controls
      document.getElementById('counties_btn').checked = true // Reset the radio button to counties
      document.getElementById('new_btn').checked = true // Reset the radio button to the newYear
      d3.selectAll('.d3-tip').remove() // Remove the tooltip
      d3.select('#scatterplot').select('svg').remove()
      $('#metrics').hide()
      drawUs() // Draw the entire US
    })
}

// MyMap method updateDropDown
// The <select> element is already created in the HTML
// This method populates the select box with the list of options
MyMap.prototype.refreshDropDown = function () {
  _this = this // Store map handle for nested functions

  current = d3.select('.select-drop').property('value')
  // Clear old select box dropdown options
  d3.select('.select-drop')
    .selectAll('option')
    .remove()

  // Load new options
  if (this.view === 'counties') {
    thisData = countyData
  } else if (this.view === 'tracts') {
    thisData = tractData
  }
  d3.select('.select-drop')
    .selectAll('options') // Options don't exist yet, but we're selecting them anyway. d3 is weird.
    .data(Array.from(thisData.get(_this.year).get('max').keys())).enter() // Dynamically assign property list to options
    .append('option')
    .text(function (d) { return d }) // visible text is just set to the csv column header
    .attr('selected', function (d) {
      if (d === current) { // Hard-coding 'prov_density' is not great
        return 'selected' // This sets the default option, other than the first one
      }
    })
    .attr('value', function (d) { return d }) // The 'value' is an attribute separate from the text
}

// MyMap method resetProjection
// Determines and sets map projection
MyMap.prototype.resetProjection = function () {
  // Multiplier to determine how map fits in container.
  var projectionRatio = 1

  this.path = d3.geo.path() // The geo is the full JSON

  if (!stateId) { // If the entire US, just use albersUSA
    this.projection = d3.geo.albersUsa()
      .scale(this.mapwidth * projectionRatio)
      .translate([this.mapwidth / 2, this.mapheight / 2])
  } else { // If an individual state, use the statePlane projections
    this.projection = d3.geo.statePlane(fips2st[stateId],
      this.mapwidth,
      this.mapheight)
  }
  this.path.projection(this.projection) // Actually apply the projection
}

// MyMap method clicked
// Implements functionality when features are clicked
// When a state is clicked, draws the state
// When a county or tract is clicked, zooms
// When a feature is clicked, sets class '.centered'
MyMap.prototype.clicked = function (d, el) {
  if (!stateId) { // If the US map, draw the state that is clicked
    stateId = d.id // Set global stateId to clicked state
    selectedState = d
    d3.select('.statelabel').text(selectedState.properties.NAME)
    drawState(d.id)
  } else {
    // Store county and tract IDs for scatterplot
    if (!('TRACTCE' in d.properties) && ('COUNTYFP' in d.properties)) {
      countyId = d.properties.COUNTYFP
      selectedCounty = d
      d3.select('.statelabel').text(selectedState.properties.NAME + ' - ' +
        selectedCounty.properties.NAME + ' County')
    } else {
      countyId = ''
    }

    if ('TRACTCE' in d.properties) {
      countyId = d.properties.COUNTYFP
      tractId = d.properties.TRACTCE
      selectedTract = d
      if (selectedCounty && (d.properties.COUNTYFP !== selectedCounty.properties.COUNTYFP)) {
        selectedCounty = undefined
      }
      d3.select('.statelabel').text(selectedState.properties.NAME + ' - ' +
        ((selectedCounty) ? selectedCounty.properties.NAME + ' County' : '') +
        ' - Tract ' + selectedTract.properties.NAME)
    } else {
      tractId = ''
    }

    this.drawScatterPlot()
    $('#metrics').show()

    // Load new options
    if (this.view === 'counties') {
      thisData = countyData
    } else if (this.view === 'tracts') {
      thisData = tractData
    }

    // Calls createTheTable with either countyData, if a county is selected, or tractData, if a tract is selected
    if (countyId || tractId) {
      tableData = new Map()
      tableData.set('2016', thisData.get('2016').get(el.__data__.properties.GEOID))
      tableData.set('2011', thisData.get('2011').get(el.__data__.properties.GEOID))
      tableData.set('trend', thisData.get('trend').get(el.__data__.properties.GEOID))

      createTheTable(reshapeTheData(tableData))
    }

    var x, y, k // left, top, zoom

    // Allow for access to this Map's handle in nested functions
    var _this = this

    if (d && _this.centered !== d) { // If the feature clicked is not currently centered
      d3.selectAll('path').classed('centered', false) // clear previous centered element
      var centroid = _this.path.centroid(d) // Calculate the feature centroid
      x = centroid[0]
      y = centroid[1]
      // Use the feature's bounding box to ensure the feature completely fits when zoomed
      k = 0.8 * Math.min(_this.mapwidth / el.getBBox().width, _this.mapheight / el.getBBox().height)
      _this.centered = d // Update the current centered feature in the Map
      d3.select(el).classed('centered', true) // Add the '.centered' class to the feature
      _this.isZoomed = true // Update the current zoomed status
    } else { // If the feature clicked is currently centered, then zoom back out to the full state
      selectedCounty = undefined
      selectedTract = undefined
      d3.select('.statelabel').text(selectedState.properties.NAME)
      x = _this.mapwidth / 2
      y = _this.mapheight / 2
      k = 1
      // Update centered variable, null the centered class, and the zoomed status
      _this.centered = null
      d3.select(el).classed('centered', false)
      _this.isZoomed = false
      d3.select('#scatterplot').select('svg').remove()
      $('#metrics').hide()
    }
    _this.plot.classed('zoomed', _this.isZoomed) // Add '.zoomed' class to the plot
    _this.zoomScale(k, x, y) // Rescale the map with the new settings
  }
}

// MyMap method zoomScale
// Set new scale and translate position and size strokes according to scale.
MyMap.prototype.zoomScale = function (k, x, y) {
  var _this = this

  _this.plot.transition()
    .duration(750)
    .attr('transform', 'translate(' + (_this.mapwidth / 2) + ',' + (_this.mapheight / 2) + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')

  _this.plot.selectAll('.feature')
    .style('stroke-width', (_this.lineStroke / k))
}

// MyMap method setView
// Set view as "counties" or "tracts"
MyMap.prototype.setView = function () {
  var counties = this.plot.select('.counties-g')
  var tracts = this.plot.select('.tracts-g')

  if (this.view === 'counties') {
    counties.style('display', 'inherit') // Show
    tracts.style('display', 'none') // Hide
  } else if (this.view === 'tracts') {
    counties.style('display', 'none') // Show
    tracts.style('display', 'inherit') // Hide
  }
}

// MyMap method update
// Bind data to attributes
MyMap.prototype.update = function () {
  _this = this

  if (stateId) { // If an individual state map has been drawn
    var key = d3.select('.select-drop').property('value') // Get attribute from dropdown
    var bins

    if (this.view === 'counties') {
      thisData = countyData
      gLabel = '.counties-g'
      typeFeature = 'county feature'
    } else if (this.view === 'tracts') {
      thisData = tractData
      gLabel = '.tracts-g'
      typeFeature = 'tract feature'
    }

    // Set color palette from lib/colorbrewer.css
    if (this.year === 'trend') {
      bins = 5 // Number of quantized levels
      colorClass = 'PiYG'
      // Determine whether the min or max has the largest magnitude
      absMax = Math.max(Math.abs(thisData.get(this.year).get('min').get(key)),
        Math.abs(thisData.get(this.year).get('max').get(key)))
      domainArray = [-absMax, absMax]
    } else {
      bins = 6 // Number of quantized levels
      colorClass = 'BuPu'
      domainArray = [thisData.get(this.year).get('min').get(key),
        thisData.get(this.year).get('max').get(key)]
    }

    var scaleQuantize = d3.scale.quantize()
      .domain(domainArray) // establish domain max of attribute
      .range(d3.range(bins).map(function (i) { return 'q' + i + '-' + bins }))

    // Set width/height/margins
    this.setDimensions('mapGraphic')

    // Update svg dimensions
    this.svg.attr('width', this.mapwidth)
    this.svg.attr('height', this.mapheight)

    d3.select('body').attr('class', '') // clear old color
    d3.select('body').classed(colorClass, true)

    var _this = this

    this.plot.selectAll('path')
      .attr('d', _this.path)

    var mapFeatures = this.plot.select(gLabel)

    // Clear old colors by resetting the class to NOT include the colorbrewer class
    mapFeatures.selectAll('path')
      .attr('class', typeFeature)

    // Change the class of each feature
    // qx-b where x is the quantized scale bin and b is the number of bins
    // Combined with the palette class, this actually colors the feature using CSS
    // This is more straightforward than using fill and looking up the hex code
    mapFeatures.selectAll('path').each(
      function (d) {
        d3.select(this).classed(scaleQuantize(thisData.get(_this.year).get(d.properties.GEOID).get(key)), true)
      })

    var colorLegend = d3.legend.color()
      .labelFormat(d3.format(',.2r'))
      .useClass(true)
    // .title(key)
      .scale(scaleQuantize)

    d3.select('.legendQuant')
      .call(colorLegend)
  }
}

// Function drawState
// Wrapper function to provide data to the individual state map
function drawState () {
  // Dynamically create filename from selected state
  var stateJson = 'topojson/2016_' + stateId + '.topo.json'

  // Setup the time radio buttons
  document.getElementById('new_btn').value = newYear
  document.getElementById('new_btn_lbl').innerHTML = newYear
  document.getElementById('old_btn').value = oldYear
  document.getElementById('old_btn_lbl').innerHTML = oldYear

  // Clear old data from county and tract data Map objects
  countyData.get(newYear).clear()
  countyData.get(oldYear).clear()
  countyData.get('trend').clear()
  countyData.get('perc').clear()
  tractData.get(newYear).clear()
  tractData.get(oldYear).clear()
  tractData.get('trend').clear()
  tractData.get('perc').clear()
  pcfiData.get('county').clear()
  pcfiData.get('tract').clear()

  countyData.get(newYear).set('max', new Map()) // Initialize maximum value Map object
  countyData.get(newYear).set('min', new Map()) // Initialize minimum value Map object
  tractData.get(newYear).set('max', new Map()) // Initialize maximum value Map object
  tractData.get(newYear).set('min', new Map()) // Initialize minimum value Map object

  countyData.get(oldYear).set('max', new Map()) // Initialize maximum value Map object
  countyData.get(oldYear).set('min', new Map()) // Initialize minimum value Map object
  tractData.get(oldYear).set('max', new Map()) // Initialize maximum value Map object
  tractData.get(oldYear).set('min', new Map()) // Initialize minimum value Map object

  countyData.get('trend').set('max', new Map()) // Initialize maximum value Map object
  countyData.get('trend').set('min', new Map()) // Initialize minimum value Map object
  tractData.get('trend').set('max', new Map()) // Initialize maximum value Map object
  tractData.get('trend').set('min', new Map()) // Initialize minimum value Map object

  countyData.get('perc').set('max', new Map()) // Initialize maximum value Map object
  countyData.get('perc').set('min', new Map()) // Initialize minimum value Map object
  tractData.get('perc').set('max', new Map()) // Initialize maximum value Map object
  tractData.get('perc').set('min', new Map()) // Initialize minimum value Map object
  pcfiData.get('county').clear()
  pcfiData.get('tract').clear()

  // Asynchronously retrieve geo data and census data
  d3.queue()
    .defer(d3.json, stateJson) // Get state topojson
  // Get NEW county data
    .defer(d3.csv, 'data/county' + newYear.slice(2, 4) + '_data.csv', function (d) {
      loadCounty(d, newYear)
    })
  // Get NEW tract data
    .defer(d3.csv, 'data/tract' + newYear.slice(2, 4) + '_data_' + stateId + '.csv', function (d) {
      loadTract(d, newYear)
    })
  // Get OLD county data
    .defer(d3.csv, 'data/county' + oldYear.slice(2, 4) + '_data.csv', function (d) {
      loadCounty(d, oldYear)
    })
  // Get OLD tract data
    .defer(d3.csv, 'data/tract' + oldYear.slice(2, 4) + '_data_' + stateId + '.csv', function (d) {
      loadTract(d, oldYear)
    })
  // Get county percentile data
    .defer(d3.csv, 'data/county' + newYear.slice(2, 4) + '_perc.csv', function (d) {
      loadCounty(d, 'perc')
    })
  // Get tract percentile data
    .defer(d3.csv, 'data/tract' + newYear.slice(2, 4) + '_perc_' + stateId + '.csv', function (d) {
      loadTract(d, 'perc')
    })
  // Get county pcfi data
    .defer(d3.csv, 'data/county' + newYear.slice(2, 4) + '_pcfi_' + stateId + '.csv', function (d) {
      loadPCFI(d, 'county')
    })
  // Get tract pcfi data data
    .defer(d3.csv, 'data/tract' + newYear.slice(2, 4) + '_pcfi_' + stateId + '.csv', function (d) {
      loadPCFI(d, 'tract')
    })
    .await(readyState) // Once all of the data is in, run the readyState() function
}

function loadCounty (d, year) { // d is the csv data brought in as an Object
  var countyId = '' // Initialize countyId
  // Assign county value from row in CSV
  if (d.county.length < 5) { // CSV doesn't have leading zeros, so add if GEOID short
    countyId = '0' + d.county
  } else {
    countyId = d.county
  }
  // Only keep data that is for the currently drawn state
  if (countyId.slice(0, 2) === stateId) {
    countyData.get(year).set(countyId, new Map()) // Initialize county Map object

    Object.keys(d).forEach(function (key) { // For each key (header) this is gets the values from one row
      if (key !== 'tract' && key !== 'county' && key !== 'State' && // Don't include county column, because it's already captured in countyId
      !(key === ' MH Providers per 1000 Pop.' && year === oldYear) && // Don't include prov_density in the oldYear
      !(key === 'MH Provider Count' && year === oldYear) && // Don't include prov_density in the oldYear
      !(key === '% Insured' && year === oldYear) && // Don't include prov_density in the oldYear
      key !== 'Latitude' && key !== 'Longitude') {
        var newVal = parseFloat(d[key]) // convert value from string to float

        countyData.get(year).get(countyId).set(key, newVal) // assign key/value pair to county's Map object

        // Determine max/min of this column
        // If this is the initial iteration, max/min will be undefined
        if (typeof countyData.get(year).get('max').get(key) === 'undefined') {
          countyData.get(year).get('max').set(key, newVal) // Set initial value for maximum
        }
        if (typeof countyData.get(year).get('min').get(key) === 'undefined') {
          countyData.get(year).get('min').set(key, newVal) // Set initial value for maximum
        }

        // Determine max and min for each attribute
        var oldMax = countyData.get(year).get('max').get(key)
        var oldMin = countyData.get(year).get('min').get(key)

        // Compare old max/min with new value and adjust accordingly
        if (oldMax < newVal) {
          countyData.get(year).get('max').set(key, newVal)
        }
        if (oldMin > newVal) {
          countyData.get(year).get('min').set(key, newVal)
        }
      }
    })
  }
}

function loadTract (d, year) {
  var tractId = '' // Initialize tractId
  // Assign tract value from row in CSV
  if (d.tract.length < 11) { // CSV doesn't have leading zeros, so add if GEOID short
    tractId = '0' + d.tract
  } else {
    tractId = d.tract
  }
  // Only keep data that is for the currently drawn state
  if (tractId.slice(0, 2) === stateId) {
    tractData.get(year).set(tractId, new Map()) // Initialize tract Map object

    Object.keys(d).forEach(function (key) { // For each key (header) this is gets the values from one row
      if (key !== 'tract' && key !== 'County' && key !== 'State' && // Don't include county column, because it's already captured in countyId
      !(key === 'MH Provider per 1000 Pop.' && year === oldYear) && // Don't include prov_density in the oldYear
      !(key === 'MH Provider Count' && year === oldYear) && // Don't include prov_density in the oldYear
      !(key === '% Insured' && year === oldYear) && // Don't include prov_density in the oldYear
      key !== 'Latitude' && key !== 'Longitude') {
        var newVal = parseFloat(d[key]) // convert value from string to float

        tractData.get(year).get(tractId).set(key, newVal) // assign key/value pair to tract's Map object

        // Determine max/min of this column
        // If this is the initial iteration, max/min will be undefined
        if (typeof tractData.get(year).get('max').get(key) === 'undefined') {
          tractData.get(year).get('max').set(key, newVal) // Set initial value for maximum
        }
        if (typeof tractData.get(year).get('min').get(key) === 'undefined') {
          tractData.get(year).get('min').set(key, newVal) // Set initial value for maximum
        }

        // Determine max and min for each attribute
        var oldMax = tractData.get(year).get('max').get(key)
        var oldMin = tractData.get(year).get('min').get(key)

        // Compare old max/min with new value and adjust accordingly
        if (oldMax < newVal) {
          tractData.get(year).get('max').set(key, newVal)
        }
        if (oldMin > newVal) {
          tractData.get(year).get('min').set(key, newVal)
        }
      }
    })
  }
}

function loadPCFI (d, level) { // d is the csv data brought in as an Object
  // Already filtered by state, so keep all rows.

  pcfiData.get(level).set(d.PC, new Map()) // Initialize county Map object

  Object.keys(d).forEach(function (key) { // For each key (header) this is gets the values from one row
    if (key !== 'PC') { // Don't include county column, because it's already captured in countyId
      var newVal = parseFloat(d[key]) // convert value from string to float
      pcfiData.get(level).get(d.PC).set(key, newVal) // assign key/value pair to county's Map object
    }
  })
}

// Function getTrend
// From the newYear and oldYear, create trend dataset for countyData and tractData
function getTrend (topoData) {
  // Subtract data when the attribute exists in both years
  // For each topoId
  for (let topoId of topoData.get(newYear).keys()) {
    // Not including the max and min for the newYear
    if (topoId !== 'max' && topoId !== 'min') {
      // Set an empty map for the topo
      topoData.get('trend').set(topoId, new Map())
      // For each attribute
      for (let attr of topoData.get(newYear).get(topoId).keys()) {
        // Manually prevent `prov_density` trend
        if (attr !== 'prov_density') {
          // If the topoId and attr are also in oldYear
          if (typeof topoData.get(oldYear).get(topoId) !== 'undefined' &&
          typeof topoData.get(oldYear).get(topoId).get(attr) !== 'undefined') {
            diff = topoData.get(newYear).get(topoId).get(attr) -
            topoData.get(oldYear).get(topoId).get(attr)
            // Set the trend value for the attribute to the difference
            topoData.get('trend').get(topoId).set(attr, diff)

            // Determine max/min of this attribute
            // If this is the initial iteration, max/min will be undefined
            if (typeof topoData.get('trend').get('max').get(attr) === 'undefined') {
              topoData.get('trend').get('max').set(attr, diff) // Set initial value for maximum
            }
            if (typeof topoData.get('trend').get('min').get(attr) === 'undefined') {
              topoData.get('trend').get('min').set(attr, diff) // Set initial value for maximum
            }

            // Determine max and min for each attribute
            var oldMax = topoData.get('trend').get('max').get(attr)
            var oldMin = topoData.get('trend').get('min').get(attr)

            // Compare old max/min with new value and adjust accordingly
            if (oldMax < diff) {
              topoData.get('trend').get('max').set(attr, diff)
            }
            if (oldMin > diff) {
              topoData.get('trend').get('min').set(attr, diff)
            }
          }
        }
      }
    }
  }
}

// Function readyState
// Build new individual state map
// add click functionality for radio buttons
// allow for update on resize
function readyState (error, state) {
  if (error) throw error

  // create trend data set

  getTrend(countyData)
  getTrend(tractData)

  // create new State Map using Map constructor
  // eslint-disable-next-line no-unused-vars
  var theMap = new MyMap({
    element: document.querySelector('nav'), // map lives in nav div
    geo: state,
    view: 'counties',
    year: newYear,
    sElement: document.querySelector('#scatterplot')
  })

  document.getElementById('counties_btn').checked = true // Reset the radio button to counties
  document.getElementById('new_btn').checked = true // Reset the radio button to newYear

  // Set radio toggle for view state
  d3.select('.level').selectAll('input')
    .on('click', function () {
      theMap.view = d3.select(this).attr('value')
      theMap.setView()
      theMap.refreshDropDown()
      theMap.update()
    })

  // Set radio toggle for year selection
  d3.select('.time').selectAll('input')
    .on('click', function () {
      theMap.year = d3.select(this).attr('value')
      theMap.setView()
      theMap.refreshDropDown()
      theMap.update()
    })

  // redraw Map on each resize
  d3.select(window).on('resize', function () {
    theMap.update()
  })
}

// MyMap method drawScatterPlot
MyMap.prototype.drawScatterPlot = function () {
  // Note: This code has been adapted from a tutorial by Scott Murray at:
  // http://alignedleft.com/tutorials/d3
  _this = this

  // Set width/height/margins
  this.setDimensions('spGraphic')

  // Not sure what this does
  this.sElement.innerHTML = ''

  // Adds the svg to the map area
  scattersvg = d3.select(this.sElement).append('svg')

  // Sizes svg to fit the map area
  this.sElement.style.width = this.width
  scattersvg.attr('width', this.width)
  scattersvg.attr('height', this.height)

  var w = this.width
  var h = this.height
  var padding = 45
  var fontSize = 14

  // Generate datapoints
  var dataset = []
  if (countyId === '') {
    thisData = ''
  } else if (tractId === '') {
    thisData = countyData
    pcData = pcfiData.get('county')
  } else {
    thisData = tractData
    pcData = pcfiData.get('tract')
  }

  if (thisData !== '') {
    percArray = Array.from(thisData.get('perc').get(stateId + countyId + tractId))
    pcfiArray = Array.from(pcData.get('0'))
    for (var i = 0; i < percArray.length; i++) {
      dataset.push([pcfiArray[i][1], percArray[i][1], i + 1])
    }
  }

  var xScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return Math.abs(d[0]) })])
    .range([padding, (w - padding * 2) * 2.0 / 3.0])

  var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return d[1] })])
    .range([h - padding, padding])

  // http://www.d3noob.org/2016/08/changing-number-of-ticks-on-axis-in.html
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(5)

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')

  scattersvg.selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('cx', function (d) {
      return xScale(Math.abs(d[0])) // Centering rect
    })
    .attr('cy', function (d) {
      return yScale(d[1]) // Centering rect
    })
    .attr('r', 5)
    .attr('id', function (d) { return d[2] })
    .attr('fill', function (d) {
      if (d[0] > 0) {
        return 'green'
      } else {
        return 'red'
      }
    })
    .attr('stroke', function (d) {
      if (d[0] > 0) {
        return 'green'
      } else {
        return 'red'
      }
    })
    .on('mouseover', pcMouseover)
    .on('mouseout', pcMouseout)

  // Handle bar mouseover and mouseout events
  function pcMouseover (d) {
    d3.select(this)
      .attr('r', 10)
    showPComp(this.id)
  }

  function pcMouseout (d) {
    d3.select(this)
      .attr('r', 5)
    scattersvg.selectAll('.pcomp').remove()
  }

  // Add list of PC compositions
  function showPComp (pc) {
    // Clear any existing pcomp elements
    scattersvg.selectAll('.pcomp').remove()

    // Load and sort appropriate PC data
    sortedPcomps = Array.from(pcData.get(pc.toString()))
    sortedPcomps.sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]) })

    scattersvg.append('text')
      .text('Largest Components of PC #' + pc.toString())
      .attr('class', 'pcomp')
      .attr('x', w * 1.9 / 3.0)
      .attr('y', 1.9 * padding)
      .attr('font-family', 'sans-serif')
      .attr('font-size', fontSize + 'px')

    if (pcfiArray[pc - 1][1] > 0) {
      association = 'more'
    } else {
      association = 'fewer'
    }

    scattersvg.append('text')
      .text('... is predictive of ' + association + ' providers per capita.')
      .attr('class', 'pcomp')
      .attr('x', w * 1.9 / 3.0)
      .attr('y', 5.0 * padding)
      .attr('font-family', 'sans-serif')
      .attr('font-size', (fontSize - 2) + 'px')

    for (var i = 0; i < 5; i++) {
      if (sortedPcomps[i][1] > 0) {
        effect = 'Higher '
      } else {
        effect = 'Lower '
      }

      var phrase

      if (i === 0) {
        phrase = '  ' + effect + sortedPcomps[i][0] + '  (' + d3.format(',.3r')(sortedPcomps[i][1]) + ')'
      } else {
        phrase = '+ ' + effect + sortedPcomps[i][0] + '  (' + d3.format(',.3r')(sortedPcomps[i][1]) + ')'
      }

      scattersvg.append('text')
        .text(phrase)
        .attr('class', 'pcomp')
        .attr('x', w * 1.9 / 3.0)
        .attr('y', 2.5 * padding + 20 * i)
        .attr('font-family', 'sans-serif')
        .attr('font-size', (fontSize - 2) + 'px')
    }
  }

  scattersvg.append('g')
    .attr('class', 'axis') // Assign "axis" class
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .call(xAxis)

  scattersvg.append('g')
    .attr('class', 'axis') // Assign "axis" class
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis)

  scattersvg.selectAll('.axis text')
    .attr('font-size', (fontSize - 2) + 'px')

  scattersvg.append('text')
    .text('Relevance for predicting provider density')
    .attr('x', w / 3.0)
    .attr('y', h - 4)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '18px')
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'baseline')

  scattersvg.append('text')
    .text('Percentile within state')
    .attr('x', 15)
    .attr('y', h / 2.0)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '18px')
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'baseline')
    .attr('transform', 'rotate(' + -90 + ',' + 15 + ',' + h / 2.0 + ')')
}

// Function drawUS
// Wrapper to provide entire US info for draw
function drawUs () {
  // Get US topojson
  d3.json('topojson/us2016.topo.json', function (error, us) {
    if (error) throw error
    // create new US Map using Map constructor
    stateId = '' // Set global stateId to empty string '' to indicate entire US
    countyId = ''
    tractId = ''
    // eslint-disable-next-line no-unused-vars
    var theMap = new MyMap({
      element: document.querySelector('nav'),
      geo: us,
      view: 'states',
      year: newYear,
      sElement: document.querySelector('#scatterplot')
    })
  })
}

// Function reshapeTheData
// Reshapes the data into a "spread" table
// https://tidyr.tidyverse.org/reference/spread.html
// The keys become a column "attribute"
// The other columns are the first-level Map() keys
// The values get placed where they belong
function reshapeTheData (gatheredData) {
  colNames = ['Attributes'].concat(Array.from(gatheredData.keys())) // Initialize with attributes
  s1 = new Set(gatheredData.get(colNames[1]).keys())
  s2 = new Set(gatheredData.get(colNames[2]).keys())
  rowNames = Array.from(new Set([...s1, ...s2]))
  tableArray = []
  rowNames.forEach(function (r, ir) {
    tableArray[ir] = [r]
    for (i = 1; i < 4; i++) {
      if (gatheredData.get(colNames[i]).get(r)) {
        rc = d3.format(',.5r')(gatheredData.get(colNames[i]).get(r))
      } else {
        rc = NaN
      }
      tableArray[ir].push(rc)
    }
  })
  return tableArray
}

// --------- table code --------
function createTheTable (someData) {
  d3.select('#metrics').attr('display', 'block')
  theTable = $(document).ready(function () { // https://datatables.net/examples/data_sources/js_array.html
    $('#metrictable').DataTable({
      destroy: true,
      data: someData,
      columns: [
        { title: 'Attribute' },
        { title: '2016' },
        { title: '2011' },
        { title: 'Trend' }
      ],
      scrollY: '250px',
      scrollCollapse: true,
      paging: false,
      info: false
    })
  })
}

drawUs() // The first function call to kick it off with the entire US map
