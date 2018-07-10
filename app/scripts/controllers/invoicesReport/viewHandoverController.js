ezCloud.controller('viewHandoverController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$mdMedia', '$timeout', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'exportBuilder',
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

		var handoverId = $location.search().handoverId;
		$scope.attributes = {
			data: {},
			currency: [],
			inFund: [],
			diff: [],
			handover: []
		}
		$scope.listCurrencies = [];
		$scope.action = {
			getReportData: function () {
				var params = { HandoverId: handoverId }
				$scope.promise = utilsFactory.sendGetRequest('api/InvoiceHandover/GetHandoverById', params);
				$scope.promise.success(function (res) {
					if (res && res.Code == SUCCESS_CODE)
						$scope.attributes.data = res && res.Data ? res.Data : {};
					var inFundData = _.find($scope.attributes.data.Detail, function (detail) {
						return (detail.HandoverDetailId === HANDOVER_NAME.InHandover) ? detail : null;
					});
					inFundData.ListMoney.forEach(function (element) {
						$scope.attributes.inFund[element.MoneyName] = element.SumAmount;
					});
				});
			}, checkNumber: function (e, curr) {
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
					});
				}
			},
			getMinorUnitCurrency: function (curr) {
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
				this.getListCurrency();
			}
		}
		$scope.addHandover = function () {

			var data = $scope.attributes.data;
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
			data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Infund, HandoverDetailName: 'Số tiền trong két', ListMoney: ListMoneyInFund });
			data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Diff, HandoverDetailName: 'Chênh lệch', ListMoney: ListMoneyDiff });
			data.Detail.push({ HandoverDetailId: HANDOVER_NAME.Handover, HandoverDetailName: 'Bàn giao lại', ListMoney: ListMoneyHandover });


			var confirm = dialogService.confirm('NOTIFICATION', 'ARE_YOU_SURE_TO_ADD', event);
			if (confirm)
				confirm.then(function () {
					var addInvoice = loginFactory.securedPostJSON('api/InvoiceHandover/AddHandover', data);

					if (addInvoice)
						addInvoice.success(function (res) {
							if (res && res.Code === SUCCESS_CODE) {
								dialogService.toast('ADD_SUCCESS');
								$location.path('/invoiceReport003');
							}
							else
								dialogService.toast('ADD_ERROR');
						});
				})
		}

	}
]);