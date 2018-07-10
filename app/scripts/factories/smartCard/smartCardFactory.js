ezCloud.factory("smartCardFactory", ['$http', 'loginFactory', '$rootScope', '$localStorage', '$mdDialog', 'dialogService', '$q', '$mdMedia', '$state', '$filter', function ($http, loginFactory, $rootScope, $localStorage, $mdDialog, dialogService, $q, $mdMedia, $state, $filter) {

	var self = this;
	var roomName;
	$rootScope.writeCardError = false;
	return {

		getRoomId: function () {
			return roomId;
		},

		setRoomId: function () {

		},

		readCard: function () {
			readCard();
		},
		readCardOnly: function () {
			return readCardOnly();
		},
		createCard: function (selectedRoom, hourAddToCheckOut) {
			createCard(selectedRoom, hourAddToCheckOut);
		},
		deleteCard: function (deleteCardModel) {
			deleteCard(deleteCardModel);
		},
		writeCard: function (writeCardModel, reservationRoomId, reason) {
			return writeCard(writeCardModel, reservationRoomId, reason);
		},
		writeCardDashboard: function (writeCardModel, reservationRoomId, reason) {
			return writeCardDashboard(writeCardModel, reservationRoomId, reason);
		},
		writeCardInWalkin: function (writeCardModel, reservationRoomId, reason) {
			return writeCardInWalkin(writeCardModel, reservationRoomId, reason);
		},
		addHourCheckOutCard: function (model, hour) {
			return addHourCheckOutCard(model, hour);
		},
		reWriteCard: function (writeCardModel, reservationRoomId, reason) {
			return reWriteCard(writeCardModel, reservationRoomId, reason);
		},
		reWriteCardDashboard: function (writeCardModel, reservationRoomId, reason) {
			return reWriteCardDashboard(writeCardModel, reservationRoomId, reason);
		},
		reWriteCardNeoLockGroup: function (writeCardModel, reservationRoomId, reason) {
			return reWriteCardNeoLockGroup(writeCardModel, reservationRoomId, reason);
		},
	};

	function readCard() {
		var readCardPromise = securedGet("http://localhost:2000/readcard?format=json");
		$rootScope.dataLoadingPromise = readCardPromise;
		readCardPromise.success(function (data) {
			if (data.Result === 0) {
				var cardData = angular.copy(data);
				if (cardData.ArrivalDate) {
					var parsedDate = new Date(parseInt(cardData.ArrivalDate.substr(6)));
					cardData.ArrivalDate = new Date(parsedDate);

				}
				if (cardData.DepartureDate) {
					var parsedDate = new Date(parseInt(cardData.DepartureDate.substr(6)));
					cardData.DepartureDate = new Date(parsedDate);
				}
				if (cardData.RoomName) {
					cardData.RoomName = cardData.RoomName.substr(cardData.RoomName.length - 3);
				}
				$mdDialog.show({
					controller: ReadCardDialogController,
					resolve: {
						cardData: function () {
							return cardData;
						}
					},
					templateUrl: 'views/templates/readCard.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
				}).then(function () {

				}, function () {

				});

				function ReadCardDialogController($scope, $mdDialog, $state, cardData) {
					console.log("CARD DATA", cardData);

					function readCardInit() {
						$scope.cardData = cardData;
						var getReservationRoom = loginFactory.securedGet("api/Connectivities/GetReservationRoom", "RRID=" + $scope.cardData.TravellerId);
						$rootScope.dataLoadingPromise = getReservationRoom;
						getReservationRoom.success(function (data) {
							if (data !== null) {
								$scope.cardData = data;
								if ($scope.cardData.room.ArrivalDate) {
									$scope.cardData.room.ArrivalDate = new Date($scope.cardData.room.ArrivalDate);
								}
								if ($scope.cardData.room.DepartureDate) {
									$scope.cardData.room.DepartureDate = new Date($scope.cardData.room.DepartureDate);
								}
							}
						}).error(function (err) {
							console.log(err);
						})
					}
					readCardInit();
					$scope.hide = function () {
						$mdDialog.hide();
					};
					$scope.cancel = function () {
						$mdDialog.cancel();
					};

					$scope.goToReservation = function () {
						$mdDialog.hide();
						$state.go("reservation", {
							reservationRoomId: parseInt($scope.cardData.room.ReservationRoomId)
						});
					}
				}
			} else {
				dialogService.messageBox("INVALID_CARD")
			}

		}).error(function (err) {
			console.log(err);
		});
	}

	function readCardOnly() {
		var deferred = $q.defer();
		var readCardPromise = securedGet("http://localhost:2000/readcard?format=json");
		$rootScope.dataLoadingPromise = readCardPromise;
		readCardPromise.success(function (data) {
			if (data.Result === 0) {
				deferred.resolve(data);
				// var cardData = angular.copy(data);
				// if (cardData.ArrivalDate) {
				// 	var parsedDate = new Date(parseInt(cardData.ArrivalDate.substr(6)));
				// 	cardData.ArrivalDate = new Date(parsedDate);

				// }
				// if (cardData.DepartureDate) {
				// 	var parsedDate = new Date(parseInt(cardData.DepartureDate.substr(6)));
				// 	cardData.DepartureDate = new Date(parsedDate);
				// }
				// if (cardData.RoomName) {
				// 	cardData.RoomName = cardData.RoomName.substr(cardData.RoomName.length - 3);
				// }
			} else {
				deferred.resolve(-1);
			}
		}).error(function (err) {
			deferred.resolve(-1);
			// deferred.reject(err);
		});
		return deferred.promise;
	}

	function createCard(selectedRoom, hourAddToCheckOut) {
		console.log("SELECTED ROOM", selectedRoom);
		$mdDialog.show({
			controller: CreateCardDialogController,
			resolve: {
				selectedRoom: function () {
					return selectedRoom;
				},
				hourAddToCheckOut: function () {
					return hourAddToCheckOut;
				}
			},
			templateUrl: 'views/templates/createCard.tmpl.html',
			parent: angular.element(document.body),
			fullscreen: $mdMedia('xs'),
			targetEvent: event

		}).then(function (RoomMoveModel) {

		}, function () {

		});

		function CreateCardDialogController($scope, $mdDialog, loginFactory, selectedRoom, hourAddToCheckOut) {

			function createCardInit() {
				// if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" ){
				// DocreateCardNeoLock();
				// }else{
				$scope.isDisable = false;
				DocreateCardNormal();
				// }
			}

			function DocreateCardNeoLock() {
				console.log("vivo");
			}

			function DocreateCardNormal() {
				$scope.DateTimePickerOption = {
					format: 'dd/MM/yyyy HH:mm'
				};

				var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + selectedRoom.reservationRoom.ReservationRoomId + "&roomName=" + selectedRoom.RoomName);
				$rootScope.dataLoadingPromise = getCardInfo;
				getCardInfo.success(function (data) {
					if (data !== null && data.length > 0) {
						$scope.cardInfo = data;
						for (var index in $scope.cardInfo) {
							if ($scope.cardInfo[index].CreatedDate) {
								$scope.cardInfo[index].CreatedDate = new Date($scope.cardInfo[index].CreatedDate);
							}
						}
						$scope.cardInfo.sort(function (a, b) {
							return a.CreatedDate - b.CreatedDate;
						});
					}
				}).error(function (err) {
					console.log(err);
				});
				$scope.reason = null;
				$scope.writeCardModel = {
					RoomName: selectedRoom.RoomName,
					TravellerName: selectedRoom.reservationRoom.Travellers.Fullname,
					ArrivalDate: selectedRoom.reservationRoom.ArrivalDate,
					DepartureDate: selectedRoom.reservationRoom.DepartureDate,
					RoomDescription: selectedRoom.RoomDescription,
					OverrideOldCards: true
				}
				if (hourAddToCheckOut != null) {
					$scope.writeCardModel = addHourCheckOutCard($scope.writeCardModel, hourAddToCheckOut);
				};
				$scope.str = $scope.writeCardModel.ArrivalDate.format('dd/mm/yyyy HH:MM');
				$scope.str2 = $scope.writeCardModel.DepartureDate.format('dd/mm/yyyy HH:MM');
			}

			createCardInit();

			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.writeCard = function () {
				$scope.isDisable = true;
				var cardPromise = writeCard($scope.writeCardModel, selectedRoom.reservationRoom.ReservationRoomId, $scope.reason);
				cardPromise.then(function (data) {
					console.log("DATA PROMISE", data.Result);
					if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
						if (data.passcode != null) {
							$mdDialog.hide();
							dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
						} else {
							dialogService.messageBox(data.message);
						}
					} else {
						if (data.Result !== null && data.Result == 0) {
							$mdDialog.hide();
							dialogService.toast("CREATE_CARD_SUCCESSFUL");
						} else {
							dialogService.messageBox("INVALID_CARD");
						}
					}

				});
			}

		}
	}

	function deleteCard(deleteCardModel) {
		var deleteCard = securedPost("http://localhost:2000/deletecard?format=json", deleteCardModel);
		deleteCard.success(function (data) {
			console.log('DELETE CARD', data)
		}).error(function (err) {
			console.log('Error', +err);
		});
	}


	function writeCard(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return writeCardNeoLock(writeCardModel, reservationRoomId, reason);
		} else {
			return writeCardNormal(writeCardModel, reservationRoomId, reason);
		}
	}

	function writeCardDashboard(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return writeCardNeoLockDashboard(writeCardModel, reservationRoomId, reason);
		} else {
			return writeCardInWalkinNormal(writeCardModel, reservationRoomId, reason);
		}
	}

	function reWriteCard(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return reWriteCardNeoLock(writeCardModel, reservationRoomId, reason);
		}
	}

	function reWriteCardDashboard(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return reWriteCardNeoLockDashboard(writeCardModel, reservationRoomId, reason);
		}
	}

	function reWriteCardNeoLockGroup(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return reWriteCardNeoLockGroup(writeCardModel, reservationRoomId, reason);
		}
	}

	function writeCardInWalkin(writeCardModel, reservationRoomId, reason) {
		if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
			return writeCardNeoLock(writeCardModel, reservationRoomId, reason);
		} else {
			return writeCardInWalkinNormal(writeCardModel, reservationRoomId, reason);
		}
	}


	function writeCardNeoLock(writeCardModel, reservationRoomId, reason) {
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var urlLock = "api/Room/CreateWriteSMC?ReservationRoomId=" + writeCardModel.TravellerId;
		var writeCardPromise = loginFactory.securedPostJSON(urlLock, {});
		$rootScope.dataLoadingPromise = writeCardPromise;
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("leo nguyen call success!!!!!!!!!!!!!");
			if (data.passcode != null) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}

			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD")
			.then(function (data) {
				$rootScope.pageInit = true;
				$state.go("reservation", {
					reservationRoomId: reservationRoomId
				}, {
						reload: true
					});
			});
			deferred.reject(err);
		})

		return deferred.promise;
	}

	function writeCardNeoLockDashboard(writeCardModel, reservationRoomId, reason) {
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var urlLock = "api/Room/CreateWriteSMC?ReservationRoomId=" + writeCardModel.TravellerId;
		var writeCardPromise = loginFactory.securedPostJSON(urlLock, {});
		$rootScope.dataLoadingPromise = writeCardPromise;
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("leo nguyen call success!!!!!!!!!!!!!");
			if (data.passcode != null) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}

			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD");
			// .then(function (data) {
			// 	$rootScope.pageInit = true;
			// 	$state.go("reservation", {
			// 		reservationRoomId: reservationRoomId
			// 	}, {
			// 			reload: true
			// 		});
			// });
			deferred.reject(err);
		})

		return deferred.promise;
	}

	function reWriteCardNeoLock(writeCardModel, reservationRoomId, reason) {
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var urlLock = "api/Room/ReCreateWriteSMC?ReservationRoomId=" + writeCardModel.TravellerId;
		var writeCardPromise = loginFactory.securedPostJSON(urlLock, {});
		$rootScope.dataLoadingPromise = writeCardPromise;
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("leo nguyen call success!!!!!!!!!!!!!");
			if (data.passcode != null) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}

			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD")
			.then(function (data) {
				$rootScope.pageInit = true;
				$state.go("reservation", {
					reservationRoomId: reservationRoomId
				}, {
						reload: true
					});
			});
			deferred.reject(err);
		})

		return deferred.promise;
	}

	function reWriteCardNeoLockDashboard(writeCardModel, reservationRoomId, reason) {
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var urlLock = "api/Room/ReCreateWriteSMC?ReservationRoomId=" + writeCardModel.TravellerId;
		var writeCardPromise = loginFactory.securedPostJSON(urlLock, {});
		$rootScope.dataLoadingPromise = writeCardPromise;
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("leo nguyen call success!!!!!!!!!!!!!");
			if (data.passcode != null) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}

			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD");
			// .then(function (data) {
			// 	$rootScope.pageInit = true;
			// 	$state.go("reservation", {
			// 		reservationRoomId: reservationRoomId
			// 	}, {
			// 			reload: true
			// 		});
			// });
			deferred.reject(err);
		})

		return deferred.promise;
	}

	function reWriteCardNeoLockGroup(writeCardModel, reservationRoomId, reason) {
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var urlLock = "api/Room/ReCreateWriteSMC?ReservationRoomId=" + writeCardModel.TravellerId;
		var writeCardPromise = loginFactory.securedPostJSON(urlLock, {});
		$rootScope.dataLoadingPromise = writeCardPromise;
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("leo nguyen call success!!!!!!!!!!!!!");
			if (data.passcode != null) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}

			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			console.log("tạo lại thẻ neolock checkout đoàn","UNABLE_TO_CREATE_NEW_CARD");
			// .then(function (data) {
			// 	$rootScope.pageInit = true;
			// 	$state.go("reservation", {
			// 		reservationRoomId: reservationRoomId
			// 	}, {
			// 			reload: true
			// 		});
			// });
			deferred.reject(err);
		})

		return deferred.promise;
	}

	function writeCardNormal(writeCardModel, reservationRoomId, reason) {
		console.log("RESERVATION ID", reservationRoomId);
		if (writeCardModel.ArrivalDate) {
			writeCardModel.ArrivalDate = writeCardModel.ArrivalDate.toISOString();
		}
		if (writeCardModel.DepartureDate) {
			writeCardModel.DepartureDate = writeCardModel.DepartureDate.toISOString();
		}
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var writeCardPromise = securedPost("http://localhost:2000/writecard?format=json", writeCardModel);
		$rootScope.dataLoadingPromise = writeCardPromise;
		console.log("WRITE CARD PROMISE", writeCardPromise);
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("SUCCESS");
			if (data.Result !== null && data.Result == 0) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				console.log("SMART CARD MODEL", smartCardModel);
				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}
			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			console.log("CARD ERROR", err);
			$rootScope.writeCardError = true;
			console.log("writeCardError", $rootScope.writeCardError);
			dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
				$rootScope.pageInit = true;
				console.log("CARD ERROR", err);
				$state.go("reservation", {
					reservationRoomId: reservationRoomId
				}, {
						reload: true
					});
			});
			deferred.reject(err);
		})
		//}


		return deferred.promise;
	}




	function writeCardInWalkinNormal(writeCardModel, reservationRoomId, reason) {
		console.log("RESERVATION ID", reservationRoomId);
		if (writeCardModel.ArrivalDate) {
			writeCardModel.ArrivalDate = writeCardModel.ArrivalDate.toISOString();
		}
		if (writeCardModel.DepartureDate) {
			writeCardModel.DepartureDate = writeCardModel.DepartureDate.toISOString();
		}
		writeCardModel.TravellerId = reservationRoomId.toString();
		var deferred = $q.defer();
		var writeCardPromise = securedPost("http://localhost:2000/writecard?format=json", writeCardModel);
		$rootScope.dataLoadingPromise = writeCardPromise;
		console.log("WRITE CARD PROMISE", writeCardPromise);
		$rootScope.writeCardError = false;
		writeCardPromise.success(function (data) {
			console.log("SUCCESS");
			if (data.Result !== null && data.Result == 0) {
				var smartCardModel = {
					ReservationRoomId: reservationRoomId,
					RoomName: writeCardModel.RoomName,
					GuestName: writeCardModel.TravellerName,
					ArrivalDate: writeCardModel.ArrivalDate,
					DepartureDate: writeCardModel.DepartureDate,
					Reason: reason
				}

				var saveCardWritting = loginFactory.securedPostJSON("api/Connectivities/SaveSmartCard", smartCardModel);
				saveCardWritting.success(function (data) {
					console.log(data);
				}).error(function (err) {
					console.log(err);
				});
			}
			setTimeout(function () {
				$rootScope.$apply();
			}, 0);
			deferred.resolve(data);
		}).error(function (err) {
			$rootScope.writeCardError = true;
			// dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
			// 	$rootScope.pageInit = true;
			// 	console.log("CARD ERROR", err);			
			// });
			deferred.reject(err);
		})


		return deferred.promise;
	}

	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}


	function securedGetO(url, notimeout) {
		var get = $http({
			url: url,
			method: 'GET',
			headers: JSON.parse($rootScope.Connectivities.TokenLock)
		});

		if ($localStorage.session)
			loginFactory.refreshToken(null, null);
		get.error(
			function (data, status) {
				console.log(data, status);
				if (status == 401 && !notimeout) {
					loginFactory.sessionTimeout();

				} else if (status == 403) {
					dialogService.messageBox("NOT_ENOUGH_PERMISSION");
				}
			}
		);
		return get;
	}

	function securedGet(url, notimeout) {
		var token = !$localStorage.session ? "" : $localStorage.session.access_token;
		console.log("TOKEN", token);
		if (!$localStorage.session && !notimeout) {
			return;
		}
		var get = $http({
			url: url,
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			}
		});
		if ($localStorage.session)
			loginFactory.refreshToken(null, null);
		get.error(
			function (data, status) {
				console.log(data, status);
				if (status == 401 && !notimeout) {
					loginFactory.sessionTimeout();

				} else if (status == 403) {
					dialogService.messageBox("NOT_ENOUGH_PERMISSION");
				}
			}
		);
		return get;
	}

	function securedPost(url, data) {
		var token = !$localStorage.session ? "" : $localStorage.session.access_token;
		console.log("TOKEN", token);
		if (token == "") return;
		var post = $http({
			url: url,
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			data: JSON.stringify(data)
		});
		console.log("DATA", data);

		post.error(
			function (data, status) {
				if (status == 401 && !notimeout) {
					loginFactory.sessionTimeout();
				} else if (status == 403) {
					dialogService.messageBox("NOT_ENOUGH_PERMISSION");
				}
			});
		return post;
	}

	function addHourCheckOutCard(model, hour) {
		var tempCheckOut = new Date(model.ArrivalDate);
		if (tempCheckOut < new Date()) {
			tempCheckOut = new Date();
		};
		//
		tempCheckOut.setHours(tempCheckOut.getHours() + hour);
		//
		if (tempCheckOut > new Date(model.DepartureDate)) {
			tempCheckOut = model.DepartureDate;
		};
		model.DepartureDate = tempCheckOut;
		return model;
	}



}]);