ezCloud.factory("CMFactory", ['$http', 'loginFactory', '$rootScope', '$filter', '$mdDialog', 'dialogService', 'reservationFactory', '$timeout', '$mdMedia', 'configFactory', 'smartCardFactory', 'roomListFactory', '$q', '$state', function ($http, loginFactory, $rootScope, $filter, $mdDialog, dialogService, reservationFactory, $timeout, $mdMedia, configFactory, smartCardFactory, roomListFactory, $q, $state) {
    var CMApiUrlRoot = "http://localhost:3001/";
    var allCMData = null;
    return {
        getCMConfiguration: function () {
            var getCMConfiguration = loginFactory.securedGet("api/ChannelManager/AllChannelManagerData", "");
            return getCMConfiguration;
        },
        get_CMRoomTypeMappings_CMRoomTypes: function (callback) {
            var testPromise = loginFactory.securedGet("api/ChannelManager/AllChannelManagerRoomTypeMapping");
            $rootScope.dataLoadingPromise = testPromise;
            testPromise.success(function (data) {
                if (data == "CM_HOTEL_IS_NOT_REGISTER") {
                    DialogSuggest();
                    return;
                }
                //console.log("DATA", JSON.parse(data.CMRoomTypes.Result).roomresponse.error);

                var channelListTemp = [];
                var allIdStr = "";
                var isRanking = 0; //0: null , 1: true , 2: false
                var CMRoomTypeMappings_CMRoomTypes = {};
                var typeCms = $rootScope.dataCMS;
                CMRoomTypeMappings_CMRoomTypes.CMRoomTypes = {};
                if (data.CMIsRanking != null && data.CMIsRanking != undefined) {
                    isRanking = data.CMIsRanking == false ? 2 : 1;
                }
                if (data.CMRoomTypes != null) {
                    if (data.CMRoomTypes.Result) {
                        if (JSON.parse(data.CMRoomTypes.Result).roomresponse) {
                            if (JSON.parse(data.CMRoomTypes.Result).roomresponse.error == 4) {
                                dialogService.messageBox("ERROR", "INVALID_HOTEL_ID_OR_USERNAME_OR_PASSWORD");
                                return;
                            }
                        }
                        if (typeCms != 'CMSITEMINDER') {
                            CMRoomTypeMappings_CMRoomTypes.CMRoomTypes = JSON.parse(data.CMRoomTypes.Result).roomresponse.rooms.room;
                            allIdStr = JSON.parse(data.CMRoomTypes.Result).roomresponse.rooms.room;
                            if (JSON.parse(data.CMRoomTypes.Result).channels != undefined) {
                                channelListTemp = JSON.parse(data.CMRoomTypes.Result).channels.listChannel;
                            }
                        } else {
                            CMRoomTypeMappings_CMRoomTypes.CMRoomTypes = JSON.parse(data.CMRoomTypes.Result);
                        }
                    }
                }
                CMRoomTypeMappings_CMRoomTypes.CMRoomTypeMappings = data.CMRoomTypeMappings;
                var data = angular.copy(CMRoomTypeMappings_CMRoomTypes);
                var result = [];
                var cmRoomTypes_AlreadyMappings = {};
                var roomPrice_rate_mappedList = [];
                if (data.CMRoomTypes != null) {
                    for (var roomTypeIndex in data.CMRoomTypes) {
                        if (data.CMRoomTypes.hasOwnProperty(roomTypeIndex)) {
                            cmRoomTypes_AlreadyMappings[data.CMRoomTypes[roomTypeIndex].room_id] = {
                                CMRoomTypeName: data.CMRoomTypes[roomTypeIndex].room_name,
                                RoomTypeMapped: null,
                                CMRoomTypeMapping: null
                            };
                            for (var index in data.CMRoomTypeMappings) {
                                var roomTypeMappingTemp = data.CMRoomTypeMappings[index];
                                if (roomTypeMappingTemp.cmrt != null && roomTypeMappingTemp.cmrt.length > 0) {
                                    for (var index2 in roomTypeMappingTemp.cmrt) {
                                        if (roomTypeMappingTemp.cmrt[index2].CMRoomTypeId == data.CMRoomTypes[roomTypeIndex].room_id) {
                                            cmRoomTypes_AlreadyMappings[data.CMRoomTypes[roomTypeIndex].room_id].RoomTypeMapped = roomTypeMappingTemp.rt;
                                            cmRoomTypes_AlreadyMappings[data.CMRoomTypes[roomTypeIndex].room_id].CMRoomTypeMapping = roomTypeMappingTemp.cmrt[index2];
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    } // End
                }
                // Build roomPrice_rate_mappedList
                if (data.CMRoomTypeMappings != null && data.CMRoomTypeMappings.length > 0) {
                    for (var index in data.CMRoomTypeMappings) {
                        var currentRoomTypeMapping = data.CMRoomTypeMappings[index];
                        var currentRoomType = currentRoomTypeMapping.rt;
                        var currentCMRT = currentRoomTypeMapping.cmrt;
                        roomPrice_rate_mappedList[currentRoomType.RoomTypeId] = [];
                        if (currentRoomTypeMapping.RoomPricesList != null && currentRoomTypeMapping.RoomPricesList.length > 0) {
                            for (var roomPriceIndex in currentRoomTypeMapping.RoomPricesList) {
                                var roomPriceTemp = currentRoomTypeMapping.RoomPricesList[roomPriceIndex];
                                var rateMappedTemp = {
                                    RoomPrice: roomPriceTemp,
                                    CMRoomRateMapping: null,
                                    MappedToRate: null,
                                    AvailableRateMapping: null,
                                    CMRoomTypeMapping: currentCMRT
                                };
                                if (currentRoomTypeMapping.CMRoomRateMappingsList.length > 0) {
                                    for (var roomRateIndex in currentRoomTypeMapping.CMRoomRateMappingsList) {
                                        var roomRateMappingTemp = currentRoomTypeMapping.CMRoomRateMappingsList[roomRateIndex];
                                        if (roomRateMappingTemp.RoomPriceId == roomPriceTemp.RoomPriceId && roomRateMappingTemp.RoomTypeId == roomPriceTemp.RoomTypeId) {
                                            rateMappedTemp.CMRoomRateMapping = roomRateMappingTemp;
                                            break;
                                        }
                                    }
                                }
                                if (data.CMRoomTypes != null && data.CMRoomTypes.length > 0) {
                                    for (var roomTypeIndex in data.CMRoomTypes) {
                                        var cmRoomTypeTemp = data.CMRoomTypes[roomTypeIndex];
                                        var room_id = cmRoomTypeTemp.room_id;
                                        if (currentRoomTypeMapping.cmrt != null && currentRoomTypeMapping.cmrt.length > 0) {
                                            if (cmRoomTypeTemp.room_id == currentRoomTypeMapping.cmrt[0].CMRoomTypeId) {
                                                if (rateMappedTemp.CMRoomRateMapping != null) {
                                                    for (var rateIndex in cmRoomTypeTemp.rates) {
                                                        var rateTemp = cmRoomTypeTemp.rates[rateIndex];
                                                        if (rateTemp.rate_id == rateMappedTemp.CMRoomRateMapping.CMRoomRateId) {
                                                            rateMappedTemp.MappedToRate = rateTemp;
                                                            //rateMappedTemp.MappedToRate.RoomPriceMappedId = rateMappedTemp.RoomPrice.RoomPriceId;
                                                            //rateMappedTemp.MappedToRate.RoomPriceMappedName = rateMappedTemp.RoomPrice.RoomPriceName;
                                                            break;
                                                        }
                                                    }
                                                }
                                                rateMappedTemp.AvailableRateMapping = cmRoomTypeTemp.rates
                                                break;
                                            }
                                        }
                                    }
                                }
                                var availableList = angular.copy(rateMappedTemp.AvailableRateMapping);
                                if (availableList != null && availableList.length > 0) {
                                    for (var rateMappedIndex in availableList) {
                                        var availableTemp = availableList[rateMappedIndex];
                                        availableTemp.RoomPriceMappedId = null;
                                        availableTemp.RoomPriceMappedName = null;
                                        if (data.CMRoomTypeMappings != null && data.CMRoomTypeMappings.length > 0) {
                                            for (var roomTypeMappingIndex in data.CMRoomTypeMappings) {
                                                var cmRoomTypeMappingTemp = data.CMRoomTypeMappings[roomTypeMappingIndex];
                                                if (cmRoomTypeMappingTemp.rt !== null && cmRoomTypeMappingTemp.rt.RoomTypeId == rateMappedTemp.RoomPrice.RoomTypeId) {
                                                    if (cmRoomTypeMappingTemp.CMRoomRateMappingsList != null && cmRoomTypeMappingTemp.CMRoomRateMappingsList.length > 0) {
                                                        for (var index in cmRoomTypeMappingTemp.CMRoomRateMappingsList) {
                                                            if (cmRoomTypeMappingTemp.CMRoomRateMappingsList[index].CMRoomRateId == availableTemp.rate_id) {
                                                                availableTemp.RoomPriceMappedId = cmRoomTypeMappingTemp.CMRoomRateMappingsList[index].RoomPriceId;
                                                                if (cmRoomTypeMappingTemp.RoomPricesList != null && cmRoomTypeMappingTemp.RoomPricesList.length > 0) {
                                                                    var priceTemp = _.filter(cmRoomTypeMappingTemp.RoomPricesList, function (item) {
                                                                        return item.RoomPriceId == availableTemp.RoomPriceMappedId;
                                                                    });
                                                                    if (priceTemp != null && priceTemp.length > 0) {
                                                                        availableTemp.RoomPriceMappedName = priceTemp[0].RoomPriceName;
                                                                    }
                                                                }
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        console.log("available", availableTemp);
                                        //rateMappedTemp.AvailableRateMapping[rateMappedIndex] = availableTemp;
                                        //console.log("rateMappedTemp.AvailableRateMapping[rateMappedIndex]", rateMappedIndex, rateMappedTemp.AvailableRateMapping[rateMappedIndex]);
                                    }
                                    console.log("rate map temp", availableList, rateMappedTemp.AvailableRateMapping);
                                }
                                delete rateMappedTemp.AvailableRateMapping;
                                rateMappedTemp.AvailableRateMapping = availableList

                                roomPrice_rate_mappedList[currentRoomType.RoomTypeId].push(rateMappedTemp);
                            }
                        }

                    }
                }
                if (data.CMRoomTypeMappings != null && data.CMRoomTypeMappings.length > 0) {
                    for (var index in data.CMRoomTypeMappings) {
                        var roomTypeMappingTemp = data.CMRoomTypeMappings[index];
                        var resultTemp = {};
                        resultTemp.RoomType = roomTypeMappingTemp.rt;
                        resultTemp.MappedTo = roomTypeMappingTemp.cmrt;
                        resultTemp.AvailableRoomTypeMapping = cmRoomTypes_AlreadyMappings;

                        for (var index in roomPrice_rate_mappedList) {
                            if (index == resultTemp.RoomType.RoomTypeId) {
                                resultTemp.RoomPrice_Rate_MappedList = roomPrice_rate_mappedList[index];
                            }
                        }
                        result.push(resultTemp);
                    }
                    console.log("CMFactory Data", result);
                    result.push(isRanking);
                    result.push(allIdStr);
                    result.push(channelListTemp);
                    if (callback) {
                        callback(result);
                    }
                }
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message);
                }
            });
        },
        getCMRoomTypes: function () {
            var hotelId = $rootScope.HotelSettings.HotelId;
            var data = {
                hotel_id: hotelId
            };
            var post = $http({
                url: CMApiUrlRoot + "get_mapped_room",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data
            });
            return post;
        },
        getCMRoomTypeMappings: function (callback) {
            var getCMRoomTypeMappings = loginFactory.securedGet("api/ChannelManager/AllChannelManagerRoomTypeMapping", "");
            getCMRoomTypeMappings.success(function (data) {
                if (callback) callback(data);
            }).error(function (err) {
                console.log(err);
            })
            //return getCMRoomTypeMappings;
        },
        getAvailabilityMatrixData: function (from, to, callback) {
            var f = from.format("yyyy-mm-dd");
            var t = to.format("yyyy-mm-dd");
            var getAvailabilityMatrixData = loginFactory.securedGet("api/ChannelManager/GetAvailabilityMatrixData", "from=" + f + "&&to=" + t);
            $rootScope.dataLoadingPromise = getAvailabilityMatrixData;
            getAvailabilityMatrixData.success(function (data) {
                var avMatrixData = {};
                var avMatrixDataTemp = angular.copy(data);
                avMatrixData.CMConfiguration = avMatrixDataTemp.CMConfiguration;
                // Build Room Types Data for avMatrixData
                var roomTypes = [];
                if (avMatrixDataTemp != null && avMatrixDataTemp.cmRoomTypeMapping != null && avMatrixDataTemp.cmRoomTypeMapping.length > 0) {
                    for (var index in avMatrixDataTemp.cmRoomTypeMapping) {
                        var roomTypeMapping = avMatrixDataTemp.cmRoomTypeMapping[index];
                        if (roomTypeMapping.rt != null && roomTypeMapping.cmrt != null && roomTypeMapping.cmrt.length > 0) {
                            var roomType = {
                                RoomTypeId: roomTypeMapping.rt.RoomTypeId,
                                RoomTypeName: roomTypeMapping.rt.RoomTypeName,
                                RoomTypeCode: roomTypeMapping.rt.RoomTypeCode,
                                CMRoomTypeId: roomTypeMapping.cmrt[0].CMRoomTypeId,
                                CMRoomTypeName: roomTypeMapping.cmrt[0].CMRoomTypeName,
                                CMRoomTypeMappingId: roomTypeMapping.cmrt[0].CMRoomTypeMappingId,
                                NumberPrioritize: roomTypeMapping.cmrt[0].NumberPrioritize
                            }
                            roomTypes.push(roomType);
                        }
                    }
                }
                avMatrixData.Channels = avMatrixDataTemp.Channels;
                avMatrixData.roomTypes = roomTypes;

                // Build Day List for avMatrixData
                var weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'],
                    months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
                    days = [],
                    cmAvailabilityMatrix = data.cmAvailabilityMatrix,
                    RoomAvailabilityMatrix = data.RoomAvailabilityMatrix,
                    dayList = getDates(from, to);
                if (dayList.length > 0){
                    for (var index in dayList){
                        var dayTemp = dayList[index],
                            weekday = weekdays[dayTemp.getDay()],
                            month = months[dayTemp.getMonth()],
                            dayOfMonth = dayTemp.getDate(),
                            dayDate = new Date(dayTemp.getFullYear(), dayTemp.getMonth(), dayTemp.getDate()),
                            isWeekend = dayTemp.getDay() == 0 || dayTemp.getDay() == 6

                        var eachDay = {
                            day: dayDate,
                            weekday: weekday,
                            dayOfMonth: dayOfMonth,
                            month: month,
                            isWeekend: isWeekend,
                            RoomTypes: []
                        }

                        for (var roomTypeIndex in avMatrixData.roomTypes){
                            var roomTypeTemp = {
                                RoomTypeId: avMatrixData.roomTypes[roomTypeIndex].RoomTypeId,
                                CMRoomTypeMappingId: avMatrixData.roomTypes[roomTypeIndex].CMRoomTypeMappingId,
                                CMAvailabilityMatrixId: 0,
                                CanBeSold: null,
                                Available: 0,
                                Channels: {},
                                StopSell: false
                            }
                            if (RoomAvailabilityMatrix.length > 0){
                                for (var matrixIndex in RoomAvailabilityMatrix){
                                    var avMatrixTemp = RoomAvailabilityMatrix[matrixIndex];
                                    if (avMatrixTemp.Dates){
                                        avMatrixTemp.Dates = new Date(avMatrixTemp.Dates);
                                    }
                                    var avMatrixDate = new Date(avMatrixTemp.Dates.getFullYear(), avMatrixTemp.Dates.getMonth(), avMatrixTemp.Dates.getDate());
                                    if (avMatrixDate.getTime() == dayDate.getTime()){
                                            if (avMatrixTemp.RoomTypeId == avMatrixData.roomTypes[roomTypeIndex].RoomTypeId){
                                                roomTypeTemp.Available = avMatrixTemp.CanBeSold;
                                                break;
                                            }
                                    }
                                }
                            }
                            if (cmAvailabilityMatrix.length > 0){
                                for (var avIndex in cmAvailabilityMatrix){
                                    var avTemp = cmAvailabilityMatrix[avIndex];
                                    if (avTemp.MatrixDate){
                                        avTemp.MatrixDate = new Date(avTemp.MatrixDate);
                                    };
                                    var avDate = new Date(avTemp.MatrixDate.getFullYear(), avTemp.MatrixDate.getMonth(), avTemp.MatrixDate.getDate());
                                    if (avDate.getTime() == dayDate.getTime()){
                                            if (avTemp.CMRoomTypeMappingId == avMatrixData.roomTypes[roomTypeIndex].CMRoomTypeMappingId){
                                                var tmp = (avTemp.ChannelStopSell==null)?[]:avTemp.ChannelStopSell.split(",");
                                                var tmpO = {};
                                                for ( i in tmp ){
                                                    var val = tmp[i];
                                                    tmpO[val] = val;
                                                }
                                                roomTypeTemp.CanBeSold = avTemp.CanBeSold;
                                                roomTypeTemp.Channels = tmpO;
                                                roomTypeTemp.ChannelsArr = tmp;
                                                roomTypeTemp.ChannelString = avTemp.ChannelStopSell;
                                                roomTypeTemp.StopSell = avTemp.StopSell;
                                                roomTypeTemp.CMAvailabilityMatrixId = avTemp.CMAvailabilityMatrixId;
                                                break;
                                            }
                                    }
                                }
                            }



                           eachDay.RoomTypes.push(roomTypeTemp);
                        }
                        days.push(eachDay);
                    }

                }
                avMatrixData.days = days;
				if (data.IsKeepRanking != null && data.IsKeepRanking != undefined){
                    avMatrixData.IsKeepRanking = data.IsKeepRanking;
                    avMatrixData.IsShowKeepRanking = true;
                }
                else{
                    avMatrixData.IsShowKeepRanking = false;
                }
                console.log("avMatrixData", avMatrixData);
                if (callback) callback(avMatrixData);

            }).error(function(err) {
                console.log(err);
            });
        },
        getAvailabilityMatrixDataBE: function(from, to, callback) {
            var f = from.format("yyyy-mm-dd");
            var t = to.format("yyyy-mm-dd");
            var getAvailabilityMatrixData = loginFactory.securedGet("api/BookingEngine/GetAvailabilityMatrixData", "from=" + f + "&&to=" + t);
            $rootScope.dataLoadingPromise=getAvailabilityMatrixData;
            getAvailabilityMatrixData.success(function(data) {
                var avMatrixData = {};
                var avMatrixDataTemp = angular.copy(data);
                avMatrixData.CMConfiguration = avMatrixDataTemp.CMConfiguration;
                // Build Room Types Data for avMatrixData
                var roomTypes = [];
                if (avMatrixDataTemp != null && avMatrixDataTemp.cmRoomTypeMapping != null && avMatrixDataTemp.cmRoomTypeMapping.length > 0){
                    for (var index in avMatrixDataTemp.cmRoomTypeMapping){
                        var roomTypeMapping = avMatrixDataTemp.cmRoomTypeMapping[index];
                        if (roomTypeMapping.rt != null && roomTypeMapping.cmrt != null && roomTypeMapping.cmrt.length > 0){
                            var roomType = {
                                RoomTypeId: roomTypeMapping.rt.RoomTypeId,
                                RoomTypeName: roomTypeMapping.rt.RoomTypeName,
                                RoomTypeCode: roomTypeMapping.rt.RoomTypeCode,
                                CMRoomTypeId: roomTypeMapping.cmrt[0].CMRoomTypeId,
                                CMRoomTypeName: roomTypeMapping.cmrt[0].CMRoomTypeName,
                                CMRoomTypeMappingId: roomTypeMapping.cmrt[0].CMRoomTypeMappingId,
                                NumberPrioritize: roomTypeMapping.cmrt[0].NumberPrioritize
                            }
                            roomTypes.push(roomType);
                        }
                    }
                }
                avMatrixData.Channels = avMatrixDataTemp.Channels;
                avMatrixData.roomTypes = roomTypes;

                // Build Day List for avMatrixData
                var weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
                    months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
                    days = [],
                    cmAvailabilityMatrix = data.cmAvailabilityMatrix,
                    RoomAvailabilityMatrix = data.RoomAvailabilityMatrix,
                    dayList = getDates(from, to);
                if (dayList.length > 0) {
                    for (var index in dayList) {
                        var dayTemp = dayList[index],
                            weekday = weekdays[dayTemp.getDay()],
                            month = months[dayTemp.getMonth()],
                            dayOfMonth = dayTemp.getDate(),
                            dayDate = new Date(dayTemp.getFullYear(), dayTemp.getMonth(), dayTemp.getDate()),
                            isWeekend = dayTemp.getDay() == 0 || dayTemp.getDay() == 6

                        var eachDay = {
                            day: dayDate,
                            weekday: weekday,
                            dayOfMonth: dayOfMonth,
                            month: month,
                            isWeekend: isWeekend,
                            RoomTypes: []
                        }

                        for (var roomTypeIndex in avMatrixData.roomTypes) {
                            var roomTypeTemp = {
                                RoomTypeId: avMatrixData.roomTypes[roomTypeIndex].RoomTypeId,
                                CMRoomTypeMappingId: avMatrixData.roomTypes[roomTypeIndex].CMRoomTypeMappingId,
                                CMAvailabilityMatrixId: 0,
                                CanBeSold: null,
                                Available: 0,
                                Channels: {},
                                StopSell: false
                            }
                            if (RoomAvailabilityMatrix.length > 0) {
                                for (var matrixIndex in RoomAvailabilityMatrix) {
                                    var avMatrixTemp = RoomAvailabilityMatrix[matrixIndex];
                                    if (avMatrixTemp.Dates) {
                                        avMatrixTemp.Dates = new Date(avMatrixTemp.Dates);
                                    }
                                    var avMatrixDate = new Date(avMatrixTemp.Dates.getFullYear(), avMatrixTemp.Dates.getMonth(), avMatrixTemp.Dates.getDate());
                                    if (avMatrixDate.getTime() == dayDate.getTime()) {
                                        if (avMatrixTemp.RoomTypeId == avMatrixData.roomTypes[roomTypeIndex].RoomTypeId) {
                                            roomTypeTemp.Available = avMatrixTemp.CanBeSold;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (cmAvailabilityMatrix.length > 0) {
                                for (var avIndex in cmAvailabilityMatrix) {
                                    var avTemp = cmAvailabilityMatrix[avIndex];
                                    if (avTemp.MatrixDate) {
                                        avTemp.MatrixDate = new Date(avTemp.MatrixDate);
                                    };
                                    var avDate = new Date(avTemp.MatrixDate.getFullYear(), avTemp.MatrixDate.getMonth(), avTemp.MatrixDate.getDate());
                                    if (avDate.getTime() == dayDate.getTime()) {
                                        if (avTemp.CMRoomTypeMappingId == avMatrixData.roomTypes[roomTypeIndex].CMRoomTypeMappingId) {
                                            var tmp = (avTemp.ChannelStopSell == null) ? [] : avTemp.ChannelStopSell.split(",");
                                            var tmpO = {};
                                            for (i in tmp) {
                                                var val = tmp[i];
                                                tmpO[val] = val;
                                            }
                                            roomTypeTemp.CanBeSold = avTemp.CanBeSold;
                                            roomTypeTemp.Channels = tmpO;
                                            roomTypeTemp.ChannelsArr = tmp;
                                            roomTypeTemp.ChannelString = avTemp.ChannelStopSell;
                                            roomTypeTemp.StopSell = avTemp.StopSell;
                                            roomTypeTemp.CMAvailabilityMatrixId = avTemp.CMAvailabilityMatrixId;
                                            break;
                                        }
                                    }
                                }
                            }
                            eachDay.RoomTypes.push(roomTypeTemp);
                        }
                        days.push(eachDay);
                    }
                }
                avMatrixData.days = days;
                if (data.IsKeepRanking != null && data.IsKeepRanking != undefined){
                    avMatrixData.IsKeepRanking = data.IsKeepRanking;
                    avMatrixData.IsShowKeepRanking = true;
                }
                else{
                    avMatrixData.IsShowKeepRanking = false;
                }
                    
                console.log("avMatrixData", avMatrixData);
                if (callback) callback(avMatrixData);
            }).error(function (err) {
                console.log(err);
            });
        },
        getAllRoomTypeIsMapped: function(callback) {
            var getAllRoomTypeIsMapped = loginFactory.securedGet("api/BookingEngine/GetAllRoomTypeIsMapped", "");
            $rootScope.dataLoadingPromise=getAllRoomTypeIsMapped;
            getAllRoomTypeIsMapped.success(function(data) {
                var allCountRoomTypeIdIsMapped = {};
                var allCountRoomTypeIdIsMapped = angular.copy(data);
                if (callback) callback(allCountRoomTypeIdIsMapped);
                return getAllRoomTypeIsMapped;
            }).error(function(err) {
                console.log(err);
            });
        },
        CMRegister: function (register) {
            CMRegister(register);
        },
        CMDeregister: function (CMConfiguration) {
            CMDeregister(CMConfiguration);
        },
        CMRoomTypes: function () {
            return CMRoomTypes();
        },
        processCMSearchReservation: function (search, callback) {
            var processCMSearchReservation = loginFactory.securedPostJSON("api/ChannelManager/SearchCMReservationProcess", search);
            $rootScope.dataLoadingPromise = processCMSearchReservation;
            processCMSearchReservation.success(function (data) {
                searchCMReservationListDataProcess(data);
                if (callback) callback(data);
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        UpdateCMRegister: function (CMConfiguration) {
            UpdateCMRegister(CMConfiguration);
        },
        removeCMRoomTypeMapping: function (CMRoomTypeMappingId, callback) {
            var removeCMRoomTypeMapping = loginFactory.securedPost("api/ChannelManager/RemoveCMRoomTypeMapping?CMRoomTypeMappingId=" + CMRoomTypeMappingId);
            $rootScope.dataLoadingPromise = removeCMRoomTypeMapping;
            removeCMRoomTypeMapping.success(function (data) {
                if(callback) callback(data);
            }).error(function (err) {
                dialogService.messageBox("ERROR", "CAN_NOT_REMOVE_CHANNEL_MANAGER");
            });
        },
        removeCMRoomRateMapping: function (CMRoomRateMappingId, callback) {
            var removeCMRoomRateMapping = loginFactory.securedPost("api/ChannelManager/RemoveCMRoomRateMapping?CMRoomRateMappingId=" + CMRoomRateMappingId);
            $rootScope.dataLoadingPromise = removeCMRoomRateMapping;
            removeCMRoomRateMapping.success(function (data) {
                if(callback) callback(data);
            }).error(function (err) {
                dialogService.messageBox("ERROR", "CAN_NOT_REMOVE_ROOM_RATE_CHANNEL_MANAGER");
            });
        },
        CheckHotelCMConfiguration: function () {
            CheckHotelCMConfiguration();
        }
    };

    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate))
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    function CMRegister(register) {
        if (register != null && register.CMUser != null && register.CMPassword != null && register.CMPropertyId != null && register.CMServiceUrl != null) {
            if ($rootScope.HotelSettings != null) {
                register.HotelId = $rootScope.HotelSettings.HotelId;
            }
            var data = {
                username: register.CMUser,
                password: register.CMPassword,
                hotelCode: register.CMPropertyId,
                service: register.CMServiceUrl,
                callback_url: "http://localhost/api/hotelbooking",
                // is_last_room_available:register.IsLastRoomAvailable,
                // source_id:register.SourceId,
                hotel_id: register.HotelId,
                typeCms: $rootScope.dataCMS
            };
            console.log('CM Register', data);
            var ChannelManagerRegister = loginFactory.securedPostJSON("api/ChannelManager/ChannelManagerRegister", data);
            $rootScope.dataLoadingPromise = ChannelManagerRegister;
            ChannelManagerRegister.success(function (data) {
                dialogService.toast("REGISTER_HOTEL_TO_CHANNEL_MANAGER_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }).error(function (err) {
                dialogService.messageBox("ERROR", err.Message);
            });

            // var data = {
            //     hotel_id: register.HotelId,
            //     username: register.CMUser,
            //     password: register.CMPassword,
            //     staah_hotel_id: register.CMPropertyId,
            //     callback_url: "http://localhost/api/hotelbooking",
            //     staah_service_url: register.CMServiceUrl
            // };
            // var post = $http({
            //     url: CMApiUrlRoot + "register",
            //     method: "POST",
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     data: data
            // });
            // post.then(function successCallback(response) {
            //     if (response.status == 200) {
            //         var ChannelManagerRegister = loginFactory.securedPostJSON("api/ChannelManager/ChannelManagerRegister", register);
            //         $rootScope.dataLoadingPromise = ChannelManagerRegister;
            //         ChannelManagerRegister.success(function(data) {
            //             dialogService.toast("REGISTER_HOTEL_TO_CHANNEL_MANAGER_SUCCESSFUL");
            //         }).error(function(err) {
            //             console.log(err);
            //         });
            //     }
            // }, function errorCallback(response) {
            //     if (response.status == 404) {
            //         dialogService.messageBox("ERROR", "CAN_NOT_REGISTER_HOTEL_TO_CHANNEL_MANAGER");
            //     }
            // });
        }
    }

    function CMDeregister(CMConfiguration) {
        if (CMConfiguration != null && CMConfiguration.CMUser != null && CMConfiguration.CMPassword != null && CMConfiguration.CMPropertyId != null && CMConfiguration.CMServiceUrl != null) {
            var data = {
                username: CMConfiguration.CMUser,
                password: CMConfiguration.CMPassword,
                hotelCode: CMConfiguration.CMPropertyId,
                service: CMConfiguration.CMServiceUrl,
                callback_url: "http://localhost/api/hotelbooking",
                hotel_id: CMConfiguration.HotelId,
                typeCms: CMConfiguration.TypeCms
            };
            var ChannelManagerDeregister = loginFactory.securedPostJSON("api/ChannelManager/ChannelManagerDeregister", data);
            $rootScope.dataLoadingPromise = ChannelManagerDeregister;
            ChannelManagerDeregister.success(function (data) {
                dialogService.toast("DEREGISTER_HOTEL_TO_CHANNEL_MANAGER_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }).error(function (err) {
                dialogService.messageBox("ERROR", "CAN_NOT_DEREGISTER_HOTEL_TO_CHANNEL_MANAGER");
            });
        }
    }

    function getCMRoomTypes() {
        var hotelId = $rootScope.HotelSettings.HotelId;
        var data = {
            hotel_id: hotelId
        };
        var post = $http({
            url: CMApiUrlRoot + "get_mapped_room",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        });
        return post;
    }

    function getCMRoomTypeMappings() {
        var getCMRoomTypeMappings = loginFactory.securedGet("api/ChannelManager/AllChannelManagerRoomTypeMapping", "");
        return getCMRoomTypeMappings;
    }

    function searchCMReservationListDataProcess(data) {
        if (data && data.reservationRooms.length > 0) {
            console.log("DATA GET", data);
            var dataTemp = data;
            var statusColors = dataTemp.statusColors;
            for (var index in dataTemp.reservationRooms) {
                var reservationRoomTemp = data.reservationRooms[index];
                console.log('reservationRoomTemp:', reservationRoomTemp);
                var menus = [];
                menus.push({
                    name: "VIEW_DETAIL",
                    icon: "ic_pageview_24px.svg",
                    url: "reservation/" + reservationRoomTemp.ReservationRoomId
                });

                if (reservationRoomTemp.Reservations !== null && reservationRoomTemp.Reservations.IsGroup == true) {

                    menus.push({
                        name: "EDIT_GROUP",
                        icon: "ic_pageview_24px.svg",
                        url: "groupReservationDetail/" + reservationRoomTemp.Reservations.ReservationId
                    });
                }

                if (reservationRoomTemp.ArrivalDate) {
                    reservationRoomTemp.ArrivalDate = new Date(reservationRoomTemp.ArrivalDate)
                }

                if (reservationRoomTemp.CheckInDate) {
                    reservationRoomTemp.CheckInDate = new Date(reservationRoomTemp.CheckInDate)
                }

                if (reservationRoomTemp.CheckOutDate) {
                    reservationRoomTemp.CheckOutDate = new Date(reservationRoomTemp.CheckOutDate)
                }


                if (reservationRoomTemp.CreatedDate) {
                    reservationRoomTemp.CreatedDate = new Date(reservationRoomTemp.CreatedDate)
                }

                if (reservationRoomTemp.CancelDate) {
                    reservationRoomTemp.CancelDate = new Date(reservationRoomTemp.CancelDate)
                }

                if (reservationRoomTemp.CMReceiveBookingDate) {
                    reservationRoomTemp.CMReceiveBookingDate = new Date(reservationRoomTemp.CMReceiveBookingDate)
                }

                if (reservationRoomTemp.DepartureDate) {
                    reservationRoomTemp.DepartureDate = new Date(reservationRoomTemp.DepartureDate)
                }
                if (reservationRoomTemp.BookingStatus === "BOOKED" && reservationRoomTemp.ArrivalDate < new Date()) {
                    reservationRoomTemp.BookingStatus = "NOSHOW";
                }

                if (reservationRoomTemp.BookingStatus === "CHECKIN" && reservationRoomTemp.DepartureDate < new Date()) {
                    reservationRoomTemp.BookingStatus = "OVERDUE";
                }
                reservationRoomTemp.MenuItems = menus;
                //Status Color
                for (var index in statusColors) {
                    if (reservationRoomTemp.BookingStatus && reservationRoomTemp.BookingStatus === statusColors[index].StatusCode) {
                        reservationRoomTemp.Color = statusColors[index].ColorCode;
                        break;
                    }

                }
                //
                for (var index2 in dataTemp.reservationInfo) {
                    if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
                        reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
                        reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
                        reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
                        reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
                        break;
                    }
                }
                // for (var index in statusColors) {
                //     if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === statusColors[index].StatusCode) {
                //         reservationRoomTemp.Color = statusColors[index].ColorCode;
                //         break;
                //     }
                // }
            }
            delete data;
            data = dataTemp;
        }
    }

    function removeCMRoomTypeMapping(CMRoomTypeMappingId) {
        
    }

    function removeCMRoomRateMapping(CMRoomRateMappingId) {
        
    }

    function UpdateCMRegister(CMConfiguration) {
        var UpdateCMRegister = loginFactory.securedPostJSON("api/ChannelManager/UpdateChannelManager", CMConfiguration)
        $rootScope.dataLoadingPromise = UpdateCMRegister;
        UpdateCMRegister.success(function (data) {
            dialogService.toast("UPDATE_SUCCESSFUL");
            $state.go($state.current, {}, {
                reload: true
            });
        }).error(function (err) {
            dialogService.messageBox("ERROR", err);
        })
        var CheckCountCMConfigIsActive = loginFactory.securedPostJSON("api/ChannelManager/CheckBEConfigIsActive","")
        $rootScope.dataLoadingPromise = CheckCountCMConfigIsActive;
        CheckCountCMConfigIsActive.success(function (data) { 
            if(data != undefined && data != null && data != CMConfiguration.IsLastRoomAvailable){
                var translated_title = $filter("translate")("LOG_MESSAGES");
                var translated_content = $filter("translate")("UPDATE_CMREGISTER_MESSAGES");
                var translated_ok = $filter("translate")("OK");
                var translated_cancel = $filter("translate")("CANCEL");

                $mdDialog.show(
                    $mdDialog.alert()
                    //.parent(angular.element(document.body))
                    .clickOutsideToClose(false)
                    .title(translated_title)
                    .textContent(translated_content)
                    //.ariaLabel('Alert Dialog POS')
                    .ok(translated_ok)
                    //.targetEvent(null)
                )
            }  
        }).error(function (err) {
            dialogService.messageBox("ERROR", err);
        })
    }

    function CheckHotelCMConfiguration() {
        var HotelCMConfiguration = loginFactory.securedGet("api/ChannelManager/HotelCMConfiguration", "")
        HotelCMConfiguration.success(function (data) {
            if (data.hotelCMModule == null) {
                DialogSuggest(true);
                return;
            }
            if (data.hotelConfig == null) {
                DialogSuggest(false);
            }
        }).error(function (err) {
            console.log("ERROR", err);
        });
    }

    function DialogSuggest(isBackToPayment) {
        console.log("Back to payment", isBackToPayment);
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'views/templates/CMSuggest.tmpl.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: false
        }).then(function () {
            if (isBackToPayment == true) {
                console.log("Back to payment");
                $state.transitionTo("modulePaymentManagement");
            }
        });

        function DialogController($scope, $mdDialog) {
            $scope.cancel = function () {
                $mdDialog.hide();
            };
        }
    }

}]);