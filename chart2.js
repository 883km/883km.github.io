async function oneLine() {
    dataset = await d3.csv('https://883km.github.io/dataset.csv');
    dataset.forEach(d => {
        d.year = +d.year; // Using unary plus operator to convert to number
        d.gdp = +d.gdp;
        d.primary_energy_consumption_per_capita = +d.primary_energy_consumption_per_capita;
      });
  
    data = dataset.filter(function(d) {
        return d.entity_type == "country";
      });

  // GET COUNTRY
    const entities = Array.from(new Set(data.map(d => d.entity)));
    console.log(entities)
    d3.select("#select-country")
        .selectAll('country-options')
        .data(entities)
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        }) // text showed in the menu
        .attr("value", function(d) {
            return d;
        }) // corresponding value returned by the button

  // SVG  
    // Set dimensions and margins for the chart
    const margin = {top: 50, right: 140, bottom: 50, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create the SVG element and append it to the chart container
    const svg = d3.select("#chart2")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

  // SCALE AND AXIS
    // Set up the x and y scales, color scales and domains /////////COLOR?
    const xs = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, d => d.year));
    
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
  }
  
  //////////////////////////////////////////////////////////////////////////////////
  async function renderThirdChart() {
  
    // Initialize line with group 'world'
    const firstCountryData = filteredData.filter(function(d) {
        return d.entity === entities[0]
    });
    const line = svg
        .append('g')
        .append("path")
        .attr("id", "line-" + entities[0])
        .datum(firstCountryData)
        .attr("d", d3.line()
            .x(function(d) {
                return x(Number(d.year))
            })
            .y(function(d) {
                return y(Number(d.productivity))
            })
        )
        .attr("stroke", function(d) {
            return myColor(d.entity)
        })
        .style("stroke-width", 4)
        .style("fill", "none")
    const mostRecentFirstCountryData = firstCountryData[firstCountryData.length - 1]
    renderThirdChartAnnotations(mostRecentFirstCountryData, x(Number(mostRecentFirstCountryData.year)) - 10, y(Number(mostRecentFirstCountryData.productivity)) - 10, margin);
  
    function update(selectedGroup) {
        // Create new data with the selection?
        const countryData = filteredData.filter(function(d) {
            return d.entity === selectedGroup;
        });
  
        // Give these new data to update line
        line
            .datum(countryData)
            .transition()
            .duration(1000)
            .attr("id", "line-" + selectedGroup)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(Number(d.year))
                })
                .y(function(d) {
                    return y(Number(d.productivity))
                })
            )
            .attr("stroke", function(d) {
                return myColor(selectedGroup)
            })
  
        // update the annotation
        const finalCountryData = countryData[countryData.length - 1];
        renderThirdChartAnnotations(finalCountryData, x(Number(finalCountryData.year)) - 10, y(finalCountryData.productivity) - 10, margin)
    }
  
    // When the button is changed, run the updateChart function
    d3.select("#select-country").on("change", function(d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
  
    })
  
  }
  