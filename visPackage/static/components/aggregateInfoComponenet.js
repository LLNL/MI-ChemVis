class aggregateInfoComponenet extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["selection", "paperList"]);
        this.setupUI();
    }

    setupUI() {
        this.container = d3.select(this.div);

        let dropdown = this.container.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .html("aggregate-by");
        let menu = dropdown.append("div")
            .attr("class", "dropdown-menu");
        menu.append("a")
            .attr("class", "dropdown-item")
            .on("click", d => {
                this.callFunc("aggregateByKeys", {
                    selection: [],
                    keys: ["chemicals", "mf"]
                });
            })
            .html("chemicals");
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

    parseFunctionReturn(msg) {
        super.parseFunctionReturn(msg);
        console.log(msg);
        switch (msg['func']) {
            case "aggregateByKeys":
                this.handleAggregateInfo(msg['data']);
                break;
        }
    }

    initSvg() {
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight);
            this.svg = this.svgContainer
                .append("g")
                .attr("width", this.width)
                .attr("height", this.height);

            this.barChart = new barChart(this.svg, [0, 20], [this.width,
                this.height * 0.45
            ]);
            this.barChart.setSelectionCallback(this.setHighlight.bind(
                this));

            this.scatter = new simpleScatterPlot(this.svg, [0, this.height *
                0.55
            ], [this.width, this.height * 0.40]);

        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight - controlHeight);

            this.svg
                .attr("width", this.width)
                .attr("height", this.height - controlHeight);

            this.barChart.update([0, 20], [this.width,
                this.height * 0.45
            ]);
            this.scatter.update([0, this.height *
                0.5
            ], [this.width, this.height * 0.45]);
        }
    }

    setHighlight(list) {
        console.log(list);
        this.setData("highlight", list);
    }

    handleAggregateInfo(data) {
        // console.log(data);
        this.barChart.setData(data['data']['aggregation']);
        this.scatter.setData([
            [0, 1],
            [4, 6],
            [1, 1],
            [0, 5]
        ], ["axisX", "axisY"]);

    }

    /*
    Half scatterplot / half bar chat
    */
    draw() {
        this._updateWidthHeight();

        this.initSvg();
        // bar char
        this.barChart.draw();
        // scatterplot
        this.scatter.draw();
    }

}
