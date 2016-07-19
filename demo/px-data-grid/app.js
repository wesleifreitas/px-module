var app = angular.module('demo', ['pxConfig', 'px-data-grid']);

app.controller('DataGridCtrl', ['$scope', '$locale', function($scope, $locale) {

    // Definir language da lib numeral.js
    // http://numeraljs.com/                                                               
    numeral.language('pt-br');
    // Definir locale da lib moment.js
    // http://momentjs.com/docs/
    moment.locale('pt-BR');

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
                type: 'varchar',
                stringMask: '###.###.###-##'
            }, {
                title: 'Data',
                field: 'data',
                type: 'date',
                moment: 'dddd - DD/MM/YYYY'
            }]
        };

        $scope.countRow = 1;
        $scope.addDataRow = function() {
            $scope.dgExemploControl.getData();
            $scope.dgExemploControl.addDataRow({
                "id": $scope.countRow++,
                "nome": "Weslei Freitas",
                "cpf": "11111111111",
                "data": new Date()
            })
        }

        $scope.removeRow = function() {
            $scope.dgExemploControl.removeRow('.selected');
        }
    };
}]);