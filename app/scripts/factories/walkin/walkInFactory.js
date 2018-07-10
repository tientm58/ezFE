ezCloud.factory("walkInFactory", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log','$mdDialog',
function ($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $mdDialog) {
	var reservationTimeline;
	var reservationGroup;
	var HotelIndexData = {};
	var Main = {
		getReservationTimeline: function () {
			return reservationTimeline;
		},
		setReservationTimeline: function (reservation) {
			reservationTimeline = reservation;
		},
		getReservationGroup: function () {
			return reservationGroup;
		},
		setReservationGroup: function (reservation) {
			reservationGroup = reservation;
		},
		addNewReservationRoom:function(callback){
			var getNewReservationRoom = loginFactory.securedGet("api/ReservationRoom/new");
			$rootScope.dataLoadingPromise = getNewReservationRoom;
			getNewReservationRoom.success(function (data) {
				console.info("NEW RR DATA", data)
			}).error(function (err) {
				console.log(err);
			});
		},
		processReservation: function(date,reservationRoomId, callback){
			date = date.format("yyyy-mm-dd");
			
			if (reservationRoomId == undefined ){ 
				var tmpDa = Main.getHotelIndexData();
				console.log(reservationRoomId, "leo nguyen", tmpDa);
				if (tmpDa.hasOwnProperty('companyList')){
					if (callback) callback({"HotelIndexData":tmpDa});
					return 0;
				}
			}

			var processReservation = loginFactory.securedGet("api/Reservation/ProcessReservation", "date=" + date + "&reservationRoomId=" + reservationRoomId);
			processReservation.success(function(data){
				Main.setHotelIndexData(data);
				if (callback) callback(data)
				console.info("NEW DATA", data);
			}).error(function(err){
				console.info(err);
			})
		}, 
		setHotelIndexData: function (val) {
			console.log('vao HotelIndexData:');
			HotelIndexData = val.HotelIndexData;
			
		},
		getHotelIndexData: function () {
			console.log('vao HotelIndexData:');
			return HotelIndexData;
		},
		getLogReservation: function( room ){  
			$mdDialog.show({
                    controller: LogsReservationController
                    , resolve: {
                        rooms: function () {
                            return room;
                        }
                    , }
                    , templateUrl: 'views/templates/logsReservationDialog.tmpl.html'
                    , parent: angular.element(document.body)
                    , targetEvent: null
                    , clickOutsideToClose: false
                    , /*fullscreen: useFullScreen*/
                })
                .then(function (answer) {}, function () {});
				
			function LogsReservationController($scope, $mdDialog, rooms){
				$scope.processSearchAuditLog = function(){ 

					var startD = new Date($scope.search.From);
					startD.setHours(0);
					startD.setMilliseconds(0);
					startD.setMinutes(0);

					var departureD = new Date($scope.search.To);
					departureD.setHours(0);
					departureD.setMilliseconds(0);
					departureD.setMinutes(0);
					departureD.setSeconds(0);

					var request = angular.copy($scope.search);
					request.From = startD.toISOString();
					request.To = departureD.toISOString();


					var searchPromise = loginFactory.securedPostJSON("api/AuditTrail/LogsSearchResult", request);
					$rootScope.dataLoadingPromise = searchPromise;
					searchPromise.success(function(data){ 
						
						$scope.logResults = processData(data.hits);
						
					}).error(function(err){
						console.log("ERR",err);
					})
				}

				function processData(data) {
					var result = {};
					if (data.hits.length > 0) {
						for (var i in data.hits) {
							var val = data.hits[i];

							var tmpDate = new Date(val._source.date);//.toISOString().slice(0, 10);
							var da = tmpDate.getFullYear() + "-" + (tmpDate.getMonth() + 1) + "-" + tmpDate.getDate();
							if (typeof (result[da]) == "undefined") {
								result[da] = [];
							}
							result[da].push(val._source);
						}
						return result;
					} else {
						return null;
					}
				}

				function init(){
					var allDataPromise = loginFactory.securedGet("api/AuditTrail/GetAllSearchData");
					// $rootScope.dataLoadingPromise = allDataPromise;
					allDataPromise.success(function(data){
						$scope.allUser = data.allUser; 
					}).error(function(err){
						console.log(err);
					});
					
					$scope.allOperation = [
									{name:'NOTIFICATION_WHEN_POST_PAYMENT', icon: true},
									{name:'NOTIFICATION_CHECKEDIN', icon: true},
									{name:'NOTIFICATION_CHANGE_PRICE', icon: true},
									{name:'NOTIFICATION_WHEN_DELETE_PAYMENT', icon: true},
									{name:'NOTIFICATION_WHEN_POST_EXTRASERVICE', icon: true},
									{name:'NOTIFICATION_WHEN_DELETE_EXTRASERVICE', icon: true},
									{name:'NOTIFICATION_WHEN_DISCOUNT_ROOM_PRICE', icon: true},
									{name:'NOTIFICATION_WHEN_CHANGE_ROOM', icon: true}, 
									{name:'NOTIFICATION_WHEN_PRE_CHECKOUT', icon: true}, 
									{name:'NOTIFICATION_WHEN_PRE_CHECKIN', icon: true}, 
									{name:'NOTIFICATION_CHECKOUT', icon: true}, 
									{name:'NOTIFICATION_PAST_CHECKOUT', icon: true}, 
									{name:'NOTIFICATION_BOOKED', icon: true}, 
									{name:'NOTIFICATION_CANCELED', icon: true}, 
									// {name:'POS_NOTIFICATION_DELETE_INVOICE', icon: true}, 
									// {name:'POS_NOTIFICATION_ADDNEW_INVOICE', icon: true},
									{ name: 'NOTIFICATION_CHANGE_DATE', icon: false },
									{ name:'NOTIFICATION_WHEN_POST_EXTRASERVICE_TRANFERSROOM', icon: false}
							];
					for (var idx in $scope.allOperation) {
						$scope.allOperation[idx].name2 = $filter("translate")($scope.allOperation.name);
					}
					$scope.findIcon = function( name ){
						var icon = $scope.allOperation.find(function(a){ 
							if( a.name === name && a.icon ){
								return a.name;
							} 
						}, name); 
						return (icon==null)?'DEFAULT':icon.name;
					}
					$scope.DatePickerOption = {
						format: 'dd/MM/yyyy'
					};
					var now = new Date();
					$scope.str = new Date().format('dd/mm/yyyy');
					$scope.str2 = new Date(now.setDate(now.getDate() + 1)).format('dd/mm/yyyy'); 
					$scope.search = {
						From: new Date(),
						To: new Date(now.setDate(now.getDate() + 1)),
						UserId: null,
						Operation: "ALL",
						ReservationNumber: rooms.Reservations.ReservationNumber,
						ReservationRoomNumber: rooms.ReservationRoomId 
						
					}; 
					$scope.processSearchAuditLog();
				}

				init();
				$scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };
			}
		},
		calculateTimeConflict: function(_conflict,_current){
			var conflict = _conflict;
			var current = _current;

			var fromConflictTime = new Date(new Date(conflict.arrivalDate).format('mm/dd/yyyy HH:MM')).getTime();
			var toConflictTime = new Date(new Date(conflict.departureDate).format('mm/dd/yyyy HH:MM')).getTime();
			var fromCurrentTime = new Date(new Date(current.arrivalDate).format('mm/dd/yyyy HH:MM')).getTime();
			var toCurrentTime = new Date(new Date(current.departureDate).format('mm/dd/yyyy HH:MM')).getTime();

			var minArrival = fromConflictTime <= fromCurrentTime ? fromConflictTime : fromCurrentTime;
			var maxDeparture = toConflictTime >= toCurrentTime ? toConflictTime : toCurrentTime;

			var total = maxDeparture - minArrival + 1;
			var conflictPersen = (((toConflictTime - fromConflictTime + 1) / total) * 100).toFixed(2);
			var currentPersen = (((toCurrentTime - fromCurrentTime + 1) / total) * 100).toFixed(2);

			var leftConflict = fromConflictTime <= minArrival ? 0 : ((((fromConflictTime - minArrival + 1) / total) * 100).toFixed(2));
			var leftCurrent = fromCurrentTime <= minArrival ? 0 : ((((fromCurrentTime - minArrival + 1) / total) * 100).toFixed(2));
			
			var statusChange = 0; //0: Not change, 1: change arrival of current, 2: change departure of current
			var fromDateCurrentTemp = null;
			var toDateCurrentTemp = null;
			var editPersen = null;
			var editLeft = null;
			var position = null;
			var margin = null;
			var marginTemp = null;

			if((toCurrentTime > fromConflictTime && fromCurrentTime < fromConflictTime) || (fromCurrentTime < toConflictTime && toCurrentTime > toConflictTime)) {
				if((toCurrentTime > fromConflictTime && fromCurrentTime < fromConflictTime)){
					var temp = new Date(conflict.arrivalDate);
					toDateCurrentTemp = new Date(temp.setHours(temp.getHours() - 1)).format('mm/dd/yyyy HH:MM'); 
					fromDateCurrentTemp = new Date(current.arrivalDate).format('mm/dd/yyyy HH:MM');
					statusChange = 2;
					editLeft = leftCurrent;
					position = 'to';
					margin = (((toCurrentTime - minArrival + 1) / total) * 100).toFixed(2);
					marginTemp = (((new Date(toDateCurrentTemp).getTime() - minArrival + 1) / total) * 100).toFixed(2);
				}
				else if((fromCurrentTime < toConflictTime && toCurrentTime > toConflictTime)){
					var temp = new Date(conflict.departureDate);
					fromDateCurrentTemp = new Date(temp.setHours(temp.getHours() + 1)).format('mm/dd/yyyy HH:MM');
					toDateCurrentTemp = new Date(current.departureDate).format('mm/dd/yyyy HH:MM');
					editLeft = new Date(fromDateCurrentTemp).getTime() <= minArrival ? 0 : ((((new Date(fromDateCurrentTemp).getTime() - minArrival + 1) / total) * 100).toFixed(2));
					statusChange = 1;
					position = 'from';
					margin = leftCurrent;
					marginTemp = (((new Date(fromDateCurrentTemp).getTime() - minArrival + 1) / total) * 100).toFixed(2);
				}
				editPersen = (((new Date(toDateCurrentTemp).getTime() - new Date(fromDateCurrentTemp).getTime() + 1) / total) * 100).toFixed(2);
			}

			var data = {
				Conflict: {
					Before : {
						from: new Date(conflict.arrivalDate).format('dd/mm/yyyy HH:MM'),
						to: new Date(conflict.departureDate).format('dd/mm/yyyy HH:MM'),
						width: conflictPersen,
						left: leftConflict
					}
				},
				Current: {
					Before : {
						from: new Date().format('dd/mm/yyyy HH:MM'),
						to: new Date(current.departureDate).format('dd/mm/yyyy HH:MM'),
						width: currentPersen,
						left: leftCurrent,
						margin: margin
					},
					After : {
						from: fromDateCurrentTemp,
						to: toDateCurrentTemp,
						width: editPersen,
						left: editLeft,
						margin: marginTemp
					}
				},
				StatusChange: statusChange,
				Position: position
			}
			
			return data;
		},
		buildAmendStayTimelineModel: function(rr, roomList) {
			var roomTemp = {
				Adults: rr.Adults,
				ArrivalDate: new Date(rr.ArrivalDate),
				BookingStatus: rr.BookingStatus,
				Child: rr.Child,
				DepartureDate: new Date(rr.DepartureDate),
				HotelId: rr.HotelId,
				PaymentsList: rr.PaymentsList,
				Price: rr.Price,
				ReservationId: rr.ReservationId,
				ReservationNumber: rr.Reservations.ReservationNumber,
				ReservationRoomId: rr.ReservationRoomId,
				ReservationTravellersList: [],
				RoomExtraServiceItemsList: rr.RoomExtraServiceItemsList,
				RoomExtraServicesList: rr.RoomExtraServicesList,
				RoomId: rr.RoomId,
				RoomName: rr.Rooms.RoomName,
				RoomPriceId: rr.RoomPriceId,
				RoomType: rr.RoomType,
				RoomTypeId: rr.RoomTypeId,
				TravellerId: rr.Travellers.TravellerId,
				Travellers: rr.Travellers
			}
			var amendStayModelTemp = {
				room: roomTemp,
				roomList: roomList,
				notAssignRoomReservations: null
			};
			return amendStayModelTemp;
		},
		buildAmendStayModel: function(room,roomList,notAssignRoomReservations){
			console.info("homeAS", room);
			if(room.BookingStatus == "CHECKOUT"){
				return;
			}
			var keys = ["NOTIFICATION_WHEN_CHANGE_DATE", "NOTIFICATION_CHANGE_DATE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			var selectedRR = {
				ReservationRoomId: room.ReservationRoomId,
				BookingStatus: room.BookingStatus,
				ReservationNumber: room.ReservationNumber,
				RoomName: null,
				Travellers: null,
				ArrivalDate: room.ArrivalDate,
				DepartureDate: room.DepartureDate,
				Adults: room.Adults,
				Children: room.Child,
				PreviousReservation:[],
				NextReservation:[],
				languageKeys: languageKeys
			};
			if (room.RoomId != null){
				var roomTmp = null;
				var selectedRRTemp = _.filter(roomList, function(item){
					return (item.reservationRoom != null && item.reservationRoom.ReservationRoomId == room.ReservationRoomId);
				});
				if (selectedRRTemp.length > 0){
					roomTmp = selectedRRTemp[0];
					selectedRR.RoomName = roomTmp.RoomName;
					if (roomTmp.reservationRoom && roomTmp.reservationRoom.Travellers){
						selectedRR.BookingStatus = roomTmp.BookingStatus;
						if (roomTmp.reservationRoom.Travellers){
							selectedRR.Travellers = roomTmp.reservationRoom.Travellers.Fullname;
						}
						if (roomTmp.reservationRoom.Reservations){
							selectedRR.ReservationNumber = roomTmp.reservationRoom.Reservations.ReservationNumber;
						}

					}
				}
				else {
					for(var index in roomList){
						if(roomList[index] && roomList[index].RoomId && room.RoomId == roomList[index].RoomId){
							if (roomList[index].BookingList.length > 0){
								for(var idx in roomList[index].BookingList){
									var tmp = roomList[index].BookingList[idx];
									if(tmp.ReservationRoomId == room.ReservationRoomId){
										roomTmp                     = roomList[index];
										console.info("BookingList", roomTmp);
										selectedRR.RoomName        = roomTmp.RoomName;
										if (tmp.Travellers != null){
											selectedRR.Travellers = tmp.Travellers.Fullname;
										}
										if (tmp.Reservations != null){
											selectedRR.ReservationNumber = tmp.Reservations.ReservationNumber;
										}
										break;
									}
								}
							}
							if(roomTmp == null){
								for(var idx in roomList[index].reservationRooms){
									var reservation = roomList[index].reservationRooms[idx];
									if(room.ReservationRoomId == reservation.ReservationRoomId){
										roomTmp                     = roomList[index];
										console.info("reservationRooms", roomTmp);
										selectedRR.RoomName        = roomTmp.RoomName;
										if (reservation.Travellers){
											selectedRR.Travellers = reservation.Travellers.Fullname;
										}
										if (reservation.Reservations){
											selectedRR.ReservationNumber = reservations.ReservationNumber;
										}
										break;
									}
								}
							}
						}
					};

				}
				if(roomTmp != null){
					if(roomTmp.BookingList && roomTmp.BookingList.length > 0 ){
						for(var idx in roomTmp.BookingList){
							if(room.ReservationRoomId != roomTmp.BookingList[idx].ReservationRoomId){
								if (selectedRR.DepartureDate <= roomTmp.BookingList[idx].ArrivalDate){
									selectedRR.NextReservation.push(roomTmp.BookingList[idx]);
								}
							}
						}



					}
					if(roomTmp.reservationRooms && roomTmp.reservationRooms.length > 0 ){
						for(var idx in roomTmp.reservationRooms){
							if(room.ReservationRoomId != roomTmp.reservationRooms[idx].ReservationRoomId){
								if (selectedRR.DepartureDate <= roomTmp.reservationRooms[idx].ArrivalDate){
									selectedRR.NextReservation.push(roomTmp.reservationRooms[idx]);
								}
							}
						}
					}
					if (selectedRR.NextReservation.length > 0){
						selectedRR.NextReservation.sort(function(a,b){
							return a.ArrivalDate - b.ArrivalDate;
						});
					}
					if(roomTmp.reservationRooms && roomTmp.reservationRooms.length > 0 ){
						for(var idx in roomTmp.reservationRooms){
							if(room.ReservationRoomId != roomTmp.reservationRooms[idx].ReservationRoomId){
								if (selectedRR.DepartureDate > roomTmp.reservationRooms[idx].ArrivalDate){
									selectedRR.PreviousReservation.push(roomTmp.reservationRooms[idx]);
								}
							}
						}
					}
					if(roomTmp.BookingList && roomTmp.BookingList.length > 0 ){
						for(var idx in roomTmp.BookingList){
							if(room.ReservationRoomId != roomTmp.BookingList[idx].ReservationRoomId){
								if (selectedRR.DepartureDate > roomTmp.BookingList[idx].ArrivalDate){
									selectedRR.PreviousReservation.push(roomTmp.BookingList[idx]);
								}
							}
						}
					}
					if (selectedRR.PreviousReservation.length > 0){
						selectedRR.PreviousReservation.sort(function(a,b){
							return a.ArrivalDate - b.ArrivalDate;
						});
					}
				}
				else{
					dialogService.messageBox("ERROR", "SOME_ERRORS_OCCURRED_WHILE_PROCESSING_AMEND_STAY");
					return;
				}
			}
			else{
				if (notAssignRoomReservations && notAssignRoomReservations.length > 0){
					var selectedRRTemp = _.filter(notAssignRoomReservations, function(item){
						return (item.ReservationRoomId == room.ReservationRoomId);
					});
					if (selectedRRTemp.length > 0){
						roomTmp = selectedRRTemp[0];
						if (roomTmp && roomTmp.Travellers){
							selectedRR.Travellers = roomTmp.Travellers.Fullname;
						}
						if (roomTmp.Reservations){
							selectedRR.ReservationNumber = roomTmp.Reservations.ReservationNumber;
						}
					}
				}
			}
			if (roomTmp == null){
				dialogService.messageBox("ERROR", "SOME_ERRORS_OCCURRED_WHILE_PROCESSING_AMEND_STAY");
				return;
			}
			return selectedRR;
		},
		buildRoomMoveModel: function(rr) {
			var rrTemp;
			if (rr) {
				rrTemp = {
					ReservationId: rr.Reservations.ReservationId,
					ReservationNumber: rr.Reservations.ReservationNumber,
					ReservationRoomId: rr.ReservationRoomId,
					BookingStatus: rr.BookingStatus,
					HotelId: rr.HotelId,
					RoomId: rr.RoomId,
					RoomPriceId: rr.RoomPriceId,
					RoomTypeId: rr.RoomTypeId,
					RoomName: rr.Rooms.RoomName,
					// Travellers: rr.Travellers,
					reservationRoom: rr,
					roomType: rr.RoomTypes,
					roomBookingList: {},
					reservationRooms: {}
				}
			}
			return rrTemp;
		},
		buildCopyTimelineModel: function(rr) {
			var tempRR = {};
			if (rr) {
				tempRR.reservationRoom = {
					ReservationRoomId: rr.ReservationRoomId,
					BookingStatus: rr.BookingStatus,
					ArrivalDate: rr.ArrivalDate,
					DepartureDate: rr.DepartureDate,
					Price: rr.Price,
					Adults: rr.Adults,
					Child: rr.Child,
					HotelId: rr.HotelId,
					RoomId: rr.RoomId,
					RoomPriceId: rr.RoomPriceId,
					RoomTypeId: rr.RoomTypeId,
					TravellerId: rr.Travellers.TravellerId,
					Reservations: { ReservationId: rr.ReservationId, ReservationNumber: rr.Reservations.ReservationNumber },
					ReservationNumber: rr.Reservations.ReservationNumber,
					TravellersList: rr.TravellersList,
					RoomExtraServiceItemsList: rr.RoomExtraServiceItemsList,
					RoomExtraServicesList: rr.RoomExtraServicesList,
					RoomName: rr.Rooms.RoomName,
					RoomType: rr.RoomType,
					Travellers: rr.Travellers,
					PaymentsList: []
				};
				tempRR.roomType = rr.RoomType;
				tempRR.RoomTypeId = rr.RoomTypeId;
			};
			return tempRR;
		},
		buildCancelTimelineModel: function (rr) {
			var rrTemp;
			if (rr) {
				rrTemp = {
					ReservationRoomId: rr.ReservationRoomId,
					ReservationNumber: rr.Reservations.ReservationNumber,
					RoomName: rr.Rooms.RoomName,
					RoomType: rr.RoomType,
					ArrivalDate: rr.ArrivalDate,
					DepartureDate: rr.DepartureDate,
					Adults: rr.Adults,
					Child: rr.Child,
					PaymentsList: rr.PaymentsList,
					Travellers: rr.Travellers,
					RoomExtraServicesList: rr.RoomExtraServicesList,
					RoomExtraServiceItemsList: rr.RoomExtraServiceItemsList,
				};
			};
			return rrTemp;
		},
		buildExtraServiceTimelineModel: function (action, rr) {
			var modelTemp = {
				item: {
					name: action
				},
				selectRoom: {
					BookingList: [],
					BookingStatus: rr.BookingStatus,
					HotelId: rr.HotelId,
					RoomDescription: null,
					RoomId: rr.RoomId,
					RoomName: rr.Rooms.RoomName,
					RoomTypeId: rr.Rooms.RoomTypeId,
					reservationRoom: rr,
					roomType: rr.RoomType,
					reservationRooms: [],
					roomBookingList: [],
				}
			};
			return modelTemp;
		}
	}; 

	return Main;
}]); 