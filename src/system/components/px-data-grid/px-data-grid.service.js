angular.module('px-data-grid.service', [])
    .factory('pxDataGridService', pxDataGridService);

pxDataGridService.$inject = ['pxConfig', '$http', '$rootScope'];

function pxDataGridService(pxConfig, $http, $rootScope) {
    var service = {};

    service.select = select;
    service.remove = remove;

    return service;

    function select(data, callback) {
        data.dsn = pxConfig.PROJECT_DSN;
        data.cfcPath = pxConfig.PX_CFC_PATH;
        data.method = data.method || 'POST'; 

        if (data.url === '') {
            data.url = '../../../rest/px-project/system/px-data-grid/getData';
        }

        try {
            data.user = $rootScope.globals.currentUser.usu_id;
        } catch (error) {
            data.user = -1;
        }

        if (!angular.isDefined(data.orderBy)) {
            data.orderBy = '';
        }

        if (!angular.isDefined(data.groupItem)) {
            data.groupItem = '';
        }

        if (!angular.isDefined(data.groupLabel)) {
            data.groupLabel = '';
        }

        if (!angular.isDefined(data.where)) {
            data.where = '';
        }

        $http({
            method: data.method,
            url: data.url,
            data: data
        }).then(function successCallback(response) {
            callback(response);
        }, function errorCallback(response) {
            alert('Ops! Ocorreu um erro inesperado.\nPor favor contate o administrador do sistema!');
        });
    }

    function remove(data, callback) {

        data.dsn = pxConfig.PROJECT_DSN;
        data.cfcPath = pxConfig.PX_CFC_PATH;
        data.user = $rootScope.globals.currentUser.usu_id;

        $http({
            method: 'POST',
            url: '../../../rest/px-project/system/px-data-grid/removeData',
            data: data
        }).then(function successCallback(response) {
            callback(response);
        }, function errorCallback(response) {
            alert('Ops! Ocorreu um erro inesperado.\nPor favor contate o administrador do sistema!');
        });
    }
}