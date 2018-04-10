class graphComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList"]);
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paperList":
                this.draw();
                break;
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

            // this.svgSave = new svgExporter(this.svgContainer, [this.width -
            //     10, 10
            // ]);
        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll(
                ".link, .node").remove();

            this.svgSave.updatePos([this.width - 10, 10])
            this.svgSave.draw();
        }
    }

    draw() {
        this.initSvg();
        let n = this.data["paperList"].length;
        this.randomGraph(n, 2 * n, -20);
    }


    randomGraph(n, m, charge) { //creates a random graph on n nodes and m links
        let svg = this.svg;
        let width = this.width;
        let height = this.height;

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

        // console.log(nodes, links);

        var simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(charge))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('link', d3.forceLink().links(links))
            .force('collision', d3.forceCollide().radius(10))
            .on('tick', tick.bind(this));

        // var svgLinks = svg.selectAll(".link").data(links)
        //     .enter().append("line")
        //     .attr("class", "link");
        //
        // var svgNodes = svg.selectAll(".node").data(nodes)
        //     .enter().append("circle")
        //     .attr("class", "node")
        //     .attr("r", 3)
        //     .style("fill", "white");

        // svgNodes.transition().duration(800)
        //     .attr("r", function(d) {
        //         return 3;
        //     })
        //     .style("fill", function(d) {
        //         // return colors(d.weight)
        //         return "grey";
        //     });
        //
        // svgLinks.transition().duration(800)
        //     .style("stroke-width", 3);
        this.svg.append("g").attr("class", "links");
        this.svg.append("g").attr("class", "nodes");

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
                .attr('cx', function(d) {
                    return d.x
                })
                .attr('cy', function(d) {
                    return d.y
                })
                .attr("r", 8)
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
