async function initLineRegion() {
  // PARSE DATA
    const chartContainer = document.getElementById('chart1');
    chartContainer.innerHTML = '';
    
    dataset = await d3.csv('https://883km.github.io/dataset.csv');
    dataset.forEach(d => {
        d.year = +d.year; // Using unary plus operator to convert to number
        d.gdp = +d.gdp;
        d.primary_energy_consumption_per_capita = +d.primary_energy_consumption_per_capita;
      });

    data = dataset.filter(function(d) {
        return d.entity_type == "region";
    });

    multipleLine(data)
  }

  async function initLineEco() {
    // PARSE DATA
      const chartContainer = document.getElementById('chart1');
      chartContainer.innerHTML = '';

      dataset = await d3.csv('https://883km.github.io/dataset.csv');
      dataset.forEach(d => {
          d.year = +d.year; // Using unary plus operator to convert to number
          d.gdp = +d.gdp;
          d.primary_energy_consumption_per_capita = +d.primary_energy_consumption_per_capita;
        });
  
      data = dataset.filter(function(d) {
          return d.entity_type == "eco_region";
      });
  
      multipleLine(data)
    }
    
function multipleLine(data) {
  // GROUP DATA
    const grouped_data = Array.from(d3.group(data, (d) => d.entity), ([key, values]) => ({
      key,
      values,
    }))
    console.log(grouped_data)
    console.log(grouped_data.map(d => d.key))

  //SVG  
    // Set dimensions and margins for the chart
    const margin = {top: 50, right: 140, bottom: 50, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create the SVG element and append it to the chart container
    const svg = d3.select("#chart1")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  

  // SCALE AND AXIS
    // Set up the x and y scales, color scales and domains
    const xs = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, d => d.year));
    
    const ys = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.primary_energy_consumption_per_capita) + 5000]);

    const cs = d3.scaleOrdinal()
      .domain(grouped_data.map(d => d.key))
      .range(d3.schemeTableau10);
    console.log(cs)
    
    // Add the x & y axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xs)); 

    svg.append("g")
      .call(d3.axisLeft(ys)); // TODO: ticks?

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
   

  // DRAW LINES    
    // Create the line generator
    const line = d3.line()
      .x(d => xs(d.year))
      .y(d => ys(d.primary_energy_consumption_per_capita));

    // Add the line paths to the SVG element
    svg.selectAll('.line')
      .data(grouped_data)
      .enter()
      .append('g')
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', d => cs(d.key))
      .attr('stroke-width', 3)
      .attr('d', d => line(d.values));

    // svg.selectAll('circle')
    //   .data(grouped_data)
    //   .enter()
    //   .append('g')
    //   .selectAll('circle')
    //   .data(d => d.values)
    //   .enter()
    //   .append('circle')
    //   .attr('cx', d => xs(d.year))
    //   .attr('cy', d => ys(d.primary_energy_consumption_per_capita))
    //   .attr('r', 3)
    //   .attr('fill', d => cs(d.entity))
    

  // COLOR LEGEND & TITLE
    //append legends
    const legend = d3.select('svg')
      .selectAll('g.legend')
      .data(grouped_data)
      .enter()
      .append('g')

      .attr('class', 'legend');

    legend.append('circle')
      .attr('cx', width + margin.left + 20)
      .attr('cy', (d, i) => i * 35 + margin.top + 5)
      .attr('r', 5)
      .style('fill', d => cs(d.key))

    legend.append('text')
    .attr('x', width + margin.left + 27)
    .attr('y', (d, i) => i * 35 + margin.top + 9)
    .text(d => d.key)
    .style("font-size", 12)

    //append title
    d3.select("svg")
    .append("text")
    .attr("x", 485)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Energy Use Per Person, 1965 - 2022")
    .style("fill", "black")
    .style("font-size", 20)
    .style("font-family", "Arial Black")

}
