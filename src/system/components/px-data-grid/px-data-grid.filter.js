angular.module('px-data-grid.filter', [])
	.filter('dataGridRefresh', [function() {
		return function(working) {
			// Verifica working da px-data-grid
			// Class no botão Atualizar (Listagem)
			if (working) {
				return 'fa fa-refresh fa-spin';
			} else {
				return 'fa fa-refresh';
			}
		}
	}]);