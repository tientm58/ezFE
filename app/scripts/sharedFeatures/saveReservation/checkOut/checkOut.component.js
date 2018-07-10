ezCloud.component('checkOut', {
  controller: 'CheckOutController',
  controllerAs: 'checkOutCtrl',
  templateUrl:'views/sharedFeatures/saveReservation/checkOut/checkOut.template.html',
  bindings: {
    selectedRR: "<"
  }
});

