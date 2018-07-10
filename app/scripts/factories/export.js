ezCloud.factory('ExcelFactory', ['$window', function ($window) {
var uri='data:application/vnd.ms-excel;base64,',
            template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><?xml version="1.0" encoding="UTF-8" standalone="yes"?><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table >{table}</table></body></html>',
            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
        return {
            tableToExcel:function(tableId,worksheetName){
                var table=document.querySelector(tableId),
                // ctx={worksheet:worksheetName,table:table.innerHTML},
                ctx={table:table.innerHTML},
                href=uri+base64(format(template,ctx));
                var a = document.createElement('a');
                a.href = href;
                a.download = worksheetName+'.xls';
                a.click();   
                // return href;
            }
        };
}]);