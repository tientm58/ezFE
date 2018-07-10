ezCloud.factory('exportBuilder', ['$window', function($window){
	var uri='data:application/vnd.ms-excel;base64,',
		template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
		base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
		format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
	return {
		tableToExcel:function(tableId,worksheetName){
			var table = $(tableId),
				ctx={worksheet:worksheetName,table:table.html()},
				href=uri+base64(format(template,ctx));
			return href;
		},
		toPdf: function(tableId)
		{
			var element = document.getElementById(tableId);
			if(!element)
				return alert('Export PDF builder is required grid ID, this grid with ID: ' + tableId + 'is not found on this');

			return html2canvas(element, {
				width: element.style.offsetWidth ? element.style.offsetWidth : 2000,
				height: element.style.offsetHeight ? element.style.offsetHeight : 2000,
	            onrendered: function (canvas) {
	                var data = canvas.toDataURL();
	                var docDefinition = {
	                    content: [{
	                        image: data,
	                        width: 500,
	                    }]
	                };

	                pdfMake.createPdf(docDefinition).download("report.pdf");
	            }
	        });
		}
	};
}]);