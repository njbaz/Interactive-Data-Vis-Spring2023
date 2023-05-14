/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };


//UPDATE - add hover feature
let hover = {
    State: null,
}
//LOADING DATA
 Promise.all([
  d3.json("usState.json"),
  d3.csv("usHeatExtremes.csv", d3.autoType),
]).then(([geojson, usHeatExtremes]) => {

  // INSPECT DATA
  console.log('geojson', geojson)
  console.log('usHeatExtremes', usHeatExtremes)

  // APPEND SVG
  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)


  // SPECIFY PROJECTION
  const projection = d3.geoAlbersUsa()
    .fitSize([width, height], geojson)
 

  // DEFINE PATH FUNCTION
  const pathGen = d3.geoPath(projection)


  svg.append
  // APPEND GEOJSON PATH  
  const states = svg.selectAll("path.states")
    .data(geojson.features)
    .join("path")
    .attr("class", "states")
    .attr("d", coords => pathGen(coords))
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .on("mouseover",(event,d) =>{
      hover["State"] = d.properties.NAME
  draw();
})
  // ADDED JUST THE MOST EXTREME CHANGE FOR EACH STATE. SOME HAD JUST 0 FOR THE CHANGE VALUES SO THOSE STATES WERE OMITTED
  //I ADDED A COLUMN TO THE DATA SET THAT DETERMINES THE FILL (GREEN FOR A NEGATIVE EXTREME, RED FOR A POSITIVE EXTREME)
  
  const dotcolorScale = d3.scaleLinear()
  .domain(d3.extent(usHeatExtremes, d => d.LargestNetChange))
  .range(["green","red"])
  
  const heatCircles = svg.selectAll("circle.LargestNetChange")
    .data(usHeatExtremes)
    .join("circle")
    .attr("class", "change")
    .attr("r", 5)
    .attr("fill", function(d) {
      return dotcolorScale(d.LargestNetChange);})
    .attr("transform", (d) => {
      const [x, y] = projection([d.longitudeOfLargestChange, d.latitudeOfLargestChange])
      return `translate(${x}, ${y})`
    })

});


function draw() {
    
  //UPDATE HOVERBOX CONTENT ABOVE THE MAP
     const hoverBox = d3.select("#hover-content")
     const hoverData = Object.entries(hover)
    console.log(hoverData)
     hoverBox.selectAll("div.row")
         .data(hoverData)
         .join("div")
         .attr("class","row")
         .html(d => d)


}