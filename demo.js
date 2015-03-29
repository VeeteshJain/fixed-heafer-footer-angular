
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

	$scope.cols = {
		id: {'isSelected': true},
		balance: {'isSelected': true},
		age: {'isSelected': true},
		name: {'isSelected': true},
		company: {'isSelected': true},
		email: {'isSelected': true},
		friends: {'isSelected': true},
		address: {'isSelected': true}
	};
	$scope.$watch('cols', function(){
		$scope.tableOne.refresh ? $scope.tableOne.refresh() : '';
	}, true);

	$http.get('500_data.json').then(function(response){
		$scope.complexTableOne = response.data.splice(0, 30);
		$scope.tableOne.refresh ? $scope.tableOne.refresh() : '';
	});
}]);