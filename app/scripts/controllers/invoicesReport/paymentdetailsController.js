ezCloud.controller('paymentdetailsController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$mdMedia', '$timeout', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'exportBuilder',
	function ($scope, $rootScope, $state, $location, $mdDialog, $mdMedia, $timeout, $filter, loginFactory, utilsFactory, $localStorage, dialogService, exportBuilder) {

		var SUCCESS_CODE = 0;

		$scope.attributes = {
			data: {},
			currency: [],
			filters:
				{
					startDate: $location.search().startDate != null ? $location.search().startDate : new Date(),
					endDate: $location.search().endDate != null ? $location.search().endDate : new Date(),
					paymenttypedetailid: $location.search().paymentTypeDetailId != null && $location.search().paymentTypeDetailId != 'undefined' ? $location.search().paymentTypeDetailId : null,
				},
			reportname: $location.search().paymenttypedetailname,
			receiptmoney: [],
			paymentmoney: [],
		}

		$scope.action = {
			getReportData: function (startDate, endDate, paymenttypedetailid, type) {

				var startDate3 = (startDate ? startDate : $scope.attributes.filters.startDate);//new Date($scope.attributes.filters.startDate);
				var startDate2 = new Date(startDate3);
				startDate2.setHours(0);
				startDate2.setMinutes(0);
				startDate2.setMilliseconds(0);
				startDate2.setSeconds(0);
				var endDate3 = (endDate ? endDate : $scope.attributes.filters.endDate);//new Date($scope.attributes.filters.endDate);
				var endDate2 = new Date(endDate3);
				endDate2.setHours(0);
				endDate2.setMinutes(0);
				endDate2.setMilliseconds(0);
				endDate2.setSeconds(0);

				var params =
					{
						StartDate: startDate2.toUTCString(),
						EndDate: endDate2.toUTCString(),
						PaymentTypeDetailId: paymenttypedetailid ? paymenttypedetailid : 0,
						Type: type,
					}

				$scope.promise = utilsFactory.sendGetRequest('api/Invoices/InvoicesReportPaymentDetails', params);
				$scope.promise.success(function (res) {
					if (res && res.Code == SUCCESS_CODE) {
						$scope.attributes.data = res && res.Data ? res.Data : {};
						if ($scope.attributes.data.length > 0) {
							getTotalAmountByCurrency($scope.attributes.data, 1);
							getTotalAmountByCurrency($scope.attributes.data, 2);
						}
					}

				});
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
			getTotAmountByCurrency: function (curr, listMoney) {
				var moneylist = listMoney || [];
				if (!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
					return 0.00
	
				var obj = _.find(moneylist, function (money) {
					return (money['MoneyName'] === curr) ? money['SumAmount'] : 0.00;
				});
	
				return obj ? obj.SumAmount: 0.00;
			},
			displayDateTime: function(datetime){

				if(datetime != null && datetime !== 'undefined'){
					var date = new Date(datetime);
					return date;
				}
			},
			export:
				{
					excel: function (gridId) {
						var exportHref = exportBuilder.tableToExcel(gridId, 'Báo cáo chi tiết chi ' + $scope.attributes.reportname);
						$timeout(function () { location.href = exportHref; }, 100);
					},
					pdf: function (gridId) {
						return exportBuilder.toPdf(gridId);
					}
				},
			init: function () {
				var pid = 0;
				var startdate = new Date();
				var enddate = new Date();
				var type = 0;
				var paymentid = $location.search().paymentTypeDetailId;
				if (_.isNull(paymentid) || _.isUndefined(paymentid)) {
					pid = null;
				}
				else if (paymentid) {
					pid = parseInt(paymentid);
				}
				var sdate = $location.search().startDate;
				if (_.isNull(sdate) || _.isUndefined(sdate)) {
					startdate = new Date();
				}
				else if (sdate) {
					startdate = sdate;
				}

				var edate = $location.search().endDate;
				if (_.isNull(edate) || _.isUndefined(edate)) {
					enddate = new Date();
				}
				else if (edate) {
					enddate = edate;
				}

				var t = $location.search().type;
				if (_.isNull(t) || _.isUndefined(t)) {
					type = null;
				}
				else if (t) {
					type = t;
				}

				this.getListCurrency();
				this.getReportData(startdate, enddate, pid, type);
			}
		}

		var getTotalAmountByCurrency = function (invoicelist, type) {
			angular.forEach($scope.attributes.currency, function (value, key) {
				var totalamount = 0;
				angular.forEach(invoicelist, function (subvalue, subkey) {
					var moneylst = type == 1 ? subvalue.ReceiptMoney : subvalue.PaymentMoney;
					var amount = $scope.action.getTotAmountByCurrency(value, moneylst);
					totalamount = totalamount + amount;
				});
				if (type === 1) {
					$scope.attributes.receiptmoney.push({ MoneyName: value, SumAmount: totalamount });
				} else {
					$scope.attributes.paymentmoney.push({ MoneyName: value, SumAmount: totalamount });
				}

			});
		}
	}]);