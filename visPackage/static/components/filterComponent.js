class filterComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["paperList"]);

        this.callFunc("loadData", {
            "filename": "papers.json"
        });


        $(this.div + "container").parent().css("overflow-y", "scroll");
        // this.setupUI();
        // this.updateFilter();
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

    onUpdateExclude() {}

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

    draw() {

    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        // console.log(msg);
        switch (msg['name']) {
            case "paperList":
                let papers = this.data["paperList"];
                this.draw();

                // let flat_sme_papers = this.flatten_normal_data(papers, true);
                // console.log(flat_sme_papers);
                // this.setup_filters(flat_sme_papers);
                break;
            default:

        }

    }


    //// helper ////
    flatten_normal_data(papers, chemicals_nested) {
        /**
         * Return a big list of dicts containing the flattened and 'normal' data with the expected units. Ranges are flattened into 2 values
         * chemicals_nested = True if conc, weight, volume nested/associated with a chemical
         * Data with incorrect units (mg for concentration for example) will be discarded
         * Don't include abstract or experimental section
         */
        function flatten_numerical_unit_data(data, good_unit) {
            /**
             * Return an array of the values
             * Numerical data will be in this format. This example represents two entries like "100 - 240 C" and "150 C" for one paper (or chemical)
             * Should return [100, 240, 150]
             "temp": [
                [
                  {
                    "orig_unit": "C",
                    "orig_val": 100.0,
                    "unit": "C",
                    "value": 100.0
                  },
                  {
                    "orig_unit": "C",
                    "orig_val": 240.0,
                    "unit": "C",
                    "value": 240.0
                  }
                ],
                [
                  {
                    "orig_unit": "C",
                    "orig_val": 150.0,
                    "unit": "C",
                    "value": 150.0
                  }
                ],
              ],
             */
            if (data == null || data.length === 0)
                return [null];
            var res = [];
            data.forEach(function(a) {
                a.forEach(function(b) {
                    if (b.unit == good_unit)
                        res.push(b.value);
                    // else
                    //     console.log(
                    //         "ignoring for bad unit (good=",
                    //         good_unit, ") ", debug_paper_id,
                    //         JSON.stringify(b), " in ", JSON
                    //         .stringify(
                    //             data));
                });
            });
            return res
        }

        function cartesian_product(lists) {
            // Treat empty lists as [null]
            lists.forEach(function(d) {
                if (d.length == 0) d.push(null);
            });
            return lists.reduce(function(a, b) {
                var res = [];
                a.forEach(function(a) {
                    b.forEach(function(b) {
                        res.push(a.concat([b]));
                    });
                });
                return res;
            }, [
                []
            ]);
        }
        var unit_map = {
            "temp": "C",
            "pressure": "Pa",
            "time": "s",
            "size": "m",
            "concentration": "M",
            "volume": "L",
            "weight": "g"
        };
        var rows = [];
        // Maybe this should be extracted to its own function??????
        if (chemicals_nested) {
            papers.forEach(function(paper) {
                let multi_flat = {};
                let paper_row = {};
                let debug_paper_id = paper._id;
                Object.keys(paper).forEach(function(key) {
                    // Which have multiple values per paper
                    if (key === "temp" || key ===
                        "pressure" ||
                        key === "time" || key === "size") {
                        multi_flat[key] =
                            flatten_numerical_unit_data(
                                paper[
                                    key], unit_map[key])
                    } else if (["morphology", "metal_salts",
                            "reducing_agents",
                            "surfactants",
                            "solvents", "pixie_dust",
                            "method"
                        ].includes(key)) {
                        multi_flat[key] = paper[key];
                    } else if (key !== "chemicals" && key !==
                        "abstract") {
                        paper_row[key] = paper[key]
                    }
                });
                paper.chemicals.forEach(function(chemical) {
                    let chem_row_copy = Object.assign({},
                        paper_row); // per chemical
                    Object.keys(chemical).forEach(function(
                        key) {
                        if (key !== "concentration" &&
                            key !== "volume" && key !==
                            "weight") {
                            chem_row_copy[key] =
                                chemical[key];
                        }
                    });
                    ["concentration", "volume", "weight"].forEach
                        (function(x) {
                            multi_flat[x] =
                                flatten_numerical_unit_data(
                                    chemical[x],
                                    unit_map[x]
                                );
                        });
                    let products = cartesian_product(Object
                        .values(
                            multi_flat));
                    // Cartesian product. One row for each product
                    products.forEach(function(product) {
                        let row = Object.assign({},
                            chem_row_copy);
                        Object.keys(multi_flat).forEach(
                            function(key, i) {
                                row[key] =
                                    product[
                                        i];
                            });
                        rows.push(row);
                    })
                });
            });
        } else {
            papers.forEach(function(paper) {
                let multi_flat = {};
                let paper_row = {};
                Object.keys(paper).forEach(function(key) {
                    // Which have multiple values per paper
                    if (["temp", "pressure", "time", "size",
                            "concentration", "volume",
                            "weight"
                        ].includes(key)) {
                        multi_flat[key] =
                            flatten_numerical_unit_data(
                                paper[
                                    key], unit_map[key])
                    } else if (["morphology", "metal_salts",
                            "reducing_agents",
                            "surfactants",
                            "solvents", "pixie_dust",
                            "method"
                        ].includes(key)) {
                        multi_flat[key] = paper[key];
                    } else {
                        if (key !== "chemicals" && key !==
                            "experimentalSection") { // exclude experimentalSentences bc we dont use it
                            paper_row[key] = paper[key];
                        }
                    }
                });
                let products = cartesian_product(Object.values(
                    multi_flat));
                paper.chemicals.forEach(function(chemical) {
                    let chem_row_copy = Object.assign({},
                        paper_row); // per chemical
                    Object.keys(chemical).forEach(function(
                        key) {
                        chem_row_copy[key] =
                            chemical[
                                key];
                    });
                    products.forEach(function(product) {
                        let row = Object.assign({},
                            chem_row_copy);
                        Object.keys(multi_flat).forEach(
                            function(key, i) {
                                row[key] =
                                    product[
                                        i];
                            });
                        rows.push(row);
                    });
                });
            })
        }
        return rows;
    }

    setup_filters(papers) {
        function pretty_label(string) {
            // Return string with capitalization and _ changed to spaces
            return string.slice(0, 1).toUpperCase() + string.slice(1);
        }

        let filter_keys = ["material", "morphology", "metal_salts",
            "reducing_agents", "surfactants", "solvents", "pixie_dust"
        ];
        let filter_key_labels = filter_keys.reduce(function(l, a) {
            l.push([a, pretty_label(a)]);
            return l
        }, []);
        let filter_vals = filter_keys.reduce(function(a, key) {
            a[key] = Array.from(new Set(papers.map(function(d) {
                return d[key];
            }).filter(function(d) {
                return d !== null;
            })));
            return a;
        }, {});
        //a[key] = Array.from(new Set(papers.map(function(d){return d[key];}))); return a;}, {});

        let filter_divs = d3.select(this.div).selectAll("div")
            .data(filter_key_labels)
            .enter().append("div")
            .attr("id", function(d) {
                return d[0];
            });
        filter_divs.append("h3").text(function(d) {
            return d[1]
        });
        filter_divs.append("div")
            .attr("class", "filter-label-div")
            .selectAll("input")
            .data(function(d) {
                return filter_vals[d[0]].map(function(val) {
                    return {
                        key: d[0],
                        value: val
                    };
                });
            })
            .enter().append("label")
            .text(function(d) {
                return d.value;
            })
            .append("input")
            .attr("type", "checkbox")
            .attr("name", function(d) {
                return d.key;
            })
            .attr("value", function(d) {
                return d.value;
            });
    }


}
