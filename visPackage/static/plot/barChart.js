class barChart {
    constructor(svg, pos, size) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
    }

    draw() {
        if (this.data) {

            this.svg.selectAll("*").remove();
            let height = this.size[1];
            let width = this.size[0];

            let x = d3.scaleBand().padding(0.1);
            let y = d3.scaleLinear();
            x.rangeRound([this.pos[0], width]);
            y.rangeRound([height, this.pos[1]]);
            let barData = this.data.slice(0, 20);
            x.domain(barData.map(function(d) {
                return d.name;
            }));
            y.domain([0, d3.max(barData, function(d) {
                return d.count;
            })]);

            this.svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(20, "%"));

            this.svg.append("g")
                .attr("class", "axis")
                .attr("id", "axisY")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", 12)
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            this.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 10)
                .attr("x", 0)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");

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

                    console.log(d3.select(this).style("fill"));
                    if (d3.select(this).style("fill") === "lightblue") {
                        d3.select(this).style("fill", "lightgrey");
                    } else {
                        d3.selectAll(".bar").style("fill", "grey");
                        d3.select(this).style("fill", "lightblue");
                    }
                    callback(d.array);
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

    setData(data) {
        this.data = [];
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

        console.log(this.data);
        this.draw();
    }

    setSelectionCallback(func) {
        this.callback = func;
    }
}
