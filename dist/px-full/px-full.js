(function() {
	'use strict';

	// Package Phoenix Project
	var PX_PACKAGE = '';
	// Caminho de componentes ColdFusion (Phoenix Project)
	// Ex.: 'my-project.src'
	var PX_CFC_PATH = 'px-project.src' + PX_PACKAGE.replace(/\/|\\/g, ".");

	angular.module('pxConfig', [])
		.constant('pxConfig', {
			PX_PACKAGE: PX_PACKAGE, // Package Phoenix Project
			PX_CFC_PATH: PX_CFC_PATH,
			LIB: 'lib/', // Componentes externos
			PROJECT_ID: 0, // Identificação do projeto (table: px.project)
			PROJECT_NAME: 'Phoenix Project', // Nome do projeto
			PROJECT_SRC: 'px-project/src/', // Source do projeto
			PROJECT_CSS: [PX_PACKAGE + 'system/login/login.css', 'styles.css'], // Arquivos .css
			PROJECT_DSN: 'px_project_sql', // Data Source Name (CF)
			LOCALE: 'pt-BR', // Locale
			LOGIN_REQUIRED: true, // Login obrigatório?
			GROUP: false, // Agrupar dados?
			GROUP_TABLE: 'grupo', // Tabela Group
			GROUP_ITEM_SUFFIX: '', // Sufixo do campo GROUP_ITEM
			GROUP_LABEL_SUFFIX: '', // Sufixo do campo GROUP_LABEL
			GROUP_REPLACE: [], // Substituir no nome do campo GROUP
			GROUP_ITEM: 'grupo_id', // Idetificador de GROUP (Utilizar quando GROUP_ITEM_SUFFIX === '')
			GROUP_LABEL: 'grupo_nome' // Label do GROUP (Utilizar quando GROUP_LABEL_SUFFIX === '')
		});
}());
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
            if (array[i][property] == value) {
                return i;
            }
        };
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
        service.moment = require('moment')
    } else if (typeof moment === 'function') {
        service.moment = moment;
    } else {
        service.moment = function() {
            console.error('pxDateUtil:', 'moment.js não importada');
        }
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
        };

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
        if (token && typeof token.transform === 'function') character = token.transform(character);
        if (options.reverse) return character + text;
        return text + character;
    }

    function hasMoreTokens(pattern, pos, inc) {
        var pc = pattern.charAt(pos);
        var token = tokens[pc];
        if (pc === '') return false;
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
                if (!token || !token.recursive) formatted = concatChar(formatted, pc, options, token);
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
    };
}
angular.module('px-string-util', [])
    .factory('pxStringUtil', pxStringUtil);

pxStringUtil.$inject = [];

function pxStringUtil() {

    var service = {};

    service.pad = pad;

    return service;

    /**
     * Preencher string
     * Note que é utizado o parâmetro pré-preenchimento (pad) devido a perfomance
     * Mais detalhes em http://jsperf.com/string-padding-performance
     * @param  {String} pad     pré-preenchimento, exemplo '0000000000'
     * @param  {String} str     string que será preenchida
     * @param  {Boolean} padLeft preencher à esquerda?
     * @return {String}         string preenchida
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
            var table = table || pxConfig.GROUP_TABLE;
            if (pxConfig.GROUP_SUFFIX === '') {
                group.item = pxConfig.GROUP_ITEM;
                group.label = pxConfig.GROUP_LABEL;
            } else {
                group.item = table + '_' + pxConfig.GROUP_ITEM_SUFFIX;
                group.label = table + '_' + pxConfig.GROUP_LABEL_SUFFIX;
                for (var i = 0; i < pxConfig.GROUP_REPLACE.length; i++) {
                    group.item = group.item.replace(pxConfig.GROUP_REPLACE[i], '');
                    group.label = group.label.replace(pxConfig.GROUP_REPLACE[i], '');
                };
            }
            return group;
        }
        /**
         * Verificar se o acesso ao sistema é via mobile browser verificando o user agent
         * @return {Boolean}
         */
        function isMobile() {
            var userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.search(/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i) != -1) {
                return true;
            } else {
                return false;
            }
        }
    }
