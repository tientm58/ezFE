ezCloud.controller('guestDatabaseController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'frontOfficeFactory', '$timeout', 'ExcelFactory', 'commonFactory',
	function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, frontOfficeFactory, $timeout, ExcelFactory, commonFactory) {
		$scope.minDate = new Date();

		$scope.travellerInfo = {};
		$scope.reservationRoomInfos = [];

		var EzModulesActive = $rootScope.EzModulesActive;
		$scope.isUsePassport = function(){
			var PassportModule = _.find(EzModulesActive,function(item){
				return item.ModuleCode === "PASSPORT";
			})
			return PassportModule != null ? true : false;
		}

		// phân trang search guestDatabase
		// $scope.page = {
		// 	currentPage: 0,
		// 	pageSize: 10,
		// 	totalRecord: 0
		// }
		// $scope.currentPage = 0;
		// $scope.pageSize = 1;
		// $scope.totalRecord = 0;

		// $scope.numberOfPages = function () {
		//     return Math.ceil($scope.page.totalRecord / $scope.page.pageSize);
		// }
		// $scope.resetCurrentPage = function () {
		//     $scope.page.currentPage = 0;
		// }

		//end phân trang

		$scope.currencyCode = $filter('currency')(0).split(' ')[0];
		function addDays(date, days) {
			var result = new Date(date);
			result.setDate(result.getDate() + days);
			return result;
		}
		function change_alias(alias) {
			var str = alias;
			str = str.toLowerCase();
			str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
			str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
			str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
			str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
			str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
			str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
			str = str.replace(/đ/g, "d");
			str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "");
			str = str.replace(/-+-/g, "");
			str = str.replace(/^\-+|\-+$/g, "");
			return str;
		}

		function Init() {
			jQuery(document).unbind('keydown');
			if (!commonFactory.getCountryList().length) {
				var promise = commonFactory.updateCountryList();
				promise.success(function (data) {
					$scope.countries = data;
					commonFactory.processCountryList(data);

				});
			} else {
				$scope.countries = commonFactory.getCountryList();
			}

			$scope.DatePickerOption = {
				format: 'dd/MM/yyyy'
			};
			$scope.travellerInfo = null;
			$scope.reservationRoomInfos = null;
			$scope.HostName = "http://" + location.hostname;
			$scope.search = {
				ReservationRoomId: null,
				SearchType: "GUEST_DATABASE",
				GuestName: null,
				Phone: null,
				CountryId: 0,
				IdentityNumber: null,
				CreateDateIncluded: true,
				createDateFrom: new Date(),
				createDateTo: addDays(new Date(), 1),
				SkipRecord: 0
				// PageSize: 0,
				// PageNumber: 1
			}
			$scope.TotalRecord = 0;
			$scope.createDateFromString = new Date().format('dd/mm/yyyy');
			$scope.createDateToString = addDays(new Date(), 1).format('dd/mm/yyyy');

			/*frontOfficeFactory.getCountries(function (data) {
				$scope.countries = data;
				
			});*/
			console.log('countries:', $scope.countries);
			$scope.queryCountriesSearch = queryCountriesSearch;
			$scope.selectedCountriesChange = selectedCountriesChange;
			$scope.searchCountriesTextChange = searchCountriesTextChange;

			$scope.searchResult = [];

			frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
				console.log("SEARCH RESULT", data);

				//$scope.resetCurrentPage();
				$scope.searchResult = null;
				$scope.searchResult = data.lstTravellerNew;
				$scope.TotalRecord = data.TotalRecord;
				//$scope.searchResult.amount = $filter('currency')(data.amount);
			});
		}
		Init();

		function queryCountriesSearch(query) {
			console.log('scope.Countries:', $scope.countries);
			var results = query ? $scope.countries.filter(createCountriesFilterFor(query)) : $scope.countries,
				deferred;
			if (self.simulateQuery) {
				deferred = $q.defer();
				$timeout(function () {
					deferred.resolve(results);
				}, Math.random() * 1000, false);
				return deferred.promise;
			} else {
				return results;
			}
		}

		function createCountriesFilterFor(query) {
			var lowercaseQuery = change_alias(query);
			return function filterFn(item) {
				return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
			};
		}

		function selectedCountriesChange(item) {
			console.log("ITEM", item);
			if (item != undefined) {
				$scope.selectedCountries = item;

			} else {
				$scope.selectedCountries = null;
			}

		}

		function searchCountriesTextChange(text) {
			$scope.searchCountriesText = text;
			/*console.log("TEXT", text);
			if (!text || text.trim() ===''){
				console.log("TEXT", text);
				$scope.selectedCompany = null;
			}*/
		}

		function RefreshData() {
			frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = data.lstTravellerNew;
				//$scope.resetCurrentPage();
				$scope.TotalRecord = data.TotalRecord;
			});
		}
		$scope.addCustomer = function (ev) {
			var currentCustomer = angular.copy($scope.customer);
			$mdDialog.show({
				controller: SharerController,
				resolve: {
					countries: function () {
						return $scope.countries;
					},
					isUsePassport: function(){
						return $scope.isUsePassport();
					}
				},
				templateUrl: 'views/templates/addGuestDatabase.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
			}).then(function (SharerModel) {
				if (SharerModel) {
					var saveSharerInfor = loginFactory.securedPostJSON("api/Room/AddGuestDatabase", SharerModel);
					$rootScope.dataLoadingPromise = saveSharerInfor;
					saveSharerInfor.success(function (data) {
						dialogService.toast("ADD_GUEST_SUCCESSFULL");
						// Init();
						RefreshData();
					}).error(function (err) {
						console.log(err);
					});
				}
			});
			//
			function SharerController($scope, $mdDialog, loginFactory, countries, isUsePassport) {
				$scope.warningCountry;
				$scope.sharer = {};
				function Init() {
					$scope.DateTimePickerOption = {
						format: 'dd/MM/yyyy HH:mm'
					};
					$scope.DatePickerOption = {
						format: 'dd/MM/yyyy'
					};
					$scope.warningCountry = false;
					$scope.Countries = countries;
					$scope.queryCountriesSearch = queryCountriesSearch;
					$scope.selectedCountriesChange = selectedCountriesChange;
					$scope.searchCountriesTextChange = searchCountriesTextChange;

					var defaultCountry = _.filter($scope.Countries, function (item) {
						return item.CountryCode.toLowerCase() == "vn";
					});

					if ($scope.Countries !== null && defaultCountry !== null && defaultCountry[0] !== null && defaultCountry[0].CountryId !== null && $scope.Countries.length > 0)

						$scope.selectedCountries = _.filter($scope.Countries, function (item) {
							return item.CountryId == defaultCountry[0].CountryId;
						})[0];

					$scope.sharer.Gender = 0;
					$scope.isChild = false;
					// var customerList = loginFactory.securedGet("api/Room/AllCustomer");
					// customerList.success(function (data) {
					// 	$scope.customerList = data;
					// }).error(function (err) {
					// 	console.log(err);
					// });

					$scope.isUsePassport = isUsePassport;
				}
				Init();

				function queryCountriesSearch(query) {
					console.log('scope.Countries:', $scope.Countries);
					var results = query ? $scope.Countries.filter(createCountriesFilterFor(query)) : $scope.Countries,
						deferred;
					if (self.simulateQuery) {
						deferred = $q.defer();
						$timeout(function () {
							deferred.resolve(results);
						}, Math.random() * 1000, false);
						return deferred.promise;
					} else {
						return results;
					}
				}

				function createCountriesFilterFor(query) {
					var lowercaseQuery = change_alias(query);
					return function filterFn(item) {
						return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
					};
				}

				function selectedCountriesChange(item) {
					console.log("ITEM", item);
					if (item != undefined) {
						$scope.selectedCountries = item;

					} else {
						$scope.selectedCountries = null;
					}

				}

				function searchCountriesTextChange(text) {
					$scope.searchCountriesText = text;
				}

				$scope.sharerContainsSearchText = function (customer) {
					$scope.found = false;
					var fullNameQuery = (customer.Fullname !== null) ? customer.Fullname.indexOf($scope.sharer.Fullname) >= 0 : null;
					var identityNumberQuery = (customer.IdentityNumber !== null) ? customer.IdentityNumber.indexOf($scope.sharer.IdentityNumber) >= 0 : null;
					var mobileQuery = (customer.Mobile !== null) ? customer.Mobile.indexOf($scope.sharer.Mobile) >= 0 : null;
					var emailQuery = (customer.Email !== null) ? customer.Email.indexOf($scope.sharer.Email) >= 0 : null;
					var result = fullNameQuery || identityNumberQuery || mobileQuery || emailQuery;
					return result;
				};

				$scope.bindingSelectedSharer = function (cus) {
					var customerBinding = {};
					$scope.sharer.TravellerId = cus.TravellerId;
					$scope.sharer.Fullname = cus.Fullname;
					$scope.sharer.Gender = cus.Gender;
					$scope.sharer.Birthday = cus.Birthday;
					$scope.sharer.IdentityNumber = cus.IdentityNumber;
					$scope.sharer.Mobile = cus.Mobile;
					$scope.sharer.Email = cus.Email;
					$scope.sharer.Address = cus.Address;
					$scope.sharer.ValidUntil = cus.ValidUntil;
                    $scope.sharer.ImageLocation = cus.ImageLocation;
				};

				$scope.saveInfoPassport = function() {
                    $scope.sharer.Fullname = FullnameCustomer;
                    $scope.sharer.Gender = Gender === "M" ? 0 : 1;
                    $scope.sharer.IdentityNumber = IdentityNumber;
                    if (Birthday) {
                        $scope.sharer.Birthday = new Date(Birthday);
                        $scope.dateString = $scope.sharer.Birthday.format('dd/mm/yyyy');
                    }
                   
                    $scope.sharer.ImageLocation = ImageLocation;
                    $scope.sharer.ValidUntil = new Date(ValidUntil);
                    
                    if ($scope.Countries !== null && $scope.sharer !== null && $scope.Countries.length > 0)

                        $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                            return item.CountryCode == CountryCode;
                        })[0];
                    console.log("country passport:",$scope.selectedCountries);
                    console.log("customer passport:",$scope.sharer);
                } 

				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};
				$scope.addSharerInformation = function () {
					if ($scope.selectedCountries == null) {
						$scope.warningCountry = true;
						return;
					}
					else {
						$scope.sharer.CountryId = $scope.selectedCountries.CountryId;
					}

					$mdDialog.hide($scope.sharer);
				}

				$scope.selectedItemChange = function (item) {
					$scope.sharer = item;
				}
			}
		}
		$scope.editCustomer = function (model) {
			var customerTemp = angular.copy(model);
			$mdDialog.show({
				controller: EditCustomerController,
				resolve: {
					currentCustomer: function () {
						return customerTemp;
					},
					countries: function () {
						return $scope.countries;
					},
					isUsePassport: function(){
						return $scope.isUsePassport();
					}
				},
				templateUrl: 'views/templates/editGuestDatabase.tmpl.html',
				parent: angular.element(document.body),
				// targetEvent: ev,
			}).then(function (SharerViewModel) {
				if (SharerViewModel) {
					SharerViewModel.Countries = null;
					var save = loginFactory.securedPostJSON("api/Room/EditGuestDatabase", SharerViewModel);
					$rootScope.dataLoadingPromise = save;
					save.success(function (data2) {
						dialogService.toast("EDIT_GUEST_SUCCESSFULL");
						// Init();
						RefreshData();
					}).error(function (err) {
						console.log(err);
					});
				}
			}, function () { });
			//
			function EditCustomerController($scope, $mdDialog, currentCustomer, countries, isUsePassport) {
				$scope.warningCountry = false;
				function Init() {
					$scope.DatePickerOption = {
						format: 'dd/MM/yyyy'
					};
					$scope.customer = currentCustomer;
					$scope.Countries = countries;
					$scope.queryCountriesSearch = queryCountriesSearch;
					$scope.selectedCountriesChange = selectedCountriesChange;
					$scope.searchCountriesTextChange = searchCountriesTextChange;

					if ($scope.Countries !== null && $scope.customer !== null && $scope.Countries.length > 0)

						$scope.selectedCountries = _.filter($scope.Countries, function (item) {
							return item.CountryId == $scope.customer.CountryId;
						})[0];


					if ($scope.customer.Birthday) {
						$scope.customer.Birthday = new Date($scope.customer.Birthday);
						$scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
					}

					$scope.isUsePassport = isUsePassport;
				}

				Init();

				function queryCountriesSearch(query) {
					console.log('scope.Countries:', $scope.Countries);
					var results = query ? $scope.Countries.filter(createCountriesFilterFor(query)) : $scope.Countries,
						deferred;
					if (self.simulateQuery) {
						deferred = $q.defer();
						$timeout(function () {
							deferred.resolve(results);
						}, Math.random() * 1000, false);
						return deferred.promise;
					} else {
						return results;
					}
				}

				function createCountriesFilterFor(query) {
					var lowercaseQuery = change_alias(query);
					return function filterFn(item) {
						return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
					};
				}

				function selectedCountriesChange(item) {
					console.log("ITEM", item);
					if (item != undefined) {
						$scope.selectedCountries = item;

					} else {
						$scope.selectedCountries = null;
					}

				}

				function searchCountriesTextChange(text) {
					$scope.searchCountriesText = text;
					/*console.log("TEXT", text);
					if (!text || text.trim() ===''){
						console.log("TEXT", text);
						$scope.selectedCompany = null;
					}*/
				}

				$scope.saveCustomer = function () {

					if ($scope.selectedCountries == null) {
						$scope.warningCountry = true;
						return;
					}
					else {
						$scope.customer.CountryId = $scope.selectedCountries.CountryId;
					}

					$mdDialog.hide($scope.customer);
				}

				$scope.saveInfoPassport = function() {
                    $scope.customer.Fullname = FullnameCustomer;
                    $scope.customer.Gender = Gender === "M" ? 0 : 1;
                    $scope.customer.IdentityNumber = IdentityNumber;
                    if (Birthday) {
                        $scope.customer.Birthday = new Date(Birthday);
                        $scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
                    }
                   
                    $scope.customer.ImageLocation = ImageLocation;
                    $scope.customer.ValidUntil = new Date(ValidUntil);
                    
                    if ($scope.Countries !== null && $scope.customer !== null && $scope.Countries.length > 0)

                        $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                            return item.CountryCode == CountryCode;
                        })[0];
                    console.log("country passport:",$scope.selectedCountries);
                    console.log("customer passport:",$scope.customer);
                } 

				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};
			}
		}
		$scope.deleteCustomer = function (TravellerId, IsDelete) {
			if (TravellerId) {
				var messageConfirm;
				var messageSuccess;
				if (IsDelete) {
					messageConfirm = "PLEASE_MAKE_SURE_WANT_UN_DELETE_GUEST";
					messageSuccess = "UN_DELETE_SUCCESSFULL1";
				}
				else {
					messageConfirm = "PLEASE_MAKE_SURE_WANT_DELETE_GUEST";
					messageSuccess = "DELETE_SUCCESSFULL1";
				}
				dialogService.confirm(messageConfirm).then(function () {
					var DeleteCustomer = loginFactory.securedPostJSON("api/Room/DeleteGuestDatabase?TravellerId=" + TravellerId + "&IsDelete=" + !IsDelete, "");
					$rootScope.dataLoadingPromise = DeleteCustomer;
					DeleteCustomer.success(function (data2) {
						dialogService.toast(messageSuccess);
						// Init();
						RefreshData();
					}).error(function (err) {
						console.log(err);
					});
				});
			}
		}
		$scope.ExportExcel = function (tableId) {
			var newDate = new Date();
			var ExcelName = $filter("translate")("GUEST_DATABASE") + '_' + newDate.format("ddmmyyyy");
			var exportHref = ExcelFactory.tableToExcel(tableId, ExcelName);
		}
		$scope.processSearch = function () {
			console.log('$scope.search:', $scope.search);
			if ($scope.selectedCountries == null) {
				$scope.search.CountryId = 0;
			}
			else {
				$scope.search.CountryId = $scope.selectedCountries.CountryId;
			}
			$scope.search.SkipRecord = 0;
			frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data.lstTravellerNew;
				//$scope.resetCurrentPage();
				$scope.TotalRecord = data.TotalRecord;
			});
		}
		$scope.changeView = function (TravellerId) {
			$location.path('guestHistory/' + TravellerId);
			$rootScope.guestHistory_travellerId = TravellerId;
		}
		// $scope.pageSearchGuestDB = function (index) {
		// 	if (index == 1)
		// 		$scope.search.PageNumber = $scope.search.PageNumber + 1;
		// 	if (index == 0)
		// 		$scope.search.PageNumber = $scope.search.PageNumber - 1;
		// 	console.log('tuyendao', $scope.search);
		// 	frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
		// 		console.log("SEARCH RESULT", data);
		// 		$scope.searchResult = data.lstTravellerNew;				
		// 		$scope.numberOfPages = data.TotalPage;
		// 	});
		// }
		$scope.moreCustomer = function(){
			$scope.search.SkipRecord += 10;
			console.log('tuyendao', $scope.search);
			frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
				console.log("SEARCH RESULT", data);				
				// $scope.searchResult.push(data.lstTravellerNew);	
				Array.prototype.push.apply($scope.searchResult,data.lstTravellerNew);
				console.log("result search",$scope.searchResult);			
				$scope.TotalRecord = data.TotalRecord;
			});
		}
	}]);
// ezCloud.filter('startFrom', function () {
//     return function (input, start) {
//         start = +start;
//         if (angular.isArray(input) && input.length > 0) {
//             return input.slice(start);
//         }
//         return input;
//     }
// });