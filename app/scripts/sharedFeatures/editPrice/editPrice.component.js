ezCloud.component('editPrice', {
    controller: 'EditPriceController',
    controllerAs: 'editPriceCtrl',
    templateUrl:'views/sharedFeatures/editPrice/editPrice.template.html',
    bindings: {
        currentRoom: "<"
    }
});