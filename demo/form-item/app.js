var app = angular.module('demo', ['px-form-item']);

app.controller('FormItemCtrl', ['$scope', '$locale', function($scope, $locale) {

	// Definir language da lib numeral.js
	// http://numeraljs.com/                                                               
	numeral.language('pt-br');

	$scope.enter = function() {
		$scope.enterTime = new Date();
	};
}]);