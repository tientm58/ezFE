ezCloud.factory("configFactory", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$localStorage', 'reportFactory', 'hotelFactory', 'ngNotify',
	function ($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $localStorage, reportFactory, hotelFactory, ngNotify) {
		var self = this;
		var currentHotel = {};
		var currentHotelConnectivities = false;
		var roomTypes = {};
		var rooms = [];
		var extraServiceTypes = {};
		var extraServiceCategories = {};
		var extraServiceItems = {};
		var CurrentHotelConnectivities = {};
		var configApiUrl = apiUrl + "api/Config/";

		self.setCurrentHotel = function (hotel2) {
			var hotel = angular.extend({}, hotel2);
			if (hotel)
				if (hotel.HotelLogoUrl) {
					hotel.FullHotelLogoUrl = apiUrl.substr(0, apiUrl.length - 1) + hotel.HotelLogoUrl;
				}
			currentHotel = hotel;
			$rootScope.HotelSettings = hotel;
			setTimeout(function () {
				$rootScope.$apply();
			}, 0);

		};

		self.getCurrentHotel = function () {
			if (_.size(currentHotel) != 0) {
				return currentHotel;
			} else {
				return self.getCurrentHotelFromHttp();
			}
		};

		self.getCurrentHotelConnectivities = function () {
			return $q.resolve(self.getCurrentHotelConnectivitiesFromHttp());
		};


		self.getCurrentHotelFromHttp = function () {
			var deferred = $q.defer();
			var getCurrentHotel = loginFactory.securedGet("api/Hotel/GetCurrentHotel");
			$rootScope.dataLoadingPromise = getCurrentHotel;
			getCurrentHotel.success(function (data) {
				currentHotel = data;
				if (data != null) {
					if ($localStorage.lastLogin == undefined) {
						$localStorage.lastLogin = {};
					}
					if (data.HotelLogoUrl) {
						data.FullHotelLogoUrl = apiUrl.substr(0, apiUrl.length - 1) + data.HotelLogoUrl;
					}
					currentHotel.isModuleRoomInDiscountTime = false;
					if (currentHotel.EzHotelDefaultDiscountsList != null && currentHotel.EzHotelDefaultDiscountsList.length > 0) {
						var ezHotelDefaultDiscountsForRoom = _.filter(currentHotel.EzHotelDefaultDiscountsList, function (item) {
							return item.EzDefaultDiscounts != null && item.EzDefaultDiscounts.EzModules != null && item.EzDefaultDiscounts.EzModules.ModuleCode == "ROOM" && item.EzDefaultDiscounts.EzModules.Status == true && item.EzDefaultDiscounts.Status == true;
						});
						if (ezHotelDefaultDiscountsForRoom != null) {
							var discountForRoomTemp = ezHotelDefaultDiscountsForRoom[0];
							if (discountForRoomTemp.StartDate != null && discountForRoomTemp.EndDate != null) {
								discountForRoomTemp.StartDate = new Date(discountForRoomTemp.StartDate);
								discountForRoomTemp.EndDate = new Date(discountForRoomTemp.EndDate);
								if (discountForRoomTemp.StartDate <= new Date() && new Date() <= discountForRoomTemp.EndDate) {
									currentHotel.isModuleRoomInDiscountTime = true;
									currentHotel.discountStartDate = discountForRoomTemp.StartDate;
									currentHotel.discountEndDate = discountForRoomTemp.EndDate;
								}
							}
						}
					}
					if (data != null && data != undefined) {
						$localStorage.lastLogin.hotelId = data.HotelId;
						if ($localStorage.menuReport == null && $localStorage.menuRepor == undefined) {
							reportFactory.CheckReport();
						} else {
							$rootScope.menuReport = $localStorage.menuReport;
						}
						if ($localStorage.TimeInOutPrivate == undefined || $localStorage.TimeInOutPrivate == null) {
							hotelFactory.getHotelTimeInOutPrivate();
						}
					} else {
						reportFactory.CheckReport();
					}
					//$rootScope.HotelSettings = data;

				}
				$rootScope.HotelSettings = currentHotel;

				deferred.resolve(data);

			}).error(function (err) {
				deferred.reject(err);
			});
			return deferred.promise;
		};

		self.ezHotelBackEndPaymentProcess = function (data) {
			if (data != null) {
				if (data.RemainingDays <= 0) {
					if (data.isModuleRoomInDiscountTime == false) {
						//$rootScope.isHotelExpried = true;
						if ($location.path().indexOf("hotelSelect") < 0 && $location.path().indexOf("hotelQuickSettings") < 0 && $location.path().indexOf("modulePaymentManagement") < 0) {
							dialogService.messageBox("WARNING", "INSUFFICIENT_FUNDS_HOTEL_ACCOUNT._CLICK_OK_TO_CONTINUE.").then(function () {
								if (window.location.hostname !== 'localhost') {
									var parts = location.hostname.split('.');
									var upperleveldomain = parts.join('.');
									if (parts.length > 1) {
										if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) {
											window.location.href = "//" + upperleveldomain + "/#/modulePaymentManagement";
										} else {
											window.location.href = "//" + window.location.hostname + "/#/modulePaymentManagement";
										}
									} else {
										if (window.location.protocol !== "http:") {}
									}
								} else {
									window.location.href = "http://localhost:1980/#/modulePaymentManagement";
								}
							});
						}
					} else {
						var Datenow = new Date();
						var tmp = new Date(data.discountEndDate.valueOf());
						if (data.discountStartDate != null && data.discountEndDate && (tmp.addHours(-24 * 7) <= Datenow)) {
							data.discountStartDate = new Date(data.discountStartDate);
							data.discountEndDate = new Date(data.discountEndDate);
							var discountTimeString = $filter("translate")("DISCOUNT_TIME_FROM");
							var toString = $filter("translate")("TO");
							var goToPaymentString = $filter("translate")("GO_TO_PAYMENT");

							ngNotify.set(discountTimeString + ' [' + $filter('date')(data.discountStartDate, "dd/MM/yyyy") + '] ' + toString + ' [' + $filter('date')(data.discountEndDate, "dd/MM/yyyy") + ']. <a href="/#/modulePaymentManagement" style="color: white; font-size: 0.8em;">' + goToPaymentString + '</a>', {
								html: true
							});
						}
					}
				}
				if (data.RemainingDays > 0 && data.RemainingDays <= 7) {
					var goToPaymentString = $filter("translate")("GO_TO_PAYMENT");
					var remainingDaysString = $filter("translate")("REMAINING_DAYS");

					ngNotify.set(remainingDaysString + ": " + data.RemainingDays + ". <a href='/#/modulePaymentManagement' style='color: white !important; font-size: 0.8em;'>" + goToPaymentString + '</a>', {
						button: true,
						html: true
					});
				}
			} 
		};

		self.ezHotelBackEndPaymentResolve = function (data) {

			if (data != null) {
				if (data.RemainingDays <= 0) {
					if (data.isModuleRoomInDiscountTime == false) {
						//$rootScope.isHotelExpried = true;
						if ($location.path().indexOf("hotelSelect") < 0 && $location.path().indexOf("hotelQuickSettings") < 0 && $location.path().indexOf("modulePaymentManagement") < 0) {
							dialogService.messageBox("WARNING", "INSUFFICIENT_FUNDS_HOTEL_ACCOUNT._CLICK_OK_TO_CONTINUE.").then(function () {
								if (window.location.hostname !== 'localhost') {
									var parts = location.hostname.split('.');
									var upperleveldomain = parts.join('.');
									if (parts.length > 1) {
										if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) {
											window.location.href = "http://" + upperleveldomain + "/#/modulePaymentManagement";
										} else {
											window.location.href = "http://" + window.location.hostname + "/#/modulePaymentManagement";
										}
									} else {
										if (window.location.protocol !== "http:") {}
									}
								} else {
									window.location.href = "http://localhost:1980/#/modulePaymentManagement";
								}
							});
						}
					}
				}
			}


		};


		self.getCurrentHotelConnectivitiesFromHttp = function () { 
			if (CurrentHotelConnectivities.hasOwnProperty("$$state")) {
				self.getCurrentHotel();
				return CurrentHotelConnectivities;
			} else {
				return self.doGetCurrentHotelConnectivitiesFromHttp();
			}
		};

		self.doGetCurrentHotelConnectivitiesFromHttp = function () {
			var deferred = $q.defer();
			var getCurrentHotelConnectivities = loginFactory.securedGet("api/Hotel/GetCurrentHotelConnectivities");
			$rootScope.dataLoadingPromise = getCurrentHotelConnectivities;

			getCurrentHotelConnectivities.success(function (data) {
				self.getCurrentHotel();
				setTimeout(function () {
					$rootScope.$apply();
				}, 0);
				deferred.resolve(data);

			}).error(function (err) {
				deferred.reject(err);
			});
			CurrentHotelConnectivities = deferred.promise;
			return deferred.promise;
		};




		self.saveHotel = function (hotel, callback) {
			var saveHotelChanges = loginFactory.securedPostJSON("api/Config/Hotel/SaveCurrentHotel", hotel);
			$rootScope.dataLoadingPromise = saveHotelChanges;
			saveHotelChanges.success(function (data) {
				if (callback) callback();
				dialogService.toast("SAVE_HOTEL_CHANGE_SUCCESSFUL");

			}).error(function (err) {
				var errors = [];
				errors.push(err.Message);
				for (var key in err.ModelState) {
					for (var i = 0; i < err.ModelState[key].length; i++) {
						errors.push(err.ModelState[key][i]);
					}
				}

				dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
			});
		};


		function roomTypeDataProcessing(data) {
			var roomTypeData = [];
			for (var dataIndex in data) {
				var roomTypeDataTemp = data[dataIndex];
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId] = {};
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].OrderNumber = roomTypeDataTemp.roomType.OrderNumber;
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].roomType = roomTypeDataTemp.roomType;
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].roomType.RoomTypeName = $filter('translate')(roomTypeDataTemp.roomType.RoomTypeName);
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].roomType.RoomTypeDescription = $filter('translate')(roomTypeDataTemp.roomType.RoomTypeDescription);
				var planListTemp = [];
				var planDetailListTemp = {};
				var planIndex = 0;
				for (var rtplIndex in roomTypeDataTemp.roomTypePlanList) {
					var roomTypePlanListTemp = roomTypeDataTemp.roomTypePlanList[rtplIndex];
					var planModel = {};
					planModel.RoomPriceId = roomTypePlanListTemp.plan.RoomPriceId;
					planModel.RoomPriceName = roomTypePlanListTemp.plan.RoomPriceName;
					planModel.Priority = roomTypePlanListTemp.plan.Priority;
					planModel.RoomTypeId = roomTypePlanListTemp.plan.RoomTypeId;
					planModel.IsActive = roomTypePlanListTemp.plan.IsActive;
					planModel.hasPlanChanged = false;
					planListTemp[planModel.Priority] = planModel;



					var planTemp = roomTypePlanListTemp.plan;

					var planDetailTemp = roomTypePlanListTemp.planDetail;
					var newPlanDetail = {};

					var startDateTemp = (planTemp.StartDate === null) ? null : new Date(planTemp.StartDate);
					var startTimeTemp = (startDateTemp === null) ? null : new Date(1970, 0, 1, startDateTemp.getHours(), startDateTemp.getMinutes(), startDateTemp.getSeconds());
					var endDateTemp = (planTemp.EndDate == null) ? null : new Date(planTemp.EndDate)
					var endTimeTemp = (endDateTemp == null) ? null : new Date(1970, 0, 1, endDateTemp.getHours(), endDateTemp.getMinutes(), endDateTemp.getSeconds());


					var adjustmentTemp = planDetailTemp;

					var adjustmentHourlyPrice = [];
					var adjustmentFullDayPrice = [];
					var adjustmentDayNightPrice = [];
					var adjustmentWeeklyPrice = [];
					var adjustmentMonthlyPrice = [];
					var adjustmentEarlyCheckinFullDay = [];
					var adjustmentEarlyCheckinDayNight = [];
					for (var adjIndex in adjustmentTemp) {
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'HOURLY_PRICE')
							adjustmentHourlyPrice.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'OVERDUE_FULLDAY')
							adjustmentFullDayPrice.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'OVERDUE_DAYNIGHT')
							adjustmentDayNightPrice.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'OVERDUE_WEEKLY')
							adjustmentWeeklyPrice.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'OVERDUE_MONTHLY')
							adjustmentMonthlyPrice.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'EARLY_CHECKIN_FULL_DAY')
							adjustmentEarlyCheckinFullDay.push(adjustmentTemp[adjIndex]);
						if (adjustmentTemp[adjIndex].AdjustmentCode === 'EARLY_CHECKIN_DAY_NIGHT')
							adjustmentEarlyCheckinDayNight.push(adjustmentTemp[adjIndex]);

					}
					newPlanDetail = {
						PlanSchedule: {
							name: "PLAN_SCHEDULE",
							property: "PlanSchedule",
							hasChanged: false,
							adjustment: {
								startDate: startDateTemp,
								startTime: startTimeTemp,
								endDate: endDateTemp,
								endTime: endTimeTemp,
								ApplyOnMonday: planTemp.ApplyOnMonday,
								ApplyOnTuesday: planTemp.ApplyOnTuesday,
								ApplyOnWednesday: planTemp.ApplyOnWednesday,
								ApplyOnThursday: planTemp.ApplyOnThursday,
								ApplyOnFriday: planTemp.ApplyOnFriday,
								ApplyOnSaturday: planTemp.ApplyOnSaturday,
								ApplyOnSunday: planTemp.ApplyOnSunday
							},
						},
						UseHourlyPrice: {
							name: "USE_HOURLY_PRICE",
							property: "UseHourlyPrice",
							isUsed: planTemp.UseHourlyPrice,
							hasChanged: false,
							adjustment: adjustmentHourlyPrice,
							adjustmentCode: "HOURLY_PRICE",

						},
						UseFullDayPrice: {
							name: "USE_FULL_DAY_PRICE",
							property: "UseFullDayPrice",
							isUsed: planTemp.UseFullDayPrice,
							hasChanged: false,
							price: planTemp.FullDayPrice,
							adjustment: adjustmentFullDayPrice,
							adjustmentCode: "OVERDUE_FULLDAY"
						},
						UseEarlyCheckinFullDay: {
							name: "USE_EARLY_CHECKIN_FULL_DAY",
							property: "UseEarlyCheckinFullDay",
							isUsed: planTemp.UseEarlyCheckinFullday,
							adjustment: adjustmentEarlyCheckinFullDay,
							adjustmentCode: "EARLY_CHECKIN_FULL_DAY"
						},
						UseDayNightPrice: {
							name: "USE_DAY_NIGHT_PRICE",
							property: "UseDayNightPrice",
							isUsed: planTemp.UseDayNightPrice,
							hasChanged: false,
							price: planTemp.DayNightPrice,
							adjustment: adjustmentDayNightPrice,
							adjustmentCode: "OVERDUE_DAYNIGHT"

						},
						UseEarlyCheckinDayNight: {
							name: "USE_EARLY_CHECKIN_DAY_NIGHT",
							property: "UseEarlyCheckinDayNight",
							isUsed: planTemp.UseEarlyCheckinDayNight,
							adjustment: adjustmentEarlyCheckinDayNight,
							adjustmentCode: "EARLY_CHECKIN_DAY_NIGHT"
						},

						UseMonthlyPrice: {
							name: "USE_MONTHLY_PRICE",
							property: "UseMonthlyPrice",
							isUsed: planTemp.UseMonthlyPrice,
							hasChanged: false,
							price: planTemp.MonthlyPrice,
							adjustment: adjustmentMonthlyPrice,
							adjustmentCode: "OVERDUE_MONTHLY"
						},
						UseWeeklyPrice: {
							name: "USE_WEEKLY_PRICE",
							property: "UseWeeklyPrice",
							isUsed: planTemp.UseWeeklyPrice,
							price: planTemp.WeeklyPrice,
							adjustment: adjustmentWeeklyPrice,
							adjustmentCode: "OVERDUE_WEEKLY"
						},
						UseExtraAdultPrice: {
							name: "USE_EXTRA_ADULT_PRICE",
							property: "UseExtraAdultPrice",
							isUsed: planTemp.UseExtraAdultPrice,
							hasChanged: false,
							defaultAdults: planTemp.DefaultAdults,
							extraAdultPrice: planTemp.ExtraAdultPrice,

						},
						UseExtraChildPrice: {
							name: "USE_EXTRA_CHILD_PRICE",
							property: "UseExtraChildPrice",
							isUsed: planTemp.UseExtraChildPrice,
							hasChanged: false,
							defaultChildren: planTemp.DefaultChildren,
							extraChildPrice: planTemp.ExtraChildPrice,
						},


					};
					planDetailListTemp[planTemp.RoomPriceId] = newPlanDetail;
				}
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].planList = planListTemp;
				roomTypeData[roomTypeDataTemp.roomType.RoomTypeId].planDetailList = planDetailListTemp;
			}
			return roomTypeData;
		}


		function roomListDataProcessing(data) {

			rooms = data.rooms;
			var roomTypesTemp = {}

			/*for (var roomTypeIndex in data.roomTypes) {
				var roomTypeTemp = data.roomTypes[roomTypeIndex];
				roomTypesTemp[roomTypeTemp.RoomTypeId] = roomTypeTemp;
			}
			data.roomTypes = roomTypesTemp;*/


			for (var index in data.rooms) {
				if (data.roomTypes && data.roomTypes.length > 0) {
					data.rooms[index].roomTypes = _.filter(data.roomTypes, function (item) {
						return item.RoomTypeId == data.rooms[index].RoomTypeId;
					});
				}

				if (data.roomRepairs && data.roomRepairs.length > 0) {

					data.rooms[index].roomRepairs = _.filter(data.roomRepairs, function (item) {
						return item.RoomId == data.rooms[index].RoomId;
					});
				}

				if (data.roomActiveHistories && data.roomActiveHistories.length > 0) {

					data.rooms[index].roomActiveHistories = _.filter(data.roomActiveHistories, function (item) {
						return item.RoomId == data.rooms[index].RoomId;
					});
				}


			}


		}


		function extraServicesDataProcessing(data) {
			for (var typeIndex in data.extraServiceTypes) {
				var esType = data.extraServiceTypes[typeIndex];
				extraServiceTypes[esType.ExtraServiceTypeId] = esType;
				var esCat = {}
				for (var catIndex in data.extraServiceCategories) {
					var esCatTemp = data.extraServiceCategories[catIndex];
					if (data.extraServiceCategories[catIndex].ExtraServiceTypeId == esType.ExtraServiceTypeId) {
						esCat[data.extraServiceCategories[catIndex].ExtraServiceCategoryId] = esCatTemp;
					}
					var esItems = {};
					for (var itemIndex in data.extraServiceItems) {
						var esItemTemp = data.extraServiceItems[itemIndex];
						if (data.extraServiceItems[itemIndex].ExtraServiceCategoryId == esCatTemp.ExtraServiceCategoryId) {

							esItems[data.extraServiceItems[itemIndex].ExtraServiceItemId] = esItemTemp;
						}
					}
					extraServiceItems[esCatTemp.ExtraServiceCategoryId] = esItems;
				}
				extraServiceCategories[esType.ExtraServiceTypeId] = esCat;
			}
			data.extraSericeTypes = extraServiceTypes;
			data.extraServiceCategories = extraServiceCategories;
			data.extraServiceItems = extraServiceItems;
		}

		function staffDataProcessing(data) {
			var staffData = {};
			for (var dataIndex in data) {
				var dataTemp = data[dataIndex];

				staffData[dataTemp.staff.StaffId] = dataTemp;
				var fullStaffUserName = dataTemp.staffUser.UserName;
				var index = fullStaffUserName.indexOf('@');
				var subString = fullStaffUserName.slice(0, index);
				staffData[dataTemp.staff.StaffId].staffUser.UserName = subString;


			}
			delete data;
			data = staffData;
		}

		function systemDataProcessing(data) {
			var systemData = {};
			for (var dataIndex in data.roomPricesData) {
				var dataTemp = data.roomPricesData[dataIndex];
				systemData[dataTemp.roomPrices.RoomPriceId] = dataTemp;
			}
			delete data.roomPricesData;
			data.roomPricesData = systemData;
		}



		return {

			setCurrentHotel: self.setCurrentHotel,

			getCurrentHotel: self.getCurrentHotel,

			getCurrentHotelConnectivities: self.getCurrentHotelConnectivities,


			ezHotelBackEndPaymentProcess: self.ezHotelBackEndPaymentProcess,

			ezHotelBackEndPaymentResolve: self.ezHotelBackEndPaymentResolve,

			saveHotel: self.saveHotel,

			roomTypes: function () {
				return roomTypes;
			},
			rooms: function () {
				return rooms;
			},
			staffData: function () {
				return staffData;
			},
			//loinq Refresh data,hotel owner
			getHotelOwner: function (email, callback) {
				var infoHotelOwner = loginFactory.securedGet("api/Config/getHotelOwnerInfo", "email=" + email);
				$rootScope.dataLoadingPromise = infoHotelOwner;

				infoHotelOwner.success(function (data) {
					if (callback)
						callback(data);
				});
			},
			RefreshData: function (data, callback) {
				var RefreshData = loginFactory.securedPost("api/Config/RefreshData", data);
				$rootScope.dataLoadingPromise = RefreshData;
				RefreshData.success(function (data) {
					if (callback)
						callback(data);
				});
			},
			//

			getAllRoomTypes: function (callback) {
				var allRoomTypes = loginFactory.securedGet("api/Config/RoomTypes/GetAllRoomType");
				$rootScope.dataLoadingPromise = allRoomTypes;

				allRoomTypes.success(function (data) {


					var newData = roomTypeDataProcessing(data);

					if (callback)
						callback(newData);
				});
			},

			getAllRooms: function (callback) {
				var allRooms = loginFactory.securedGet("api/Config/Rooms/GetAllRoom");
				$rootScope.dataLoadingPromise = allRooms;

				allRooms.success(function (data) {
					console.log("ROOM DATA", data);
					//roomListDataProcessing(data)
					if (callback)
						callback(data);
				});
			},

			getAllExtraServices: function (callback) {
				var allExtraServices = loginFactory.securedGet("api/Config/ExtraServices/GetAllExtraServices");
				$rootScope.dataLoadingPromise = allExtraServices;
				allExtraServices.success(function (data) {
					extraServicesDataProcessing(data);
					if (callback)
						callback(data);
				});
			},

			getAllStaffs: function (callback) {
				var staffData = {};
				var allStaffs = loginFactory.securedGet("api/Config/Staff/GetAllStaffs");
				$rootScope.dataLoadingPromise = allStaffs;
				allStaffs.success(function (data) {
					for (var dataIndex in data) {
						var dataTemp = data[dataIndex];
						staffData[dataTemp.staff.StaffId] = dataTemp;
						var fullStaffUserName = dataTemp.staffUser.UserName;
						var index = fullStaffUserName.indexOf('@');
						var subString = fullStaffUserName.slice(0, index);
						staffData[dataTemp.staff.StaffId].staffUser.UserName = subString;
					}
					delete data;
					data = staffData;

					if (callback)
						callback(data);
				});
			},

			saveHotelChanges: function (hotel, callback) {

				var saveHotelChanges = loginFactory.securedPostJSON("api/Config/Hotel/SaveCurrentHotel", hotel);
				$rootScope.dataLoadingPromise = saveHotelChanges;
				saveHotelChanges.success(function (data) {
					currentHotel = hotel;
					dialogService.toast("SAVE_HOTEL_CHANGE_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			changeRoomTypeStatus: function (roomTypeId) {
				/*var token = !$sessionStorage.session ? "" : $sessionStorage.session.access_token;
				var changeRoomTypeStatus = $http({
					url: configApiUrl + "RoomTypes/ChangeRoomTypeStatus?roomTypeId=" + roomTypeId,
					method: "POST",
					headers: {
						'Url': $location.url(),
						'Content-Type': 'application/json',
						'Authorization': ' Bearer ' + token
					},
				});*/

				var changeRoomTypeStatus = loginFactory.securedPost("api/Config/RoomTypes/ChangeRoomTypeStatus?roomTypeId=" + roomTypeId);
				$rootScope.dataLoadingPromise = changeRoomTypeStatus;
				changeRoomTypeStatus.success(function (data) {
					dialogService.toast("CHANGE_ROOM_TYPE_STATUS_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},
			saveRoomType: function (roomType, callback) {
				var saveRoomType = loginFactory.securedPostJSON("api/Config/RoomTypes/SaveRoomType", roomType);
				$rootScope.dataLoadingPromise = saveRoomType;
				saveRoomType.success(function (data) {
					if (callback) callback(roomType);

				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},
			createRoomType: function (newRoomType, callback) {
				var createRoomType = loginFactory.securedPostJSON("api/Config/RoomTypes/CreateRoomType", newRoomType);
				$rootScope.dataLoadingPromise = createRoomType;
				createRoomType.success(function (data) {
					if (callback) callback(data);
					dialogService.toast("ROOM_TYPE_CREATED");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			changeRoomStatus: function (roomId) {
				var changeRoomStatus = loginFactory.securedPost("api/Config/Rooms/ChangeRoomStatus?roomId=" + roomId);
				$rootScope.dataLoadingPromise = changeRoomStatus;
				changeRoomStatus.success(function (data) {
					dialogService.toast("CHANGE_ROOM_STATUS_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			changeRoomUseLock: function (roomId) {
				var changeRoomUseLock = loginFactory.securedPost("api/Config/Rooms/ChangeRoomUseLock?roomId=" + roomId);
				$rootScope.dataLoadingPromise = changeRoomUseLock;
				changeRoomUseLock.success(function (data) {
					dialogService.toast("CHANGE_ROOM_USELOCK_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			roomRepair: function (repairModel) {
				var roomRepair = loginFactory.securedPost("api/Config/Rooms/ChangeRoomHouseStatus", repairModel);
				$rootScope.dataLoadingPromise = roomRepair;
				roomRepair.success(function (data) {
					dialogService.toast("CHANGE_ROOM_HOUSE_STATUS_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROR", errors.toString().replace(",", "\n"));
				});
			},

			saveRoom: function (room) {
				var saveRoom = loginFactory.securedPostJSON("api/Config/Rooms/SaveRoom", room);
				$rootScope.dataLoadingPromise = saveRoom;
				saveRoom.success(function (data) {
					dialogService.toast("ROOM_EDIT_SUCCESSFUL");
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				});
			},
			createRoom: function (newRoom, callback) {
				var createRoom = loginFactory.securedPostJSON("api/Config/Rooms/CreateRoom", newRoom);
				$rootScope.dataLoadingPromise = createRoom;
				createRoom.success(function (data) {
					newRoom.RoomId = data.RoomId;

					if (callback) callback();
					dialogService.toast("ROOM_CREATED_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},
			deleteRoom: function (roomId, callback) {
				var deleteRoom = loginFactory.securedGet("api/Config/DeleteRoom", "roomId=" + roomId);
				$rootScope.dataLoadingPromise = deleteRoom;
				deleteRoom.success(function (data) {
					if (callback)
						callback(data);
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				});
			},
			changeCategoryStatus: function (categoryId) {
				/*var token = !$sessionStorage.session ? "" : $sessionStorage.session.access_token;
				var changeCategoryStatus = $http({
					url: configApiUrl + "ExtraServices/Categories/ChangeCategoryStatus?categoryId=" + categoryId,
					method: "POST",
					headers: {
						'Url': $location.url(),
						'Content-Type': 'application/json',
						'Authorization': ' Bearer ' + token
					},
				});*/
				var changeCategoryStatus = loginFactory.securedPost("api/Config/ExtraServices/Categories/ChangeCategoryStatus?categoryId=" + categoryId);

				$rootScope.dataLoadingPromise = changeCategoryStatus;
				changeCategoryStatus.success(function (data) {
					dialogService.toast("CHANGE_CATEGORY_STATUS_SUCCESSFUL");
					console.log("change status success");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			addCategory: function (newCategory, callback) {
				var addCategory = loginFactory.securedPostJSON("api/Config/ExtraServices/Categories/AddCategory", newCategory);
				$rootScope.dataLoadingPromise = addCategory;
				addCategory.success(function (data) {
					dialogService.toast("ADD_CATEGORY_SUCCESSFUL");
					newCategory.ExtraServiceCategoryId = data.ExtraServiceCategoryId;
					newCategory.HotelId = data.HotelId;
					if (callback) callback();
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			editCategory: function (category, callback) {
				var editCategory = loginFactory.securedPostJSON("api/Config/ExtraServices/Categories/EditCategory", category);
				$rootScope.dataLoadingPromise = editCategory;
				editCategory.success(function (data) {
					if (callback) callback(data);
					//dialogService.toast("EDIT_CATEGORY_SUCCESSFUL");

				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			removeCategory: function (category, callback) {
				var deleteCategory = loginFactory.securedPostJSON("api/Config/ExtraServices/Categories/RemoveCategory", category);
				$rootScope.dataLoadingPromise = deleteCategory;
				deleteCategory.success(function (data) {
					dialogService.toast("DELETE_CATEGORY_SUCCESSFULL");
					if (callback) callback();
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					//dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
					dialogService.messageBox("ERROR", "THIS_CATEGORY_CAN_NOT_BE_REMOVED_BECAUSE_IT_IS_BEING_USED_BY_ANOTHER_PROCESS")
				});

			},

			changeItemStatus: function (itemId) {
				/*var token = !$sessionStorage.session ? "" : $sessionStorage.session.access_token;
				var changeItemStatus = $http({
					url: configApiUrl + "ExtraServices/Items/ChangeItemStatus?itemId=" + itemId,
					method: "POST",
					headers: {
						'Url': $location.url(),
						'Content-Type': 'application/json',
						'Authorization': ' Bearer ' + token
					},
				});*/
				var changeItemStatus = loginFactory.securedPost("api/Config/ExtraServices/Items/ChangeItemStatus?itemId=" + itemId);

				$rootScope.dataLoadingPromise = changeItemStatus;
				changeItemStatus.success(function (data) {
					dialogService.toast("CHANGE_ITEM_STATUS_SUCCESSFUL");

				}).error(function (err) {

					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			addItem: function (newItem, callback) {

				var addItem = loginFactory.securedPostJSON("api/Config/ExtraServices/Items/AddItem", newItem);
				$rootScope.dataLoadingPromise = addItem;
				addItem.success(function (data) {
					dialogService.toast("ADD_ITEM_SUCCESSFULL");
					newItem.ExtraServiceItemId = data.ExtraServiceItemId;
					newItem.HotelId = data.HotelId;
					if (callback) callback();

				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			editItem: function (item) {
				var editItem = loginFactory.securedPostJSON("api/Config/ExtraServices/Items/EditItem", item);
				$rootScope.dataLoadingPromise = editItem;
				editItem.success(function (data) {
					dialogService.toast("EDIT_ITEM_SUCCESSFULL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			removeItem: function (item, callback) {
				var deleteItem = loginFactory.securedPostJSON("api/Config/ExtraServices/Items/RemoveItem", item);
				$rootScope.dataLoadingPromise = deleteItem;
				deleteItem.success(function (data) {
					dialogService.toast("DELETE_ITEM_SUCCESSFULL");
					if (callback) callback();
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					//dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
					dialogService.messageBox("ERROR", "THIS_ITEM_CAN_NOT_BE_REMOVED_BECAUSE_IT_IS_BEING_USED_BY_ANOTHER_PROCESS")
				});
			},

			editStaff: function (staff, callback) {
				var saveStaff = loginFactory.securedPostJSON("api/Config/Staff/SaveStaff", staff);
				$rootScope.dataLoadingPromise = saveStaff;
				saveStaff.success(function (data) {
					dialogService.toast("EDIT_STAFF_SUCCESSFULL");
					if (callback)
						callback();
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			createStaff: function (newStaff, callback) {
				var createStaff = loginFactory.securedPostJSON("api/Config/Staff/CreateStaff", newStaff);
				$rootScope.dataLoadingPromise = createStaff;
				createStaff.success(function (data) {
					dialogService.toast("CREATE_STAFF_SUCCESSFULL");
					if (callback) callback(data);
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors[1]);
				});
			},

			getStaffUserInfo: function (staffId, callback) {
				/*var token = !$sessionStorage.session ? "" : $sessionStorage.session.access_token;
				var staffUserName = $http({
					url: apiUrl + "api/Config/Staff/GetStaffUserInfo?staffId=" + staffId,
					method: "GET",
					headers: {
						'Url': $location.url(),
						'Content-Type': 'application/json',
						'Authorization': ' Bearer ' + token
					},

				});*/
				var staffUserName = loginFactory.securedPost("api/Config/Staff/GetStaffUserInfo?staffId=" + staffId);
				$rootScope.dataLoadingPromise = staffUserName;
				staffUserName.success(function (data) {
					if (callback)
						callback(data);
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			changeStaffStatus: function (staffId) {
				/*var token = !$sessionStorage.session ? "" : $sessionStorage.session.access_token;
				var changeStaffStatus = $http({
					url: configApiUrl + "Staff/ChangeStaffStatus?staffId=" + staffId,
					method: "POST",
					headers: {
						'Url': $location.url(),
						'Content-Type': 'application/json',
						'Authorization': ' Bearer ' + token
					},
				});*/

				var changeStaffStatus = loginFactory.securedPost("api/Config/Staff/ChangeStaffStatus?staffId=" + staffId);
				$rootScope.dataLoadingPromise = changeStaffStatus;
				changeStaffStatus.success(function (data) {
					dialogService.toast("CHANGE_STAFF_STATUS_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];
					errors.push(err.Message);
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			getAllSystemData: function (callback) {
				var allSystemData = loginFactory.securedGet("api/Config/System/GetAllSystemData");
				$rootScope.dataLoadingPromise = allSystemData;
				allSystemData.success(function (data) {
					if (callback)
						callback(data);
				});
			},

			changePlanStatus: function (plan, callback) {
				var changePlanStatus = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/ChangePlanStatus", plan);
				$rootScope.dataLoadingPromise = changePlanStatus;
				changePlanStatus.success(function (data) {
					// dialogService.toast("CHANGE_PLAN_STATUS_SUCCESSFUL");
					if (callback)
						callback(data);
				});

			},

			addNewPlan: function (newPlan, callback) {
				var addNewPlan = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/AddNewPlan", newPlan);
				$rootScope.dataLoadingPromise = addNewPlan;
				addNewPlan.success(function (data) {
					if (callback)
						callback(data);
					dialogService.toast("ADD_NEW_PLAN_SUCCESSFUL");
				}).error(function (err) {
					var errors = [];

					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}

					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
			},

			changePlanPolicyStatus: function (currentPlan, property, callback) {
				console.log(property);

				var PlanPolicy = {
					plan: currentPlan,
					property: property
				};
				var changePlanPolicyStatus = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/ChangePlanPolicyStatus", PlanPolicy);

				$rootScope.dataLoadingPromise = changePlanPolicyStatus;
				changePlanPolicyStatus.success(function (data) {
					if (callback)
						callback(data);
				}).error(function (err) {
					var errors = [];
					for (var key in err.ModelState) {
						for (var i = 0; i < err.ModelState[key].length; i++) {
							errors.push(err.ModelState[key][i]);
						}
					}
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});

			},

			addPriceAdjustment: function (newPriceAdjustment, callback) {
				var addPriceAdjustment = loginFactory.securedPostJSON("api/Config/System/AddPriceAdjustment", newPriceAdjustment);
				$rootScope.dataLoadingPromise = addPriceAdjustment;
				addPriceAdjustment.success(function (data) {
					newPriceAdjustment.RoomPriceAdjustmentId = data.RoomPriceAdjustmentId;
					newPriceAdjustment.NumberOfHour = data.NumberOfHour;
					if (callback)
						callback();
				});
			},

			savePlanSchedule: function (planSchedule, callback) {
				console.log(planSchedule);
				var savePlanSchedule = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/SavePlanSchedule", planSchedule);
				$rootScope.dataLoadingPromise = savePlanSchedule;
				savePlanSchedule.success(function (data) {

					if (callback)
						callback();
				});
			},

			savePlanPriority: function (planList, callback) {
				var savePlanPriority = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/SavePlanPriority", planList);
				$rootScope.dataLoadingPromise = savePlanPriority;
				savePlanPriority.success(function (data) {

					if (callback)
						callback();
				});
			},
			createFloor: function (model, callback) {
				var createFloor = loginFactory.securedPostJSON("api/Config/AddNewFloor", model);
				$rootScope.dataLoadingPromise = createFloor;
				createFloor.success(function (data) {
					if (callback)
						callback(data);
				});
			},
			editFloor: function (model, callback) {
				var editFloor = loginFactory.securedPostJSON("api/Config/EditFloor", model);
				$rootScope.dataLoadingPromise = editFloor;
				editFloor.success(function (data) {
					if (callback)
						callback(data);
				});
			},
			deleteFloor: function (floorId, callback) {
				var deleteFloor = loginFactory.securedGet("api/Config/DeleteFloor", "floorId=" + floorId);
				$rootScope.dataLoadingPromise = deleteFloor;
				deleteFloor.success(function (data) {
					if (callback)
						callback(data);
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				});
			},
			changeFloorStatus: function (floorId, callback) {
				var changeFloorStatus = loginFactory.securedPost("api/Config/ChangeFloorStatus?FloorId=" + floorId);
				$rootScope.dataLoadingPromise = changeFloorStatus;
				changeFloorStatus.success(function (data) {
					if (callback)
						callback();
				});
			},
			getAllFloor: function (callback) {
				var getAllFloor = loginFactory.securedGet("api/Config/getAllFloor", "");
				$rootScope.dataLoadingPromise = getAllFloor;
				getAllFloor.success(function (data) {
					if (callback)
						callback(data);
				});
			},
			changeFloorsOrderNumber: function (model, callback) {
				var changeFloorsOrderNumber = loginFactory.securedPostJSON("api/Config/ChangeFloorsOrderNumber", model);
				$rootScope.dataLoadingPromise = changeFloorsOrderNumber;
				changeFloorsOrderNumber.success(function (data) {
					if (callback)
						callback();
				}).error(function (err) {
					dialogService.toastWarn("CHANGE_FLOORS_ORDER_NUMBER_ERROR");
				});
			},
			ChangeRoomTypesOrderNumber: function (model, callback) {
				var ChangeRoomTypesOrderNumber = loginFactory.securedPostJSON("api/Config/ChangeRoomTypesOrderNumber", model);
				$rootScope.dataLoadingPromise = ChangeRoomTypesOrderNumber;
				ChangeRoomTypesOrderNumber.success(function (data) {
					if (callback) callback(data);
				}).error(function (err) {
					dialogService.toastWarn("CHANGE_ROOM_TYPE_ORDER_NUMBER_ERROR");
				});
			},
			ArrangeRoom: function (model, callback) {
				var ArrangeRoom = loginFactory.securedPostJSON("api/Config/ArrangeRoom", model);
				$rootScope.dataLoadingPromise = ArrangeRoom;
				ArrangeRoom.success(function (data) {
					if (callback)
						callback();
				}).error(function (err) {
					dialogService.toastWarn("ARRANGE_ROOM_ERROR");
				});
			}
		};
	}
]);