/**
 * ImportStepTwo
 */
layui.define(['jquery', 'yunj', "ImportStepTypeTable", "validate"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let ImportStepTypeTable = layui.ImportStepTypeTable;
    let validate = layui.validate;

    class ImportStepTwo extends ImportStepTypeTable {

        constructor(importObj) {
            super(importObj, "two", "数据确认");
            this.dataId = 1;                            // 数据id
            this.typeSort = ['normal', 'error'];
            this.typeConfig = {
                normal: {desc: '可选数据'},
                error: {desc: '错误数据'},
            };
            this.currType = 'normal';
        }

        async render(refresh = false) {
            let that = this;
            let uploadFile = that.getCurrUploadFile();
            if (!uploadFile) {
                throw new Error("请选择上传文件");
            }
            if (!refresh) {
                return;
            }
            that.initData();
            that.setContentBoxHtml();
            await that.handleItems(uploadFile);
            that.setCurrType('normal');
        }

        // 处理上传数据
        handleItems(uploadFile) {
            let that = this;
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onerror = function (e) {
                    reject(`无法读取文件！<br>${reader.error}`);
                };
                reader.onload = function (e) {
                    let data = e.target.result;
                    let workbook = XLSX.read(data, {type: 'binary'});
                    that.dataId = 1;  // 自定义数据id
                    try {
                        if (that.isSetSheet()) {
                            // 不能写成连等形式，obj为引用变量
                            workbook.SheetNames.forEach(sheet => {
                                // 导入数据描述的工作表排除
                                if (sheet === that.importObj.stepMap.one.templetDescSheetName) {
                                    return;
                                }
                                that.handleUploadFileSheetData(workbook.Sheets[sheet], sheet);
                            });
                        } else {
                            that.handleUploadFileSheetData(workbook.Sheets[that.importObj.defaultSheetName]);
                        }
                    } catch (e) {
                        reject(e.message);
                        console.log(e);
                    }
                    yunj.isEmptyObj(that.typeAllItems) ? reject("上传文件数据格式错误，详见示例模板") : resolve();
                };
                reader.readAsBinaryString(uploadFile);
            });
        }

        // 处理上传文件工作簿数据
        handleUploadFileSheetData(worksheet, sheet = false) {
            let that = this;
            let sheet2JSONOpts = {
                // 空值/未定义值的默认值
                "defval": ""
            };
            let rows = XLSX.utils.sheet_to_json(worksheet, sheet2JSONOpts);
            let cols = that.getCols(sheet);
            if (yunj.isEmptyObj(cols)) {
                return;
            }

            for (let i = 0, l = rows.length; i < l; i++) {
                let row = rows[i];  // 单行数据
                let item = {
                    _id: that.dataId++,
                    _sheet: sheet,
                    LAY_CHECKED: false,
                    LAY_DISABLED: false,
                    _rowIdx: i + 1,
                    _rowData: row
                };
                let isEmptyLine = true;
                for (let k in cols) {
                    if (!cols.hasOwnProperty(k)) {
                        continue;
                    }
                    let title = cols[k].title;
                    if (!row.hasOwnProperty(title)) {
                        throw new Error("上传文件数据格式错误，详见示例模板");
                    }
                    let val = row[title];
                    if (yunj.isString(val)) {
                        val = yunj.trim(val);
                    }
                    if (val !== "") {
                        isEmptyLine = false;
                    }
                    item[k] = val;
                }
                if (isEmptyLine) {
                    continue;   // 空数据行直接跳过
                }
                // 进行数据校验
                let validateAttr = that.getColsValidateAttr(sheet);
                validate.create({
                    rule: validateAttr.rule,
                    batch: true
                });
                let res = validate.check(item, validateAttr.dataTitle);
                if (!res) {
                    item._error = validate.getFieldError();
                    that.addErrorItem(item);
                } else {
                    // 一开始选中状态
                    that.addNormalItem(item);
                }
            }

        }

        // 新增正常的item
        addNormalItem(item) {
            let that = this;
            item.LAY_CHECKED = true;
            that.addTypeItem('normal', item);
        }

        // 新增错误的item
        addErrorItem(item) {
            let that = this;
            item.LAY_CHECKED = false;
            that.addTypeItem('error', item);
        }

        // 删除正常的item
        delNormalItem(item) {
            let that = this;
            that.delTypeItem('normal', item);
        }

        // 删除错误的item
        delErrorItem(item) {
            let that = this;
            that.delTypeItem('error', item);
        }

        // 获取正常的数据量
        getNormalItemsCount() {
            let that = this;
            return that.getTypeItemsCount('normal');
        }

        // 获取错误的数据量
        getErrorItemsCount() {
            let that = this;
            return that.getTypeItemsCount('error');
        }

        // 设置可选类型的操作html
        renderNormalActionHtml() {
            let that = this;
            let formId = that.getCurrTypeActionFormId();
            let checkAllFilter = that.getTypeCheckAllFilter('normal');
            that.typeActionEl.append(`<div class="action normal">
                                        <div class="tips">选中<em class="check-count">0</em>条</div>
                                        <form class="layui-form layui-form-pane" lay-filter="${formId}">
                                            <div class="layui-form-item" style="margin: 0">
                                                <input type="checkbox" title="全选" lay-filter="${checkAllFilter}">
                                            </div>
                                        </form>
                                    </div>`);
            that.layForm.render('checkbox', formId);
            that.layForm.on(`checkbox(${checkAllFilter})`, function (data) {
                that.setCurrTypeTabTablesCheckAll(data.elem.checked);
            });
            that.typeActionEl.find(`.action.normal input[type=checkbox][lay-filter='${checkAllFilter}']`).prop("checked", false);
            that.layForm.render('checkbox', formId);
        }

        // 设置错误类型的html
        renderErrorActionHtml() {
            let that = this;
            let formId = that.getCurrTypeActionFormId();
            let checkAllFilter = that.getTypeCheckAllFilter('error');
            that.typeActionEl.append(`<div class="action error">
                                        <div class="tips"><span class="notice">注意：点击表格可修改数据并验证提交！</span>选中<em class="check-count">0</em>条</div>
                                        <form class="layui-form layui-form-pane" lay-filter="${formId}">
                                            <div class="layui-form-item" style="margin: 0">
                                                <input type="checkbox" title="全选" lay-filter="${checkAllFilter}">
                                                <button type="button" class="layui-btn layui-btn-sm btn-check-submit">验证/提交至可选</button>
                                            </div>
                                        </form>
                                    </div>`);
            that.layForm.render('checkbox', formId);
            that.layForm.on(`checkbox(${checkAllFilter})`, function (data) {
                that.setCurrTypeTabTablesCheckAll(data.elem.checked);
            });
            that.typeActionEl.find(`.action.error input[type=checkbox][lay-filter='${checkAllFilter}']`).prop("checked", false);
            that.layForm.render('checkbox', formId);

            // 错误数据验证并提交
            that.contentBoxEl.on('click', '.type-action .action.error .btn-check-submit', function (e) {
                that.errorItemsCheckSubmit();
                e.stopPropagation();
            });
        }

        // 获取指定类型tab表格tab切换栏标题附加元素
        getTypeTabTableTabTitleAppendHtml(type, sheet) {
            let that = this;
            return `<span class="layui-badge check-count ${type === 'normal' ? 'layui-bg-green' : ''}">0</span>`;
        }

        // 获取指定类型tab表格表头
        getTypeTabTableCols(type, sheet = false) {
            let that = this;
            let cols = that.getCols(sheet);
            let layTableCols = [{field: '_id', type: 'checkbox', LAY_CHECKED: type === 'normal'}];
            for (let field in cols) {
                if (!cols.hasOwnProperty(field)) {
                    continue;
                }
                let col = {field: field, type: 'normal', title: cols[field].title};
                if (type === 'error') {
                    col.edit = 'text';
                    // 判断是否错误字段
                    col.templet = function (d) {
                        if (d._error.hasOwnProperty(field)) {
                            return `<div class="error-cell" title="${d._error[field]}" data-field="${field}" data-row-data='${JSON.stringify(d)}'>${d[field]}</div>`;
                        }
                        return d[field];
                    };
                }
                layTableCols.push(col);
            }
            return layTableCols;
        }

        // 渲染指定类型tab表格后执行
        renderTypeTabTableDone(tableObj, type, sheet) {
            let that = this;
            that.layTable.resize(tableObj.id);

            // 设置指定类型的选中数量
            that.setTypeTabTablesCheckCount(type);

            that.layTable.on(`checkbox(${tableObj.id})`, function (obj) {
                if (obj.type === 'all') {
                    that.setItemsChecked(obj.checked, type, sheet);
                } else {
                    that.setItemChecked(obj.checked, type, obj.data);
                }
                that.setTypeTabTablesCheckCount(type);
            });
            // 取消全选
            let checkAllEl = that.typeTabTablesEl.find(`.layui-table-view[lay-id=${this.id}] .layui-table-header thead:first tr:first th:first .layui-form-checkbox`);
            let isChecked = checkAllEl.hasClass("layui-form-checked");
            if (isChecked) {
                checkAllEl.click();
            }
        }

        // 错误数据验证并提交
        errorItemsCheckSubmit() {
            let that = this;
            super.typeTabTableItemsCheckSubmit('error', (item) => {
                // 成功
                delete item._error;
                that.delErrorItem(item);
                that.addNormalItem(item);
            }, (item, validate) => {
                // 失败
                item._error = validate.getFieldError();
                that.changeItem(item);
            }, (successCount, errorCount) => {
                // 已完成
                if (successCount) {
                    that.reloadTypeHtml('error');
                    that.setTypeTabTablesCheckCount('error');
                    that.reloadTypeHtml('normal');
                    that.setTypeTabTablesCheckCount('normal');
                }
                if (errorCount) {
                    yunj.msg(`仍有${errorCount}条数据错误，请修改后重新提交`);
                }
            });
        }

        // 错误表格单元格数据校验
        errorCellCheck(cellEl) {
            let that = this;
            super.checkCellData(cellEl, (rowData, field, validate) => {
                // 校验失败执行
                rowData._error[field] = validate.getError();
            });
        }

        // 获取选中的上传数据
        getCheckedImportItems() {
            let that = this;
            let items;
            let tablesEl = that.typeTabTablesEl.find('.tab-tables.normal .layui-tab-item > .layui-table');
            if (tablesEl.length <= 0) {
                throw new Error('上传文件数据异常');
            }
            if (that.isSetSheet()) {
                items = {};
                tablesEl.each(function () {
                    let tableEl = $(this);
                    let tableId = tableEl.attr('id');
                    let sheet = tableEl.data('sheet');
                    let checkData = that.layTable.checkStatus(tableId).data;
                    if (checkData.length <= 0) {
                        return true;
                    }
                    items[sheet] = checkData;
                });
                if (yunj.isEmptyObj(items)) {
                    throw new Error('请勾选要上传的数据');
                }
            } else {
                items = [];
                let tableEl = tablesEl.eq(0);
                let tableId = tableEl.attr('id');
                let checkData = that.layTable.checkStatus(tableId).data;
                if (checkData.length > 0) {
                    items = checkData;
                }
                if (items.length <= 0) {
                    throw new Error('请勾选要上传的数据');
                }
            }
            return items;
        }

        setEventBind() {
            let that = this;

            // 错误数据修改后验证
            that.contentBoxEl.on('DOMNodeInserted', '.type-tab-tables .tab-tables.error .error-cell', function (e) {
                that.checkCellData($(this));
                e.stopPropagation();
            });

        }

    }

    exports('ImportStepTwo', ImportStepTwo);
});