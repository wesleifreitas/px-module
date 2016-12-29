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
		};
	}]);
var module = angular.module('px-data-grid', ['px-data-grid.service', 'px-data-grid.filter', 'px-array-util', 'px-date-util', 'px-mask-util', 'px-string-util', 'px-util']); // jshint ignore:line

module.directive('pxDataGrid', ['pxConfig', 'pxArrayUtil', 'pxUtil', '$timeout', '$sce', '$rootScope', function(pxConfig, pxArrayUtil, pxUtil, $timeout, $sce, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        //template: '<div class="px-data-grid"><table id="{{id}}_pxDataTable" ng-bind-html="dataTable" class="table table-striped hovered dataTable" width="100%"></table></div>',
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
            configChange: '&pxConfigChange',
            itemClick: '&pxItemClick',
            itemEdit: '&pxItemEdit',
            dataInit: '=pxDataInit',
            rowsProcess: '@pxRowsProcess',
            demand: '@pxDemand',
            control: '=pxControl',
            labelFunction: '&pxLabelFunction',
        },
        link: function(scope, element, attrs) {

            element.on('$destroy', function() {
                // Remover scope.$watch('config',...
                watchConfig();
            });

            // Verificar class                
            if (attrs.class.trim() === 'px-data-grid') {
                // default
                scope.class = "table dataTable hovered";
            } else {
                scope.class = "table dataTable hovered " + attrs.class.replace('px-data-grid', '');
            }

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
                scope.scrollY = newValue.scrollY || '';
                scope.url = newValue.url || '';
                scope.paging = newValue.paging;
                scope.method = newValue.method;
                scope.fields = newValue.fields;

                scope.dataTable = '';
                scope.dataTable += '<thead>';

                // Campos para o dataTable (dados)
                scope.aoColumns = [];

                // Colunas para o <table>
                scope.columns = '';

                // Rodapé <table>
                scope.foot = '';

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
                        for (var j = 0; j < pxConfig.GROUP_REPLACE.length; j++) {
                            scope.groupItem = scope.groupItem.replace(pxConfig.GROUP_REPLACE[j], '');
                        }
                    }
                    if (pxConfig.GROUP_LABEL_SUFFIX === '') {
                        scope.groupLabel = scope.groupLabel || pxConfig.GROUP_LABEL;
                    } else if (!angular.isDefined(scope.groupLabel)) {
                        scope.groupLabel = scope.groupLabel || pxConfig.GROUP_TABLE + '_' + pxConfig.GROUP_LABEL_SUFFIX;
                        for (var k = 0; k < pxConfig.GROUP_REPLACE.length; k++) {
                            scope.groupLabel = scope.groupLabel.replace(pxConfig.GROUP_REPLACE[k], '');
                        }
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
                scope.links = {};

                angular.forEach(scope.fields, function(index) {

                    index.width = index.width || '';
                    if (index.align === 'center') {
                        index.align = 'text-center';
                    } else if (index.align === 'right') {
                        index.align = 'text-right';
                    } else {
                        index.align = 'text-left';
                    }

                    // Checkbox  - Start
                    if (i === 0 && scope.check === true) {
                        scope.columns += '<th class="text-left" width="1%"><input id="' + scope.id + '_select_all" value="1" type="checkbox"></th>';
                        scope.foot += '<th width="1%"></th>';

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
                        scope.foot += '<th width="1%"></th>';

                        aoColumnsData = {};
                        aoColumnsData.mData = 'edit';

                        scope.aoColumns.push(aoColumnsData);

                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "searchable": false,
                            "orderable": false,
                            "className": "dt-body-center edit",
                            "render": function(data, type, full, meta) {
                                return "<i class='fa fa-pencil'>";
                                //return "<i class='fa fa-pencil'> <b>Editar</b>";
                            }
                        });
                        columnDefs++;
                    }
                    // Edit - End

                    if (index.linkId && index.linkId !== '') {
                        index.link = true;
                    }

                    // Verificar se o campo é link
                    if (index.link || index.class) {
                        index.width = '' || '1%';
                        scope.links[columnDefs] = index;
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
                                if (index.link) {
                                    var value = index.value === false ? '' : typeof data === 'string' ? data : '';

                                    // Retornar directive
                                    /*var html = "<div class='link " +
                                        index.align +
                                        "'><i link='true' linkId=" +
                                        index.linkId + " class='" +
                                        index.class + "'>" + index.icon +
                                        "</i>" +
                                        value +
                                        "</div>";
                                    return ($compile(angular.element(html))(scope)[0]).innerHTML;*/

                                    return "<div class='link " +
                                        index.align +
                                        "'><i link='true' linkId=" +
                                        index.linkId +
                                        " class='" +
                                        index.class +
                                        "'>" +
                                        index.icon +
                                        "</i>" +
                                        value +
                                        "</div>";
                                } else {
                                    return "<div class='" + index.align + "'><i class='" + index.class + "'>" + index.icon + "</i></div>";
                                }
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

                    // Verificar se o campo é invisível
                    if (index.visible === false) {
                        scope.columnDefs.push({
                            "targets": columnDefs,
                            "visible": false,
                            "render": function(data, type, full, meta) {
                                return data;
                            }
                        });
                    }
                    columnDefs++;

                    scope.columns += '<th class="text-left">' + index.title + '</th>';
                    //scope.foot += '<th class="text-left">' + index.title + '</th>';
                    scope.foot += '<th class="text-left"></th>';

                    aoColumnsData = {};
                    aoColumnsData.mData = index.field;

                    scope.aoColumns.push(aoColumnsData);
                    i++;

                });
                scope.dataTable += scope.columns;

                scope.dataTable += '</thead>';

                scope.dataTable += '<tbody></tbody>';

                scope.dataTable += '<tfoot class="tfoot">';
                scope.dataTable += scope.foot;
                scope.dataTable += '</tfoot>';

                scope.dataTable = $sce.trustAsHtml(scope.dataTable);

                // Único $timeout
                // Chamado apenas um vez após a configuração da listagem
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
                        };
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
                    };
                    // Acesso via mobile browser
                    if (pxUtil.isMobile()) {
                        dataTableConfig.pagingType = "simple";
                        dataTableConfig.pageLength = 8;
                    }
                    dataTableConfig.initComplete = function(settings, json) {
                        $timeout(function() {
                            $('#' + scope.id + '_pxDataTable').DataTable().columns.adjust().draw();
                        }, 0);
                    };
                    dataTableConfig.scrollX = true;
                    dataTableConfig.scrollY = scope.scrollY;
                    //dataTableConfig.scrollCollapse= true;
                    dataTableConfig.paging = scope.paging;
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
                    //var table = $('#' + scope.id + '_pxDataTable').DataTable();
                    scope.internalControl.table = $('#' + scope.id + '_pxDataTable').DataTable();
                    //});
                    // Verificar se o eventos não foram adicionar
                    if (!scope.events) {
                        // Chamar função para adicionar os eventos
                        scope.eventInit();
                        // Eventos adicionados
                        scope.events = true;
                    }

                    if (!scope.creationcomplete) {
                        scope.creationcomplete = true;
                        // Chama evento px-init
                        scope.init({
                            event: {
                                config: JSON.parse(scope.config)
                            }
                        });
                    } else {
                        // Chama evento px-config-change
                        scope.configChange({
                            event: {
                                config: JSON.parse(scope.config)
                            }
                        });
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
            scope.internalControl.getData = function(params) {
                scope.params = params;
                $timeout(function() {
                    scope.getData(0, scope.rowsProcess, scope.params);
                }, 0);
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
             * @param {boolean} temp adicionar linhas em dataTemp?
             */
            scope.internalControl.addDataRow = function(value, temp) {
                scope.addDataRow(value, temp);
            };

            /**
             * Adicionar linhas de registro
             * @param {object} data linhas             
             */
            scope.internalControl.addDataRows = function(data) {
                scope.dataTemp = [];
                // Loop na query
                angular.forEach(data, function(index) {
                    scope.addDataRow(index, true);
                });

                $('#' + scope.id + '_pxDataTable').DataTable().rows.add(scope.dataTemp).draw();
                delete scope.dataTemp;

                $timeout(function() {
                    $('#' + scope.id + '_pxDataTable').DataTable().columns.adjust().draw();
                }, 500);
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
                if (!angular.isNumber($scope.nextRowFrom)) {
                    return;
                }

                if (info.page === info.pages - 1) {
                    $scope.currentPage = info.page;
                    if ($scope.demand) {
                        $scope.getData($scope.nextRowFrom, $scope.nextRowTo, $scope.params);
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
            if ($scope.check !== true) {
                return;
            }

            var $table = table.table().node();
            var $chkbox_all = $('tbody input[type="checkbox"]', $table);
            var $chkbox_checked = $('tbody input[type="checkbox"]:checked', $table);
            var chkbox_select_all = $('thead input[id="' + $scope.id + '_select_all"]')[0];
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

            var itemEdit = {}; //angular.copy(JSON.parse($scope.fields))

            angular.forEach($scope.fields, function(index) {
                itemEdit[index.field] = data.edit[index.field];
            });

            var itemEditEvent = {
                itemClick: data,
                itemEdit: itemEdit
            };

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
            var columnIndex = $scope.internalControl.table.column.index('fromVisible', index);
            /*
            if ($scope.edit === true) {
                columnIndex--;
            }
            if ($scope.check === true) {
                columnIndex--;
            }
            */

            // Dados da linha
            var data = angular.copy($scope.internalControl.table.row($row).data());
            if ($scope.links[columnIndex]) {
                data.link = $scope.links[columnIndex];
                data.linkId = $scope.links[columnIndex].linkId;
            } else {
                return;
            }

            var itemClickEvent = {
                itemClick: data,
            };

            //$timeout(function() {
            $scope.itemClick({
                event: itemClickEvent
            });
            //}, 0);

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
            };

            //$timeout(function() {
            $scope.itemClick({
                event: itemClickEvent
            });
            //}, 0);

            // Evento Item Click - End

            // Clicar no edit
            if (e.target.tagName === 'I') {
                return;
            }
            $(this).parent().find('input[type="checkbox"]').trigger('click');
        });


        // Evento click (selecionar tudo)
        $('thead input[id="' + $scope.id + '_select_all"]').on('click', function(e) {
            if (this.checked) {
                $('#' + $scope.id + '_pxDataTable tbody input[type="checkbox"]:not(:checked)').trigger('click');
            } else {
                $('#' + $scope.id + '_pxDataTable tbody input[type="checkbox"]:checked').trigger('click');
            }

            e.stopPropagation();
        });

        // Evento draw
        // https://datatables.net/reference/event/draw
        $('#' + $scope.id + '_pxDataTable').on('draw.dt', function() {
            // Atualizar dataTable (Selecionar tudo)
            $scope.updateDataTableSelectAllCtrl($scope.internalControl.table);
        });

        $timeout(function() {
            $('#' + $scope.id + '_pxDataTable').DataTable().columns.adjust().draw();
        }, 0);
    };

    /**
     * Recupera dados para listagem
     * @param  {number} rowFrom linha inicial
     * @param  {number} rowTo   linha final
     * @return {void}
     */
    $scope.getData = function(rowFrom, rowTo, params) {
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
                    _element = angular.element($(selectorNameEnd).get(0));
                    _ngModelCtrl = _element.data('$ngModelController');
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
                        index.filterObject.value = moment(index.filterObject.value).format('YYYYMMDD');
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
        var data = {};

        data.url = $scope.url;
        data.method = $scope.method;
        data.params = $scope.params;

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
                if (response.data.query.length > 0) {
                    $scope.dataTemp = [];
                    // Loop na query
                    angular.forEach(response.data.query, function(index) {
                        $scope.addDataRow(index, true);
                    });

                    $('#' + $scope.id + '_pxDataTable').DataTable().rows.add($scope.dataTemp).draw();
                    delete $scope.dataTemp;

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

                    var infoMessage = info.recordsTotal + ' registros carregados.';

                    if (angular.isNumber($scope.recordCount)) {
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
                data.edit[item.field] = value[item.field];
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
    };

    $scope.sortDataBy = function sortDataBy(value) {
        // Ordenar dados do dataTable
        //requirejs(["dataTables"], function() {
        $('#' + $scope.id + '_pxDataTable').DataTable().order(value).draw();
        //});
    };

    $scope.addDataRow = function addDataRow(value, temp) {

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

                data.value = value;
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

        if (temp) {            
            $scope.dataTemp.push(data);
        } else {
            $('#' + $scope.id + '_pxDataTable').DataTable().row.add(data).draw();
        }
    };

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
        $scope.internalControl.selectedItems = [];
    };

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
    };

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

        var data = {};
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

        data.params = data.params || {};
        data.params.rowFrom = data.rowFrom;
        data.params.rowTo = data.rowTo;

        $http({
            method: data.method,
            url: data.url,
            data: data,
            params: data.params
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