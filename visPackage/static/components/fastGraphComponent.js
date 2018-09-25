class fastGraphComponent extends graphComponent {
    constructor(uuid) {
        super(uuid);
    }

    updateNodePos(nodes, pos, width, height) {
        let posX = pos.map(d => d[0]);
        let posY = pos.map(d => d[1]);
        let minX = Math.min(...posX);
        let maxX = Math.max(...posX);
        let minY = Math.min(...posY);
        let maxY = Math.max(...posY);
        posX = posX.map(d => (d - minX) / (maxX - minX));
        posY = posY.map(d => (d - minY) / (maxY - minY));
        nodes = nodes.map((d, i) => {
            d.x = posX[i] * width;
            d.y = posY[i] * height;
            d.index = i;
            return d;
        });
        return nodes;
    }

    parseFunctionReturn(msg) {
        super.parseFunctionReturn(msg);
        switch (msg['func']) {
            case "layoutGraph":
                let posDict = msg["data"]["data"];

                this.posDict = posDict;
                let pos = Object.keys(posDict).map(d => posDict[d]);
                console.log(pos);

                if (this.nodes) {
                    let controlHeight = d3.select(this.div + "filter").node()
                        .getBoundingClientRect()
                        .height;
                    let width = this.width - this.marginWidth;
                    let height = this.height - controlHeight - 8;

                    // console.log(pos);
                    this.nodes = this.updateNodePos(this.nodes, pos, width,
                        height);

                    let nodes = this.nodes;
                    let links = this.links;
                    let radius = 6;
                    this.drawGraph(nodes, links, width, height, radius);
                }
                break;
        }
    }

    draw() {
        this.initSvg();

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
                // this.runSimulation(this.nodes, this.links, -10);
                // this.runColaSimulation(this.nodes, this.links);
                this.layoutGraph();
            }
            if (this.colorKey)
                this.updateColor(this.colorKey);

        }
    }

    layoutGraph() {
        let params = {
            // "nodes": this.nodes;
            "links": this.links.map(d => {
                return [d["source"], d["target"]];
            })
        };

        if (this.pos) {
            params["pos"] = this.posDict;
        }

        this.callFunc("layoutGraph", params);
    }

    redraw(threshold = 0.5) {
        if (this.data["paperList"] && this.svg) {
            this.papers = this.subselect();
            this.generateGraph(this.papers, threshold);
            this.layoutGraph();
        }
    }
}
