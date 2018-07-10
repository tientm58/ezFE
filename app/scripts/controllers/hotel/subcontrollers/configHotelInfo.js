'use strict';

ezCloud.controller('configHotelInfoController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$timeout', 'currentHotelSettings', 'commonFactory', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location, $timeout, currentHotelSettings, commonFactory) {
    var self = this;
    self.currentHotel = {};
    self.hasHotelLogo = false;
    self.myForm = {};
    self.hotelOriginal = {};
    self.isHotelChanged = false;


    self.configHotelInfoInit = function () {
        console.info("hotelInfo", $scope.hotelInfo);
        self.currentHotel = currentHotelSettings;
        configFactory.setCurrentHotel(self.currentHotel);
        self.hotelOriginal = angular.copy(currentHotelSettings);

        if (self.currentHotel.HotelLogoUrl !== null) {
            self.hasHotelLogo = true;
            self.hotelLogoUrl = apiUrl.substr(0, apiUrl.length - 1) + self.currentHotel.HotelLogoUrl;
        }

        $scope.myModel = {
            Url: 'http://jasonwatmore.com/post/2014/08/01/AngularJS-directives-for-social-sharing-buttons-Facebook-Like-GooglePlus-Twitter-and-Pinterest.aspx',
            Name: "AngularJS directives for social sharing buttons - Facebook, Google+, Twitter and Pinterest | Jason Watmore's Blog",
            ImageUrl: 'http://www.jasonwatmore.com/pics/jason.jpg'
        };

    }

    self.configHotelInfoInit();

    $scope.$watchCollection('hotelInfo.currentHotel', function (newValue, oldValue) {

        if (_.size(newValue) !== 0 && _.size(oldValue) !== 0) {

            if (!angular.equals(newValue, oldValue)) {
                self.isHotelChanged = true;
            }
            if (angular.equals(newValue, self.hotelOriginal)) {
                self.isHotelChanged = false;
            }
        }
    });


    self.headers = {
        'Authorization': 'Bearer ' + loginFactory.getSession().access_token
    };

    self.upload_success = function (url) {
        url = JSON.parse(url);
        self.currentHotel.HotelLogoUrl = url.serverPath;
        self.imageUrl = url.url;
        self.hasHotelLogo = true;
        self.myForm.modified = true;
    }

    self.upload_error = function (message, flow) {
        var val = JSON.parse(message);
        var message = JSON.parse(message).Message;
        var mess = [];
        if (val.ModelState.file != null) {
            val.ModelState.file.forEach(function (element) {
                if (element == "size") {
                    mess.push( $filter("translate")("MAX_FILE_SIZE") );
                } else if (element == "type") {
                    mess.push( $filter("translate")("UNDEFINED_TYPE_UPDATE") );
                }
            }, this);
        }
        dialogService.toastWarn(mess.join(" , "));
    } 

    self.saveHotelChanges = function () {
        if (self.currentHotel.CreatedDate === null) {
            self.currentHotel.CreatedDate = new Date();
        }

        configFactory.saveHotel(self.currentHotel, function () {
            self.isHotelChanged = false;
            self.hotelOriginal = angular.copy(self.currentHotel);
            configFactory.setCurrentHotel(self.currentHotel);
        });
    }

    self.goToReferralPage = function () {
        window.open('http://ezcloudhotel.com/phi-dich-vu/');
    };

}]);