var app = angular.module('demo', ['pxConfig', 'px-data-grid']);

app.config(function(pxConfig) {

  // Definir language da lib numeral.js
  // http://numeraljs.com/                                                               
  numeral.language('pt-br');
  // Definir locale da lib moment.js
  // http://momentjs.com/docs/
  moment.locale('pt-BR');
});

app.controller('DataGridCtrl', ['$scope', '$locale', function($scope, $locale) {
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

    $scope.getData = function() {
      $scope.dgExemploControl.getData();
    }

    $scope.countRow = 1;
    $scope.addDataRow = function() {

      $scope.dgExemploControl.addDataRow({
        "id": $scope.countRow++,
        "nome": "Nome " + Math.floor((Math.random() * 100000) + 1),
        "cpf": Math.floor((Math.random() * 10000000000) + 1000000000),
        "data": new Date()
      })

    }

    $scope.removeRow = function() {
      $scope.dgExemploControl.removeRow('.selected');
    }
  };
}]);