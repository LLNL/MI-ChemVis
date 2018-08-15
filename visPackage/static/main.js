var namespace = '/app'; //global namespace
//create a web socket connect to the server domain.
var socket = io('http://' + document.domain + ':' + location.port + namespace);
// var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);

var panelMetaInfo = {
    'Filter': ['filter_view.mst', 'filterComponent'],
    'Graph': ['graph_view.mst', 'graphComponent'],
    'Document': ['doc_view.mst', 'documentComponent'],
    'AggregateInfo': ['aggregateInfo_view.mst', 'aggregateInfoComponenet'],
    'DocComparison': ['docComparison_view.mst', "comparisonComponenet"]
};

//for lookup component class on-the-fly
var objectMap = {
    filterComponent: filterComponent,
    graphComponent: graphComponent,
    documentComponent: documentComponent,
    aggregateInfoComponenet: aggregateInfoComponenet,
    comparisonComponenet: comparisonComponenet
};

//////////////////////create layout ///////////////////////
// var appLayout = new window.GoldenLayout(config, $('body'));
var visLayout = new glayout($('body'), panelMetaInfo, objectMap);

// appLayout.init()

//handle whole window resize
window.addEventListener('resize', function(size) {
    // console.log(size);
    // appLayout.updateSize();
    visLayout.updateSize();
})

window.onbeforeunload = function(e) {
    console.log("@@@@@@@@@@@ reset module on server @@@@@@@@@\n");
    $.get("/", d => console.log(d));
    // $.get("/reset/", d => console.log(d));
};