angular.module('px-form-item', ['ui.mask'])
	// pxEnter
	// Chamar função ao teclar Enter
	.directive('pxEnter', [function() {
		return function(scope, element, attrs) {
			element.bind('keydown keypress', function(event) {
				if (event.which === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.pxEnter);
					});
					event.preventDefault();
				}
			});
		};
	}])
	// Validar campos
	// http://stackoverflow.com/questions/18063561/access-isolated-parent-scope-from-a-transcluded-directive
	// http://stackoverflow.com/questions/21488803/how-does-one-preserve-scope-with-nested-directives
	// https://groups.google.com/forum/#!topic/angular/BZqs4TXyOcw 
	.directive('pxShowError', ['$timeout', '$rootScope', function($timeout, $rootScope) {
		return {
			restrict: 'E',
			require: '^form',
			replace: true,
			transclude: false,
			template: '<p class="help-block px-show-error">{{error}}</p>',
			scope: {
				element: '@pxElement',
				confirm: '@pxConfirm',
				confirmError: '@pxConfirmError',
				minLengthError: '@pxMinlengthError'
			},
			link: function(scope, element, attrs, formCtrl) {
				// Chama evento px-init
				$timeout(scope.init, 0);
			},
			controller: ['$scope', function($scope) {
				// Inicializar validação
				$scope.init = function() {

					// Armazena mensagem de erro de validação
					$scope.error = '';

					var selectorName = '#' + $scope.element;

					// Verificar se é filtro group
					if (angular.isDefined(angular.element($(selectorName + '_groupSearch_inputSearch').get(0)).scope())) {
						selectorName += '_groupSearch_inputSearch';
					}
					// Verificar se o filtro é um px-complete
					else if (angular.isDefined(angular.element($(selectorName + '_inputSearch').get(0)).scope())) {
						selectorName += '_inputSearch';
					}

					// Elemento que será validado
					var _element = angular.element($(selectorName).get(0));
					// ngModelController do elemento
					var _ngModelCtrl = _element.data('$ngModelController');

					var _confirm = angular.element($('#' + $scope.confirm).get(0));
					var _confirmModelCtrl = _confirm.data('$ngModelController');

					// Eventos keyup blur
					_element.on('keyup blur', function(event) {

						if (!angular.isDefined(_ngModelCtrl)) {
							return;
						}

						// Verificar se possui campo de confirmação
						if (angular.isDefined($scope.confirm)) {
							if (String(_confirmModelCtrl.$modelValue) !== String(_ngModelCtrl.$modelValue)) {
								//_ngModelCtrl.$error.confirm = true;
								_ngModelCtrl.$setValidity('confirm', false);
							} else {
								//_ngModelCtrl.$error.confirm = null;
								_ngModelCtrl.$setValidity('confirm', true);
							}
						}

						// Verificar ser o elemento está inválido
						if (_ngModelCtrl.$invalid) {
							$scope.$apply(function() {
								if (_ngModelCtrl.$error.deps) {
									$scope.error = _element.scope().depsError;
								} else if (_ngModelCtrl.$error.required || _ngModelCtrl.$error.requiredsearch) {
									$scope.error = 'Campo obrigatório';
								} else if (_ngModelCtrl.$error.email) {
									$scope.error = 'E-mail inválido';
								} else if (_ngModelCtrl.$error.minlength) {
									$scope.error = $scope.minLengthError;
								} else if (_ngModelCtrl.$error.unique) {
									$scope.error = 'Campo já existente';
								} else if (_ngModelCtrl.$error.confirm) {
									if (!angular.isDefined($scope.confirmError)) {
										$scope.error = 'Campo não confere';
									} else {
										$scope.error = $scope.confirmError;
									}
								} else {
									console.warn('px-show-error:', '$error ausente', _ngModelCtrl.$error);
								}
							});

							_element.css({
								borderColor: '#A94442' //'#DF0707'
							});
						} else {
							$scope.$apply(function() {
								$scope.error = '';
							});

							_element.css({
								borderColor: '#CCCCCC'
							});
						}
					});
				}
			}]
		};
	}])
	// pxValidNumber
	// Digitar somente números
	.directive('pxValidNumber', [function() {
		return {
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				ngModelCtrl.$parsers.push(function(value) {
					var clean = value.replace(/[^0-9]+/g, '');
					if (value !== clean) {
						ngModelCtrl.$setViewValue(clean);
						ngModelCtrl.$render();
					}
					return clean;
				});

				element.bind('keypress', function(event) {
					if (event.keyCode === 32) {
						event.preventDefault();
					}
				});
			}
		};
	}])
	// pxCnpjMask
	// 99.999.999/9999-99
	.directive('pxCnpjMask', ['$compile', function($compile) {
		return {
			priority: 100,
			restrict: 'A',
			scope: {
				cleanValue: '@cleanValue'
			},
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				// Verifica se NÃO possui uiMask definido
				if (!angular.isDefined(attrs.uiMask)) {
					// Define uiMask
					attrs.$set('uiMask', '99.999.999/9999-99');
					$compile(element)(scope);
				}

				ngModelCtrl.$parsers.push(function(value) {
					if (angular.isDefined(value)) {
						var clean = String(value).replace(/[^0-9]+/g, '');
						if (value !== clean) {
							// Atualizar campo com o valor digitado
							ngModelCtrl.$setViewValue(clean);
							//ngModelCtrl.$render();
						}
						return clean;
					}
				});
				scope.value2mask = function(value) {
					ngModelCtrl.$setViewValue(value);
				}
			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				}
			}]
		};
	}])
	// pxCpfMask
	// 999.999.999-99
	.directive('pxCpfMask', ['$compile', function($compile) {
		return {
			priority: 100,
			restrict: 'A',
			scope: {
				cleanValue: '@cleanValue'
			},
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				// Verifica se NÃO possui uiMask definido
				if (!angular.isDefined(attrs.uiMask)) {
					// Define uiMask
					attrs.$set('uiMask', '999.999.999-99');
					$compile(element)(scope);
				}

				ngModelCtrl.$parsers.push(function(value) {
					if (angular.isDefined(value)) {
						var clean = String(value).replace(/[^0-9]+/g, '');
						if (value !== clean) {
							// Atualizar campo com o valor digitado
							ngModelCtrl.$setViewValue(clean);
							//ngModelCtrl.$render();
						}
						return clean;
					}
				});

				scope.value2mask = function(value) {
					ngModelCtrl.$setViewValue(value);
				}

			},
			controller: ['$scope', function($scope) {

				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				}
			}]
		};
	}])
	// pxBrCepMask
	// 99999-999
	.directive('pxBrCepMask', ['$compile', function($compile) {
		return {
			priority: 100,
			restrict: 'A',
			scope: {
				cleanValue: '@cleanValue'
			},
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				// Verifica se NÃO possui uiMask definido
				if (!angular.isDefined(attrs.uiMask)) {
					// Define uiMask
					attrs.$set('uiMask', '99999-999');
					$compile(element)(scope);
				}

				ngModelCtrl.$parsers.push(function(value) {
					if (angular.isDefined(value)) {
						var clean = String(value).replace(/[^0-9]+/g, '');
						if (value !== clean) {
							// Atualizar campo com o valor digitado
							ngModelCtrl.$setViewValue(clean);
							//ngModelCtrl.$render();
						}
						return clean;
					}
				});

				scope.value2mask = function(value) {
					ngModelCtrl.$setViewValue(value);
				}

			},
			controller: ['$scope', function($scope) {

				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				}
			}]
		};
	}])
	// pxBrPhoneMask
	// (99) 9999-9999 / (99) 9999-9999?9
	// (99) 99999-999
	.directive('pxBrPhoneMask', ['$compile', function($compile) {
		return {
			priority: 100,
			restrict: 'A',
			scope: {
				cleanValue: '@cleanValue',
				validPhone8: '@validPhone8',
				validPhone9: '@validPhone9',
				ddd: '=pxDdd'
			},
			bindToController: false,
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				var extraNumberCompare = 11;
				if (scope.ddd === false) {
					extraNumberCompare = 9;
				}

				// Verifica se NÃO possui uiMask definido
				if (!angular.isDefined(attrs.uiMask)) {
					// Define uiMask
					if (scope.ddd !== false) {
						attrs.$set('uiMask', '(99) 9999-9999?9');
						$compile(element)(scope);
					} else {
						attrs.$set('uiMask', '9999-9999?9');
						$compile(element)(scope);
					}
				}

				scope.tempValue = scope.tempValue || '';

				// Evento focusout
				element.bind('focusout', function(event) {
					if (angular.isDefined(scope.cleanValue)) {
						if (scope.cleanValue.length < extraNumberCompare || !angular.isDefined(scope.validPhone8)) {
							// Atualizar uiMask para telefone com 8 dígitos
							if (scope.ddd !== false) {
								attrs.$set('uiMask', '(99) 9999-9999');
							} else {
								attrs.$set('uiMask', '9999-9999');
							}
							// Atualizar campo com o valor digitado e váriaveis de controle
							ngModelCtrl.$setViewValue(scope.cleanValue);
							//ngModelCtrl.$render();
							scope.validPhone9 = false;
							scope.validPhone8 = true;
						}
					}
				});

				// Evento focusin
				element.bind('focusin', function(event) {
					if (angular.isDefined(scope.cleanValue)) {
						// Verifica se o telefone digitado possui menos que 11 dígitos
						if (scope.cleanValue.length < extraNumberCompare) {
							// Atualizar uiMask para telefone com 8 dígitos, deixando um digitado a mais como opcional
							if (scope.ddd !== false) {
								attrs.$set('uiMask', '(99) 9999-9999?9');
							} else {
								attrs.$set('uiMask', '9999-9999?9');
							}
							// Atualizar campo com o valor digitado e váriaveis de controle
							ngModelCtrl.$setViewValue(scope.cleanValue);
							//ngModelCtrl.$render();
							scope.validPhone9 = false;
							scope.validPhone8 = false;
						}
					}
				});

				element.bind('keyup', function(event) {
					/*
					// Verificar se cleanValue está indefinido
					if (typeof scope.cleanValue == 'undefined') {
					   *
					    scope.cleanValue = String(event.target.value).replace(/[^0-9]+/g, '');
					    scope.validPhone9 === false;
					    scope.validPhone8 === false;
					    $(event.target).trigger('focusin');
					   
					} else {
					 */
					if (typeof scope.cleanValue !== 'undefined') {
						if (angular.isDefined(scope.cleanValue)) {
							// Se possuir 11 dígitos e não estiver validado
							// Telefone com 11 dígitos é um telefone com 9 dígitos mais dois dígitos do DDD
							if (scope.cleanValue.length === extraNumberCompare && scope.validPhone9 === false || !angular.isDefined(scope.validPhone9)) {

								// Atualizar uiMask para telefone com 9 dígitos
								if (scope.ddd !== false) {
									attrs.$set('uiMask', '(99) ?99999-9999');
								} else {
									attrs.$set('uiMask', '?99999-9999');
								}
								// Atualizar campo com o valor digitado e váriaveis de controle
								ngModelCtrl.$setViewValue(scope.cleanValue);
								//ngModelCtrl.$render();
								scope.validPhone9 = true;
								scope.validPhone8 = false;
							} else if (scope.cleanValue.length === (extraNumberCompare - 1) && scope.validPhone8 === false || !angular.isDefined(scope.validPhone8)) {

								// Atualizar uiMask para telefone com 8 dígitos
								if (scope.ddd !== false) {
									attrs.$set('uiMask', '(99) 9999-9999?9');
								} else {
									attrs.$set('uiMask', '9999-9999?9');
								}
								// Atualizar campo com o valor digitado e váriaveis de controle
								ngModelCtrl.$setViewValue(scope.cleanValue);
								//ngModelCtrl.$render();
								scope.validPhone9 = false;
								scope.validPhone8 = true;
							}
						} else {
							//console.info('keyup', scope.cleanValue);
							//console.info('keyup $scope.tempValue', scope.tempValue);
							scope.cleanValue = scope.tempValue;

							// Se possuir 11 dígitos e não estiver validado
							// Telefone com 11 dígitos é um telefone com 9 dígitos mais dois dígitos do DDD
							if (scope.cleanValue.length === extraNumberCompare && scope.validPhone9 === false || !angular.isDefined(scope.validPhone9)) {

								// Atualizar uiMask para telefone com 9 dígitos
								if (scope.ddd !== false) {
									attrs.$set('uiMask', '(99) ?99999-9999');
								} else {
									attrs.$set('uiMask', '?99999-9999');
								}
								// Atualizar campo com o valor digitado e váriaveis de controle
								//ngModelCtrl.$setViewValue(scope.cleanValue);
								//ngModelCtrl.$render();
								scope.validPhone9 = true;
								scope.validPhone8 = false;

							} else if (scope.cleanValue.length === (extraNumberCompare - 1) && scope.validPhone8 === false || !angular.isDefined(scope.validPhone8)) {

								// Atualizar uiMask para telefone com 8 dígitos
								if (scope.ddd !== false) {
									attrs.$set('uiMask', '(99) 9999-9999?9');
								} else {
									attrs.$set('uiMask', '9999-9999?9');
								}
								// Atualizar campo com o valor digitado e váriaveis de controle
								//ngModelCtrl.$setViewValue(scope.cleanValue);
								//ngModelCtrl.$render();
								scope.validPhone9 = false;
								scope.validPhone8 = true;
							}
						}
					}
				});

				ngModelCtrl.$parsers.push(function(value) {
					if (angular.isDefined(value)) {
						var clean = String(value).replace(/[^0-9]+/g, '');
						scope.cleanValue = clean;
						if (value !== clean) {
							// Atualizar campo com o valor digitado
							ngModelCtrl.$setViewValue(clean);
							//ngModelCtrl.$render();
						}
						return clean;
					}
				});

				scope.value2mask = function(value) {
					ngModelCtrl.$setViewValue(scope.cleanValue);
				}

			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				}
			}]
		};
	}])
	// pxNumberMask
	.directive('pxNumberMask', ['$filter', '$locale', function($filter, $locale) {
		return {
			restrict: 'A',
			scope: {
				cleanValue: '@cleanValue',
				currency: '=pxCurrency',
				currencySymbol: '@pxCurrencySymbol',
				numberSuffix: '@pxNumberSuffix',
				decimalSeparator: '@pxDecimalSeparator',
				thousandsSeparator: '@pxThousandsSeparator',
				numberPrecision: '@pxNumberPrecision',
				useNegative: '=pxUseNegative',
				usePositiveSymbol: '=pxUsePositiveSymbol'
			},
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {

				//console.info('$locale', $locale);
				element.css({
					zIndex: 0
				});

				if (!ngModelCtrl) {
					return;
				}

				// Número habilitados
				var enableNumbers = /[0-9]/;
				// Define se o valor será moeda
				var currency = scope.pxCurrency || false;
				// Define símbolo do valor moeda
				var currencySymbol = scope.currencySymbol || '';
				// Define sufixo
				var numberSuffix = scope.numberSuffix || '';
				// Separador de decimal
				var decimalSeparator = scope.decimalSeparator || $locale.NUMBER_FORMATS.DECIMAL_SEP;
				// Separador de milhar
				var thousandsSeparator = scope.thousandsSeparator || $locale.NUMBER_FORMATS.GROUP_SEP;
				// Número de casas decimais
				var numberPrecision = Number(scope.numberPrecision) || 2;
				// Habilitar uso de número negativos
				var useNegative = scope.useNegative || false;
				// Usar símbolo positivo (+)
				var usePositiveSymbol = scope.usePositiveSymbol || false;

				if (currency && currencySymbol === '') {
					currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
				}

				var limit = false;
				var emptyValue = true;

				ngModelCtrl.$parsers.push(function(value) {

					var clean = '';
					if (value !== '0' && (value !== '' || emptyValue === false)) {
						clean = numberFormatter(value);
					} else if (value.trim() === '0' && emptyValue === true) {
						return 0;
					} else {
						emptyValue = true;
						return '';
					}
					if (value !== clean) {
						ngModelCtrl.$setViewValue(clean);
						ngModelCtrl.$render();
					}

					if (isNaN(numeral().unformat(clean))) {
						return 0;
					} else {
						return numeral().unformat(clean);
					}
				});

				function toNumber(str) {
					var formatted = '';
					for (var i = 0; i < (str.length); i++) {
						var char_ = str.charAt(i);
						if (formatted.length === 0 && char_ === '0') {
							char_ = false;
						}
						if (char_ && char_.match(enableNumbers)) {
							if (limit) {
								if (formatted.length < limit) {
									formatted = formatted + char_;
								}
							} else {
								formatted = formatted + char_;
							}
						}
					}
					return formatted;
				}

				function fillWithZero(str) {
					if (str === '') {
						return str;
					}

					while (str.length < (numberPrecision + 1)) {
						str = '0' + str;
					}
					return str;
				}

				function numberFormatter(str) {

					if (str === '') {
						emptyValue = true;
						return str;
					} else if (str === (currencySymbol + $locale.NUMBER_FORMATS.DECIMAL_SEP)) {
						return '0';
					}

					//emptyValue = false;


					var formatted = fillWithZero(toNumber(str));
					var thousandsFormatted = '';
					var thousandsCount = 0;
					if (numberPrecision === 0) {
						decimalSeparator = '';
						centsVal = '';
					}
					var centsVal = formatted.substr(formatted.length - numberPrecision, numberPrecision);
					var integerVal = formatted.substr(0, formatted.length - numberPrecision);
					formatted = (numberPrecision === 0) ? integerVal : integerVal + decimalSeparator + centsVal;
					if (thousandsSeparator || $.trim(thousandsSeparator) !== '') {
						for (var j = integerVal.length; j > 0; j--) {
							var char_ = integerVal.substr(j - 1, 1);
							thousandsCount++;
							if (thousandsCount % 3 === 0) {
								char_ = thousandsSeparator + char_;
							}
							thousandsFormatted = char_ + thousandsFormatted;
						}
						if (thousandsFormatted.substr(0, 1) === thousandsSeparator) {
							thousandsFormatted = thousandsFormatted.substring(1, thousandsFormatted.length);
						}
						formatted = (numberPrecision === 0) ? thousandsFormatted : thousandsFormatted + decimalSeparator + centsVal;
					}
					if (useNegative && (integerVal !== 0 || centsVal !== 0)) {
						if (str.indexOf('-') !== -1 && str.indexOf('+') < str.indexOf('-')) {
							formatted = '-' + formatted;
						} else {
							if (!usePositiveSymbol) {
								formatted = '' + formatted;
							} else {
								formatted = '+' + formatted;
							}
						}
					}
					if (currencySymbol) {
						formatted = currencySymbol + formatted;
					}
					if (numberSuffix) {
						formatted = formatted + numberSuffix;
					}
					return formatted;
				}
			}
		};
	}])
	// pxGroupShow
	// Verificar Group
	.directive('pxGroupShow', ['$rootScope', '$timeout', function($rootScope, $timeout) {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, ngModelCtrl) {
				if ($rootScope.globals.currentUser.per_developer !== 1) {
					element.hide();
				}

				$timeout(function() {
					var _element = angular.element($('#' + attrs.pxGroupShow).get(0));
					var _ngModelCtrl = _element.data('$ngModelController');
					if (_ngModelCtrl) {
						_ngModelCtrl.$setValidity('required', true);
					}
				}, 0)
			}
		};
	}])
	// pxGroup
	.directive('pxGroup', ['pxConfig', '$rootScope', '$mdDialog', function(pxConfig, $rootScope, $mdDialog) {
		return {
			restrict: 'E',
			scope: {
				id: '@id',
				required: '=required',
				control: '=pxControl',
				placeholder: '@placeholder',
				inputClass: '@pxInputClass',
				//complete: '=pxComplete',
				//table: '@pxTable',
				//fields: '@pxFields',
				//orderBy: '@pxOrderBy',
				//recordCount: '@pxRecordCount',
				selectedItem: '=pxSelectedItem',
				//url: '@pxUrl',
				//responseQuery: '@pxResponseQuery',
				//localQuery: '@pxLocalQuery',
				//searchFields: '@searchfields',
				//dialog: '=pxDialog',
				searchClick: '&pxSearchClick',
				templateUrl: '@pxTemplateUrl',
				for: '@for',
				change: '&pxChange'
			},
			templateUrl: pxConfig.PX_PACKAGE + 'system/components/px-form-item/px-group.html',
			link: function(scope, element, attrs, ngModelCtrl) {
				if ($rootScope.globals.currentUser.per_developer !== 1) {
					element.hide();
					if (element.parent().children().length === 1) {
						element.parent().hide();
					}
				}

				// Tabela (SQL)
				//scope.table = pxConfig.GROUP_TABLE;

				// Configuração do input-search
				if (pxConfig.GROUP_ITEM === '' && pxConfig.GROUP_LABEL === '') {
					scope.groupSearchConfig = {
						table: pxConfig.GROUP_TABLE,
						fields: [{
							title: '',
							labelField: true,
							field: pxConfig.GROUP_TABLE + '_' + pxConfig.GROUP_LABEL_SUFFIX,
							search: true,
							type: 'string',
							filterOperator: '%LIKE%'
						}, {
							title: '',
							field: pxConfig.GROUP_TABLE + '_' + pxConfig.GROUP_ITEM_SUFFIX
						}]
					};
				} else {
					scope.groupSearchConfig = {
						fields: [{
							title: '',
							labelField: true,
							field: pxConfig.GROUP_LABEL,
							search: true,
							type: 'string',
							filterOperator: '%LIKE%'
						}, {
							title: '',
							field: pxConfig.GROUP_ITEM
						}]
					};
				}

				// How to call a method defined in an AngularJS directive?
				// http://stackoverflow.com/questions/16881478/how-to-call-a-method-defined-in-an-angularjs-directive
				scope.internalControl = scope.control || {};

				scope.internalControl.setValue = function(value) {
					scope.groupSearchControl.setValue(value);
				};

				scope.internalControl.setDefault = function(value) {
					scope.groupSearchControl.setDefault(value);
				};

				scope.groupSearchControl = {};

				scope.groupSearchClick = function() {
					if (scope.templateUrl && scope.templateUrl !== '') {
						$mdDialog.show({
							scope: scope,
							preserveScope: true,
							controller: groupSearchCtrl,
							templateUrl: scope.templateUrl,
							parent: angular.element(document.body),
							targetEvent: event,
							clickOutsideToClose: true
						});
					} else {
						scope.searchClick({
							event: event
						});
					}
				}

				scope.groupSearchChange = function(event) {
					scope.internalControl.selectedItem = scope.groupSearchControl.selectedItem;
					scope.change({
						event: event
					});
				}

				groupSearchCtrl.$inject = ['$scope', '$mdDialog'];

				function groupSearchCtrl($scope, $mdDialog) {
					$scope.callback = function(event) {
						$scope.setValue(event.itemClick);
						$mdDialog.hide();
						$scope.searchClick({
							event: event
						});
					};

					$scope.setValue = function(value) {
						$scope.groupSearchControl.setValue(value);
						//$scope.groupSearchChange(value);
					};

					$scope.setDefault = function(value) {
						$scope.groupSearchControl.setDefault(value);
					};
				}
			}
		};
	}])
	// pxInputSearch
	.directive('pxInputSearch', ['pxConfig', 'pxUtil', 'pxArrayUtil', '$parse', '$http', '$sce', '$timeout', '$mdDialog', '$compile', function(pxConfig, pxUtil, pxArrayUtil, $parse, $http, $sce, $timeout, $mdDialog, $compile) {
		return {
			restrict: 'E',
			scope: {
				debug: '=pxDebug',
				id: '@id',
				config: '@pxConfig',
				required: '=required',
				control: '=pxControl',
				placeholder: '@placeholder',
				inputClass: '@pxInputClass',
				complete: '=pxComplete',
				table: '@pxTable',
				fields: '@pxFields',
				orderBy: '@pxOrderBy',
				recordCount: '@pxRecordCount',
				where: '@pxWhere',
				selectedItem: '@pxSelectedItem',
				url: '@pxUrl',
				responseQuery: '@pxResponseQuery',
				localQuery: '@pxLocalQuery',
				searchFields: '@searchfields',
				dialog: '=pxDialog',
				searchClick: '&pxSearchClick',
				change: '&pxChange',
				dependencies: '@pxDependencies'
			},
			require: '?ngModel',
			templateUrl: pxConfig.PX_PACKAGE + 'system/components/px-form-item/px-input-search.html',
			link: function(scope, element, attrs, ngModelCtrl) {

				if (!ngModelCtrl) {
					return;
				}

				scope.inputClass = scope.inputClass || 'form-control';

				if (scope.dialog) {
					scope.inputGroup = 'input-group';
				} else {
					scope.inputGroup = '';
				}

				scope.lastSearchTerm = null;
				scope.currentIndex = null;
				scope.justChanged = false;
				scope.searchTimer = null;
				scope.hideTimer = null;
				scope.searching = false;
				scope.pause = 400;
				scope.minLength = 3;
				scope.searchStr = null;

				scope.internalControl = scope.control || {};

				scope.internalControl.working = false;
				scope.internalControl.selectedItem = null;

				scope.internalControl.setValue = function(value) {
					scope.setValue(value);
				};

				scope.internalControl.setDefault = function(value) {
					scope.setDefault(value);
				};

				scope.internalControl.getValue = function() {
					return {
						selectedItem: scope.selectedItem
					};
				};

				$timeout(function() {
					var _element = angular.element($('#' + scope.id + '_inputSearch').get(0));
					// Evento blur
					_element.on('blur', function(event) {
						scope.setValidity();
					});
					try {
						var objConfig = JSON.parse(scope.config);
						scope.table = scope.table || objConfig.table;
						scope.fields = scope.fields || objConfig.fields;
						scope.orderBy = scope.orderBy || objConfig.orderBy;
						scope.recordCount = scope.recordCount || objConfig.recordCount;
						scope.where = scope.where || objConfig.where;
						scope.dependencies = []; //scope.dependencies = scope.dependencies || objConfig.dependencies;                            
						if (Array.isArray(scope.where)) {
							for (var i = 0; i < scope.where.length; i++) {
								if (scope.where[i].required === true) {
									scope.dependencies.push(scope.where[i]);
								}
							}
						}
					} catch (error) {
						console.error('px-form-item: configuração do campo ' + scope.id + ' inválida');
					}

					if (scope.dependencies) {
						for (var i = 0; i < scope.dependencies.length; i++) {
							var result = pxUtil.getFieldValueObject(scope.dependencies[i]);
							result.element.on('blur', function(event) {
								var result = pxUtil.getFieldValueObject({
									filter: $(this).attr('id')
								});
								var element = angular.element($('#' + $(this).attr('id')).get(0));
								if (result.value === null || result.value === '' || result.value !== element.scope().oldValue) {
									scope.clear();
								}
								element.scope().oldValue = angular.copy(result.value); //angular.copy(element.scope().selectedItem);                                    
							});
						};
					}
				}, 0);

				scope.setValidity = function() {
					var _element = angular.element($('#' + scope.id + '_inputSearch').get(0));
					var _span = angular.element($('#' + scope.id + '_spanInputSearch').get(0));
					if (!angular.isDefined(scope.selectedItem) || scope.selectedItem === null) {
						ngModelCtrl.$setValidity('requiredsearch', false);
						scope.clear();
					} else {
						var searchStrQuery = '';
						if (angular.isDefined(scope.selectedItem)) {
							scope.labelField = scope.fields[pxArrayUtil.getIndexByProperty(scope.fields, 'labelField', true)].field;
							searchStrQuery = scope.selectedItem[scope.labelField];
							if (!angular.isDefined(searchStrQuery)) {
								searchStrQuery = scope.selectedItem[scope.labelField.toUpperCase()];
							}
						}
						if (scope.searchStr !== searchStrQuery) {
							scope.clear();
							ngModelCtrl.$setValidity('requiredsearch', false);
						} else {
							ngModelCtrl.$setValidity('requiredsearch', true);
							ngModelCtrl.$setValidity('required', true);
						}
					}
					$timeout(function() {
						_element.trigger('keyup');
					}, 0);
					if (attrs.required === true) {
						if (ngModelCtrl.$invalid) {
							_element.css({
								borderColor: '#A94442'
							});
							_span.css({
								borderColor: '#A94442'
							});
						} else {
							_element.css({
								borderColor: '#CCCCCC'
							});
							_span.css({
								borderColor: '#CCCCCC'
							});
						}
					}
				}

				var isNewSearchNeeded = function(newTerm, oldTerm) {
					return newTerm.length >= scope.minLength && newTerm !== oldTerm;
				};
				// px-complete - Start
				if (scope.complete !== true) {
					return;
				}
				scope.processResults = function(response, str, arrayFields) {
					if (response && response.length > 0) {

						scope.results = [];

						for (var i = 0; i < response.length; i++) {

							var textValue = '';
							var description = '';

							for (var j = 0; j < arrayFields.length; j++) {

								var tempValue = '';

								if (arrayFields[j].labelField) {

									tempValue = response[i][arrayFields[j].field];

									if (!angular.isDefined(tempValue)) {
										tempValue = response[i][arrayFields[j].field.toUpperCase()];
									}

									textValue += arrayFields[j].title + tempValue + '';
								}

								if (arrayFields[j].descriptionField) {

									tempValue = response[i][arrayFields[j].field];

									if (!angular.isDefined(tempValue)) {
										tempValue = response[i][arrayFields[j].field.toUpperCase()];
									}

									description += arrayFields[j].title + tempValue + ' ';
								}
							}

							var resultRow = {
								title: textValue,
								description: description,
								item: response[i]
							};
							scope.results[scope.results.length] = resultRow;
						}
					} else {
						scope.results = [];
					}
				};

				scope.searchTimerComplete = function(str) {
					// Início da pesquisa

					var arrayFields = scope.fields;

					if (str.length >= scope.minLength) {
						if (scope.localQuery) {

							console.warn('px-complete:', 'função localQuery não implementada!');

							scope.searching = false;
							scope.processResults(JSON.parse(scope.localQuery), str);

						} else {

							// Loop na configuração de campos
							angular.forEach(arrayFields, function(index) {
								if (index.search) {
									// Valor do filtro
									index.filterObject = {};

									index.filterObject = {
										field: index.field,
										value: pxUtil.filterOperator(str, index.filterOperator)
									};
								}
							});

							var params = {};
							params.dsn = pxConfig.PROJECT_DSN;
							params.table = scope.table;
							params.table = scope.table;
							params.fields = angular.toJson(arrayFields);
							params.orderBy = scope.orderBy;
							// Definir filterObject para os campos do scope.where
							scope.where = pxUtil.setFilterObject(scope.where, false, scope.table)
							params.where = angular.toJson(scope.where);

							if (!angular.isDefined(scope.recordCount) || scope.recordCount === '') {
								scope.recordCount = 4;
							}

							params.rows = scope.recordCount;

							if (!angular.isDefined(scope.url) || scope.url === '') {
								scope.url = pxConfig.PX_PACKAGE + 'system/components/px-form-item/px-form-item.cfc?method=getData';
							}

							$http({
								method: 'POST',
								url: scope.url,
								dataType: 'json',
								params: params
							}).success(function(response, status, headers, config) {
								if (scope.debug) {
									console.info('px-input-search getData success', response);
								}
								if (!angular.isDefined(scope.responseQuery) || scope.responseQuery === '') {
									scope.responseQuery = 'qQuery';
								}

								scope.searching = false;
								scope.processResults(((scope.responseQuery) ? response[scope.responseQuery] : response), str, arrayFields);

							}).
							error(function(data, status, headers, config) {
								// Erro
								alert('Ops! Ocorreu um erro inesperado.\nPor favor contate o administrador do sistema!');
							});
						}
					}
				};

				scope.hideResults = function() {
					scope.hideTimer = $timeout(function() {
						scope.showDropdown = false;
					}, scope.pause);
				};

				scope.resetHideResults = function() {
					if (scope.hideTimer) {
						$timeout.cancel(scope.hideTimer);
					}
				};

				scope.hoverRow = function(index) {
					scope.currentIndex = index;
				};

				scope.keyPressed = function(event) {
					if (!(event.which === 38 || event.which === 40 || event.which === 13)) {
						if (!scope.searchStr || scope.searchStr === '') {
							scope.showDropdown = false;
							scope.lastSearchTerm = null;
						} else if (isNewSearchNeeded(scope.searchStr, scope.lastSearchTerm)) {



							scope.lastSearchTerm = scope.searchStr;
							scope.showDropdown = true;
							scope.currentIndex = -1;
							scope.results = [];

							if (scope.searchTimer) {
								$timeout.cancel(scope.searchTimer);
							}

							scope.searching = true;

							scope.searchTimer = $timeout(function() {
								scope.searchTimerComplete(scope.searchStr);
							}, scope.pause);
						} else {
							scope.hasDependencies();
						}
					} else {
						event.preventDefault();
					}
				};

				scope.selectResult = function(result) {
					scope.searchStr = scope.lastSearchTerm = result.title;
					scope.internalControl.selectedItem = scope.selectedItem = result.item;
					scope.showDropdown = false;
					scope.results = [];
					//scope.$apply();
					scope.setValidity();
					scope.change({
						event: event
					});
				};

				var inputField = element.find('input');

				inputField.on('keyup', scope.keyPressed);

				element.on('keyup', function(event) {
					if (event.which === 40) {
						if (scope.results && (scope.currentIndex + 1) < scope.results.length) {
							scope.currentIndex++;
							scope.$apply();
							event.preventDefault();
							event.stopPropagation();
						}

						scope.$apply();
					} else if (event.which === 38) {
						if (scope.currentIndex >= 1) {
							scope.currentIndex--;
							scope.$apply();
							event.preventDefault();
							event.stopPropagation();
						}

					} else if (event.which === 13) {
						if (scope.results && scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
							scope.selectResult(scope.results[scope.currentIndex]);
							scope.$apply();
							event.preventDefault();
							event.stopPropagation();
						} else {
							scope.results = [];
							scope.$apply();
							event.preventDefault();
							event.stopPropagation();
						}

					} else if (event.which === 27) {
						scope.results = [];
						scope.showDropdown = false;
						scope.$apply();
					} else if (event.which === 8) {
						scope.selectedItem = null;
						scope.$apply();
					}
				});
				// px-complete - End

				scope.showDialog = function(event) {
					if (!scope.hasDependencies()) {
						scope.clear();
						scope.searchClick({
							event: event
						});
					}
				};

				scope.hasDependencies = function() {
					if (scope.dependencies) {
						for (var i = 0; i < scope.dependencies.length; i++) {
							var result = pxUtil.getFieldValueObject(scope.dependencies[i]);
							if (result.value === null || result.value === '') {
								result.element.trigger('blur');
								alert(scope.dependencies[i].message);
								//console.info(scope.dependencies[i].message);
								ngModelCtrl.$setValidity('deps', false);
								scope.setValidity();
								return true;
							}
						};
					}
					ngModelCtrl.$setValidity('deps', true);
					return false;
				};

				$timeout(function() {
					if (angular.isDefined(scope.default) && !angular.isDefined(scope.selectedItem))
						scope.setValue(scope.default);
				}, 0)

			},
			controller: ['$scope', '$timeout', function($scope, $timeout) {

				$scope.setDefault = function(data) {
					$scope.default = data;
				}

				$scope.setValue = function(data) {
					var arrayFields = $scope.fields;
					var field = arrayFields[pxArrayUtil.getIndexByProperty(arrayFields, 'labelField', true)].field;
					var tempValue = data[field];
					if (!angular.isDefined(tempValue)) {
						tempValue = data[field.toUpperCase()];
					}
					$scope.searchStr = $scope.lastSearchTerm = tempValue;
					$scope.internalControl.selectedItem = $scope.selectedItem = data;
					$scope.showDropdown = false;
					$scope.results = [];
					$scope.setValidity();

					/*
					scope.searchStr = scope.lastSearchTerm = result.title;
					scope.selectedItem = result.item;
					scope.showDropdown = false;
					scope.results = [];
					*/

					$scope.change({
						event: data
					});
				};

				$scope.clear = function() {
					$scope.searchStr = $scope.lastSearchTerm = '';
					$scope.selectedItem = null;
					$scope.showDropdown = false;
					$scope.results = [];
					$scope.internalControl.selectedItem = null;
				};
			}]
		};
	}]);
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
var module = angular.module('px-data-grid', ['px-data-grid.service', 'px-data-grid.filter', 'px-array-util', 'px-date-util', 'px-mask-util', 'px-string-util', 'px-util']);

