class comparisonComponenet extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paper"]);
        this.isFocusedOnRef = true;
        this.setupUI();
        this.excludeSet = new Set(["abstract", "name", "doi", "authors",
            "temp", "fileName", "experimentalSentences"
        ]);
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "paper":
                // console.log(this.data["paper"]);
                this.draw();
                break;
        }
    }

    draw() {
        if (this.reference || !this.isFocusedOnRef) {
            this.compare = JSON.parse(JSON.stringify(this.data["paper"]));
        } else {
            this.reference = JSON.parse(JSON.stringify(this.data["paper"]));
        }

        //if both exist compare them
        if (this.reference && this.compare) {
            var keys = new Set();

            //collect all the keys
            for (var key in this.reference) {
                if (this.reference.hasOwnProperty(key) && !this.excludeSet.has(
                        key))
                    keys.add(key);
            }
            for (var key in this.compare) {
                if (this.compare.hasOwnProperty(key) && !this.excludeSet.has(
                        key))
                    keys.add(key);
            }

            //loop through all the keys
            var tableEntry = [];
            keys.forEach(key => {
                var refSet = new Set();
                var compSet = new Set();
                if (this.reference.hasOwnProperty(key)) {
                    if (Array.isArray(this.reference[key]))
                        refSet = new Set(this.reference[key]);
                    else
                        refSet = new Set([this.reference[key]]);
                }
                if (this.compare.hasOwnProperty(key)) {
                    if (Array.isArray(this.compare[key]))
                        compSet = new Set(this.compare[key]);
                    else
                        compSet = new Set([this.compare[key]]);
                }
                //write the intersect first, then the ref, comp
                var intersect = new Set([...refSet].filter(x =>
                    compSet.has(x)));
                tableEntry.push([key, ...intersect]);

                var refDiff = new Set([...refSet].filter(x => !
                    intersect.has(x)));
                if (refDiff.size !== 0)
                    tableEntry.push([key, ...refDiff]);
                var compDiff = new Set([...compSet].filter(x => !
                    intersect.has(x)));
                if (compDiff.size !== 0)
                    tableEntry.push([key, ...compDiff]);
            });
            console.log(tableEntry);
        }
    }

    //init the UI
    setupUI() {

    }

}
