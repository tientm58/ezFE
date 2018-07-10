
ezCloud.factory('utilsFactory', ['$location', 'loginFactory', '$rootScope', function($location, loginFactory, $rootScope){
	'use strict';

	return {
		formatMoney: function (c, d ,t)
		{
			var n = this, 
		    c = isNaN(c = Math.abs(c)) ? 2 : c, 
		    d = d == undefined ? "." : d, 
		    t = t == undefined ? "," : t, 
		    s = n < 0 ? "-" : "", 
		    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
		    j = (j = i.length) > 3 ? j % 3 : 0;
		   	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		},
		serialize : function(obj) 
		{
		  var str = [];
		  for(var p in obj)
		    if (obj.hasOwnProperty(p)) {
		      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		    }
		  return str.join("&");
		},
		sendGetRequest: function(api, data)
		{
			data = data && data.constructor === Object ? this.serialize(data) : ""; 

			return $rootScope.dataLoadingPromise = loginFactory.securedGet(api, data, true);
		},
		securedPostJSON: function (api, data) {
          	return $rootScope.dataLoadingPromise = loginFactory.securedPostJSON(api, data);
        },
		getPaginationInstance: function(config)
		{
			var self = this;
			var _config = {
					PageNumber: config && config['PageNumber'] ? config['PageNumber'] : 1,
					PageSize: config && config['PageSize'] ? config['PageSize'] : 10,
					order: config && config['order'] ? config['order'] : 'name',
				};

			var pagination = {
				config: {
					limitPagination: (config && config['limitPagination'] ? config['limitPagination'] : [5, 10, 15]),
					label: config && config['label'] ? config['label'] : {page: 'page:', rowsPerPage: 'rowsPerPage:', of: 'of'},
					totalItems : (config && config['totalItems'] ? config['totalItems'] : (config && config['PageSize'] ? config['PageSize'] : 10))
				},
				query : _config,
				bindingData : function(pageNumber, pageSize, filter)
				{
					pageNumber -= 1;
					var data = config && config['dataFilter'] ? config['dataFilter'] : {};
					var temp = angular.copy(_config, {});
					
					data = angular.extend(data, angular.extend(temp, {PageNumber: pageNumber, PageSize: pageSize}));
					
					if (filter)
						data = angular.extend(data, filter);

					var promise = self.sendGetRequest(
						config && config['api'] ? config['api'] : '',
						data,
						true
					);

					$rootScope.dataLoadingPromise = promise;

					var successCallBack = config && config['successCallBack'];
					successCallBack = angular.isFunction(successCallBack) ? successCallBack : function(){};

					if(promise)
						promise.success(function(response){
							successCallBack(response);
						});

					return promise;
				}
			}

			return pagination;
		}
	}
}]);