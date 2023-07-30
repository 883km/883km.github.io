
function renderThirdChartAnnotations(d, x, y, margin) {
    d3.select(".annotation-group").remove();
    const annotations = [{
        note: {
            label: "An average worker makes " + Math.round(d.productivity) + " $/hour",
            lineType: "none",
            bgPadding: {
                "top": 15,
                "left": 10,
                "right": 10,
                "bottom": 10
            },
            title: d.entity,
            orientation: "topBottom",
            align: "top"
        },
        type: d3.annotationCalloutCircle,
        subject: {
            radius: 30
        },
        x: x,
        y: y,
        dx: -100,
        dy: -10
    }, ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    const chart = d3.select("svg")
    chart.transition()
        .duration(1000);
    chart.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}



// Third Slide
async function oneLine() {
    const margin = {
            top: 10,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    const data = await d3.csv("https://rohitmukherjee.github.io/data/4-labor-productivity-per-hour-PennWorldTable.csv");

    // append the svg object to the body of the page
    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
            
    const filteredData = data.filter(function(d) {
        return d.productivity != "" && d.year != "";
    });

    const entities = getEntities();
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


    // A color scale: one color for each group////////////////////////
    const myColor = d3.scaleOrdinal()
        .domain(entities)
        .range(d3.schemeSet2);

    // Add X axis to measure time
    const x = d3.scaleLinear()
        .domain([1950, 2017])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " $/hr"));

    // Initialize line with group a
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

function renderLegend(svg, continentKeys, width, myColor) {
    // Add one dot in the legend for each name.
    svg.selectAll("legend-dots")
        .data(continentKeys)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", function(d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 2)
        .style("fill", function(d) {
            return myColor(d)
        })

    svg.selectAll("legend-labels")
        .data(continentKeys)
        .enter()
        .append("text")
        .attr("x", width + 8 - 100)
        .attr("y", function(d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d) {
            return myColor(d)
        })
        .text(function(d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

function getContinentKeys() {
    return ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
}

function getEntities() {
    return ["Argentina", "Australia", "Austria", "Bangladesh", "Barbados", "Belgium", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China",
        "Colombia", "Costa Rica", "Croatia", "Cyprus", "Czechia", "Denmark", "Ecuador", "Estonia", "Finland", "France", "Germany", "Greece", "Hong Kong",
        "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malaysia", "Malta",
        "Mexico", "Myanmar", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia",
        "Saint Lucia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka",
        "Sweden", "Switzerland", "Taiwan", "Thailand", "Trinidad and Tobago", "Turkey", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"
    ]
}