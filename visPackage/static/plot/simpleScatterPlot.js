class simpleScatterPlot {
    constructor(svg, pos, size, axisX = true, axisY = true) {
        this.svg = svg.append("g");
        this.update(pos, size);
        this.axisXflag = axisX;
        this.axisYflag = axisY;
        /// small button
        // Pan and zoom
        this.zoom = d3.zoom()
            .scaleExtent([.5, 10])
            .extent([
                [pos[0], pos[1]],
                [pos[0] + size[0], pos[1] + size[1]]
                // [0, 0],
                // [pos[0], pos[1]]
            ])
            .on("zoom", this.zoomed.bind(this));
    }

    draw() {
        if (this.data) {
            var data = this.data;
            if (this.accessor)
                data = this.data.map(this.accessor);
            this.svg.selectAll("*").remove();
            this.mappedData = data;
            this.svg.append("rect")
                .attr("width", this.size[0])
                .attr("height", this.size[1])
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('transform', 'translate(' + this.pos[0] + ',' + this.pos[
                        1] +
                    ')')
                .call(this.zoom);

            this.xScale = d3.scaleLinear()
                .range([this.pos[0], this.pos[0] + this.size[0]]);

            this.yScale = d3.scaleLinear()
                .range([this.pos[1] + this.size[1], this.pos[1]]);

            this.xScale.domain(d3.extent(data, d => d[0])).nice();
            this.yScale.domain(d3.extent(data, d => d[1])).nice();

            var r = 6;
            this.points = this.svg.selectAll('.point')
                .data(data)
                .enter().append('circle')
                .attr('class', 'point')
                .attr('cx', d => this.xScale(d[0]))
                .attr('cy', d => this.yScale(d[1]))
                .attr('r', r)
                .style("opacity", 0.8)
                .style('fill', "lightgrey")
                .on("click", (d, i) => {
                    this.callback(this.data[i]);
                })
                .on("mouseover", function(d) {
                    d3.select(this).attr("r", 8);
                })
                .on("mouseout", function(d) {
                    d3.select(this).attr("r", 6);
                });

            if (this.axisXflag) {
                this.axisX = d3.axisBottom(this.xScale).ticks(5, "s");
                this.gX = this.svg.append("g")
                    .attr("transform", "translate(0," + (this.pos[1] + this
                        .size[1]) + ")")
                    .call(this.axisX);
                this.svg.append('text')
                    .attr('x', this.pos[0] + 7)
                    .attr('y', this.pos[1] + 10)
                    .text(this.names[1])
                    .style("pointer-events", "none");
            }

            if (this.axisYflag) {
                this.axisY = d3.axisLeft(this.yScale).ticks(5, "s");
                this.gY = this.svg.append("g")
                    .attr("transform", "translate(" + this.pos[0] + ",0)")
                    .call(this.axisY);
                this.svg.append('text')
                    .attr('x', this.pos[0] + this.size[0])
                    .attr('y', this.pos[1] + this.size[1] - 5)
                    .attr('text-anchor', 'end')
                    .text(this.names[0])
                    .style("pointer-events", "none");
            }
        }
    }

    update(pos, size) {
        //adjust for axis
        this.pos = [pos[0] + 25, pos[1] + 3];
        this.size = [size[0] - 35, size[1] - 20];
        this.draw();
    }

    setData(data, names, accessor = undefined, value = []) {
        this.data = data;
        this.accessor = accessor;
        this.val = value;
        this.names = names;
        this.draw();
        this.highlight();
    }

    bindSelectionCallback(callback) {
        this.callback = callback;
    }

    highlight(list) {
        if (list)
            this.indexSet = new Set(list);

        if (this.indexSet) {
            // console.log(this.indexSet);
            let indexSet = this.indexSet;
            if (indexSet.size > 0) {
                this.svg.selectAll(".point").each(function(d, i) {
                    let highlight = false;
                    if (d[2]) {
                        if (indexSet.has(d[2]))
                            highlight = true;
                    } else {
                        if (indexSet.has(i))
                            highlight = true;
                    }

                    if (highlight)
                        d3.select(this).style("fill", "lightblue");
                    else
                        d3.select(this).style("fill", "lightgrey");
                })

            } else {
                this.svg.selectAll(".point").style("fill", "lightgrey");
            }
        }
    }

    zoomed() {
        // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(this.xScale);
        var new_yScale = d3.event.transform.rescaleY(this.yScale);
        // console.log(new_xScale, new_yScale);
        // update axes
        this.gX.call(this.axisX.scale(new_xScale));
        this.gY.call(this.axisY.scale(new_yScale));

        this.points.data(this.mappedData)
            .attr('cx', d => new_xScale(d[0]))
            .attr('cy', d => new_yScale(d[1]));
    }
}
