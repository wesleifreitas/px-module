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
angular.module('px-mask-util', [])
    .factory('pxMaskUtil', pxMaskUtil);

pxMaskUtil.$inject = [];

function pxMaskUtil() {

    var service = {};

    var tokens = {
        '0': {
            pattern: /\d/,
            _default: '0'
        },
        '9': {
            pattern: /\d/,
            optional: true
        },
        '#': {
            pattern: /\d/,
            optional: true,
            recursive: true
        },
        'S': {
            pattern: /[a-zA-Z]/
        },
        'U': {
            pattern: /[a-zA-Z]/,
            transform: function(c) {
                return c.toLocaleUpperCase();
            }
        },
        'L': {
            pattern: /[a-zA-Z]/,
            transform: function(c) {
                return c.toLocaleLowerCase();
            }
        },
        '$': {
            escape: true
        }
    };

    service.maskFormat = maskFormat;

    return service;

    function maskFormat(value, pattern, options) {

        pattern = pattern || '';
        options = options || {};
        options = {
            reverse: options.reverse || false,
            usedefaults: options.usedefaults || options.reverse
        };

        return proccess(value, pattern, options);
    }

    function isEscaped(pattern, pos) {
        var count = 0;
        var i = pos - 1;
        var token = {
            escape: true
        };
        while (i >= 0 && token && token.escape) {
            token = tokens[pattern.charAt(i)];
            count += token && token.escape ? 1 : 0;
            i--;
        }
        return count > 0 && count % 2 === 1;
    }

    function calcOptionalNumbersToUse(pattern, value) {
        var numbersInP = pattern.replace(/[^0]/g, '').length;
        var numbersInV = value.replace(/[^\d]/g, '').length;
        return numbersInV - numbersInP;
    }

    function concatChar(text, character, options, token) {
        if (token && typeof token.transform === 'function') {
            character = token.transform(character);
        }
        if (options.reverse) {
            return character + text;
        }
        return text + character;
    }

    function hasMoreTokens(pattern, pos, inc) {
        var pc = pattern.charAt(pos);
        var token = tokens[pc];
        if (pc === '') {
            return false;
        }
        return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
    }

    function insertChar(text, char, position) {
        var t = text.split('');
        t.splice(position >= 0 ? position : 0, 0, char);
        return t.join('');
    }

    function proccess(value, pattern, options) {
        if (!value) {
            return {
                result: '',
                valid: false
            };
        }
        value = value + '';
        var pattern2 = pattern;
        var valid = true;
        var formatted = '';
        var valuePos = options.reverse ? value.length - 1 : 0;
        var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
        var escapeNext = false;
        var recursive = [];
        var inRecursiveMode = false;

        var steps = {
            start: options.reverse ? pattern2.length - 1 : 0,
            end: options.reverse ? -1 : pattern2.length,
            inc: options.reverse ? -1 : 1
        };

        function continueCondition(options) {
            if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
                return true;
            } else if (!inRecursiveMode) {
                inRecursiveMode = recursive.length > 0;
            }

            if (inRecursiveMode) {
                var pc = recursive.shift();
                recursive.push(pc);
                if (options.reverse && valuePos >= 0) {
                    i++;
                    pattern2 = insertChar(pattern2, pc, i);
                    return true;
                } else if (!options.reverse && valuePos < value.length) {
                    pattern2 = insertChar(pattern2, pc, i);
                    return true;
                }
            }
            return i < pattern2.length && i >= 0;
        }

        for (var i = steps.start; continueCondition(options); i = i + steps.inc) {
            var pc = pattern2.charAt(i);
            var vc = value.charAt(valuePos);
            var token = tokens[pc];
            if (!inRecursiveMode || vc) {
                if (options.reverse && isEscaped(pattern2, i)) {
                    formatted = concatChar(formatted, pc, options, token);
                    i = i + steps.inc;
                    continue;
                } else if (!options.reverse && escapeNext) {
                    formatted = concatChar(formatted, pc, options, token);
                    escapeNext = false;
                    continue;
                } else if (!options.reverse && token && token.escape) {
                    escapeNext = true;
                    continue;
                }
            }

            if (!inRecursiveMode && token && token.recursive) {
                recursive.push(pc);
            } else if (inRecursiveMode && !vc) {
                if (!token || !token.recursive) {
                    formatted = concatChar(formatted, pc, options, token);
                }
                continue;
            } else if (recursive.length > 0 && token && !token.recursive) {
                // Recursive tokens most be the last tokens of the pattern
                valid = false;
                continue;
            } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
                continue;
            }

            if (!token) {
                formatted = concatChar(formatted, pc, options, token);
                if (!inRecursiveMode && recursive.length) {
                    recursive.push(pc);
                }
            } else if (token.optional) {
                if (token.pattern.test(vc) && optionalNumbersToUse) {
                    formatted = concatChar(formatted, vc, options, token);
                    valuePos = valuePos + steps.inc;
                    optionalNumbersToUse--;
                } else if (recursive.length > 0 && vc) {
                    valid = false;
                    break;
                }
            } else if (token.pattern.test(vc)) {
                formatted = concatChar(formatted, vc, options, token);
                valuePos = valuePos + steps.inc;
            } else if (!vc && token._default && options.usedefaults) {
                formatted = concatChar(formatted, token._default, options, token);
            } else {
                valid = false;
                break;
            }
        }

        return {
            result: formatted,
            valid: valid
        };
    }
}
angular.module('px-string-util', [])
    .factory('pxStringUtil', pxStringUtil);

