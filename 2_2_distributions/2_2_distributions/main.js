
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 5;

/* LOAD DATA */
d3.csv('heightweightdata.csv', d3.autoType).then(data => {
  console.log("data",data)


  /* SCALES */
  const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.weightval))
  .range([margin.left,width-margin.right])

const yScale = d3.scaleLinear()
  .domain(d3.extent(data, d=>d.heightval))
  .range([height-margin.bottom,margin.top])

const colorScale = d3.scaleOrdinal()
//unique BMI values in the dataset  
.domain("15","16","17","18","19","20","21","22","23")
//lower BMIs are blue, middle BMIs are red, and higher BMIs are green  
.range(["Blue","Blue","Blue","Red","Red","Red","Green","Green","Green"])
  
const ageScale = d3.scaleLinear()
    .domain([0,d3.max(data.map(d => d.age))])
    .range([0,100])
  /* HTML ELEMENTS */
  // svg
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // axis scales
  const xAxis = d3.axisBottom(xScale)
  svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale)
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // circles
  const dot = svg
    .selectAll("circle")
    .data(data, d => d.rowID) // second argument is the unique key for that row
    .join("circle")
    .attr("cx", d => xScale(d.weightval))
    .attr("cy", d => yScale(d.heightval))
    //size of dots is dependent on age. larger dots == older person
    .attr("r",  d=>ageScale(d.age)/10)
    //fill of dots is dependent on BMI (key on page)
    .attr("fill", d => colorScale(d.bmi))
  
//adding axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Height (in)");
  
  svg.append("text")
    .attr("transform",`translate(0,${height})`)
    .attr("transform",`translate(${width/2},${height-margin.bottom/2})`)
    .style("text-anchor", "middle")
    .text("Weight (lbs)");
});