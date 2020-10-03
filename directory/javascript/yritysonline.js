var yritysonline = {};

yritysonline.get_column_value = function (record, view_column) {
    var col_value = "";
    var col_name = view_column.column_name;
    if ('text' == view_column.column_type) {
        col_value = record.columns[col_name].stringValue;
        if (col_value == undefined) {
            col_value = "";
        }
    }
    if ('double' == view_column.column_type) {
        col_value = record.columns[col_name].doubleValue;
    }
    if ('integer' == view_column.column_type) {
        col_value = record.columns[col_name].doubleValue;
    }
    if ('foreign_id' == view_column.column_type) {
        col_value = record.columns[col_name].doubleValue;
    }
    if ('date' == view_column.column_type) {
        if (record.columns[col_name].dateValue != undefined) {
            col_value = yritysonline.date_to_euro_date(record.columns[col_name]);
        }
    }
    if ('datetime' == view_column.column_type) {
        if (record.columns[col_name].dateValue != undefined) {
            col_value = yritysonline.datetime_to_euro_date(record.columns[col_name]);
        }
    }
    return col_value;
}

//Load data from backend
yritysonline.load_data_from_backend = async function (data_urls) {
    var data_objects = [];
    for (i = 0; i < data_urls.length; i++) {
        var view_obj;
        await Promise.all([
            view_obj = (await fetch(data_urls[i])).json()
        ]);
        data_objects.push(view_obj);
    }
	return data_objects;
}
var process_results;

