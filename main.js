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

function cleanData(data, comparator, numExamples) {
    //extracting the desired number of examples
    return data.sort(comparator).slice(0, numExamples);
}

// ref to count svg group --> num titles per genre
let countRef = svg_1.append("g");

// load the data 
let netflix_data
d3.csv("../data/netflix.csv").then(function(data) { 
    //let num_genres = function(d) { return d3.count(data, d => d.listed_in)};
    //let nested_data = d3.nest().key(function(d) {return d.listed_in; }).rollup(function(g) {return g.length; }).entries(data);
    //let nested_data = d3.nest().key(function(d) {return d.listed_in; }).sortKeys(d3.ascending).rollup(function(g) {return d3.sum(g, function(genre){return parseInt(genre.listed_in);});}).entries(data);
    let nested_data = d3.nest().key(function(d) {return d.listed_in; }).rollup(function(g) {return g.length;}).entries(data);
    //console.log(nested_data);
    //var genres = d3.keys(nested_data);
    //console.log(genres);
    //var num_titles = d3.values(nested_data);
    let genre_separator
    for (var k in nested_data){
        //console.log(nested_data[key]);
        Object.entries(nested_data[k]).forEach(([key, value]) => {
            //console.log(value);
            var val_as_string = String(value);
            genre_separator = val_as_string.split(",");
            //console.log(genre_separator);
            var genres = Object.values(genre_separator);
            //console.log(genres);
            console.log(genres);
            //var abc = genre_separator[0];
         });
         //console.log(genre_separator);
         break;
    };
    //console.log(genre_separator);

    // clean and strip data 
    netflix_data = cleanData(data, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , nested_data); 

    // create a linear scale for the x axis (genres)
    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return parseInt(d.count); })])
        .range([0, graph_1_width - margin.left - margin.right]);

    // create a scale band for the y axis (num titles)
    let y =  d3.scaleBand()
        .domain(data.map(function(d) { return d["title"] }))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.1);

    // adds y-axis label
    svg_1.append("g")
    .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    //Define color scale
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["title"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), nested_data));

    /*
    This next line does the following:
        1. Select all desired elements in the DOM
        2. Count and parse the data values
        3. Create new, data-bound elements for each data value
    */
    let bars = svg_1.selectAll("rect").data(data);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d["title"]) })
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["title"]); })
        .attr("width", function(d) { return x(parseInt(d.count)); })
        .attr("height",  y.bandwidth());

    let counts = countRef.selectAll("text").data(data);

    // Renders the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function(d) { return y(d.title) + 10})
        .style("text-anchor", "start")
        .text(function(d) { return parseInt(d.count)});
    
    // chart title
    svg_1.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Titles per Genre on Netflix");
        
    // x-axis label
    svg_1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                    ${(graph_1_height - margin.top - margin.bottom) + 15})`)
    .style("text-anchor", "middle")
    .text("Genres on Netflix");

    // y-axis label
    svg_1.append("text")
        .attr("transform", `translate(-120, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .text("Number of Titles");

})