class filterComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList"]);

        this.callFunc("loadData", {
            "filename": "papers.json"
        });

        $(this.div + "container").parent().css("overflow-y", "scroll");
        // this.setupUI();
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
        this.union = new tagInput(this.div + 'union', this.highTagList);
        this.union.setChangeTagCallback(this.onUpdateUnion.bind(this));

        this.interset = new tagInput(this.div + 'interset', this.highTagList);
        this.interset.setChangeTagCallback(this.onUpdateInterset.bind(this));

        this.exclude = new tagInput(this.div + 'exclude', this.highTagList);
        this.exclude.setChangeTagCallback(this.onUpdateExclude.bind(this));
    }

    onUpdateUnion() {

    }

    onUpdateInterset() {

    }

    onUpdateExclude() {

    }

    // onAddTag(tag) {
    //     console.log("Added a tag: " + tag);
    // }
    //
    // onRemoveTag(tag) {
    //     console.log("Removed a tag: " + tag);
    // }
    //
    // onChangeTag(input, tag) {
    //     console.log("Changed a tag: " + tag);
    // }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        // console.log(msg);
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
            default:
        }
    }

    filterPaper(papers) {
        ///// filter paper /////
        return papers;
    }
}
