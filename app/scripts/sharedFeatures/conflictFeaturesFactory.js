//Nhân bản SharedFeaturesFactory để dùng cho conflict service khi bị Circular dependency found(gọi service xoay vòng).
ezCloud.factory("ConflictFeaturesFactory", ['$mdDialog', '$state', '$filter', '$mdMedia', 'dialogService', 'selectedRoomFactory', 'CancelService', 'AssignRoomService', 'AmendStayService', 'reservationFactory', 'loginFactory', '$rootScope', 'CopyReservationService', 'ConflictReservationService', 'smartCardFactory', 'RoomMoveService', 'homeFactory', 'UnassignRoomService', 'EditCheckInTimeService', 'ShowBreakService',
    function ($mdDialog, $state, $filter, $mdMedia, dialogService, selectedRoomFactory, CancelService, AssignRoomService, AmendStayService, reservationFactory, loginFactory, $rootScope, CopyReservationService, ConflictReservationService, smartCardFactory, RoomMoveService, homeFactory, UnassignRoomService, EditCheckInTimeService, ShowBreakService) {
        var featureModel = null;
        var baseModel = null;
        var roomMoveNewId = null;
        var roomStatus = null;

        function DialogController($scope, $mdDialog){
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        };
        var ConflictFeaturesFactory = {
            getFeatureModel: function () {
                return featureModel;
            },
            
            setFeatureModel: function (_featureModel) {
                featureModel = _featureModel;
            },

            getBaseModel: function () {
                return baseModel;
            },

            setBaseModel: function (_baseModel) {
                baseModel = _baseModel;
            },

            getRoomMoveNewId: function () {
                return roomMoveNewId;
            },

            setRoomMoveNewId: function (_roomMoveNewId) {
                roomMoveNewId = _roomMoveNewId;
            },

            getRoomStatus: function () {
                return roomStatus;
            },

            setRoomStatus: function (_status){
                roomStatus = _status;
            },

            //in-progess
            processConflictReservation: function (selectedRR, baseRR, status) {
                if (selectedRR != null && baseRR != null) {
                    this.setFeatureModel(selectedRR);
                    this.setBaseModel(baseRR);
                    this.setRoomStatus(status);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/conflictReservation/conflictReservationDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        controller: DialogController
                    }).then(function () {
                        SharedFeaturesFactory.setBaseModel(null);
                        SharedFeaturesFactory.setRoomStatus(null);
                    });
                }
            }    
        };
        return ConflictFeaturesFactory;
    }
]);