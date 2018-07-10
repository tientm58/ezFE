ezCloud.factory("mInvoiceFactory", ['$state', '$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$mdDialog',
	function ($state, $http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $mdDialog) {
		var minvoicefactory = {
			checkIfMInvoiceModuleActive: function () {
				var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
				if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
					var MInvoiceModule = _.filter(ezHotelModulesList, function (module) {
						return module.EzModules != null && module.EzModules.ModuleCode == "M_INVOICE" && module.EzModules.Status == true && module.Status == true;
					});
					console.info("M-Invoice Module", MInvoiceModule);
					if (MInvoiceModule == null || MInvoiceModule.length == 0) {
						var translated_title = $filter("translate")("LOG_MESSAGES");
						var translated_content = $filter("translate")("M_INVOICE_SUGGEST_MESSAGE");
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
						).then(function () {
							$location.path("modulePaymentManagement");
						});
						return false;
					}
					return true;
				}
			},
			getPaginationInstance: function (config) {
				var self = this;
				var _config = {
					PageNumber: config && config['PageNumber'] ? config['PageNumber'] : 1,
					PageSize: config && config['PageSize'] ? config['PageSize'] : 10,
					order: config && config['order'] ? config['order'] : 'name',
				};

				var pagination = {
					config: {
						limitPagination: (config && config['limitPagination'] ? config['limitPagination'] : [5, 10, 15]),
						label: config && config['label'] ? config['label'] : { page: 'page:', rowsPerPage: 'rowsPerPage:', of: 'of' },
						totalItems: (config && config['totalItems'] ? config['totalItems'] : (config && config['PageSize'] ? config['PageSize'] : 10))
					},
					query: _config,
					bindingData: function (pageNumber, pageSize, filter) {
						pageNumber -= 1;
						var data = config && config['dataFilter'] ? config['dataFilter'] : {};
						var temp = angular.copy(_config, {});

						data = angular.extend(data, angular.extend(temp, { PageNumber: pageNumber, PageSize: pageSize }));

						if (filter)
							data = angular.extend(data, filter);

						var promise = self.sendGetRequest(
							config && config['api'] ? config['api'] : '',
							data,
							true
						);

						$rootScope.dataLoadingPromise = promise;

						var successCallBack = config && config['successCallBack'];
						successCallBack = angular.isFunction(successCallBack) ? successCallBack : function () { };

						if (promise)
							promise.success(function (response) {
								successCallBack(response);
							});

						return promise;
					}
				}

				return pagination;
			}
		};
		return minvoicefactory;
	}
])