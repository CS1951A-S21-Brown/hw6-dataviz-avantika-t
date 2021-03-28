// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
// const margin = {top: 40, right: 100, bottom: 40, left: 400};
const margin = {top: 40, right: 150, bottom: 40, left: 300};
const NUM_EXAMPLES = 6234; //no. of data entries
const NUM_GENRES = 42; //number of distinct genres

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
// let graph_1_width = (MAX_WIDTH / 2) + 300, graph_1_height = 600;
// let graph_2_width = (MAX_WIDTH / 2) + 300, graph_2_height = 300;
// let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) + 450, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 500;

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

    // adds x-axis label
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + graph_1_height + ")").call(d3.axisBottom(x));

    // defines color scale
    let color = d3.scaleOrdinal()
        .domain(final_data.map(function(d) { return d["listed_in"] }))
        .range(d3.quantize(d3.interpolateHcl("#d66000", "#a9a9b4"), NUM_GENRES));

    let bars = svg.selectAll("rect").data(final_data); 

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d["listed_in"]); })
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["listed_in"]); })
        .attr("width", function(d) { return x(parseInt(d.count)); })
        .attr("height",  y.bandwidth())
        .attr("fill", "MediumSeaGreen");

    let counts = countRef.selectAll("text").data(final_data); 

    // Renders the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function(d) { return y(d.listed_in) + 9})
        .style("text-anchor", "start")
        .text(function(d) { return parseInt(d.count)})
        .style("font", "9px Helvetica");
    
    // chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)
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
        .attr("transform", `translate(-200, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Genres on Netflix");
        //-190

});

function change_clr(colour){
    d3.select("#graph1").selectAll("rect")
    .transition().duration(2000).style("fill", colour);
}

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

// ref to count svg group --> avg runtime of movies
let countRef2 = svg2.append("g");

d3.csv("../data/netflix.csv").then(function(data2) {  
    data2 = cleanData(data2, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , NUM_EXAMPLES); 

    //filter data to account for just movies
    var filter_movie = [];
    for (i=0; i < data2.length; i++){
        if (data2[i].type == "Movie"){
            filter_movie.push(data2[i]);
        }
    }

    //create a dictionary with key as release year and value as a list of all durations of movies released in that year
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

    let avg_duration = [];
    //clean the list inside the dict to remove string and "mins"
    Object.keys(dict).forEach(function(key) {
        var dur = dict[key].toString().match(/(\d|, )+/g).map(function(d){
            return parseInt(d, 10);
        })
        avg_duration.push(dur.reduce((a,b)=> a+b, 0) / dur.length);
    });

    var runtime_year = [];
    for (r = 0; r < Object.keys(dict).length; r++){
        d2 = {};
        d2["release_year"] = Object.keys(dict)[r];
        d2["avg_duration"] = avg_duration[r];
        runtime_year.push(d2);
    }

    // create a linear scale for the x axis (release year)
    let x = d3.scaleLinear()
        .domain([d3.min(runtime_year, function(d) { return d.release_year; }), d3.max(runtime_year, function(d) { return d.release_year; })])
        .range([0, graph_2_width - margin.left - margin.right]);

    // create a scale band for the y axis (avg duration)
    let y = d3.scaleLinear()
        .domain([0, d3.max(runtime_year, function(d) { return d.avg_duration; })])
        .range([graph_2_height - margin.top - margin.bottom, 0]);

    // adds x-axis label
    svg2.append("g")
        .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom} )`)
        .call(d3.axisBottom(x));
    
    // adds y-axis label
    svg2.append("g")
        .call(d3.axisLeft(y));

    svg2.append("path")
        .data([runtime_year])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "darkcyan")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
        .x(function(d) {return x(d.release_year)})
        .y(function(d) {return y(d.avg_duration)}));

    // chart title
    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Average Runtime of Movies by Release Year");

    // x-axis label
    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                    ${(graph_2_height - margin.top - margin.bottom) + 40})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Release Year");

    // y-axis label
    svg2.append("text")
        .attr("transform", `translate(-120, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Average Runtime");

    // This allows to find the closest X index of the mouse:
    var b = d3.bisector(function(d) { return d.release_year; }).left;

    // Create the circle that travels along the curve of chart
    var traveler = svg2.append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "darkgreen")
        .attr('r', 5)
        .style("opacity", 0);

    // Create the text that travels along the curve of chart
    var traveler_text = svg2.append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .style("font-weight", 450);

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        traveler.style("opacity", 1);
        traveler_text.style("opacity",1);
    };

    function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = b(runtime_year, x0, 1);
        traveler.attr("cx", x(runtime_year[i]["release_year"])).attr("cy", y(runtime_year[i]["avg_duration"]));
        traveler_text.html("( x:" + runtime_year[i]["release_year"] + "  ,  " + "y:" + runtime_year[i]["avg_duration"] + " )")
                .attr("x", x(runtime_year[i]["release_year"])+15)
                .attr("y", y(runtime_year[i]["avg_duration"]));
    };

    function mouseout() {
        traveler.style("opacity", 0);
        traveler_text.style("opacity", 0);
    };

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg2.append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', graph_2_width)
        .attr('height', graph_2_height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

});

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)     
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

// ref to count svg group --> avg runtime of movies
let countRef3 = svg3.append("g");

d3.csv("../data/netflix.csv").then(function(data3) {  
    data3 = cleanData(data3, function(a,b) { return parseInt(b.count) - parseInt(a.count)} , NUM_EXAMPLES); 

    //filter data to account for just movies
    var filter_data = [];
    for (i=0; i < data3.length; i++){
        if (data3[i].type == "Movie"){
            if (!(data3[i].director == "")){
                if (!(data3[i].cast == "")){
                    filter_data.push(data3[i]);
                }
            }
        }
    }
    //console.log(filter_data);

    // split directors and actors on commas 
    var split_cast = [];
    var split_director = [];
    for (i = 0; i < filter_data.length; i++) {
        split_cast.push(filter_data[i]["cast"].split(','));
        split_director.push(filter_data[i]["director"].split(','));
    }
    //console.log(split_director);

    //create a dictionary with the key as a director and value as actor who has worked with that director
    var dir_cast = [];
    for (i = 0; i < split_director.length; i++) {
        var dir = split_director[i];
        var actor = split_cast[i];
        for (j = 0; j < dir.length; j++) {
            for (k = 0; k < actor.length; k++) {
                abc = [];
                abc.push(dir[j], actor[k]);
                if (abc in dir_cast){
                    dir_cast[abc]++;
                } else {
                    dir_cast[abc] = 1;
                }
            } 
        } 
    }
    //console.log(Object.keys(dir_cast).length);

    var pair = Object.keys(dir_cast).map(function(key){ 
        return [key, dir_cast[key]];
    });

    pair.sort(function(a, b) { return b[1] - a[1];});
    //console.log(top_pair);

    var top_pairs = [];
    for (i = 0; i < 40; i++){
        final_pairs = {};
        final_pairs["pair"] = pair[i][0];
        final_pairs["count"] = pair[i][1];
        top_pairs.push(final_pairs);
    }
    //console.log(top_pairs);

    // create a linear scale for the x axis (count)
    let x = d3.scaleLinear()
        .domain([0, d3.max(top_pairs, function(d) { return parseInt(d.count); })])
        .range([0, graph_3_width - margin.left - margin.right]);

    // adds x-axis label
    svg3.append("g")
        .attr("transform", `translate(0, ${graph_3_height - margin.top - margin.bottom} )`)
        .call(d3.axisBottom(x));

    // create a scale band for the y axis (top pairs)
    let y =  d3.scaleBand()
        .domain(top_pairs.map(function(d) { return d["pair"] }))
        .range([0, graph_3_height - margin.top - margin.bottom])
        .padding(0.1);

    // adds y-axis label
    svg3.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // defines color scale
    let color = d3.scaleOrdinal()
        .domain(top_pairs.map(function(d) { return d["pair"] }))
        .range(d3.quantize(d3.interpolateHcl("#fafa6e", "#2A4858"), 40));

    let bars = svg3.selectAll("rect").data(top_pairs); 

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d["pair"]); })
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["pair"]); })
        .attr("width", function(d) { return x(parseInt(d.count)); })
        .attr("height",  y.bandwidth());

    let counts = countRef3.selectAll("text").data(top_pairs); 

    // Renders the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function(d) { return y(d.pair) + 9})
        .style("text-anchor", "start")
        .text(function(d) { return parseInt(d.count)})
        .style("font", "9px Helvetica");
    
    // chart title
    svg3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Top Director-Actor Pairs by Number of Movies Made");

    // x-axis label
    svg3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2},
                                    ${(graph_3_height - margin.top - margin.bottom) + 40})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Movies Made");

    // y-axis label
    svg3.append("text")
        .attr("transform", `translate(-220, ${(graph_3_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top Pairs");

});
