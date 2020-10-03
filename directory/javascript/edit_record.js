
(async () => {
	//Get database name from url
	var database_name = yritysonline.get_database_name_from_url();

	var view_url = '/data/' + database_name + "/fetch/" + yritysonline.getUrlParameter('view') + '/' + yritysonline.getUrlParameter('record_id');
	var data_urls = [view_url];

	//Wait for data to load
	var process_results = await yritysonline.load_data_from_backend(data_urls);
	var custom_view_promise = process_results[0];
	custom_view_promise.then(function (custom_view) {

		//Create fileinput 
		var attachment_upload_col = document.getElementById('attachment_upload_col');
		var fileinput = document.createElement("input");
		fileinput.setAttribute('class', "form-control custom-file-input");
		fileinput.setAttribute('type', "file");
		fileinput.setAttribute('multiple', true);
		fileinput.setAttribute('id', 'fileinputelement');
		fileinput.setAttribute('name', 'uploadingFiles');
		attachment_upload_col.appendChild(fileinput);

		//Create fileinput label
		var fileinput_label = document.createElement("LABEL");
		fileinput_label.setAttribute('class', 'custom-file-label');
		fileinput_label.setAttribute('for', 'uploadingFiles');
		fileinput_label.innerHTML = 'Choose files';
		attachment_upload_col.appendChild(fileinput_label);

		//Connect fileinput chenge-event to a file saving function in yritysonline.js 
		fileinput.addEventListener("change", function (event) {
			yritysonline.upload_files(custom_view, event.target.files);
		});

		//Generate attachment table with download links and delete buttons
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
					l.innerHTML = yritysonline.date_to_euro_date(attachment.modifyDate);
					attachment_date.appendChild(l);
				}

				var attachment_delete = document.createElement("button");
				attachment_delete.innerHTML = "X";
				attachment_delete.setAttribute('id', "attachment_delete_button");
				attachment_delete.setAttribute('class', "btn btn-danger btn-sm");
				attachment_delete.setAttribute("form", "form_id");
				attachment_delete.addEventListener("click", function () {
					yritysonline.delete_file(custom_view,attachment.dropbox_fileid);
				});
				attachment_row.appendChild(attachment_delete);
			});
		});

		//Create close- button and place it into footer
		var closeurl = '/private/' + database_name + "/dashboard?view=" + custom_view.return_table_id;
		var s = document.createElement("button");
		s.innerHTML = "Sulje";
		s.setAttribute('id', "close_button");
		s.setAttribute('class', "btn btn-primary");
		s.setAttribute("form", "form_id");
		s.addEventListener("click", function () {
			window.location.href = closeurl;
		});
		var formdiv_footer_left = document.getElementById('formdiv_footer_left');
		formdiv_footer_left.appendChild(s);

		//Generate editable inputs and place them inside html element
		var formdiv_body = document.getElementById('formdiv_body');
		//Generate inputs and create map with column name as a key and input id as a value
		var column_mapping = yritysonline.generate_inputs(custom_view, formdiv_body);

		//Bind savebutton to save function in yritysonline-library
		$("#savebutton").click(function () {
			yritysonline.save_record(custom_view, custom_view.records[0], column_mapping);
		});
	});
})();