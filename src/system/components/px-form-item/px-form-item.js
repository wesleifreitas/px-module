angular.module('px-form-item', [])
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