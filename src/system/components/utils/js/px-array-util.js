angular.module('px-array-util', [])
    .factory('pxArrayUtil', pxArrayUtil);

pxArrayUtil.$inject = [];

function pxArrayUtil() {

    var service = {};

    service.sortOn = sortOn;
    service.getIndexByProperty = getIndexByProperty;

    return service;

    /**
     * Ordenar array de objetos
     * 
     * Exemplo: myArray = [{label: 'a', data: 0}, {label: 'b', data: 1}]
     * 
     * Ordenar pela chave 'data' do maior para menor: 
     * myArray.sort(sortOn('data', true, parseInt));
     * 
     * Ordenar pela chave 'label' utilizando case-insensitive (A-Z): 
     * myArray.sort(sortOn('label', false, function(a){return a.toUpperCase()}));
     * 
     * @param  {string} field       campo que será utilizada para ordenar
     * @param  {boolean} reverse    reverter ordem?
     * @param  {type} sortAscending regras da ordenação
     * @return {array}              retorna array ordenada
     */
    function sortOn(field, reverse, primer) {

        var key = primer ?
            function(x) {
                return primer(x[field]);
            } :
            function(x) {
                return x[field];
            };

        reverse = !reverse ? 1 : -1;

        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    }
    /**
     * Retornar index da array pelo valor de uma propriedade
     * @param  {array} array array
     * @param  {string} property  nome do propriedade a ser comparada
     * @param  {string} value valor a ser comparado com o propriedade
     * @return {number} index da array
     */
    function getIndexByProperty(array, property, value) {
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i][property] === value) {
                return i;
            }
        }
        return -1;
    }
}