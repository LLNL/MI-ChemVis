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

            d3.select(this.div + "morphology")
                .html(paper.morphology);

            d3.select(this.div + "link")
                .attr("href", paper.url);
        }

    }

}
