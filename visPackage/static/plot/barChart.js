class barChart {
    constructor(svg, pos, size) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
    }

    draw() {
        if (this.data) {
            let barData = this.barData;
            this.svg.selectAll("*").remove();
            let height = this.size[1] - this.labelSize;
            let width = this.size[0];

            let x = d3.scaleBand().padding(0.2);
            let y = d3.scaleLinear();
            x.rangeRound([this.pos[0] + 10, width - 10]);
            y.rangeRound([height, this.pos[1]]);

            x.domain(barData.map(d => d.name));
            y.domain([0, d3.max(barData, d => d.count)]);

            // Y axis
            this.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + (this.pos[0] + 10) + "," +
                    0 + ")")
                .call(d3.axisLeft(y).ticks(5, "d"));

            // X axis
            this.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," +
                    height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", 12)
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-50)");

            this.svg.append("text")
                .attr("y", 30)
                .attr("x", width * 0.5)
                .attr("text-anchor", "middle")
                .text(this.title);

            var bars = this.svg.selectAll(".bar")
                .data(barData);
            // ENTER
            let callback = this.callback;
            bars
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) {
                    return x(d.name);
                })
                .attr("y", function(d) {
                    return y(d.count);
                })
                .attr("width", x.bandwidth())
                .attr("height", function(d) {
                    return height - y(d.count);
                })
                .on("mouseover", function(d) {
                    if (d3.select(this).style("fill") !== "lightblue")
                        d3.select(this).style("fill", "lightgrey");
                })
                .on("mouseout", function(d) {
                    if (d3.select(this).style("fill") !== "lightblue")
                        d3.select(this).style("fill", "grey");
                })
                .on("click", function(d) {
                    if (d3.select(this).style("fill") === "lightblue") {
                        //cancel highlight
                        d3.select(this).style("fill", "lightgrey");
                        callback([]);

                    } else {
                        // highlight
                        d3.selectAll(".bar").style("fill", "grey");
                        d3.select(this).style("fill", "lightblue");
                        callback(d.array);
                    }
                })
                .style("fill", "grey");
        }

        // // UPDATE
        // bars.attr("x", function(d) {
        //         return x(d.name);
        //     })
        //     .attr("y", function(d) {
        //         return y(d.count);
        //     })
        //     .attr("width", x.bandwidth())
        //     .attr("height", function(d) {
        //         return height - y(d.count);
        //     });
        //
        // // EXIT
        // bars.exit()
        //     .remove();
    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    setData(data, title) {
        this.data = [];
        this.title = title;
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                this.data.push({
                    "name": key,
                    "array": data[key],
                    "count": data[key].length
                });
            }
        }
        this.data = this.data.sort(function(b, a) {
            return a.count - b.count;
        });

        this.barData = this.data.slice(0, 20);
        this.labelSize = d3.max(this.barData.map(d => d.name.length)) * 3;
        console.log(this.labelSize);
        this.draw();
    }

    bindSelectionCallback(func) {
        this.callback = func;
    }
}
