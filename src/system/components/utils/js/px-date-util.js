angular.module('px-date-util', [])
    .factory('pxDateUtil', pxDateUtil);

pxDateUtil.$inject = [];

function pxDateUtil() {

    var service = {};
    // Verificar se moment não está definido e se require está definido
    if (typeof moment === 'undefined' && typeof require !== 'undefined') {
        service.moment = require('moment');
    } else if (typeof moment === 'function') {
        service.moment = moment;
    } else {
        service.moment = function() {
            console.error('pxDateUtil:', 'moment.js não importada');
        };
    }

    service.dateAdd = dateAdd;
    service.months = months;

    return service;

    /**
     * Adicionar unidades de tempo para uma data
     * @param  {String} datepart yyyy: Year | q: Quarter | m: Month | y: Day of year | d: Day | w: Weekday | ww: Week | h: Hour | n: Minute | s: Second | l: Millisecond
     * @param  {string} number  Número de unidades do datepart para adicionar à data ( positivo , para obter datas no futuro ; negativo , para obter datas no passado ) . Número deve ser um inteiro.         
     * @return {Date} date Data
     */
    function dateAdd(datepart, number, date) {
        switch (datepart) {
            case "yyyy": // Year
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "q": // Quarter
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "m": // Month
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "y": // Day of year
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "d": // Day
                date.setDate(date.getDate() + number);
                break;
            case "w": // Weekday
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "ww": // Week
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "h": // Hour
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "n": // Minute
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "s": // Second
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
            case "l": // Millisecond
                console.warn('pxDateUtil:', 'datepart não desenvolvido no dateAdd');
                alert('pxDateUtil: datepart não desenvolvido no dateAdd');
                break;
        }
        return date;
    }

    function months(showAll) {

        var arrayData = [];

        if (showAll) {
            arrayData.push({
                name: 'Todos',
                id: '%'
            });
        }

        for (var i = 0; i < moment.months().length; i++) {
            arrayData.push({
                name: moment.months()[i],
                id: i
            });
        }

        return arrayData;
    }
}