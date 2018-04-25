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
            "composition": true
        };

        this.marginWidth = 10;
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
                this.selection = this.data["selection"];
                // console.log("filter updated", this.filter);
                this.draw();
                break;
            case "highlight":
                this.highlight = this.data["highlight"];
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
                // .style("display", "inline-block");
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
        // <div class="btn-group">
        //   <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        //     Small button
        //   </button>
        //   <div class="dropdown-menu">
        //     ...
        //   </div>
        // </div>
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
                    .on("click", this.updateColor.bind(this))
                    .html(key);
            }
        }
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

    updateColor() {

    }

    updateFilter() {
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                this.filterState[key] = this.filterList.select(this.div +
                    key).property('checked');
            }
        }
        // console.log(this.filterState);
        this.draw();
        // this.setData("filter", this.filterState);
    }


    updateHighlight(indices) {

    }


    redraw(threshold) {
        if (this.data["paperList"]) {
            this.generateGraph(this.data["paperList"], threshold);
            // console.log("link size:", this.links.length);
            this.simulation(this.nodes, this.links, -20);
        }
    }

    draw() {
        this.initSvg();

        if (this.data["paperList"]) {

            // let n = this.data["paperList"].length;
            // this.randomGraph(n, 2 * n, -20);
            let papers = this.data["paperList"];
            if (papers) {
                this.generateGraph(papers, this.threshold());
                console.log("link size:", this.links.length);
                this.simulation(this.nodes, this.links, -20);
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
        for (let key in this.filterState) {
            if (this.filterState.hasOwnProperty(key)) {
                if (this.filterState[key])
                    count += 1.0;
            }
        }
        return count - 1.0;

    }

    generateGraph(papers, threshold) {
        // let threshold = 0.0;
        console.log("threshold:", threshold);
        this.slider.setValue(this.threshold() * 0.5);
        this.nodes = d3.range(papers.length).map(Object);
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

    simulation(nodes, links, charge) {

        let controlHeight = d3.select(this.div + "filter").node().getBoundingClientRect()
            .height;
        // console.log(controlHeight);
        // this.controlHeight = controlHeight;

        let svg = this.svg;
        let width = this.width - this.marginWidth;
        let height = this.height - controlHeight - 8;

        var simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(charge))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('link', d3.forceLink().links(links).distance(d => d.distance))
            .force('collision', d3.forceCollide().radius(7))

        .on('tick', tick.bind(this));

        this.svg.append("g").attr("class", "links");
        this.svg.append("g").attr("class", "nodes");

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
