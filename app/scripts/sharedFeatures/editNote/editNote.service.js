ezCloud.factory("EditNoteService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var editNoteModel = null;
        var EditNoteService = {
            getEditNoteModel: function(){
                return editNoteModel;
            },
            setEditNoteModel: function(_editNoteModel){
                editNoteModel = _editNoteModel;
            },
            processEditNote: function(callback){
                var model = this.getEditNoteModel();
                var editPrice = loginFactory.securedPostJSON("api/Room/EditNote", model);
                $rootScope.dataLoadingPromise = editPrice;
                editPrice.success(function (data) {
                    var result = { status: true, object: data };
                    if (callback) callback(result);
                }).error(function (err) {
                    var result = { status: false, object: err };
                    if (callback) callback(result);
                })
            }
        }
        return EditNoteService;
    }
]);
