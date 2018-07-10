ezCloud.factory("reportFactory", ['$http', '$state', 'dialogService', '$localStorage', '$rootScope', '$location', '$mdSidenav', 'loginFactory', '$sessionStorage', function ($http, $state, dialogService, $localStorage, $rootScope, $location, $mdSidenav, loginFactory, $sessionStorage) {
	var menu =
		{
			url: '/reports',
			icon: 'img/icons/ic_event_note_24px.svg',
			name: 'REPORTS',
			color: 'olive',
			isFirst:true,
			submenus:[
			        {
			            name:'RESERVATION_GROUP_REPORT',
			            submenus:[
			                    {
			                    	url: '/reports/ArrivalList',
			                    	icon: 'img/icons/ic_flight_land_24px.svg',
			                        name:'ARRIVAL_LIST_REPORT',
									code:'ARRIVAL_LIST_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
									isCheck:false
			                    },
			                    {
			                    	url: '/reports/CheckinList',
			                    	icon: 'img/icons/ic_input_24px.svg',
			                        name:'CHECKIN_LIST',
									code:'GUEST_CHECKEDIN_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
			                    {
			                    	url: '/reports/DepartureList',
			                    	icon: 'img/icons/ic_flight_takeoff_24px.svg',
			                        name:'DEPARTURE_LIST_REPORT',
									code:'DEPARTURE_LIST_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
			                    {
			                    	url: '/reports/CheckoutList',
			                    	icon: 'img/icons/ic_exit_to_app_24px.svg',
			                        name:'CHECKOUT_LIST',
									code:'GUEST_CHECKEDOUT_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
			                    {
			                    	url: '/reports/GuestList',
			                    	icon: 'img/icons/ic_supervisor_account_24px.svg',
			                        name:'GUEST_LIST_REPORT',
									code:'INHOUSE_GUEST_LIST_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    }
			                    
			                    
			                ]
			        },
			        {
			            name:'FRONT_OFFICE_GROUP_REPORT',
			            submenus:
			                [
			                    {
			                    	url: '/reports/NightAudit',
			                    	icon: 'img/icons/ic_check_24px.svg',
			                        name:'NIGHT_AUDIT_REPORT',
									code:'NIGHT_AUDIT_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
			                    {
			                    	url: '/reports/InvoiceListReport',
			                    	icon: 'img/icons/ic_view_list_24px.svg',
			                        name:'INVOICE_LIST_REPORT',
									code:'CHECKOUT_REVENUE_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
			                    {
			                    	url: '/reports/DailyReceipt',
			                    	icon: 'img/icons/ic_receipt_24px.svg',
			                        name:'DAILY_RECEIPT',
									code:'DAILY_RECEIPT_REPORT',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
                                {
			                    	url: '/reports/RoomBreakfastPlan',
			                    	icon: 'img/icons/ic_wb_sunny_black_24px.svg',
			                        name:'ROOM_BREAKFAST_PLAN',
									code:'ROOM_BREAKFAST_PLAN',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER','ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
                                {
			                    	url: '/reports/CityLedgerDetail',
			                    	icon: 'img/icons/ic_brightness_low_black_24px.svg',
			                        name:'CITY_LEDGER_DETAIL',
									code:'CITY_LEDGER_DETAIL',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    },
                                {
			                    	url: '/reports/CityLedgerSummary',
			                    	icon: 'img/icons/ic_brightness_high_black_24px.svg',
			                        name:'CITY_LEDGER_SUMMARY',
									code:'CITY_LEDGER_SUMMARY',
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    }, 
			                    {
			                    	url: '/reports/InHouseGuestForPA18List',
			                    	icon: 'img/icons/ic_contacts_black_24px.svg',
			                        name:'GUEST_LIST_TO_PA18_REPORT',
									code:'GUEST_LIST_TO_PA18_REPORT', 
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false 
								},
                                {
			                    	url: '/reports/DiscountReport',
			                    	icon: 'img/icons/ic_file_download_24px.svg',
			                        name:'DISCOUNT_REPORT',
									code:'DISCOUNT_REPORT', 
									roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
			                        isCheck:false
			                    } 


					]
				},
				{
					name: 'AUDIT_GROUP_REPORT',
					roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
					submenus:
						[
							// {
							// 	url: '',
							// 	icon: 'img/icons/ic_check_24px.svg',
							//     name:'AUDIT_TRAILS_RESERVATION',
							//     code:'AUDIT_TRAILS_RESERVATION',
							//     isCheck:false
							// },
							// {
							// 	url: '',
							// 	icon: 'img/icons/ic_check_24px.svg',
							//     name:'AUDIT_TRIALS_CONFIG',
							//     code:'AUDIT_TRIALS_CONFIG',
							//     isCheck:false
							// },
							{
								url: '/reports/PastCheckoutList',
								icon: 'img/icons/ic_alarm_off_24px.svg',
								name: 'PAST_CHECKOUT',
								code: 'CHECKOUT_AUDIT_REPORT',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/reports/PreCheckinList',
								icon: 'img/icons/ic_reply_24px.svg',
								name: 'PRE_CHECKIN_LIST',
								code: 'PRE_CHECKIN_LIST',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/reports/PreCheckoutList',
								icon: 'img/icons/ic_reply_all_24px.svg',
								name: 'PRE_CHECKOUT_LIST',
								code: 'PRE_CHECKOUT_LIST',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/reports/SmartCardList',
								icon: 'img/icons/ic_payment_24px.svg',
								name: 'SMART_CARD_HISTORY_REPORT',
								code: 'SMART_CARD_HISTORY_REPORT',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/reports/VoidReports',
								icon: 'img/icons/ic_delete_sweep_black_24px.svg',
								name: 'VOID_REPORT',
								code: 'VOID_REPORT',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/logs',
								icon: 'img/icons/ic_history_black_24px.svg',
								name: 'RESERVATION_LOG',
								code: 'LOG',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							},
							{
								url: '/configurationLogs',
								icon: 'img/icons/ic_bug_report_24px.svg',
								name: 'CONFIGURATION_LOGS',
								code: 'CONFIGURATION_LOGS',
								isCheck: false,
								roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
							}
						]
				},
				{
					name: 'BACK_OFFICE_GROUP_REPORT',
					submenus: [
						{
							url: '/reports/MaintainenceReport',
							icon: 'img/icons/ic_report_24px.svg',
							name: 'MAINTAINENCE_REPORT',
							code: 'MAINTAINENCE_REPORT',
							isCheck: false
						},
						{
							url: '/reports/RoomMoveReport',
							icon: 'img/icons/ic_directions_black_24px.svg',
							name: 'ROOM_MOVE_REPORT',
							code: 'ROOM_MOVE_REPORT',
							isCheck: false
						}

					]
				},
				{
					name: 'STATTISTICAL_GROUP_REPORT',
					roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
					submenus: [
						{
							url: '/reports/RoomSalesForecast',
							icon: 'img/icons/ic_subtitles_black_24px.svg',
							name: 'ROOM_SALES_FORECAST',
							code: 'ROOM_SALES_FORECAST',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
							isCheck: false
						},
						{
							url: '/reports/InventoryByRoomType',
							icon: 'img/icons/ic_view_quilt_black_24px.svg',
							name: 'INVENTORY_BY_ROOMTYPE',
							code: 'INVENTORY_BY_ROOMTYPE',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
							isCheck: false
						},
						{
							url: '/reports/BusinessAnalysisDetail',
							icon: 'img/icons/ic_event_note_black_24px.svg',
							name: 'BUSINESS_ANALYSIS_DETAIL',
							code: 'BUSINESS_ANALYSIS_DETAIL',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
							isCheck: false
						},
						{
							url: '/reports/BusinessAnalysisSummary',
							icon: 'img/icons/ic_assessment_24px.svg',
							name: 'BUSINESS_ANALYSIS_SUMMARY',
							code: 'BUSINESS_ANALYSIS_SUMMARY',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
							isCheck: false
						}
					]
				},
				{
					name: 'HOUSE_KEEPING_GROUP_REPORT',
					submenus: [
						{
							url: '/reports/DailyExtraCharge',
							icon: 'img/icons/ic_format_line_spacing_24px.svg',
							name: 'DAILY_EXTRA_CHARGE',
							code: 'DAILY_EXTRA_CHARGE_REPORT',
							isCheck: false
						},
						{
							url: '/reports/DailyExtraChargeSummary',
							icon: 'img/icons/ic_queue_black_24px.svg',
							name: 'DAILY_EXTRA_CHARGE_SUMMARY',
							code: 'DAILY_EXTRA_CHARGE_SUMMARY_REPORT',
							isCheck: false
						}
					]
				},
				{
					name: 'GRAPHS_AND_CHART_GROUP_REPORT',
					roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
					submenus: [

						{
							url: '/reports/CompareRoomTypeRevenue',
							icon: 'img/icons/ic_show_chart_black_24px.svg',
							name: 'COMPARE_REVENUE_ROOMTYPE_REPORT',
							code: 'COMPARE_REVENUE_ROOMTYPE_REPORT',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
							isCheck: false
						}
					]
				},
				{
					name: 'REPORT_EXPENDITURE',
					roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER','ROLE_HOTEL_STAFF'],
					submenus: [
						{
							url: '/invoiceReport001',
							icon: 'img/icons/ic_format_line_spacing_24px.svg',
							name: 'TINH_HINH_THU_CHI',
							code: 'TINH_HINH_THU_CHI',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
							isCheck: false
						},
						{
							url: '/invoiceReport003',
							icon: 'img/icons/ic_view_day_24px.svg',
							name: 'BIEN_BAN_BAN_GIAO_CA',
							code: 'BIEN_BAN_BAN_GIAO_CA',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER','ROLE_HOTEL_STAFF'],
							isCheck: false
						},
						{
							url: '/invoiceReport004',
							icon: 'img/icons/ic_trending_up_24px.svg',
							name: 'LOI_NHUAN',
							code: 'LOI_NHUAN',
							roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
							isCheck: false
						}
					]
				},
				{
					name: 'MORE',
					url: '/reportsMore',
					icon: 'img/icons/ic_more_24px.svg'
				},
			]
		};

	function getReportAPI() {
		var getReport = loginFactory.securedGet("api/configreports/GetConfig");
		$rootScope.dataLoadingPromise = getReport;
		return getReport;
	};
	//
	function changeMenuReport() {
		var t = getReportAPI();
		t.success(function (data) {
			if (data.List.length > 0) {
				$rootScope.menuReport.isFirst = false;
				//
				angular.forEach($rootScope.menuReport.submenus, function (arr) {
					angular.forEach(arr.submenus, function (arr1) {
						angular.forEach(data.List, function (tmp) {
							if (tmp.ReportCode == arr1.code) {
								arr1.isCheck = true;
							}
						})
					})
				});
			} else {
				$rootScope.menuReport.isFirst = true;
			}
			$localStorage.menuReport = $rootScope.menuReport;
		});
	};

	function setUncheck() {
		angular.forEach(menu.submenus, function (arr) {
			angular.forEach(arr.submenus, function (arr1) {
				arr1.isCheck = false;
			})
		})
	}
	return {
		getReport: function (callback) {
			var report = getReportAPI();
			report.success(function (data) {
				if (callback) callback(data);
			});
		},
		UpdateReport: function (data, callback) {
			var UpdateReport = loginFactory.securedPostJSON("api/configreports/updateConfig", data);
			$rootScope.dataLoadingPromise = UpdateReport;
			UpdateReport.success(function (data) {
				if (callback) callback(data);


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
		CheckReport: function () {
			setUncheck();
			$rootScope.menuReport = menu;
			changeMenuReport();

		}

	}
}]);