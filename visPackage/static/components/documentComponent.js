class documentComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames([
            "paper",
            "selectionFilter", //this necessary to maintain filter consistency
            "highlightFilter", //this necessary to maintain filter consistency
        ]);

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
            console.log(paper);

            d3.select(this.div + "title")
                .html(paper.name)
                .style("font-size", 20);

            d3.select(this.div + "authors")
                .html(paper.authors);

            d3.select(this.div + "abstract")
                .html("<b>Abstract:</b> " + paper.abstract);

            let tags = []
            tags.push({
                tag: paper.morphology,
                tooltip: "morphology",
                keys: ["morphology"]
            });

            tags.push({
                tag: paper.material,
                tooltip: "material",
                keys: ["material"]
            });
            tags.push({
                tag: paper.metal_salts,
                tooltip: "metal_salts",
                keys: ["metal_salts"]
            });
            tags.push({
                tag: paper.solvents,
                tooltip: "solvents",
                keys: ["solvents"]
            });
            tags.push({
                tag: paper.surfactants,
                tooltip: "surfactants",
                keys: ["surfactants"]
            });
            tags.push({
                tag: paper.reducing_agents,
                tooltip: "reducing_agents",
                keys: ["reducing_agents"]
            });
            tags.push({
                tag: paper.chemicals.map(d => d.chemical),
                // tag: paper.chemicals.map(d => d.mf),
                tooltip: "chemical",
                keys: ["chemicals", "chemical"]
            });
            tags.push({
                tag: paper.method,
                tooltip: "method",
                keys: ["method"]
            });
            tags.push({
                tag: paper.pixie_dust,
                tooltip: "pixie_dust",
                keys: ["pixie_dust"]
            });
            // tags.push({
            //     tag: paper.pressure,
            //     tooltip: "pressure",
            //     keys: ["pressure"]
            // });
            // console.log(tags);

            let labels = new tagLabel(this.div + "tags", tags, true);

            labels.bindHighlightCallback((type, tag) => {
                tag = tag.join(":");
                console.log("bindHighlightCallback", type, tag);
                if (type === "replace") {
                    this.setData("highlightFilter", [tag]);
                } else if (type === "add") {
                    let filter = [];
                    if (this.data["highlightFilter"]) {
                        filter = this.data[
                            "highlightFilter"];
                        // console.log(filter);
                    }

                    if (filter.length === 0)
                        this.setData("highlightFilter", [tag]);
                    else {
                        let tagSet = new Set(filter);
                        if (!tagSet.has(tag)) {
                            this.setData("highlightFilter", filter.concat(
                                [tag]));
                        }
                    }
                }
            });

            labels.bindSelectionCallback((type, tag) => {
                tag = tag.join(":");
                console.log("bindSelectionCallback", type, tag);
                if (type === "replace") {
                    this.setData("selectionFilter", [tag]);
                } else if (type === "add") {
                    let filter = [];
                    if (this.data["selectionFilter"])
                        filter = this.data[
                            "selectionFilter"];
                    // console.log(filter);
                    if (filter.length === 0)
                        this.setData("selectionFilter", [tag]);
                    else {
                        let tagSet = new Set(filter);
                        if (!tagSet.has(tag)) {
                            this.setData("selectionFilter", filter.concat(
                                [tag]));
                        }
                    }
                }
            })

            d3.select(this.div + "link")
                .attr("href", paper.url);
        }
    }
}
