
// Set up svg
var svgWidth = 980;
var svgHeight = 600;

var margin = {
  top: 10,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Append a div to the body to create tool tips, assign it a class
d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Import Data
d3.csv("/assets/data/data.csv").then(function(healthData) {
  
//console.log(healthData)
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });
 
    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear().range([0, width]);
    var yLinearScale = d3.scaleLinear().range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xMin;
    var xMax;
    var yMin;
    var yMax;

    xMin = d3.min(healthData, function (data) {
       return +data.healthcare;
    });
 
    xMax = d3.max(healthData, function (data) {
      return +data.healthcare;
    });

    yMin = d3.min(healthData, function (data) {
      return +data.poverty;
    });

    yMax = d3.max(healthData, function (data) {
      return +data.poverty;
   });
  
   xLinearScale.domain([0, xMax]).nice();
   yLinearScale.domain([0, yMax]).nice();
   console.log(xMin);
   console.log(yMax);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.healthcare))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", "12")
    .attr("fill", "blue")
    .attr("opacity", ".2")
    .on("mouseenter", function(data) {
      toolTip.show(data);
    })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(data) {
        var stateName = data.state;
        var pov = +data.poverty;
        var hcare = +data.healthcare;
        return (
            stateName + '<br> Healthcare ' + hcare +'%' +  '<br> Poverty: ' + pov
        );

      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
    .style("font-size", "12px")
    .selectAll("tspan")
    .data(healthData)
    .enter()
    .append("tspan")
        .attr("x", function(data) {
            return xLinearScale(data.healthcare -0.3);
        })
        .attr("y", function(data) {
            return yLinearScale(data.poverty - 0.2);
        })
        .text(function(data) {
            return data.abbr
        });

    chartGroup.append("text")    
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Poverty (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

})
.catch(function(err) { console.log(err); });
