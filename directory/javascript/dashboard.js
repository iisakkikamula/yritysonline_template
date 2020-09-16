
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

	function date_to_euro_date(datetime_value){
		var dt_year = datetime_value.dateValue.year;
		var dt_month = datetime_value.dateValue.month - 1;
		var dt_day = datetime_value.dateValue.day;
		var dt_hour = datetime_value.timeValue.hour;
		var dt_minute = datetime_value.timeValue.minute;
		var dt_second = datetime_value.timeValue.second;
		var dt_date = new Date(dt_year, dt_month, dt_day, dt_hour, dt_minute, 0, 0);
		return convertToEuroDateAndTime(dt_date);
	}
	
	function convertToEuroDateAndTime(date) {
		
		return add_zero_if_needed(date.getDate())+"."
		+add_zero_if_needed((date.getMonth() + 1))+"."
		+date.getFullYear() + " " 
		+add_zero_if_needed(date.getHours()) + ":"
		+add_zero_if_needed(date.getMinutes());
	};
	
	function add_zero_if_needed(number) {
		if(number < 10){
			return "0" + number;
		}
		return number;
	};
	
	function get_view_url_beginning(){
		var url2 = window.location.href;
		var url_parts = url2.replace(/\/\s*$/,'').split('/'); 
		url_parts.shift();
		return '/private/' + url_parts[3] + '/dashboard?view=';
	}
	
	function get_data_url_beginning(){
		var url2 = window.location.href;
		var url_parts = url2.replace(/\/\s*$/,'').split('/'); 
		url_parts.shift();
		return '/data/' + url_parts[3] + '/';
	}
	
	async function run_processes() {
		let model_url = get_data_url_beginning() + "model_structure";
		let view_url = get_data_url_beginning() + getUrlParameter('view');
		var view_obj;
		var model_obj;
		res = await Promise.all([
			view_obj  = (await fetch(view_url)).json(),
			model_obj = (await fetch(model_url)).json()
		]);
		return [view_obj,model_obj];
	}
	var process_results;
	(async () => {
		process_results = await run_processes();
		var custom_view_promise = process_results[0];
		var model_structure_promise = process_results[1];
		var custom_view = null;
		var model = null;
		model_structure_promise.then(function(defs1){
			console.log(defs1);
			model = defs1;
			
			
			var company_name_slot = document.getElementById("company_name_slot");
			if(model.customer_name != undefined){
				var company_name = document.createTextNode(model.customer_name.toUpperCase()); 
				company_name_slot.appendChild(company_name);  
			}
			
			var sidebarlist = document.getElementById("sidebarlist");
			var links = ['test', 'test2'];
			$.each(model.views, function( index, view ){
			
				if('none' != view.visibility){
					var a = document.createElement('A');
					var link = document.createTextNode(view.view_alias); 
					a.appendChild(link);  
					a.setAttribute('class','list-group-item list-group-item-action bg-light');
					a.setAttribute('href',get_view_url_beginning() + view.view_name);
					sidebarlist.appendChild(a);
				}
			});
		});
		custom_view_promise.then(function(defs2){
		
					
			custom_view = defs2;
			
			//Excel link
			var excel_div = document.getElementById("excel_div");
					var excel_link = document.createElement('A');
					var link = document.createTextNode('EXCEL'); 
					excel_link.appendChild(link);  
					excel_link.setAttribute('href','/EXCELS_export/' + custom_view.database_name + '/' + custom_view.view_name);
					excel_div.appendChild(excel_link);
			
				var datatable_heading = document.getElementById("datatable_heading");
				var view_alias = custom_view.view_alias;
				if(view_alias == undefined){ 
					view_alias = "-";
				}
				var view_name = document.createTextNode(view_alias); 
				datatable_heading.appendChild(view_name);
			
			
		
		var header_cols = [];
		header_cols.push("");
		$.each(custom_view.columns_sorted, function( index, view_column ){
			header_cols.push(view_column.column_alias);
		});
		header_cols.push("");
		var header_row = document.getElementById("header_row");
		var footer_row = document.getElementById("footer_row");
		$.each(header_cols, function( index, header_col ){
			var th = document.createElement('TH');
			th.innerHtml = header_col;
			header_row.appendChild(th);
			th = document.createElement('TH');
			th.innerHtml = header_col;
			footer_row.appendChild(th);
		});
		
		console.log(custom_view);
		var language = {
		"decimal":        "",
		"emptyTable":     "Ei dataa",
		"info":           "Hakutulokset _START_ - _END_ kaikista hakutuloksista (_TOTAL_)",
		"infoEmpty":      "Showing 0 to 0 of 0 entries",
		"infoFiltered":   "(Hakutuloksia _MAX_ kpl)",
		"infoPostFix":    "",
		"thousands":      ",",
		"lengthMenu":     "Hakutuloksia sivulla: _MENU_",
		"loadingRecords": "Ladataan...",
		"processing":     "Prosessoidaan...",
		"search":         "Haku:",
		"zeroRecords":    "Ei hakutuloksia",
		"paginate": {
			"first":      "<<",
			"last":       ">>",
			"next":       ">",
			"previous":   "<"
		},
		"aria": {
			"sortAscending":  ": Nouseva",
			"sortDescending": ": Laskeva"
		}
	};
		
	var date_column_indexes = [];
	var tabledata = [];	
	$.each(custom_view.records, function(index, record) {
		var row_data = [];
		var edit_href = href="/private/" + custom_view.database_name + "/edit_via_rest?edit_view=" + custom_view.edit_view_name + "&record_id=" + record.id;
		row_data.push(edit_href);
		$.each(custom_view.columns_sorted, function( index, view_column ){
			var col_name = view_column.column_name;
			var col_value = "";
			if('text' == view_column.column_type){
				col_value = record.columns[col_name].stringValue;
				if(col_value == undefined){
					col_value = "";
				}
			}
			if('double' == view_column.column_type){
				col_value = record.columns[col_name].doubleValue;
			}
			if('integer' == view_column.column_type){
				col_value = record.columns[col_name].doubleValue;
			}
			if('foreign_id' == view_column.column_type){
				col_value = record.columns[col_name].doubleValue;
			}
			if('datetime' == view_column.column_type){
				date_column_indexes.push(index);
				if(record.columns[col_name].dateValue != undefined){
					col_value = date_to_euro_date(record.columns[col_name]);
				}
			}
			row_data.push(col_value);
		});
		row_data.push(record.id);
		tabledata.push(row_data);
	});
	
	
	var header_cols = [];
	header_cols.push({title:""});
	$.each(custom_view.columns_sorted, function( index, view_column ){
		header_cols.push({title: view_column.column_alias});
	});
	header_cols.push({title: ""});
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
	$.each(date_column_indexes, function( index, date_column_index ){
		column_defs.push(
			{ targets: date_column_index, type: 'date-custom' }
		);
	});
	
    var table = $('#example').DataTable( {
		language: language,
        data: tabledata,
        columns: header_cols,
		"columnDefs": column_defs
    } );
	
	$.extend($.fn.dataTableExt.oSort, {
		"date-custom-pre": function(a){
			var millis = Date.parse(a);
			return millis;
		}
	});
	
	$('#example tbody').on( 'click', '.editlink', function () {
        var data = table.row( $(this).parents('tr') ).data();
		window.location.href = data[0];
    } );
	$('#example tbody').on( 'click', '.deletebutton', function () {
        var data = table.row( $(this).parents('tr') ).data();
		var id_col_index = data.length - 1;
		delete_record(data[id_col_index]);
    } );
	
	$("#new_record_button").click( function(){
		create_record();
	});
	
function create_record(){

	var create_url = '/CRUD_REST/' + custom_view.database_name + '/' + custom_view.edit_table + '/create_record_REST';
		var edit_href = href="/private/" + custom_view.database_name + "/edit_via_rest?edit_view=" + custom_view.edit_view_name + "&record_id=";
	$.ajax({
	  type: "POST",
	  url: create_url,
	  data: "{}",
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
}

function delete_record(record_id_to_delete){

	var delete_url = '/CRUD_REST/' + custom_view.database_name + '/' + custom_view.edit_table + '/' + record_id_to_delete + '/delete_record_REST';
	$.ajax({
	  type: "POST",
	  url: delete_url,
	  data: "{}",
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
}
		});
 
$(document).ready(function() {
	
  feather.replace()
} );
	})();