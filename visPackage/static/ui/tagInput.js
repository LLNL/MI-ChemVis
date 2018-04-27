/*
Create tag input for the given div
http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
*/

class tagInput {
    constructor(div, color) {

        $(div).tagsInput({
            width: 'auto',
            height: '50px',
            autocomplete: {
                morphology: "morphology",
                material: "material"
            },
            // onAddTag: function(elem, elem_tags) {
            //     $(this).css('background-color',
            //         color);
            //     // $('.tag', elem_tags).each(function() {
            //     //     $(this).css('background-color',
            //     //         color);
            //     // });
            // },
            // onRemoveTag: this.onRemoveTag,
            // onChange: function(elem, elem_tags) {

            onChange: this.onChangeTag,
            // backgroundColor: color,
            // placeholderColor: color

            //autocomplete_url:'test/fake_plaintext_endpoint.html' //jquery.autocomplete (not jquery ui)
            // autocomplete_url: 'test/fake_json_endpoint.html' // jquery ui autocomplete requires a json endpoint
        });
    }

    // setAddTagCallback(func) {
    //     this.onAddTag = func;
    // }
    //
    // setRemoveTagCallback(func) {
    //     this.onRemoveTag = func;
    // }

    setChangeTagCallback(func) {
        this.onChangeTag = func;
    }

}

class tagLabel {
    constructor(div, tags, tagOption) {
        // let tags = tagObjects.map(d => d.tag);
        this.container = d3.select(div).html("");
        this.colorScale = d3.scaleOrdinal(d3["schemeCategory10"]);

        console.log("tag length:", tags.length);

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
                    this.highlightCallback(keys);
                })
                .html("Highlight");

            // <div class="dropdown-divider"></div>
            menu.append("div")
                .attr("class", "dropdown-divider");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.selectionCallback("union", keys);
                })
                .html("Add to union");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.selectionCallback("interset", keys);
                })
                .html("Add to intersetion");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.selectionCallback("exclude", keys);
                })
                .html("Add to exclusion");

        }
    }

    bindHighlightCallback(func) {
        this.highlightCallback = func;
    }

    bindSelectionCallback(func) {
        this.selectionCallback = func;
    }

}
