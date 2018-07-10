ezCloud.controller('refferralProgramArticle2Controller', ['$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', 'currentHotelSettings','$mdMedia', function ($filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, currentHotelSettings,$mdMedia) {
    var vm = this;
	function Init() {

        var refferralCode = "";
        vm.$mdMedia = $mdMedia;
        vm.currentHotel = currentHotelSettings;
        if(currentHotelSettings && currentHotelSettings.EzReferralCodesList.length > 0){
            refferralCode = currentHotelSettings.EzReferralCodesList[0].Code;
        }
        
        vm.goToReferralPage = function(){
            window.open('http://ezcloudhotel.com/gioi-thieu-khach-hang/');
        };
        vm.shareFB = function(){
            // var url = "https://www.facebook.com/sharer/sharer.php?u=Hãy chia sẻ mã giới thiệu ["+refferralCode+"] để gia tăng thời hạn sử dụng phần mềm&url=https://ezcloud.vn&display=popup&ref=plugin&src=like&app_id=148900532147471";
            var url = "https://www.facebook.com/dialog/feed?app_id=148900532147471&display=popup&link=http://ezcloudhotel.com/gioi-thieu-khach-hang/&name=Hãy chia sẻ mã giới thiệu ["+refferralCode+"] để gia tăng thời hạn sử dụng phần mềm&redirect_uri=http://www.facebook.com";
            window.open(url);
        };
        vm.shareTweet = function(){
            var url = "http://twitter.com/share?text=Hãy chia sẻ mã giới thiệu ["+refferralCode+"] để gia tăng thời hạn sử dụng phần mềm&url=http://ezcloudhotel.com/gioi-thieu-khach-hang/";
            window.open(url);
        };
        // vm.shareGooglePlus = function(){
        //     window.open('https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fjasonwatmore.com%2Fpost%2F2014%2F08%2F01%2FAngularJS-directives-for-social-sharing-buttons-Facebook-Like-GooglePlus-Twitter-and-Pinterest.aspx&display=popup&ref=plugin&src=like&app_id=148900532147471');
        // }
	}
    Init();
    $scope.shareFb = function(){
        var url = "https://www.facebook.com/dialog/feed?app_id=148900532147471&display=popup&link=https://www.facebook.com/ezCloudhotel/photos/a.921760504572558.1073741828.919297258152216/1464544653627471/?type=3&theaterm&redirect_uri=http://www.facebook.com";
        window.open(url);
    }
    $scope.shareTwitter = function(){
        var url = "http://twitter.com/share?text=Hãy chia sẻ mã giới thiệu ["+refferralCode+"] để gia tăng thời hạn sử dụng phần mềm&url=http://ezcloudhotel.com/gioi-thieu-khach-hang/";
        window.open(url);
    }
}])