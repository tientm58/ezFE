var _ues = {
host:'ezcloud.userecho.com',
forum:'1',
lang:'en',
tab_corner_radius:5,
tab_font_size:20,
tab_image_hash:'ZmVlZGJhY2s%3D',
tab_chat_hash:'Y2hhdA%3D%3D',
tab_alignment:'right',
tab_text_color:'#ffffff',
tab_text_shadow_color:'#00000055',
tab_bg_color:'#57a957',
tab_hover_color:'#f45c5c'
};
var hash = window.location.hash;
if (hash !== '#/extendedScreen') {
(function() {
    var _ue = document.createElement('script'); _ue.type = 'text/javascript'; _ue.async = true;
    _ue.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.userecho.com/js/widget-1.4.gz.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(_ue, s);
  })();
}