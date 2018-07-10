ezCloud.controller('guestListController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout','commonFactory',
function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout,commonFactory) {
		 $scope.$mdMedia = $mdMedia;
		 
		$scope.minDate = new Date();
		$scope.birthdayValid;

		$scope.currentPage = 0;
		$scope.pageSize = 10;
		$scope.totalRecord = 0;

		var EzModulesActive = $rootScope.EzModulesActive;
		$scope.isUsePassport = function(){
			var PassportModule = _.find(EzModulesActive,function(item){
				return item.ModuleCode === "PASSPORT";
			})
			return PassportModule != null ? true : false;
		}

		$scope.numberOfPages = function () {
			return Math.ceil($scope.totalRecord / $scope.pageSize);
		}

		$scope.resetCurrentPage = function () {
			$scope.currentPage = 0;
		}


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
			$scope.arrivalFromString = new Date().format('dd/mm/yyyy');
			$scope.arrivalToString = addDays(new Date(), 1).format('dd/mm/yyyy');
			$scope.departureFromString = new Date().format('dd/mm/yyyy');
			$scope.departureToString = addDays(new Date(), 1).format('dd/mm/yyyy');
			$scope.search = {
				ReservationRoomId: null,
				SearchType: "GUEST_LIST",
				GuestName: null,
				Phone: null,
				CountryId:0,
				IdentityNumber: null,
				ArrivalIncluded: true,
				ArrivalFrom: new Date(),
				ArrivalTo: addDays(new Date(), 1),
				DepartureIncluded: true,
				DepartureFrom: new Date(),
				DepartureTo: addDays(new Date(), 1),
				SkipRecord: 0
			}

			/*frontOfficeFactory.getCountries(function (data) {
				$scope.countries = data;
				console.log($scope.countries);
			});
*/
			$scope.queryCountriesSearch = queryCountriesSearch;
			$scope.selectedCountriesChange = selectedCountriesChange;
			$scope.searchCountriesTextChange = searchCountriesTextChange;
			$scope.searchResult = [];

			frontOfficeFactory.processSearchGuest($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}
		Init();

		function queryCountriesSearch(query) {
		console.log('scope.Countries:',$scope.countries);
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

		$scope.$watchCollection('search', function (newValues, oldValues) {
			console.log("THERE THERER");

			if (newValues.ArrivalFrom !== oldValues.ArrivalFrom && newValues.ArrivalFrom > oldValues.ArrivalTo) {
				newValues.ArrivalTo = addDays(newValues.ArrivalFrom, 1);
			}
			if (newValues.DepartureFrom !== oldValues.DepartureFrom && newValues.DepartureFrom > oldValues.DepartureTo) {

				newValues.DepartureTo = addDays(newValues.DepartureFrom, 1);
			}
		});


		var Search = function () {
			
			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom && $scope.search.ArrivalTo && $scope.search.ArrivalFrom > $scope.search.ArrivalTo) {
				dialogService.messageBox("INVALID_ARRIVAL_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.DepartureIncluded && $scope.search.DepartureFrom && $scope.search.DepartureTo && $scope.search.DepartureFrom > $scope.search.DepartureTo) {
				dialogService.messageBox("INVALID_DEPARTURE_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}
			
			
			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom === null && $scope.arrivalFromString !==''){
				dialogService.messageBox("INVALID_ARRIVAL_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}
			
			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalTo === null && $scope.arrivalToString !==''){
				dialogService.messageBox("INVALID_ARRIVAL_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}
			
			if ($scope.search.DepartureIncluded && $scope.search.DepartureFrom === null && $scope.departureFromString !==''){
				dialogService.messageBox("INVALID_DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}
			
			if ($scope.search.DepartureIncluded && $scope.search.DepartureTo === null && $scope.departureToString !==''){
				dialogService.messageBox("INVALID_DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.GuestName === ""){
				$scope.search.GuestName = null;
			}
			
			if ($scope.search.Phone === ""){
				$scope.search.Phone = null;
			}

			if ($scope.search.IdentityNumber === ""){
				$scope.search.IdentityNumber = null;
			}
			
			if ($scope.selectedCountries==null ) {
				$scope.search.CountryId=0;
			}
			else
			{
				$scope.search.CountryId=$scope.selectedCountries.CountryId;
			}

			$scope.search.SkipRecord = 0;
			$scope.currentPage = 0;
			frontOfficeFactory.processSearchGuest($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}


		$scope.processSearch = Search;
		$scope.showAllReservation = function (result, ev) {
			var customerTemp = angular.copy(result);
			$mdDialog.show({
					controller: ShowReservationController,
					resolve: {
						customer: function () {
							return customerTemp;
						}
					},
					templateUrl: 'views/templates/customerAllReservation.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					//fullscreen: useFullScreen
				})
				.then(function (answer) {}, function () {});

			function ShowReservationController($scope, $mdDialog, customer) {
				$scope.reservationRooms = [];
				$scope.customer = {};

				function Init() {
					console.log("customer", customer);
					$scope.reservationRooms = customer.ReservationRooms;
					$scope.customer = customer.Traveller;
					console.log("Reservation Rooms", $scope.reservationRooms);
				}
				Init();
				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};
			}
		};

		$scope.editCustomer = function (result, ev) {
 			var useFullScreen=$mdMedia('xs');
			var customerTemp = angular.copy(result.Traveller);
			console.log("RESULT", result);
			var customerTemp2 = angular.copy(result.Traveller);

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
				templateUrl: 'views/templates/editCustomer.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				fullscreen: useFullScreen
			}).then(function (SharerViewModel) {
				console.log('SharerViewModel', SharerViewModel);
				var save = loginFactory.securedPostJSON("api/FrontOffice/EditGuestInfo", SharerViewModel);
				$rootScope.dataLoadingPromise = save;
				save.success(function (data2) {
					var el = document.getElementById('search');
					$timeout(function () {
						angular.element(el).triggerHandler('click');
					}, 0);
					dialogService.toast("EDIT_GUEST_SUCCESSFULL");
				}).error(function (err) {
					console.log(err);
					dialogService.toastWarn("EDIT_GUEST_INFO_FAILED");
				});

			}, function () {});

			function EditCustomerController($scope, $mdDialog, currentCustomer,countries, isUsePassport, frontOfficeFactory) {
				$scope.Countries=countries;
				$scope.warningCountry;

				function Init() {
					frontOfficeFactory.getCountries(function (data) {
						$scope.Countries = data;
					})
					$scope.DatePickerOption = {
						format: 'dd/MM/yyyy'

					};
					$scope.warningCountry=false;
					$scope.customer = currentCustomer;
					
					$scope.queryCountriesSearch = queryCountriesSearch;
					$scope.selectedCountriesChange = selectedCountriesChange;
					$scope.searchCountriesTextChange = searchCountriesTextChange;
					if ($scope.Countries !== null && $scope.customer !== null && $scope.Countries.length > 0)

					$scope.selectedCountries = _.filter($scope.Countries, function (item) {
						return item.CountryId == $scope.customer.CountryId;
					})[0];

					
					console.log("CURRENT CUSTOMER", $scope.customer);
					if ($scope.customer.Birthday) {
						console.log($scope.customer.Birthday);
						$scope.customer.Birthday = new Date($scope.customer.Birthday);
						if ($scope.customer.Birthday.getFullYear() === 1753) {
							$scope.customer.Birthday = null;
						}

					}

					$scope.isUsePassport = isUsePassport;

				}

				Init();

				function queryCountriesSearch(query) {
					console.log('scope.Countries:',$scope.Countries);
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

				$scope.saveCustomer = function () {
					if ($scope.selectedCountries==null ) {
						$scope.warningCountry=true;
						return;
					}
					else
					{
						$scope.customer.CountryId=$scope.selectedCountries.CountryId;
					}
					var SharerViewModel = {
						customer: $scope.customer
					}

					$mdDialog.hide(SharerViewModel);
				}

				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};
			}
		}

		$scope.moreCustomer = function(status){
			if(status == 1){
				$scope.currentPage=$scope.currentPage+1;
				$scope.search.SkipRecord += 10;				
			}
			if(status == 2){
				$scope.currentPage=$scope.currentPage-1;
				$scope.search.SkipRecord += -10;				
			}
			console.log('tuyendao', $scope.search);
			frontOfficeFactory.processSearchGuest($scope.search, function (data) {
				console.log("SEARCH RESULT", data);				
				$scope.searchResult = data;				
			});
		}
}]);