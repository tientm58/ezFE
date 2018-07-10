ezCloud.controller('invoiceReportsController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$mdMedia', '$timeout', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'exportBuilder',
	function($scope, $rootScope, $state, $location, $mdDialog, $mdMedia, $timeout, $filter, loginFactory, utilsFactory, $localStorage, dialogService, exportBuilder){

	var TO_DAY = 0, TOMMORROW = 1, THIS_WEEK = 2, NEXT_WEEK = 3, THIS_MONTH = 4, PREVIOUS_MONTH = 5, 
		THIS_QUARTER = 6, PREVIOUS_QUARTER = 7, SIX_MONTH_PREVIOUS = 8, THIS_YEAR = 9, PREVIOUS_YEAR = 10, SUCCESS_CODE = 0, INVOICE_FUND = {'cashFunds' : 1, 'depositFunds': 2}, INVOICE_GROUP = {'income': 1, 'outcome': 2};

	$scope.attributes = {
		data: {},
		currency: [],
		maxDate: moment().toDate(),
		times: [
			{
				value: 0,
				description: $filter('translate')('TODAY')
			},
			/*{
				value: 1,
				description: $filter('translate')('TOMORROW')
			},	*/
			{
				value: 2,
				description: $filter('translate')('THIS_WEEK')
			},
			/*{
				value: 3,
				description: $filter('translate')('NEXT_WEEK')
			},*/{
				value: 4,
				description: $filter('translate')('THIS_MONTH')
			},{
				value: 5,
				description: $filter('translate')('PREVIOUS_MONTH')
			},{
				value: 6,
				description: $filter('translate')('THIS_QUARTER')
			},{
				value: 7,
				description: $filter('translate')('PREVIOUS_QUARTER')
			},{
				value: 8,
				description: $filter('translate')('SIX_MONTH_PREVIOUS')
			},{
				value: 9,
				description: $filter('translate')('THIS_YEAR')
			},{
				value: 10,
				description: $filter('translate')('PREVIOUS_YEAR')
			}
		],
		filters: 
		{
			startDate: new Date(),
			endDate: new Date(),
			selectedTime: null,
			selectedItemType: null
		},
	}

	$scope.action = {
		getReportData: function(startDate, endDate)
		{
			var startDate = new Date($scope.attributes.filters.startDate);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setMilliseconds(0);
			startDate.setSeconds(0);
			var endDate = new Date($scope.attributes.filters.endDate);
			endDate.setHours(23);
			endDate.setMinutes(59);
			endDate.setMilliseconds(59);
			endDate.setSeconds(59);

			var params = 
			{
					StartDate: startDate.toUTCString(),//moment($scope.attributes.filters.startDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
					EndDate: endDate.toUTCString(),//moment($scope.attributes.filters.endDate).format("YYYY-MM-DDTHH:mm:ss") + "Z"
			}

			$scope.promise = utilsFactory.sendGetRequest('api/Invoices/InvoicesReport001', params);
			$scope.promise.success(function(res)
			{
				if(res && res.Code == SUCCESS_CODE)
					$scope.attributes.data = res && res.Data ? res.Data : {};
			});
		},
		searchInvoice: function()
		{
			var times = {
				StartDate: moment($scope.attributes.filters.startDate).format("YYYY-MM-DDT00:00:00") + "Z",
				EndDate: moment($scope.attributes.filters.endDate).format("YYYY-MM-DDT23:59:59") + "Z",
			};

			return this.getReportData(times.StartDate, times.EndDate);
		},
		setDatePicker: function(formName)
		{	
			var time = moment().startOf('day').toDate(),endTime = moment().endOf('day').toDate();
			var currentTime = $scope.attributes.filters.selectedTime;

			if(currentTime == TO_DAY)
			{
				time = moment().startOf('day').toDate();
				endTime = moment().endOf('day').toDate();
			}
			else if(currentTime == TOMMORROW)
			{
				time = moment().add(1, 'day').startOf('day').toDate();
				endTime = moment().add(1, 'day').endOf('day').toDate();
			}
			else if(currentTime == THIS_WEEK)
			{
				time = moment() ? moment().startOf('isoWeek').toDate() : new Date();
				endTime = moment() ? moment().endOf('isoWeek').toDate() : new Date();
			}else if(currentTime == NEXT_WEEK)
			{
				time = moment() ? moment().add(1, 'weeks').startOf('isoWeek').toDate() : new Date();
				endTime = moment() ? moment().add(1, 'weeks').endOf('isoWeek').toDate() : new Date();
			}else if(currentTime == THIS_MONTH)
			{
				time = moment() ? moment().startOf('month').toDate() : new Date();
				endTime = moment() ? moment().endOf('month').toDate() : new Date();
			}else if(currentTime == PREVIOUS_MONTH)
			{
				time = moment() ? moment().subtract(1, 'month').startOf('month').toDate() : new Date();
				endTime = moment() ? moment().subtract(1, 'month').endOf('month').toDate() : new Date();
			}else if(currentTime == THIS_QUARTER)
			{
				time = moment() ? moment().quarter(moment().quarter()).startOf('quarter').toDate() : new Date();
				endTime = moment() ? moment().quarter(moment().quarter()).endOf('quarter').toDate() : new Date();
			}else if(currentTime == PREVIOUS_QUARTER)
			{
				var currentQuarter = moment().quarter();
				var lastQuarter = currentQuarter === 1 ? 4 : moment().quarter() - 1;
				if(currentQuarter === 1)
				{
					time = moment() ? moment().subtract(1, "year").quarter(lastQuarter).startOf('quarter').toDate() : new Date();
					endTime = moment() ? moment().subtract(1, "year").quarter(lastQuarter).endOf('quarter').toDate() : new Date();
				}
				else
				{
					time = moment() ? moment().quarter(lastQuarter).startOf('quarter').toDate() : new Date();
					endTime = moment() ? moment().quarter(lastQuarter).endOf('quarter').toDate() : new Date();
				}
			}else if(currentTime == SIX_MONTH_PREVIOUS)
			{
				time = moment() ? moment().subtract(6, 'month').startOf('month').toDate() : new Date();
				endTime = moment() ? moment().subtract(6, 'month').endOf('month').toDate() : new Date();
			}else if(currentTime == THIS_YEAR)
			{
				time = moment() ?moment().startOf('year').toDate() : new Date();
				endTime = moment() ? moment().endOf('year').toDate() : new Date();
			}else if(currentTime == PREVIOUS_YEAR)
			{
				time = moment() ? moment().subtract(1, 'year').startOf('year').toDate() : new Date();
				endTime = moment() ? moment().subtract(1, 'year').endOf('year').toDate() : new Date();
			}

			$scope.attributes.filters.startDate = time;
			$scope.attributes.filters.endDate = endTime;
		},
		displayName: function(name){
			if(name != null && name != 'undefined' && name.indexOf('--')!==1)
			{
				var str = name.split('--')
				var t = str[str.length - 1];
				return t;
				// return "" + name;
			}
		},
		getListCurrency: function()
		{
			if(_.isEmpty($scope.attributes.currency) || _.isEmpty($scope.attributes.listCurrencies))
			{
				infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');
				infoPromise.then(function(data, status, headers, config){
					$scope.attributes.currency = data.data && data.data.Data ? _.pluck(data.data.Data, 'MoneyName') : [];
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
		viewReportDetail: function(url, record, index, type)
		{
			if(!record || !angular.isObject(record))
				return;
			var missingurl = type===1 ? '/receiptdetails' : '/paymentdetails';
			url = url ? String(url) : missingurl;
			url = url.indexOf('/') !== -1 ? url : '/' + url;

			var startDate = new Date($scope.attributes.filters.startDate);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setMilliseconds(0);
			startDate.setSeconds(0);
			var endDate = new Date($scope.attributes.filters.endDate);
			endDate.setHours(23);
			endDate.setMinutes(59);
			endDate.setMilliseconds(59);
			endDate.setSeconds(59);

			var dateFil = {
				startDate: moment(startDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
				endDate: moment(endDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
			}

			return $location.path(url).search(angular.extend(
				{
					paymentTypeDetailId: record.PaymentTypeDetailId,
					paymenttypedetailname: record.Name,
					type: type,
				}, dateFil));
		},
		viewBookDetail: function(url, curr, type)
		{
			url = url.indexOf('/') !== -1 ? url : '/' + url;
			var startDate = new Date($scope.attributes.filters.startDate);
			startDate.setHours(0);
			startDate.setMinutes(0);
			startDate.setMilliseconds(0);
			startDate.setSeconds(0);
			var endDate = new Date($scope.attributes.filters.endDate);
			endDate.setHours(23);
			endDate.setMinutes(59);
			endDate.setMilliseconds(59);
			endDate.setSeconds(59);

			var dateFil = {
				startDate: moment(startDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
				endDate: moment(endDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
				type: type,
				Curr:curr,
			}

			return $location.path(url).search(dateFil);
		},
		export:
		{
			excel: function(gridId)
			{
				var exportHref = exportBuilder.tableToExcel(gridId, 'InvoicesReport001');
				$timeout(function(){location.href=exportHref;},100);
			},
			pdf: function(gridId)
			{
				return exportBuilder.toPdf(gridId);
			}
		},
		checkIfTHUCHIModuleActive: function() {
			var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
			if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
				var thuchiModule = _.filter(ezHotelModulesList, function(module) {
					return module.EzModules != null && module.EzModules.ModuleCode == "THUCHI" && module.EzModules.Status == true && module.Status == true;
				});
				console.info("thuchiModule", thuchiModule);
				if (thuchiModule == null || thuchiModule.length == 0) {
					var translated_title = $filter("translate")("LOG_MESSAGES");
					var translated_content = $filter("translate")("THUCHI_SUGGEST_MESSAGE");
					var translated_ok = $filter("translate")("OK");
					var translated_cancel = $filter("translate")("CANCEL");

					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.body))
						.clickOutsideToClose(false)
						.title(translated_title)
						.textContent(translated_content)
						//.ariaLabel('Alert Dialog POS')
						.ok(translated_ok)
						.targetEvent(null)
					).then(function() {
						$location.path("modulePaymentManagement");
					});
					return false;
				}
				return true;
			}
		},
		init: function()
		{
			if(this.checkIfTHUCHIModuleActive()){
				this.getReportData(moment(moment().startOf('day').toDate()).format("YYYY-MM-DDTHH:mm:ss") + "Z"
				, moment(moment().endOf('day').toDate()).format("YYYY-MM-DDTHH:mm:ss") + "Z");
				this.getListCurrency();
			}
		}
	}

}]);