 /* CONSTANTS AND GLOBALS */
const width = window.innerWidth *0.7 ,
  height = window.innerHeight *0.7,
  margin = {top: 20, left: 60, bottom: 60, right: 20};

/* LOAD DATA */
d3.csv('syracuse_population.csv', d=>{
  return{
    year: new Date(+d.year,0,1),
    population: +d.population
  }
}).then(data => {
  console.log("data", data);

  // SCALES
const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.year))
    .range([margin.left,width-margin.right])

const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.population))
    .range([height-margin.bottom,margin.top])
  

// CREATE SVG ELEMENT
const svg = d3.select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// BUILD AND CALL AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

  svg
    .append("g")
    .style("transform", `translate(0px, ${height-margin.bottom}px)`) // translate axis to bottom
    .call(xAxis)
  svg
    .append("g")
    .style("transform", `translate(${margin.left}px, 0px)`) // translate axis to bottom
    .call(yAxis)


//AREA SHADING
  const area = d3.area()
  .x(d => xScale(d.year))
  .y0(height-margin.bottom)
  .y1(d => yScale(d.population))

  svg.append("path")
    .data(data)
    .attr("class", "area")
    .attr("d", area(data))
    .attr("fill","blue")
  
// LINE GENERATOR FUNCTION
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.population))

  
// DRAW LINE
const line = svg.selectAll(".line")
  .data([data])
  .join("path")
  .attr("class","line")
  .attr("d",d=>lineGen(d))
  .attr("stroke","black")
  .attr("fill","none")



});