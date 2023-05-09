/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };


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


  // APPEND GEOJSON PATH  
  const states = svg.selectAll("path.states")
    .data(geojson.features)
    .join("path")
    .attr("class", "states")
    .attr("d", coords => pathGen(coords))
    .attr("fill", "transparent")
    .attr("stroke", "black")

  
  // ADDED JUST THE MOST EXTREME CHANGE FOR EACH STATE. SOME HAD JUST 0 FOR THE CHANGE VALUES SO THOSE STATES WERE OMITTED
  //I ADDED A COLUMN TO THE DATA SET THAT DETERMINES THE FILL (GREEN FOR A NEGATIVE EXTREME, RED FOR A POSITIVE EXTREME)
  const heatCircles = svg.selectAll("circle.LargestNetChange")
    .data(usHeatExtremes)
    .join("circle")
    .attr("class", "change")
    .attr("r", 3)
    .attr("fill",d=>d.Fill)
    .attr("transform", (d) => {
      const [x, y] = projection([d.longitudeOfLargestChange, d.latitudeOfLargestChange])
      return `translate(${x}, ${y})`
    })

});