class graphComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList", "selection", "highlight"]);

        this.selection = [];

        /////// edge filter options ///////
        this.filterState = {
            "morphology": false,
            "material": true,
            "solvents": false,
            "surfactants": false,
            "method": false,
            "reducing_agents": false

            // "chemicals": false
            // "composition": true
        };
        this.colorKey = "material";

        this.marginWidth = 10;
        this.setupUI();

        this.colorScale = d3.scaleOrdinal(d3['schemeSet3']);
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paperList":
                console.log("paperList updated");
                this.setData("paper", this.data['paperList'][0]);
                this.draw();
                break;
            case "selection":
                // console.log(this.data["selection"]);
                // if (this.data["selection"].length > 0) {
                this.selection = this.data["selection"];
                this.draw();
                break;
            case "highlight":
                this.updateHighlight();
                break;
        }
    }

    setupUI() {

        // for (let key in this.filterState) {
        //     if (this.filterState.hasOwnProperty(key)) {
        //         let li = this.filterList.append("div")
        //             .attr("class", "custom-control custom-radiobox")
        //             .style("display", "inline-block")
        //             .style("padding-left", "1.3rem")
        //             .style("padding-right", "1.0rem");
        //         li.append("input")
        //             .attr("type", "checkbox")
        //             .attr("id", this.uuid + key)
        //             .attr("class", "custom-control-input")
        //             .property('checked', this.filterState[key])
        //             .on("click", this.updateFilter.bind(this));
        //         li.append("label")
        //             .attr("class", "custom-control-label")
        //             .attr("for", this.uuid + key)
        //             .text(key + "\t");
        //     }
        // }
        this.filterList = d3.select(this.div + "filter");
        let edgeDropdown = this.filterList.append("div")
            .attr("class", "btn-group");
        edgeDropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .html("group-by");
        let edgeMenu = edgeDropdown.append("div")
            .attr("class", "dropdown-menu");

        let colorDropdown = this.filterList.append("div")
            .attr("class", "btn-group");
        colorDropdown.append("button")
            .attr("class", "btn btn-info btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .style("margin-left", '10px')
            .html("color-by");
        let colorMenu = colorDropdown.append("div")
            .attr("class", "dropdown-menu");

        this.edgeLabel = this.filterList.append("span")
            .attr("class", "badge")
            .style("margin-left", '10px')
            .style("background-color", "#868e96")
            .style("color", "white");

        this.colorLabel = this.filterList.append("span")
            .attr("class", "badge badge-info")
            .style("margin-left", '10px');

        /// setup menu entries ////
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                edgeMenu.append("a")
                    .attr("class", "dropdown-item")
                    .on("click", d => {
                        this.updateEdge(key);
                        this.edgeLabel.html(key);
                    })
                    .html(key);
            }
        }

        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                colorMenu.append("a")
                    .attr("class", "dropdown-item")
                    .on("click", d => {
                        this.updateColor(key);
                        this.colorLabel.html(key);
                    })
                    .html(key);
            }
        }

        //FIXME init the badge
        this.edgeLabel.html(this.colorKey);
        this.colorLabel.html(this.colorKey);
        // <button type="button" class="btn btn-secondary">Secondary</button>
        ///// add edge control buttons //////
        // this.filterList.append("button")
        //     .attr("type", "button")
        //     .attr("class", "btn btn-sm btn-secondary")
        //     .style("margin-left", "5px")
        //     .html("+")
        //     .attr("data-toggle", "tooltip")
        //     .attr("data-placement", "top")
        //     .attr("title", "increase edges")
        //     .on("click", d => {
        //         this.redraw(this.currentEdgeThreshold - 1.0)
        //     });
        // this.filterList.append("button")
        //     .attr("type", "button")
        //     .attr("class", "btn btn-sm btn-secondary")
        //     .style("margin-left", "5px")
        //     .html("-")
        //     .attr("data-toggle", "tooltip")
        //     .attr("data-placement", "top")
        //     .attr("title", "decrease edges")
        //     .on("click", d => {
        //         this.redraw(this.currentEdgeThreshold + 1.0)
        //     });

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

    updateEdge(key) {
        for (var d in this.filterState) {
            if (this.filterState.hasOwnProperty(d)) {
                this.filterState[d] = false;
            }
        }

        this.filterState[key] = true;
        this.redraw();
    }

    updateColor(key) {
        this.colorKey = key;
        let labels = this.papers.map(d => {
            d = d.data;
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

        //this is call in case, the tick of the simualtion is not activated when highlightupdate is require
        this.svg
            .selectAll('.node')
            .each(function(d, i) {
                d3.select(this).style("fill", nodeColor[i]);
            });

        this.updateHighlight();
    }

    updateHighlight() {
        if (this.data["highlight"] && this.papers) {

            //store the highlight information at nodeHighlight, because the circle may not be
            //create when this function is called, the circle is added during the simulation's tick circle
            let indexSet = new Set(this.data['highlight']);
            // console.log("graph.highlight: ", indexSet);
            this.nodeHighlight = this.papers.map(d => {
                if (indexSet.size > 0) {
                    if (indexSet.has(d.index))
                        return true;
                    else
                        return false;
                } else {
                    return true;
                }
            });
            let nodeHighlight = this.nodeHighlight;

            //this is call in case, the tick of the simualtion is not activated when highlight update is require
            this.svg
                .selectAll('.node')
                .each(function(d, i) {
                    if (nodeHighlight[i])
                        d3.select(this).style("opacity", 1.0);
                    else
                        d3.select(this).style("opacity", 0.2);
                })
        }
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

    redraw(threshold = 0.5) {
        if (this.data["paperList"] && this.svg) {
            this.papers = this.subselect();
            this.generateGraph(this.papers, threshold);
            // console.log("link size:", this.links.length);
            this.runSimulation(this.nodes, this.links, -10);
            //restore other visual elements
            // if (this.colorKey)
            //     this.updateColor(this.colorKey);
        }
    }

    subselect() {
        let papers = this.data["paperList"].map((d, i) => {
            return {
                "data": d,
                "index": i
            }
        });
        if (this.selection && this.selection.length > 0) {
            return this.selection.map(index => papers[index]);
        } else {
            return papers;
        }
    }

    draw() {
        this.initSvg();

        //reset simulation
        this.simulation = undefined;

        if (this.data["paperList"]) {
            this.papers = this.subselect();

            if (this.papers) {
                let threshold = this.threshold();
                this.generateGraph(this.papers, threshold);
                // this.links = [];
                // let count = 0
                // while (this.links.length < this.nodes.length * 10 && count <
                //     4) {
                //     this.generateGraph(this.papers, threshold);
                //     // console.log("link size:", this.links.length,
                //     // " threshold:", threshold);
                //     threshold = threshold - 1.0;
                //     count = count + 1.0;
                // }
                this.runSimulation(this.nodes, this.links, -10);
            }
            if (this.colorKey)
                this.updateColor(this.colorKey);

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
        return 0.5;
        // let count = 0;
        // for (let key in this.filterState) {
        //     if (this.filterState.hasOwnProperty(key)) {
        //         if (this.filterState[key])
        //             count += 1.0;
        //     }
        // }
        // return count - 1.0 + 0.5;

    }

    generateGraph(papers, threshold) {
        // let threshold = 0.0;
        // console.log("threshold:", threshold);
        this.currentEdgeThreshold = threshold;
        if (!this.nodes || this.nodes.length != papers.length) {
            this.nodes = d3.range(papers.length).map(Object);
        }
        let edgeList = [];
        for (var i = 0; i < papers.length; i++)
            for (var j = 0; j < papers.length; j++)
                if (i > j) {
                    let dist = this.paperDist(papers[i].data, papers[j].data);
                    // console.log(dist);
                    // if (dist > threshold)
                    //     edgeList.push([i, j, dist]);
                    if (threshold) {
                        if (dist > threshold)
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

        let svg = this.svg;
        let width = this.width - this.marginWidth;
        let height = this.height - controlHeight - 8;
        let radius = 6;

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
            this.simulation.alpha(0.8).restart();
        }

        if (this.svg.select("#graphlink").empty()) {
            this.svg.append("g")
                .attr("id", "graphlink");
        }
        if (this.svg.select("#graphNode").empty()) {
            this.svg.append("g")
                .attr("id", "graphNode");
        }

        ////////// draw graph //////////

        function tick() {
            // console.log("update");
            var u = this.svg
                .select('#graphlink')
                .selectAll('line')
                .data(links)

            u.enter()
                .append('line')
                .merge(u)
                .attr("class", 'link')
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
                .select('#graphNode')
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
                .attr("class", "node")
                .style("fill", (d, i) => {
                    if (this.nodeColor) {
                        return this.nodeColor[i];
                    } else {
                        return "grey";
                    }
                })
                .style("stroke", "white")
                .style("stroke-width", 2)
                .style("opacity", (d, i) => {
                    if (this.nodeHighlight) {
                        if (this.nodeHighlight[i])
                            return 1.0;
                        else
                            return 0.3;
                    }
                    return 1.0;
                })
                .on("click", (d) => {
                    this.setData("paper", this.data["paperList"]
                        [this.papers[d.index].index]);
                });

            v.exit().remove();
        }
    }
}
