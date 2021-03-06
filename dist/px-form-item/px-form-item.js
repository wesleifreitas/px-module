angular.module('px-form-item', ['ngMessages', 'ui.mask'])
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
	// pxMessages
	// Apresentar mensagens de erro
	.directive('pxMessage', [function() {
		return {
			restrict: 'E',
			require: '^form',
			replace: true,
			transclude: false,
			template: '<div class="help-block" ng-messages="elementMessage"><p ng-message="required">{{messages.required}}</p><p ng-message="email">{{messages.email}}</p><p ng-message="minlength">{{messages.minlength}}</p><p ng-message="maxlength">{{messages.maxlength}}</p></div>',
			scope: {
				elementMessage: '=pxElement',
				messagesCustom: '=?pxMessages'
			},
			link: function(scope, element, attrs, formCtrl) {
				scope.elementMessage = scope.elementMessage.$error;
				scope.messagesCustom = scope.messagesCustom || {};
				scope.messages = {};
				scope.messages.required = scope.messagesCustom.required || 'Campo obrigatório.';
				scope.messages.email = scope.messagesCustom.email || 'E-mail inválido.';
				scope.messages.minlength = scope.messagesCustom.minlength || 'Muito curto.';
				scope.messages.maxlength = scope.messagesCustom.maxlength || 'Muito longo.';
			}
		};
	}])
	// Validar campos?
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
				scope.elementShowError = angular.element($('#' + scope.element).get(0));
				scope.elementShowError.on('keyup blur', function(event) {
					scope.validateElement();
				});
				$timeout(function() {
					scope.validateElement();
				}, 0);
			},
			controller: ['$scope', function($scope) {
				$scope.validateElement = function() {

					var selectorName = '#' + $scope.element;

					// Verificar se é filtro group
					if (angular.isDefined(angular.element($(selectorName + '_groupSearch_inputSearch').get(0)).scope())) {
						selectorName += '_groupSearch_inputSearch';
					}
					// Verificar se o filtro é um px-complete
					else if (angular.isDefined(angular.element($(selectorName + '_inputSearch').get(0)).scope())) {
						selectorName += '_inputSearch';
					}


					// ngModelController do elemento
					var _ngModelCtrl = $scope.elementShowError.data('$ngModelController');

					if (!angular.isDefined(_ngModelCtrl)) {
						return;
					}

					var _confirm = angular.element($('#' + $scope.confirm).get(0));
					var _confirmModelCtrl = _confirm.data('$ngModelController');

					// Armazena mensagem de erro de validação
					$scope.error = '';

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
								$scope.error = $scope.elementShowError.scope().depsError;
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

						$scope.elementShowError.css({
							borderColor: '#A94442' //'#DF0707'
						});
					} else {
						$scope.$apply(function() {
							$scope.error = '';
						});

						$scope.elementShowError.css({
							borderColor: '#CCCCCC'
						});
					}
				};
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
				};
			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				};
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
				};

			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				};
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
				};

			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				};
			}]
		};
	}])
	// pxBrPhoneMask
	// (99) 9999-9999 / (99) 9999-9999?9
	// (99) 99999-999
	.directive('pxBrPhoneMask', ['$compile', '$timeout', function($compile, $timeout) {
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
				};

			},
			controller: ['$scope', function($scope) {
				$scope.pxForm2mask = function(value) {
					$scope.value2mask(value);
				};
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
				}, 0);
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
			templateUrl: pxConfig.PX_PACKAGE + 'system/directives/px-form-item/px-group.html',
			link: function(scope, element, attrs, ngModelCtrl) {
				if ($rootScope.globals.currentUser.per_developer !== 1) {
					element.hide();
					if (element.parent().children().length === 1) {
						element.parent().hide();
					}
				}

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
						table: pxConfig.GROUP_TABLE,
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

				scope.groupSearchClick = function(event) {
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
				};

				scope.groupSearchChange = function(event) {
					scope.internalControl.selectedItem = scope.groupSearchControl.selectedItem;
					scope.change({
						event: event
					});
				};

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
			templateUrl: pxConfig.PX_PACKAGE + 'system/directives/px-form-item/px-input-search.html',
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
						for (var j = 0; j < scope.dependencies.length; j++) {
							var result = pxUtil.getFieldValueObject(scope.dependencies[j]);
							result.element.on('blur', function(event) { // jshint ignore:line
								var result = pxUtil.getFieldValueObject({
									filter: $(this).attr('id')
								});
								var element = angular.element($('#' + $(this).attr('id')).get(0));
								if (result.value === null || result.value === '' || result.value !== element.scope().oldValue) {
									scope.clear();
								}
								element.scope().oldValue = angular.copy(result.value); //angular.copy(element.scope().selectedItem);                                    
							});
						}
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
				};

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
							scope.where = pxUtil.setFilterObject(scope.where, false, scope.table);
							params.where = angular.toJson(scope.where);

							if (!angular.isDefined(scope.recordCount) || scope.recordCount === '') {
								scope.recordCount = 4;
							}

							params.rows = scope.recordCount;

							if (!angular.isDefined(scope.url) || scope.url === '') {
								scope.url = pxConfig.PX_PACKAGE + 'system/directives/px-form-item/px-form-item.cfc?method=getData';
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
					var eventObject = {
						result: result
					};
					scope.change({
						event: eventObject
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
						}
					}
					ngModelCtrl.$setValidity('deps', true);
					return false;
				};

				$timeout(function() {
					if (angular.isDefined(scope.default) && !angular.isDefined(scope.selectedItem)) {
						scope.setValue(scope.default);
					}
				}, 0);

			},
			controller: ['$scope', '$timeout', function($scope, $timeout) {

				$scope.setDefault = function(data) {
					$scope.default = data;
					$timeout(function() {
						$scope.oldValue = data[$scope.fields[pxArrayUtil.getIndexByProperty($scope.fields, 'labelField', true)].field];
					}, 0);
				};

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