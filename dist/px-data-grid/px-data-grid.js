angular.module('px-data-grid', [])
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
var module = angular.module('px-data-grid', ['px-data-grid.service', 'px-array-util', 'px-date-util', 'px-mask-util', 'px-string-util', 'px-util']);

module.directive('pxDataGrid', ['pxConfig', 'pxArrayUtil', 'pxUtil', '$timeout', '$sce', '$rootScope', function(pxConfig, pxArrayUtil, pxUtil, $timeout, $sce, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        templateUrl: pxConfig.PX_PACKAGE + 'system/components/px-data-grid/px-data-grid.html',
        scope: {
            debug: '=pxDebug',
            config: '@pxConfig',
            id: '@id',
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
            control: '=pxControl'
        },
        link: function(scope, element, attrs) {

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

                angular.forEach(scope.fields, function(index) {

                    // Checkbox  - Start
                    if (i === 0 && scope.check === true) {
                        scope.columns += '<th class="text-left" width="1%"><input name="select_all" value="1" type="checkbox"></th>';

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
                        scope.columnDefs.push({
                            "mData": "link",
                            "targets": columnDefs,
                            "searchable": false,
                            "orderable": false,
                            "className": "dt-body-center",
                            "render": function(data, type, full, meta) {
                                return "<i class='" + data.item.class + "'>" + data.item.icon + "</i>";
                            }
                        });
                        columnDefs++;
                    }

                    // Verificar se o campo é visível
                    if (index.visible === false) {
                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "visible": false,
                            "render": function(data, type, full, meta) {
                                return "<i class='fa fa-pencil'>";
                                //return "<i class='fa fa-pencil'> <b>Editar</b>";
                            }
                        });
                    }
                    columnDefs++;

                    scope.columns += '<th class="text-left">' + index.title + '</th>';

                    aoColumnsData = {};
                    aoColumnsData.mData = index.field;

                    scope.aoColumns.push(aoColumnsData);
                    i++;
                });
                scope.dataTable += scope.columns;

                scope.dataTable += '</thead>';

                scope.dataTable += '<tbody></tbody>';

                scope.dataTable += '<tfoot>';
                scope.dataTable += scope.columns.replace('<th class="text-left" width="1px"><input name="select_all" value="1" type="checkbox"></th>', '<th class="text-left"></th>');
                scope.dataTable += '</tfoot>';

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

            if ($scope.ajaxUrl) {
                $scope.internalControl.table.context[0].oLanguage.sInfo = info.recordsTotal + ' registros carregados.';
            } else {
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

        // Evento click células
        $('#' + $scope.id + '_pxDataTable').on('click', 'tbody td, thead th:first-child', function(e) {

            // Evento Item Click - Start
            var $row = $(this).closest('tr');
            // Dados da linha
            var data = $scope.internalControl.table.row($row).data();

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
                    $('#' + $scope.id + '_pxDataTable_info').html(info.recordsTotal + ' registros carregados.' + ' Total de registros na base de dados: ' + $scope.recordCount);
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
        data.pkValue = {};

        data.pxDataGridRowNumber = $scope.currentRecordCount;
        data.edit = {};

        // Loop nas colunas da grid
        angular.forEach($scope.fields, function(item) {

            data.pkValue[item.field] = angular.copy(value[item.field]);

            if (item.link && (!angular.isDefined(item.field) || item.field === '')) {
                var linkData = angular.copy(value);
                linkData.item = angular.copy(item);
                data['link'] = linkData;
                return;
            }

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
                // Verificar se o valor é do tipo date
                if (angular.isDate(data[item.field])) {
                    data[item.field] = moment(Date.parse(data[item.field])).format(item.moment);
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

        if ($rootScope.hasOwnProperty('globals.currentUser.userId')) {
            data.user = $rootScope.globals.currentUser.userId;
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
            url: '../../../rest/px-project/system/px-data-grid/getData',
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
.px-data-grid table.dataTable.select tbody tr, table.dataTable thead th:first-child {
	cursor: pointer;
	width: 1%;
}
.px-data-grid table.dataTable tbody tr, table.dataTable thead th {
	cursor: pointer;
	white-space: nowrap;
}
.px-data-grid .dataTable {
	clear: both;
}
.px-data-grid .dataTable thead .sorting_asc, .px-data-grid .dataTable thead .sorting_desc, .px-data-grid .dataTable thead .sorting {
	cursor: pointer;
}
.px-data-grid .dataTable thead .sorting_asc:after, .px-data-grid .dataTable thead .sorting_desc:after, .px-data-grid .dataTable thead .sorting:after {
	font-family: metroSysIcons;  /*position: relative; !px-project!*/
	float: right;
	right: 0;
	color: #999999;
}
.px-data-grid .dataTable thead .sorting:after {
	content: "\e011";
}
.px-data-grid .dataTable thead .sorting_asc:after {
	content: "\e010";
}
.px-data-grid .dataTable thead .sorting_desc:after {
	content: "\e012";
}
.px-data-grid .dataTable thead .sorting_asc:after, .px-data-grid .dataTable thead .sorting_desc:after {
	color: #1d1d1d;
}
*/
.px-data-grid .dataTables_wrapper .dataTables_filter label, .px-data-grid .dataTables_wrapper .dataTables_length label {
	vertical-align: middle;
}
.px-data-grid .dataTables_wrapper .dataTables_filter input, .px-data-grid .dataTables_wrapper .dataTables_length input, .px-data-grid .dataTables_wrapper .dataTables_filter select, .px-data-grid .dataTables_wrapper .dataTables_length select {
	border: 1px #d9d9d9 solid;
	width: auto;
	height: 100%;
	padding: 5px;
	z-index: 1;
	position: relative;
}
.px-data-grid .dataTables_wrapper .dataTables_filter input:focus, .px-data-grid .dataTables_wrapper .dataTables_length input:focus, .px-data-grid .dataTables_wrapper .dataTables_filter select:focus, .px-data-grid .dataTables_wrapper .dataTables_length select:focus {
	outline: 0;
	border-color: #919191;
}
.px-data-grid .dataTables_wrapper .dataTables_length {
	float: left;
}
.px-data-grid .dataTables_wrapper .dataTables_length select {
	margin: 0 5px;
}
.px-data-grid .dataTables_wrapper .dataTables_filter {
	float: right;
}
.px-data-grid .dataTables_wrapper .dataTables_filter input {
	margin-left: 5px;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate {
	float: right;
	text-align: right;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button {
	padding: 4px 12px;
	text-align: center;
	vertical-align: middle !important;
	background-color: #d9d9d9;
	border: 1px transparent solid;
	color: #222222;
	border-radius: 0;
	cursor: pointer;
	display: inline-block;
	outline: none;
	font-family: 'Segoe UI Light_', 'Open Sans Light', Verdana, Arial, Helvetica, sans-serif;
	font-size: 14px;
	line-height: 16px;
	margin: auto;
	color: inherit;
	display: block;
	float: left;
	margin-right: 1px;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.default {
	background-color: #008287;
	color: #fff;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button:focus {
	outline: 0;
	border: 1px #353535 dotted;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button:disabled, .px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
	background-color: #eaeaea !important;
	color: #bebebe !important;
	cursor: not-allowed !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button * {
	color: inherit;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button *:hover {
	color: inherit;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.primary {
	background-color: #16499a !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.info {
	background-color: #4390df !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.success {
	background-color: #60a917 !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.warning {
	background-color: #fa6800 !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.danger {
	background-color: #9a1616 !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.inverse {
	background-color: #1d1d1d !important;
	color: #ffffff !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.link {
	background-color: transparent !important;
	color: #2e92cf !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.link:hover {
	text-decoration: underline;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.link:disabled, .px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.link.disabled {
	background-color: transparent !important;
	color: #bebebe !important;
	cursor: not-allowed !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.link [class*="icon-"] {
	text-decoration: none !important;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button:active {
	background-color: #1d1d1d !important;
	color: #ffffff !important;
	border-color: transparent;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.large {
	padding: 11px 19px;
	font-size: 17.5px;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.small {
	padding: 2px 10px;
	font-size: 11.9px;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.mini {
	padding: 0px 6px;
	font-size: 10.5px;
}
.px-data-grid .dataTables_wrapper .dataTables_paginate .paginate_button.current {
	background-color: #4390df;
	color: #ffffff;
}
.px-data-grid .dataTables_wrapper .dataTables_info {
	float: left;
}
.px-data-grid .dataTables_wrapper .dataTables_scrollHeadInner table {
	margin: 0 !important;
}
.px-data-grid .dataTables_wrapper .dataTables_processing {
	position: absolute;
	top: 50%;
	left: 50%;
	margin-left: -100px;
	margin-top: -2em;
	width: 200px;
	padding: 20px;
	text-align: center;
	font-size: 1.2rem;
	background-color: #ffffff;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.2);
}
.px-data-grid .dataTables_wrapper .dataTables_scroll {
	clear: both;
}
.px-data-grid .dataTables_wrapper:after {
	visibility: hidden;
	display: block;
	content: "";
	clear: both;
	height: 0;
}

/*
.px-data-grid .wizard .steps {
  margin: 10px 0;
  padding: 20px;
  border: 1px #eeeeee solid;
  position: relative;
}
.px-data-grid .wizard .steps .step {
  position: relative;
  width: 100%;
  height: 100%;
  display: none;
}
.px-data-grid .wizard .steps .step:first-child {
  display: block;
}
.px-data-grid .wizard .actions .group-right {
  float: right;
}
.px-data-grid .wizard .actions .group-left {
  float: left;
}
.px-data-grid .wizard .actions button {
  padding: 4px 12px;
  text-align: center;
  vertical-align: middle !important;
  background-color: #d9d9d9;
  border: 1px transparent solid;
  color: #222222;
  border-radius: 0;
  cursor: pointer;
  display: inline-block;
  outline: none;
  font-family: 'Segoe UI Light_', 'Open Sans Light', Verdana, Arial, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 16px;
  margin: auto;
  margin-right: 2px;
}
.px-data-grid .wizard .actions button.default {
  background-color: #008287;
  color: #fff;
}
.px-data-grid .wizard .actions button:focus {
  outline: 0;
  border: 1px #353535 dotted;
}
.px-data-grid .wizard .actions button:disabled,
.px-data-grid .wizard .actions button.disabled {
  background-color: #eaeaea !important;
  color: #bebebe !important;
  cursor: not-allowed !important;
}
.px-data-grid .wizard .actions button * {
  color: inherit;
}
.px-data-grid .wizard .actions button *:hover {
  color: inherit;
}
.px-data-grid .wizard .actions button.primary {
  background-color: #16499a !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.info {
  background-color: #4390df !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.success {
  background-color: #60a917 !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.warning {
  background-color: #fa6800 !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.danger {
  background-color: #9a1616 !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.inverse {
  background-color: #1d1d1d !important;
  color: #ffffff !important;
}
.px-data-grid .wizard .actions button.link {
  background-color: transparent !important;
  color: #2e92cf !important;
}
.px-data-grid .wizard .actions button.link:hover {
  text-decoration: underline;
}
.px-data-grid .wizard .actions button.link:disabled,
.px-data-grid .wizard .actions button.link.disabled {
  background-color: transparent !important;
  color: #bebebe !important;
  cursor: not-allowed !important;
}
.px-data-grid .wizard .actions button.link [class*="icon-"] {
  text-decoration: none !important;
}
.px-data-grid .wizard .actions button:active {
  background-color: #1d1d1d !important;
  color: #ffffff !important;
  border-color: transparent;
}
.px-data-grid .wizard .actions button.large {
  padding: 11px 19px;
  font-size: 17.5px;
}
.px-data-grid .wizard .actions button.small {
  padding: 2px 10px;
  font-size: 11.9px;
}
.px-data-grid .wizard .actions button.mini {
  padding: 0px 6px;
  font-size: 10.5px;
}
.px-data-grid .wizard .actions button:last-child {
  margin-right: 0;
}
.px-data-grid .wizard .actions button.btn-finish {
  background-color: #60a917;
  color: #ffffff;
}
.px-data-grid .wizard .actions button:disabled {
  background-color: #6f6f6f !important;
}
.px-data-grid .panel {
  border: 1px #eaeaea solid;
}
.px-data-grid .panel .panel-header {
  padding: 10px;
  background-color: #eeeeee;
  width: 100%;
  font-family: 'Segoe UI Light_', 'Open Sans Light', Verdana, Arial, Helvetica, sans-serif;
  font-weight: 300;
  color: #000000;
  letter-spacing: 0.00em;
  font-size: 2.5rem;
  line-height: 2.5rem;
  letter-spacing: 0.01em;
  color: rgba(0, 0, 0, 0.6);
  font-size: 2.2rem;
  line-height: 2.2rem;
  color: #1d1d1d;
  cursor: default;
}
.px-data-grid .panel .panel-content {
  width: 100%;
  height: auto;
  padding: 10px;
}
.px-data-grid [data-role=panel] .panel-header {
  cursor: pointer;
}
.px-data-grid [data-role=panel] .panel-header:after {
  font-family: metroSysIcons;
  content: "\e000";
  float: right;
  color: inherit;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.px-data-grid [data-role=panel].collapsed .panel-header:after {
  content: "\e000";
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}
*/
@font-face {
	font-family: 'metroSysIcons';
	src: url('fonts/metroSysIcons.woff') format('woff'), url('fonts/metroSysIcons.ttf') format('truetype'), url('fonts/metroSysIcons.svg#metroSysIcons') format('svg');
	font-weight: normal;
	font-style: normal;
}

/*
.px-data-grid .example {
  padding: 20px 40px 20px 60px;
  border: 1px #ccc solid;
  position: relative;
  margin: 0 0 10px 0;
  background-color: #fdfdfd !important;
  min-height: 100px;
}
.px-data-grid .example:before,
.px-data-grid .example:after {
  display: table;
  content: "";
}
.px-data-grid .example:after {
  clear: both;
}
.px-data-grid .example:before {
  position: absolute;
  content: "example";
  left: -21px;
  top: 30px;
  color: #999999 !important;
  margin: 5px 10px;
  font-family: 'Segoe UI Semibold_', 'Open Sans Bold', Verdana, Arial, Helvetica, sans-serif;
  font-weight: bold;
  color: #000000;
  font-size: 1.6rem;
  line-height: 1.6rem;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.4rem;
  line-height: 1.4rem;
  -webkit-transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  transform: rotate(-90deg);
}
.px-data-grid code,
.px-data-grid .code {
  font-family: 'Segoe UI_', 'Open Sans', Verdana, Arial, Helvetica, sans-serif;
  font-weight: normal;
  font-style: normal;
  color: #000000;
  font-size: 11pt;
  line-height: 15pt;
  letter-spacing: 0.02em;
  font-family: 'Courier New', monospace;
  display: inline-block;
  padding: 3px 5px;
  margin: 0;
  background-color: #eeeeee;
  color: #e51400;
  border: 1px #d4d4d4 solid;
  font-size: 90%;
  line-height: 90%;
}
.px-data-grid .label {
  display: inline-block;
  padding: 3px 5px;
  margin: 0;
  font-size: 90%;
  font-weight: normal !important;
  line-height: 90%;
  background: #eeeeee;
  color: #555555;
  font-weight: bold;
}
.px-data-grid .label.alert,
.px-data-grid .label.error {
  background-color: #e51400;
  color: #ffffff;
}
.px-data-grid .label.important,
.px-data-grid .label.warning {
  background-color: #fa6800;
  color: #ffffff;
}
.px-data-grid .label.success {
  background-color: #128023;
  color: #ffffff;
}
.px-data-grid .label.info {
  background-color: #1ba1e2;
  color: #ffffff;
}
.px-data-grid hr {
  height: 1px;
  margin: 20px 0;
  border: 0;
  color: #eeeeee;
  background-color: #eeeeee;
}
*/
.px-data-grid .bg-black {
	background-color: #000000 !important;
}
.px-data-grid .bg-white {
	background-color: #ffffff !important;
}
.px-data-grid .bg-lime {
	background-color: #a4c400 !important;
}
.px-data-grid .bg-green {
	background-color: #60a917 !important;
}
.px-data-grid .bg-emerald {
	background-color: #008a00 !important;
}
.px-data-grid .bg-teal {
	background-color: #00aba9 !important;
}
.px-data-grid .bg-cyan {
	background-color: #1ba1e2 !important;
}
.px-data-grid .bg-cobalt {
	background-color: #0050ef !important;
}
.px-data-grid .bg-indigo {
	background-color: #6a00ff !important;
}
.px-data-grid .bg-violet {
	background-color: #aa00ff !important;
}
.px-data-grid .bg-pink {
	background-color: #dc4fad !important;
}
.px-data-grid .bg-magenta {
	background-color: #d80073 !important;
}
.px-data-grid .bg-crimson {
	background-color: #a20025 !important;
}
.px-data-grid .bg-red {
	background-color: #e51400 !important;
}
.px-data-grid .bg-orange {
	background-color: #fa6800 !important;
}
.px-data-grid .bg-amber {
	background-color: #f0a30a !important;
}
.px-data-grid .bg-yellow {
	background-color: #e3c800 !important;
}
.px-data-grid .bg-brown {
	background-color: #825a2c !important;
}
.px-data-grid .bg-olive {
	background-color: #6d8764 !important;
}
.px-data-grid .bg-steel {
	background-color: #647687 !important;
}
.px-data-grid .bg-mauve {
	background-color: #76608a !important;
}
.px-data-grid .bg-taupe {
	background-color: #87794e !important;
}
.px-data-grid .bg-gray {
	background-color: #555555 !important;
}
.px-data-grid .bg-dark {
	background-color: #333333 !important;
}
.px-data-grid .bg-darker {
	background-color: #222222 !important;
}
.px-data-grid .bg-transparent {
	background-color: transparent !important;
}
.px-data-grid .bg-darkBrown {
	background-color: #63362f !important;
}
.px-data-grid .bg-darkCrimson {
	background-color: #640024 !important;
}
.px-data-grid .bg-darkMagenta {
	background-color: #81003c !important;
}
.px-data-grid .bg-darkIndigo {
	background-color: #4b0096 !important;
}
.px-data-grid .bg-darkCyan {
	background-color: #1b6eae !important;
}
.px-data-grid .bg-darkCobalt {
	background-color: #00356a !important;
}
.px-data-grid .bg-darkTeal {
	background-color: #004050 !important;
}
.px-data-grid .bg-darkEmerald {
	background-color: #003e00 !important;
}
.px-data-grid .bg-darkGreen {
	background-color: #128023 !important;
}
.px-data-grid .bg-darkOrange {
	background-color: #bf5a15 !important;
}
.px-data-grid .bg-darkRed {
	background-color: #9a1616 !important;
}
.px-data-grid .bg-darkPink {
	background-color: #9a165a !important;
}
.px-data-grid .bg-darkViolet {
	background-color: #57169a !important;
}
.px-data-grid .bg-darkBlue {
	background-color: #16499a !important;
}
.px-data-grid .bg-lightBlue {
	background-color: #4390df !important;
}
.px-data-grid .bg-lightRed {
	background-color: #ff2d19 !important;
}
.px-data-grid .bg-lightGreen {
	background-color: #7ad61d !important;
}
.px-data-grid .bg-lighterBlue {
	background-color: #00ccff !important;
}
.px-data-grid .bg-lightTeal {
	background-color: #45fffd !important;
}
.px-data-grid .bg-lightOlive {
	background-color: #78aa1c !important;
}
.px-data-grid .bg-lightOrange {
	background-color: #c29008 !important;
}
.px-data-grid .bg-lightPink {
	background-color: #f472d0 !important;
}
.px-data-grid .bg-grayDark {
	background-color: #333333 !important;
}
.px-data-grid .bg-grayDarker {
	background-color: #222222 !important;
}
.px-data-grid .bg-grayLight {
	background-color: #999999 !important;
}
.px-data-grid .bg-grayLighter {
	background-color: #eeeeee !important;
}
.px-data-grid .bg-blue {
	background-color: #00aff0 !important;
}
.px-data-grid .fg-black {
	color: #000000 !important;
}
.px-data-grid .fg-white {
	color: #ffffff !important;
}
.px-data-grid .fg-lime {
	color: #a4c400 !important;
}
.px-data-grid .fg-green {
	color: #60a917 !important;
}
.px-data-grid .fg-emerald {
	color: #008a00 !important;
}
.px-data-grid .fg-teal {
	color: #00aba9 !important;
}
.px-data-grid .fg-cyan {
	color: #1ba1e2 !important;
}
.px-data-grid .fg-cobalt {
	color: #0050ef !important;
}
.px-data-grid .fg-indigo {
	color: #6a00ff !important;
}
.px-data-grid .fg-violet {
	color: #aa00ff !important;
}
.px-data-grid .fg-pink {
	color: #dc4fad !important;
}
.px-data-grid .fg-magenta {
	color: #d80073 !important;
}
.px-data-grid .fg-crimson {
	color: #a20025 !important;
}
.px-data-grid .fg-red {
	color: #e51400 !important;
}
.px-data-grid .fg-orange {
	color: #fa6800 !important;
}
.px-data-grid .fg-amber {
	color: #f0a30a !important;
}
.px-data-grid .fg-yellow {
	color: #e3c800 !important;
}
.px-data-grid .fg-brown {
	color: #825a2c !important;
}
.px-data-grid .fg-olive {
	color: #6d8764 !important;
}
.px-data-grid .fg-steel {
	color: #647687 !important;
}
.px-data-grid .fg-mauve {
	color: #76608a !important;
}
.px-data-grid .fg-taupe {
	color: #87794e !important;
}
.px-data-grid .fg-gray {
	color: #555555 !important;
}
.px-data-grid .fg-dark {
	color: #333333 !important;
}
.px-data-grid .fg-darker {
	color: #222222 !important;
}
.px-data-grid .fg-transparent {
	color: transparent !important;
}
.px-data-grid .fg-darkBrown {
	color: #63362f !important;
}
.px-data-grid .fg-darkCrimson {
	color: #640024 !important;
}
.px-data-grid .fg-darkMagenta {
	color: #81003c !important;
}
.px-data-grid .fg-darkIndigo {
	color: #4b0096 !important;
}
.px-data-grid .fg-darkCyan {
	color: #1b6eae !important;
}
.px-data-grid .fg-darkCobalt {
	color: #00356a !important;
}
.px-data-grid .fg-darkTeal {
	color: #004050 !important;
}
.px-data-grid .fg-darkEmerald {
	color: #003e00 !important;
}
.px-data-grid .fg-darkGreen {
	color: #128023 !important;
}
.px-data-grid .fg-darkOrange {
	color: #bf5a15 !important;
}
.px-data-grid .fg-darkRed {
	color: #9a1616 !important;
}
.px-data-grid .fg-darkPink {
	color: #9a165a !important;
}
.px-data-grid .fg-darkViolet {
	color: #57169a !important;
}
.px-data-grid .fg-darkBlue {
	color: #16499a !important;
}
.px-data-grid .fg-lightBlue {
	color: #4390df !important;
}
.px-data-grid .fg-lighterBlue {
	color: #00ccff !important;
}
.px-data-grid .fg-lightTeal {
	color: #45fffd !important;
}
.px-data-grid .fg-lightOlive {
	color: #78aa1c !important;
}
.px-data-grid .fg-lightOrange {
	color: #c29008 !important;
}
.px-data-grid .fg-lightPink {
	color: #f472d0 !important;
}
.px-data-grid .fg-lightRed {
	color: #ff2d19 !important;
}
.px-data-grid .fg-lightGreen {
	color: #7ad61d !important;
}
.px-data-grid .fg-grayDark {
	color: #333333 !important;
}
.px-data-grid .fg-grayDarker {
	color: #222222 !important;
}
.px-data-grid .fg-grayLight {
	color: #999999 !important;
}
.px-data-grid .fg-grayLighter {
	color: #eeeeee !important;
}
.px-data-grid .fg-blue {
	color: #00aff0 !important;
}
.px-data-grid .ol-black {
	outline-color: #000000 !important;
}
.px-data-grid .ol-white {
	outline-color: #ffffff !important;
}
.px-data-grid .ol-lime {
	outline-color: #a4c400 !important;
}
.px-data-grid .ol-green {
	outline-color: #60a917 !important;
}
.px-data-grid .ol-emerald {
	outline-color: #008a00 !important;
}
.px-data-grid .ol-teal {
	outline-color: #00aba9 !important;
}
.px-data-grid .ol-cyan {
	outline-color: #1ba1e2 !important;
}
.px-data-grid .ol-cobalt {
	outline-color: #0050ef !important;
}
.px-data-grid .ol-indigo {
	outline-color: #6a00ff !important;
}
.px-data-grid .ol-violet {
	outline-color: #aa00ff !important;
}
.px-data-grid .ol-pink {
	outline-color: #dc4fad !important;
}
.px-data-grid .ol-magenta {
	outline-color: #d80073 !important;
}
.px-data-grid .ol-crimson {
	outline-color: #a20025 !important;
}
.px-data-grid .ol-red {
	outline-color: #e51400 !important;
}
.px-data-grid .ol-orange {
	outline-color: #fa6800 !important;
}
.px-data-grid .ol-amber {
	outline-color: #f0a30a !important;
}
.px-data-grid .ol-yellow {
	outline-color: #e3c800 !important;
}
.px-data-grid .ol-brown {
	outline-color: #825a2c !important;
}
.px-data-grid .ol-olive {
	outline-color: #6d8764 !important;
}
.px-data-grid .ol-steel {
	outline-color: #647687 !important;
}
.px-data-grid .ol-mauve {
	outline-color: #76608a !important;
}
.px-data-grid .ol-taupe {
	outline-color: #87794e !important;
}
.px-data-grid .ol-gray {
	outline-color: #555555 !important;
}
.px-data-grid .ol-dark {
	outline-color: #333333 !important;
}
.px-data-grid .ol-darker {
	outline-color: #222222 !important;
}
.px-data-grid .ol-transparent {
	outline-color: transparent !important;
}
.px-data-grid .ol-darkBrown {
	outline-color: #63362f !important;
}
.px-data-grid .ol-darkCrimson {
	outline-color: #640024 !important;
}
.px-data-grid .ol-darkMagenta {
	outline-color: #81003c !important;
}
.px-data-grid .ol-darkIndigo {
	outline-color: #4b0096 !important;
}
.px-data-grid .ol-darkCyan {
	outline-color: #1b6eae !important;
}
.px-data-grid .ol-darkCobalt {
	outline-color: #00356a !important;
}
.px-data-grid .ol-darkTeal {
	outline-color: #004050 !important;
}
.px-data-grid .ol-darkEmerald {
	outline-color: #003e00 !important;
}
.px-data-grid .ol-darkGreen {
	outline-color: #128023 !important;
}
.px-data-grid .ol-darkOrange {
	outline-color: #bf5a15 !important;
}
.px-data-grid .ol-darkRed {
	outline-color: #9a1616 !important;
}
.px-data-grid .ol-darkPink {
	outline-color: #9a165a !important;
}
.px-data-grid .ol-darkViolet {
	outline-color: #57169a !important;
}
.px-data-grid .ol-darkBlue {
	outline-color: #16499a !important;
}
.px-data-grid .ol-lightBlue {
	outline-color: #4390df !important;
}
.px-data-grid .ol-lighterBlue {
	outline-color: #00ccff !important;
}
.px-data-grid .ol-lightTeal {
	outline-color: #45fffd !important;
}
.px-data-grid .ol-lightOlive {
	outline-color: #78aa1c !important;
}
.px-data-grid .ol-lightOrange {
	outline-color: #c29008 !important;
}
.px-data-grid .ol-lightPink {
	outline-color: #f472d0 !important;
}
.px-data-grid .ol-lightRed {
	outline-color: #ff2d19 !important;
}
.px-data-grid .ol-lightGreen {
	outline-color: #7ad61d !important;
}
.px-data-grid .ol-grayDark {
	outline-color: #333333 !important;
}
.px-data-grid .ol-grayDarker {
	outline-color: #222222 !important;
}
.px-data-grid .ol-grayLight {
	outline-color: #999999 !important;
}
.px-data-grid .ol-grayLighter {
	outline-color: #eeeeee !important;
}
.px-data-grid .ol-blue {
	outline-color: #00aff0 !important;
}
.px-data-grid .bd-black {
	border-color: #000000 !important;
}
.px-data-grid .bd-white {
	border-color: #ffffff !important;
}
.px-data-grid .bd-lime {
	border-color: #a4c400 !important;
}
.px-data-grid .bd-green {
	border-color: #60a917 !important;
}
.px-data-grid .bd-emerald {
	border-color: #008a00 !important;
}
.px-data-grid .bd-teal {
	border-color: #00aba9 !important;
}
.px-data-grid .bd-cyan {
	border-color: #1ba1e2 !important;
}
.px-data-grid .bd-cobalt {
	border-color: #0050ef !important;
}
.px-data-grid .bd-indigo {
	border-color: #6a00ff !important;
}
.px-data-grid .bd-violet {
	border-color: #aa00ff !important;
}
.px-data-grid .bd-pink {
	border-color: #dc4fad !important;
}
.px-data-grid .bd-magenta {
	border-color: #d80073 !important;
}
.px-data-grid .bd-crimson {
	border-color: #a20025 !important;
}
.px-data-grid .bd-red {
	border-color: #e51400 !important;
}
.px-data-grid .bd-orange {
	border-color: #fa6800 !important;
}
.px-data-grid .bd-amber {
	border-color: #f0a30a !important;
}
.px-data-grid .bd-yellow {
	border-color: #e3c800 !important;
}
.px-data-grid .bd-brown {
	border-color: #825a2c !important;
}
.px-data-grid .bd-olive {
	border-color: #6d8764 !important;
}
.px-data-grid .bd-steel {
	border-color: #647687 !important;
}
.px-data-grid .bd-mauve {
	border-color: #76608a !important;
}
.px-data-grid .bd-taupe {
	border-color: #87794e !important;
}
.px-data-grid .bd-gray {
	border-color: #555555 !important;
}
.px-data-grid .bd-dark {
	border-color: #333333 !important;
}
.px-data-grid .bd-darker {
	border-color: #222222 !important;
}
.px-data-grid .bd-transparent {
	border-color: transparent !important;
}
.px-data-grid .bd-darkBrown {
	border-color: #63362f !important;
}
.px-data-grid .bd-darkCrimson {
	border-color: #640024 !important;
}
.px-data-grid .bd-darkMagenta {
	border-color: #81003c !important;
}
.px-data-grid .bd-darkIndigo {
	border-color: #4b0096 !important;
}
.px-data-grid .bd-darkCyan {
	border-color: #1b6eae !important;
}
.px-data-grid .bd-darkCobalt {
	border-color: #00356a !important;
}
.px-data-grid .bd-darkTeal {
	border-color: #004050 !important;
}
.px-data-grid .bd-darkEmerald {
	border-color: #003e00 !important;
}
.px-data-grid .bd-darkGreen {
	border-color: #128023 !important;
}
.px-data-grid .bd-darkOrange {
	border-color: #bf5a15 !important;
}
.px-data-grid .bd-darkRed {
	border-color: #9a1616 !important;
}
.px-data-grid .bd-darkPink {
	border-color: #9a165a !important;
}
.px-data-grid .bd-darkViolet {
	border-color: #57169a !important;
}
.px-data-grid .bd-darkBlue {
	border-color: #16499a !important;
}
.px-data-grid .bd-lightBlue {
	border-color: #4390df !important;
}
.px-data-grid .bd-lightTeal {
	border-color: #45fffd !important;
}
.px-data-grid .bd-lightOlive {
	border-color: #78aa1c !important;
}
.px-data-grid .bd-lightOrange {
	border-color: #c29008 !important;
}
.px-data-grid .bd-lightPink {
	border-color: #f472d0 !important;
}
.px-data-grid .bd-lightRed {
	border-color: #ff2d19 !important;
}
.px-data-grid .bd-lightGreen {
	border-color: #7ad61d !important;
}
.px-data-grid .bd-grayDark {
	border-color: #333333 !important;
}
.px-data-grid .bd-grayDarker {
	border-color: #222222 !important;
}
.px-data-grid .bd-grayLight {
	border-color: #999999 !important;
}
.px-data-grid .bd-grayLighter {
	border-color: #eeeeee !important;
}
.px-data-grid .bd-blue {
	border-color: #00aff0 !important;
}
.px-data-grid .bg-hover-black:hover {
	background-color: #000000 !important;
}
.px-data-grid .bg-hover-white:hover {
	background-color: #ffffff !important;
}
.px-data-grid .bg-hover-lime:hover {
	background-color: #a4c400 !important;
}
.px-data-grid .bg-hover-green:hover {
	background-color: #60a917 !important;
}
.px-data-grid .bg-hover-emerald:hover {
	background-color: #008a00 !important;
}
.px-data-grid .bg-hover-teal:hover {
	background-color: #00aba9 !important;
}
.px-data-grid .bg-hover-cyan:hover {
	background-color: #1ba1e2 !important;
}
.px-data-grid .bg-hover-cobalt:hover {
	background-color: #0050ef !important;
}
.px-data-grid .bg-hover-indigo:hover {
	background-color: #6a00ff !important;
}
.px-data-grid .bg-hover-violet:hover {
	background-color: #aa00ff !important;
}
.px-data-grid .bg-hover-pink:hover {
	background-color: #dc4fad !important;
}
.px-data-grid .bg-hover-magenta:hover {
	background-color: #d80073 !important;
}
.px-data-grid .bg-hover-crimson:hover {
	background-color: #a20025 !important;
}
.px-data-grid .bg-hover-red:hover {
	background-color: #e51400 !important;
}
.px-data-grid .bg-hover-orange:hover {
	background-color: #fa6800 !important;
}
.px-data-grid .bg-hover-amber:hover {
	background-color: #f0a30a !important;
}
.px-data-grid .bg-hover-yellow:hover {
	background-color: #e3c800 !important;
}
.px-data-grid .bg-hover-brown:hover {
	background-color: #825a2c !important;
}
.px-data-grid .bg-hover-olive:hover {
	background-color: #6d8764 !important;
}
.px-data-grid .bg-hover-steel:hover {
	background-color: #647687 !important;
}
.px-data-grid .bg-hover-mauve:hover {
	background-color: #76608a !important;
}
.px-data-grid .bg-hover-taupe:hover {
	background-color: #87794e !important;
}
.px-data-grid .bg-hover-gray:hover {
	background-color: #555555 !important;
}
.px-data-grid .bg-hover-dark:hover {
	background-color: #333333 !important;
}
.px-data-grid .bg-hover-darker:hover {
	background-color: #222222 !important;
}
.px-data-grid .bg-hover-transparent:hover {
	background-color: transparent !important;
}
.px-data-grid .bg-hover-darkBrown:hover {
	background-color: #63362f !important;
}
.px-data-grid .bg-hover-darkCrimson:hover {
	background-color: #640024 !important;
}
.px-data-grid .bg-hover-darkMagenta:hover {
	background-color: #81003c !important;
}
.px-data-grid .bg-hover-darkIndigo:hover {
	background-color: #4b0096 !important;
}
.px-data-grid .bg-hover-darkCyan:hover {
	background-color: #1b6eae !important;
}
.px-data-grid .bg-hover-darkCobalt:hover {
	background-color: #00356a !important;
}
.px-data-grid .bg-hover-darkTeal:hover {
	background-color: #004050 !important;
}
.px-data-grid .bg-hover-darkEmerald:hover {
	background-color: #003e00 !important;
}
.px-data-grid .bg-hover-darkGreen:hover {
	background-color: #128023 !important;
}
.px-data-grid .bg-hover-darkOrange:hover {
	background-color: #bf5a15 !important;
}
.px-data-grid .bg-hover-darkRed:hover {
	background-color: #9a1616 !important;
}
.px-data-grid .bg-hover-darkPink:hover {
	background-color: #9a165a !important;
}
.px-data-grid .bg-hover-darkViolet:hover {
	background-color: #57169a !important;
}
.px-data-grid .bg-hover-darkBlue:hover {
	background-color: #16499a !important;
}
.px-data-grid .bg-hover-lightBlue:hover {
	background-color: #4390df !important;
}
.px-data-grid .bg-hover-lightTeal:hover {
	background-color: #45fffd !important;
}
.px-data-grid .bg-hover-lightOlive:hover {
	background-color: #78aa1c !important;
}
.px-data-grid .bg-hover-lightOrange:hover {
	background-color: #c29008 !important;
}
.px-data-grid .bg-hover-lightPink:hover {
	background-color: #f472d0 !important;
}
.px-data-grid .bg-hover-lightRed:hover {
	background-color: #ff2d19 !important;
}
.px-data-grid .bg-hover-lightGreen:hover {
	background-color: #7ad61d !important;
}
.px-data-grid .bg-hover-grayDark:hover {
	background-color: #333333 !important;
}
.px-data-grid .bg-hover-grayDarker:hover {
	background-color: #222222 !important;
}
.px-data-grid .bg-hover-grayLight:hover {
	background-color: #999999 !important;
}
.px-data-grid .bg-hover-grayLighter:hover {
	background-color: #eeeeee !important;
}
.px-data-grid .bg-hover-blue:hover {
	background-color: #00aff0 !important;
}
.px-data-grid .fg-hover-black:hover {
	color: #000000 !important;
}
.px-data-grid .fg-hover-white:hover {
	color: #ffffff !important;
}
.px-data-grid .fg-hover-lime:hover {
	color: #a4c400 !important;
}
.px-data-grid .fg-hover-green:hover {
	color: #60a917 !important;
}
.px-data-grid .fg-hover-emerald:hover {
	color: #008a00 !important;
}
.px-data-grid .fg-hover-teal:hover {
	color: #00aba9 !important;
}
.px-data-grid .fg-hover-cyan:hover {
	color: #1ba1e2 !important;
}
.px-data-grid .fg-hover-cobalt:hover {
	color: #0050ef !important;
}
.px-data-grid .fg-hover-indigo:hover {
	color: #6a00ff !important;
}
.px-data-grid .fg-hover-violet:hover {
	color: #aa00ff !important;
}
.px-data-grid .fg-hover-pink:hover {
	color: #dc4fad !important;
}
.px-data-grid .fg-hover-magenta:hover {
	color: #d80073 !important;
}
.px-data-grid .fg-hover-crimson:hover {
	color: #a20025 !important;
}
.px-data-grid .fg-hover-red:hover {
	color: #e51400 !important;
}
.px-data-grid .fg-hover-orange:hover {
	color: #fa6800 !important;
}
.px-data-grid .fg-hover-amber:hover {
	color: #f0a30a !important;
}
.px-data-grid .fg-hover-yellow:hover {
	color: #e3c800 !important;
}
.px-data-grid .fg-hover-brown:hover {
	color: #825a2c !important;
}
.px-data-grid .fg-hover-olive:hover {
	color: #6d8764 !important;
}
.px-data-grid .fg-hover-steel:hover {
	color: #647687 !important;
}
.px-data-grid .fg-hover-mauve:hover {
	color: #76608a !important;
}
.px-data-grid .fg-hover-taupe:hover {
	color: #87794e !important;
}
.px-data-grid .fg-hover-gray:hover {
	color: #555555 !important;
}
.px-data-grid .fg-hover-dark:hover {
	color: #333333 !important;
}
.px-data-grid .fg-hover-darker:hover {
	color: #222222 !important;
}
.px-data-grid .fg-hover-transparent:hover {
	color: transparent !important;
}
.px-data-grid .fg-hover-darkBrown:hover {
	color: #63362f !important;
}
.px-data-grid .fg-hover-darkCrimson:hover {
	color: #640024 !important;
}
.px-data-grid .fg-hover-darkMagenta:hover {
	color: #81003c !important;
}
.px-data-grid .fg-hover-darkIndigo:hover {
	color: #4b0096 !important;
}
.px-data-grid .fg-hover-darkCyan:hover {
	color: #1b6eae !important;
}
.px-data-grid .fg-hover-darkCobalt:hover {
	color: #00356a !important;
}
.px-data-grid .fg-hover-darkTeal:hover {
	color: #004050 !important;
}
.px-data-grid .fg-hover-darkEmerald:hover {
	color: #003e00 !important;
}
.px-data-grid .fg-hover-darkGreen:hover {
	color: #128023 !important;
}
.px-data-grid .fg-hover-darkOrange:hover {
	color: #bf5a15 !important;
}
.px-data-grid .fg-hover-darkRed:hover {
	color: #9a1616 !important;
}
.px-data-grid .fg-hover-darkPink:hover {
	color: #9a165a !important;
}
.px-data-grid .fg-hover-darkViolet:hover {
	color: #57169a !important;
}
.px-data-grid .fg-hover-darkBlue:hover {
	color: #16499a !important;
}
.px-data-grid .fg-hover-lightBlue:hover {
	color: #4390df !important;
}
.px-data-grid .fg-hover-lightTeal:hover {
	color: #45fffd !important;
}
.px-data-grid .fg-hover-lightOlive:hover {
	color: #78aa1c !important;
}
.px-data-grid .fg-hover-lightOrange:hover {
	color: #c29008 !important;
}
.px-data-grid .fg-hover-lightPink:hover {
	color: #f472d0 !important;
}
.px-data-grid .fg-hover-lightRed:hover {
	color: #ff2d19 !important;
}
.px-data-grid .fg-hover-lightGreen:hover {
	color: #7ad61d !important;
}
.px-data-grid .fg-hover-grayDark:hover {
	color: #333333 !important;
}
.px-data-grid .fg-hover-grayDarker:hover {
	color: #222222 !important;
}
.px-data-grid .fg-hover-grayLight:hover {
	color: #999999 !important;
}
.px-data-grid .fg-hover-grayLighter:hover {
	color: #eeeeee !important;
}
.px-data-grid .fg-hover-blue:hover {
	color: #00aff0 !important;
}
.px-data-grid .bg-active-black:active {
	background-color: #000000 !important;
}
.px-data-grid .bg-active-white:active {
	background-color: #ffffff !important;
}
.px-data-grid .bg-active-lime:active {
	background-color: #a4c400 !important;
}
.px-data-grid .bg-active-green:active {
	background-color: #60a917 !important;
}
.px-data-grid .bg-active-emerald:active {
	background-color: #008a00 !important;
}
.px-data-grid .bg-active-teal:active {
	background-color: #00aba9 !important;
}
.px-data-grid .bg-active-cyan:active {
	background-color: #1ba1e2 !important;
}
.px-data-grid .bg-active-cobalt:active {
	background-color: #0050ef !important;
}
.px-data-grid .bg-active-indigo:active {
	background-color: #6a00ff !important;
}
.px-data-grid .bg-active-violet:active {
	background-color: #aa00ff !important;
}
.px-data-grid .bg-active-pink:active {
	background-color: #dc4fad !important;
}
.px-data-grid .bg-active-magenta:active {
	background-color: #d80073 !important;
}
.px-data-grid .bg-active-crimson:active {
	background-color: #a20025 !important;
}
.px-data-grid .bg-active-red:active {
	background-color: #e51400 !important;
}
.px-data-grid .bg-active-orange:active {
	background-color: #fa6800 !important;
}
.px-data-grid .bg-active-amber:active {
	background-color: #f0a30a !important;
}
.px-data-grid .bg-active-yellow:active {
	background-color: #e3c800 !important;
}
.px-data-grid .bg-active-brown:active {
	background-color: #825a2c !important;
}
.px-data-grid .bg-active-olive:active {
	background-color: #6d8764 !important;
}
.px-data-grid .bg-active-steel:active {
	background-color: #647687 !important;
}
.px-data-grid .bg-active-mauve:active {
	background-color: #76608a !important;
}
.px-data-grid .bg-active-taupe:active {
	background-color: #87794e !important;
}
.px-data-grid .bg-active-gray:active {
	background-color: #555555 !important;
}
.px-data-grid .bg-active-dark:active {
	background-color: #333333 !important;
}
.px-data-grid .bg-active-darker:active {
	background-color: #222222 !important;
}
.px-data-grid .bg-active-transparent:active {
	background-color: transparent !important;
}
.px-data-grid .bg-active-darkBrown:active {
	background-color: #63362f !important;
}
.px-data-grid .bg-active-darkCrimson:active {
	background-color: #640024 !important;
}
.px-data-grid .bg-active-darkMagenta:active {
	background-color: #81003c !important;
}
.px-data-grid .bg-active-darkIndigo:active {
	background-color: #4b0096 !important;
}
.px-data-grid .bg-active-darkCyan:active {
	background-color: #1b6eae !important;
}
.px-data-grid .bg-active-darkCobalt:active {
	background-color: #00356a !important;
}
.px-data-grid .bg-active-darkTeal:active {
	background-color: #004050 !important;
}
.px-data-grid .bg-active-darkEmerald:active {
	background-color: #003e00 !important;
}
.px-data-grid .bg-active-darkGreen:active {
	background-color: #128023 !important;
}
.px-data-grid .bg-active-darkOrange:active {
	background-color: #bf5a15 !important;
}
.px-data-grid .bg-active-darkRed:active {
	background-color: #9a1616 !important;
}
.px-data-grid .bg-active-darkPink:active {
	background-color: #9a165a !important;
}
.px-data-grid .bg-active-darkViolet:active {
	background-color: #57169a !important;
}
.px-data-grid .bg-active-darkBlue:active {
	background-color: #16499a !important;
}
.px-data-grid .bg-active-lightBlue:active {
	background-color: #4390df !important;
}
.px-data-grid .bg-active-lightTeal:active {
	background-color: #45fffd !important;
}
.px-data-grid .bg-active-lightOlive:active {
	background-color: #78aa1c !important;
}
.px-data-grid .bg-active-lightOrange:active {
	background-color: #c29008 !important;
}
.px-data-grid .bg-active-lightPink:active {
	background-color: #f472d0 !important;
}
.px-data-grid .bg-active-lightRed:active {
	background-color: #ff2d19 !important;
}
.px-data-grid .bg-active-lightGreen:active {
	background-color: #7ad61d !important;
}
.px-data-grid .bg-active-grayDark:active {
	background-color: #333333 !important;
}
.px-data-grid .bg-active-grayDarker:active {
	background-color: #222222 !important;
}
.px-data-grid .bg-active-grayLight:active {
	background-color: #999999 !important;
}
.px-data-grid .bg-active-grayLighter:active {
	background-color: #eeeeee !important;
}
.px-data-grid .bg-active-blue:active {
	background-color: #00aff0 !important;
}
.px-data-grid .fg-active-black:active {
	color: #000000 !important;
}
.px-data-grid .fg-active-white:active {
	color: #ffffff !important;
}
.px-data-grid .fg-active-lime:active {
	color: #a4c400 !important;
}
.px-data-grid .fg-active-green:active {
	color: #60a917 !important;
}
.px-data-grid .fg-active-emerald:active {
	color: #008a00 !important;
}
.px-data-grid .fg-active-teal:active {
	color: #00aba9 !important;
}
.px-data-grid .fg-active-cyan:active {
	color: #1ba1e2 !important;
}
.px-data-grid .fg-active-cobalt:active {
	color: #0050ef !important;
}
.px-data-grid .fg-active-indigo:active {
	color: #6a00ff !important;
}
.px-data-grid .fg-active-violet:active {
	color: #aa00ff !important;
}
.px-data-grid .fg-active-pink:active {
	color: #dc4fad !important;
}
.px-data-grid .fg-active-magenta:active {
	color: #d80073 !important;
}
.px-data-grid .fg-active-crimson:active {
	color: #a20025 !important;
}
.px-data-grid .fg-active-red:active {
	color: #e51400 !important;
}
.px-data-grid .fg-active-orange:active {
	color: #fa6800 !important;
}
.px-data-grid .fg-active-amber:active {
	color: #f0a30a !important;
}
.px-data-grid .fg-active-yellow:active {
	color: #e3c800 !important;
}
.px-data-grid .fg-active-brown:active {
	color: #825a2c !important;
}
.px-data-grid .fg-active-olive:active {
	color: #6d8764 !important;
}
.px-data-grid .fg-active-steel:active {
	color: #647687 !important;
}
.px-data-grid .fg-active-mauve:active {
	color: #76608a !important;
}
.px-data-grid .fg-active-taupe:active {
	color: #87794e !important;
}
.px-data-grid .fg-active-gray:active {
	color: #555555 !important;
}
.px-data-grid .fg-active-dark:active {
	color: #333333 !important;
}
.px-data-grid .fg-active-darker:active {
	color: #222222 !important;
}
.px-data-grid .fg-active-transparent:active {
	color: transparent !important;
}
.px-data-grid .fg-active-darkBrown:active {
	color: #63362f !important;
}
.px-data-grid .fg-active-darkCrimson:active {
	color: #640024 !important;
}
.px-data-grid .fg-active-darkMagenta:active {
	color: #81003c !important;
}
.px-data-grid .fg-active-darkIndigo:active {
	color: #4b0096 !important;
}
.px-data-grid .fg-active-darkCyan:active {
	color: #1b6eae !important;
}
.px-data-grid .fg-active-darkCobalt:active {
	color: #00356a !important;
}
.px-data-grid .fg-active-darkTeal:active {
	color: #004050 !important;
}
.px-data-grid .fg-active-darkEmerald:active {
	color: #003e00 !important;
}
.px-data-grid .fg-active-darkGreen:active {
	color: #128023 !important;
}
.px-data-grid .fg-active-darkOrange:active {
	color: #bf5a15 !important;
}
.px-data-grid .fg-active-darkRed:active {
	color: #9a1616 !important;
}
.px-data-grid .fg-active-darkPink:active {
	color: #9a165a !important;
}
.px-data-grid .fg-active-darkViolet:active {
	color: #57169a !important;
}
.px-data-grid .fg-active-darkBlue:active {
	color: #16499a !important;
}
.px-data-grid .fg-active-lightBlue:active {
	color: #4390df !important;
}
.px-data-grid .fg-active-lightTeal:active {
	color: #45fffd !important;
}
.px-data-grid .fg-active-lightOlive:active {
	color: #78aa1c !important;
}
.px-data-grid .fg-active-lightOrange:active {
	color: #c29008 !important;
}
.px-data-grid .fg-active-lightPink:active {
	color: #f472d0 !important;
}
.px-data-grid .fg-active-lightRed:active {
	color: #ff2d19 !important;
}
.px-data-grid .fg-active-lightGreen:active {
	color: #7ad61d !important;
}
.px-data-grid .fg-active-grayDark:active {
	color: #333333 !important;
}
.px-data-grid .fg-active-grayDarker:active {
	color: #222222 !important;
}
.px-data-grid .fg-active-grayLight:active {
	color: #999999 !important;
}
.px-data-grid .fg-active-grayLighter:active {
	color: #eeeeee !important;
}
.px-data-grid .fg-active-blue:active {
	color: #00aff0 !important;
}
.px-data-grid .bg-focus-black:focus {
	background-color: #000000 !important;
}
.px-data-grid .bg-focus-white:focus {
	background-color: #ffffff !important;
}
.px-data-grid .bg-focus-lime:focus {
	background-color: #a4c400 !important;
}
.px-data-grid .bg-focus-green:focus {
	background-color: #60a917 !important;
}
.px-data-grid .bg-focus-emerald:focus {
	background-color: #008a00 !important;
}
.px-data-grid .bg-focus-teal:focus {
	background-color: #00aba9 !important;
}
.px-data-grid .bg-focus-cyan:focus {
	background-color: #1ba1e2 !important;
}
.px-data-grid .bg-focus-cobalt:focus {
	background-color: #0050ef !important;
}
.px-data-grid .bg-focus-indigo:focus {
	background-color: #6a00ff !important;
}
.px-data-grid .bg-focus-violet:focus {
	background-color: #aa00ff !important;
}
.px-data-grid .bg-focus-pink:focus {
	background-color: #dc4fad !important;
}
.px-data-grid .bg-focus-magenta:focus {
	background-color: #d80073 !important;
}
.px-data-grid .bg-focus-crimson:focus {
	background-color: #a20025 !important;
}
.px-data-grid .bg-focus-red:focus {
	background-color: #e51400 !important;
}
.px-data-grid .bg-focus-orange:focus {
	background-color: #fa6800 !important;
}
.px-data-grid .bg-focus-amber:focus {
	background-color: #f0a30a !important;
}
.px-data-grid .bg-focus-yellow:focus {
	background-color: #e3c800 !important;
}
.px-data-grid .bg-focus-brown:focus {
	background-color: #825a2c !important;
}
.px-data-grid .bg-focus-olive:focus {
	background-color: #6d8764 !important;
}
.px-data-grid .bg-focus-steel:focus {
	background-color: #647687 !important;
}
.px-data-grid .bg-focus-mauve:focus {
	background-color: #76608a !important;
}
.px-data-grid .bg-focus-taupe:focus {
	background-color: #87794e !important;
}
.px-data-grid .bg-focus-gray:focus {
	background-color: #555555 !important;
}
.px-data-grid .bg-focus-dark:focus {
	background-color: #333333 !important;
}
.px-data-grid .bg-focus-darker:focus {
	background-color: #222222 !important;
}
.px-data-grid .bg-focus-transparent:focus {
	background-color: transparent !important;
}
.px-data-grid .bg-focus-darkBrown:focus {
	background-color: #63362f !important;
}
.px-data-grid .bg-focus-darkCrimson:focus {
	background-color: #640024 !important;
}
.px-data-grid .bg-focus-darkMagenta:focus {
	background-color: #81003c !important;
}
.px-data-grid .bg-focus-darkIndigo:focus {
	background-color: #4b0096 !important;
}
.px-data-grid .bg-focus-darkCyan:focus {
	background-color: #1b6eae !important;
}
.px-data-grid .bg-focus-darkCobalt:focus {
	background-color: #00356a !important;
}
.px-data-grid .bg-focus-darkTeal:focus {
	background-color: #004050 !important;
}
.px-data-grid .bg-focus-darkEmerald:focus {
	background-color: #003e00 !important;
}
.px-data-grid .bg-focus-darkGreen:focus {
	background-color: #128023 !important;
}
.px-data-grid .bg-focus-darkOrange:focus {
	background-color: #bf5a15 !important;
}
.px-data-grid .bg-focus-darkRed:focus {
	background-color: #9a1616 !important;
}
.px-data-grid .bg-focus-darkPink:focus {
	background-color: #9a165a !important;
}
.px-data-grid .bg-focus-darkViolet:focus {
	background-color: #57169a !important;
}
.px-data-grid .bg-focus-darkBlue:focus {
	background-color: #16499a !important;
}
.px-data-grid .bg-focus-lightBlue:focus {
	background-color: #4390df !important;
}
.px-data-grid .bg-focus-lightTeal:focus {
	background-color: #45fffd !important;
}
.px-data-grid .bg-focus-lightOlive:focus {
	background-color: #78aa1c !important;
}
.px-data-grid .bg-focus-lightOrange:focus {
	background-color: #c29008 !important;
}
.px-data-grid .bg-focus-lightPink:focus {
	background-color: #f472d0 !important;
}
.px-data-grid .bg-focus-lightRed:focus {
	background-color: #ff2d19 !important;
}
.px-data-grid .bg-focus-lightGreen:focus {
	background-color: #7ad61d !important;
}
.px-data-grid .bg-focus-grayDark:focus {
	background-color: #333333 !important;
}
.px-data-grid .bg-focus-grayDarker:focus {
	background-color: #222222 !important;
}
.px-data-grid .bg-focus-grayLight:focus {
	background-color: #999999 !important;
}
.px-data-grid .bg-focus-grayLighter:focus {
	background-color: #eeeeee !important;
}
.px-data-grid .bg-focus-blue:focus {
	background-color: #00aff0 !important;
}
.px-data-grid .fg-focus-black:focus {
	color: #000000 !important;
}
.px-data-grid .fg-focus-white:focus {
	color: #ffffff !important;
}
.px-data-grid .fg-focus-lime:focus {
	color: #a4c400 !important;
}
.px-data-grid .fg-focus-green:focus {
	color: #60a917 !important;
}
.px-data-grid .fg-focus-emerald:focus {
	color: #008a00 !important;
}
.px-data-grid .fg-focus-teal:focus {
	color: #00aba9 !important;
}
.px-data-grid .fg-focus-cyan:focus {
	color: #1ba1e2 !important;
}
.px-data-grid .fg-focus-cobalt:focus {
	color: #0050ef !important;
}
.px-data-grid .fg-focus-indigo:focus {
	color: #6a00ff !important;
}
.px-data-grid .fg-focus-violet:focus {
	color: #aa00ff !important;
}
.px-data-grid .fg-focus-pink:focus {
	color: #dc4fad !important;
}
.px-data-grid .fg-focus-magenta:focus {
	color: #d80073 !important;
}
.px-data-grid .fg-focus-crimson:focus {
	color: #a20025 !important;
}
.px-data-grid .fg-focus-red:focus {
	color: #e51400 !important;
}
.px-data-grid .fg-focus-orange:focus {
	color: #fa6800 !important;
}
.px-data-grid .fg-focus-amber:focus {
	color: #f0a30a !important;
}
.px-data-grid .fg-focus-yellow:focus {
	color: #e3c800 !important;
}
.px-data-grid .fg-focus-brown:focus {
	color: #825a2c !important;
}
.px-data-grid .fg-focus-olive:focus {
	color: #6d8764 !important;
}
.px-data-grid .fg-focus-steel:focus {
	color: #647687 !important;
}
.px-data-grid .fg-focus-mauve:focus {
	color: #76608a !important;
}
.px-data-grid .fg-focus-taupe:focus {
	color: #87794e !important;
}
.px-data-grid .fg-focus-gray:focus {
	color: #555555 !important;
}
.px-data-grid .fg-focus-dark:focus {
	color: #333333 !important;
}
.px-data-grid .fg-focus-darker:focus {
	color: #222222 !important;
}
.px-data-grid .fg-focus-transparent:focus {
	color: transparent !important;
}
.px-data-grid .fg-focus-darkBrown:focus {
	color: #63362f !important;
}
.px-data-grid .fg-focus-darkCrimson:focus {
	color: #640024 !important;
}
.px-data-grid .fg-focus-darkMagenta:focus {
	color: #81003c !important;
}
.px-data-grid .fg-focus-darkIndigo:focus {
	color: #4b0096 !important;
}
.px-data-grid .fg-focus-darkCyan:focus {
	color: #1b6eae !important;
}
.px-data-grid .fg-focus-darkCobalt:focus {
	color: #00356a !important;
}
.px-data-grid .fg-focus-darkTeal:focus {
	color: #004050 !important;
}
.px-data-grid .fg-focus-darkEmerald:focus {
	color: #003e00 !important;
}
.px-data-grid .fg-focus-darkGreen:focus {
	color: #128023 !important;
}
.px-data-grid .fg-focus-darkOrange:focus {
	color: #bf5a15 !important;
}
.px-data-grid .fg-focus-darkRed:focus {
	color: #9a1616 !important;
}
.px-data-grid .fg-focus-darkPink:focus {
	color: #9a165a !important;
}
.px-data-grid .fg-focus-darkViolet:focus {
	color: #57169a !important;
}
.px-data-grid .fg-focus-darkBlue:focus {
	color: #16499a !important;
}
.px-data-grid .fg-focus-lightBlue:focus {
	color: #4390df !important;
}
.px-data-grid .fg-focus-lightTeal:focus {
	color: #45fffd !important;
}
.px-data-grid .fg-focus-lightOlive:focus {
	color: #78aa1c !important;
}
.px-data-grid .fg-focus-lightOrange:focus {
	color: #c29008 !important;
}
.px-data-grid .fg-focus-lightPink:focus {
	color: #f472d0 !important;
}
.px-data-grid .fg-focus-lightRed:focus {
	color: #ff2d19 !important;
}
.px-data-grid .fg-focus-lightGreen:focus {
	color: #7ad61d !important;
}
.px-data-grid .fg-focus-grayDark:focus {
	color: #333333 !important;
}
.px-data-grid .fg-focus-grayDarker:focus {
	color: #222222 !important;
}
.px-data-grid .fg-focus-grayLight:focus {
	color: #999999 !important;
}
.px-data-grid .fg-focus-grayLighter:focus {
	color: #eeeeee !important;
}
.px-data-grid .fg-focus-blue:focus {
	color: #00aff0 !important;
}

/*
.px-data-grid .ribbed-black {
  background-color: #000000 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-white {
  background-color: #ffffff !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lime {
  background-color: #a4c400 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-green {
  background-color: #60a917 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-emerald {
  background-color: #008a00 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-teal {
  background-color: #00aba9 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-cyan {
  background-color: #1ba1e2 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-cobalt {
  background-color: #0050ef !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-indigo {
  background-color: #6a00ff !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-violet {
  background-color: #aa00ff !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-pink {
  background-color: #dc4fad !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-magenta {
  background-color: #d80073 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-crimson {
  background-color: #a20025 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-red {
  background-color: #e51400 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-orange {
  background-color: #fa6800 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-amber {
  background-color: #f0a30a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-yellow {
  background-color: #e3c800 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-brown {
  background-color: #825a2c !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-olive {
  background-color: #6d8764 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-steel {
  background-color: #647687 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-mauve {
  background-color: #76608a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-taupe {
  background-color: #87794e !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-dark {
  background-color: #1d1d1d !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkBrown {
  background-color: #63362f !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkCrimson {
  background-color: #640024 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkMagenta {
  background-color: #81003c !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkIndigo {
  background-color: #4b0096 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkCyan {
  background-color: #1b6eae !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkCobalt {
  background-color: #00356a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkTeal {
  background-color: #004050 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkEmerald {
  background-color: #003e00 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkGreen {
  background-color: #128023 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkOrange {
  background-color: #bf5a15 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkRed {
  background-color: #9a1616 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkPink {
  background-color: #9a165a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkViolet {
  background-color: #57169a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-darkBlue {
  background-color: #16499a !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightTeal {
  background-color: #45fffd !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightOlive {
  background-color: #78aa1c !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightOrange {
  background-color: #c29008 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightPink {
  background-color: #f472d0 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightRed {
  background-color: #ff2d19 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-lightGreen {
  background-color: #7ad61d !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-grayed {
  background-color: #585858 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-grayDarker {
  background-color: #222222 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-gray {
  background-color: #555555 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-grayLight {
  background-color: #999999 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-grayLighter {
  background-color: #eeeeee !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
.px-data-grid .ribbed-blue {
  background-color: #00aff0 !important;
  background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
}
*/

/* .px-data-grid .px - start*/
.px-data-grid .px-fit {
	border-radius: 0px;
}
.px-data-grid .px-fit-mobile {
	border-radius: 0px;
	width: 100%;
}
.px-data-grid .px-pointer {
	cursor: pointer;
}

/* .px-data-grid .px - end*/