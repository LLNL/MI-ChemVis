var namespace = '/app'; //global namespace
//create a web socket connect to the server domain.
var socket = io('http://' + document.domain + ':' + location.port + namespace);
// var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);

var panelMetaInfo = {
    'Prediction': ['prediction_view', 'predictionComponent'],
    'AttentionMatrix': ['attention_view', 'attentionMatrixComponent'],
    'Sentence': ['sentence_view', 'sentenceComponent'],
    "AttentionGraph": ['template_view',
        'attentionGraphComponent'
    ],
    'Summary': ['evaluation_view', 'evaluationComponent'],
    'Pipeline': ['pipeline_view', 'pipelineComponent']
};

//for lookup component class on-the-fly
var objectMap = {
    predictionComponent: predictionComponent,
    attentionMatrixComponent: attentionMatrixComponent,
    attentionGraphComponent: attentionGraphComponent,
    sentenceComponent: sentenceComponent,
    evaluationComponent: evaluationComponent,
    pipelineComponent: pipelineComponent
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