pxStringUtil.$inject = [];

function pxStringUtil() {

    var service = {};

    service.pad = pad;
    service.toBinary = toBinary;

    return service;

    /**
     * Preencher string
     * Note que é utizado o parâmetro pré-preenchimento (pad) devido a perfomance
     * Mais detalhes em http://jsperf.com/string-padding-performance
     * @param  {String}  pad     pré-preenchimento, exemplo '0000000000'
     * @param  {String}  str     string que será preenchida
     * @param  {Boolean} padLeft preencher à esquerda?
     * @return {String}          string preenchida
     */
    function pad(pad, str, padLeft) {
        if (typeof str === 'undefined')
            return pad;
        if (padLeft) {
            return (pad + str).slice(-pad.length);
        } else {
            return (str + pad).substring(0, pad.length);
        }
    }

    /**
     * Calcular a representação binária dos dados codificados em Base64 ou de um documento PDF
     * @param  {String} data        dados codificado em Base64
     * @param  {String} contentType natureza do arquivo. http://www.freeformatter.com/mime-types-list.html
     * @param  {Number} sliceSize   tamanho
     * @return {String}             Representação binária dos dados
     */
    function toBinary(data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }
}
angular.module('px-util', [])
    .factory('pxUtil', pxUtil);

pxUtil.$inject = [];

