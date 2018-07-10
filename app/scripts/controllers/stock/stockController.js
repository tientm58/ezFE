ezCloud.controller('stockController',
['$scope', '$state', 'dialogService', 'loginFactory',
function($scope, $state, dialogService, loginFactory) {
    $scope.stockItems = {
        1: {
            name: 'lkjdsfl',
            address: 'kdsfjlsdjfl',
            isHidden: false
        },
        2: {
            name: 'lkjdsfl',
            address: 'kdsfjlsdjfl',
            isHidden: false
        }
    };
}]);
                                         