yritysonline.save_record = function (custom_view, record, column_mapping) {
    console.log(column_mapping);
    columns_to_save = [];
    $.each(custom_view.records, function (index, record) {
        $.each(record.columns, function (index, record_column) {
            var data_inputs = column_mapping[record_column.column_name];
            var input_element1 = document.getElementById(data_inputs[0].id);
            var column_object =
            {
                column_name: record_column.column_name,
                column_type: record_column.column_type
            };
            if ('text' == record_column.column_type) {
                column_object.stringValue = input_element1.value;
            }
            if ('double' == record_column.column_type) {
                column_object.doubleValue = input_element1.value;
            }
            if ('integer' == record_column.column_type) {
                column_object.doubleValue = input_element1.value;
            }
            if ('foreign_id' == record_column.column_type) {
                column_object.doubleValue = input_element1.value;
            }
            if ('datetime' == record_column.column_type) {
                var input_element2 = document.getElementById(data_inputs[1].id);
                column_object.stringDate = input_element1.value;
                column_object.stringTime = input_element2.value;
            }
            columns_to_save.push(column_object);
        });
    });

    var save_record_json = {};
    save_record_json.schema_name = custom_view.schema_name;
    save_record_json.table_name = custom_view.edit_table;
    var record_to_save = {};
    record_to_save.id = yritysonline.getUrlParameter('record_id');
    record_to_save.columns = columns_to_save;
    save_record_json.record = record_to_save;
    //console.log(record_to_save);

    $.ajax({
        type: "POST",
        url: '/CRUD_REST/' + custom_view.database_name + '/save_record/',
        data: JSON.stringify(save_record_json),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (msg) {
            console.log("saved");
            window.location.href = window.location.href;
        },
        error: function (error_msg) {
            console.log("error!");
            console.log(error_msg);
        }
    });
};

    
yritysonline.delete_file = function(custom_view,id) {
    $.ajax({
        type: "POST",
        url: '/dropbox/' + custom_view.database_name + '/deleteFileREST/' + id,
        data: JSON.stringify({}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (msg) {
            console.log("deleted");
            window.location.href = window.location.href;
        },
        error: function (error_msg) {
            console.log("error!");
            console.log(error_msg);
        }
    });
};

yritysonline.upload_files = function(custom_view, files) {
    //console.log(files);
    var fdata = new FormData();
    $.each(files, function (i, file) {
        fdata.append('files-' + i, file);
    });
    $.ajax({
        url: '/dropbox/' + custom_view.database_name + '/uploadREST/' + custom_view.edit_table + '/' + custom_view.records[0].id,
        type: "POST",
        data: fdata,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        success: function (res) {
            console.log(res);
            window.location.href = window.location.href;
        },
        error: function (err) {
            console.error(err);
        }
    });
};

yritysonline.getUrlParameter = function(sParam) {
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

yritysonline.add_zero_if_needed = function(number) {
	if (number < 10) {
		return "0" + number;
	}
	return number;
};

yritysonline.convertToEuroDateAndTime = function(date) {
    var fixed_date = yritysonline.add_zero_if_needed(date.getDate());
    var fixed_month = yritysonline.add_zero_if_needed((date.getMonth() + 1));
	return fixed_date + "." + fixed_month + "." + date.getFullYear();
};

yritysonline.date_to_euro_date = function(dateValue) {
	var dt_year = dateValue.year;
	var dt_month = dateValue.month - 1;
	var dt_day = dateValue.day;
	var dt_date = new Date(dt_year, dt_month, dt_day);
	return yritysonline.convertToEuroDateAndTime(dt_date);
};

yritysonline.datetime_to_euro_date = function(datetime_value) {
	var dt_year = datetime_value.dateValue.year;
	var dt_month = datetime_value.dateValue.month - 1;
	var dt_day = datetime_value.dateValue.day;
	var dt_hour = datetime_value.timeValue.hour;
	var dt_minute = datetime_value.timeValue.minute;
	var dt_second = datetime_value.timeValue.second;
	var dt_date = new Date(dt_year, dt_month, dt_day, dt_hour, dt_minute, 0, 0);
	return yritysonline.convertToEuroDateAndTime(dt_date);
};

yritysonline.get_view_url_beginning = function() {
	return '/private/' + yritysonline.get_database_name_from_url() + '/dashboard?view=';
};

yritysonline.get_data_url_beginning = function() {
	return '/data/' + yritysonline.get_database_name_from_url() + '/';
};

yritysonline.create_record = function(custom_view) {

    var create_record_json = {};
    create_record_json.table_name = custom_view.edit_table;
    create_record_json.schema_name = custom_view.schema_name;
    var create_url = '/CRUD_REST/' + custom_view.database_name + '/create_record_REST/';
    var edit_href = href = "/private/" + custom_view.database_name + "/edit_record?view=" + custom_view.edit_view_name + "&record_id=";
    $.ajax({
        type: "POST",
        url: create_url,
        data: JSON.stringify(create_record_json),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (msg) {
            console.log(msg);
            window.location.href = edit_href + msg.new_record_id;
        },
        error: function (error_msg) {
            console.log("error!");
            console.log(error_msg);
        }
    });
};

yritysonline.delete_record = function(custom_view,record_id_to_delete) {
    var delete_record_json = {};
    delete_record_json.table_name = custom_view.edit_table;
    delete_record_json.schema_name = custom_view.schema_name;

    var delete_url = '/CRUD_REST/' + custom_view.database_name + '/delete_record_REST/' + record_id_to_delete;
    $.ajax({
        type: "POST",
        url: delete_url,
        data: JSON.stringify(delete_record_json),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (msg) {
            window.location.href = window.location.href;
        },
        error: function (error_msg) {
            console.log("error!");
            console.log(error_msg);
        }
    });
};

yritysonline.generate_inputs = function(custom_view, html_element){
    var column_mapping = {};
    $.each(custom_view.records, function (index, record) {
        var id_generator = 0;
        $.each(custom_view.columns_sorted, function (index, view_column) {
            id_generator = id_generator + 1;
            var l = document.createElement("LABEL");
            l.innerHTML = view_column.column_alias;
            html_element.appendChild(l);
            var generated_id1 = "data_input_" + id_generator;
    
            var column_list = [];
            var column_map1 = {};
            column_map1.id = generated_id1;
            column_map1.type = view_column.column_type;
            column_map1.name = view_column.column_name;
            column_list.push(column_map1);
            column_mapping[view_column.column_name] = column_list;
            var column = record.columns[view_column.column_name];
            
            console.log(view_column.options_view_id != undefined);
            if (view_column.options_view_id != undefined) {
                var i = document.createElement("select");
                i.setAttribute('id', generated_id1);
                i.setAttribute('class', "form-control");
                i.setAttribute('name', view_column.column_name);
                $.each(view_column.options, function (index, select_option) {
                    //console.log("select_option: " + select_option);
                    var option = document.createElement("option");
                    if (select_option.id == column.doubleValue) {
                        option.setAttribute('selected', true);
                    }
                    option.value = select_option.id;
                    option.text = select_option.text;
                    i.appendChild(option);
                });
                html_element.appendChild(i);
    
            }
    
            if ('integer' == view_column.column_type && view_column.options_view_id == undefined) {
                var i = document.createElement("input");
                i.setAttribute('id', generated_id1);
                i.setAttribute('class', "form-control");
                i.setAttribute('name', view_column.column_name);
                i.setAttribute('type', 'number');
                i.setAttribute('value', column.doubleValue);
                html_element.appendChild(i);
            }
            if ('double' == view_column.column_type && view_column.options_view_id == undefined) {
                var i = document.createElement("input");
                i.setAttribute('id', generated_id1);
                i.setAttribute('class', "form-control");
                i.setAttribute('name', view_column.column_name);
                i.setAttribute('type', 'number');
                i.setAttribute('value', column.doubleValue);
                html_element.appendChild(i);
            }
            if ('text' == view_column.column_type && view_column.options_view_id == undefined) {
                var col_value = "";
                if (column.stringValue != undefined) {
                    col_value = column.stringValue;
                }
                var i = document.createElement("input");
                i.setAttribute('id', generated_id1);
                i.setAttribute('class', "form-control");
                i.setAttribute('name', view_column.column_name);
                i.setAttribute('type', 'text');
                i.setAttribute('value', col_value);
                html_element.appendChild(i);
            }
            if ('datetime' == view_column.column_type &&  view_column.options_view_id == undefined) {
                var i = document.createElement("input");
                i.setAttribute('id', generated_id1);
                i.setAttribute('class', "form-control");
                i.setAttribute('name', view_column.column_name);
                i.setAttribute('type', 'date');
                var column_date = null;
                if (column.dateValue != undefined) {
                    column_date = column.dateValue.year + "-" + yritysonline.add_zero_if_needed(column.dateValue.month) + "-" + yritysonline.add_zero_if_needed(column.dateValue.day);
                }
                i.setAttribute('value', column_date);
                var column_time = null;
                if (column.timeValue != undefined) {
                    column_time = yritysonline.add_zero_if_needed(column.timeValue.hour) + ":" + yritysonline.add_zero_if_needed(column.timeValue.minute);
                }
                var t = document.createElement("input");
                var generated_id2 = generated_id1 + "B";
                t.setAttribute('id', generated_id2);
                t.setAttribute('type', 'time');
                t.setAttribute('class', "form-control");
                t.setAttribute('name', view_column.column_name + '_time');
                t.setAttribute('value', column_time);
                html_element.appendChild(t);
    
    
                var column_map2 = {};
                column_map2.id = generated_id2;
                column_map2.type = view_column.column_type;
                column_map2.name = view_column.column_name;
                column_list.push(column_map2);
    
                html_element.appendChild(i);
            }
        });
    });
    return column_mapping;
};

yritysonline.get_database_name_from_url = function(){
    var url2 = window.location.href;
	var url_parts = url2.replace(/\/\s*$/, '').split('/');
    url_parts.shift();
    return url_parts[3];
};