
//variables for width, height and margin (for axes)
const width = window.innerWidth *0.7;
const height = 500;
margin = 50;

//loading data...this is modified squirrel data
d3.csv('squirreldata.csv', d3.autoType)
.then(data => {
  console.log("data", data)

  /* ADDING SCALES */
  // yscale - categorical variable: activity
  const yScale = d3.scaleBand()
    .domain(data.map(d=> d.activity))
    .range([0, height])
    .paddingInner(.4)

    // xscale - linear:count
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d=> d.count)])
    .range([width,0])


  // adding svg HTML element
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // adding bars
  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("height", yScale.bandwidth())
    .attr("width", d=> width - xScale(d.count)) 
    .attr("x", d=>margin)
    .attr("y", d=> yScale(d.activity))
  
//adding y axis

const yAxis = (g) => g
  .call(d3.axisLeft(yScale))

//appending y axis so it's visible
 svg.append("g")
    .style("transform", `translate(${margin}px, 0px)`)
    .call(yAxis)

})


