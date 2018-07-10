ezCloud.controller('addHandoverController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$mdMedia', '$timeout', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'exportBuilder',
	function ($scope, $rootScope, $state, $location, $mdDialog, $mdMedia, $timeout, $filter, loginFactory, utilsFactory, $localStorage, dialogService, exportBuilder) {

		var TO_DAY = 0,
			TOMMORROW = 1,
			THIS_WEEK = 2,
			NEXT_WEEK = 3,
			THIS_MONTH = 4,
			PREVIOUS_MONTH = 5,
			THIS_QUARTER = 6,
			PREVIOUS_QUARTER = 7,
			SIX_MONTH_PREVIOUS = 8,
			THIS_YEAR = 9,
			PREVIOUS_YEAR = 10,
			SUCCESS_CODE = 0,
			INVOICE_FUND = {
				'cashFunds': 1,
				'depositFunds': 2
			},
			INVOICE_GROUP = {
				'income': 1,
				'outcome': 2
			},
			HANDOVER_NAME = {
				'BeginHandover': 1,
				'InHandover': 2,
				'EndHandover': 3,
				'Handover': 4,
				'Diff': 5,
				'Infund': 6
			};
		
		$scope.attributes = {
			data: {},
			dataBP: {},
			currency: [],
			inFund: [],
			diff: [],
			handover: []
		}
		$scope.listCurrencies = [];
		$scope.action = {
			getReportData: function () {
				var params = {}
				$scope.promise = utilsFactory.sendGetRequest('api/InvoiceHandover/GetInfoToAddHandover', params);
				$scope.promise.success(function (res) {
					var tmpData = {};
					if (res && res.Code == SUCCESS_CODE)
						tmpData = res && res.Data ? res.Data : {};
					var inFundData = _.find(tmpData.Detail, function (detail) {
						return (detail.HandoverDetailId === HANDOVER_NAME.InHandover) ? detail : null;
					});
					$scope.attributes.inFund = $scope.action.addObject(tmpData);
					$scope.attributes.data = tmpData;
					$scope.attributes.dataBP = angular.copy(tmpData);
					$scope.attributes.data.ListTranction = $scope.action.convertListTranction(tmpData.ListTranction);
					$scope.action.getListCurrency();
				});
			},
			addObject: function( data ){
				var tmp1 = angular.copy(data.Detail[0].ListMoney);
				var tmp2 = data.Detail[1].ListMoney;
				var tmp3 = {};
				tmp1.forEach(function (val, key) {
					var tmp = tmp2.find(function(item){
						return item.MoneyName == val.MoneyName
					});
					if (tmp != null ){
						tmp1[key].SumAmount += tmp.SumAmount;
					}
				}); 
				tmp2.forEach(function (val, key) {
					var tmp = tmp1.find(function (item) {
						return item.MoneyName == val.MoneyName
					});
					if (tmp == null) {
						tmp1.push(val);
					}
				}); 
				var result = {};
				tmp1.forEach(function (val, key) {
					result[val.MoneyName] = val.SumAmount;
				});
				return result;
			},
			convertListTranction: function(data){
				if (data == null ){
					return {};
				}
				// console.log(data);
				var result = data.reduce(function (r, a) {
					r[a.HandoverGroup] = r[a.HandoverGroup] || [];
					r[a.HandoverGroup].push(a);
					return r;
				}, Object.create(null));
				
				for (var key in result) {
					
					var element = result[key];
					var tmp = element.reduce(function (r, a) {
						r[a.HandoverGroupType] = r[a.HandoverGroupType] || [];
						r[a.HandoverGroupType].push(a);
						return r; 
					}, Object.create(null));

					for (var ke in tmp) { 
						var tmpVl = tmp[ke];
						var tmpRS = tmpVl.reduce(function (r, a) {
							if (a.Name != "NEW_PAYMENT" && a.Name != "REFUND" && a.Name != "DEPOSIT" && a.Name) {
								r[a.Name] = r[a.Name] || [];
								r[a.Name] = a.ListMoney;
								return r;
							}else{
								return {};
							}
						}, Object.create(null));
						tmp[ke] = {};
						tmp[ke].name = ke;
						tmp[ke].list = tmpRS;
					}

					result[key] = {};
					result[key].name = key;
					result[key].list = tmp;
				}
				return result;
			},
			checkNumber : function (e, curr) {
				if ($scope.attributes.handover[curr] > $scope.attributes.inFund[curr]) {
					$scope.attributes.handover[curr] = $scope.attributes.inFund[curr];
					this.getDiff(curr);
					e.preventDefault();
				}
			},
			getListCurrency: function () {
				if (_.isEmpty($scope.attributes.currency) || _.isEmpty($scope.attributes.listCurrencies)) {
					infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');
					infoPromise.then(function (data, status, headers, config) {
						$scope.attributes.currency = data.data && data.data.Data ? _.pluck(data.data.Data, 'MoneyName') : [];
						$scope.attributes.listCurrencies = data.data && data.data.Data ? data.data.Data : [];
						$scope.listCurrencies = data.data && data.data.Data ? data.data.Data : [];
						var indexC = {};
						$scope.attributes.listCurrencies.forEach(function (element) {
							indexC[element.MoneyName] = element;
						});
						$scope.attributes.indexCurrencies = indexC;
						$scope.attributes.listCurrencies.forEach(function (element) {
							$scope.attributes.handover[element.MoneyName] = 0;
							$scope.action.getDiff(element.MoneyName);
						});
					});
				}
			},
			getMinorUnitCurrency : function(curr){
				var lstCurrency = $scope.listCurrencies;
				var Curr = _.find(lstCurrency, function (item) {
					return (item.Currencies.AlphabeticCode === curr) ? item : null;
				});
				return Curr != null ? Curr.Currencies.MinorUnit : 0;
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
			getDiff: function (curr) {
				return $scope.attributes.diff[curr] = ($scope.attributes.inFund[curr]) - ($scope.attributes.handover[curr]);
				// value= (money['MoneyName'] === curr) ? (money['SumAmount'] || 0) : 0;
				// return $scope.attributes.diff[curr] = value;
			},
			init: function () {
				this.getReportData();
				
			}
		}
		$scope.addHandover = function () {
			var confirm = dialogService.confirm('NOTIFICATION', 'ARE_YOU_SURE_TO_ADD', event);
			if (confirm){
				confirm.then(function () {
					var data = angular.copy($scope.attributes.data);
					var ListMoneyInFund = [];
					var ListMoneyDiff = [];
					var ListMoneyHandover = [];
					$scope.attributes.listCurrencies.forEach(function (element) {
						var moneyInfund = {
							MoneyName: element['MoneyName'],
							MoneyId: element['MoneyId'],
							SumAmount: $scope.attributes.inFund[element['MoneyName']]
						}
						ListMoneyInFund.push(moneyInfund);

						var moneyDiff = {
							MoneyName: element['MoneyName'],
							MoneyId: element['MoneyId'],
							SumAmount: $scope.attributes.diff[element['MoneyName']]
						}
						ListMoneyDiff.push(moneyDiff);

						var moneyHandover = {
							MoneyName: element['MoneyName'],
							MoneyId: element['MoneyId'],
							SumAmount: $scope.attributes.handover[element['MoneyName']]
						}
						ListMoneyHandover.push(moneyHandover);
					});
					data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Infund, HandoverDetailName: 'SO_TIEN_TRONG_KET', ListMoney: ListMoneyInFund });
					data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Diff, HandoverDetailName: 'CHENH_LECH', ListMoney: ListMoneyDiff });
					data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Handover, HandoverDetailName: 'BAN_GIAO_LAI', ListMoney: ListMoneyHandover });

					data.ListTranction = $scope.attributes.dataBP.ListTranction;
					var addInvoice = loginFactory.securedPostJSON('api/InvoiceHandover/AddHandover', data);
					
					if (addInvoice)
						addInvoice.success(function (res) {
							if (res && res.Code === SUCCESS_CODE) {
								dialogService.toast('ADD_SUCCESS');
								$location.path('/invoiceReport003');
							}
							else
								dialogService.toastWarn('ADD_ERROR');
						});
				});
			}
		}

	}
]);