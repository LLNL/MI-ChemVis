class filterComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList", "highlightFilter"]);

        this.callFunc("loadData", {
            "filename": "papers.json"
        });

        //allow scrow in the panel
        $(this.div + "container").parent().css("overflow-y", "scroll");

        this.highTagList = [
            "morphology",
            "material",
            "metal_salts",
            "solvents",
            "surfactants",
            "reducing_agents",
            "chemicals",
            "method",
            "pixie_dust"
        ];

        this.setupUI();
    }

    setupUI() {
        // console.log(this.div);
        this.selection = new tagInput(this.div + 'selection', this.highTagList);
        this.selection.setChangeTagCallback(this.onUpdateSelection.bind(
            this));

        this.highlight = new tagInput(this.div + 'highlight', this.highTagList);
        this.highlight.setChangeTagCallback(this.onUpdateHighlight.bind(
            this));

        d3.select(this.div + "clearSelection").on("click", this.highlight.clearTags
            .bind(this));

        d3.select(this.div + "clearHighlight").on("click",
            d => {
                this.highlight.clearTags();
            });
    }

    onUpdateSelection(listOfTag) {
        console.log(listOfTag);
    }

    onUpdateHighlight(listOfTag) {
        console.log("onUpdateHighlight:", listOfTag);
        this.setData("highlightFilter", listOfTag);
        listOfTag = listOfTag.map(d => d.split(":"));
        this.callFunc("highlightByTags", {
            "tags": listOfTag
        });
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        console.log(msg);
        switch (msg['name']) {
            case "paperList":
                let papers = this.data["paperList"];
                this.setData("paper", papers[0]);
                break;

            case "fullPaperList":
                // let papers = this.filterPaper(this.data["fullPaperList"]);
                // this.setData("paperList", papers);
                // this.setData("paper", papers[0]);
                break;

            case "highlightFilter":
                // let highlightFilter = Array.from(this.data[
                // "highlightFilter"]);
                let highlightFilter = this.data[
                    "highlightFilter"];
                // highlightFilter = highlightFilter.map(d => d.split(":"));
                this.highlight.setTags(highlightFilter);
                break;

            case "selectionFilter":
                // let selectFilter = Array.from(this.data["selectionFilter"]);
                let selectionFilter = this.data[
                    "selectionFilter"];
                // selectFilter = selectFilter.map(d => d.split(":"));
                this.selection.setTags(selectionFilter);
                break;

            default:
                break;
        }
    }

    filterPaper(papers) {
        ///// filter paper /////
        return papers;
    }
}
