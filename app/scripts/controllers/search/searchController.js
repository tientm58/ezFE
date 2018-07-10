ezCloud.controller('searchController',['$localStorage','$scope','$state','roomListFactory','dialogService','loginFactory','$q','$location','homeFactory', function($localStorage,$scope,$state,roomListFactory,dialogService,loginFactory,$q,$location,homeFactory) {
    //console.log($state.current.name);
    var roomList = [];
    roomListFactory.getRoomListCache(function(data) {
        roomList = data;
        homeFactory.setHomeData(data);
    });
    $scope.processSearchData = function(query) {
        console.log($localStorage.recentSearch);
        var deferred = $q.defer();
        if (query) {
        var promise = loginFactory.securedGet("api/Search/Get","query=" + query); //roomListFactory.getAllRooms();
            promise.success(function(data) {
                var results = createSearchResults(data,query);//data.filter( createFilterFor(query));
                deferred.resolve(results);
                console.log(results);
            });
        } else {
          
            var promise = loginFactory.securedGet("api/Search/GetRecent"); //roomListFactory.getAllRooms();
            promise.success(function(data) {
                deferred.resolve(data);
            });
            
        }
        return deferred.promise;
        
    };
        $scope.clickedSearch = function(item) {
            if (item) {
            
                
                loginFactory.securedPostJSON("api/Search/SaveRecent",item);
                
                /*if ($localStorage.recentSearch.length>10) {
                    $localStorage.recentSearch.splice(10,$localStorage.recentSearch.length-10);
                }*/
                
                $scope.searchText = item.Name;
                $location.url(item.path);
                //delete $scope.selectedItem;
                //jQuery("input[type='search']").focus();
            }
        };
       
    
    function createSearchResults(data, query) {
        var results = [];
        if (data.Reservations) {
            var i = 0;
            for(var idx in data.Reservations) {
                var traveller_name = "";
                for(var t in data.Reservations[idx].travellers) {
                    traveller_name += "," + data.Reservations[idx].travellers[t].fullname;
                }
                traveller_name = traveller_name.substr(1);
                console.log(data.Reservations[idx]);
                var search = {name: traveller_name, description: data.Reservations[idx].reservation.bookingStatus, path: "/reservation/" + data.Reservations[idx].reservation.reservationRoomId, type: 'RESERVATION', position:i, icon: "img/Icons/ic_verified_user_24px.svg" };
                if (data.Reservations[idx].reservation.roomId && roomListFactory.getRoomById(data.Reservations[idx].reservation.roomId)) {
                    search.name += " - " + data.Reservations[idx].rooms.roomName;
                }
                console.log(roomList.statusColors);
                search.color = roomList.statusColors[data.Reservations[idx].reservation.bookingStatus];
                /*
                switch (data.Reservations[idx].reservation.bookingStatus) {
                    case "CHECKIN":
                        search.color = roomList.statusColors["CHECKIN"];
                        break;
                    case "BOOKED":
                        search.color = "Green";
                        break;
                    default:
                         break;
                }*/
                results.push(search);
                i++;
            }
        }
        if (data.Rooms) {
            var i = 0;
            for(var idx in data.Rooms) {
                var search = {name: data.Rooms[idx].RoomName, description: data.Rooms[idx].Description, path: "/walkin/" + data.Rooms[idx].RoomId, type: 'ROOM', position: i , icon: "img/Icons/ic_store_24px.svg" };
                results.push(search);
                i++;
            }
        }
        return results;
    }
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
        return (state.RoomName.indexOf(lowercaseQuery) >= 0);
    };
  }
    
}]);
                                         