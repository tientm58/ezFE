ezCloud.factory("ConflictReservationService", ['dialogService', '$stateParams', '$state', '$mdDialog',
    function(dialogService, $stateParams, $state, $mdDialog) {
        var ConflictReservationService = {
            processConflictReservation: function(err) {
                console.log("ERROR", err);
                if (err.ReservationRoomId) {
                    $mdDialog.show({
                        controller: ShowReservationConflictController,
                        resolve: {
                            conflictReservation: function () {
                                return err;
                            },
                        },
                        templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false,
                    }).then(function (answer) {
                    }, function () { });

                    function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                        $scope.conflictReservationDialog = {};
                        function Init() {
                            $scope.conflictReservationDialog = conflictReservation;
                            if ($scope.conflictReservationDialog.ArrivalDate) {
                                $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                            }
                            if ($scope.conflictReservationDialog.DepartureDate) {
                                $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                            }
                        }
                        Init();
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancelDialog = function () {
                            $mdDialog.cancel();
                        };
                    };
                }
            }
        };
        return ConflictReservationService;
    }
]);
