ezCloud.component('amendStay', {
  controller: 'AmendStayController',
  controllerAs: 'amendStayCtrl',
  templateUrl:'views/sharedFeatures/amendStay/amendStay.template.html',
  bindings: {
    //Khai bao ra cac thuoc tinh ma doi tuong o trong controller co san
    currentRoom: "<",
    previousReservation: "<",
    nextReservation: "<"
  }
});

