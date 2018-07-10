ezCloud.controller('statsController', ['$scope', '$rootScope', '$mdBottomSheet', '$location', '$state', 'dialogService', 'loginFactory', '$mdDialog', 'roomListFactory', 'commonFactory', '$filter', function ($scope, $rootScope, $mdBottomSheet, $location, $state, dialogService, loginFactory, $mdDialog, roomListFactory, commonFactory, $filter) {

	//Dashboard
	Init();
	var roomList = {};
	var todayStats = {};
	var houseKeeping = {};
	var todayActivity = {};
	var hotelInventory = {};
	var hotelGuests = {};
	todayStats.roomOccupied = 0;
	todayStats.roomDueOut = 0;
	todayStats.roomOverDue = 0;
	todayStats.roomTodayStayOver = 0;
	todayStats.roomArrival = 0;
	todayStats.roomAvailable = 0;
	todayStats.roomTotalRoomsToSell = 0;
	todayStats.ProjectedRoomsOccupied = 0;
	todayStats.ProjectedOccupancy = 0;
	var todayCount = {
		ARRIVED: {
			value: 0
		}
		, DUE_TO_ARRIVE: {
			value: 0
		}
		, CHECKED_OUT: {
			value: 0
		}
		, DUE_OUT: {
			value: 0
		}
		, DAY_USE: {
			value: 0
		},

	};

	function generateGridData(from, to, data) {

		//to.setDate(to.getDate() + 1);
		var model = [];
		var total = {
			RoomTypeName: $filter('translate')('TOTAL')
		};
		var currentDate = from;
		for (var idx in data) {
			var roomTypes = data[idx];
			var item = {
				RoomTypeName: $filter('translate')(roomTypes.RoomTypeCode)
			};
			currentDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
			var i = 0;
			while (currentDate <= to) {
				var label = "d" + currentDate.format("mmdd");
				item[label] = roomTypes.AvailableRooms[i];
				total[label] = total[label] != null ? total[label] + roomTypes.AvailableRooms[i] : roomTypes.AvailableRooms[i];
				currentDate.setDate(currentDate.getDate() + 1);
				i++;
			}

			model.push(item);
		}
		model.push(total);
		//console.log("total:",total);
		//console.log('mode:',model);
		var columns = [{
			field: "RoomTypeName"
			, title: $filter('translate')("ROOM_TYPE")
			, width: "100px"
        }];
		currentDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());

		while (currentDate <= to) {
			var title = currentDate.format("dd/mm");
			var field = "d" + currentDate.format("mmdd");
			var column = {
				field: field
				, title: title
			};
			columns.push(column);
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return {
			data: model
			, columns: columns
			, userColor: "#ffd600"
		};
	}

	$scope.savePDF = function () {
		angular.element("#revenueMonthChart").getKendoChart().saveAsPDF();
	}

	function generateRevenueGridData(Redata) {
		console.log('defaultHotelCurrency:', $scope.defaultHotelCurrency);
		var data = [];
		var today = new Date($scope.selectedRevenueDate.getFullYear(), $scope.selectedRevenueDate.getMonth(), $scope.selectedRevenueDate.getDate());
		var selectMonth = today.getMonth() + 1;
		var titleToday = selectMonth + '/' + today.getFullYear();
		var items = Redata.listRevenueMonth;
		var totalMonthlyRevenue = 0;


		for (var idx in items) {

			var field = items[idx].Day;
			var value = 0;
			if ($scope.defaultHotelCurrency == 'VND') {
				value = (parseFloat(items[idx].Amount) / 1000000).toFixed(2);

			} else {
				value = items[idx].Amount;
			}


			totalMonthlyRevenue += items[idx].Amount;
			var item = {}
			if (today.getDate() == items[idx].Day) {
				item = {
					day: field
					, value: value
					, userColor: "rgb(64,196,255)"
				};


			} else {

				item = {
					day: field
					, value: value
					, userColor: "#ffd600"
				};


			}
			data.push(item);
		}
		if ($scope.defaultHotelCurrency == 'VND') {
			totalMonthlyRevenue =totalMonthlyRevenue /1000000; 
			titleToday = titleToday + ' (VND 1.000.000)';

		} else {
			totalMonthlyRevenue =totalMonthlyRevenue.toFixed(2); 
			titleToday = titleToday + ' (' + $scope.defaultHotelCurrency + ')';
		}


		$("#revenueMonthChart").kendoChart({
			pdf: {
				fileName: "RevalueCheckout.pdf"
				, proxyURL: "//demos.telerik.com/kendo-ui/service/export"
			}
			, dataSource: {
				data: data
			}
			, title: {
				align: "center"
				, text: $filter("translate")("REVENUE_PER_DAY") + ' ' + titleToday
			}
			, legend: {
				visible: false

			}
			, seriesDefaults: {
				type: "column"
				, labels: {
					visible: true
					, background: "transparent"
					, format: "{0:n}"
				}
			}
			, series: [{
				field: "value"
				, colorField: "userColor"
                }]
			, valueAxis: {
				majorGridLines: {
					visible: false
				}
				, line: {
					visible: false
				}
				, axisCrossingValue: 0
			}
			, categoryAxis: {
				title: {
					text: $filter("translate")("REVENUE_PER_MONTH") + ' ' + titleToday + ': ' + totalMonthlyRevenue
					, color: "#ff0000"
				}
				, field: "day"
				, majorGridLines: {
					visible: false
				}
				, line: {
					visible: false
				}
			},

			tooltip: {
				visible: true
				, template: "${value}"
			}
		});
	}

	function changeRevenueDate() {
		var from = new Date($scope.selectedRevenueDate.getFullYear(), $scope.selectedRevenueDate.getMonth(), $scope.selectedRevenueDate.getDate());
		showRevenueRoomCheckout(from);
		//showDashboardForApp(from);

	};

	function changeFutureDate() {
		var from = new Date($scope.selectedDate.getFullYear(), $scope.selectedDate.getMonth(), $scope.selectedDate.getDate());
		var to = new Date(from.getTime() + 6 * 3600 * 1000 * 24);
		console.log(to);
		showFutureInventory(from, to);

	};
	$scope.selectedDate = new Date();
	$scope.strDate = $scope.selectedDate.format("dd-mm-yyyy");
	$scope.DatePickerOptions = {
		format: 'dd/MM/yyyy'
		, change: changeFutureDate
		, min: new Date()
	};


	$scope.selectedRevenueDate = new Date();
	$scope.strRevenueDate = $scope.selectedRevenueDate.format("dd-mm-yyyy");
	$scope.DatePickerRevenueOptions = {
		format: 'dd/MM/yyyy'
		, change: changeRevenueDate
		, max: new Date()
	};


	function showFutureInventory(from, to) {

		var today = new Date();
		if (from === undefined) {
			from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			to = new Date();
			to.setDate(from.getDate() + 6);

		}
		var getInventory = loginFactory.securedGet("api/Room/FutureInventory", $.param({
			from: from.format("yyyy-mm-dd")
			, to: to.format("yyyy-mm-dd")
		}));
		$rootScope.dataLoadingPromise = getInventory;
		getInventory.success(
			function (data) {

				var model = generateGridData(from, to, data);

				$scope.futureInventoryOptions = {
					dataSource: {
						data: model.data
					}
					, sortable: true
					, pageable: false
					, dataBound: function () {
						this.expandRow(this.tbody.find("tr.k-master-row").first());
					}
					, columns: model.columns

				};

				$scope.appliedDate = from;
			}
		);
	}

	function showDashboardForApp(from) {

		var today = new Date();
		if (from === undefined) {
			from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		}
		var getRevenue = loginFactory.securedGet("api/Room/DashboardForApp", $.param({
			from: from.format("yyyy-mm-dd")
		}));
		$rootScope.dataLoadingPromise = getRevenue;
		getRevenue.success(
			function (data) {
				console.log('DashboardForApp', data);
				//generateRevenueGridData(data);
			}
		);
	}

	function showRevenueRoomCheckout(from) {

		var today = new Date();
		if (from === undefined) {
			from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		}
		var getRevenue = loginFactory.securedGet("api/Room/RevenueRoomCheckout", $.param({
			from: from.format("yyyy-mm-dd")
		}));
		$rootScope.dataLoadingPromise = getRevenue;
		getRevenue.success(
			function (data) {
				console.log('data reve', data);
				generateRevenueGridData(data);
			}
		);
	}

	function getDatePart(today) {
		var dd = today.getDate();
		var mm = today.getMonth(); //January is 0!
		var yyyy = today.getFullYear();
		return new Date(yyyy, mm, dd);
	}
	$scope.defaultHotelCurrency;

	function Init() {
		roomListFactory.getDataStatis(new Date(), function (data){
			console.log('ITEMDUNGNN1', data);
			$scope.defaultHotelCurrency = data.defaultCurrency.CurrencyInfo !== null ? data.defaultCurrency.CurrencyInfo.AlphabeticCode : "VND";
			todayStats.roomTotalRoomsToSell = data.Dashboard.todayStats_roomTotalRoomsToSell;
			todayStats.roomOccupied =data.Dashboard.todayStats_roomOccupied;
			todayStats.roomDueOut=data.Dashboard.todayStats_roomDueOut;
			todayStats.roomOverDue =data.Dashboard.todayStats_roomDueOut;
			todayStats.roomTodayStayOver =data.Dashboard.todayStats_roomTodayStayOver;
			todayStats.roomArrival =data.Dashboard.todayStats_roomArrival;
			todayStats.ProjectedOccupancy=data.Dashboard.todayStats_Projected_Occupancy;
			todayStats.ProjectedRoomsOccupied=data.Dashboard.todayStats_Projected_roomOccupied;
			
			todayActivity.Arrived=data.Dashboard.todayActivity_Arrived;
			todayActivity.Checked_Out=data.Dashboard.todayActivity_Checked_Out;
			todayActivity.Due_To_Arrive = todayStats.roomArrival;
			todayActivity.Due_Out =data.Dashboard.todayActivity_Due_Out;
			todayActivity.Day_Use =data.Dashboard.todayActivity_Day_Use;
			
			hotelInventory.Out_Of_Order=data.Out_Of_Order;
			hotelInventory.Total_Room_Available=data.Total_Room_Available;
			hotelInventory.Rooms_In_Property = data.Out_Of_Order + data.Total_Room_Available;
			houseKeeping.Dirty_Occupied=data.Dirty_Occupied;
			houseKeeping.Dirty_Variant=data.Dirty_Variant;
			
			hotelGuests = {
				Current_In_House: 0
				, Current_In_Adult: 0
				, Current_In_Children: 0
				, Due_To_Checkout: 0
				, Due_To_Checkout_Adult: 0
				, Due_To_Checkout_Children: 0
				, Due_To_Arrive: 0
				, Due_To_Arrive_Adult: 0
				, Due_To_Arrive_Children: 0
				, Staying_Over: 0
				, Staying_Over_Adult: 0
				, Staying_Over_Children: 0
				, Checked_Out_Adult: 0
				, Checked_Out_Children: 0
				, Expected_In_House: 0
				, Expected_In_House_Adult: 0
				, Expected_In_House_Children: 0
			};
			
			
			hotelGuests.Current_In_Adult= data.hotelGuests.Current_In_Adult;
			hotelGuests.Current_In_Children= data.hotelGuests.Current_In_Children;
			
			hotelGuests.Due_To_Checkout_Adult= data.hotelGuests.Due_To_Checkout_Adult;
			hotelGuests.Due_To_Checkout_Children= data.hotelGuests.Due_To_Checkout_Children;
			
			hotelGuests.Due_To_Arrive_Adult= data.hotelGuests.Due_To_Arrive_Adult;
			hotelGuests.Due_To_Arrive_Children= data.hotelGuests.Due_To_Arrive_Children;
			
			hotelGuests.Staying_Over_Adult= data.hotelGuests.Staying_Over_Adult;
			hotelGuests.Staying_Over_Children= data.hotelGuests.Staying_Over_Children;
		
			
			hotelGuests.Current_In_House = data.hotelGuests.Current_In_House;
			hotelGuests.Due_To_Checkout = data.hotelGuests.Due_To_Checkout;
			hotelGuests.Staying_Over = data.hotelGuests.Staying_Over;
			hotelGuests.Due_To_Arrive = data.hotelGuests.Due_To_Arrive ;
			hotelGuests.Expected_In_House =data.hotelGuests.Expected_In_House ;
			hotelGuests.Expected_In_House_Adult = data.hotelGuests.Expected_In_House_Adult;
			hotelGuests.Expected_In_House_Children = data.hotelGuests.Expected_In_House_Children;
			
			
			hotelGuestsCharts = {
				Current_In_Adult: 0
				, Current_In_Children: 0
				, Due_To_Checkout_Adult: 0
				, Due_To_Checkout_Children: 0
				, Staying_Over_Adult: 0
				, Staying_Over_Children: 0
				, Due_To_Arrive_Adult: 0
				, Due_To_Arrive_Children: 0
				, Expected_In_House_Adult: 0
				, Expected_In_House_Children: 0
			};
			
			

			hotelGuestsCharts.Current_In_Adult = hotelGuests.Current_In_Adult;
			hotelGuestsCharts.Current_In_Children = hotelGuests.Current_In_Children;

			hotelGuestsCharts.Due_To_Checkout_Adult = hotelGuests.Due_To_Checkout_Adult;
			hotelGuestsCharts.Due_To_Checkout_Children = hotelGuests.Due_To_Checkout_Children;

			hotelGuestsCharts.Staying_Over_Adult = hotelGuests.Staying_Over_Adult;
			hotelGuestsCharts.Staying_Over_Children = hotelGuests.Staying_Over_Children;

			hotelGuestsCharts.Due_To_Arrive_Adult = hotelGuests.Due_To_Arrive_Adult;
			hotelGuestsCharts.Due_To_Arrive_Children = hotelGuests.Due_To_Arrive_Children;

			hotelGuestsCharts.Expected_In_House_Adult = hotelGuests.Expected_In_House_Adult;
			hotelGuestsCharts.Expected_In_House_Children = hotelGuests.Expected_In_House_Children;

			$scope.hotelGuests = hotelGuests;
			$scope.roomInventory = hotelInventory;
			$scope.todayActivity = todayActivity;
			$scope.todayStats = todayStats;
			var ktodayStats = [];
			for (var idx in todayStats) {
				var item = {
					category: idx
					, value: todayStats[idx]
				};
				ktodayStats.push(item);
			}
			$scope.houseKeeping = houseKeeping;
			showTodayChart(ktodayStats);
			showRoomInventoryChart();
			showGuestChart();
			showHouseKeepingChart();
			showFutureInventory();
			showRevenueRoomCheckout();
			
		})	;
		
	}

	function today(td) {
		console.log('td:',td, td.getDate());
		var d = new Date();
		return td.getDate() == d.getDate() && td.getMonth() == d.getMonth() && td.getFullYear() == d.getFullYear();
	}

	function showGuestChart() {
		var data = [];

		var item = [{
				name: $filter("translate")('ADULT')
				, data: [hotelGuestsCharts.Current_In_Adult






                    
					, hotelGuestsCharts.Due_To_Checkout_Adult






                    
					, hotelGuestsCharts.Staying_Over_Adult






                    
					, hotelGuestsCharts.Due_To_Arrive_Adult






                    
					, hotelGuestsCharts.Expected_In_House_Adult
                      ]
            }, {
				name: $filter("translate")('CHILDREN')
				, data: [hotelGuestsCharts.Current_In_Children






                    
					, hotelGuestsCharts.Due_To_Checkout_Children






                    
					, hotelGuestsCharts.Staying_Over_Children






                    
					, hotelGuestsCharts.Due_To_Arrive_Children






                    
					, hotelGuestsCharts.Expected_In_House_Children
                      ]
            }
                ];

		data = item;


		$("#hotelGuests").kendoChart({
			title: {
				text: $filter("translate")("HOTEL_GUESTS")
			}
			, legend: {
				position: "bottom",

			}
			, valueAxis: {
				labels: {
					format: "{0}"
				}
				, line: {
					visible: false
				}
				, axisCrossingValue: 0
			}
			, tooltip: {
				visible: true
				, format: "{0}%"
				, template: "#= series.name #: #= value #"
			}
			, categoryAxis: {
				categories: [$filter("translate")("STATIS_CURRENT_IN_HOUSE")






                    
					, $filter("translate")("STATIS_DUE_TO_CHECKOUT")






                    
					, $filter("translate")("STATIS_STAYING_OVER")






                    
					, $filter("translate")("STATIS_DUE_TO_ARRIVE")






                    
					, $filter("translate")("STATIS_EXPECTED_IN_HOUSE")






                    
					, ],

				line: {
					visible: false
				}
				, labels: {
					padding: {
						top: 30
					}
					, rotation: {
						angle: -45
						, align: "center"
					}
				}
			}
			, series: data
		});


	}

	function showTodayChart() {

		var data = [];
		for (var idx in todayActivity) {
			var trans_idx = 'STATIS_' + idx.toUpperCase();
			var item = {
				category: $filter("translate")(trans_idx)
				, value: todayActivity[idx]
			};

			if (idx == "Arrived")
				item.explode = true;
			data.push(item);
		}
		$("#todaychart").kendoChart({
			title: {
				position: "top"
				, text: $filter("translate")("TODAY_ACTIVITY_COUNT")
			}
			, legend: {
				position: "right"
				, labels: {
					template: "${text}: ${value}"
				}
			}
			, dataSource: {
				data: data
			}
			, series: [{
				type: "pie"
				, field: "value"
				, categoryField: "category"
				, explodeFields: "explode"

                }]
			, tooltip: {
				visible: true
				, template: "${ category } - ${ value }"
			}
		});


	}

	function showRoomInventoryChart() {
		var data = [];

		for (var idx in hotelInventory) {
			var trans_idx = 'STATIS_' + idx.toUpperCase();
			var item = {
				category: $filter("translate")(trans_idx)
				, value: hotelInventory[idx]
			};
			if (idx == "Arrived")
				item.explode = true;
			data.push(item);
		}
		$("#roomInventory").kendoChart({
			title: {
				text: $filter("translate")("ROOM_INVENTORY")
			}
			, legend: {
				position: "bottom"
				, labels: {
					template: "${text}: ${value}"
				}
			}
			, dataSource: {
				data: data
			}
			, series: [{
				type: "donut"
				, field: "value"
				, categoryField: "category"
				, explodeFields: "explode"

                }]
			, tooltip: {
				visible: true
				, template: "${ category } - ${ value }"
			}
		});


	}

	function showHouseKeepingChart() {
		var data = [];

		for (var idx in houseKeeping) {
			var trans_idx = 'STATIS_' + idx.toUpperCase();
			var item = {
				name: $filter("translate")(trans_idx)
				, data: [houseKeeping[idx]]
			};
			data.push(item);
		}
		$("#houseKeeping").kendoChart({
			title: {
				text: $filter("translate")("HOUSE_KEEPING")
			}
			, legend: {
				position: "bottom",

			}
			, valueAxis: {
				labels: {
					format: "{0}"
				}
				, line: {
					visible: false
				}
				, axisCrossingValue: 0
			}
			, categoryAxis: {
				//categories: [(new Date()).format("dd/mm/yyyy")],
				line: {
					visible: false
				}
				, labels: {
					padding: {
						top: 30
					}
				}
			}
			, series: data
			, tooltip: {
				visible: true
				, template: "${value}"
			}
		});


	}
}]);