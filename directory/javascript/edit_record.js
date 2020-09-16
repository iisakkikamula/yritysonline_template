
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

	function date_to_euro_date(dateValue) {
		var dt_year = dateValue.year;
		var dt_month = dateValue.month - 1;
		var dt_day = dateValue.day;
		var dt_date = new Date(dt_year, dt_month, dt_day);
		return convertToEuroDateAndTime(dt_date);
	}

	function convertToEuroDateAndTime(date) {

		return add_zero_if_needed(date.getDate()) + "."
			+ add_zero_if_needed((date.getMonth() + 1)) + "."
			+ date.getFullYear();
	};

	function add_zero_if_needed(number) {
		if (number < 10) {
			return "0" + number;
		}
		return number;
	};

	async function get() {
		var url2 = window.location.href;
		var url_parts = url2.replace(/\/\s*$/, '').split('/');
		url_parts.shift();
		var dataurl = '/data/' + url_parts[3] + "/" + getUrlParameter('edit_view') + '/' + getUrlParameter('record_id');
		//console.log("dataurl: " + dataurl);
		let obj = await (await fetch(dataurl)).json();

		return obj;
	}
	var custom_view;
	var column_mapping = {};
	(async () => {
		custom_view = await get();

		var attachment_upload_col = document.getElementById('attachment_upload_col');
		var fileinput = document.createElement("input");
		fileinput.setAttribute('class', "form-control custom-file-input");
		fileinput.setAttribute('type', "file");
		fileinput.setAttribute('multiple', true);
		fileinput.setAttribute('name', 'uploadingFiles');
		attachment_upload_col.appendChild(fileinput);

		var fileinput_label = document.createElement("LABEL");
		fileinput_label.setAttribute('class', 'custom-file-label');
		fileinput_label.setAttribute('for', 'uploadingFiles');
		fileinput_label.innerHTML = 'Choose files';
		attachment_upload_col.appendChild(fileinput_label);

		fileinput.addEventListener("change", function (event) {
			upload_files(event.target.files);
		});

		var attachments_div = document.getElementById('attchments_table');
		$.each(custom_view.records, function (index, record) {
			$.each(record.attachments, function (index, attachment) {
				var attachment_row = attachments_div.insertRow();
				var attachment_cell = attachment_row.insertCell(0);

				var a = document.createElement('A');
				var link = document.createTextNode(attachment.name);
				a.appendChild(link);
				a.setAttribute('href', '/dropbox/' + custom_view.database_name + '/download/' + attachment.name);
				attachment_cell.appendChild(a);

				var attachment_date = attachment_row.insertCell(1);
				if (attachment.modifyDate != undefined) {
					var l = document.createElement("LABEL");
					l.innerHTML = date_to_euro_date(attachment.modifyDate);
					attachment_date.appendChild(l);
				}

				var attachment_delete = document.createElement("button");
				attachment_delete.innerHTML = "X";
				attachment_delete.setAttribute('id', "attachment_delete_button");
				attachment_delete.setAttribute('class', "btn btn-danger btn-sm");
				attachment_delete.setAttribute("form", "form_id");
				attachment_delete.addEventListener("click", function () {
					delete_file(attachment.dropbox_fileid);
				});
				attachment_row.appendChild(attachment_delete);
			});
		});
		var f = document.getElementById('formdiv_body');
		var f2 = document.getElementById('formdiv_footer');
		console.log(custom_view);
		$.each(custom_view.records, function (index, record) {
			var id_generator = 0;
			$.each(custom_view.columns_sorted, function (index, view_column) {
				id_generator = id_generator + 1;
				var l = document.createElement("LABEL");
				l.innerHTML = view_column.column_alias;
				f.appendChild(l);
				var generated_id1 = "data_input_" + id_generator;

				var column_list = [];
				var column_map1 = {};
				column_map1.id = generated_id1;
				column_map1.type = view_column.column_type;
				column_map1.name = view_column.column_name;
				column_list.push(column_map1);
				column_mapping[view_column.column_name] = column_list;
				var column = record.columns[view_column.column_name];
				if ('foreign_id' == view_column.column_type) {
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
					f.appendChild(i);

				}

				if ('integer' == view_column.column_type) {
					var i = document.createElement("input");
					i.setAttribute('id', generated_id1);
					i.setAttribute('class', "form-control");
					i.setAttribute('name', view_column.column_name);
					i.setAttribute('type', 'number');
					i.setAttribute('value', column.doubleValue);
					f.appendChild(i);
				}
				if ('double' == view_column.column_type) {
					var i = document.createElement("input");
					i.setAttribute('id', generated_id1);
					i.setAttribute('class', "form-control");
					i.setAttribute('name', view_column.column_name);
					i.setAttribute('type', 'number');
					i.setAttribute('value', column.doubleValue);
					f.appendChild(i);
				}
				if ('text' == view_column.column_type) {
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
					f.appendChild(i);
				}
				if ('datetime' == view_column.column_type) {
					var i = document.createElement("input");
					i.setAttribute('id', generated_id1);
					i.setAttribute('class', "form-control");
					i.setAttribute('name', view_column.column_name);
					i.setAttribute('type', 'date');
					var column_date = null;
					if (column.dateValue != undefined) {
						column_date = column.dateValue.year + "-" + add_zero_if_needed(column.dateValue.month) + "-" + add_zero_if_needed(column.dateValue.day);
					}
					i.setAttribute('value', column_date);
					var column_time = null;
					if (column.timeValue != undefined) {
						column_time = add_zero_if_needed(column.timeValue.hour) + ":" + add_zero_if_needed(column.timeValue.minute);
					}
					var t = document.createElement("input");
					var generated_id2 = generated_id1 + "B";
					t.setAttribute('id', generated_id2);
					t.setAttribute('type', 'time');
					t.setAttribute('class', "form-control");
					t.setAttribute('name', view_column.column_name + '_time');
					t.setAttribute('value', column_time);
					f.appendChild(t);


					var column_map2 = {};
					column_map2.id = generated_id2;
					column_map2.type = view_column.column_type;
					column_map2.name = view_column.column_name;
					column_list.push(column_map2);

					f.appendChild(i);
				}
			});
		});

		var url2 = window.location.href;
		var url_parts = url2.replace(/\/\s*$/, '').split('/');
		url_parts.shift();
		var closeurl = '/private/' + url_parts[3] + "/dashboard?view=" + custom_view.return_table_id;

		var s = document.createElement("button");
		s.innerHTML = "Sulje";
		s.setAttribute('id', "close_button");
		s.setAttribute('class', "btn btn-info");
		s.setAttribute("form", "form_id");
		s.addEventListener("click", function () {
			window.location.href = closeurl;
		});
		f2.appendChild(s);

		s = document.createElement("button");
		s.innerHTML = "Tallenna";
		s.setAttribute('id', "save_record_button");
		s.setAttribute('class', "btn btn-primary");
		s.setAttribute("form", "form_id");
		s.addEventListener("click", function () {
			//console.log(column_mapping);
			columns_to_save = [];
			$.each(custom_view.records, function (index, record) {
				$.each(record.columns, function (index, record_column) {
					var data_inputs = column_mapping[record_column.column_name];
					var input_element1 = document.getElementById(data_inputs[0].id);
					//console.log(data_inputs[0].id + ": " + input_element1.value);
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

			var record_to_save = {};
			record_to_save.id = getUrlParameter('record_id');
			record_to_save.table_name = custom_view.edit_table;
			record_to_save.columns = columns_to_save;
			//console.log(record_to_save);

			$.ajax({
				type: "POST",
				url: '/CRUD_REST/' + custom_view.database_name + '/save_record/',
				data: JSON.stringify(record_to_save),
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
		});
		f2.appendChild(s);

		function delete_file(id) {
			$.ajax({
				type: "POST",
				url: '/dropbox/deleteFileREST/' + custom_view.database_name + '/' + id,
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
		}

		function upload_files(files) {
			//console.log(files);
			var fdata = new FormData();
			$.each(files, function (i, file) {
				fdata.append('files-' + i, file);
			});
			$.ajax({
				url: '/dropbox/uploadREST/' + custom_view.database_name + '/' + custom_view.edit_table + '/' + custom_view.records[0].id,
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
		}

		$("#fileinputelement").click(function () {
			upload_files(fileinputelement.files);
		});
	})();