function pxUtil(pxConfig) {
        var service = {};
        service.filterOperator = filterOperator;
        service.setFilterObject = setFilterObject;
        service.getFieldValueObject = getFieldValueObject;
        service.isMobile = isMobile;
        return service;
        /**
         * Preparar o valor do filtro de acordo com seu operator
         * @param  {string} value    valor do filtro
         * @param  {string} operator operador, exemplos: "=", "%LIKE%"
         * @return {string}          filtro
         */
        function filterOperator(value, operator) {
            // Regras de filtro por Operator
            switch (operator) {
                case '%LIKE%':
                case '%LIKE':
                case 'LIKE%':
                    // Valor do filtro recebe '%' o filterOperator possua '%'
                    // Por exemplo:
                    // Se operator for igual a '%LIKE%' e valor do filtro (value) for 'teste'
                    // Neste caso 'LIKE' é substituido por 'teste' 
                    // Portanto o valor final do filtro será  '%teste%'
                    return operator.toUpperCase().replace('LIKE', value);
                    //break;
                default:
                    return value;
                    //break;
            }
        }
        /**
         * Definir filterObject de campos
         * @param {array}  array        campos que serão processados
         * @param {Boolean} isPxForm    são campos de um px-form?
         * @param {String} groupTable   tabela de grupo
         */
        function setFilterObject(array, isPxForm, groupTable) {
            // Verificar se array está no formato JSON
            if (typeof array === 'string') {
                array = JSON.parse(array);
            }
            // Loop na array
            angular.forEach(array, function(index) {
                if (index.filterGroup) {
                    index.field = index.field || getGroupConfig(groupTable).item;
                    index.type = 'int';
                    index.filterOperator = '=';
                    index.filterOptions = index.filterOptions || {
                        field: getGroupConfig(groupTable).item,
                        selectedItem: getGroupConfig().item
                    };
                }
                // Valor do filtro
                index.filterObject = {};
                // Verificar se operação é IN
                // Exemplo: SELECT * FROM MY_TABLE WHERE FIELD1 IN (1,2,3)
                if (index.filterOperator === 'IN') {
                    // Indicar que o valor do filtro é uma lista
                    index.filterList = true;
                } else {
                    // Indicar que o valor do filtro NÃO é uma lista
                    index.filterList = false;
                }
                // Verificar se possui campo de filtro
                // Caso possua campo de filtro será definido o 'filterObject'
                // filterObject armazena dados do filtro que será realizado no campo
                if (angular.isDefined(index.filter)) {
                    var selectorName = '#' + index.filter;
                    var selectorValue = index.filter;

                    // Verifica se o filtro group
                    if (index.filterGroup) {
                        selectorName += '_groupSearch_inputSearch';
                        selectorValue = 'selectedItem';
                    }
                    // Verificar se o filtro é um px-input-search
                    else if (angular.isDefined(angular.element($(selectorName + '_inputSearch').get(0)).scope())) {
                        selectorName += '_inputSearch';
                        selectorValue = 'selectedItem';
                    }
                    // Verifica seu o scope do elemento angular possui valor definido
                    if (angular.isDefined(angular.element($(selectorName).get(0)).scope()) && angular.element($(selectorName).get(0)).scope().hasOwnProperty(selectorValue)) {
                        // filtro
                        var filter = angular.element($(selectorName).get(0)).scope()[selectorValue];
                        // Se filtro for undefined, o filtro será considerado inválido
                        if (!angular.isDefined(filter)) {
                            return;
                        }

                        var tempField = index.field;
                        var tempValue = filter;

                        // Se possuir configuração avançada de fitro (filterOptions)
                        if (angular.isDefined(index.filterOptions)) {
                            tempField = index.filterOptions.field;
                            // value recebe o que foi configurado em index.filterOptions.selectedItem
                            // por exemplo se o filtro for um select, o ng-model pode ser um objeto {id: 1, name: 'teste'}
                            // neste caso é necessário definir qual chave do objeto representa o valor a ser filtrado
                            if (filter) {
                                tempValue = filter[index.filterOptions.selectedItem];
                                if (!angular.isDefined(tempValue)) {
                                    tempValue = filter[index.filterOptions.selectedItem.toUpperCase()];
                                }
                                if (tempValue === '%') {
                                    tempValue = null;
                                }
                            } else {
                                tempValue = null;
                            }
                        }
                        if (tempValue !== null && tempValue !== '') {
                            // Define o objeto de filtro do campo
                            // field é nome do campo que será filtro no banco de dados
                            // value é valor do campo, o qual será filtrado                        
                            index.filterObject = {
                                field: tempField,
                                value: tempValue
                            };
                        } else {
                            index.filterObject = {};
                        }
                    } else {
                        // Se não possuir um valor válido no ng-model o valor recebe vazio
                        index.filterObject = {};
                    }
                    // Armazenar valor do filtro que será enviado ao back-end
                    index.filterObject.value = filterOperator(index.filterObject.value, index.filterOperator);
                } else if (angular.isDefined(index.filterValue)) {
                    index.filterObject = {
                        field: index.field,
                        value: filterOperator(index.filterValue, index.filterOperator)
                    };
                }
            });
            return array;
        }
        /**
         * Retonar valor de uma estrutura de campo px-project
         * @param  {Object} object Estrutura do campo, por exemplo {element: txtName}
         * @return {String}        Valor da estrutura de campo px-project
         */
        function getFieldValueObject(object) {
            // Definir nome do seletor
            var selectorName = '#' + object.filter;
            var selectorValue = document.getElementById(object.filter).getAttribute('ng-model');

            if (angular.isDefined(angular.element($(selectorName + '_inputSearch').get(0)).scope())) {
                selectorName += '_inputSearch';
                selectorValue = 'selectedItem';
            }

            var element = angular.element($(selectorName).get(0));

            // Verificar seu o scope do elemento angular possui valor definido
            if (angular.isDefined(element.scope()) && element.scope().hasOwnProperty(selectorValue)) {
                var value = angular.element($(selectorName).get(0)).scope()[selectorValue];

                if (!angular.isDefined(value)) {
                    return {
                        value: null,
                        element: element
                    };
                }
                if (angular.isDefined(object.fieldValueOptions)) {
                    if (value) {
                        value = value[object.fieldValueOptions.selectedItem];
                        if (!angular.isDefined(value)) {
                            value = value[object.fieldValueOptions.selectedItem.toUpperCase()];
                        }
                        if (value === '%') {
                            return {
                                value: null,
                                element: element
                            };
                        }
                    } else {
                        return {
                            value: null,
                            element: element
                        };
                    }
                }
                return {
                    value: value,
                    element: element
                };
            } else {
                return {
                    value: null,
                    element: element
                };
            }
        }
        /**
         * Retornar configuração group
         * @return {Object} configuração group
         */
        function getGroupConfig(table) {
            var group = {};
            table = table || pxConfig.GROUP_TABLE;
            if (pxConfig.GROUP_SUFFIX === '') {
                group.item = pxConfig.GROUP_ITEM;
                group.label = pxConfig.GROUP_LABEL;
            } else {
                group.item = table + '_' + pxConfig.GROUP_ITEM_SUFFIX;
                group.label = table + '_' + pxConfig.GROUP_LABEL_SUFFIX;
                for (var i = 0; i < pxConfig.GROUP_REPLACE.length; i++) {
                    group.item = group.item.replace(pxConfig.GROUP_REPLACE[i], '');
                    group.label = group.label.replace(pxConfig.GROUP_REPLACE[i], '');
                }
            }
            return group;
        }
        /**
         * Verificar se o acesso ao sistema é via mobile browser verificando o user agent
         * @return {Boolean}
         */
        function isMobile() {
            var userAgent = navigator.userAgent.toLowerCase(); // jshint ignore:line
            if (userAgent.search(/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i) !== -1) {
                return true;
            } else {
                return false;
            }
        }
    }