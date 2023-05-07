/**
 * CONSTANTS AND GLOBALS
 * */



//for map
let svg;
//for line graph
let svg2;
//for bar chart
let svg3;
//for scatter plot
let svg4;



//for line graph
let xScale;
let yScale;
let yAxis;
let xAxisGroup;
let yAxisGroup;



//for bar chart
let barxScale;
let baryScale;
let posbarxAxis;
let negbarxAxis;
let barxAxisGroup;
let baryAxis;
let baryAxisGroup;



const width = window.innerWidth*0.7,
  height = window.innerHeight*0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 }



let linestate = {
    data: [],
    selection: "National", // + YOUR FILTER SELECTION
  };

  let barDemo = {
    data:[],
    selection: "Select the Demographic Group...",
  }

let funddata = {
    data:[],
  }

let state = {
    //define with empty array
    geojson: [],
    hover: {
       
        StateName: null,
        LearningLossMetric:null,
    }

}

;
/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
    d3.json("usState.json"),
    //FORMAT THIS TO RETURN AN ARRAY OBJECT
    d3.csv("linechart.csv"),
    d3.csv("scoreData.csv"),
    d3.csv("funddata.csv")])
    .then(([geojson,csv,csv3,csv4]) => {
    //pass the geojson data (usState.json) into the empty array in the state object
    state.geojson = geojson;
    //pass the csv file (linechart.csv) into the empty "data" array in side linestate object
    linestate.data = csv;
    //pass the csv file (scoreData.csv) into the empty "data" array in side bardemo object
    barDemo.data =csv3;
     //pass the csv file (funddata.csv) into the empty "data" array in side funddata object
    funddata.data =csv4;
    
    init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 

//CHART 1: MAP

//Add SVG
svg= d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height",height)
    .attr("id","map")

//create projection
const projection = d3.geoAlbersUsa().fitSize([width,height],state.geojson)

//create geopath
const geoPath = d3.geoPath(projection)

//add colorscale
const mapcolorScale = d3.scaleOrdinal()
  .domain([-13,0])
  .range(d3.schemeReds[9])
  
//draw the map
svg.selectAll(".state")
    .data(state.geojson.features)
    .join("path")
    .attr("class","state")
    .attr("d",d => geoPath(d))
   //I know what the problem is....since the data for the outline is pulling from features (the coordinates) and the fill needs to pull from features it's not pulling correctly 
    .attr('fill', function(d) {
      return mapcolorScale(d=>d.state.geojson.properties.LEARNINGLOSS);
    })
  

//add interactivity, use method "mouse over" for hover
.on("mouseover",(event,d) =>{
        state.hover.LearningLossMetric = d.properties.LEARNINGLOSS
        state.hover.StateName = d.properties.NAME
        draw();
    })


//-------------------------------------------------------------------------//

// CHART 2: LINE CHART 

// + SCALES
    xScale = d3.scaleLinear()
        .domain(d3.extent(linestate.data, d => d.testyear))
        .range([margin.right, width - margin.left])
      
    yScale = d3.scaleLinear()
        .domain(d3.extent(linestate.data, d => d.avgscalescore))
        .range([height - margin.bottom, margin.top])
      
// + AXES
    const xAxis = d3.axisBottom(xScale).ticks(3)
    yAxis = d3.axisLeft(yScale)

    
      
// Dropdown Menu
  const selectElement = d3.select("#dropdown")
      
// add in dropdown options
    selectElement.selectAll("option")
    .data([
      "Select a state",
      // adding in all the unique values from the dataset
      ...new Set(linestate.data.map(d => d.state))])
        .join("option")
        .attr("attr", d => d)
        .text(d => d)

    selectElement.on("change", event => {
        linestate.selection = event.target.value
        draw();
        });

//Add linechart SVG
    svg2 = d3.select("#container2")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id","linechart")
      
// Call axes and add labels
    xAxisGroup = svg2.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(xAxis)
      
    xAxisGroup.append("text")
        .attr("class", 'xLabel')
        .attr("transform", `translate(${width / 2}, ${100})`)
        .text("Test Year")
      
    yAxisGroup = svg2.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.right}, ${0})`)
        .call(yAxis)
      
    yAxisGroup.append("text")
        .attr("class", 'yLabel')
        .attr("transform", `translate(${-45}, ${height / 2})`)
        .attr("writing-mode", 'vertical-rl')
        .text("Score")


 

 //legend  
   svg2.append("circle").attr("cx",200).attr("cy",130).attr("r", 5).style("fill", "Black")
   svg2.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "Red")
   svg2.append("text").attr("x", 220).attr("y", 130).text("National Average").style("font-size", "15px").attr("alignment-baseline","middle")

   svg2.append("text")
      .attr("x", 220)
      .attr("y", 160)
      .text("Selected State")
      .style("font-size", "15px")
      .attr("alignment-baseline","middle")
      .attr("id","#oldSelection")

  const natfilteredData = linestate.data
      .filter(d => d.state === "National")
  // specify line generator function
  const natlineGen = d3.line()
      .x(d => xScale(d.testyear))
      .y(d => yScale(d.avgscalescore))
  
    // + DRAW LINE 
    svg2.selectAll(".natline")
      .data([natfilteredData]) // data needs to take an []
      .join("path")
      .attr("class", 'natline')
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("d", d => natlineGen(d))

//-------------------------------------------------------------------------//


//CHART 3: BAR CHART

barxScale = d3.scaleBand()
 .domain(barDemo.data.map(function(d) { return d.demographic; }))
 .range([margin.right, width - margin.left])
 .paddingInner(.1)


baryScale = d3.scaleLinear()
 .domain([-25,25])
 .range([height - margin.bottom, margin.top])

// + AXES

posbarxAxis = g => g
    .attr("transform", `translate(0,${height / 2})`)
    .call(d3.axisBottom(barxScale))
    .selectAll('g.tick')

negbarxAxis = g => g
    .attr("transform", `translate(0,${height / 2})`)
    .call(d3.axisTop(barxScale))
    .selectAll('g.tick')

baryAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(baryScale))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .text(barDemo.data.scoreDiff))


//I CAN'T COMMENT THIS OUT FOR SOME REASON????
const selectDemoElement = d3.select("#dropdown2")

// add in dropdown options from the unique values in the data
selectDemoElement.selectAll("option")
 .data([
   // manually add the first value
   "By Race","By Lunch Program Eligibilty"]
)
 .join("option")
 .attr("attr", d => d)
 .text(d => d)

// + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
selectDemoElement.on("change", event => {
 barDemo.selection = event.target.value
 draw();
});




    // + CREATE SVG ELEMENT
  svg3 = d3.select("#container3")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id","barchart")

  // + CALL AXES
  barxAxisGroup = svg3.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`)
    .attr("transform", "rotate(-65)")
    .call(posbarxAxis)
    .call(negbarxAxis)
    


  baryAxisGroup = svg3.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.right}, ${0})`)
    .call(baryAxis)


//adding axis labels
svg3.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin)
.attr("x",0 - (height / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Learning Loss");

svg3.append("text")
.attr("transform",`translate(0,${height})`)
.attr("transform",`translate(${width/2},${height-margin.bottom/2})`)
.style("text-anchor", "middle")
.text("Demographic Group");







//-------------------------------------------------------------------------//

//SCATTER PLOT
 /* SCALES */
 const scatterxScale = d3.scaleLinear()
 .domain([150,1400])
 .range([margin.left,width-margin.right])

const scatteryScale = d3.scaleLinear()
 .domain([-15,0])
 .range([height-margin.bottom,margin.top])

 
 /* HTML ELEMENTS */
 // svg
 const svg4 = d3.select("#container4")
   .append("svg")
   .attr("width", width)
   .attr("height", height)
   .attr("id","scatterplot")

 // axis scales
 const scatterxAxis = d3.axisBottom(scatterxScale)
 svg4.append("g")
//  .attr("transform", `translate(0,${height - margin.bottom})`)
 .call(scatterxAxis);
 
 const scatteryAxis = d3.axisLeft(scatteryScale)
 svg4.append("g")
   .attr("transform", `translate(${margin.left},0)`)
   .call(scatteryAxis);


// create a tooltip
const tooltip = d3.select("#container4")
  .append("div")
    .attr("class", "tooltip");

// tooltip events
const mouseover = function(d) {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "#EF4A60")
        .style("opacity", .5)
};
const mousemove = function(event,d) {
    const f = d3.format(",");
    tooltip
    .html("<div><b>State:</b> " +(d.State)+ "</div><div><b>% Utilized:</b> "+ f(d.PercentUtilized) +"</div>")
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
};
const mouseleave = function(d) {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 1)
};



 // circles
  
 const dot = svg4
   .selectAll("circle")
   .data(funddata.data, d => d.rowID) // second argument is the unique key for that row
   .join("circle")
   .attr("cx", d => scatterxScale(d.FundsPerCapita))
   .attr("cy", d => scatteryScale(d.LearningLoss))
   .attr("r", "10")
  .attr("fill", d=>d.Fill)
  .on("mouseover", mouseover )
  .on("mousemove", mousemove )
  .on("mouseleave", mouseleave )



//adding axis labels
 svg4.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin)
   .attr("x",0 - (height / 2))
   .attr("dy", "1em")
   .style("text-anchor", "middle")
   .text("Learning Loss");
 
 svg4.append("text")
   .attr("transform",`translate(0,${height})`)
   .attr("transform",`translate(${width/2},${height-margin.bottom/2})`)
   .style("text-anchor", "middle")
   .text("Funds Per Capita");
 //legend  
 svg4.append("circle").attr("cx",200).attr("cy",130).attr("r", 10).style("fill", "#8B0000")
 svg4.append("text").attr("x", 220).attr("y", 130).text("<55% Funds Utilized").style("font-size", "15px").attr("alignment-baseline","middle") 
 svg4.append("circle").attr("cx",200).attr("cy",160).attr("r", 10).style("fill", "#ffcccb")
 svg4.append("text").attr("x", 220).attr("y", 160).text("55% - 70% Funds Utilized").style("font-size", "15px").attr("alignment-baseline","middle") 
 svg4.append("circle").attr("cx",200).attr("cy",190).attr("r", 10).style("fill", "#3cb371")
 svg4.append("text").attr("x", 220).attr("y", 190).text(">70% Funds Utilized").style("font-size", "15px").attr("alignment-baseline","middle") 

 .on("mouseover",(event,d) =>{
  funddata.hover.State = d.State
  funddata.hover.FundsUtilized = d.PercentUtilized
  draw();
})
    
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */

function draw() {
    
 //Hover interaction on Map 
    const hoverBox = d3.select("#hover-content")
    const hoverData = Object.entries(state.hover)
    hoverBox.selectAll("div.row")
        .data(hoverData)
        .join("div")
        .attr("class","row")
        .html(d => d)



//Update state line on line chart...
const filteredData = linestate.data
    .filter(d => d.state === linestate.selection)
// specify line generator function
const lineGen = d3.line()
    .x(d => xScale(d.testyear))
    .y(d => yScale(d.avgscalescore))

  // + DRAW LINE 
  svg2.selectAll(".line")
    .data([filteredData]) // data needs to take an []
    .join("path")
    .attr("class", 'line')
    .transition()
    .duration(500)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("d", d => lineGen(d))



//update and rects
// Update the data by linestate selection
const barfilteredData = barDemo.data
    .filter(d => d.state === linestate.selection)

svg3.append("g")
  .attr("fill", "black")
  .selectAll("rect")
  .data(barfilteredData.map(d => d.scoreDiff > 0 ? d : {scoreDiff: 0}))
  .join(
    enter =>enter.append("rect")
    .attr("x", d=>barxScale(d.demographic))
    .attr("y", d => baryScale(d.scoreDiff))
    .attr("height", d => baryScale(0) - baryScale(d.scoreDiff))
    .attr("width", barxScale.bandwidth())
    .transition()
    .duration(500)
    .call(sel=>sel.transition().duration(500).attr("x", d=>barxScale(d.demographic)))

,
    update=>update

,
    exit => exit
      .call(sel =>sel
      .attr("opacity",1)
      .transition()
      .duration(500)
      .attr("opacity",0)
      .remove())
 

  );


// Negative values
svg3.append("g")
  .attr("fill", "rgba(128, 0, 0, 0.1)")  // red, but just not too bright
  .selectAll("rect")
  .data(barfilteredData.map(d => d.scoreDiff < 0 ? d : {scoreDiff: 0}))
  .join(
   
    enter =>enter.append("rect")
    
    .attr("x", d=>barxScale(d.demographic))
    .attr("y", d => baryScale(0))
    .attr("height", d => baryScale(0) - baryScale(-d.scoreDiff))
    .attr("width", barxScale.bandwidth())
    .transition()
    .duration(500)
    .call(sel=>sel.transition().duration(500).attr("x", d=>barxScale(d.demographic)))
,
    update=>update
,

exit => exit
.call(sel =>sel
  .attr("opacity",1)
  .transition()
  .duration(500)
  .attr("opacity",0)
  .remove())
  

);



 
}