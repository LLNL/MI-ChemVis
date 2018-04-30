class aggregateInfoComponenet extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["selection", "paperList", "highlight"]);

        this.aggregators = [
            ["chemicals", "mf"],
            ["material"],
            ["morphology"],
            ["solvents"],
            ["reducing_agents"],
            ["method"],
            ["surfactants"]
        ];

        this.valueAggregators = [
            ["temp", "value"],
            ["size", "orig_val"],
            ["time", "value"]
        ];

        this.setupUI();

        //init the views
        this.aggregateLabelsByKeys([], this.aggregators[0]);
        this.aggregateValuesByKeys([],
            this.valueAggregators[0],
            this.valueAggregators[1]);
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
            .html("bar-group-by");
        let menu = dropdown.append("div")
            .attr("class", "dropdown-menu");
        ////// generate
        for (let i = 0; i < this.aggregators.length; i++) {
            let keys = this.aggregators[i];
            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.aggregateLabelsByKeys(this.selection, keys);
                })
                .html(keys[0]);
        }

        /////////////// scatterplot controls //////////////
        dropdown = this.container.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .style("margin-left", '20px')
            .html("x-group-by");
        menu = dropdown.append("div")
            .attr("class", "dropdown-menu");
        ////// generate
        for (let i = 0; i < this.valueAggregators.length; i++) {
            let keys = this.valueAggregators[i];
            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.aggregateValuesByKeys(
                        this.selection, keys,
                        this.keysY
                    );
                })
                .html(keys[0]);
        }

        dropdown = this.container.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .style("margin-left", '5px')
            .html("y-group-by");
        menu = dropdown.append("div")
            .attr("class", "dropdown-menu");
        ////// generate
        for (let i = 0; i < this.valueAggregators.length; i++) {
            let keys = this.valueAggregators[i];
            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.aggregateValuesByKeys(this.selection, this.keysX,
                        keys);
                })
                .html(keys[0]);
        }
    }

    aggregateLabelsByKeys(selection, keys) {
        this.keysBar = keys;
        this.callFunc("aggregateLabelsByKeys", {
            "selection": selection,
            "keys": keys
        });
    }

    aggregateValuesByKeys(selection, keysX, keysY) {
        ///store previous keys
        this.keysX = keysX;
        this.keysY = keysY;

        this.callFunc("aggregateValuesByKeys", {
            "selection": selection,
            "keysX": keysX,
            "keysY": keysY
        });
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
                this.draw();
                break;
            case "highlight":
                this.handleHighlight(this.data["highlight"]);
                break;
        }
    }

    parseFunctionReturn(msg) {
        super.parseFunctionReturn(msg);
        // console.log(msg);
        switch (msg['func']) {
            case "aggregateLabelsByKeys":
                this.handleAggregateLabelInfo(msg['data']['data']);
                break;
            case "aggregateValuesByKeys":
                this.handleAggregateValueInfo(msg['data']['data']);
                break;
        }
    }

    initSvg() {
        let controlHeight = d3.select(this.div + "control").node().getBoundingClientRect()
            .height;
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight - controlHeight);
            this.svg = this.svgContainer
                .append("g")
                .attr("width", this.width)
                .attr("height", this.height - controlHeight);

            this.barChart = new barChart(this.svg, [15, 15], [
                this.width - 15,
                this.height * 0.45
            ]);

            this.barChart.bindHighlightCallback(this.setHighlight.bind(
                this));

            this.scatter = new simpleScatterPlot(this.svg, [0, this.height *
                0.50 + controlHeight
            ], [this.width, this.height * 0.45 - controlHeight]);
            this.scatter.bindSelectionCallback(d => {
                this.selectPaperByIndex(d[2]);
                // this.setData("highlight", [d[2]])
            });

        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight - controlHeight);

            this.svg
                .attr("width", this.width)
                .attr("height", this.height - controlHeight);

            this.barChart.update([15, 15], [this.width - 15,
                this.height * 0.45
            ]);
            this.scatter.update([0, this.height *
                0.50 + controlHeight
            ], [this.width, this.height * 0.45 - controlHeight]);
        }
    }

    selectPaperByIndex(index) {
        this.setData("paper", this.data["paperList"][index]);
    }

    setHighlight(tagList) {
        // console.log("\nsetHighlight", tagList);
        this.setData("highlightFilter", tagList);
    }

    handleAggregateLabelInfo(data) {
        // console.log(data);
        if (this.barChart) {
            this.barChart.setData(
                data['aggregation'],
                data['keys'][0],
                data['keys'].join(":")
            );
        }

    }

    handleAggregateValueInfo(data) {
        // console.log(data);
        if (this.scatter) {
            this.scatter.setData(data['aggregation'], [data['keysX'][0],
                data['keysY'][0]
            ]);
        }
    }

    handleHighlight(indices) {
        if (this.scatter)
            this.scatter.highlight(indices);
        if (this.barChart)
            this.barChart.highlight(indices);
    }

    /*
    Half scatterplot / half bar chat
    */
    draw() {
        this._updateWidthHeight();

        this.initSvg();
        // bar char
        if (this.keysBar) {
            this.aggregateLabelsByKeys(this.selection, this.keysBar);
        }

        if (this.keysX && this.keysY) {
            this.aggregateValuesByKeys(this.selection, this.keysX, this.keysY);
        }

        this.barChart.draw();
        // scatterplot
        this.scatter.draw();
    }

    resize() {
        this.draw();
    }

}
