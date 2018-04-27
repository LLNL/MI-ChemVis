class graphComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList", "selection", "highlight"]);

        /////// edge filter options ///////
        this.filterState = {
            "morphology": true,
            "material": true,
            "solvents": false,
            "surfactants": true,
            "method": true,
            "reducing_agents": true,

            // "chemicals": false
            // "composition": true
        };

        this.marginWidth = 10;
        this.setupUI();

        this.colorScale = d3.scaleOrdinal(d3['schemeSet3']);
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paperList":
                console.log("paperList updated");
                this.draw();
                break;
            case "selection":
                this.selection = this.data["selection"];
                // console.log("filter updated", this.filter);
                this.draw();
                break;
            case "highlight":
                this.highlight = this.data["highlight"];
                this.updateHighlight(this.highlight)
                break;
        }
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
                li.append("input")
                    .attr("type", "checkbox")
                    .attr("id", this.uuid + key)
                    .attr("class", "custom-control-input")
                    .property('checked', this.filterState[key])
                    .on("click", this.updateFilter.bind(this));
                li.append("label")
                    .attr("class", "custom-control-label")
                    .attr("for", this.uuid + key)
                    .text(key + "\t");
            }
        }

        let dropdown = this.filterList.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .html("color-by");
        let menu = dropdown.append("div")
            .attr("class", "dropdown-menu");
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                menu.append("a")
                    .attr("class", "dropdown-item")
                    .on("click", d => {
                        this.updateColor(key);
                    })
                    .html(key);
            }
        }
        // <button type="button" class="btn btn-secondary">Secondary</button>
        ///// add edge control buttons //////
        this.filterList.append("button")
            .attr("type", "button")
            .attr("class", "btn btn-sm btn-secondary")
            .style("margin-left", "5px")
            .html("+")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "top")
            .attr("title", "increase edges")
            .on("click", d => {
                this.redraw(this.currentEdgeThreshold - 1.0)
            });
        this.filterList.append("button")
            .attr("type", "button")
            .attr("class", "btn btn-sm btn-secondary")
            .style("margin-left", "5px")
            .html("-")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "top")
            .attr("title", "decrease edges")
            .on("click", d => {
                this.redraw(this.currentEdgeThreshold + 1.0)
            });

        $(function() {
            $('[data-toggle="tooltip"]').tooltip()
        })
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

            // this.slider = new sliderPlot(this.svg, [25, 5], [50, 15],
            //     "edge filter", [0, 10], 2, ".1f");
            // this.slider.bindUpdateCallback(this.redraw.bind(this));

            // console.log("init slider");
            // this.svgSave = new svgExporter(this.svgContainer, [this.width -
            //     10, 10
            // ]);
        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll("*").remove();

            // this.svgSave.updatePos([this.width - 10, 10])
            // this.svgSave.draw();
        }
    }

    updateColor(key) {
        let labels = this.data["paperList"].map(d => {
            if (Array.isArray(d[key]))
                return d[key][0];
            else
                return d[key];
        });

        labels = labels.map(d => {
            if (d === undefined)
                return "undefined";
            else
                return d;
        })

        // console.log(labels);
        let labelSet = new Set(labels);
        let labelMap = {};
        let i = 0;
        labelSet.forEach(function(value) {
            console.log(value, i);
            if (value === "undefined")
                labelMap[value] = -1;
            else
                labelMap[value] = i;
            i++;
        });
        let labelIndex = labels.map(d => labelMap[d]);

        // console.log(labelIndex);
        let colorScale = d3.scaleOrdinal(d3["schemeSet3"]);
        let nodeColor = labelIndex.map(d => {
            if (d >= 0) {
                return colorScale(d);
            } else {
                return "grey";
            }

        });
        this.nodeColor = nodeColor;

        this.svg
            .selectAll('.graphNode')
            .each(function(d, i) {
                d3.select(this).style("fill", nodeColor[i]);
            });
    }

    updateHighlight(indices) {
        let indexSet = new Set(indices);
        // console.log(indexSet.size);
        this.svg
            .selectAll('.graphNode')
            .each(function(d, i) {
                // console.log(d, i);
                if (indexSet.size > 0) {
                    if (!indexSet.has(i)) {
                        d3.select(this).attr("opacity", 0.2);
                    } else {
                        d3.select(this).attr("opacity", 1.0);
                    }
                } else {
                    d3.select(this).attr("opacity", 1.0);
                }

            })
    }

    updateFilter() {
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                this.filterState[key] = this.filterList.select(this
                    .div +
                    key).property('checked');
            }
        }
        // console.log(this.filterState);
        this.draw();
        // this.setData("filter", this.filterState);
    }

    redraw(threshold) {
        if (this.data["paperList"] && this.svg) {

            this.generateGraph(this.data["paperList"], threshold);
            // console.log("link size:", this.links.length);
            this.runSimulation(this.nodes, this.links, -20);
        }
    }

    draw() {
        this.initSvg();

        if (this.data["paperList"]) {

            // let n = this.data["paperList"].length;
            // this.randomGraph(n, 2 * n, -20);
            let papers = this.data["paperList"];
            if (papers) {
                let threshold = this.threshold();
                this.generateGraph(papers, threshold);
                this.links = [];
                while (this.links.length < this.nodes.length * 10) {
                    this.generateGraph(papers, threshold);
                    console.log("link size:", this.links.length,
                        " threshold:", threshold);
                    threshold = threshold - 1.0;
                }
                this.runSimulation(this.nodes, this.links, -20);
            }
        }
    }

    resize() {
        this.draw();
    }

    paperDist(p1, p2) {
        // console.log(p1, p2)
        let dist = 0.0;
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key))
                if (this.filterState[key]) {
                    if (Array.isArray(p1[key]) && Array.isArray(p2[
                            key])) {
                        for (let i = 0; i < p1[key].length; i++)
                            for (let j = 0; j < p2[key].length; j++) {
                                if (p1[key][0] instanceof Object) {
                                    if (p1[key][i]["chemical"] ===
                                        p2[key][j]["chemical"])
                                        dist += 1.0;

                                } else {
                                    if (p1[key][i] === p2[key][j])
                                        dist += 1.0;
                                }
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
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                if (this.filterState[key])
                    count += 1.0;
            }
        }
        return count - 1.0 + 0.5;

    }

    generateGraph(papers, threshold) {
        // let threshold = 0.0;
        // console.log("threshold:", threshold);
        // this.slider.setValue(threshold);
        this.currentEdgeThreshold = threshold;
        if (!this.nodes || this.nodes.length != papers.length) {
            this.nodes = d3.range(papers.length).map(Object);
        }
        // this.nodes = d3.range(papers.length).map(Object);
        let edgeList = [];
        for (var i = 0; i < papers.length; i++)
            for (var j = 0; j < papers.length; j++)
                if (i > j) {
                    let dist = this.paperDist(papers[i], papers[j]);
                    // console.log(dist);
                    // if (dist > threshold)
                    //     edgeList.push([i, j, dist]);
                    if (threshold) {
                        if (dist > threshold)
                            edgeList.push([i, j, dist]);
                    } else {
                        if (dist > this.slider.value)
                            edgeList.push([i, j, dist]);
                    }
                }

        this.links = edgeList.map(function(edge) {
            return {
                source: edge[0],
                target: edge[1],
                distance: edge[2]
            }
        });

    }

    runSimulation(nodes, links, charge) {
        let controlHeight = d3.select(this.div + "filter").node().getBoundingClientRect()
            .height;
        // console.log(controlHeight);
        // this.controlHeight = controlHeight;

        let svg = this.svg;
        let width = this.width - this.marginWidth;
        let height = this.height - controlHeight - 8;

        if (!this.simulation) {
            this.simulation = d3.forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(charge))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('link', d3.forceLink().links(links).distance(d =>
                    d.distance))
                .force('collision', d3.forceCollide().radius(7))
                .on('tick', tick.bind(this));
        } else {
            this.simulation
                .force('link', d3.forceLink().links(links).distance(d =>
                    d.distance))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .on('tick', tick.bind(this));
            // console.log("simulation restart!");
            this.simulation.alpha(0.3).restart();
        }

        if (this.svg.select("#graphlink").empty()) {
            this.svg.append("g")
                .attr("class", "links")
                .attr("id", "graphlink");
        }
        if (this.svg.select("#graphNode").empty()) {
            this.svg.append("g")
                .attr("class", "nodes")
                .attr("id", "graphNode");
        }

        ////////// draw graph ///////////
        let radius = 6;

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
                    return d.x = Math.max(radius, Math.min(
                        width -
                        radius, d.x));
                })
                .attr("cy", function(d) {
                    return d.y = Math.max(radius, Math.min(
                        height -
                        radius, d.y));
                })
                .attr("r", radius)
                .attr("class", "graphNode")
                .style("fill", (d, i) => {
                    if (this.nodeColor) {
                        return this.nodeColor[i];
                    } else {
                        return "grey";
                    }
                })
                .style("stroke", "white")
                .style("stroke-width", 2)
                // .on("mouseover", function(d) {
                //     d3.select(this).style("fill", "lightgrey")
                // })
                // .on("mouseout", function(d) {
                //     d3.select(this).style("fill", "grey")
                // })
                .on("click", (d) => {
                    // console.log(this.data["paperList"][d.index]);
                    this.setData("paper", this.data["paperList"]
                        [d.index]);
                });

            v.exit().remove();
        }
    }

    //// for testing ////
    randomGraph(n, m, charge) {
        //creates a random graph on n nodes and m links
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
}
