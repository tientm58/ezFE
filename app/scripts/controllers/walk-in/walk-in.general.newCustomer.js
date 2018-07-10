ezCloud.controller('WalkinGeneralNewCustomerCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;
        function InitWalkin_NewCustomer(){
            $scope.$mdMedia = $mdMedia;
            vm.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                if (data != null){
                    vm.customerList = data.RoomStatus.AllCustomer;
                    if (data.RoomStatus != null){
                        vm.countries = data.RoomStatus.countries;
                    }
                }
                vm.customer     = {};
                vm.searchText   = "";
                vm.selectedItem = null;
                $timeout(function() {
                    console.info("customer for save", vm.customer);
                    walkInFactory.setCustomerForSaved(vm.customer);
                },0);
            });


        }

        $scope.$on('InitWalkin_NewCustomer', function(e) {
            InitWalkin_NewCustomer();
        });

        vm.Init = function() {
            $scope.$emit("WalkinInit");
        };



        vm.querySearch = querySearch;

        function querySearch(query) {
            var lowercaseQuery = angular.lowercase(query);
            var result;
            for (var index in vm.customerList) {

                if (vm.customerList[index].Fullname) {

                    if (angular.lowercase(vm.customerList[index]['Fullname']).indexOf(lowercaseQuery) > -1) {
                        if (!result) {
                            result = [];
                        }
                        result.push(vm.customerList[index]);
                    }
                }
                if (result == undefined) {
                    result = null;
                }
            }

            return result;
            //var results = query ? vm.customerList.filter(createFilterFor(query)) : vm.customerList;
            //return $q.when(results);

        }
        //vm.searchTextChange = searchTextChange;
        function searchTextChange(text) {
            vm.customer.Fullname = text;
        }

        vm.selectedItemChange = function (item) {
            vm.customer.Fullname       = item.Fullname;
            vm.customer.Mobile         = item.Mobile;
            vm.customer.Email          = item.Email;
            vm.customer.IdentityNumber = item.IdentityNumber;
            vm.customer.Birthday       = item.Birthday;
            vm.customer.Address        = item.Address;
            vm.customer.Gender         = item.Gender;
            vm.customer.TravellerId    = item.TravellerId;
            vm.customer.CountryId      = item.CountryId;
            vm.customer.Note           = item.Note;
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(customer) {
                var result = null;
                if (customer.Fullname) {
                    result = customer.Fullname.indexOf(lowercaseQuery) == 0
                }
                return result;
            };
        }
    }
]);