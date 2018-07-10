// Bắt event các tổ hợp phím ctrl + key do function gọi

var EVENT = [];
EVENT.run = function( e, key, callback ){  
	if ( e.ctrlKey && ( String.fromCharCode(e.which) === key || String.fromCharCode(e.which) === key.toUpperCase() ) ) { 
		e.preventDefault(); 
		callback();
	}
}