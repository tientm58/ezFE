var $windowScope;
firstCallHomeJs = 1;
ezCloud.controller('loginController', ['$scope', '$rootScope', '$state', 'dialogService', 'loginFactory', '$localStorage', '$http', '$sessionStorage', '$location', '$stateParams', 'commonFactory','$translate','reportFactory','configFactory','$route','$window', function ($scope, $rootScope, $state, dialogService, loginFactory, $localStorage, $http, $sessionStorage, $location, $stateParams, commonFactory, $translate,reportFactory,configFactory, $route, $window) {
    $rootScope.showMenu = false;
	var externalLogins;
	var returnUrl = location.protocol + "//" + location.host + "/authcomplete.html";
	console.log("LOGIN STATE");
	if (isCordovaApp) {
		returnUrl = cordova.file.applicationDirectory + "www/authcomplete.html";
	}



	loginFactory.isAuthenticated(function () {
		$state.transitionTo("dashboard");
	});
	var isAndriod = (/Android/i.test(navigator.userAgent)) ? true : false;
	var isIos=(/iPhone|iPad|iPod/i.test(navigator.userAgent)) ? true : false;
	$scope.showAndriod=true;
	$scope.showIos=true;
	if(isIos==true){
		$scope.showAndriod=false;
		$scope.showIos=true;
	};
	if(isAndriod==true){
		$scope.Appurl="market://details?id=ezcloud.com.ezcloudhotel";
		$scope.target="_top";
		$scope.showAndriod=true;
		$scope.showIos=false;
	};
	$scope.AppAndriodUrl="https://play.google.com/store/apps/details?id=ezcloud.com.ezhotel";
	$scope.AppIosUrl="https://itunes.apple.com/vn/app/ezcloudhotel-manager/id1122434565?mt=8";
	$scope.target="_blank";




	var login = $localStorage.lastLogin;
	if (!login)
		login = {
			username: "",
			password: "",
			hotelId: "",
			role: "HOTEL_OWNER"
		};
	$scope.login = login;
	$windowScope = $scope;
	$scope.authCompletedCB = function (fragments) {
		//
		console.log(fragments);
		if (fragments) {
			$localStorage.session = fragments;
			if (fragments.refresh_token) {
				//Logged in
				loginSuccess(fragments);
			} else {
				//Register
				$state.go("signup", {
					preAuth: fragments
				});
			}
		}

	}
	getExternalLogins();
	$rootScope.title = "LOGIN";
	$rootScope.hideSearchBar = true;

	if ($stateParams.url) {
		//
		loginFactory.normalGet("api/Common/DomainToId/?subdomain=" + $stateParams.url).success(function (hotelId) {
			if (hotelId) {
				$scope.login.hotelId = hotelId;
			}
		});
	}
	$scope.setFocusHotelId = function () {
		setTimeout(function () {
			$("#hotelId").focus();
		}, 300);

	}
	var ref;

	function parseQueryString(queryString) {
		var data = {},
			pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

		if (queryString === null) {
			return data;
		}

		pairs = queryString.split("&");

		for (var i = 0; i < pairs.length; i++) {
			pair = pairs[i];
			separatorIndex = pair.indexOf("=");

			if (separatorIndex === -1) {
				escapedKey = pair;
				escapedValue = null;
			} else {
				escapedKey = pair.substr(0, separatorIndex);
				escapedValue = pair.substr(separatorIndex + 1);
			}

			key = decodeURIComponent(escapedKey);
			value = decodeURIComponent(escapedValue);

			data[key] = value;
		}

		return data;
	}

	function processLoginCheck(event) {
		if (event.url.indexOf(returnUrl) == 0) {
			//done
			var hashPos = event.url.indexOf("#");
			var queryString = event.url.substr(hashPos + 1);
			var fragment = parseQueryString(queryString);
			$scope.authCompletedCB(fragment);
			ref.close();
		}
	}
	$scope.doFBLogin = function () {
		var rootUrl = apiUrl;
		if (rootUrl == "/")
			rootUrl = location.protocol + "//" + location.host + "/";
		rootUrl = rootUrl.substr(0, rootUrl.length - 1);
		for (var idx in externalLogins) {
			if (externalLogins[idx].Name == "Facebook") {
				ref = window.open(rootUrl + externalLogins[idx].Url);
				if (isCordovaApp)
					ref.addEventListener("loadstart", processLoginCheck);
			}
		}
	}
	$scope.gotoGooglePlay = function () {
		 var rootUrl = $scope.AppAndriodUrl;
		 window.open(rootUrl);

	}
	$scope.gotoiOS = function () {
		 var rootUrl = $scope.AppIosUrl;
		 window.open(rootUrl);

	}
	$scope.doGGLogin = function () {
		var rootUrl = apiUrl;
		if (rootUrl == "/")
			rootUrl = location.protocol + "//" + location.host + "/";
		rootUrl = rootUrl.substr(0, rootUrl.length - 1);
		for (var idx in externalLogins) {
			if (externalLogins[idx].Name == "Google") {
				ref = window.open(rootUrl + externalLogins[idx].Url);
				if (isCordovaApp)
					ref.addEventListener("loadstart", processLoginCheck);
			}
		}
	}
	$scope.changeRole = function () {
		if ($scope.login.role == "HOTEL_OWNER") {
			$scope.login.role = "HOTEL_STAFF";
		} else {
			$scope.login.role = "HOTEL_OWNER";
		}
	};

	function getExternalLogins() {


		loginFactory.normalGet("api/Account/ExternalLogins?returnUrl=" + returnUrl).success(
			function (data) {
				console.log(data);
				externalLogins = data;
			}
		);
	}

	function loginSuccess(data) {
		$localStorage.reLoadTab = true;
		commonFactory.getHotelSettings(function (settings) {
			$rootScope.HotelSettings = settings;
			setTimeout(function () {
				$scope.$apply();
			}, 0); 
		});
		var success = loginFactory.processLoginData(data);
		if (success) {

			var lastLogin = {
				username: $scope.login.username,
				role: $scope.login.role,
				hotelId: $scope.login.hotelId

			};
			$localStorage.lastLogin = lastLogin;
			dialogService.toast("LOGIN_SUCCESS");
			loginFactory.isAuthenticated();
			//create server session
			var hotelList = loginFactory.securedGet("api/Hotel/GetHotelList");
			$rootScope.dataLoadingPromise = hotelList;
			hotelList.success(function (data) {
				
				if (data.length == 0 && $scope.login.role == "HOTEL_OWNER") {
					
					$state.transitionTo('hotelQuickSettings');
				} else {
					console.info("GET LOGIN HERE");
					if ($stateParams.url){

						$location.url($stateParams.url);
						$window.location.reload();
					}
					
					else{
						//$locale.pa
						$location.path('dashboard');
						$window.location.reload();
					}

				}
			}).error(function (err) {
				console.log(err);
			});

		} else {
			dialogService.toast("LOGIN_FAILED");
		}

	}
	$scope.doLogin = function ($event) {
		commonFactory.clearCache();
		configFactory.setCurrentHotel({});
		if ($scope.loginForm.$invalid) return;
		var login;
		$scope.login.username = $scope.login.username.toLowerCase();
		if ($scope.login.role == "HOTEL_OWNER") {
			login = loginFactory.loginHotelOwner($scope.login.username, $scope.login.password);
		} else {
			login = loginFactory.loginHotelStaff($scope.login.username, $scope.login.hotelId, $scope.login.password);
		}
		$rootScope.dataLoadingPromise = login;
		login.success(loginSuccess).error(function (err) {
			var errors = [];
			dialogService.messageBox("LOGIN_ERRORS", err.error_description.toString());
		});
	};

	$scope.transferToSignUp = function ($event) {
		//$state.transitionTo("signup");
		window.open('http://ezcloudhotel.com/register/');
	};

	$scope.transferToForgotPassword = function ($event) {
		$state.transitionTo("forgotPassword");
	};

	$rootScope.language = $translate.use() ? $translate.use() : "vn";
    //console.log($translate.loaderCache);
    currentLanguage = $rootScope.language;
    $rootScope.languageName = $rootScope.language == "en" ? "Tiếng Việt" : "English";
	$translate.use($rootScope.language);
	try {
		smartsupp("language", $rootScope.language);
	} catch (error) {
		_smartsupp.key = "d12ece439d89709a4548f3a0b00c07448f7d3fd5"; 
		window.smartsupp || (function (d) {
			var s, c, o = smartsupp = function () {
				o._.push(arguments)
			};
			o._ = [];
			s = d.getElementsByTagName('script')[0];
			c = d.createElement('script');
			c.type = 'text/javascript';
			c.charset = 'utf-8';
			c.async = true;
			c.src = '//www.smartsuppchat.com/loader.js?';
			s.parentNode.insertBefore(c, s);
		})(document);
		if (hash !== '#/extendedScreen') {
			smartsupp('recording:disable', true);
			smartsupp('translate', {
				online: { // online window
					title: 'Hỗ trợ',
					infoTitle: 'Chat trực tuyến',
					infoDesc: 'Hãy hỏi chúng tôi điều bạn muốn',
					maximize: 'Phóng to',
					minimize: 'Thu nhỏ',
					hideTitle: 'Ẩn cửa sổ chat',
					closeTitle: 'Dừng chat',
					settingsTitle: 'Thiết lập',
					disableSounds: 'Tắt tiếng',
					enableSounds: 'Bật tiếng',
					visitor: 'Bạn',
					send: 'Gửi',
					textareaPlaceholder: 'Viết vào đây, nhấn Enter để gửi',
					typingMsg: '{name} đang trả lời...',
					transcriptSendingTitle: 'Đang gửi email...',
					transcriptSendingDesc: '',
					transcriptSendedTitle: 'Email đã được gửi thành công',
					transcriptSendedDesc: ''
				},
				offline: { // offline window
					title: 'Hãy gửi thông điệp cho chúng tôi',
					notice: 'Chúng tôi hiện không online, bạn hãy gửi thông điệp cho chúng tôi. Chúng tôi sẽ trả lời ngay khi có thể.',
					hideTitle: 'Ẩn cửa sổ chat',
					required: '',
					name: 'Họ và tên',
					email: 'Email',
					number: 'Số điện thoại',
					message: 'Thông điệp của bạn',
					submit: 'Gửi',
					messageRequiredAlert: 'Bạn chưa nhập nội dung thông điệp.',
					emailRequiredAlert: 'Bạn chưa nhập địa chỉ email.',
					emailInvalidAlert: 'Địa chỉ email không hợp lệ',
					sendInfo: 'Đang gửi email...',
					successTitle: 'Cảm ơn lời nhắn của bạn',
					successDesc: 'Lời nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm.',
					failureTitle: 'Lỗi',
					failureDesc: 'Chúng tôi xin lỗi vì lời nhắn của bạn chưa được gửi.'
				},
				login: { // pre-chat form window
					title: 'Đăng nhập chat',
					notice: '',
					messageLabel: 'Câu hỏi của bạn',
					submit: 'Bắt đầu chat'
				},
				widget: { // chat box
					online: 'Hãy hỏi chúng tôi điều bạn muốn',
					away: 'Hãy hỏi chúng tôi điều bạn muốn',
					offline: 'Để lại lời nhắn cho chúng tôi',
				},
				banner: { // chat banners
					bubble: {
						text: 'Chúng tôi luôn lắng nghe!'
					},
					arrow: {
						title: 'Bạn muốn hỗ trợ gì?',
						desc: 'ezCloud luôn sẵn sàng.'
					}
				},
				button: { // mobile widget
					title: 'Chat trực tuyến'
				},
				dialogClose: {
					title: 'Bạn có muốn dừng cuộc nói chuyện ở đây?',
					yes: 'Có',
					no: 'Không',
					send: 'Có, và gửi nội dung chat vào email'
				},
				dialogSend: {
					title: 'Gửi cuộc nói chuyện vào email',
					email: 'Email',
					yes: 'Gửi',
					no: 'Hủy'
				},
				dialogRating: {
					title: 'Bạn đánh giá chất lượng cuộc nói chuyện như thế nào?',
					cancel: 'Tôi không muốn đánh giá',
					submit: 'Gửi',
					commentTitle: 'Đánh giá của bạn'
				}
			}, 'vn');
			smartsupp('theme:set', 'default');
			// smartsupp('banner:set', 'bubble');
			smartsupp('on', 'rendered', function () {
				$('#chat-application-iframe').contents().find('.brand-logo').html('');
			});
		} else {
			smartsupp("widget:hide", true);
		}

		loginFactory.isAuthenticated(function () {
			$rootScope.loggedIn = true;

			if ($localStorage.session.Fullname) {
				smartsupp("name", $localStorage.session.Fullname);
			}
			if ($localStorage.session.Email) {
				smartsupp("email", $localStorage.session.Email);
			}
		});
	}
    


	$scope.langSwitch = function (status){
		console.log(status);
		if (status === "en") {
			$rootScope.language = "en";
			$rootScope.languageName = "English";
		} else {
			$rootScope.language = "vn";
			$rootScope.languageName = "Tiếng Việt";
		}
		currentLanguage = $rootScope.language;
		$translate.use($rootScope.language);
		smartsupp("language", $rootScope.language);
		console.log($rootScope.language);

	};

	$scope.goToFacebook = function(){
		window.open('https://www.facebook.com/ezCloudhotel/');
	};
	$scope.goToYoutube = function(){
				window.open('https://www.youtube.com/channel/UCMCfL-hMUu6B5_fHjfAF1kw');
	};
	$scope.goToGG = function(){
				window.open('https://plus.google.com/u/0/107393510809165439123/posts');
	};
	$scope.goToIG = function(){
				window.open('https://www.instagram.com/ezcloudjsc/');
	};
	$scope.goToTwiter = function(){
		window.open('https://twitter.com/ezCloudhotel');
	}
}]);