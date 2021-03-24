// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 300};
const NUM_EXAMPLES = 6234; //no. of data entries
const NUM_GENRES = 42; //number of distinct genres

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) + 300, graph_1_height = 600;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);  

// ref to count svg group --> num titles per genre
let countRef = svg.append("g");

function cleanData(data, comparator, numExamples) {
    //extracting the desired number of examples
    return data.sort(comparator).slice(0, numExamples);
}

// load the data 
d3.csv("../data/netflix.csv").then(function(data) {  
    data = cleanData(data, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , NUM_EXAMPLES); 

    //create dictionary of genre and their respective counts
    var all_genres = {};
    for (j= 0; j < data.length; j++) {
        var splitted_genres = data[j]["listed_in"].replace(/[" ]/g, '').toUpperCase().split(',');
        for (i = 0; i < splitted_genres.length; i++) {
            if (splitted_genres[i] in all_genres) {
                all_genres[splitted_genres[i]] ++; 
            } else {
                all_genres[splitted_genres[i]] = 1;
            }
        } 
    }

    //fill in list of dictionaries with their key as the genre and value as their count
    var final_data = [];
    for (n = 0; n < Object.values(all_genres).length; n++){
        el = {};
        el["listed_in"] = Object.keys(all_genres)[n];
        el["count"] = Object.values(all_genres)[n];
        final_data.push(el);
    }

    // create a linear scale for the x axis (num titles)
    let x = d3.scaleLinear()
        .domain([0, d3.max(final_data, function(d) { return parseInt(d.count); })])
        .range([0, graph_1_width - margin.left - margin.right]);

    // create a scale band for the y axis (genres)
    let y =  d3.scaleBand()
        .domain(final_data.map(function(d) { return d["listed_in"] }))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.1);

    // adds y-axis label
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // defines color scale
    let color = d3.scaleOrdinal()
        .domain(final_data.map(function(d) { return d["listed_in"] }))
        .range(d3.quantize(d3.interpolateHcl("#d66000", "#a9a9b4"), NUM_GENRES));

    /*
    This next line does the following:
        1. Select all desired elements in the DOM
        2. Count and parse the data values
        3. Create new, data-bound elements for each data value
    */
    let bars = svg.selectAll("rect").data(final_data); 

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d["listed_in"]); })
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["listed_in"]); })
        .attr("width", function(d) { return x(parseInt(d.count)); })
        .attr("height",  y.bandwidth());

    let counts = countRef.selectAll("text").data(final_data); 

    // Renders the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function(d) { return y(d.listed_in) + 9})
        .style("text-anchor", "start")
        .text(function(d) { return parseInt(d.count)})
        .style("font", "11px Helvetica");
    
    // chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Number of Titles per Genre on Netflix");

    // x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                    ${(graph_1_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Titles");

    // y-axis label
    svg.append("text")
        .attr("transform", `translate(-190, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Genres on Netflix");

});

let svg2 = d3.select("#graph2")
    .append("svg2") //or svg???
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

// ref to count svg group --> avg runtime of movies
let countRef2 = svg2.append("g");

d3.csv("../data/netflix.csv").then(function(data2) {  
    data2 = cleanData(data2, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , NUM_EXAMPLES); 

    var filter_movie = [];
    for (i=0; i < data2.length; i++){
        if (data2[i].type == "Movie"){
            filter_movie.push(data2[i]);
        }
    }
    //console.log(filter_movie);

    var dict = {};
    for (i=0; i < filter_movie.length; i++){
        year = filter_movie[i]["release_year"];
        if (!(year in dict)){
            dict[year] = [];
            dict[year].push(filter_movie[i]["duration"]);
        } else {
            dict[year].push(filter_movie[i]["duration"]);
        }
    }
    //console.log(dict);

});