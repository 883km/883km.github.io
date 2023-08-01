async function initScatterplot() {
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
        return d.entity_type == "country" && d.year == 2018 && d.gdp > 0.0001;
    });
    console.log(data)


    //SVG  
    // Set dimensions and margins for the chart
    const margin = { top: 50, right: 140, bottom: 50, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG element and append it to the chart container
    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // SCALE AND AXIS
    // Set up the x, y and color scales and domains
    const xs = d3.scaleLog()
        .range([0, width])
        .domain(d3.extent(data, d => d.gdp))

    const ys = d3.scaleLog()
        .range([height, 0])
        .domain(d3.extent(data, d => d.primary_energy_consumption_per_capita));

    const cs = d3.scaleOrdinal()
        .range(d3.schemeTableau10)
        .domain(d3.extent(data, d => d.continent));

    // Add the x & y axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xs));
    svg.append("g")
        .call(d3.axisLeft(ys));

    // Add x-axis label "gdp"
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top)
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .text("logarithmic GDP (Billion)");

    // Add y-axis label "Energy Use Per Person kWh" and rotate it
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", -margin.left + 15)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .text("logarithmic Energy Use Per Person (kWh)");

    //append title
    d3.select("svg")
        .append("text")
        .attr("x", 485)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("GDP vs Primary Energy Consumption Per Capita, 2018")
        .style("fill", "black")
        .style("font-size", 20)
        .style("font-family", "Arial Black")


    // COLOR LEGEND & TITLE
    //append legends
    const continents = Array.from(new Set(data.map(d => d.continent)));
    const legendData = continents.map((continent, i) => ({ continent, index: i }));

    const legend = d3.select('svg')
        .selectAll('g.legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('circle')
        .attr('cx', width + margin.left + 50)
        .attr('cy', (d, i) => i * 35 + margin.top + 5)
        .attr('r', 6)
        .style('fill', d => cs(d.continent))
        .style('opacity', 0.7);

    legend.append('text')
        .attr('x', width + margin.left + 57)
        .attr('y', (d, i) => i * 35 + margin.top + 9)
        .text(d => d.continent)
        .style("font-size", 12);


    // DRAW SCATTERPLOT    
    //
    svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => {
            const cx = xs(d.gdp);
            return cx;
        })
        .attr("cy", d => {
            const cy = ys(d.primary_energy_consumption_per_capita);
            return cy;
        })
        .attr("r", 6)
        .style("fill", d => cs(d.continent))
        .style("opacity", 0.7)
        // Add the mouseover event to show the tooltip
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .style("left", event.pageX - 400 + "px")
                .style("top", event.pageY - 100 + "px");

            tooltip.html(`
                Country: ${d.entity}<br>
                Energy Consumption PC: ${d.primary_energy_consumption_per_capita} kWh<br>
                GDP: ${d.gdp} billion
            `);
        })
        // Add the mouseout event to hide the tooltip
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    // ADD TOOLTIPS
    const tooltip = d3.select("#chart3")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "6px")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("font-size", "12px");


    // ADD ANNOTATION
    const annotationData = data.filter(function (d) {
        return d.entity == "United States";
    });
    console.log(annotationData)
    const annotationX = xs(annotationData.gdp);
    const annotationY = ys(annotationData.primary_energy_consumption_per_capita);

    // draw the circle
    const annotation = d3.select('svg')
        .selectAll('g.annotation_circle')
        .data([0,0])
        .enter()
        .append('g')
        .attr('class', 'annotation_circle');

    annotation.append('circle')
        // .attr("cx", d => {
        //     const cx = xs(d.gdp);
        //     return cx;
        // })
        // .attr("cy", d => {
        //     const cy = ys(d.primary_energy_consumption_per_capita);
        //     return cy;
        // })
        .attr('cx', 860)
        .attr('cy', 120)
        .attr('r', 15)
        .style('fill', 'none')
        .style('stroke', 'darkgrey')
        .style("stroke-width", 2)
        .style('opacity', 0.7);

    // Add the arrow line
    annotation.append("line")
        .attr("x1", 860)
        .attr("y1", 135)
        .attr("x2", 810)
        .attr("y2", 235)
        .attr("stroke", "darkgrey") // Set arrow color to dark grey
        .attr("stroke-width", 2);

    // Add the text label
    annotation.append("text")
        .attr("x", 780)
        .attr("y", 248)
        .text("This is America!")
        .style("fill", "black")
        .style("font-size", 12);


}
