'use strict';
ezCloud.controller('invoicesReportDetailsController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$mdMedia', '$timeout', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'exportBuilder',
	function($scope, $rootScope, $state, $location, $mdDialog, $mdMedia, $timeout, $filter, loginFactory, utilsFactory, $localStorage, dialogService, exportBuilder){

	var SUCCESS_CODE = 0;	
	$scope.attributes = {
		data: {},
		currency:"",
		filters: 
		{
			startDate: new Date(),
			endDate: new Date(),
		},
		reportname:"",
		receiptmoney:[],
		paymentmoney:[],
		totalbalance:[],
		listCurrencies:[]
	}

	$scope.action = {
		getReportData: function(startDate, endDate, type, Curr)
		{
			var params = 
			{
				StartDate: startDate ? startDate: $scope.attributes.filters.startDate,
				EndDate: endDate ? endDate: $scope.attributes.filters.endDate,
				InvoiceFund: type,
				MoneyName: Curr,
			}

			$scope.promise = utilsFactory.sendGetRequest('api/Invoices/InvoicesReportDetails', params);
			$scope.promise.success(function(res)
			{
				if(res && res.Code == SUCCESS_CODE){
					$scope.attributes.data = res && res.Data ? res.Data : {};
					if($scope.attributes.data.length > 0)
					{
						getTotalAmountByCurrency($scope.attributes.data,1);
						getTotalAmountByCurrency($scope.attributes.data,2);
						getTotalBalanceAmountCurrency($scope.attributes.data);
					}
				}
					
			});
		},
		getListCurrency: function()
		{
			if(_.isEmpty($scope.attributes.currency) || _.isEmpty($scope.attributes.listCurrencies))
			{
				var infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');
				infoPromise.then(function(data, status, headers, config){
					// $scope.attributes.currency = data.data && data.data.Data ? _.pluck(data.data.Data, 'MoneyName') : [];
					$scope.attributes.listCurrencies = data.data && data.data.Data ? data.data.Data : [];
					var indexC = {};
					$scope.attributes.listCurrencies.forEach(function (element) {
						indexC[element.MoneyName] = element;
					});
					$scope.attributes.indexCurrencies = indexC;
				});
			}
		},
		getAmountByCurrency: function (curr, listMoney) {
			var moneylist = listMoney || [];
			if (!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
				return 0;

			var obj = _.find(moneylist, function (money) {
				//return (money['MoneyName'] === curr) ? money['SumAmount'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : 0.00;
				return (money['MoneyName'] === curr) ? money['SumAmount'] : 0;
			});

			//return obj ? obj.SumAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : 0.00;
			return obj ? $filter('currency')(obj.SumAmount, "", $scope.attributes.indexCurrencies[obj.MoneyName].Currencies.MinorUnit) : 0;
		},
		displayDateTime: function(datetime){

			if(datetime != null && datetime !== 'undefined'){
				var date = new Date(datetime);
				return date;
			}
		},
		getTotAmountByCurrency: function (curr, listMoney) {
			var moneylist = listMoney || [];
			if (!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
				return 0;

			var obj = _.find(moneylist, function (money) {
				return (money['MoneyName'] === curr) ? money['SumAmount'] : 0;
			});

			return obj ? obj.SumAmount: 0;
		},
		export:
		{
			excel: function(gridId)
			{
				var exportHref = exportBuilder.tableToExcel(gridId,$scope.attributes.reportname);
				$timeout(function(){location.href=exportHref;},100);
			},
			pdf: function(gridId)
			{
				return exportBuilder.toPdf(gridId);
			}
		},
		init: function()
		{
			var type = 0;
			var startdate = new Date();
			var enddate = new Date();

			var typefund = $location.search().type;
			if(_.isNull(typefund) || _.isUndefined(typefund))
			{
				type = 1;
			}
			else if(typefund)
			{
				type = parseInt(typefund);
			}

			var mid = "";
			var curr = $location.search().Curr;
			if(curr ==="" || _.isUndefined(curr))
			{
				mid = null;
			}
			else if(curr)
			{
				mid = curr;
				$scope.attributes.currency = curr;
			}

			var sdate = $location.search().startDate;
			if(_.isNull(sdate) || _.isUndefined(sdate))
			{
				startdate = new Date();
			}
			else if(sdate)
			{
				startdate = sdate;
				$scope.attributes.filters.startDate = this.displayDateTime(sdate);
			}

			var edate = $location.search().endDate;
			if(_.isNull(edate) || _.isUndefined(edate))
			{
				enddate = new Date();
			}
			else if(edate)
			{
				enddate = edate;
				$scope.attributes.filters.endDate = this.displayDateTime(edate);
			}


			if(type===1)
			{
				$scope.attributes.reportname = 'INVOICE_REPORT_DETAIL_CASH';
			}
			else{
				$scope.attributes.reportname = 'INVOICE_REPORT_DETAIL_DEPOSIT';
			}
			this.getListCurrency();
			this.getReportData(startdate, enddate, type, mid);			
		}
	}

	var getTotalAmountByCurrency = function(invoicelist, type)
	{		
			var subtotalamount = 0;
			angular.forEach(invoicelist, function(value, subkey){
				var submoneylst = type == 1 ? value.ReceiptMoney : value.PaymentMoney;
					var subamount = $scope.action.getTotAmountByCurrency($scope.attributes.currency, submoneylst);
					subtotalamount = subtotalamount + subamount;
			});
			if (type === 1) {
				$scope.attributes.receiptmoney.push({ MoneyName: $scope.attributes.currency, SumAmount: subtotalamount });
			} else {
				$scope.attributes.paymentmoney.push({ MoneyName: $scope.attributes.currency, SumAmount: subtotalamount });
			}
			
	}

	var getTotalBalanceAmountCurrency = function(invoicelist)
	{		
		var totalamount = 0;
			angular.forEach(invoicelist, function(value, subkey){
				var moneylst = value.InvoiceTotalBalance;
					var amount = $scope.action.getTotAmountByCurrency($scope.attributes.currency, moneylst);
					totalamount = totalamount + amount;
			});
				
		$scope.attributes.totalbalance.push({ MoneyName: $scope.attributes.currency, SumAmount: totalamount });
	}

}]);