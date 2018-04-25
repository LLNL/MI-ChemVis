class documentComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paper"]);

        $(this.div + "container").parent().css("overflow-y", "scroll");
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paper":
                console.log(this.data["paper"]);
                this.draw();
                break;
        }
    }

    draw() {
        //show paper information
        if (this.data["paper"]) {
            let paper = this.data["paper"];
            d3.select(this.div + "title")
                .html(paper.name)
                .style("font-size", 20);

            d3.select(this.div + "authors")
                .html(paper.authors);

            d3.select(this.div + "abstract")
                .html(paper.abstract);

            let tags = []
            tags.push({
                tag: paper.morphology[0],
                tooltip: "morphology"
            })

            tags.push({
                tag: paper.material,
                tooltip: "material"
            })
            tags.push({
                tag: paper.method[0],
                tooltip: "method"
            })
            tags.push({
                tag: paper.metal_salts[0],
                tooltip: "metal_salts"
            })
            tags.push({
                tag: paper.solvents[0],
                tooltip: "solvents"
            })
            tags.push({
                tag: paper.surfactants[0],
                tooltip: "surfactants"
            })
            tags.push({
                tag: paper.reducing_agents[0],
                tooltip: "reducing_agents"
            })

            let labels = new tagLabel(this.div + "tags", tags, true);

            d3.select(this.div + "link")
                .attr("href", paper.url);
        }
    }
}
