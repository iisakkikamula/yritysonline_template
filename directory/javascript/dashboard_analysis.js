
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
		console.log(custom_view);

		//Create google charts
		google.charts.load('current', {
			callback: function () {
				//Create one chart per column
				$.each(custom_view.columns, function (col_index, view_column) {

					//Initialize data array and write header row
					var data_array = [];
					data_array.push(['Column name', 'Amount'])

					//Initialize data map
					var data_map = {};

					//Go through every record and store the occurrence number of each column value
					//in a map
					$.each(custom_view.records, function (record_index, record) {
						var col_value = yritysonline.get_column_value(record, view_column);

						var amount = data_map[col_value];
						if (amount == undefined || amount == null) {
							amount = 1;
						}
						else {
							amount = amount + 1;
						}
						data_map[col_value] = amount;
					});

					//Go through all the keys in a map and create data row
					for (const key in data_map) {
						var explanation = key + " (" + data_map[key] + ")";
						var data_row = [explanation, data_map[key]];
						data_array.push(data_row);
					}

					//Transfor data array into Google data table
					var data = google.visualization.arrayToDataTable(data_array);

					//Create html div to hold the chart
					var chart_div = document.createElement('div');
					var chart_id = "chart_" + col_index;
					chart_div.setAttribute("id", chart_id);
					chart_div.setAttribute("style", "width: 500px; height: 240px;");
					chart_div.setAttribute("class", "col-lg-6");
					document.getElementById('card_body_div').appendChild(chart_div);

					//Add options
					var options = {
						title: view_column.column_alias.toUpperCase()
					};

					//Place chart inside created div
					var chart = new google.visualization.PieChart(chart_div);

					//Draw chart
					chart.draw(data, options);
				});
			},
			packages: ['corechart']
		});

	});

	//Create feather icons
	$(document).ready(function () {
		feather.replace()
	});

	//Bind toggle analysis- button to action
	$("#toggle_analysis_button").click(function () {
		var current_url = window.location.href;
		new_url = current_url.replace("dashboard_analysis", "dashboard");
		window.location.href = new_url;
	});
})();