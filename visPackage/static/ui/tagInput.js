/*
Create tag input for the given div
http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
*/

class tagInput {
    constructor(div) {
        $('#' + div).tagsInput({
            width: 'auto',
            onAddTag: this.onAddTag,
            onRemoveTag: this.onRemoveTag,
            onChange: this.onChangeTag
                //autocomplete_url:'test/fake_plaintext_endpoint.html' //jquery.autocomplete (not jquery ui)
                // autocomplete_url: 'test/fake_json_endpoint.html' // jquery ui autocomplete requires a json endpoint
        });

    }

    setAddTagCallback(func) {
        this.onAddTag = func;
    }

    setRemoveTagCallback(func) {
        this.onRemoveTag = func;
    }

    setChangeTagCallback(func) {
        this.onChangeTag = func;
    }

}