module.directive('pxDataGrid', ['pxConfig', 'pxArrayUtil', 'pxUtil', '$timeout', '$sce', '$rootScope', function(pxConfig, pxArrayUtil, pxUtil, $timeout, $sce, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        template: '<div class="px-data-grid"><table id="{{id}}_pxDataTable" ng-bind-html="dataTable" class="{{class}}" width="100%"></table></div>',
        scope: {
            id: '@id',            
            debug: '=pxDebug',
            tfoot: '=pxFoot',
            config: '@pxConfig',            
            lengthChange: '=pxLengthChange',
            lengthMenu: '=pxLengthMenu',
            ajaxUrl: '@pxAjaxUrl',
            schema: '@pxSchema',
            table: '@pxTable',
            fields: '@pxFields',
            orderBy: '@pxOrderBy',
            group: '@pxGroup',
            groupItem: '@pxGroupItem',
            groupLabel: '@pxGroupLabel',
            where: '@pxWhere',
            columns: '@pxColumns',
            check: '=pxCheck',
            edit: '=pxEdit',
            init: '&pxInit',
            itemClick: '&pxItemClick',
            itemEdit: '&pxItemEdit',
            dataInit: '=pxDataInit',
            rowsProcess: '@pxRowsProcess',
            demand: '@pxDemand',
            control: '=pxControl',
            labelFunction: '&pxLabelFunction',
        },
        link: function(scope, element, attrs) {
            // Verificar class                
            if (attrs.class.trim() === 'px-data-grid') {
                // default
                scope.class = "table dataTable hovered";
            } else {                
                scope.class = "table dataTable hovered " + attrs.class.replace('px-data-grid','');
            }

            element.on('$destroy', function() {
                // Remover scope.$watch('config',...
                watchConfig();
            });

            if (!angular.isDefined(scope.id) || scope.id === '') {
                console.warn('pxDataGrid: Existe um px-data-grid sem id, isto pode causar sérios problemas em seu código!');
            }

            // ID do DataTable
            scope.id = scope.id || 'pxTable';

            // Quantidade de linhas por consulta
            scope.rowsProcess = parseInt(scope.rowsProcess) || 100;


            // Consulta por demanda?
            if (!angular.isDefined(scope.demand)) {
                scope.demand = true;
            } else {
                scope.demand = (scope.demand === "true");
            }

            // Group
            if (!angular.isDefined(scope.group)) {
                scope.group = pxConfig.GROUP;
            } else {
                scope.group = (scope.group === "true");
            }

            // Armanzenar se o eventos padrão foram adicionados
            scope.events = false;

            var watchConfig = scope.$watch('config', function(newValue, oldValue) {
                // Verificar se possui configuração
                if (newValue !== '') {
                    // Preparar configuração
                    // string -> array
                    newValue = JSON.parse(newValue);

                    // Verificar se DataTables já existe
                    // e se possuir fields definido
                    if (oldValue !== '' && angular.isDefined(scope.fields)) {
                        // Destruir DataTables
                        // https://datatables.net/reference/api/destroy()
                        var table = $('#' + scope.id + '_pxDataTable');
                        table.DataTable().destroy();
                        /*if (scope.currentRecordCount > 0) {
                            table.empty();
                        }*/
                        scope.reset();
                    }
                } else {
                    // Se não possuir uma configuração válida
                    // a listagem não será construida.
                    return;
                }

                scope.url = newValue.url || '';
                scope.fields = newValue.fields;

                scope.dataTable = '';
                scope.dataTable += '<thead>';

                // Campos para o dataTable (dados)
                scope.aoColumns = [];

                // Colunas para o <table>
                scope.columns = '';

                scope.schema = newValue.schema || 'dbo';
                scope.table = newValue.table;
                scope.view = newValue.view;
                scope.orderBy = newValue.orderBy;
                scope.where = newValue.where;

                // Configuração Group
                scope.group = scope.group || pxConfig.GROUP;
                if (angular.isDefined(newValue.group)) {
                    scope.group = newValue.group;
                }
                if (angular.isDefined(newValue.groupItem)) {
                    scope.groupItem = newValue.groupItem;
                }
                if (angular.isDefined(newValue.groupLabel)) {
                    scope.groupLabel = newValue.groupLabel;
                }

                if (scope.group === true) {
                    if (pxConfig.GROUP_ITEM_SUFFIX === '') {
                        scope.groupItem = scope.groupItem || pxConfig.GROUP_ITEM;
                    } else if (!angular.isDefined(scope.groupItem)) {
                        scope.groupItem = scope.groupItem || scope.table + '_' + pxConfig.GROUP_ITEM_SUFFIX;
                        for (var i = 0; i < pxConfig.GROUP_REPLACE.length; i++) {
                            scope.groupItem = scope.groupItem.replace(pxConfig.GROUP_REPLACE[i], '');
                        };
                    }
                    if (pxConfig.GROUP_LABEL_SUFFIX === '') {
                        scope.groupLabel = scope.groupLabel || pxConfig.GROUP_LABEL;
                    } else if (!angular.isDefined(scope.groupLabel)) {
                        scope.groupLabel = scope.groupLabel || pxConfig.GROUP_TABLE + '_' + pxConfig.GROUP_LABEL_SUFFIX;
                        for (var i = 0; i < pxConfig.GROUP_REPLACE.length; i++) {
                            scope.groupLabel = scope.groupLabel.replace(pxConfig.GROUP_REPLACE[i], '');
                        };
                    }
                }

                if (scope.group && pxArrayUtil.getIndexByProperty(scope.fields, 'field', scope.groupLabel) === -1 && $rootScope.globals.currentUser.per_developer === 1) {
                    if (pxConfig.GROUP_ITEM === '') {
                        scope.fields.push({
                            title: 'Grupo',
                            field: scope.groupLabel,
                            type: 'string',
                            filter: scope.id,
                            filterOperator: '=',
                            filterOptions: {
                                field: scope.groupItem,
                                selectedItem: pxConfig.GROUP_TABLE + '_' + pxConfig.GROUP_ITEM_SUFFIX
                            },
                            filterGroup: true
                        });
                    } else {
                        scope.fields.push({
                            title: 'Grupo',
                            field: scope.groupLabel,
                            type: 'string',
                            filter: scope.id,
                            filterOperator: '=',
                            filterOptions: {
                                field: scope.groupItem,
                                selectedItem: pxConfig.GROUP_ITEM
                            },
                            filterGroup: true
                        });
                    }
                }

                var i = 0;
                var aoColumnsData = {};
                var columnDefs = 0;
                scope.columnDefs = [];
                scope.links = [];

                angular.forEach(scope.fields, function(index) {

                    index.width = index.width || '';
                    if (index.align === 'center') {
                        index.align = 'text-center'
                    } else if (index.align === 'right') {
                        index.align = 'text-right'
                    } else {
                        index.align = 'text-left'
                    }

                    // Checkbox  - Start
                    if (i === 0 && scope.check === true) {
                        scope.columns += '<th class="' + index.align + '" width="1%"><input name="select_all" value="1" type="checkbox"></th>';

                        aoColumnsData = {};
                        aoColumnsData.mData = 'pxDataGridRowNumber';

                        scope.aoColumns.push(aoColumnsData);

                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "searchable": false,
                            "orderable": false,
                            "className": "dt-body-center",
                            "render": function(data, type, full, meta) {
                                return "<input type='checkbox'>";
                            }
                        });
                        columnDefs++;
                    }
                    i++;
                    // Checkbox  - End

                    // Edit - Start                        
                    if (i === 1 && scope.edit === true) {
                        scope.columns += '<th class="text-center" width="1%"><i class=""></i></th>';

                        aoColumnsData = {};
                        aoColumnsData.mData = 'edit';

                        scope.aoColumns.push(aoColumnsData);

                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "searchable": false,
                            "orderable": false,
                            "className": "dt-body-center",
                            "render": function(data, type, full, meta) {
                                return "<i class='fa fa-pencil'>";
                                //return "<i class='fa fa-pencil'> <b>Editar</b>";
                            }
                        });
                        columnDefs++;
                    }
                    // Edit - End

                    // Verificar se o campo é link
                    if (index.link) {
                        index.width = '' || '1%';
                        scope.links.push(index);
                        scope.columnDefs.push({
                            "mData": index.linkId,
                            "targets": columnDefs,
                            "searchable": true,
                            "orderable": false,
                            "className": "dt-body-center",
                            "render": function(data, type, full, meta) {
                                if (typeof index.icon === 'undefined') {
                                    index.icon = '';
                                }
                                return "<div class='" + index.align + "'><i link='true' linkId=" + index.linkId + " class='" + index.class + "'>" + index.icon + "</i></div>";
                            }
                        });
                    } else if (index.label) {
                        // labelFunction                        
                        scope.columnDefs.push({
                            "mData": index.linkId,
                            "targets": columnDefs,
                            "searchable": true,
                            "orderable": false,
                            "className": "dt-body-center",
                            "render": function(data, type, full, meta) {
                                return "<div class='" + index.align + "'>" + data + "</div>";
                            }
                        });
                    }

                    // Verificar se o campo é visível
                    if (index.visible === false) {
                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "visible": false,
                            "render": function(data, type, full, meta) {
                                return "<div width='" + index.width + "' class='" + index.align + "'>" + data + "</div>";
                            }
                        });
                    }
                    columnDefs++;

                    scope.columns += '<th width="' + index.width + '" class="' + index.align + '">' + index.title + '</th>';

                    aoColumnsData = {};
                    aoColumnsData.mData = index.field;

                    scope.aoColumns.push(aoColumnsData);
                    i++;
                });
                scope.dataTable += scope.columns;

                scope.dataTable += '</thead>';

                scope.dataTable += '<tbody></tbody>';

                if (scope.tfoot) {
                    scope.dataTable += '<tfoot>';
                    scope.dataTable += scope.columns.replace('<th class="text-left" width="1px"><input name="select_all" value="1" type="checkbox"></th>', '<th class="text-left"></th>');
                    scope.dataTable += '</tfoot>';
                }

                scope.dataTable = $sce.trustAsHtml(scope.dataTable);

                $timeout(function() {
                    // Armazena linhas selecionadas (checkbox)
                    scope.rowsSelected = [];

                    // sDom - Start
                    // http://legacy.datatables.net/usage/options#sDom
                    var sDom = '';
                    sDom += 'l'; // Length changing
                    //sDom += 'f';  // Filtering input
                    sDom += 't'; // The table!
                    sDom += 'i'; // Information
                    sDom += 'p'; // Pagination
                    sDom += 'r'; // pRocessing
                    // sDom - End

                    // Configuração do dataTable
                    // Features: http://legacy.datatables.net/usage/features
                    var dataTableConfig = {};
                    // Ajax Url
                    if (scope.ajaxUrl) {
                        dataTableConfig.ajax = {
                            "url": scope.ajaxUrl,
                            "dataSrc": ""
                        }
                    }
                    // Tradução
                    // https://datatables.net/reference/option/language
                    dataTableConfig.language = {
                            processing: "Processando...",
                            search: "Filtrar registros carregados",
                            lengthMenu: "Visualizar _MENU_ registros",
                            //info: "Monstrando de _START_ a _END_ no total de _TOTAL_ registros.",
                            info: '_TOTAL_ registros carregados.',
                            infoEmpty: "Nenhum registro encontrado",
                            zeroRecords: "Nenhum registro encontrado",
                            emptyTable: "Nenhum registro encontrado.",
                            infoFiltered: "",
                            paginate: {
                                first: "Primeira",
                                previous: "« Anterior",
                                next: "Próxima »",
                                last: "Última"
                            }
                        }
                        // Acesso via mobile browser
                    if (pxUtil.isMobile()) {
                        dataTableConfig.pagingType = "simple";
                        dataTableConfig.pageLength = 8;
                    }
                    dataTableConfig.bFilter = true;
                    dataTableConfig.bLengthChange = scope.lengthChange;
                    dataTableConfig.lengthMenu = scope.lengthMenu; //[20, 35, 45];
                    dataTableConfig.sDom = sDom;
                    dataTableConfig.bProcessing = true;
                    dataTableConfig.aoColumns = scope.aoColumns;
                    dataTableConfig.destroy = true;

                    dataTableConfig.columnDefs = scope.columnDefs;

                    dataTableConfig.order = []; //default order
                    dataTableConfig.rowCallback = function(row, data, dataIndex) {
                        // Linhda ID
                        var rowId = data.pxDataGridRowNumber;

                        // Se a linha ID está na lista de IDs de linha selecionados
                        if ($.inArray(rowId, scope.rowsSelected) !== -1) {
                            $(row).find('input[type="checkbox"]').prop('checked', true);
                            $(row).addClass('selected');
                        }
                    };

                    //requirejs(["dataTables"], function() {
                    // Inicializar dataTable
                    $('#' + scope.id + '_pxDataTable').dataTable(
                        dataTableConfig
                    );
                    //});

                    // Se a propriedade pxGetData for true
                    if (scope.dataInit === true) {
                        // Recupera dados assim que a listagem é criada
                        scope.getData(0, scope.rowsProcess);
                    }

                    //requirejs(["dataTables"], function() {
                    var table = $('#' + scope.id + '_pxDataTable').DataTable();
                    scope.internalControl.table = $('#' + scope.id + '_pxDataTable').DataTable();
                    //});
                    // Verificar se o eventos não foram adicionar
                    if (!scope.events) {
                        // Chamar função para adicionar os eventos
                        scope.eventInit();
                        // Eventos adicionados
                        scope.events = true;
                    }
                }, 0);
            });

            // Internal Control - Start

            // How to call a method defined in an AngularJS directive?
            // http://stackoverflow.com/questions/16881478/how-to-call-a-method-defined-in-an-angularjs-directive
            scope.internalControl = scope.control || {};

            // A listagem está processamento?
            scope.internalControl.working = false;

            /**
             * Recuperar dados que são carregados na listagem
             * @return {void}
             */
            scope.internalControl.getData = function() {
                $timeout(function() {
                    scope.getData(0, scope.rowsProcess);
                }, 0)
            };

            /**
             * Ordenar dados por
             * @param {object} value valor order, ex.: ([1, 'asc'], [2, 'asc'])
             */
            scope.internalControl.sortDataBy = function(value) {
                scope.sortDataBy(value);
            };

            /**
             * Adicionar linha de registro
             * @param {object} value valor que será inserido na listagem
             */
            scope.internalControl.addDataRow = function(value) {
                scope.addDataRow(value);
            };

            /**
             * Atualizar linha de registro
             * @param {object} value valor que será inserido na listagem
             */
            scope.internalControl.updateDataRow = function(value) {
                scope.updateDataRow(value);
            };

            /**
             * Remover linha (obs.: função removeFromDataBase não implementada)
             * @param {Object} value objeto linha do DataTable, passar '.selected' para remover linhas selecionadas
             * @param {Boolean} remover o registro do banco de dados, default = true
             */
            scope.internalControl.removeRow = function(value, removeFromDataBase) {
                // Se não definir removeFromDataBase
                if (!angular.isDefined(removeFromDataBase)) {
                    removeFromDataBase = true;
                }
                scope.removeRow(value, removeFromDataBase);
            };

            /**
             * Limpar dados da listagem
             * @return {Void}
             */
            scope.internalControl.clearData = function() {
                scope.clearData();
            };

            /**
             * Remover itens (selecionados) da listagem
             * @return {void}
             */
            scope.internalControl.remove = function() {
                scope.remove();
            };

            // Armazena itens selecionados da listagem
            scope.internalControl.selectedItems = [];

            // Armazena número atual de linhas carregadas
            scope.currentRecordCount = 0;

            // Internal Control - End

            // Chama evento px-init
            $timeout(scope.init, 0);
        },
        controller: pxDataGridCtrl
    };
}]);

