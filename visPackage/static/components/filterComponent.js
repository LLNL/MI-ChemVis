class filterComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList"]);

        this.callFunc("loadData", {
            "filename": "papers.json"
        });

        $(this.div + "container").parent().css("overflow-y", "scroll");
        // this.setupUI();
        this.setupUI();
    }

    setupUI() {
        // console.log(this.div);
        this.union = new tagInput(this.div + 'union', "rgb(44, 160, 44)");
        this.union.setChangeTagCallback(this.onUpdateUnion.bind(this));

        this.interset = new tagInput(this.div + 'interset',
            "rgb(31, 119, 180)");
        this.interset.setChangeTagCallback(this.onUpdateInterset.bind(this));

        this.exclude = new tagInput(this.div + 'exclude',
            "rgb(214, 39, 40)");
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
