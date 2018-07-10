ezCloud.controller('configSystemController', ['$sce', '$scope', '$rootScope', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$state', 'commonFactory', 'configHotelDisplayFactory', 'currentHotelSettings',
	function ($sce, $scope, $rootScope, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location, $state, commonFactory, configHotelDisplayFactory, currentHotelSettings) {

		$scope.currencyList = [];
		$scope.originalCurrencyList = [];
		$scope.defaultCurrency = {};
		$scope.statusColorList = [];
		$scope.languageList = [];
		$scope.originalStatusColorList = [];
		$scope.isCurrencyListChanged = false;
		$scope.isStatusColorListChanged = false;
		$scope.isHotelTimeSettingChanged = false;
		$scope.isConnectivityListChanged = false;

		$scope.hotelTimeSetting = {};
		$scope.currencyOn = true;
		$scope.colorOn = false;
		$scope.languageOn = false;
		$scope.formOn = false;
		$scope.connectitivyOn = false;
		$scope.invoicePageSize = ["A4", "A5", "A6", "A4_Advance", "A5_Advance", "A6_Advance", "A5_Advance_Currency", "A4_Advance_Currency", "A6_Advance_Currency"];
		$scope.receiptPageSize = ["A4", "A6"];
		//VAT
		$scope.lsthotelFormRoomInvoiceVAT = ["EMPTY","1696"];
		// $scope.optionNightDays = [{name: 'FEE_LATE_CHECKOUT_NIGHT_DAY', value: 'LATE'}, {name: 'FEE_EARLY_CHECKIN_FULL_DAY', value: 'EARLY'}, {name: 'ALL', value: 'ALL'}];
		$scope.optionNightDays = [{
			name: 'NO_SURCHARGE',
			value: 'NO'
		}, {
			name: 'FEE_LATE_CHECKOUT_NIGHT_DAY',
			value: 'LATE'
		}];
		$scope.hotelFormRoomInvoice = [];
		$scope.hotelFormRoomInvoiceVAT = null;
		$scope.hotelFormRoomReceipt = [];
		$scope.ishotelFormRoomInvoiceChanged = false;
		$scope.currentHotelFormRoomInvoice = [];
		$scope.hotelFormsList = [];
		// $scope.hotelFormsLang = "";
		$scope.hotelFormsBody = {
			Body: ""
		};


		function configSystemInit() {

			configFactory.getAllSystemData(function (data) {

				$scope.test = true;
				$scope.connectivityModuleList = data.connectivities;
				for (var index in $scope.connectivityModuleList) {
					/*if ($scope.connectivityModuleList[index].code && $scope.connectivityModuleList[index].code.HotelConnectivityModuleName == "SMART_CARD_ADEL") {
						$scope.connectivityModuleList[index].link = "http://download.ezcloudhotel.com/ezCloudHotel.AdelConnector.exe";
					}

					if ($scope.connectivityModuleList[index].code && $scope.connectivityModuleList[index].code.HotelConnectivityModuleName == "SMART_CARD_HUNE") {
						$scope.connectivityModuleList[index].link = "http://download.ezcloudhotel.com/ezCloudHotel.HuneConnector.exe";
					}
					if ($scope.connectivityModuleList[index].code && $scope.connectivityModuleList[index].code.HotelConnectivityModuleName == "SMART_CARD_ORBITA") {
						$scope.connectivityModuleList[index].link = "http://download.ezcloudhotel.com/ezCloudHotel.OrbitaConnector.exe";
					}*/
					$scope.connectivityModuleList[index].link = $scope.connectivityModuleList[index].code.LinkDownload;
				}
				$scope.originalConnectivityModuleList = angular.copy($scope.connectivityModuleList);
				$scope.currentHotelDefaultMoneyId = data.currentHotelDefaultMoneyId;
				$scope.moneys = data.moneys;
				$scope.currentHotelDefaultMoney = _.filter($scope.moneys, function (item) {
					return (item.MoneyId == $scope.currentHotelDefaultMoneyId)
				})[0];
				$scope.currencies = _.filter(data.currencies, function (item) {
					return (item.MoneyId != $scope.currentHotelDefaultMoneyId);
				});
				$scope.originalCurrencyList = angular.copy(data.currencyList);
				$scope.statusColorList = data.statusColorList;
				$scope.originalStatusColorList = angular.copy(data.statusColorList);
				$scope.hotelTimeSetting = data.hotelTimeSetting;
				var res = $scope.hotelTimeSetting.FullDayCheckoutTime.toString().split(":");
				$scope.hotelTimeSetting.FullDayCheckoutTime = new Date(1970, 0, 1, res[0], res[1], res[2]);
				var res2 = $scope.hotelTimeSetting.FullDayCheckinTime.toString().split(":");
				$scope.hotelTimeSetting.FullDayCheckinTime = new Date(1970, 0, 1, res2[0], res2[1], res2[2]);
				var res = $scope.hotelTimeSetting.DayNightStartTime.toString().split(":");
				$scope.hotelTimeSetting.DayNightStartTime = new Date(1970, 0, 1, res[0], res[1], res[2]);
				var res = $scope.hotelTimeSetting.DayNightEndTime.toString().split(":");
				$scope.hotelTimeSetting.DayNightEndTime = new Date(1970, 0, 1, res[0], res[1], res[2]);
				var res = $scope.hotelTimeSetting.NightAuditTime.toString().split(":");
				$scope.hotelTimeSetting.NightAuditTime = new Date(1970, 0, 1, res[0], res[1], res[2]);
				$scope.hotelTimeSetting.IsRoomDirtyAfterNightAudit = data.hotelTimeSetting.IsRoomDirtyAfterNightAudit;
				$scope.hotelTimeSetting.UseTimeInOutPrivate = data.hotelTimeSetting.UseTimeInOutPrivate;
				var timein = data.hotelTimeSetting.TimeInPrivate.toString().split(":");
				var timeout = data.hotelTimeSetting.TimeOutPrivate.toString().split(":");
				$scope.hotelTimeSetting.TimeOutPrivate = new Date(1970, 0, 1, timeout[0], timeout[1], timeout[2]);
				$scope.hotelTimeSetting.TimeInPrivate = new Date(1970, 0, 1, timein[0], timein[1], timein[2]);
				$scope.hotelTimeSetting.IsUseSumNight == (data.hotelTimeSetting.IsUseSumNight == null) ? 0 : data.hotelTimeSetting.IsUseSumNight;
				$scope.hotelTimeSetting.OffSetMinMax == (data.hotelTimeSetting.OffSetMinMax == null) ? 0 : data.hotelTimeSetting.OffSetMinMax;
				$scope.hotelTimeSetting.OptionNightDay == (data.hotelTimeSetting.OptionNightDay == null) ? 'LATE' : data.hotelTimeSetting.OptionNightDay;
				// offnoshow
				$scope.hotelTimeSetting.IsOffNoShow = data.hotelTimeSetting.IsOffNoShow;
				// 
				$scope.originalHotelTimeSetting = angular.copy($scope.hotelTimeSetting);
				for (var index in $scope.currencyList) {
					$scope.defaultCurrency[index] = ($scope.currencyList[index].MoneyId.toString() === $scope.currentHotelDefaultMoneyId.toString()) ? true : false;
				}
				$scope.originalDefaultCurrency = angular.copy($scope.defaultCurrency);
				$scope.originalHotelTimeSetting.MinutesToRoundUp = $scope.originalHotelTimeSetting.MinutesToRoundUp.toString();

				/*Chinh cho nay*/
				$scope.hotelFormRoomInvoice = data.hotelFormRoomInvoice;
				$scope.hotelFormRoomReceipt = data.hotelFormRoomReceipt; 
				// VAT
				if(data.hotelFormRoomInvoiceVAT == null){
					$scope.hotelFormRoomInvoiceVAT = 'EMPTY';
				}
				else{
					$scope.hotelFormRoomInvoiceVAT = data.hotelFormRoomInvoiceVAT;								
				}
				/*Chinh xong*/
				$scope.hotelFormsList = data.hotelFormsList;
				$scope.currentHotelFormRoomReceipt = angular.copy($scope.hotelFormRoomReceipt);
				$scope.currentHotelFormRoomInvoice = angular.copy($scope.hotelFormRoomInvoice);

				$scope.switchLang($rootScope.language);

			});

			commonFactory.getLanguageList(function (data) {
				$scope.languageList = data;
			});

			$scope.ConditionPolicyOption = {
				language: ($rootScope.language == "vn") ? "vi" : $rootScope.language,
				extraPlugins: 'placeholder,lineheight,tableresize',
				toolbar: [{
						name: 'document',
						items: ['Print', 'Source']
					},
					{
						name: 'clipboard',
						items: ['Undo', 'Redo']
					},
					{
						name: 'styles',
						items: ['Format', 'Font', 'FontSize']
					},
					{
						name: 'basicstyles',
						items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'CopyFormatting', 'HorizontalRule']
					},
					{
						name: 'colors',
						items: ['TextColor', 'BGColor']
					},
					{
						name: 'align',
						items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
					},
					{
						name: 'links',
						items: ['Link', 'Unlink', 'Anchor']
					},
					{
						name: 'paragraph',
						items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
					},
					{
						name: 'insert',
						items: ['Image', 'Table']
					},
				],
				toolbarCanCollapse: false,
				allowedContent: true,
				entities: true,
				height: 842,
				width: 723,
				autoParagraph: false,
				autoGrow_onStartup: true,
				FullPage: false,
				ProtectedTags: 'html|head|body',
				resize_enabled: false
			};
		}
		configSystemInit();
		
		$scope.addCurrency = function () {			

			$mdDialog.show({
				controller: AddCurrenciesDialogController,
				resolve: {
					currencies: function () {
						return $scope.currencies;
					}
				},
				templateUrl: 'views/templates/addCurrencies.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: event,
			}).then(function (selectedCurrencies) {

				for (var index in selectedCurrencies) {
					var newMoney = {
						CurrencyId: selectedCurrencies[index].CurrencyId,
						MoneyName: selectedCurrencies[index].AlphabeticCode,
						ExchangeRate: null,
					};
					$scope.moneys.push(newMoney);
				}
				//setTimeout(function() {
					
				//}, 2000);
				
			}, function () {

			});
			

			function AddCurrenciesDialogController($scope, $mdDialog, $timeout, currencies) {	
				function Init() {
					$scope.currencies = currencies;			
						
					 $timeout(function() {
						jQuery("#box_currency").find("input").focus();
					}, 1000); 						
				}
				Init();

				function loadContacts() {
					var currencies = $scope.currencies;
					return currencies.map(function (c, index) {

						var currency = c;
						return currency;
					});
				}
				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};

				var pendingSearch, cancelSearch = angular.noop;
				var cachedQuery, lastSearch;
				$scope.selectedCurrencies = [];
				$scope.filterSelected = true;
				$scope.querySearch = querySearch;
				$scope.delayedQuerySearch = delayedQuerySearch;
				$scope.currencies = loadContacts();
				/**
				 * Search for contacts; use a random delay to simulate a remote call
				 */
				function querySearch(criteria) {
					cachedQuery = cachedQuery || criteria;
					return cachedQuery ? $scope.currencies.filter(createFilterFor(cachedQuery)) : [];
				}
				/**
				 * Async search for contacts
				 * Also debounce the queries; since the md-contact-chips does not support this
				 */
				function delayedQuerySearch(criteria) {
					cachedQuery = criteria;
					if (!pendingSearch || !debounceSearch()) {
						cancelSearch();
						return pendingSearch = $q(function (resolve, reject) {
							// Simulate async search... (after debouncing)
							cancelSearch = reject;
							$timeout(function () {
								resolve($scope.querySearch(criteria));
								refreshDebounce();
							}, Math.random() * 500, true)
						});
					}
					return pendingSearch;
				}

				function refreshDebounce() {
					lastSearch = 0;
					pendingSearch = null;
					cancelSearch = angular.noop;
				}
				/**
				 * Debounce if querying faster than 300ms
				 */
				function debounceSearch() {
					var now = new Date().getMilliseconds();
					lastSearch = lastSearch || now;
					return ((now - lastSearch) < 300);
				}
				/**
				 * Create filter function for a query string
				 */
				function createFilterFor(query) {
					var lowercaseQuery = angular.lowercase(query);
					return function filterFn(currency) {
						if (currency.AlphabeticCode) {
							return (angular.lowercase(currency.AlphabeticCode).indexOf(lowercaseQuery) != -1);
						}
					};
				}

				$scope.addCurrencies = function () {
					$mdDialog.hide($scope.selectedCurrencies);
				}
			}
		};

		$scope.changeDefaultCurrency = function (index) {
			console.log(index);

			for (var index2 in $scope.defaultCurrency) {

				if (index2.toString() !== index.toString()) {
					$scope.defaultCurrency[index2] = false;
				}
			}
		};

		$scope.$watchCollection('defaultCurrency', function (newValue, oldValue) {
			if (!angular.equals(newValue, oldValue)) {
				$scope.isCurrencyListChanged = true;
			}
			if (angular.equals(newValue, $scope.originalDefaultCurrency)) {

				$scope.isCurrencyListChanged = false;
			}
		});




		$scope.$watch('moneys', function (newValue, oldValue) {
			if (newValue && oldValue && newValue.length !== 0 && oldValue.length !== 0) {
				if (!angular.equals(newValue, oldValue)) {
					$scope.isCurrencyListChanged = true;
				}
				if (angular.equals(newValue, $scope.originalCurrencyList)) {
					$scope.isCurrencyListChanged = false;
				}
			}
		}, true);

		$scope.$watch('hotelFormRoomInvoice', function (newValue, oldValue) {
			if (newValue && oldValue && newValue.length !== 0 && oldValue.length !== 0) {
				if (!angular.equals(newValue, oldValue)) {
					$scope.ishotelFormRoomInvoiceChanged = true;
				}
				if (angular.equals(newValue, $scope.currentHotelFormRoomInvoice)) {
					$scope.ishotelFormRoomInvoiceChanged = false;
				}
			}
		}, true);

		$scope.saveCurrencyList = function () {
			var index;
			for (var index2 in $scope.defaultCurrency) {
				if ($scope.defaultCurrency[index2] === true) {
					index = index2;
					break;
				}
			}
			var CurrencyModel = {
				index: index,
				currencyList: $scope.moneys
			};
			var saveCurrencyList = loginFactory.securedPostJSON("api/Config/System/SaveCurrencyList", CurrencyModel);
			$rootScope.dataLoadingPromise = saveCurrencyList;
			saveCurrencyList.success(function (data) {
				console.log("DATA", data);
				for (var index in data.newCurrencyList) {
					var dataTemp = data.newCurrencyList[index];
					for (var index2 in $scope.moneys) {
						if ($scope.moneys[index2].MoneyName === dataTemp.MoneyName && !$scope.moneys[index2].MoneyId) {
							$scope.moneys[index2].MoneyId = dataTemp.MoneyId;
						}
					}
					$scope.defaultCurrency[$scope.defaultCurrency.length] = (dataTemp.HotelId === data.currentHotelDefaultMoneyId)
				}

				$scope.isCurrencyListChanged = false;
				$scope.originalCurrencyList = angular.copy($scope.moneys);
				dialogService.toast("SAVE_CURRENCY_SUCCESSFUL");
			});
		};

		$scope.removeCurrency = function (currency) {
			console.log("REMOVE");
			var index = $scope.moneys.indexOf(currency);
			$scope.moneys.splice(index, 1)
		};

		$scope.setDefaultColor = function (statusColor) {
			var index = $scope.statusColorList.indexOf(statusColor);
			$scope.statusColorList[index].ColorCode = $scope.statusColorList[index].DefaultColorCode;
		};

		$scope.$watch('statusColorList', function (newValue, oldValue) {
			if (newValue.length !== 0 && oldValue.length !== 0) {
				if (!angular.equals(newValue, oldValue)) {
					$scope.isStatusColorListChanged = true;
				}
				if (angular.equals(newValue, $scope.originalStatusColorList)) {
					$scope.isStatusColorListChanged = false;
				}
			}
		}, true);

		$scope.saveStatusColorList = function () {
			var saveStatusColorList = loginFactory.securedPostJSON("api/Config/System/SaveStatusColorList", $scope.statusColorList);
			$rootScope.dataLoadingPromise = saveStatusColorList;
			saveStatusColorList.success(function (data) {
				$scope.isStatusColorListChanged = false;
				$scope.originalStatusColorList = angular.copy($scope.statusColorList);
				dialogService.toast("SAVE_COLOR_PATTERN_SUCCESSFUL");
			});
		};

		$scope.$watchCollection('hotelTimeSetting', function (newValue, oldValue) {
			if (_.size(newValue) !== 0 && _.size(oldValue) !== 0) {
				if (!angular.equals(newValue, oldValue)) {
					$scope.isHotelTimeSettingChanged = true;
				}
				console.log("NEW VALUE", newValue);
				if (angular.equals(newValue, $scope.originalHotelTimeSetting)) {
					$scope.isHotelTimeSettingChanged = false;
				}
			}
		});


		$scope.saveHotelTimeSettingChanges = function () {
			var HotelTimeSetting = {
				FullDayCheckoutTime: $scope.hotelTimeSetting.FullDayCheckoutTime.getHours().toString() + ":" + $scope.hotelTimeSetting.FullDayCheckoutTime.getMinutes().toString() + ":" + $scope.hotelTimeSetting.FullDayCheckoutTime.getSeconds().toString(),
				FullDayCheckinTime: $scope.hotelTimeSetting.FullDayCheckinTime.getHours().toString() + ":" + $scope.hotelTimeSetting.FullDayCheckinTime.getMinutes().toString() + ":" + $scope.hotelTimeSetting.FullDayCheckinTime.getSeconds().toString(),
				UseDayNightSetting: $scope.hotelTimeSetting.UseDayNightSetting,
				DayNightStartTime: $scope.hotelTimeSetting.DayNightStartTime.getHours().toString() + ":" + $scope.hotelTimeSetting.DayNightStartTime.getMinutes().toString() + ":" + $scope.hotelTimeSetting.DayNightStartTime.getSeconds().toString(),
				DayNightEndTime: $scope.hotelTimeSetting.DayNightEndTime.getHours().toString() + ":" + $scope.hotelTimeSetting.DayNightEndTime.getMinutes().toString() + ":" + $scope.hotelTimeSetting.DayNightEndTime.getSeconds().toString(),
				NightAuditTime: $scope.hotelTimeSetting.NightAuditTime.getHours().toString() + ":" + $scope.hotelTimeSetting.NightAuditTime.getMinutes().toString() + ":" + $scope.hotelTimeSetting.NightAuditTime.getSeconds().toString(),
				MinutesToRoundUp: $scope.hotelTimeSetting.MinutesToRoundUp,
				IsRoomDirtyAfterNightAudit: $scope.hotelTimeSetting.IsRoomDirtyAfterNightAudit,
				IsUseSumNight: $scope.hotelTimeSetting.IsUseSumNight,
				OptionNightDay: $scope.hotelTimeSetting.OptionNightDay,
				OffSetMinMax: $scope.hotelTimeSetting.OffSetMinMax,
				TimeZoneId: $scope.hotelTimeSetting.TimeZoneId,
				IsOffNoShow: $scope.hotelTimeSetting.IsOffNoShow
			}
			if (validatingTimeInOut()) {
				return;
			} else {
				HotelTimeSetting.UseTimeInOutPrivate = $scope.hotelTimeSetting.UseTimeInOutPrivate;
				HotelTimeSetting.TimeInPrivate = $scope.hotelTimeSetting.TimeInPrivate.getHours().toString() + ":" + $scope.hotelTimeSetting.TimeInPrivate.getMinutes().toString() + ":" + $scope.hotelTimeSetting.TimeInPrivate.getSeconds().toString();
				HotelTimeSetting.TimeOutPrivate = $scope.hotelTimeSetting.TimeOutPrivate.getHours().toString() + ":" + $scope.hotelTimeSetting.TimeOutPrivate.getMinutes().toString() + ":" + $scope.hotelTimeSetting.TimeOutPrivate.getSeconds().toString();
			}
			var saveHotelTimeSettingChanges = loginFactory.securedPostJSON("api/Config/System/SaveHotelTimeSetting", HotelTimeSetting);
			$rootScope.dataLoadingPromise = saveHotelTimeSettingChanges;
			saveHotelTimeSettingChanges.success(function (data) {
				$scope.isHotelTimeSettingChanged = false;
				$scope.originalHotelTimeSetting = angular.copy($scope.hotelTimeSetting);
				dialogService.toast("SAVE_TIME_SETTING_SUCCESSFUL");
				$localStorage.TimeInOutPrivate = {
					UseTimeInOutPrivate: HotelTimeSetting.UseTimeInOutPrivate,
					TimeInPrivate: $scope.hotelTimeSetting.TimeInPrivate.getHours().toString() + ":" + $scope.hotelTimeSetting.TimeInPrivate.getMinutes().toString() + ":" + $scope.hotelTimeSetting.TimeInPrivate.getSeconds().toString(),
					TimeOutPrivate: $scope.hotelTimeSetting.TimeOutPrivate.getHours().toString() + ":" + $scope.hotelTimeSetting.TimeOutPrivate.getMinutes().toString() + ":" + $scope.hotelTimeSetting.TimeOutPrivate.getSeconds().toString()
				}
			});
		}

		function validatingTimeInOut() {
			var isFail = false;
			if ($scope.hotelTimeSetting.UseTimeInOutPrivate) {
				if ($scope.hotelTimeSetting.TimeOutPrivate == null || $scope.hotelTimeSetting.TimeInPrivate == null) {
					dialogService.messageBox("WARNING", 'PLEASE_SELECT_TIME_IN_OR_TIME_OUT').then(function () {});
					isFail = true;
				}
			}
			return isFail;
		}

		$scope.chooseTemplateVAT = function(temp){
			$scope.hotelFormRoomInvoiceVAT = temp;
		}

		$scope.saveHotelFormRoomInvoice = function () {
			var HotelFormRoom = [];
			HotelFormRoom.push($scope.hotelFormRoomInvoice);
			HotelFormRoom.push($scope.hotelFormRoomReceipt);
			//HotelFormRoom.push($scope.hotelFormRoomInvoiceVAT);

			var request = {};
			request.Data = HotelFormRoom;
			request.Data1 = $scope.hotelFormsBody;
			if(request.Data1.Body == ""){
				request.Data1.Body = "No_Data";
			}
			request.Data2 = $scope.hotelFormRoomInvoiceVAT;
			var saveHotelFormRoomInvoice = loginFactory.securedPostJSON("api/Config/System/SaveHotelFormRoomInvoice", request);
			$rootScope.dataLoadingPromise = saveHotelFormRoomInvoice;
			saveHotelFormRoomInvoice.success(function (data) {
				$scope.ishotelFormRoomInvoiceChanged = false;
				$scope.currentHotelFormRoomInvoice = angular.copy($scope.hotelFormRoomInvoice);
				dialogService.toast("RECEIPT_SETTINGS_SUCCESS");

				// update list form
				var issetForm = $scope.findFormIndex($scope.hotelFormsBody.LanguageCode);
				if (issetForm < 0) {
					$scope.hotelFormsList.push($scope.hotelFormsBody);
				} else {
					$scope.hotelFormsList[issetForm].Body = $scope.hotelFormsBody.Body;
				}
			});
		}

		$scope.findFormIndex = function (langcode) {
			var langcode2 = langcode;
			return $scope.hotelFormsList.findIndex(function (item) {
				return (item.LanguageCode == langcode2)
			}, langcode2);
		}


		$scope.$watch('connectivityModuleList', function (newValue, oldValue) {
			console.log(newValue, oldValue);
			if (_.size(newValue) !== 0 && _.size(oldValue) !== 0) {
				if (!angular.equals(newValue, oldValue)) {
					$scope.isConnectivityListChanged = true;
				}
				if (angular.equals(newValue, $scope.originalConnectivityModuleList)) {
					$scope.isConnectivityListChanged = false;
				}
			}
		}, true);

		$scope.updateSelection = function (module) {
			console.log("MODULE", module);
			if (module.code.HotelConnectivityModuleName.indexOf("SMART") >= 0 && module.isUsed === true) {
				var otherSmartCardModule = _.filter($scope.connectivityModuleList, function (item) {
					return (item.code.HotelConnectivityModuleName.indexOf("SMART") >= 0 && item.code.HotelConnectivityModuleCodeId != module.code.HotelConnectivityModuleCodeId)
				});
				//otherSmartCardModule[0].isUsed = false;
				console.log("OTHER MODULE", otherSmartCardModule);
				for (var index in otherSmartCardModule) {
					otherSmartCardModule[index].isUsed = false;
					otherSmartCardModule[index].IsInputCardToCheckout = false;
				}
			}




			//START

			/*console.log('module',module.code.HotelConnectivityModuleName);
            if(module.isUsed==true){
                angular.forEach($scope.connectivityModuleList,function(arr){
                    if(arr.code.HotelConnectivityModuleName!=module.code.HotelConnectivityModuleName){
                        arr.isUsed=false;
                    }
                })
            }*/
			//			if (module.code.HotelConnectivityModuleName.indexOf("SMART_CARD") >= 0 && !module.isUsed === true){
			//				var otherSmartCardModule = _.filter($scope.connectivityModuleList, function(item){
			//					return (item.code.HotelConnectivityModuleName.indexOf("SMART_CARD") >= 0 && item.code.HotelConnectivityModuleCodeId != module.code.HotelConnectivityModuleCodeId)
			//				});
			//				otherSmartCardModule[0].isUsed = false;
			//			}
			//END





		}
		$scope.updateInputCardToCheckout = function (module) {
			console.log("MODULE", module);
			if (module.code.HotelConnectivityModuleName.indexOf("SMART") >= 0 && module.IsInputCardToCheckout === true) {
				if (module.isUsed == false || module.code.HotelConnectivityModuleName == "SMART_CARD_ORBITA") {
					module.IsInputCardToCheckout = false;
				} else if (module.isUsed == true) {
					var otherSmartCardModule = _.filter($scope.connectivityModuleList, function (item) {
						return (item.code.HotelConnectivityModuleName.indexOf("SMART") >= 0 && item.code.HotelConnectivityModuleCodeId != module.code.HotelConnectivityModuleCodeId)
					});
					console.log("OTHER MODULE", otherSmartCardModule);
					for (var index in otherSmartCardModule) {
						otherSmartCardModule[index].IsInputCardToCheckout = false;
						otherSmartCardModule[index].isUsed = false;
					}
				}
			}
		}

		$scope.saveConnectivities = function () {
			var isError = false;
			for (var idx in $scope.connectivityModuleList) {
				var connectivity = $scope.connectivityModuleList[idx];
				if (connectivity.isUsed == true && connectivity.IsAutomaticalAddHourCheckout == true && connectivity.HourAddToCheckout > 99) {
					dialogService.messageBox("ERROR", 'HOUR_ADD_TO_CHECKOUT_MAX_99').then(function () {});
					isError = true;
					break;
				}
			}
			if (isError == true) {
				return;
			}
			var saveConnectivities = loginFactory.securedPostJSON("api/Config/System/SaveConnectivitiesSetting", $scope.connectivityModuleList);
			$rootScope.dataLoadingPromise = saveConnectivities;
			saveConnectivities.success(function (data) {
				$scope.isConnectivityListChanged = false;
				$scope.originalConnectivityModuleList = angular.copy($scope.connectivityModuleList);
				dialogService.toast("SAVE_CONNECTITIVE_SETTING_SUCCESSFUL");
			}).error(function (err) {
				console.log("ERR", err);
			})
		}
		//ROOMVIEW TEMPLATE


		$scope.appText = function (val) {
			CKEDITOR.instances.bodyTeamplate.insertText(val);
		}

		$scope.isHotelDisplayChanged = false;

		function getHotelDisplay() {
			configHotelDisplayFactory.getHotelDisplay(function (data) {
				$scope.currenthotelDisplay = angular.copy(data.hotelDisplay);
				$scope.hotelDisplay = data.hotelDisplay;
				$scope.listDisplay = data.Listdisplay;
				$scope.showDisplayGroup($scope.hotelDisplay[0].DisplayGroupId);
				console.log('HOTEL DISPLAY', data, $scope.hotelDisplay);
			});
		};

		$scope.showDisplayGroup = function (groupId) {
			angular.forEach($scope.listDisplay, function (arr) {
				if (arr.DisplayGroupId == groupId) {
					arr.Show = true;
				} else {
					arr.Show = false;
				}
			});
			angular.forEach($scope.hotelDisplay, function (arr) {
				if (arr.DisplayGroupId == groupId) {
					arr.Show = true;
				} else {
					arr.Show = false;
				}
			})
		};
		getHotelDisplay();

		$scope.sortItem = function (groupId, index, action) {
			if (action == "down") {
				var tmp;
				angular.forEach($scope.hotelDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						tmp = angular.copy(arr.List[index]);
						arr.List.splice(index, 1);
						arr.List.push(tmp);
					}
				});

			} else if (action == "up") {
				var tmp;
				angular.forEach($scope.hotelDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						tmp = angular.copy(arr.List[0]);
						arr.List.splice(0, 1);
						arr.List.push(tmp);
					}
				});
			}
		}
		$scope.removeItem = function (groupId, index) {
			if (index == -1) {
				var tmp = [];
				angular.forEach($scope.hotelDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						tmp = angular.copy(arr.List);
						arr.List = [];
					}
				});
				angular.forEach($scope.listDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						angular.forEach(tmp, function (arr1) {
							arr.List.push(arr1);
						})
					}
				});
			} else {
				var tmp;
				angular.forEach($scope.hotelDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						tmp = angular.copy(arr.List[index]);
						arr.List.splice(index, 1);
					}
				});
				angular.forEach($scope.listDisplay, function (arr) {
					if (arr.DisplayGroupId == groupId) {
						arr.List.push(tmp);
					}
				});
			}
		};
		$scope.$watchCollection('hotelDisplay', function (newValues, oldValues) {
			if (!angular.equals(newValues, oldValues)) {
				$scope.isHotelDisplayChanged = true;
			}
			if (angular.equals(newValues, $scope.currenthotelDisplay)) {
				$scope.isHotelDisplayChanged = false;
			}
		});
		$scope.saveTemplate = function () {
			var tmp = [];
			angular.forEach($scope.hotelDisplay, function (arr, indexGroup) {
				arr.DisplayGroupPriority = indexGroup + 1;
				if (arr.List.length > 0) {
					angular.forEach(arr.List, function (arr1, indexGroupDetail) {
						arr1.DisplayGroupDetailPriority = indexGroupDetail + 1;
						tmp.push({
							DisplayGroupDetailId: arr1.DisplayGroupDetailId,
							DisplayGroupId: arr1.DisplayGroupId,
							DisplayGroupPriority: indexGroup + 1,
							DisplayGroupDetailPriority: indexGroupDetail + 1
						});
					});
				}
			});
			$localStorage.displayGroup = $scope.hotelDisplay;
			configHotelDisplayFactory.saveHotelDisplay(tmp, function (data) {
				dialogService.toast("SAVE_ROOM_VIEW_TEMPLATE_SUCCESSFUL");
			});
		};

		// $scope.Preview=function(){
		// 	var useFullScreen = ($mdMedia('xs'));
		// 	$mdDialog.show({
		// 	  controller: ['$scope', '$mdDialog','$location', '$mdMedia', '$rootScope', 'hotelDisplay', previewRoomViewTemplateController],
		// 	  resolve:{
		//   		hotelDisplay:function(){
		//   			return $scope.hotelDisplay;
		//   		}
		// 	  },
		//    templateUrl: 'views/templates/previewRoomViewTemplate.tmpl.html',
		//    parent: angular.element(document.body),
		//    //targetEvent: ev,
		//    clickOutsideToClose:false,
		//    fullscreen: useFullScreen
		//  })
		//  .then(function() {

		//  }, function() {

		//  });
		// }

		$scope.copyTemplate = function (ev) {
			$mdDialog.show({
					controller: DialogController,
					templateUrl: 'views/templates/popupListTemplateRegistrationCard.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					fullscreen: $scope.customFullscreen
				})
				.then(function (answer) {
					if (answer.length > 0) {
						$scope.hotelFormsBody.Body = answer;
					}
				}, function () {
					//   $scope.status = 'You cancelled the dialog.';
				});
		};



		$scope.switchLang = function (langCode) {

			$scope.hotelFormsBody.LanguageCode = langCode;
			var result = $scope.hotelFormsList.find(function (item) {
				if (item.LanguageCode == langCode) {
					return item;
				}
			}, langCode);
			$scope.hotelFormsBody.Body = result == null ? "" : result.Body;

		}

		jQuery("#toolbar").css("position", "unset");
		jQuery("#toolbar").css("top", "0");

		$scope.onReady = function () {
			console.log("leo nguyen run!");
		}

		function DialogController($scope, $mdDialog) {
			$scope.Templates = [{
					name: 'Normal EN',
					body: '<table class="MsoTableGridLight" style="width:499.25pt; border-collapse:collapse; border:none" width="666"> <tbody> <tr style="height:27.4pt"> <td rowspan="3" style="border:solid windowtext 1.0pt; width:162.3pt; border-right:none; padding:0in 5.4pt 0in 5.4pt; height:27.4pt" valign="top" width="216"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><img alt="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="width:165px; height:88px" /></span></span></span></span></span></p> </td> <td colspan="2" style="border-bottom:none; width:336.95pt; border-top:solid windowtext 1.0pt; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:27.4pt" valign="top" width="449"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><b><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-size:18pt;font-family:" times="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;REGISTRATION CARD</span></span></span></b></span></span></span></p> </td> </tr> <tr style="height:17.05pt"> <td style="border:none; width:89.45pt; padding:0in 5.4pt 0in 5.4pt; height:17.05pt" valign="top" width="119"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> </td> <td style="border:none; width:247.5pt; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:17.05pt" valign="top" width="330"> <p align="center" style="margin-bottom:6.0pt; text-align:center; margin:0in 0in 0pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">ezCloudHotel</span></span></span></span></span></p> </td> </tr> <tr style="height:12.1pt"> <td style="border:none; border-bottom:solid windowtext 1.0pt; width:89.45pt; padding:0in 5.4pt 0in 5.4pt; height:12.1pt" valign="top" width="119"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:247.5pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:12.1pt" valign="top" width="330"> <p align="center" style="margin-bottom:6.0pt; text-align:center; margin:0in 0in 0pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">266 Doi Can Street, Ba Dinh District, Ha Noi</span></span></span></span></span></p> </td> </tr> <tr style="height:27.35pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:251.75pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:27.35pt" valign="top" width="336"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Salutation</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Mr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Mrs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Ms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Surname: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Full_name]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">First name:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Pax: </span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Passport number: <b>[Customer_identity_number]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Date of Birth: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_birthday]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Nationality: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_country]</b></span></span></span></span></span></span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:247.5pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:27.35pt" valign="top" width="330"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Rate per night: &nbsp;&nbsp;&nbsp;<b>[Price_room_per_night]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Rate included 5% service charge and 10% VAT</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Room number: &nbsp;&nbsp;&nbsp;<b>[Room_name]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Room type: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Room_type]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Special request:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Arrival date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Arrival]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Departure date: &nbsp;&nbsp;&nbsp;&nbsp;<b>[Departure]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Email address: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_email]</b></span></span></span></span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Transportation</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">&nbsp;&nbsp;&nbsp; Pick up:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Yes&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; Pick up time:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">&nbsp;&nbsp;&nbsp; Drop off: &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Yes&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; Drop off time:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Remark:</span></span></span></span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tours</span></span></span></span></span></p> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Jeep tour Saigon by night&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp; </span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">One day Mekong tour</span></span></span></span></span></p> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Jeep tour after dinner&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Half day Cu Chi tour</span></span></span></span></span></p> <p style="margin:0in 0in 5pt"><span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">&nbsp; &nbsp; &nbsp; ☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:115%"><span new="" roman="" style="font-family:" times="">Other</span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">&nbsp; &nbsp; &nbsp; &nbsp;Please be informed that ezCloudhotel doesn&#39;t take responsibility for any lost, damages caused as well as any physical injuries suffered by the guest. For safety and security reason, in-room safety box provided for guests to use for their valued belongings, and any visitors must be registered at Reception desk.&nbsp;</span></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">&nbsp; &nbsp; &nbsp; Upon signature, I acknowledge that I have read and understood the condition of the residence.</span></span></span></span></span></span></span></p> </td> </tr> <tr style="height:89.5pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:251.75pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:89.5pt" valign="top" width="336"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><i><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">Guest&#39;s signature</span></span></span></span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0in 0in 5pt">&nbsp;</p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:247.5pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:89.5pt" valign="top" width="330"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><i><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">ezCloudHotel team</span></span></span></span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0in 0in 5pt">&nbsp;</p> </td> </tr> </tbody> </table>'
				},
				{
					name: 'Normal VN',
					body: '<table class="MsoTableGridLight" style="width:499.25pt; border-collapse:collapse; border:none" width="666"> <tbody> <tr style="height:27.4pt"> <td rowspan="3" style="border:solid windowtext 1.0pt; width:162.3pt; border-right:none; padding:0in 5.4pt 0in 5.4pt; height:27.4pt" valign="top" width="216"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><img alt="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="width:165px; height:88px" /></span></span></span></span></span></p> </td> <td colspan="2" style="border-bottom:none; width:336.95pt; border-top:solid windowtext 1.0pt; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:27.4pt" valign="top" width="449"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><b><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-size:18pt;font-family:" times="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THẺ ĐĂNG K&Yacute;</span></span></span></b></span></span></span></p> </td> </tr> <tr style="height:17.05pt"> <td style="border:none; width:89.45pt; padding:0in 5.4pt 0in 5.4pt; height:17.05pt" valign="top" width="119"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> </td> <td style="border:none; width:247.5pt; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:17.05pt" valign="top" width="330"> <p align="center" style="margin-bottom:6.0pt; text-align:center; margin:0in 0in 0pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">ezCloudHotel</span></span></span></span></span></p> </td> </tr> <tr style="height:12.1pt"> <td style="border:none; border-bottom:solid windowtext 1.0pt; width:89.45pt; padding:0in 5.4pt 0in 5.4pt; height:12.1pt" valign="top" width="119"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt">&nbsp;</p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:247.5pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:12.1pt" valign="top" width="330"> <p align="center" style="margin-bottom:6.0pt; text-align:center; margin:0in 0in 0pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">266 Doi Can Street, Ba Dinh District, Ha Noi</span></span></span></span></span></p> </td> </tr> <tr style="height:27.35pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:251.75pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:27.35pt" valign="top" width="336"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">K&iacute;nh ch&agrave;o</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Mr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Mrs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""> Ms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Họ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Full_name]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">T&ecirc;n:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Kh&aacute;ch: </span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Số hộ chiếu: <b>[Customer_identity_number]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Ng&agrave;y sinh: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_birthday]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Quốc tịch: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_country]</b></span></span></span></span></span></span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:247.5pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0in 5.4pt 0in 5.4pt; height:27.35pt" valign="top" width="330"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Gi&aacute; mỗi đ&ecirc;m: &nbsp;&nbsp;&nbsp;<b>[Price_room_per_night]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Gi&aacute; đ&atilde; bao gồm 5% ph&iacute; dịch vụ v&agrave; 10% VAT</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Số ph&ograve;ng: &nbsp;&nbsp;&nbsp;<b>[Room_name]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Loại ph&ograve;ng: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Room_type]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Y&ecirc;u cầu đặc biệt:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Ng&agrave;y đến: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Arrival]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Ng&agrave;y đi: &nbsp;&nbsp;&nbsp;&nbsp;<b>[Departure]</b></span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Địa chỉ email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[Customer_email]</b></span></span></span></span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Vận chuyển</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">&nbsp;&nbsp;&nbsp; Đ&oacute;n kh&aacute;ch:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Yes&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; Thời gian đ&oacute;n kh&aacute;ch:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">&nbsp;&nbsp;&nbsp; Trả kh&aacute;ch:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Yes&nbsp;&nbsp; </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; Thời gian trả kh&aacute;ch:</span></span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 5pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times="">Y&ecirc;u cầu:</span></span></span></span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tour du lịch</span></span></span></span></span></p> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tour Jeep S&agrave;i G&ograve;n về đ&ecirc;m&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp; </span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tour một ng&agrave;y M&ecirc; K&ocirc;ng</span></span></span></span></span></p> <p style="margin: 0in 0in 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tour Jeep sau bữa ăn tối&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Tour nửa ng&agrave;y Củ Chi</span></span></span></span></span></p> <p style="margin:0in 0in 5pt"><span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;☐ </span></span></span><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Kh&aacute;c</span></span></span></span></span></p> </td> </tr> <tr style="height:26.5pt"> <td colspan="3" style="border:solid windowtext 1.0pt; width:499.25pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:26.5pt" valign="top" width="666"> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">&nbsp; &nbsp; &nbsp; &nbsp;</span></span></span></span></span></span><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span new="" roman="" style="font-family:" times="">Xin lưu &yacute; rằng ezCloudHotel kh&ocirc;ng chịu tr&aacute;ch nhiệm đối với bất kỳ sự thất lạc, chi ph&iacute; tổn&nbsp;thất hay bất k&igrave; thương t&iacute;ch bởi kh&aacute;ch h&agrave;ng. V&igrave; l&yacute; do an to&agrave;n v&agrave; an ninh, k&eacute;t an to&agrave;n trong ph&ograve;ng được cung cấp cho qu&yacute; kh&aacute;ch sử dụng để giữ đồ đạc c&oacute; gi&aacute; trị, v&agrave; bất kỳ kh&aacute;ch v&atilde;ng lai n&agrave;o cũng phải đăng k&yacute; tại b&agrave;n tiếp t&acirc;n.</span></span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:150%"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span style="line-height:150%"><span new="" roman="" style="font-family:" times=""><span style="color:black">&nbsp; &nbsp; &nbsp; Khi k&yacute; t&ecirc;n, t&ocirc;i x&aacute;c nhận rằng t&ocirc;i đ&atilde; đọc v&agrave; hiểu r&otilde; c&aacute;c điều khoản ở đ&acirc;y.</span></span></span></span></span></span></span></p> </td> </tr> <tr style="height:89.5pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:251.75pt; border-top:none; padding:0in 5.4pt 0in 5.4pt; height:89.5pt" valign="top" width="336"> <p align="center" style="text-align:center; margin:0in 0in 10pt"><span style="font-size:11pt"><span style="line-height:115%"><span style="font-family:Calibri,sans-serif"><i><span style="font-size:12.0pt"><span style="line-height:115%"><span new="" roman="" style="font-family:" times=""><span style="color:black">Chữ k&yacute; của kh&aacute;ch</span></span></span></span></i></span></span></span></p> </td> <td style="border-bottom: 1pt solid windowtext; width: 247.5pt; border-top: none; border-left: none; border-right: 1pt solid windowtext; padding: 0in 5.4pt; height: 89.5pt; text-align: center;" valign="top" width="330"><i><span style="font-size:12.0pt"><span style="line-height:115%"><span new="" roman="" style="font-family:" times=""><span style="color:black">ezCloudhotel</span></span></span></span></i></td> </tr> </tbody> </table>'
				},
				{
					name: 'Simple',
					body: '<p><img alt="" src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="width: 128px; height: 81px; float: left;" />&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p> <p style="text-align: center;"><strong><span style="font-size:18px;">REGISTRATION CARD</span></strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p> <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="font-size:16px;">ezCloudHotel</span></p> <hr /> <table border="0" cellpadding="1" cellspacing="1" dir="ltr" style="border-collapse:collapse;margin:10px 0 0px 15px;"> <tbody> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Salutation:&nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span> &nbsp;Mr&nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span> &nbsp;Mrs&nbsp; &nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span> &nbsp;Ms&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Rate per night:&nbsp; &nbsp; [Price_room_per_night]&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Full Name:&nbsp; &nbsp; &nbsp;[Full_name]</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Room number:&nbsp; &nbsp;&nbsp;[Room_name]</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Pax:&nbsp;</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Room type:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [Room_type]</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Passport Number:&nbsp; &nbsp;[Customer_identity_number]</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Specical request:&nbsp;</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Date of birth:&nbsp; &nbsp; &nbsp;&nbsp;[Customer_birthday]</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Arrival date:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;[Arrival]</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Nationality:&nbsp; &nbsp; &nbsp; [Customer_country]</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Departure date:&nbsp; &nbsp; [Departure]</td> </tr> <tr> <td style="border-color: rgb(255, 255, 255); height: 35px;">Phone:&nbsp; &nbsp; &nbsp;[Customer_phone]</td> <td style="border-color: rgb(255, 255, 255); height: 35px;">Email address:&nbsp; &nbsp; &nbsp;[Customer_email]</td> </tr> </tbody> </table> &nbsp; <hr /> <p><span style="font-size:16px;"><strong>Transportation</strong></span></p> <p style="margin-left: 40px;">Pick up:&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; &nbsp;Yes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; No&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Pick up time:</p> <p style="margin-left: 40px;">Drop of:&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; &nbsp;Yes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; No&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Drop off time:</p> <hr /> <p><span style="font-size:16px;"><strong>Tour</strong></span></p> <p style="margin-left: 40px;"><span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; Jeep tour Saigon by night&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp;One day Mekong tour&nbsp;</p> <p style="margin-left: 40px;"><span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; Jeep tour after dinner&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐ </span></span></span>Half day Cu Chi tour</p> <p style="margin-left: 40px;"><span style="font-size:12.0pt"><span style="line-height:115%"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span></span>&nbsp; Other</p> <hr /> <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Please be informed that ezCloudhotel doesn&#39;t take responsibility for any lost, damages caused as well as any physical injuries suffered by the guest. For safety and security reason, in-room safety box provided for guests to use for their valued belongings, and any visitors must be registered at Reception desk.</p> <p style="text-align: center;">&nbsp;Upon signature, I acknowledge that I have read and understood the condition of the residence.</p> <hr /> <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<em>Guest&#39;s signature&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ezCloudHotel team</em></p> <p>&nbsp;</p> <p>&nbsp;</p> <p><em>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</em></p> <hr /> <address>Address: 266 Doi Can Street, Ba Dinh District, Ha Noi&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; Phone: 083 888 888</address>'
				},
				{
					name:'Simple 2',
					body:'<p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><img src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="width: 160px; height: 101px; margin-left: 12px; margin-right: 12px; float: left;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><b><span style="font-size:13.5pt"><span new="" roman="" style="font-family:" times="">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; REGISTRATION CARD</span></span></b>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></span></span></p> <div align="center" style="text-align:center; margin:0cm 0cm 10pt"> <hr align="center" size="2" width="100%" /></div> <table class="Table" style="width: 100%;/* margin-left:22.05pt; */border-collapse:collapse;border:undefined;" width="575"> <tbody> <tr style="height:26.65pt"> <td style="width:224.25pt;padding: 0;height:26.15pt;margin: 0;" valign="top" width="299"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Salutation:&nbsp;&nbsp;</span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"> &nbsp;Mr&nbsp; &nbsp;&nbsp;</span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"> &nbsp;Mrs&nbsp; &nbsp;</span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"> &nbsp;Ms</span></span></span></span></p> </td> <td style="width:206.65pt;padding: 0;height:26.15pt;margin: 0;" valign="top" width="276"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Rate per night:</span></span></span></span></p> </td> </tr> <tr style="height:26.15pt"> <td style="width:224.25pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="299"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Full Name:&nbsp; &nbsp; &nbsp;[Full_name]</span></span></span></span></p> </td> <td style="width:206.65pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="276"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Room number:&nbsp; &nbsp;&nbsp;[Room_name]</span></span></span></span></p> </td> </tr> <tr style="height:26.15pt"> <td style="width:224.25pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="299"> <p style="margin-bottom:8.0pt; margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Pax:&nbsp;</span></span></span></span></p> </td> <td style="width:206.65pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="276"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Room type:&nbsp;[Room_type]</span></span></span></span></p> </td> </tr> <tr style="height:26.15pt"> <td style="width:224.25pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="299"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Email address:&nbsp; &nbsp; &nbsp;</span></span></span></span></p> </td> <td style="width:206.65pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="276"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Arrival date:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;[Arrival]</span></span></span></span></p> </td> </tr> <tr style="height:26.15pt"> <td style="width:224.25pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="299"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Phone:&nbsp; &nbsp; &nbsp;</span></span></span></span></p> </td> <td style="width:206.65pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="276"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Departure date:&nbsp; &nbsp; [Departure]</span></span></span></span></p> </td> </tr> <tr style="height:26.15pt"> <td style="width:224.25pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="299"> <p style="margin-bottom:8.0pt;margin: 5pt 0cm 5pt;"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt">&nbsp;Specical request:&nbsp;</span></span></span></span></p> </td> <td style="width:206.65pt; padding:.75pt .75pt .75pt .75pt; height:26.15pt" valign="top" width="276">&nbsp;</td> </tr> </tbody> </table> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><b><span style="font-size:12.0pt"><span arial="" style="font-family:">Transportation</span></span></b></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">Pick up:&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Yes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; No&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Pick up time:</span></span></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">Drop of:&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Yes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; No&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Drop off time:</span></span></span></span></span></p> <div align="center" style="text-align:center; margin:0cm 0cm 10pt"> <hr align="center" size="2" width="100%" /></div> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><b><span style="font-size:12.0pt"><span arial="" style="font-family:">Tour</span></span></b></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Ha Long&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Cat Ba</span></span></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Sapa&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp;Bai Dinh -&nbsp; Trang An</span></span></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span><span arial="" style="font-family:">&nbsp; Perfume Pagoda</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <span style="font-size:12.0pt"><span segoe="" style="font-family:" symbol="" ui="">☐</span></span>&nbsp; <span style="font-size:10.5pt"><span arial="" style="font-family:">Hoa Lu - Tam Coc</span></span></span></span></span></p> <div align="center" style="text-align:center; margin:0cm 0cm 10pt"> <hr align="center" size="2" width="100%" /></div> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Please be informed that ezCloud&nbsp;is not responsible&nbsp;for any lost, damage&nbsp;caused or&nbsp;any physical injury&nbsp;suffered by the guest. For safety and security reason, we provide&nbsp;in-room safety box&nbsp;for guests to use for&nbsp;valuable belongings storage; any visitor&nbsp;must register at the Reception Desk.</span></span></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">ezCloud&nbsp;is a non-smoking residence, any violation to our non-smoking policy will result in a fine of 1,000,000 VNĐ.</span></span></span></span></span></p> <p align="center" style="text-align:center; margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp;Upon signature, I acknowledge that I have read and understood the condition of the residence.</span></span></span></span></span></p> <div align="center" style="text-align:center; margin:0cm 0cm 10pt"> <hr align="center" size="2" width="100%" /></div> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span style="font-size:12.0pt"><span arial="" style="font-family:">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<i>Guest&#39;s signature&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;ezCloudHotel team</i></span></span></span></span></span></p> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</i></span></span></span></p> <p style="margin:0cm 0cm 10pt">&nbsp;</p> <div align="center" style="text-align:center; margin:0cm 0cm 10pt"> <hr align="center" size="2" width="100%" /></div> <p style="margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span style="font-size:12.0pt"><span arial="" style="font-family:">Address: 266 Doi Can,&nbsp;Ba Dinh District, Ha Noi&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></span></i><i> </i><i><span style="font-size:12.0pt"><span arial="" style="font-family:">Phone: 1900 6159</span></span></i></span></span></span></p>'
				},
				{
					name:'Simple 3',
					body:'<p align="right" style="margin-bottom:.0001pt; text-align:right; margin:0cm 0cm 10pt"><span style="font-size:11pt"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span style="font-size:13.0pt"><span new="" roman="" style="font-family:" times=""><img alt="" src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="float: left; width: 200px; height: 106px;" /><span style="font-size:12px;">Add: 266 Doi Can, Ba Dinh District, Ha Noi,Viet Nam</span></span></span></i></span></span></span></p> <p align="right" style="margin-bottom:.0001pt; text-align:right; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span lang="NL"><span new="" roman="" style="font-family:" times="">Tel: 1900 6159</span></span></i></span></span></span></p> <p align="right" style="text-align: right; margin: 0cm 0cm 10pt 40px;"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span lang="NL"><span new="" roman="" style="font-family:" times="">Email: <font color="#0000ff">sale@ezcloud.vn</font></span></span></i></span></span></span></p> <p style="margin: 0cm 0cm 10pt; text-align: center;"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><b><span new="" roman="" style="font-family:" times="">REGISTRATION CARD&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></b><br /> <span new="" roman="" style="font-family:" times="">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;(THẺ ĐĂNG K&Yacute; PH&Ograve;NG)&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></span></span></span></p> <table align="left" class="Table" style="width:582.15pt; border-collapse:collapse; border:solid windowtext 1.0pt; margin-left:6.75pt; margin-right:6.75pt" width="776"> <tbody> <tr style="height:50.95pt"> <td style="border:solid windowtext 1.0pt; width:189.75pt; padding:0cm 5.4pt 0cm 5.4pt; height:50.95pt" valign="top" width="253"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Reservation No.</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">(<i>Số đăng k&yacute;)</i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Booking_no_of_channel],[Source]</span></span></span></span></p> </td> <td style="border:solid windowtext 1.0pt; width:125.05pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt; height:50.95pt" valign="top" width="167"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Room No.&nbsp; </span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span new="" roman="" style="font-family:" times="">(Số ph&ograve;ng)</span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Room_name]</span></span></span></span></p> </td> <td style="border:solid windowtext 1.0pt; width:137.15pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt; height:50.95pt" valign="top" width="183"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Room type</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span new="" roman="" style="font-family:" times="">(Loại ph&ograve;ng)</span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Room_type]</span></span></span></span></p> </td> <td style="border:solid windowtext 1.0pt; width:130.2pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt; height:50.95pt" valign="top" width="174"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Room rate</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span new="" roman="" style="font-family:" times="">(Gi&aacute; ph&ograve;ng)</span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Price_room_per_night]</span></span></span></span></p> </td> </tr> <tr style="height:36.95pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:314.8pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:36.95pt" valign="top" width="420"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Arrival day</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span new="" roman="" style="font-family:" times="">(Thời gian đến)</span></i></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Arrival]</span></span></span></span></p> </td> <td colspan="2" style="border-bottom:solid windowtext 1.0pt; width:267.35pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt; height:36.95pt" valign="top" width="356"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Departure day<i> </i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span new="" roman="" style="font-family:" times="">(Thời gian đi)</span></i> </span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">[Departure]</span></span></span></span></p> </td> </tr> <tr style="height:63.4pt"> <td style="border:solid windowtext 1.0pt; width:189.75pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:63.4pt" valign="top" width="253"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Guest&rsquo;s Email&nbsp;</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">(<i>Email của kh&aacute;ch)</i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Customer_email]</span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:125.05pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:63.4pt" valign="top" width="167"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Phone No.</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">(Số điện thoại)</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Customer_phone]</span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:137.15pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:63.4pt" valign="top" width="183"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">No.of pax</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">(Số lượng kh&aacute;ch)</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Number_Adults]&amp;&nbsp;[Number_Children]</span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:130.2pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:63.4pt" valign="top" width="174"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Deposit</span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">(Đặt cọc)</span></span></span></span></p> </td> </tr> <tr style="height:53.3pt"> <td style="border:solid windowtext 1.0pt; width:189.75pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:53.3pt" valign="top" width="253"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Name of Guest <i>(T&ecirc;n kh&aacute;ch)</i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Full_name]</span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt">&nbsp;</p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:125.05pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:53.3pt" valign="top" width="167"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Date of birth <i>(Ng&agrave;y sinh)</i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Customer_birthday]</span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:137.15pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:53.3pt" valign="top" width="183"> <p style="margin: 0cm 0cm 10pt; text-align: center;"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Passport/ID No<i>.</i></span><i><span new="" roman="" style="font-family:" times="">(Số Hộ chiếu/CMT)</span></i></span></span></span></p> <p style="margin: 0cm 0cm 10pt; text-align: center;"><span style="font-size:12px;">[Customer_identity_number]</span></p> </td> <td style="border-bottom:solid windowtext 1.0pt; width:130.2pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:.75pt .75pt .75pt .75pt; height:53.3pt" valign="top" width="174"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Nationality <i>(Quốc tịch)</i></span></span></span></span></p> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;">[Customer_country]</span></p> </td> </tr> <tr style="height:21.3pt"> <td colspan="2" style="border:solid windowtext 1.0pt; width:314.8pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:21.3pt" valign="top" width="420"> <p style="margin-bottom:.0001pt; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Airport pick-up (đ&oacute;n tiễn s&acirc;n bay) &nbsp;&nbsp;&nbsp;</span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">&nbsp;&nbsp;Time:&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;.&nbsp;&nbsp;&nbsp; </span></span></span></span></p> </td> <td colspan="2" style="border-bottom:solid windowtext 1.0pt; width:267.35pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt; height:21.3pt" valign="top" width="356"> <p style="margin-bottom:.0001pt; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Drop of at the Airport&nbsp; (Tiễn s&acirc;n bay)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span></span></p> <p style="margin-bottom:.0001pt; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Time &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</span></span></span></span></p> </td> </tr> <tr style="height:37.65pt"> <td colspan="4" style="border:solid windowtext 1.0pt; width:582.15pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:37.65pt" valign="top" width="776"> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Others request:</span></span></span></span></p> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;................................................</span></span></span></span></p> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;................................................</span></span></span></span></p> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;................................................</span></span></span></span></p> </td> </tr> <tr style="height:91.7pt"> <td colspan="4" style="border:solid windowtext 1.0pt; width:582.15pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:91.7pt" valign="top" width="776"> <p align="center" style="margin-bottom:.0001pt; text-align:center; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><b><span new="" roman="" style="font-family:" times="">IMPORTANT <i>(CH&Uacute; &Yacute;)</i></span></b></span></span></span></p> <ol> <li style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">This Room rate is subject to 5% Service Charge and 10% VAT.<i> </i></span><i><span new="" roman="" style="font-family:" times="">(Gi&aacute; ph&ograve;ng bao gồm 5% Ph&iacute; Dịch vụ v&agrave; 10% thuế VAT)</span></i></span></span></span></li> <li style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Guests are required to produce ID or passports to the Hotel Front Desk upon check &ndash; in.</span><i><span new="" roman="" style="font-family:" times="">&nbsp;(Qu&yacute; kh&aacute;ch vui l&ograve;ng tr&igrave;nh Chứng minh thư hoặc Hộ chiếu với Ban Lễ t&acirc;n khi l&agrave;m thủ tục đăng k&yacute;)</span></i></span></span></span></li> <li style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span new="" roman="" style="font-family:" times="">Guests are advised to read the notice displayed on the Reception Counter. Safe deposit boxes are provided free of charge at the Front Desk and in the room.<i> </i></span><i><span new="" roman="" style="font-family:" times="">(Qu&yacute; kh&aacute;ch n&ecirc;n đọc bảng th&ocirc;ng tin tại Quầy Lễ t&acirc;n. K&eacute;t sắt được cung cấp miễn ph&iacute; tại Quầy Lễ&nbsp;t&acirc;n v&agrave; tại ph&ograve;ng)</span></i></span></span></span></li> </ol> </td> </tr> <tr style="height:77.0pt"> <td colspan="4" style="border:solid windowtext 1.0pt; width:582.15pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt; height:77.0pt" valign="top" width="776"> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><span lang="FR" new="" roman="" style="font-family:" times="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Guest&rsquo;s Signature&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Receptionist</span></span></span></span></p> <p style="margin-bottom:.0001pt; text-align:justify; margin:0cm 0cm 10pt"><span style="font-size:12px;"><span style="line-height:normal"><span style="font-family:Calibri,sans-serif"><i><span lang="FR" new="" roman="" style="font-family:" times="">&nbsp; &nbsp; &nbsp;&nbsp;(Chữ k&yacute; của Qu&yacute; kh&aacute;ch)&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;( Lễ t&acirc;n)</span></i></span></span></span></p> </td> </tr> </tbody> </table>'
				}
			]
			$scope.hide = function () {
				$mdDialog.hide();
			};

			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.answer = function (answer) {
				$mdDialog.hide(answer);
			};
			$scope.contentShow = $scope.Templates[0].body;
			$scope.isChoose = 0;
			$scope.choose = function (val, index) {
				$scope.isChoose = index;
				$scope.contentShow = val.body;
			}
			$scope.trustAsHtml = function (string) {
				return $sce.trustAsHtml(string);
			};


		}

	}
]);