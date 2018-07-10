ezCloud.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
}).directive('ezFocus', ['$timeout', function($timeout) {
  return {
    scope: { trigger: '=ezFocus' },
    link: function(scope, element) 
    {
      scope.$watch('trigger', function(value) 
      {
        if(value === true) 
        { 
            element[0].focus();
            scope.trigger = false;
        }
      });
    }
  };
}]);