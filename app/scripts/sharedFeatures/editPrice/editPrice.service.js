ezCloud.factory("EditPriceService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var editPriceModel = null;
        var EditPriceService = {
            getEditPriceModel: function(){
                return editPriceModel;
            },
            setEditPriceModel: function(_editPriceModel){
                editPriceModel = _editPriceModel;
            },
            processEditPrice: function(callback){
                var editPriceModel = this.getEditPriceModel();
                var status = editPriceModel.Status;

                if(status == true){
                    var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_CHANGE_PRICE"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }
                    var EditPriceModel = {
                        ReservationRoomId: editPriceModel.ReservationRoomId,
                        NewPrice: editPriceModel.PriceData,
                        languageKeys: languageKeys
                    }
                    var editPrice = loginFactory.securedPostJSON("api/Room/EditPrice", EditPriceModel);
                    $rootScope.dataLoadingPromise = editPrice;
                    editPrice.success(function (data) {
                        var result = { status: true, object: data };
					    if (callback) callback(result);
                    }).error(function (err) {
                        var result = { status: false, object: err };
					    if (callback) callback(result);
                    });
                }
                else{
                    var result = { status: true, object: null };
                    if (callback) callback(result);
                }
            }
        }
        return EditPriceService;
    }
]);
