async function init() {
    dataset = await d3.csv('https://883km.github.io/per-capita-energy-use.csv');
    dataset.forEach(d => {
        d.year = +d.year; // Using unary plus operator to convert to number
        d.gdp = +d.gdp;
        d.primary_energy_consumption_per_capita = +d.primary_energy_consumption_per_capita;
      });
}

async function lineChart1() {
    init()
    data = dataset.filter(function(d) {
        return d.country_cde == "";
    });
    
    // Set dimensions and margins for the chart
    const margin = {top: 40, right: 50, bottom: 40, left: 50};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create the SVG element and append it to the chart container
    const svg = d3.select("#chart0") // TODO
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up the x and y scales and domains
    const xs = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, d => d.year));
    
    const ys = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.primary_energy_consumption_per_capita)]);
    
    // Add the x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xs)
        .ticks(d3.timeMonth.every(1)) //TODO
        .tickFormat(d3.timeFormat("%b %Y"))); 
    
    // Add the y-axis
    svg.append("g")
      .call(d3.axisLeft(ys)) // TODO: ticks?

    // Create nested data
    const nested_data = d3.nest()
      .key(d => d.entity)
      .entries(data)
    
    // Create the line generator
    const line = d3.line()
      .x(d => xs(d.year))
      .y(d => ys(d.primary_energy_consumption_per_capita))
      .curve(curveBasis);
    
    // Add the line paths to the SVG element
    svg.selectAll('path')
    .data(nested_data)
    .enter()
    .append('path')
    .attr("d", d => line(d.values));
}

