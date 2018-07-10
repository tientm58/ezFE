'use strict';
var vnLanguageObject = {
//Login page
     LOGIN:'Đăng nhập',
     USERNAME:'Tên đăng nhập',
     PASSWORD:'Mật khẩu',
     HOTEL_ID:'Mã khách sạn',
     SIGNUP: 'Đăng ký',
     REMEMBER_PASSWORD: 'Nhớ mật khẩu',
     USERNAME_TOO_SHORT:'ngắn quá!',
     USERNAME_TOO_LONG:'dài quá!',
     SIGNOUT:'Thoát',
     MENU:'Thực đơn',
     HOME:'Trang chủ',
     VIEW_DETAIL:'Chi tiết',
     ADD_MINIBAR_SERVICE:'Minibar',
     SEARCH:'Tìm kiếm',
     CUSTOMER_NAME:'Tên khách',
     CUSTOMER_IDENTITY_NUMBER:'Chứng minh thư',
     GENDER:'Giới tính',
     ROOM:'Phòng',
     ROOMS:'Số phòng',
     ROOM_TYPE:'Loại phòng',
     MALE:'Nam',
     FEMALE:'Nữ',
     GENDER_OTHER:'Giới tính khác',
     CUSTOMER:'Khách hàng',
     PAYMENT:'Thanh toán',
     PAYMENT_METHOD:'Phương thức thanh toán',
     PAYMENT_CASH:'Tiền mặt',
     PAYMENT_CREDIT:'Thẻ',
     PAYMENT_TRANSFER:'Chuyển khoản',
     COMPANY:'Công ty',
     CUSTOMER_SOURCE:'Nguồn khách',
     ARRIVAL_DATE:'Ngày vào',
     ARRIVAL_TIME:'Giờ vào',
     DEPARTURE_DATE:'Ngày ra',
     DEPARTURE_TIME:'Giờ ra',
     ADUlTS:'Người lớn',
     CHILD:'Trẻ em',
     RESERVATION_TYPE:'Hình thức đặt phòng',
     NOTE:'Ghi chú',
     OK:'Đồng ý',
     CANCEL:'Bỏ qua',
     SIGNOUT_CONFIRM:'Bạn có muốn thoát khỏi ứng dụng không?',
     OVERDUE:'Quá hạn',
     AVAILABLE:'Trống',
     CHECKIN:'Có khách',
     BOOKED:'Đã đặt',
     DIRTY:'Bẩn',
     REPAIR:'Đang sửa',
     ALL_ROOMS:'Tất cả',
     LOGIN_ERROR:'Tên đăng nhập/mật khẩu hoặc mã khách sạn của bạn chưa đúng',
     WALKIN:'Khách lẻ',
     ENTER_SEARCH_QUERY:'Nhập từ khóa tìm kiếm',
     SAVE:'Lưu',
     PHONE_NUMBER:'Số điện thoại',
     PASSWORD_CONFIRM:'Nhập lại mật khẩu',
     NEED_EMAIL_CONFIRMATION:'Bạn phải xác nhận lại địa chỉ email trước khi dùng để đăng nhập',
     SIGN_UP_SUCCESS:'Chúc mừng bạn đã đăng ký thành công tài khoản ezCloud. Liên kết xác nhận tài khoản sẽ được gửi vào địa chỉ email bạn đã dùng để đăng ký. Nếu không xác nhận tài khoản, bạn có thể sẽ không đăng nhập được vào hệ thống.',
     PASSWORD_NOT_MATCH:'Mật khẩu xác nhận không trùng hợp',
     PASSWORD_VALIDATION_LENGTH:'Mật khẩu 6-20 ký tự. ',
     PASSWORD_VALIDATION_PATTERN:'Mật khẩu phải bao gồm ít nhất 1 chữ in thường, 1 chữ in hoa, và 1 ký tự (số hoặc ký tự đặc biệt)',
     TUTORIALS:'Tutorials',
     HOTLINE:'Hotline',
     HOTEL_OWNER_INFORMATION:"Thông tin chủ khách sạn"
 };
var vnArray = [];
ezCloud.config(['$translateProvider',function ($translateProvider) {

    
    for(var idx in vnLanguageObject) {
        var item = {Key: idx, Value: vnLanguageObject[idx]};
        vnArray.push(item);
    }
    
 $translateProvider
 .translations('vn', vnLanguageObject);
    //$translateProvider.useLocalStorage();
    $translateProvider.preferredLanguage('vn');
}]);