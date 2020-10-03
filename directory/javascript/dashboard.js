
(async () => {
	
	//Declare data urls and place them into array
	var view_url = yritysonline.get_data_url_beginning() + "/fetch/" + yritysonline.getUrlParameter('view');	
	var model_url = yritysonline.get_data_url_beginning() + "model_structure";
	var data_urls = [view_url, model_url];
	
	//Wait for data to load
	process_results = await yritysonline.load_data_from_backend(data_urls);
	var custom_view_promise = process_results[0];
	var model_structure_promise = process_results[1];

	//Use model structure to build UI
	model_structure_promise.then(function (model_structure) {
		console.log(model_structure);

		//Add company name to upper lefthand corner
		var company_name_slot = document.getElementById("company_name_slot");
		if (model_structure.database_alias != undefined) {
			var bold_company_name = document.createElement('STRONG');
			var company_name = document.createTextNode(model_structure.database_alias.toUpperCase());
			bold_company_name.appendChild(company_name);
			company_name_slot.style.color = "white";
			company_name_slot.style.font = "bold";
			company_name_slot.appendChild(bold_company_name);
		}

		//Create sidebarlist with the names of views
		var sidebarlist = document.getElementById("sidebarlist");
		var links = ['test', 'test2'];
		$.each(model_structure.views, function (index, view) {
			//Show only views which don't have visibility disabled
			if ('none' != view.visibility) {
				var a = document.createElement('A');
				var link = document.createTextNode(view.view_alias);
				a.appendChild(link);
				a.setAttribute('class', 'list-group-item list-group-item-action bg-white');
				a.setAttribute('href', yritysonline.get_view_url_beginning() + view.view_name);
				sidebarlist.appendChild(a);
			}
		});
	});

	//Use view to build UI
	custom_view_promise.then(function (custom_view) {

		//Create excel download link
		var excel_div = document.getElementById("excel_div");
		var excel_link = document.createElement('A');
		var bold_excel_link = document.createElement('STRONG');
		var link = document.createTextNode('EXCEL');
		bold_excel_link.appendChild(link);
		excel_link.appendChild(bold_excel_link);
		excel_link.setAttribute('class', 'btn btn-link');
		excel_link.setAttribute('href', '/EXCELS_export/' + custom_view.database_name + '/' + custom_view.view_name);
		excel_div.appendChild(excel_link);

		//Create datatable heading
		var datatable_heading = document.getElementById("datatable_heading");
		var view_alias = custom_view.view_alias;
		if (view_alias == undefined) {
			view_alias = "-";
		}
		var view_name = document.createTextNode(view_alias);
		datatable_heading.appendChild(view_name);

		//Create header and footer rows with column names
		var header_cols = [];
		header_cols.push("");
		$.each(custom_view.columns_sorted, function (index, view_column) {
			header_cols.push(view_column.column_alias);
		});
		header_cols.push("");
		var header_row = document.getElementById("header_row");
		var footer_row = document.getElementById("footer_row");
		$.each(header_cols, function (index, header_col) {
			var th = document.createElement('TH');
			th.innerHtml = header_col;
			header_row.appendChild(th);
			th = document.createElement('TH');
			th.innerHtml = header_col;
			footer_row.appendChild(th);
		});

		console.log(custom_view);

		//Define language for datatables.js
		var language = {
			"decimal": "",
			"emptyTable": "Ei dataa",
			"info": "Hakutulokset _START_ - _END_ kaikista hakutuloksista (_TOTAL_)",
			"infoEmpty": "Showing 0 to 0 of 0 entries",
			"infoFiltered": "(Hakutuloksia _MAX_ kpl)",
			"infoPostFix": "",
			"thousands": ",",
			"lengthMenu": "Hakutuloksia sivulla: _MENU_",
			"loadingRecords": "Ladataan...",
			"processing": "Prosessoidaan...",
			"search": "Haku:",
			"zeroRecords": "Ei hakutuloksia",
			"paginate": {
				"first": "<<",
				"last": ">>",
				"next": ">",
				"previous": "<"
			},
			"aria": {
				"sortAscending": ": Nouseva",
				"sortDescending": ": Laskeva"
			}
		};

		//Prepare tabledata for datatables.js
		var date_column_indexes = [];
		var tabledata = [];
		//Go through every record in a view
		$.each(custom_view.records, function (index, record) {
			var row_data = [];
			//Create link to record editing page
			var edit_href = href = "/private/" + custom_view.database_name + "/edit_record?view=" + custom_view.edit_view_name + "&record_id=" + record.id;
			row_data.push(edit_href);
			//Go through every column and get column value according to datatype
			$.each(custom_view.columns_sorted, function (index, view_column) {
				var col_value = yritysonline.get_column_value(record, view_column);
				row_data.push(col_value);
			});
			row_data.push(record.id);
			tabledata.push(row_data);
		});

		//Create header cols for datatables.js
		var header_cols = [];
		header_cols.push({ title: "" });
		$.each(custom_view.columns_sorted, function (index, view_column) {
			header_cols.push({ title: view_column.column_alias });
		});
		header_cols.push({ title: "" });

		//Create column definitions for datatables.js
		var column_defs = [];
		column_defs.push(
			{
				"targets": -1,
				"data": null,
				"defaultContent": "<button class=\"deletebutton btn btn-danger\"><span data-feather=\"trash-2\"></span></button>"
			}
		);
		column_defs.push({
			"targets": -header_cols.length,
			"data": null,
			"defaultContent": "<button class=\"editlink btn btn-link\"><span data-feather=\"edit-2\"></span></button>"
		}
		);
		$.each(date_column_indexes, function (index, date_column_index) {
			column_defs.push(
				{ targets: date_column_index, type: 'date-custom' }
			);
		});

		//Create datatable using datatables.js
		var table = $('#example').DataTable({
			"scrollX": true,
			language: language,
			data: tabledata,
			columns: header_cols,
			"columnDefs": column_defs
		});

		//Add custom date sorting function
		$.extend($.fn.dataTableExt.oSort, {
			"date-custom-pre": function (a) {
				var millis = Date.parse(a);
				return millis;
			}
		});

		//Bind record editing link click to action
		$('#example tbody').on('click', '.editlink', function () {
			var data = table.row($(this).parents('tr')).data();
			window.location.href = data[0];
		});

		//Bind record deleting button click to yritysonline.js action
		$('#example tbody').on('click', '.deletebutton', function () {
			var data = table.row($(this).parents('tr')).data();
			var id_col_index = data.length - 1;
			yritysonline.delete_record(custom_view, data[id_col_index]);
		});

		//Bind record creating button click to yritysonline.js action
		$("#new_record_button").click(function () {
			yritysonline.create_record(custom_view);
		});

		//Bind toggle analysis- button to action
		$("#toggle_analysis_button").click(function () {
			var current_url = window.location.href;
			new_url = current_url.replace("dashboard","dashboard_analysis");
			window.location.href = new_url;
		});
	});

	//Create feather icons
	$(document).ready(function () {
		feather.replace()
	});
})();