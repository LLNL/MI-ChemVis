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
                tag: paper.morphology,
                tooltip: "morphology"
            })

            tags.push({
                tag: paper.material,
                tooltip: "material"
            })
            tags.push({
                tag: paper.method,
                tooltip: "method"
            })
            tags.push({
                tag: paper.metal_salts,
                tooltip: "metal_salts"
            })
            tags.push({
                tag: paper.solvents,
                tooltip: "solvents"
            })
            tags.push({
                tag: paper.surfactants,
                tooltip: "surfactants"
            })
            tags.push({
                tag: paper.reducing_agents,
                tooltip: "reducing_agents"
            })
            tags.push({
                tag: paper.chemicals.map(d => d.chemical),
                tooltip: "chemical"
            })
            console.log(tags);

            let labels = new tagLabel(this.div + "tags", tags, true);

            d3.select(this.div + "link")
                .attr("href", paper.url);
        }
    }
}
