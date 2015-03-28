
var app = angular.module('demo', ['fixedHeaderFooter']);

app.controller('demoCtrlOne', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
	$scope.tableOne = {
		'height': 300,
		'width': 300
	};

	$scope.fixedHeaderFooterTopIds = ['oneTop'];
	$scope.fixedHeaderFooterBottomIds = ['oneBottom'];
	$scope.fixedHeaderFooterOne = {
		topId: 'oneTop',
		bottomId: 'oneBottom',
		type: 'thead-tfoot',
		onRegisterApi: function(options, refreshCallback){
			$scope.tableOne.refresh = function(){
				$timeout(function(){
					refreshCallback.call(this);
				});
			};
		}
	};
	$scope.$watch('tableOne', function(){
		$scope.tableOne.refresh ? $scope.tableOne.refresh() : '';
	}, true);
	$scope.addPx = function(style){
		return style+'px';
	};

	$http.get('500_data.json').then(function(response){
		$scope.complexTableOne = response.data;
		$scope.tableOne.refresh ? $scope.tableOne.refresh() : '';
	});
}]);