// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let svg_1 = d3.select("#barplot")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top}}`);  

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    // sort and return the given data with the comparator (extracting the desired number of examples)
    return data.sort(comparator).slice(0, numExamples);
}

// load the data 
let netflix_data
d3.csv("../data/netflix.csv").then(function(data) { 
    //let num_genres = function(d) { return d3.count(data, d => d.listed_in)};
    //let nested_data = d3.nest().key(function(d) {return d.listed_in; }).rollup(function(g) {return g.length; }).entries(data);
    //let nested_data = d3.nest().key(function(d) {return d.listed_in; }).sortKeys(d3.ascending).rollup(function(g) {return d3.sum(g, function(genre){return parseInt(genre.listed_in);});}).entries(data);
    let nested_data = d3.nest().key(function(d) {return d.listed_in; }).sortKeys(d3.ascending).rollup(function(g) {return g.length;}).entries(data);
    // clean and strip the data 
    netflix_data = cleanData(data, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , console.log(nested_data)); 

// create a linear scale for the x axis (genres)
let x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return parseInt(d.count); })])
    .range([0, graph_1_width - margin.left - margin.right])

// create a scale band for the y axis (num titles)
let y =  d3.scaleBand()
    .domain(data.map(function(d) { return d["title"] }))
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

})