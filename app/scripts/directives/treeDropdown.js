ezCloud.directive('treeDropdown', ['$compile', treeDropdown]);

function treeDropdown($compile) 
{
    var template = "<div class='select' ng-click='openTree()'><p>{{parent.Name}}</p></div>";
    template += "<div class='list' ng-show='isOpen'></div>";

    function treeDropdownController($scope, $element) 
    {
        ctrl = $scope;
        ctrl.isOpen = false;
        ctrl.openTree = function() 
        {
            ctrl.isOpen = !ctrl.isOpen
        }
        ctrl.childClick = function(obj) 
        {
            if(ctrl.isAddInvoice && !obj.IsLeaf)
                return;

            setSelected(ctrl, obj);
            ctrl.isOpen = false;
            ctrl.$apply();
        }
    }

    treeDropdownController.$inject = ['$scope', '$element'];

    function getOptions(scope, data, level) 
    {
        var optionUL = angular.element("<ul></ul>");
        angular.forEach(data, function(obj) {
            var isDisable = scope.isAddInvoice && !obj.IsLeaf;
            var optionLI = angular.element("<li></li>");
            var optionA = angular.element("<p ng-class='{selected:selectedElement.PaymentTypeDetailId==" + obj.PaymentTypeDetailId + ", disable: " + isDisable +"}' class='level-" + level + "'>" + (level > 0 ? "---" : "") + obj.Name + "</p>");
            optionLI.append(optionA);
            if (scope.selectedElement == obj) {
                setSelected(scope, obj);
            }
            optionA.bind("click", function() {
                scope.childClick(obj);
            })
            if (obj.ChildNodes) {
                optionLI.append(getOptions(scope, obj.ChildNodes, level + 1));
            }
            optionUL.append(optionLI);
        })
        return optionUL;
    }

    function setSelected(scope, obj) 
    {
        if (obj) {
            scope.selectedElement = obj;
            scope.parent = obj;
        } else {
            scope.selectedElement = null;
            scope.parent = null;
        }
    }
    
    return {
        restrict: 'E',
        scope: {
            data: '=',
            selected: '=',
            parent: '=',
            isAddInvoice: '='
        },
        template: template,
        controller: treeDropdownController,
        link: function(scope, element, attrs, ngModel) {
            var list = angular.element(element[0].querySelector('.list'));
            scope.$watchGroup(['data', 'selectedElement'], function(newValues, oldValues, scope) {
                list.html('');
                if (!scope.selectedElement)
                    setSelected(scope, null);
                
                var options = getOptions(scope, scope.data, 0);
                list.append($compile(options)(scope));
            });

            angular.element(document).bind('click', function(event) {
                if (element !== event.target && !element[0].contains(event.target)) {
                    scope.$apply(function() {
                        scope.isOpen = false;
                    })
                }
            });
        }
    };
}