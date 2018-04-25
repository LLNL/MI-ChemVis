class graphComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList"]);
        /////// edge filter ///////
        this.filterState = {
            "morphology": true,
            "material": true,

            "solvents": false,
            "surfactants": true,

            "method": true,
            "composition": true
        };
        this.setupUI();

    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paperList":
                console.log("paperList updated");
                this.draw();
                break;
            case "selection":
                this.filter = this.data["filter"];
                console.log("filter updated", this.filter);
                this.draw();
                break;
            case "highlight":
                this.highlight = this.data["highlight"];
                break;
        }
    }

    updateFilter() {
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                this.filterState[key] = this.container.select(this.div +
                    key).property('checked');
            }
        }

        this.setData("filter", this.filterState);

    }

    setupUI() {

        this.filterList = d3.select(this.div + "filter");
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                let li = this.filterList.append("div")
                    .attr("class", "custom-control custom-checkbox")
                    .style("display", "inline-block")
                    .style("padding-left", "1.3rem")
                    .style("padding-right", "1.0rem");
                // .style("display", "inline-block");
                li.append("input")
                    .attr("type", "checkbox")
                    .attr("id", this.uuid + key)
                    .attr("class", "custom-control-input")
                    .on("click", this.updateFilter.bind(this));
                li.append("label")
                    .attr("class", "custom-control-label")
                    .attr("for", this.uuid + key)
                    .text(key + "\t");
                // <td>&nbsp;</td>
                // this.filterList.append('td').html("nbsp;");
            }
        }

        // <li style="display:inline-block">
        //   <input class="any" id="any" name="any" type="checkbox">
        //   <label id="any" for="any">Any</label>
        // </li>

        // for (let key in this.filterState) {
        //     if (this.filterState.hasOwnProperty(key)) {
        //         let control = this.container.append("div")
        //             .attr("class", "custom-control custom-checkbox");
        //         control.append("input")
        //             .attr("type", "checkbox")
        //             .attr("class", "custom-control-input")
        //             .attr("id", this.uuid + key)
        //             .property('checked', this.filterState[key])
        //             .on("click", this.updateFilter.bind(this));
        //         control.append("label")
        //             .attr("class", "custom-control-label")
        //             .attr("for", this.uuid + key)
        //             .html(key);
        //     }
        // }

    }

    initSvg() {
        this._updateWidthHeight();
        //create svg
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight);
            this.svg = this.svgContainer
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," +
                    this.margin.top + ")");


            this.slider = new sliderPlot(this.svg, [25, 5], [50, 15],
                "edge filter", [0, 10], 2, ".1f");
            this.slider.bindUpdateCallback(this.redraw.bind(this));

            console.log("init slider");
            // this.svgSave = new svgExporter(this.svgContainer, [this.width -
            //     10, 10
            // ]);
        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll(
                ".link, .node").remove();

            // this.svgSave.updatePos([this.width - 10, 10])
            // this.svgSave.draw();
        }
    }

    paperDist(p1, p2) {
        let dist = 0.0;
        for (let key in this.filter) {
            if (this.filter.hasOwnProperty(key))
                if (this.filter[key]) {
                    if (Array.isArray(p1[key]) && Array.isArray(p2[key])) {
                        for (let i = 0; i < p1[key].length; i++)
                            for (let j = 0; j < p2[key].length; j++) {
                                if (p1[key][i] === p2[key][j])
                                    dist += 1.0;
                            }
                    } else {
                        if (p1[key] === p2[key])
                            dist += 1.0;
                    }
                }
        }
        return dist;
    }

    threshold() {
        let count = 0;
        for (let key in this.filter) {
            if (this.filter.hasOwnProperty(key)) {
                if (this.filter[key])
                    count += 1.0;
            }
        }
        return count - 1.0;

    }

    generateGraph(papers, threshold) {
        this.slider.setValue(this.threshold() * 0.5);
        this.nodes = d3.range(papers.length).map(Object);
        let edgeList = [];
        for (var i = 0; i < papers.length; i++)
            for (var j = 0; j < papers.length; j++)
                if (i > j) {
                    let dist = this.paperDist(papers[i], papers[j]);
                    if (threshold) {
                        if (dist > threshold)
                            edgeList.push([i, j]);
                    } else {
                        if (dist > this.slider.value)
                            edgeList.push([i, j]);
                    }
                }

        this.links = edgeList.map(function(edge) {
            return {
                source: edge[0],
                target: edge[1]
            }
        });

    }

    redraw(threshold) {
        if (this.data["filter"] && this.data["paperList"]) {
            this.generateGraph(this.data["paperList"], threshold);
            // console.log("link size:", this.links.length);
            this.simulation(this.nodes, this.links, -20);
        }
    }

    draw() {
        this.initSvg();

        if (this.data["filter"] && this.data["paperList"]) {

            // let n = this.data["paperList"].length;
            // this.randomGraph(n, 2 * n, -20);
            let papers = this.data["paperList"];
            if (papers) {
                this.generateGraph(papers);
                console.log("link size:", this.links.length);
                this.simulation(this.nodes, this.links, -30);
            }
        }
    }

    resize() {
        this.draw();
    }


    randomGraph(n, m, charge) { //creates a random graph on n nodes and m links

        function randomChoose(s, k) { // returns a random k element subset of s
            var a = [],
                i = -1,
                j;
            while (++i < k) {
                j = Math.floor(Math.random() * s.length);
                a.push(s.splice(j, 1)[0]);
            };
            return a;
        }

        function unorderedPairs(s) { // returns the list of all unordered pairs from s
            var i = -1,
                a = [],
                j;
            while (++i < s.length) {
                j = i;
                while (++j < s.length) a.push([s[i], s[j]])
            };
            return a;
        }

        var nodes = d3.range(n).map(Object);
        var list = randomChoose(unorderedPairs(d3.range(n)), m);
        var links = list.map(function(a) {
            return {
                source: a[0],
                target: a[1]
            }
        });

        this.simulation(nodes, links, charge);

    }

    simulation(nodes, links, charge) {
        let svg = this.svg;
        let width = this.width;
        let height = this.height;

        var simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(charge))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('link', d3.forceLink().links(links))
            .force('collision', d3.forceCollide().radius(10))
            .on('tick', tick.bind(this));

        this.svg.append("g").attr("class", "links");
        this.svg.append("g").attr("class", "nodes");

        ////////// draw graph ///////////
        let radius = 8;

        function tick() {
            // console.log("update");
            var u = this.svg
                .select('.links')
                .selectAll('line')
                .data(links)

            u.enter()
                .append('line')
                .merge(u)
                .attr('x1', function(d) {
                    return d.source.x
                })
                .attr('y1', function(d) {
                    return d.source.y
                })
                .attr('x2', function(d) {
                    return d.target.x
                })
                .attr('y2', function(d) {
                    return d.target.y
                })
                .style("stroke-width", 2)
                .style("stroke", "lightgrey")

            u.exit().remove();

            let v = this.svg
                .select('.nodes')
                .selectAll('circle')
                .data(nodes);

            v.enter()
                .append('circle')
                .merge(v)
                .attr("cx", function(d) {
                    return d.x = Math.max(radius, Math.min(width -
                        radius, d.x));
                })
                .attr("cy", function(d) {
                    return d.y = Math.max(radius, Math.min(height -
                        radius, d.y));
                })
                // .attr('cx', function(d) {
                //     return d.x
                // })
                // .attr('cy', function(d) {
                //     return d.y
                // })
                .attr("r", radius)
                .style("fill", "grey")
                .style("stroke", "white")
                .style("stroke-width", 2)
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", "lightgrey")
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("fill", "grey")
                })
                .on("click", (d) => {
                    // console.log(this.data["paperList"][d.index]);
                    this.setData("paper", this.data["paperList"][d.index]);
                });

            v.exit().remove();
        }
    }
}
