class filterComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    this.subscribeDatabyNames([
      "highlightFilter",
      "selectionFilter"
    ]);

    this.callFunc("loadData");

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

    d3.select(this.div + "clearSelection").on("click",
      d => {
        this.selection.clearTags();
      });

    d3.select(this.div + "clearHighlight").on("click",
      d => {
        this.highlight.clearTags();
      });


    this.callAutoComplete("morphology");
    this.callAutoComplete("material");
  }

  addFilterDropdown(tag, tagList) {
    console.log(tag, tagList);
    var menu = d3.select(this.div + tag)
      .attr("type", "button")
      .attr("data-toggle", "dropdown")
      .attr("aria-haspopup", "true");
    var dropdown = menu.append("div")
      .attr("class", "dropdown-menu");

    for (let i = 0; i < tagList.length; i++) {
      let tag = tagList[i];
      dropdown.append("a")
        .attr("class", "dropdown-item")
        .on("click", d => {
          this.selection.addTag(tag);
        })
        .html(tag);
    }
  }

  callAutoComplete(tag) {
    this.callFunc("directAutoCompleteQuery", {
      "tag": tag
    });
  }

  onUpdateSelection(listOfTag) {
    console.log("onUpdateSelection:", listOfTag);
    this.setData("selectionFilter", listOfTag);
    listOfTag = listOfTag.map(d => d.split(":"));
    this.callFunc("selectionByTags", {
      "tags": listOfTag
    });
  }

  onUpdateHighlight(listOfTag) {
    console.log("onUpdateHighlight:", listOfTag);
    this.setData("highlightFilter", listOfTag);
    listOfTag = listOfTag.map(d => d.split(":"));
    this.callFunc("highlightByTags", {
      "tags": listOfTag
    });
  }

  parseFunctionReturn(msg) {
    super.parseFunctionReturn(msg);
    switch (msg['func']) {
      case "directAutoCompleteQuery":
        //handle
        var tag = msg['data']['data']['tag'];
        var autoList = msg['data']['data']['list'];
        autoList.shift();
        // console.log(tag);
        // autoList = autoList.map(d => d.split(":")[1]);
        this.addFilterDropdown(tag, autoList);
        break;
    }
  }

  parseDataUpdate(msg) {
    super.parseDataUpdate(msg);
    // console.log(msg);
    switch (msg['name']) {
      // case "paperList":
      //     let papers = this.data["paperList"];
      //     this.setData("paper", papers[0]);
      //     break;

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
