ezCloud.component('cancel', {
  controller: 'CancelController',
  controllerAs: 'cancelCtrl',
  templateUrl:'views/sharedFeatures/cancel/cancel.template.html',
  bindings: {
    currentRoom: "<",
  }
});

