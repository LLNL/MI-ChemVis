/*
Create tag input for the given div
http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
*/

class tagInput {
    constructor(div, color) {

        $(div).tagsInput({
            width: 'auto',
            height: '80px',
            autocomplete: {
                morphology: "morphology",
                material: "material"
            },
            onAddTag: function(elem, elem_tags) {
                $(this).css('background-color',
                    color);
                // $('.tag', elem_tags).each(function() {
                //     $(this).css('background-color',
                //         color);
                // });
            },
            // onRemoveTag: this.onRemoveTag,
            // onChange: function(elem, elem_tags) {

            onChange: this.onChangeTag,
            backgroundColor: color,
            placeholderColor: color

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
            let tag = tags[i];
            if (Array.isArray(tag.tag)) {
                let multiTag = tag.tag;
                for (let j = 0; j < multiTag.length; j++) {
                    this.addTag(multiTag[j], tooltip, tagOption, color);
                }
            } else {
                this.addTag(tag.tag, tooltip, tagOption, color);
            }
        }
        //init tooltip
        $('[data-toggle="tooltip"]').tooltip()
    }

    addTag(tag, tooltip, tagOption, color) {
        let dropdown = this.container.append("div")
            .attr("class", "btn-group");
        dropdown.append("button")
            .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
            .attr("type", "button")
            // .attr("data-toggle", "dropdown tooltip")
            .attr("aria-haspopup", "true")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "top")
            .attr("title", tooltip)
            .style("background-color", color)
            .style("border-color", color)
            .style("margin-left", '5px')
            .style("margin-top", '5px')
            .html(tag);

        if (tagOption) {
            let menu = dropdown.append("div")
                .attr("class", "dropdown-menu");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.addtoSelection("union", tag);
                })
                .html("Add to union");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.addtoSelection("interset", tag);
                })
                .html("Add to intersetion");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.addtoSelection("exclude", tag);
                })
                .html("Add to exclusion");

            menu.append("a")
                .attr("class", "dropdown-item")
                .on("click", d => {
                    this.highlightByTag(tag);
                })
                .html("Highlight");
        }
    }

    highlightByTag(tag) {
        this.callFunc("highlightByTag", {
            "tag": tag
        });
    }

    addtoSelection(type, tag) {
        this.callFunc("addTagToSelection", {
            "type": type,
            "tag": tag
        });
    }

}