pxDataGridCtrl.$inject = ['pxConfig', 'pxUtil', 'pxArrayUtil', 'pxDateUtil', 'pxMaskUtil', 'pxStringUtil', 'pxDataGridService', '$scope', '$http', '$timeout'];

function pxDataGridCtrl(pxConfig, pxUtil, pxArrayUtil, pxDateUtil, pxMaskUtil, pxStringUtil, pxDataGridService, $scope, $http, $timeout) {

    var moment = pxDateUtil.moment;

    // A página atual inicia-se em 0
    $scope.currentPage = 0;

    $scope.reset = function() {
        // A página atual inicia-se em 0
        $scope.currentPage = 0;

        // Zera contagem de linhas atuais
        $scope.currentRecordCount = 0;

        // Armazena itens selecionados da listagem
        $scope.internalControl.selectedItems = [];

        // Armazena linhas selecionados da listagem
        $scope.internalControl.rowsSelected = [];

        // Nenhuma linha selecionada
        $scope.rowsSelected = [];

        // Se exitir a opção selecionar tudo de listagem
        if (angular.isDefined($scope.internalControl.checkAll)) {
            // Resetar checkbox
            $scope.internalControl.checkAll.checked = false;
            $scope.internalControl.checkAll.indeterminate = false;
        }

    };

    // Adicionar controle de eventos
    $scope.eventInit = function() {
        // Evento page.dt
        // https://datatables.net/reference/event/page
        $('#' + $scope.id + '_pxDataTable').on('page.dt', function() {

            var info = $scope.internalControl.table.page.info();

            if ($scope.ajaxUrl || $scope.url === '') {
                $scope.internalControl.table.context[0].oLanguage.sInfo = info.recordsTotal + ' registros carregados.';
            } else {
                if (angular.isNumber($scope.nextRowFrom)) {
                    return;
                }

                if (info.page === info.pages - 1) {
                    $scope.currentPage = info.page;
                    if ($scope.demand) {
                        $scope.getData($scope.nextRowFrom, $scope.nextRowTo);
                    }
                }

                //$('#'+$scope.id+'_pxDataTable_length').hide();
                //console.info('pxTable page.dt table.context',table.context[0]);
                if (info.start === 0) {
                    info.start = 1;
                }

                //table.context[0].oLanguage.sInfo = 'Monstrando de ' + info.start + ' a ' + info.end + ' no total de ' + info.recordsTotal + ' registros carregados.' + '<br>Total de registros na base de dados: ' + $scope.recordCount;
                $scope.internalControl.table.context[0].oLanguage.sInfo = info.recordsTotal + ' registros carregados.' + ' Total de registros na base de dados: ' + $scope.recordCount;
            }
        });

        // Atualizar dataTable (Selecionar tudo)
        $scope.updateDataTableSelectAllCtrl = function(table) {
            // Verifica se o dataTable possui coluna de checkbox
            if (!$scope.check == true)
                return;

            var $table = table.table().node();
            var $chkbox_all = $('tbody input[type="checkbox"]', $table);
            var $chkbox_checked = $('tbody input[type="checkbox"]:checked', $table);
            var chkbox_select_all = $('thead input[name="select_all"]', $table).get(0);
            $scope.internalControl.checkAll = chkbox_select_all;

            // Se não possuir nenhum checkbox selecionado
            if ($chkbox_checked.length === 0) {
                chkbox_select_all.checked = false;
                if ('indeterminate' in chkbox_select_all) {
                    chkbox_select_all.indeterminate = false;
                }

                // Se todos os checkboxes estiverem selecionados
            } else if ($chkbox_checked.length === $chkbox_all.length) {
                chkbox_select_all.checked = true;
                if ('indeterminate' in chkbox_select_all) {
                    chkbox_select_all.indeterminate = false;
                }

                // Se possuir algum checkbox selecionado
            } else {
                chkbox_select_all.checked = true;
                if ('indeterminate' in chkbox_select_all) {
                    chkbox_select_all.indeterminate = true;
                }
            }
        };

        // Evento click edit
        $('#' + $scope.id + '_pxDataTable tbody').on('click', 'i[class="fa fa-pencil"]', function(e) {

            var $row = $(this).closest('tr');
            $scope.internalControl.updatedRow = $row;
            var data = $scope.internalControl.table.row($row).data();

            var itemEdit = {} //angular.copy(JSON.parse($scope.fields))

            angular.forEach($scope.fields, function(index) {
                itemEdit[index.field] = data.edit[index.field]
            });

            var itemEditEvent = {
                itemClick: data,
                itemEdit: itemEdit
            }

            $scope.itemEdit({
                event: itemEditEvent
            });

            e.stopPropagation();
        });

        // Evento click checkbox
        $('#' + $scope.id + '_pxDataTable tbody').on('click', 'input[type="checkbox"]', function(e) {
            var $row = $(this).closest('tr');

            // Dados da linha
            var data = $scope.internalControl.table.row($row).data();

            // ID da linha
            var rowId = data.pxDataGridRowNumber;

            // Se caixa de seleção está marcada e linha ID não está na lista de IDs de linha selecionados
            var index = $.inArray(rowId, $scope.rowsSelected);

            // Se caixa de seleção está marcada e linha ID não está na lista de IDs de linha selecionados
            if (this.checked && index === -1) {
                $scope.rowsSelected.push(rowId);

                $scope.internalControl.selectedItems.push(data);

                // Se caixa de seleção está marcada e linha ID não está na lista de IDs de linha selecionados
            } else if (!this.checked && index !== -1) {
                $scope.rowsSelected.splice(index, 1);

                $scope.internalControl.selectedItems.splice(index, 1);
            }

            if (this.checked) {
                $row.addClass('selected');
            } else {
                $row.removeClass('selected');
            }

            // Atualizar dataTable (selecionar tudo)
            $scope.updateDataTableSelectAllCtrl($scope.internalControl.table);

            e.stopPropagation();
        });

        // Evento click link
        $('#' + $scope.id + '_pxDataTable tbody').on('click', 'td div i', function(e) {

            // Evento Item Click - Start
            var $row = $(this).closest('td');

            var index = $row.index();
            var columnIndex = $scope.internalControl.table.column.index('fromData', index);
            if ($scope.edit === true) {
                columnIndex--;
            }
            if ($scope.check === true) {
                columnIndex--;
            }

            // Dados da linha
            var data = angular.copy($scope.internalControl.table.row($row).data());
            if (columnIndex <= $scope.links.length) {
                data['link'] = $scope.links[columnIndex];
                data['linkId'] = $scope.links[columnIndex].linkId;
            } else {
                return;
            }

            var itemClickEvent = {
                itemClick: data,
            }

            $timeout(function() {
                $scope.itemClick({
                    event: itemClickEvent
                });
            }, 0);

            e.stopPropagation();
        });

        // Evento click células
        $('#' + $scope.id + '_pxDataTable').on('click', 'tbody td, thead th:first-child', function(e) {

            // Evento Item Click - Start
            var $row = $(this).closest('tr');
            // Dados da linha
            var data = angular.copy($scope.internalControl.table.row($row).data());
            //delete data.pxLink;
            data.pxLink = {
                link: false
            };

            var itemClickEvent = {
                itemClick: data,
            }

            $timeout(function() {
                $scope.itemClick({
                    event: itemClickEvent
                });
            }, 0);

            // Evento Item Click - End

            // Clicar no edit
            if (e.target.tagName === 'I') {
                return;
            }
            $(this).parent().find('input[type="checkbox"]').trigger('click');
        });

        // Evento click (selecionar tudo)
        $('#' + $scope.id + '_pxDataTable thead input[name="select_all"]').on('click', function(e) {
            if (this.checked) {
                $('#' + $scope.id + '_pxDataTable tbody input[type="checkbox"]:not(:checked)').trigger('click');
            } else {
                $('#' + $scope.id + '_pxDataTable tbody input[type="checkbox"]:checked').trigger('click');
            }

            e.stopPropagation();
        });

        // Evento draw
        $('#' + $scope.id + '_pxDataTable').on('draw', function() {
            // Atualizar dataTable (Selecionar tudo)
            $scope.updateDataTableSelectAllCtrl(table);
        });

    };

    /**
     * Recupera dados para listagem
     * @param  {number} rowFrom linha inicial
     * @param  {number} rowTo   linha final
     * @return {void}
     */
    $scope.getData = function(rowFrom, rowTo) {
        // Verificar se a listagem está em processamento
        if ($scope.internalControl.working) {
            return;
        }

        // Iniciar processamento
        $scope.internalControl.working = true;

        var arrayFields = $scope.fields; //JSON.parse($scope.fields);            

        // Armazena se todos os filtros são válidos
        // Exemplo de filtro não válido: filtro obrigatório com valor vazio
        var validFilters = true;

        // Loop na configuração de campos
        angular.forEach(arrayFields, function(index) {
            // Valor do filtro
            index.filterObject = {};

            // Verifica se possui campo de filtro
            // Caso possua campo de filtro será definido o 'filterObject'
            // filterObject armazena dados do filtro que será realizado no campo
            if (angular.isDefined(index.filter)) {

                var selectorName = '#' + index.filter;
                var selectorValue = index.filter;

                // Verificar se é filtro group
                if (index.filterGroup) {
                    selectorName += '_groupSearch_inputSearch';
                    selectorValue = 'selectedItem';
                }
                // Verificar se o filtro é um px-input-search
                else if (angular.isDefined(angular.element($(selectorName + '_inputSearch').get(0)).scope())) {
                    selectorName += '_inputSearch';
                    selectorValue = 'selectedItem';
                }

                // Validar filtro - START
                var _element = angular.element($(selectorName).get(0));
                var _ngModelCtrl = _element.data('$ngModelController');

                if (angular.isDefined(_ngModelCtrl)) {
                    _ngModelCtrl.$validate();
                    if (!_ngModelCtrl.$valid) {
                        _element.trigger('keyup');
                        validFilters = false;
                    } else {
                        _element.trigger('keyup');
                    }
                }
                // Validar filtro - END

                // Verificar seu o scope do elemento angular possui valor definido
                if (angular.isDefined(angular.element($(selectorName).get(0)).scope()) && angular.element($(selectorName).get(0)).scope().hasOwnProperty(selectorValue)) {
                    // filtro
                    var filter = angular.element($(selectorName).get(0)).scope()[selectorValue];

                    var tempField = index.field;
                    var tempValue = filter;

                    // Se possuir configuração avançada de fitro (filterOptions)
                    if (angular.isDefined(index.filterOptions) && index.filterOptions.hasOwnProperty('selectedItem')) {
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

                // Armazena valor do filtro que será enviado ao back-end
                index.filterObject.value = pxUtil.filterOperator(index.filterObject.value, index.filterOperator);

                if (String(index.filterOperator).toUpperCase() === 'BETWEEN') {
                    var selectorNameEnd = '#' + index.filterOptions.endField;
                    var selectorValueEnd = index.filterOptions.endField;
                    if (angular.isDefined(angular.element($(selectorNameEnd + '_inputSearch').get(0)).scope())) {
                        selectorNameEnd += '_inputSearch';
                        selectorValueEnd = 'selectedItem';
                    }

                    // Validar filtro - START
                    var _element = angular.element($(selectorNameEnd).get(0));
                    var _ngModelCtrl = _element.data('$ngModelController');
                    if (angular.isDefined(_ngModelCtrl)) {
                        _ngModelCtrl.$validate();
                        if (!_ngModelCtrl.$valid) {
                            _element.trigger('keyup');
                            validFilters = false;
                        } else {
                            _element.trigger('keyup');
                        }
                    }
                    // Validar filtro - END                    

                    // filtro
                    var filterEnd = angular.element($(selectorNameEnd).get(0)).scope()[selectorValueEnd];

                    var tempFieldEnd = index.filterOptions.endField;
                    var tempValueEnd = filterEnd;

                    // Verificar seu o scope do elemento angular possui valor definido
                    if (angular.isDefined(angular.element($(selectorNameEnd).get(0)).scope()) && angular.element($(selectorNameEnd).get(0)).scope().hasOwnProperty(selectorValueEnd)) {

                        // Se possuir configuração avançada de fitro (filterOptions)
                        if (angular.isDefined(index.filterOptions) && index.filterOptions.hasOwnProperty('selectedItem')) {
                            tempFieldEnd = index.filterOptions.field;
                            // value recebe o que foi configurado em index.filterOptions.selectedItem
                            // por exemplo se o filtro for um select, o ng-model pode ser um objeto {id: 1, name: 'teste'}
                            // neste caso é necessário definir qual chave do objeto representa o valor a ser filtrado
                            if (filterEnd) {
                                tempValueEnd = filterEnd[index.filterOptions.selectedItem];
                                if (!angular.isDefined(tempValueEnd)) {
                                    tempValueEnd = filterEnd[index.filterOptions.selectedItem.toUpperCase()];
                                }
                                if (tempValueEnd === '%') {
                                    tempValueEnd = null;
                                }
                            } else {
                                tempValueEnd = null;
                            }
                        }

                        // field é nome do campo que será filtro no banco de dados
                        index.filterObject.endField = tempFieldEnd;
                        // Verificar se o valor final do between
                        if (angular.isDefined(tempValueEnd) && tempValueEnd !== null && tempValueEnd !== '') {
                            // value é valor do campo, o qual será filtrado                                                        
                            index.filterObject.endValue = tempValueEnd;
                        } else {
                            index.filterObject.endValue = index.filterObject.value;
                            angular.element($(selectorNameEnd).get(0)).scope()[tempFieldEnd] = index.filterObject.value;
                        }

                        // Verificar se valor inicial e maior que o final
                        // Se for irá inverter automaticamente
                        if (index.filterObject.value > index.filterObject.endValue) {
                            var oldEndValue = angular.copy(index.filterObject.endValue);
                            // Valor final recebe valor inicial
                            index.filterObject.endValue = index.filterObject.value;
                            angular.element($(selectorNameEnd).get(0)).scope()[tempFieldEnd] = index.filterObject.value;
                            // Valor incial recebe valor final
                            index.filterObject.value = oldEndValue;
                            angular.element($(selectorName).get(0)).scope()[index.filter] = oldEndValue;
                        }

                    } else {
                        index.filterObject.endValue = index.filterObject.value;
                        angular.element($(selectorNameEnd).get(0)).scope()[tempFieldEnd] = index.filterObject.value;
                    }

                    // Verificar se campo é numeric e possui moment configurado
                    // Neste caso o campo é uma data representanda em números
                    // Ex.: 19900805 - YYYYMMDD
                    if (index.type.toUpperCase() === 'NUMERIC' || index.type.toUpperCase() === 'INT') {
                        index.filterObject.value = moment(index.filterObject.value).format('YYYYMMDD');;
                        index.filterObject.endValue = moment(index.filterObject.endValue).format('YYYYMMDD');
                    }

                }
            }
        });
        //console.info('validFilters', validFilters);
        if (!validFilters) {
            $scope.reset();
            //requirejs(["dataTables"], function() {
            $('#' + $scope.id + '_pxDataTable').DataTable().clear().draw();
            //});
            $scope.internalControl.working = false;
            //console.info($('.dataTables_empty'));
            return;
        }

        // Dados da consulta
        var data = {}

        data.url = $scope.url

        data.schema = $scope.schema;
        if (angular.isDefined($scope.view) && $scope.view !== '') {
            data.table = $scope.view;
        } else {
            data.table = $scope.table;
        }
        data.fields = angular.toJson(arrayFields);
        data.orderBy = angular.toJson($scope.orderBy);

        data.rows = $scope.rowsProcess;

        if (angular.isDefined(rowFrom)) {
            data.rowFrom = rowFrom;
        }
        if (angular.isDefined(rowTo)) {
            data.rowTo = rowTo;
        }

        data.group = $scope.group;
        data.groupItem = $scope.groupItem;
        data.groupLabel = $scope.groupLabel;

        if ($scope.where) {
            $scope.where = pxUtil.setFilterObject($scope.where, false, pxConfig.GROUP_TABLE);
            data.where = angular.toJson($scope.where);
        }

        // Se for a primeira linha significa que é uma nova consulta ao dados
        // Neste caso é feito um 'clear' na listagem
        if (rowFrom === 0) {
            $scope.reset();

            //requirejs(["dataTables"], function() {
            $('#' + $scope.id + '_pxDataTable').DataTable().clear().draw();
            //});
        }

        pxDataGridService.select(data, function(response) {
            if ($scope.debug) {
                console.info('px-data-grid ' + $scope.id + ' getData', response);
                //console.info('px-data-grid ' + $scope.id + ' getData JSON.stringify',JSON.stringify(response,null,"    "));
            }

            if (angular.isDefined(response.data.fault)) {
                $scope.internalControl.working = false;
                alert('Ops! Ocorreu um erro inesperado.\nPor favor contate o administrador do sistema!');
            } else {
                // Verifica se a quantidade de registros é maior que 0
                if (response.data.qQuery.length > 0) {
                    // Loop na query
                    angular.forEach(response.data.qQuery, function(index) {
                        $scope.addDataRow(index);
                    });

                    $scope.recordCount = response.data.recordCount;
                    $scope.nextRowFrom = response.data.rowFrom + $scope.rowsProcess;
                    $scope.nextRowTo = response.data.rowTo + $scope.rowsProcess;

                    var table = $scope.internalControl.table;
                    //requirejs(["dataTables"], function() {
                    $('#' + $scope.id + '_pxDataTable').DataTable().page($scope.currentPage).draw(false);
                    //});

                    //requirejs(["dataTables"], function() {
                    var info = $('#' + $scope.id + '_pxDataTable').DataTable().page.info();
                    if (info.start === 0) {
                        info.start = 1;
                    }

                    //$('#'+$scope.id+'_pxDataTable_info').html('Monstrando de ' + info.start + ' a ' + info.end + ' no total de ' + info.recordsTotal + ' registros carregados.' + '<br>Total de registros na base de dados: ' + $scope.recordCount);                           

                    var infoMessage = info.recordsTotal + ' registros carregados.'

                    if (angular.isNumber($scope.nextRowFrom)) {
                        infoMessage += ' Total de registros na base de dados: ' + $scope.recordCount;
                    }

                    $('#' + $scope.id + '_pxDataTable_info').html(infoMessage);

                    //});
                    // Verifica $scope.demand
                    // false: não continua a consulta até que o usuário navegue até a última página
                    // true: continua consulta até carregar todos os registros
                    if ($scope.demand) {
                        // A listagem está processo?
                        $scope.internalControl.working = false;
                    } else {
                        // Continuar a consulta
                        $scope.getData($scope.nextRowFrom, $scope.nextRowTo);
                    }
                } else {
                    // A listagem está processo?
                    $scope.internalControl.working = false;
                }
            }
        });
    };

    $scope.updateDataRow = function updateDataRow(value) {
        var data = $scope.internalControl.table.row($scope.internalControl.updatedRow).data();
        angular.forEach($scope.fields, function(item) {
            if (angular.isDefined(data[item.field]) && angular.isDefined(value[item.field])) {
                if (!angular.isDefined(item.stringMask)) {
                    data[item.field] = value[item.field];
                } else {
                    if (angular.isDefined(item.pad)) {
                        data[item.field] = pxMaskUtil.maskFormat(pxStringUtil.pad(item.pad, value[item.field], true), item.stringMask).result;
                    } else {
                        data[item.field] = pxMaskUtil.maskFormat(value[item.field], item.stringMask).result;
                    }

                }
            }
        });
        $scope.internalControl.table
            .row($scope.internalControl.updatedRow)
            .data(data)
            .draw();
    }

    $scope.sortDataBy = function sortDataBy(value) {
        // Ordenar dados do dataTable
        //requirejs(["dataTables"], function() {
        $('#' + $scope.id + '_pxDataTable').DataTable().order(value).draw();
        //});
    }

    $scope.addDataRow = function addDataRow(value) {
        // Somar currentRecordCount
        $scope.currentRecordCount++;

        // Dados
        var data = {};
        data.value = {};

        data.pxDataGridRowNumber = $scope.currentRecordCount;
        data.edit = {};

        // Loop nas colunas da grid
        angular.forEach($scope.fields, function(item) {

            if (item.link) {
                data[item.linkId] = item;
            }

            if (typeof item.field !== 'undefined') {

                data.value[item.field] = angular.copy(value[item.field]);

                if (!angular.isDefined(value[item.field])) {
                    // Dados por campo
                    data[item.field] = value[item.field.toUpperCase()];
                } else {
                    // Dados por campo
                    data[item.field] = value[item.field];
                }

                if (!angular.isDefined(data[item.field])) {
                    data[item.field] = '';
                }

                data.edit[item.field] = angular.copy(data[item.field]);

                // Se possuir máscara
                // https://github.com/the-darc/string-mask
                if (item.stringMask) {
                    var maskData = '';
                    switch (item.stringMask) {
                        case 'cpf':
                            maskData = '###.###.###-##';
                            //item.pad = '00000000000';
                            break;
                        case 'cnpj':
                            maskData = '##.###.###/####-##';
                            //item.pad = '00000000000000';
                            break;
                        case 'cep':
                            maskData = '#####-###';
                            //item.pad = '00000000';
                            break;
                        case 'brPhone':
                            if (data[item.field].length === 11) {
                                maskData = '(##) #####-####';
                            } else {
                                maskData = '(##) #####-####';
                            }
                            break;
                        case 'cpfCnpj':
                            if (item.type === 'varchar' || item.type === 'char' || item.type === 'string') {
                                if (String(data[item.field]).length === 11) {
                                    maskData = '###.###.###-##';
                                } else {
                                    maskData = '##.###.###/####-##';
                                }
                            } else {
                                data[item.field] = String(Number(data[item.field]));
                                if (data[item.field].length > 11) {
                                    maskData = '##.###.###/####-##';
                                } else {
                                    maskData = '###.###.###-##';
                                }
                            }
                            break;
                        default:
                            maskData = angular.copy(item.stringMask);
                            break;
                    }
                    if (angular.isDefined(item.pad)) {
                        data[item.field] = pxMaskUtil.maskFormat(pxStringUtil.pad(item.pad, data[item.field], true), maskData).result;
                    } else {
                        data[item.field] = pxMaskUtil.maskFormat(String(data[item.field]), maskData).result;
                    }
                }

                // Se possuir moment
                // http://momentjs.com/
                if (item.moment) {
                    /*if (!angular.isDefined(item.momentType)) {
                        item.momentType = 'date';
                    }*/
                    var dateFormat = moment(Date.parse(data[item.field])).format(item.moment);
                    // Verificar se o valor é do tipo date
                    if (angular.isDate(data[item.field]) || (dateFormat !== 'Invalid date' && item.type === 'date')) {
                        data[item.field] = dateFormat;
                    } else if (parseInt(data[item.field]) > 0 && parseInt(data[item.field]) <= 12) {
                        // Mês (m)
                        data[item.field] = moment.months()[parseInt(data[item.field]) - 1];
                    } else if (String(data[item.field]).length === 8) {
                        // Senão considerar numérico (YYYYMMDD)
                        data[item.field] = moment(new Date(String(data[item.field]).substr(0, 4), String(data[item.field]).substr(4, 2) - 1, String(data[item.field]).substr(6, 2))).format(item.moment);
                    } else {
                        data[item.field] = '';
                    }
                }

                // Se possuir numeral
                // http://numeraljs.com/
                if (item.numeral) {
                    switch (item.numeral) {
                        case 'currency':
                            data[item.field] = numeral(data[item.field]).format('0,0.00');
                            break;
                        default:
                            data[item.field] = numeral(data[item.field]).format(item.numeral);
                            break;
                    }
                }
            }

            if ($scope.labelFunction && item.label) {
                var labelFunction = $scope.labelFunction({
                    event: {
                        item: item,
                        data: data
                    }
                });
            }
        });

        // Atualizar dados do dataTable                                        
        //requirejs(["dataTables"], function() {
        $('#' + $scope.id + '_pxDataTable').DataTable().row.add(data).draw();
        //});
    }

    /**
     * Remover linha
     * @return {void}
     */
    $scope.removeRow = function removeRow(value, removeFromDataBase) {
        if (value === '.selected') {
            $scope.internalControl.table.rows('.selected').remove().draw(false);
        } else {
            $scope.internalControl.table.rows(value).remove().draw();
        }
    }

    /**
     * Limpar dados
     * @return {void}
     */
    $scope.clearData = function clearData() {
        if ($scope.currentRecordCount > 0) {
            //requirejs(["dataTables"], function() {
            $('#' + $scope.id + '_pxDataTable').DataTable().clear().draw();
            //});
        }
    }

    /**
     * Remover itens da listagem
     * @return {void}
     */
    $scope.remove = function remove() {
        var arrayFields = $scope.fields; //JSON.parse($scope.fields);

        var objConfig = JSON.parse($scope.config);
        var table = objConfig.table;
        if (!angular.isDefined(table)) {
            table = $scope.table;
        }

        var data = {}
        data.schema = $scope.schema;
        data.table = table;
        data.fields = angular.toJson(arrayFields);
        data.selectedItems = angular.toJson($scope.internalControl.selectedItems);

        pxDataGridService.remove(data, function(response) {
            if ($scope.debug) {
                console.info('pxDataGrid remove: ', response);
            }
            if (response.data.success) {
                $scope.internalControl.table.rows('.selected').remove().draw(false);

                // rotina duplicada :( - START
                var info = $scope.internalControl.table.page.info();
                if (info.start === 0) {
                    info.start = 1;
                }

                $scope.recordCount -= $scope.rowsSelected.length;

                $('#' + $scope.id + '_pxDataTable_info').html(info.recordsTotal + ' registros carregados.' + ' Total de registros na base de dados: ' + $scope.recordCount);
                // rotina duplicada :( - END

                $scope.internalControl.selectedItems = [];
                $scope.rowsSelected = [];
            } else {
                alert('Ops! Ocorreu um erro inesperado.\nPor favor contate o administrador do sistema!');
            }
        });
    };
}
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
            method: 'POST',
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