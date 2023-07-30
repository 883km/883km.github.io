async function initOneLine() {
    // PARSE DATA
    //   const chartContainer = document.getElementById('chart2');
    //   chartContainer.innerHTML = '';

    dataset = await d3.csv('https://883km.github.io/dataset.csv');
    dataset.forEach(d => {
        d.year = +d.year; // Using unary plus operator to convert to number
        d.gdp = +d.gdp;
        d.primary_energy_consumption_per_capita = +d.primary_energy_consumption_per_capita;
    });

    data = dataset.filter(function (d) {
        return d.entity_type == "country";
    });

    // GET COUNTRY
    //Populate the dropdown menu with country options
    const entities = Array.from(new Set(data.map(d => d.entity)));
    d3.select("#select-country")
        .selectAll('country-options')
        .data(entities)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button
    
    // Set up the initial line chart with the first country in the dropdown menu
    const initialCountry = entities[0];
    const filteredData = data.filter(d => d.entity === initialCountry);
    updateLineChart(filteredData);

    // Set up event listener for the dropdown: filter data by selected country
    d3.select("#select-country").on("change", function () {
        const selectedCountry = this.value;
        const filteredData = data.filter(d => d.entity === selectedCountry);
        updateLineChart(filteredData);
    });
}


function updateLineChart(data) {
    const chartContainer = document.getElementById('chart2');
    chartContainer.innerHTML = '';

    console.log("UpdateLineChart called with data: ", data);
    //SVG  
    // Set dimensions and margins for the chart
    const margin = { top: 50, right: 140, bottom: 50, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG element and append it to the chart container
    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // SCALE AND AXIS
    // Set up the x and y scales and domains
    const xs = d3.scaleLinear()
        .range([0, width])
        .domain([1965, 2022])
    //.domain(d3.extent(data, d => d.year));

    const ys = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d.primary_energy_consumption_per_capita) + 5000]);

    // Add the x & y axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xs));
    svg.append("g")
        .call(d3.axisLeft(ys));

    // Add x-axis label "Year"
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top)
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .text("Year");

    // Add y-axis label "Energy Use Per Person kWh" and rotate it
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", -margin.left + 15)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .text("Energy Use Per Person (kWh)");

    //append title
    d3.select("svg")
        .append("text")
        .attr("x", 485)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Primary Energy Consumption Per Capita by County, 1965 - 2022")
        .style("fill", "black")
        .style("font-size", 20)
        .style("font-family", "Arial Black")


    // DRAW LINES    
    // Create the line generator
    const line = d3.line()
        .x(d => xs(d.year))
        .y(d => ys(d.primary_energy_consumption_per_capita));

    // Add the line paths to the SVG element
    svg.append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 3)
        .attr('d', line(data));

}
