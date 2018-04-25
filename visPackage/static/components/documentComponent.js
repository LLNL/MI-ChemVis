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

            let tags = paper.morphology;
            tags = tags.concat(
                    [paper.material],
                    paper.method,
                    paper.metal_salts,
                    paper.solvents,
                    paper.surfactants,
                    paper.reducing_agents
                )
                // console.log(tags);
                // , paper.
            let labels = new tagLabel(this.div + "tags", tags, true);

            d3.select(this.div + "link")
                .attr("href", paper.url);
        }

    }

}
