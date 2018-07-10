ezCloud.factory("roomListFactory", ['$http', 'loginFactory', '$rootScope', '$filter', '$localStorage', 'configHotelDisplayFactory', function ($http, loginFactory, $rootScope, $filter, $localStorage, configHotelDisplayFactory) {
	var roomList = [];
	var reservationRooms = [];
	var roomTypes = {};

	var roomlistfactory = {
		clearCache: function () {
			roomList = [];
			reservationRooms = [];
			roomTypes = {};
		},
		getAllRooms: function (mcallback) {
			var allRoom = loginFactory.securedGet("api/Room/AllRoom");
			return allRoom;
		},
		getAllReservations: function () {
			return reservationRooms;
		},
		roomList: function () {
			return roomList;
		},
		getRoomTypes: function () {
			return roomTypes;
		},
		getRoomById: function (id) {
			if (roomList.length) {
				return roomList.find(function (item) {
					return item.RoomId == id;
				}, id);
			}
			return null;
		},
		getRoomListCache: function (callback) {
			if (roomList.length == 0) {
				roomlistfactory.getRoomList(new Date(), callback);
			} else {
				callback(roomList);
			}
		},
		getPriceRateList: function (callback) {
			var priceRateList = loginFactory.securedGet("api/Room/AllPriceRate");
			$rootScope.dataLoadingPromise = priceRateList;
			priceRateList.success(function (data) {
				if (callback) callback(data);
			}).error(function (err) {
				console.log(err);
			})
		},
		getRoomList: function (date, callback) {
			var d = date.format("yyyy-mm-dd");
			var roomStatus = loginFactory.securedGet("api/Room/RoomStatus", "date=" + d);
			$rootScope.dataLoadingPromise = roomStatus
			if (roomStatus) {
				$rootScope.dataLoadingPromise = roomStatus;
				roomStatus.success(function (data) {
					if ($localStorage.displayGroup != null && $localStorage.displayGroup != undefined) {
						roomStatusCalculate(data, date, $localStorage.displayGroup);
						if (callback)
							callback(roomList);
					} else {
						configHotelDisplayFactory.getHotelDisplay(function (data1) {
							roomStatusCalculate(data, date, data1.hotelDisplay);
							if (callback)
								callback(roomList);
						});
					}
				});
			}

		},
		getRoomListDashboard: function (search, callback) {
			//var d = search.SearchDate.format("yyyy-mm-dd");
			var roomStatus = loginFactory.securedPostJSON("api/Dashboard/GetListGuestByType", search);
			$rootScope.dataLoadingPromise = roomStatus
			if (roomStatus) {
				$rootScope.dataLoadingPromise = roomStatus;
				roomStatus.success(function (data) {
					if ($localStorage.displayGroup != null && $localStorage.displayGroup != undefined) {
						roomStatusCalculateDashboard(data, search.SearchDate, $localStorage.displayGroup);
						if (callback)
							callback(roomList);
					} else {
						configHotelDisplayFactory.getHotelDisplay(function (data1) {
							roomStatusCalculateDashboard(data, search.SearchDate, data1.hotelDisplay);
							if (callback)
								callback(roomList);
						});
					}
				});
			}

		},
		getRoomCheckIn: function (date, callback) {
			var d = date.format("yyyy-mm-dd");
			var roomStatusCheckIn = loginFactory.securedGet("api/Room/RoomStatusCheckIn", "date=" + d);
			$rootScope.dataLoadingPromise = roomStatusCheckIn
			if (roomStatusCheckIn) {
				$rootScope.dataLoadingPromise = roomStatusCheckIn;
				roomStatusCheckIn.success(function (data) {
					if (callback)
						callback(data);
				}).error(function (err) {
					console.log(err);
				});
			}
		},
		getReservationRoom: function (date, reservationRoomId, callback) {
			date = date.format("yyyy-mm-dd");
			var getReservationRoom = loginFactory.securedGet("api/Room/ReservationRoom", "date=" + date + "&reservationRoomId=" + reservationRoomId);
			$rootScope.dataLoadingPromise = getReservationRoom;
			getReservationRoom.success(function (data) {
				if ($localStorage.displayGroup != null && $localStorage.displayGroup != undefined) {
					roomStatusCalculate(data.RoomStatus, date, $localStorage.displayGroup);
					if (callback) {
						data.RoomStatus = roomList;
						callback(data);
					}

				} else {
					configHotelDisplayFactory.getHotelDisplay(function (data1) {
						roomStatusCalculate(data.RoomStatus, date, data1.hotelDisplay);
						if (callback) {
							data.RoomStatus = roomList;
							callback(data);
						}
					});
				}
			}).error(function (err) {
				console.log(err);
			});
		},

		getDataStatis: function (date, callback) {

			var d = date.format("yyyy-mm-dd");
			var dataStatis = loginFactory.securedGet("api/Room/DashboardForApp", "from=" + d);
			$rootScope.dataLoadingPromise = dataStatis
			dataStatis.success(function (data) {
				if (callback) callback(data);
			}).error(function (err) {
				console.log(err);
			})

		}
	};
	return roomlistfactory;

	function sortByDateAsc(a, b) {
		return a > b ? 1 : a < b ? -1 : 0;
	}

	function sortByTimeAsc(a, b) {
		var results;
		results = a.hours() > b.hours() ? 1 : a.hours() < b.hours() ? -1 : 0;
		if (results === 0)
			results = a.minutes() > b.minutes() ? 1 : a.minutes() < b.minutes() ? -1 : 0;
		if (results === 0)
			results = a.seconds() > b.seconds() ? 1 : a.seconds() < b.seconds() ? -1 : 0;
		return results;
	}

	function sortByDateTimeAsc(lhs, rhs) {
		var results;
		results = lhs.getYear() > rhs.getYear() ?
			1 : lhs.getYear() < rhs.getYear() ? -1 : 0;
		if (results === 0)
			results = lhs.getMonth() > rhs.getMonth() ?
				1 : lhs.getMonth() < rhs.getMonth() ? -1 : 0;
		if (results === 0)
			results = lhs.getDate() > rhs.getDate() ?
				1 : lhs.getDate() < rhs.getDate() ? -1 : 0;
		if (results === 0)
			results = lhs.getHours() > rhs.getHours() ?
				1 : lhs.getHours() < rhs.getHours() ? -1 : 0;
		if (results === 0)
			results = lhs.getMinutes() > rhs.getMinutes() ?
				1 : lhs.getMinutes() < rhs.getMinutes() ? -1 : 0;
		if (results === 0)
			results = lhs.getSeconds() > rhs.getSeconds() ?
				1 : lhs.getSeconds() < rhs.getSeconds() ? -1 : 0;
		return results;
	}

	function roomStatusCalculate(data, date, hotelDisplay) {
		var startTime = new Date().getTime();
		console.log("START ROOM CALCULATE", startTime, data);
		roomList = [];
		var tmpRoomList = {};
		var tmpDisplayList = {};
		roomTypes = {};
		data.roomBookingList = {};

		//for (var idx in data.rooms) {
		for (var idx = 0; idx < data.rooms.length; idx++) {
			if (data.rooms[idx].Room.OrderNumber == null) {
				data.rooms[idx].Room.OrderNumber = 0;
			}
			//
			if (data.BookingList)
				data.roomBookingList[data.rooms[idx].Room.RoomId] = data.BookingList.filter(function (item) { return item.RoomId == data.rooms[idx].Room.RoomId; });
			else
				data.roomBookingList[data.rooms[idx].Room.RoomId] = null;
			var roomTemp = data.rooms[idx];
			if (roomTemp.RoomRepairList != null && roomTemp.RoomRepairList.length > 0) {
				for (var repairIdx in roomTemp.RoomRepairList) {
					if (roomTemp.RoomRepairList[repairIdx].RepairStartDate) {
						roomTemp.RoomRepairList[repairIdx].RepairStartDate = new Date(roomTemp.RoomRepairList[repairIdx].RepairStartDate);
					} else {
						roomTemp.RoomRepairList[repairIdx].RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
					}
					if (roomTemp.RoomRepairList[repairIdx].RepairEndDate) {
						roomTemp.RoomRepairList[repairIdx].RepairEndDate = new Date(roomTemp.RoomRepairList[repairIdx].RepairEndDate);
					} else {
						roomTemp.RoomRepairList[repairIdx].RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
					}
				}
			}
			var room = data.rooms[idx].Room;
			room.BookingStatus = "AVAILABLE";
			room.roomType = data.rooms[idx].RoomType;

			var RoomRepairList = data.rooms[idx].RoomRepairList;
			if (data.rooms[idx].RoomRepairList != null && data.rooms[idx].RoomRepairList.length > 0) {
				var RoomRepairList = data.rooms[idx].RoomRepairList;
				for (var repairIdx in RoomRepairList) {
					if (RoomRepairList[repairIdx].RepairStartDate) {
						RoomRepairList[repairIdx].RepairStartDate = new Date(RoomRepairList[repairIdx].RepairStartDate);
					} else {
						RoomRepairList[repairIdx].RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
					}
					if (RoomRepairList[repairIdx].RepairEndDate) {
						RoomRepairList[repairIdx].RepairEndDate = new Date(RoomRepairList[repairIdx].RepairEndDate);
					} else {
						RoomRepairList[repairIdx].RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
					}
				}
				room.RoomRepairList = RoomRepairList;
			}

			/*if (roomTypes[room.RoomTypeId]) {
				room.roomType = roomTypes[room.RoomTypeId];
			}*/

			room.roomBookingList = { NextReservation: [], PreviousReservation: [] };
			for (var idx2 in data.roomBookingList) {
				if (idx2.toString() === room.RoomId.toString()) {
					data.roomBookingList[idx2].sort(function (a, b) {
						return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
					});


					room.BookingList = _.filter(data.roomBookingList[idx2], function (item) {
						return (new Date(item.ArrivalDate) > new Date());
					});
					if (room.BookingList.length > 0) {
						for (var idx3 in room.BookingList) {
							room.BookingList[idx3].ArrivalDate = new Date(room.BookingList[idx3].ArrivalDate);
							room.BookingList[idx3].DepartureDate = new Date(room.BookingList[idx3].DepartureDate);
						}
					}
					// });
					// room.roomBookingList = _.filter(data.roomBookingList[idx2], function (item) {
					// 	return (new Date(item.ArrivalDate) > new Date());
					// });
					// if (room.roomBookingList.length > 0) {
					// 	for (var idx3 in room.roomBookingList) {
					// 		room.roomBookingList[idx3].ArrivalDate = new Date(room.roomBookingList[idx3].ArrivalDate);
					// 		room.roomBookingList[idx3].DepartureDate = new Date(room.roomBookingList[idx3].DepartureDate);
					// 	}
					// }
					break;
				}
			}
			tmpRoomList[room.RoomId] = room;
		}

		var notAssignRoomReservations = [];
		var roomMoveList = {};
		for (var idx in data.reservationRooms) {
			var reservation = data.reservationRooms[idx];
			if (data.RelatedPayments != null)
				reservation.PaymentsList = data.RelatedPayments.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.PaymentsList = null;

			if (data.RoomMoves != null)
				reservation.RoomMoveList = data.RoomMoves.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomMoveList = null;

			if (data.RoomExtraServicesList != null)
				reservation.RoomExtraServicesList = data.RoomExtraServicesList.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomExtraServicesList = null;

			if (data.RoomExtraServiceItemsList != null)
				reservation.RoomExtraServiceItemsList = data.RoomExtraServiceItemsList.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomExtraServiceItemsList = null;

			if (reservation.RoomMoveList !== null && reservation.RoomMoveList.length > 0) {
				var moveListTemp = [];
				var firstElement = {
					Start: new Date(reservation.ArrivalDate),
					End: new Date(reservation.RoomMoveList[0].MoveDate)
				};

				moveListTemp.push(firstElement);



				for (var i = 0; i < reservation.RoomMoveList.length - 1; i++) {
					var element = {
						Start: new Date(reservation.RoomMoveList[i].MoveDate),
						End: new Date(reservation.RoomMoveList[i + 1].MoveDate)
					}
					moveListTemp.push(element);
				}

				if (reservation.RoomMoveList.length >= 1) {
					var lastElement = {
						Start: new Date(reservation.RoomMoveList[0].MoveDate),
						End: new Date(reservation.DepartureDate),
					}
					moveListTemp.push(lastElement);
				}


				roomMoveList[reservation.ReservationRoomId] = moveListTemp;
			}

			if (reservation.RoomId == null) {
				notAssignRoomReservations.push(reservation);
			}

			for (var idx3 in reservation.TravellersList) {
				reservation.TravellersList[idx3].IsChild = false;

				for (var idx4 in data.allResExtra) {

					if (data.allResExtra[idx4].ReservationRoomId == reservation.ReservationRoomId &&
						data.allResExtra[idx4].TravellerId == reservation.TravellersList[idx3].TravellerId) {
						reservation.TravellersList[idx3].IsChild = data.allResExtra[idx4].IsChild;
						break;
					}
				}

			}

			var rr = data.reservationRooms[idx];

			rr.DepartureDate = new Date(rr.DepartureDate);
			rr.ArrivalDate = new Date(rr.ArrivalDate);

			if (tmpRoomList[rr.RoomId]) {
				//has room
				if (!tmpRoomList[rr.RoomId].reservationRooms) {
					tmpRoomList[rr.RoomId].reservationRooms = [];
				}
				tmpRoomList[rr.RoomId].reservationRooms.push(rr);
				if (rr.BookingStatus == "CHECKIN" && rr.DepartureDate < new Date()) {
					rr.BookingStatus = "OVERDUE";
				}
				if (rr.BookingStatus === "BOOKED" && rr.ArrivalDate < new Date()) {
					rr.BookingStatus = "NOSHOW";
				}
				if (tmpRoomList[rr.RoomId].BookingStatus !== "CHECKIN" && tmpRoomList[rr.RoomId].BookingStatus !== "OVERDUE") {
					if (rr.BookingStatus == "CHECKIN" || rr.BookingStatus == "OVERDUE" || rr.BookingStatus == "NOSHOW" || rr.BookingStatus == "BOOKED") {
						tmpRoomList[rr.RoomId].BookingList = [];
						tmpRoomList[rr.RoomId].BookingStatus = rr.BookingStatus;
						tmpRoomList[rr.RoomId].reservationRoom = rr;
						for (var idx2 in data.roomBookingList) {
							//process to determine if a traveller is a child or not
							if (idx2 == rr.RoomId) {
								//booking list
								data.roomBookingList[idx2].sort(function (a, b) {
									return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
								});
								tmpRoomList[rr.RoomId].BookingList = _.filter(data.roomBookingList[idx2], function (item) {
									return (new Date(item.ArrivalDate) > rr.ArrivalDate);
								});
								if (tmpRoomList[rr.RoomId].BookingList.length > 0) {
									for (var idx3 in tmpRoomList[rr.RoomId].BookingList) {
										tmpRoomList[rr.RoomId].BookingList[idx3].ArrivalDate = new Date(tmpRoomList[rr.RoomId].BookingList[idx3].ArrivalDate);
										tmpRoomList[rr.RoomId].BookingList[idx3].DepartureDate = new Date(tmpRoomList[rr.RoomId].BookingList[idx3].DepartureDate);
									}
								}

								//
								if (data.roomBookingList[idx2].length > 0) {
									tmpRoomList[rr.RoomId].roomBookingList.NextReservation = _.filter(data.roomBookingList[idx2], function (item) {
										return (
											tmpRoomList[rr.RoomId].reservationRoom.DepartureDate <= item.ArrivalDate &&
											tmpRoomList[rr.RoomId].reservationRoom.ReservationRoomId != item.ReservationRoomId
										);
									});
									tmpRoomList[rr.RoomId].roomBookingList.PreviousReservation = _.filter(data.roomBookingList[idx2], function (item) {
										return (
											tmpRoomList[rr.RoomId].reservationRoom.DepartureDate > item.ArrivalDate &&
											tmpRoomList[rr.RoomId].reservationRoom.ReservationRoomId != item.ReservationRoomId
										);
									});
								}

								//
								break;
							}
						}
						//get Noshow previous
						if (tmpRoomList[rr.RoomId].reservationRooms && tmpRoomList[rr.RoomId].reservationRooms.length > 0) {
							angular.forEach(tmpRoomList[rr.RoomId].reservationRooms, function (arr) {
								if (arr.BookingStatus == "NOSHOW" && arr.ReservationRoomId != tmpRoomList[rr.RoomId].reservationRoom.ReservationRoomId) {
									if (tmpRoomList[rr.RoomId].reservationRoom.DepartureDate <= arr.ArrivalDate) {
										tmpRoomList[rr.RoomId].roomBookingList.NextReservation.push(arr);
									} else {
										tmpRoomList[rr.RoomId].roomBookingList.PreviousReservation.push(arr);
									}
								}
							})
						}
					}
				}
			}
		}


		for (var index in tmpRoomList) {
			var temp = [];
			if (tmpRoomList[index].reservationRooms && tmpRoomList[index].reservationRooms.length > 1) {
				temp = _.filter(tmpRoomList[index].reservationRooms, function (item) {
					return (item.BookingStatus === "CHECKIN" || item.BookingStatus === "OVERDUE");
				});
				if (temp.length > 0) {
					tmpRoomList[index].reservationRoom = temp[0];
				}
			};


			if (tmpRoomList[index].BookingStatus == "CHECKIN" || tmpRoomList[index].BookingStatus == "OVERDUE" || tmpRoomList[index].BookingStatus == "NOSHOW" || tmpRoomList[index].BookingStatus == "BOOKED") {
				var newTemp = [];
				var itemTemp = {};
				angular.forEach(hotelDisplay, function (arr) {
					if (arr.List.length > 0) {
						itemTemp = { DisplayGroup: arr.DisplayGroupCode, List: [] };
						angular.forEach(arr.List, function (arr1) {
							// var item=checkReservation(tmpRoomList[index].reservationRooms);
							var item = tmpRoomList[index].reservationRoom;
							var value = getPropertyValue(item, arr1.PropertyColumName);
							if (value != "HIDDEN")
								itemTemp.List.push({
									PropertyColumName: value,
									Tooltip: arr1.PropertyColumName == 'CountryName' ? item.Travellers.CountryName : null
								});
						});
						if (itemTemp.List.length > 0)
							newTemp.push(itemTemp);
					}
				});
				if (newTemp.length > 0) {
					tmpRoomList[index].DisplayList = newTemp;
				}
			}
		};
		reservationRooms = data.reservationRooms;
		for (var idx in tmpRoomList) {
			roomList.push(tmpRoomList[idx]);
		}
		var tmpStatusColors = [];
		for (var idx in data.statusColors) {
			tmpStatusColors[data.statusColors[idx].StatusCode] = data.statusColors[idx].ColorCode;
		}
		delete roomList.planList;
		roomList.planList = data.planList;
		delete roomList.statusColors;
		roomList.statusColors = tmpStatusColors;
		roomList.currencies = data.currencies;
		roomList.currenciesISO = data.currenciesISO;
		roomList.paymentMethods = data.paymentMethods;
		roomList.defaultCurrency = data.defaultCurrency;
		roomList.remarkEvents = data.remarkEvents;
		roomList.sourceList = data.sourceList;
		roomList.companyList = data.companyList;
		roomList.marketList = data.marketList;
		roomList.notAssignRoomReservations = notAssignRoomReservations;
		roomList.roomMoveList = roomMoveList;
		roomList.floorList = data.floorList;
		roomList.ExtraService = data.ExtraService;

		// roomList.AvailableRooms=data.AvailableRooms;
		delete roomList.roomTypes;
		roomList.roomTypes = data.roomTypes
		var endTime = new Date().getTime();
		console.log("END ROOM CALCULATE", endTime, new Date().getTime() - startTime, roomList);

	}

	function roomStatusCalculateDashboard(data, date, hotelDisplay) {
		var startTime = new Date().getTime();
		console.log("START ROOM CALCULATE", startTime, data);
		roomList = [];
		var tmpRoomList = [];
		var tmpDisplayList = {};
		var roomsTemp = [];
		data.roomBookingList = {};

		var rooms = [];
		var roomTypes = [];

		for (var idx = 0; idx < data.rooms.length; idx++) {
			rooms[idx] = data.rooms[idx].Room;
			roomTypes[idx] = data.rooms[idx].RoomType;
			if (data.BookingList)
				data.roomBookingList[data.rooms[idx].Room.RoomId] = data.BookingList.filter(function (item) { return item.RoomId == data.rooms[idx].Room.RoomId; });
			else
				data.roomBookingList[data.rooms[idx].Room.RoomId] = null;
		}
		roomsTemp = angular.copy(rooms);
		var notAssignRoomReservations = [];
		var roomMoveList = {};
		for (var idx in data.reservationRooms) {
			var reservation = data.reservationRooms[idx];
			reservation.ArrivalDate = new Date(reservation.ArrivalDate);
			reservation.DepartureDate = new Date(reservation.DepartureDate);

			if (data.RelatedPayments != null)
				reservation.PaymentsList = data.RelatedPayments.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.PaymentsList = null;

			if (data.RoomMoves != null)
				reservation.RoomMoveList = data.RoomMoves.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomMoveList = null;

			if (data.RoomExtraServicesList != null)
				reservation.RoomExtraServicesList = data.RoomExtraServicesList.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomExtraServicesList = null;

			if (data.RoomExtraServiceItemsList != null)
				reservation.RoomExtraServiceItemsList = data.RoomExtraServiceItemsList.filter(function (item) { return item.ReservationRoomId == reservation.ReservationRoomId });
			else
				reservation.RoomExtraServiceItemsList = null;

			if (reservation.RoomMoveList !== null && reservation.RoomMoveList.length > 0) {
				var moveListTemp = [];
				var firstElement = {
					Start: new Date(reservation.ArrivalDate),
					End: new Date(reservation.RoomMoveList[0].MoveDate)
				};

				moveListTemp.push(firstElement);



				for (var i = 0; i < reservation.RoomMoveList.length - 1; i++) {
					var element = {
						Start: new Date(reservation.RoomMoveList[i].MoveDate),
						End: new Date(reservation.RoomMoveList[i + 1].MoveDate)
					}
					moveListTemp.push(element);
				}

				if (reservation.RoomMoveList.length >= 1) {
					var lastElement = {
						Start: new Date(reservation.RoomMoveList[0].MoveDate),
						End: new Date(reservation.DepartureDate),
					}
					moveListTemp.push(lastElement);
				}


				roomMoveList[reservation.ReservationRoomId] = moveListTemp;
			}

			if (reservation.RoomId == null) {
				notAssignRoomReservations.push(reservation);
			}
			else {

				var roomTemp = roomsTemp.find(function (item) { return item.RoomId == reservation.RoomId; });
				var room = angular.copy(roomTemp);
				room.roomType = roomTypes.find(function (item) { return item.RoomTypeId == reservation.RoomTypeId; });
				room.roomBookingList = { NextReservation: [], PreviousReservation: [] };

				if (data.roomBookingList[room.RoomId]) {
					data.roomBookingList[room.RoomId].sort(function (a, b) {
						return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
					});


					room.BookingList = _.filter(data.roomBookingList[room.RoomId], function (item) {
						return (new Date(item.ArrivalDate) > new Date());
					});
					if (room.BookingList.length > 0) {
						for (var idx3 in room.BookingList) {
							room.BookingList[idx3].ArrivalDate = new Date(room.BookingList[idx3].ArrivalDate);
							room.BookingList[idx3].DepartureDate = new Date(room.BookingList[idx3].DepartureDate);
						}
					}
				}
				if (reservation.BookingStatus == "CHECKIN" && reservation.DepartureDate < new Date()) {
					reservation.BookingStatus = "OVERDUE";
				}
				if (reservation.BookingStatus === "BOOKED" && reservation.ArrivalDate < new Date()) {
					reservation.BookingStatus = "NOSHOW";
				}
				tmpRoomList[idx] = Object.assign(room, reservation);
			}

			for (var idx3 in reservation.TravellersList) {
				reservation.TravellersList[idx3].IsChild = false;

				for (var idx4 in data.allResExtra) {

					if (data.allResExtra[idx4].ReservationRoomId == reservation.ReservationRoomId &&
						data.allResExtra[idx4].TravellerId == reservation.TravellersList[idx3].TravellerId) {
						reservation.TravellersList[idx3].IsChild = data.allResExtra[idx4].IsChild;
						break;
					}
				}

			}

			var rr = data.reservationRooms[idx];

			rr.DepartureDate = new Date(rr.DepartureDate);
			rr.ArrivalDate = new Date(rr.ArrivalDate);

			if (tmpRoomList[idx]) {
				//has room
				if (!tmpRoomList[idx].reservationRooms) {
					tmpRoomList[idx].reservationRooms = [];
				}
				tmpRoomList[idx].reservationRooms.push(rr);
				if (rr.BookingStatus == "CHECKIN" && rr.DepartureDate < new Date()) {
					rr.BookingStatus = "OVERDUE";
				}
				if (rr.BookingStatus === "BOOKED" && rr.ArrivalDate < new Date()) {
					rr.BookingStatus = "NOSHOW";
				}
				if (tmpRoomList[idx].BookingStatus !== "CHECKIN" && tmpRoomList[idx].BookingStatus !== "OVERDUE") {
					if (rr.BookingStatus == "CHECKIN" || rr.BookingStatus == "OVERDUE" || rr.BookingStatus == "NOSHOW" || rr.BookingStatus == "BOOKED") {
						tmpRoomList[idx].BookingList = [];
						tmpRoomList[idx].BookingStatus = rr.BookingStatus;
						tmpRoomList[idx].reservationRoom = rr;
					}

					if (data.roomBookingList[rr.RoomId]) {
						data.roomBookingList[rr.RoomId].sort(function (a, b) {
							return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
						});


						tmpRoomList[idx].BookingList = _.filter(data.roomBookingList[rr.RoomId], function (item) {
							return (new Date(item.ArrivalDate) > rr.ArrivalDate);
						});
						if (tmpRoomList[idx].BookingList.length > 0) {
							for (var idx3 in tmpRoomList[idx].BookingList) {
								tmpRoomList[idx].BookingList[idx3].ArrivalDate = new Date(tmpRoomList[idx].BookingList[idx3].ArrivalDate);
								tmpRoomList[idx].BookingList[idx3].DepartureDate = new Date(tmpRoomList[idx].BookingList[idx3].DepartureDate);
							}
						}
					}
				}
			}
		}

		for (var index in notAssignRoomReservations) {
			if (notAssignRoomReservations[index].BookingStatus === "BOOKED" && notAssignRoomReservations[index].ArrivalDate < new Date()) {
				notAssignRoomReservations[index].BookingStatus = "NOSHOW";
			}
		}

		for (var index in tmpRoomList) {
			var temp = [];
			if (tmpRoomList[index].reservationRooms && tmpRoomList[index].reservationRooms.length >= 1) {
				temp = _.filter(tmpRoomList[index].reservationRooms, function (item) {
					return (item.BookingStatus === "CHECKIN" || item.BookingStatus === "OVERDUE");
				});
				if (temp.length > 0) {
					// tmpRoomList[index].reservationRoom = temp[0];
					tmpRoomList[index].reservationRoom = temp.find(function (item) { return item.ReservationRoomId == tmpRoomList[index].ReservationRoomId });
				}
			};		

		};
		reservationRooms = data.reservationRooms;
		var currentHotelConnectivites = $rootScope.currentHotelConnectivites;
		for (var idx in tmpRoomList) {
			var menuItem = [];
			if (tmpRoomList[idx].BookingStatus == "CHECKIN" || tmpRoomList[idx].BookingStatus == "OVERDUE") {
				menuItem = [
					{
						name: 'VIEW_DETAIL',
						icon: 'img/icons/ic_info_24px.svg',
						url: "reservation/" + tmpRoomList[idx].reservationRoom.ReservationRoomId
					}];
				if (tmpRoomList[idx].reservationRoom.Reservations.IsGroup == true) {
					menuItem.push({
						name: 'VIEW_GROUP_DETAIL',
						icon: 'img/icons/ic_info_24px.svg',
						url: "groupReservationDetail/" + tmpRoomList[idx].reservationRoom.Reservations.ReservationId
					});
				}
				menuItem.push({
					name: 'BOOKING_LIST',
					icon: 'img/icons/ic_format_list_numbered_24px.svg'
				},
					{
						name: 'AMEND_STAY',
						icon: 'img/calendar-clock.svg'
					},
					{
						name: 'ROOM_MOVE',
						icon: 'img/icons/ic_open_with_24px.svg'
					},
					{
						name: 'COPY',
						icon: 'img/icons/ic_content_copy_24px.svg'
					},
					{
						name: 'PRE_CHECKIN',
						icon: 'img/icons/ic_reply_24px.svg'
					});
				if (tmpRoomList[idx].HouseStatus && tmpRoomList[idx].HouseStatus == "DIRTY") {
					menuItem.push({
						name: 'CLEAN',
						icon: 'img/icons/ic_toys_24px.svg'
					});
				} else {
					menuItem.push({
						name: 'SET_ROOM_DIRTY',
						icon: 'img/icons/ic_report_problem_24px.svg'
					});
				};
				if (currentHotelConnectivites && currentHotelConnectivites.isUsed == true && tmpRoomList[idx].UseLock) {
					menuItem.push({
						name: 'CREATE_CARD',
						icon: 'img/icons/ic_credit_card_24px.svg'
					});
				};
				menuItem.push(
					{
						name: 'MINIBAR',
						icon: 'img/icons/ic_local_bar_24px.svg'
					},
					{
						name: 'LAUNDRY',
						icon: 'img/icons/ic_local_laundry_service_24px.svg'
					},

					{
						name: 'COMPENSATION',
						icon: 'img/icons/ic_exposure_plus_1_24px.svg'
					},
					{
						name: 'EXTRA_SERVICES',
						icon: 'img/arrow-expand-all.svg'
					}
				);
			};
			if (tmpRoomList[idx].BookingStatus == "NOSHOW" || tmpRoomList[idx].BookingStatus == "BOOKED") {
				menuItem = [
					{
						name: 'VIEW_DETAIL',
						icon: 'img/icons/ic_info_24px.svg',
						url: "reservation/" + tmpRoomList[idx].reservationRoom.ReservationRoomId
					}];
				if (tmpRoomList[idx].reservationRoom.Reservations.IsGroup == true) {
					menuItem.push({
						name: 'VIEW_GROUP_DETAIL',
						icon: 'img/icons/ic_info_24px.svg',
						url: "groupReservationDetail/" + tmpRoomList[idx].reservationRoom.Reservations.ReservationId
					});
				}
				menuItem.push({
					name: 'BOOKING_LIST',
					icon: 'img/icons/ic_format_list_numbered_24px.svg'
				},
					{
						name: 'AMEND_STAY',
						icon: 'img/calendar-clock.svg'
					},
					{
						name: 'ROOM_MOVE',
						icon: 'img/icons/ic_open_with_24px.svg'
					},
					{
						name: 'COPY',
						icon: 'img/icons/ic_content_copy_24px.svg'
					},
					{
						name: 'CANCEL_RESERVATION',
						icon: 'img/icons/ic_cancel_24px.svg'
					},
					{
						name: 'EXTRA_SERVICES',
						icon: 'img/arrow-expand-all.svg'
					}
				);
				if (tmpRoomList[idx].HouseStatus && tmpRoomList[idx].HouseStatus == "DIRTY") {
					menuItem.push({
						name: 'CLEAN',
						icon: 'img/icons/ic_toys_24px.svg'
					});
				} else {
					menuItem.push({
						name: 'SET_ROOM_DIRTY',
						icon: 'img/icons/ic_report_problem_24px.svg'
					});
				};
				menuItem.push({
					name: 'UNASSIGN_ROOM',
					icon: 'img/icons/ic_grid_off_24px.svg'
				});
				if (currentHotelConnectivites && currentHotelConnectivites.isUsed == true && tmpRoomList[idx].UseLock) {
					menuItem.push({
						name: 'CREATE_CARD',
						icon: 'img/icons/ic_credit_card_24px.svg'
					});
				};
			};
			if (tmpRoomList[idx].BookingStatus == "AVAILABLE") {
				menuItem = [
					{
						name: "WALKIN",
						icon: 'img/icons/ic_add_24px.svg',
						url: "walkin/" + tmpRoomList[idx].RoomId
					},
					{
						name: 'BOOKING_LIST',
						icon: 'img/icons/ic_format_list_numbered_24px.svg'
					},
				];
				if (tmpRoomList[idx].HouseStatus == "DIRTY") {
					menuItem.push({
						name: 'CLEAN',
						icon: 'img/icons/ic_toys_24px.svg'
					});
				} else if (tmpRoomList[idx].HouseStatus !== "REPAIR") {
					menuItem.push({
						name: 'SET_ROOM_DIRTY',
						icon: 'img/icons/ic_report_problem_24px.svg'
					});
				};
			};
			tmpRoomList[idx].Menus = menuItem;
			roomList.push(tmpRoomList[idx]);
		}

		var menunotAssignRoomReservations = notAssignRoomReservations;

		for (var idx in notAssignRoomReservations) {
			var menuItem = [];
			menuItem = [
				{
					name: 'VIEW_DETAIL',
					icon: 'img/icons/ic_info_24px.svg',
					url: "reservation/" + notAssignRoomReservations[idx].ReservationRoomId
				}
			];
			if (notAssignRoomReservations[idx].IsGroup) {
				menuItem.push({
					name: 'VIEW_GROUP_DETAIL',
					icon: 'img/icons/ic_info_24px.svg',
					url: "groupReservationDetail/" + notAssignRoomReservations[idx].Reservations.ReservationId
				});
			}
			menuItem.push({
				name: 'AMEND_STAY_UNASSIGN',
				icon: 'img/calendar-clock.svg'
			});
			menuItem.push({
				name: 'ASSIGN_ROOM',
				icon: 'img/icons/ic_local_hotel_24px.svg'
			});
			menuItem.push({
				name: 'CANCEL_ROOM_UNASSIGN',
				icon: 'img/icons/ic_cancel_24px.svg'
			});

			menunotAssignRoomReservations[idx].Menus = menuItem;
			menunotAssignRoomReservations[idx].reservationRoom = notAssignRoomReservations[idx];
			roomList.unshift(menunotAssignRoomReservations[idx]);
		}

		delete roomList.planList;
		roomList.planList = data.planList;
		delete roomList.statusColors;

		roomList.remarkEvents = data.remarkEvents;
		roomList.sourceList = data.sourceList;
		roomList.companyList = data.companyList;
		roomList.marketList = data.marketList;
		roomList.notAssignRoomReservations = notAssignRoomReservations;
		roomList.roomMoveList = roomMoveList;
		roomList.floorList = data.floorList;
		roomList.ExtraService = data.ExtraService;
		roomList.hotelFormRoomInvoice = data.hotelFormRoomInvoice;
		roomList.HotelForms = data.HotelForms;


		delete roomList.roomTypes;
		roomList.roomTypes = data.roomTypes
		var endTime = new Date().getTime();
		console.log("END ROOM CALCULATE", endTime, new Date().getTime() - startTime, roomList);

	}

	function getPropertyValue(item, keyword) {
		var valueReturn;
		if (keyword == 'ArrivalDate') {
			valueReturn = item['ArrivalDate'].format("dd/mm/yyyy");
		} else if (keyword == 'ArrivalDatetime') {
			valueReturn = item['ArrivalDate'].format("dd/mm/yyyy") + ", " + item['ArrivalDate'].format("HH:MM");
		} else if (keyword == 'DepartureDate') {
			valueReturn = item['DepartureDate'].format("dd/mm/yyyy");
		} else if (keyword == 'DepartureDatetime') {
			valueReturn = item['DepartureDate'].format("dd/mm/yyyy") + ", " + item['DepartureDate'].format("HH:MM");
		} else if (keyword == 'Birthday') {
			var travellerId = item.Travellers.TravellerId;
			angular.forEach(item.TravellersList, function (arr) {
				if (arr.TravellerId == travellerId) {
					if (arr.Birthday != null) {
						valueReturn = new Date(arr.Birthday).format("dd/mm/yyyy");
					} else {
						valueReturn = ' ';
					}
				}
			});
		} else if (keyword == 'Fullname') {
			valueReturn = item.Travellers.Fullname;
		} else if (keyword == 'SourceName') {
			if (item.Source != null)
				valueReturn = item.Source.SourceName;
			else
				valueReturn = ' ';
		} else if (keyword == 'MarketCode') {
			if (item.Market != null)
				valueReturn = item.Market.MarketName;
			else
				valueReturn = ' ';
		} else if (keyword == 'CompanyName') {
			if (item.Company != null)
				valueReturn = item.Company.CompanyName;
			else
				valueReturn = ' ';
		} else if (keyword == 'FullDayPrice') {
			valueReturn = $filter('currency')(item.Price);;
		} else if (keyword == 'Gender') {
			var travellerId = item.Travellers.TravellerId;
			angular.forEach(item.TravellersList, function (arr) {
				if (arr.TravellerId == travellerId) {
					if (arr.Gender == 0) {
						valueReturn = $filter("translate")("MALE");
					} else if (arr.Gender == 1) {
						valueReturn = $filter("translate")("FEMALE");
					} else {
						valueReturn = $filter("translate")("OTHER");
					}
				}
			});
		} else if (keyword == 'CountryName') {
			valueReturn = item.Travellers.CountryCode;
		} else if (keyword == 'TimeCounter') {
			if (item.BookingStatus == "NOSHOW" || item.BookingStatus == "BOOKED" || item.BookingStatus == "CANCELLED") {
				valueReturn = "HIDDEN";
			} else {
				valueReturn = 'TimeCounter';
			}
		} else if (keyword == 'PassCode') {
			valueReturn = item['PassCodeLock'] == null ? "EMPTY" : item['PassCodeLock'];
		} else {
			valueReturn = 'ERROR';
		};
		if (valueReturn == undefined || valueReturn == null)
			valueReturn = ' ';
		return valueReturn;

	}
	// function checkReservation(listReservation){
	// 	var item=null;
	// 	if(listReservation && listReservation.length>0){
	// 		angular.forEach(listReservation,function(arr){
	// 			if(arr.BookingStatus=='CHECKIN' || arr.BookingStatus=='OVERDUE'){
	// 				item=arr;
	// 			}
	// 		});
	// 		if(item!=null){
	// 			return item;
	// 		}else{
	// 			return listReservation[listReservation.length-1];
	// 		}
	// 	}
	// }
}]);