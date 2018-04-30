/*
Create tag input for the given div
http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
*/

class tagInput {
    constructor(div, highTagList) {
        this.div = div;
        this.highTagList = highTagList;
        if (this.highTagList) {
            this.colorScale = d3.scaleOrdinal(d3["schemeCategory10"]);
            this.colorScale.domain(highTagList);
        }

        $(div).tagsInput({
            width: 'auto',
            height: '120px',
            autocomplete_url: '/autocomplete',
            autocomplete: {
                selectFirst: true,
                // width: '300px',
                autoFill: true
            },
            // onAddTag: this.updateColor.bind(this),
            // onRemoveTag: this.updateColor.bind(this),
            // onRemoveTag: this.onRemoveTag.bind(this),
            onChange: this.onChangeTag.bind(this),
            maxChars: 0

            // backgroundColor: color,
            // placeholderColor: color
        });

        //test
        // this.addTag("surfactants:PVP");
    }

    addTag(tag) {
        $(this.div).addTag(tag);
    }

    setTags(tags) {
        console.log("setTags", tags);
        $(this.div).importTags(tags.join(","));
    }

    clearTags() {
        $(this.div).importTags("");
    }

    // setAddTagCallback(func) {
    //     this.onAddTag = func;
    // }
    //

    // onRemoveTag() {
    //     this.changeCallback
    //
    // }

    updateColor() {
        if (this.highTagList) {
            let highTagList = this.highTagList;
            let colorScale = this.colorScale;
            $('.tag').each(function() {
                for (var i = 0; i < highTagList.length; i++) {
                    let label = $(this).text();
                    if (label.startsWith(highTagList[i])) {
                        // console.log(label, highTagList[i], i);
                        $(this).css('background-color', colorScale(
                            highTagList[i]));
                    }
                }
            });
        }
    }

    onChangeTag() {
        this.updateColor();
        if (this.changeCallback) {
            let tags = $(this.div).getTags();
            if (tags.length === 1 && tags[0] === "")
                tags = [];
            this.changeCallback(tags);
        }
    }

    setChangeTagCallback(func) {
        this.changeCallback = func;
    }

}

class tagLabel {
    constructor(div, tags, tagOption) {
        // let tags = tagObjects.map(d => d.tag);
        this.container = d3.select(div).html("");
        this.colorScale = d3.scaleOrdinal(d3["schemeCategory10"]);

        // console.log("tag length:", tags.length);

        for (let i = 0; i < tags.length; i++) {
            let color = this.colorScale(i);
            let tooltip = tags[i].tooltip;
            let keys = tags[i].keys;
            let tag = tags[i];
            if (Array.isArray(tag.tag)) {
                let multiTag = tag.tag;
                for (let j = 0; j < multiTag.length; j++) {
                    this.addTag(multiTag[j], tooltip, tagOption, color,
                        keys.concat([multiTag[j]]));
                }
            } else {
                this.addTag(tag.tag, tooltip, tagOption, color,
                    keys.concat([tag.tag]));
            }
        }
        //init tooltip
        $('[data-toggle="tooltip"]').tooltip()
    }

    addTag(tag, tooltip, tagOption, color, keys) {
        let dropdown = this.container.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm")
            .attr("type", "button")
            .attr("data-toggle", "tooltip")
            .attr("aria-haspopup", "true")
            .attr("data-placement", "top")
            .attr("title", tooltip)
            .style("background-color", color)
            .style("border-color", color)
            .style("margin-left", '5px')
            .style("margin-top", '5px')
            .html(tag);

        dropdown.append("button")
            .attr("class",
                "btn btn-secondary btn-sm dropdown-toggle "
            )
            .attr("type", "button")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded", "false")
            .style("background-color", color)
            .style("border-color", color)
            .style("margin-top", '5px')
            .append("span")
            .attr("class", "sr-only").html("Toggle Dropdown");

        if (tagOption) {
            let menu = dropdown.append("div")
                .attr("class", "dropdown-menu");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.highlightCallback("replace", keys);
                })
                .html("Highlight");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.highlightCallback("add", keys);
                })
                .html("Add to Highlight");

            // <div class="dropdown-divider"></div>
            menu.append("div")
                .attr("class", "dropdown-divider");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.selectionCallback("replace", keys);
                })
                .html("Select");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.selectionCallback("add", keys);
                })
                .html("Add to Selection");
        }
    }

    bindHighlightCallback(func) {
        this.highlightCallback = func;
    }

    bindSelectionCallback(func) {
        this.selectionCallback = func;
    }
}
