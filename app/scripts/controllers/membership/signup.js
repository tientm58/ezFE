ezCloud.controller('signUpController', ['$scope', '$rootScope', '$state', 'dialogService', '$http', 'loginFactory', '$filter', 'commonFactory', '$stateParams', function ($scope, $rootScope, $state, dialogService, $http, loginFactory, $filter, commonFactory, $stateParams) {
    $rootScope.showMenu = false;
    var lang = "vi";
    if ($rootScope.language == "en")
        lang = "en";
    var email = "";
    var fullName = "";
    $scope.preAuth = $stateParams.preAuth;

    function showCaptcha() {
        if (typeof grecaptcha != 'undefined') { 
            var recaptcha1 = grecaptcha.render('captcha', {
                'sitekey': '6LfhCRsTAAAAAEu8LBeBrB_zGtXGkw3PGN44hO8s',
                'lang': lang
            });
        } else 
            setTimeout(showCaptcha, 900);
    }
    // showCaptcha();
    setTimeout(showCaptcha, 1500);
    if ($stateParams.preAuth) {
        //get external login data
        console.log("PreAuth", $stateParams.preAuth);
        email = $stateParams.preAuth.Email;
        fullName = $stateParams.preAuth.Fullname;
    }
    $scope.captchaId = null;
    $scope.captchaNumber = null;
    $scope.isRegistered = false;
    $scope.hotelSizeList = [];
    $scope.messages = {
        captchaMessage: '',
        emailExistence: ''
    };

    $scope.signUpData = {
        Email: email,
        Password: "",
        ConfirmPassword: "",
        CaptchaId: "",
        CaptchaCode: "",
        HotelOwnerFullName: fullName,
        HotelOwnerAddress: "",
        HotelOwnerPhoneNumber: "",
        NumberOfHotels: "",
        HotelSizeId: ""
    };


    function signUpPageInit() {
        var getCaptcha = loginFactory.normalGet("api/captcha/create");
        $rootScope.dataLoadingPromise = getCaptcha;
        getCaptcha.success(function (data) {
            $scope.captcha = data.ImageUrl;
            console.log(data.ImageUrl);
            $scope.captchaId = data.CaptchaId;
            $scope.signUpData.CaptchaId = $scope.captchaId;
        });

        commonFactory.getHotelSizeList(function (data) {
            $scope.hotelSizeList = data;
        });

    }
    signUpPageInit();

    /* if ($scope.signUpData.ConfirmPassword !== $scope.signUpData.Password){
         $scope.accountInformationForm.passwordConfirm.$invalid = true;
     }*/

    $scope.$watch('signUpData.ConfirmPassword', function (newVal) {
        if (newVal !== $scope.signUpData.Password) {
            $scope.accountInformationForm.passwordConfirm.$invalid = true;
        }
    });

    $scope.errors = [];
    $scope.isEmailError = false;
    $scope.isCaptchaError = false;
    $scope.doSignUp = function ($event) {
        if (grecaptcha.getResponse() == "") {
            dialogService.messageBox("PLEASE_RESOLVE_THE_CAPTCHA_AND_SUBMIT");
            return;
        }
        $scope.signUpData.CaptchaCode = grecaptcha.getResponse();
        console.log("$scope.signUpData" + JSON.stringify($scope.signUpData));
        var signup;
        if ($scope.preAuth)
            signup = loginFactory.securedPost("api/Account/Register", $scope.signUpData);
        else
            signup = loginFactory.postJSON("api/Account/Register", $scope.signUpData);
        $rootScope.dataLoadingPromise = signup;
        signup.success(function (data) {

            $scope.isRegistered = true;
            $state.go('signUpSuccess');
        }).error(function (err) {
            console.log("ERROR", err);

            var errors = [];
            for (var key in err.ModelState) {
                for (var i = 0; i < err.ModelState[key].length; i++) {
                    errors.push(err.ModelState[key][i]);
                }
            }
            if (errors.length > 0) {
                grecaptcha.reset();
                if (errors[0] === "INCORRECT_CAPTCHA") {
                    $scope.isCaptchaError = true;
                    $scope.isEmailError = false;
                } else {
                    $scope.isEmailError = true;
                    $scope.isCaptchaError = false;
                    $scope.signUpData.CaptchaCode = "";
                    //doRefresh();
                }
                //$scope.isError = true;
                $scope.errors = errors;

            }
            console.log("ERROR", errors[0]);
        });

    };
    $scope.captchaValidated = function () {
        if (typeof grecaptcha != 'undefined')
            return grecaptcha.getResponse() != "";
        return false;
    }

    function doRefresh() {
        /* //Not use any more
		var refresh = loginFactory.normalGet("api/captcha/create");
		$rootScope.dataLoadingPromise = refresh;
		refresh.success(function (data) {
			$scope.captcha = data.ImageUrl;
			$scope.captchaId = data.CaptchaId;
			$scope.signUpData.CaptchaId = $scope.captchaId;
		});*/
    }

    $scope.doRefresh = doRefresh;
    $scope.tourEnded = function () {
        $scope.currentStep = -1;
    };
    $scope.stepComplete = function () {

    };
    $scope.currentStep = 0;
    $scope.startTour = function () {
        console.log($scope.currentStep);
        $scope.currentStep = 0;
        setTimeout(function () {
            $scope.$apply();
        }, 0);
    }
}]);