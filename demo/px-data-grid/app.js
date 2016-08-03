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
     * Configurações da listagem
     * - fields: Colunas da listagem
     * @type {Object}
     */
    $scope.dgExemploConfig = {
        url: 'data.json',
        fields: [{
            link: true,
            linkId: 'sampleIcon',
            title: '',
            class: 'material-icons',
            icon: 'done',
            value: '',
            align: 'center'
        }, {
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
        }, {
            class: 'fa fa-battery-empty',
            icon: '',
            title: 'Label Function',
            field: 'bateria',
            type: 'numeric',
            label: 'bateria',
            align: 'center'
        }, {
            title: 'Status',
            field: 'status',
            type: 'numeric',
            label: 'status',
            align: 'center'
        }]
    };

    $scope.dgExemploLabel = function(event) {
        if (event.item.label === 'bateria') {
            event.item.class = 'fa fa-battery-' + event.data.bateria;
        } else if (event.item.label === 'status') {
            if (event.data.status === 1) {
                event.data.status = '<span class="label label-success">ATIVO</span>';
            } else {
                event.data.status = '<span class="label label-warning">PENDENTE</span>';
            }
        }

        return event;
    };

    $scope.getData = function() {
        $scope.dgExemploControl.getData();
    };

    $scope.countRow = 105;
    $scope.addDataRow = function() {
        $scope.dgExemploControl.addDataRow({
            'id': $scope.countRow++,
            'nome': 'Nome ' + Math.floor((Math.random() * 100000) + 1),
            'cpf': Math.floor((Math.random() * 10000000000) + 1000000000),
            'data': new Date(),
            'bateria': Math.floor((Math.random() * 4) + 1),
            'status': Math.floor((Math.random() * 2))
        })
    };

    $scope.removeRow = function() {
        $scope.dgExemploControl.removeRow('.selected');
    };

    $scope.itemClick = function(event) {
        if (event.itemClick.linkId === 'sampleIcon') {
            console.info('itemClick', event);
            alert('Você clicou no ícone');
        }
    };

    /**
     * Evento inicializar
     * @return {Void}
     */
    $scope.dgExemploInit = function(event) {
        // Recuperar dados
        $scope.dgExemploControl.getData();
    }
}]);