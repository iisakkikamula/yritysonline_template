
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function save_model(editor_content) {
    var datastring = "";
    try {
        datastring = JSON.stringify(editor_content);
    }
    catch (err) {
        console.log(err.message);
    }
    var sendInfo = {
        model_as_json: "testi",
        database_name: "manna"
    };
    $.ajax({
        type: "POST",
        url: "/schema/" + getUrlParameter('database_name') + "/json_schema_validator/save_model",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: datastring,
        success: function (msg) {
            window.location.href = window.location.href;
        },
        error: function (error_msg) {
            console.log("error!");
            console.log(error_msg);
        }
    });
}

function get_data_url_beginning() {
    var url2 = window.location.href;
    var url_parts = url2.replace(/\/\s*$/, '').split('/');
    url_parts.shift();
    return '/data/' + url_parts[3] + '/';
}

async function run_processes() {
    let model_structure_url = get_data_url_beginning() + "/model_structure_with_environment_variables";
    let schema_url = get_data_url_beginning() + "schema";
    var model_structure_obj;
    var schema_obj;
    res = await Promise.all([
        model_structure_obj = (await fetch(model_structure_url)).json(),
        schema_obj = (await fetch(schema_url)).json()
    ]);
    return [model_structure_obj, schema_obj];
}
var process_results;
(async () => {
    process_results = await run_processes();
    var model_structure_promise = process_results[0];
    var schema_promise = process_results[1];
    var model_structure = null;
    var schema = null;
    schema_promise.then(function (schema) {
        model_structure_promise.then(function (model_structure) {
            var options = {
                schema: schema,
                mode: 'code',
                modes: ['code', 'text', 'tree', 'preview']
            };

            var container = document.getElementById('jsoneditor');
            var editor = new JSONEditor(container, options, model_structure);

            document.getElementById('save_JSON_model').onclick = function () {
                save_model(editor.get());
            };
        });
    });

})();