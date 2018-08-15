class comparisonComponenet extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paper"]);
        this.isFocusedOnRef = true;

        this.setupUI();

        //set key that exclude from the comparison
        this.excludeSet = new Set(["abstract", "name", "doi", "authors",
            "temp", "fileName", "experimentalSentences", "url",
            "mpid", "size", "notes", "time", "_id", "experimental",
            "volume"
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
            console.log(this.compare);
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
            this.tableEntry = [];
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
                let i = 0;
                intersect.forEach(k => {
                    if (i === 0)
                        this.tableEntry.push([key, k, k, 0]);
                    else
                        this.tableEntry.push(["", k, k, 0]);
                    i++;
                });

                var refDiff = new Set([...refSet].filter(x => !
                    intersect.has(x)));
                if (refDiff.size !== 0) {
                    refDiff.forEach(k => {
                        if (i === 0)
                            this.tableEntry.push([key, k,
                                "", 1
                            ]);
                        else
                            this.tableEntry.push(["", k, "",
                                1
                            ]);
                        i++;
                    });

                }
                var compDiff = new Set([...compSet].filter(x => !
                    intersect.has(x)));
                if (compDiff.size !== 0) {
                    compDiff.forEach(k => {
                        if (i === 0)
                            this.tableEntry.push([key, "",
                                k, 2
                            ]);
                        else
                            this.tableEntry.push(["", "", k,
                                2
                            ]);
                        i++;
                    });
                }
            });
            // console.log(this.tableEntry);
            d3.select(this.div + "table").selectAll("*").remove();
            var thead = d3.select(this.div + "table").append('thead');
            var tbody = d3.select(this.div + "table").append('tbody');
            console.log(thead, tbody);
            // append the header row
            let columns = ["label", "reference", "compare"];
            thead.append('tr')
                .selectAll('th')
                .data(columns).enter()
                .append('th')
                .text(t => t);

            let data = this.tableEntry;
            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

            // create a cell in each row for each column
            let colormap = ["lightgreen", "lightgrey", "Gainsboro"];
            var cells = rows.selectAll('td')
                .data(function(row) {
                    return columns.map(function(column, i) {
                        let entry = row[i];
                        // if (entry instanceof Array)
                        //     entry = entry[0];
                        if (entry instanceof Object) {
                            // console.log(entry);
                            if (Object.keys(entry).includes(
                                    "chemical"))
                                entry = entry["chemical"];
                            else
                                entry = entry[
                                    Object.keys(entry)[0]
                                ];
                        }

                        return {
                            column: column,
                            value: entry,
                            color: row[3]
                        };
                    });
                })
                .enter()
                .append('td')
                .style("background-color", d => colormap[d.color])
                .text(d => d.value);
        }
    }

    //init the UI
    setupUI() {
        $(this.div + "container").parent().css("overflow-y",
            "scroll");

    }

}
