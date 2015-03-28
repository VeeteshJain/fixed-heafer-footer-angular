
var app = angular.module('demo', ['fixedHeaderFooter']);

app.controller('demoCtrlOne', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
	debugger;
	$scope.tableOne = {
		'height': 300,
		'width': 300
	};

	$scope.fixedHeaderFooterOne = {
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