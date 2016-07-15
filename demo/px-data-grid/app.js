var app = angular.module('demo', ['pxConfig', 'px-util', 'px-array-util', 'px-mask-util', 'px-string-util', 'px-data-grid']);

app.controller('DataGridCtrl', ['$scope', '$locale', function($scope, $locale) {

    // Definir language da lib numeral.js
    // http://numeraljs.com/                                                               
    numeral.language('pt-br');

    /**
     * Controle da listagem
     * Note que a propriedade 'control' da directive px-data-grid é igual a 'dgExemplo'
     * Exemplo: <px-data-grid px-control='dgExemplo'>
     * @type {Object}
     */
    $scope.dgExemploControl = {};

    /**
     * Inicializa listagem
     * @return {Void}
     */
    $scope.dgExemploInit = function() {
        /**
         * Configurações da listagem
         * - fields: Colunas da listagem
         * @type {Object}
         */
        $scope.dgExemploConfig = {
            group: false,
            fields: [{
                title: 'Nº',
                field: 'id',
                type: 'int'
            }, {
                title: 'Nome',
                field: 'nome',
                type: 'varchar'
            }, {
                title: 'CPF',
                field: 'cpf',
                type: 'varchar'
            }, {
                title: 'Data',
                field: 'data',
                type: 'date'
            }]
        };

        $scope.countRow = 1;
        $scope.addDataRow = function() {
            $scope.dgExemploControl.addDataRow({
                "id": $scope.countRow++,
                "nome": "Weslei Freitas",
                "cpf": "123456789",
                "data": "2016-07-14T18:43:59.030Z"
            })
        }

        $scope.removeRow = function() {
            $scope.dgExemploControl.removeRow('.selected');
        }
    };
}]);