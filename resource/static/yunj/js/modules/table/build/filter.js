/**
 * TableBuildFilter
 */
layui.define(['jquery', 'yunj', "TableBuild", 'button', 'validate'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let TableBuild = layui.TableBuild;
    let button = layui.button;
    let validate = layui.validate;

    class TableBuildFilter extends TableBuild {

        constructor(table) {
            super(table, "filter");
            this.fieldObjs = {};    // 筛选表单字段实例容器
            this.currFormEl = null; // 当前表单元素
        }

        /**
         * 渲染
         * @param mode  渲染方式(YunjTable.RENDER_MODE)
         * @return {Promise<void>}
         */
        async render(mode = '') {
            let that = this;

            that._renderBefore();

            await that._renderFields();

            let formEl = that.buildBoxEl.find('.filter-form');
            if (formEl.length <= 0) return;
            formEl.removeClass('filter-form-this');

            let currFormEl = that.buildBoxEl.find(`.filter-form[lay-filter=${that.getCurrFormId()}]`);
            if (currFormEl.length <= 0) return;
            currFormEl.addClass('filter-form-this');
            that.currFormEl = currFormEl;

            // 设置当前表单布局
            that._setCurrFormLayout();

            that._renderAfter();
        }

        // 渲染字段
        async _renderFields() {
            let that = this;
            if (that.buildBoxEl.find('.filter-form').length > 0) return;
            let filter = that.buildArgs;
            if (that.isSetState()) {
                for (let state in filter) {
                    if (!filter.hasOwnProperty(state) || (yunj.isArray(filter[state]) && filter[state].length <= 0)) continue;
                    let formId = that.generateFormId(state);
                    that.buildBoxEl.append(`<form class="layui-form layui-form-pane yunj-form filter-form" lay-filter="${formId}"><div class="layui-row"></div></form>`);
                    await that._renderFormFields(formId, filter[state]);
                }
            } else {
                if (yunj.isArray(filter) && filter.length <= 0) return;
                let formId = that.generateFormId();
                that.buildBoxEl.append(`<form class="layui-form layui-form-pane yunj-form filter-form" lay-filter="${formId}"><div class="layui-row"></div></form>`);
                await that._renderFormFields(formId, filter);
            }
        }

        // 渲染指定表单字段
        async _renderFormFields(formId, fields) {
            let that = this;
            let grid = [12, 6, 3, 3, 3];
            for (let key in fields) {
                if (!fields.hasOwnProperty(key)) continue;
                let args = fields[key];
                if (!args.hasOwnProperty('grid') || !yunj.isPositiveIntArray(args.grid)) {
                    args.grid = grid;
                }
                await new Promise((resolve) => {
                    yunj.formField(args.type, {
                        formId: formId,
                        key: key,
                        args: args,
                    }).then(field => {
                        field.render(
                            `.filter-form[lay-filter=${formId}] > .layui-row`,
                            ''
                        ).then(res => {
                            that.fieldObjs[field.id] = field;
                            resolve();
                        });
                    });
                });
            }
            let gridClass = yunj.generateGridClass(grid);
            let actionsBoxContent = `<div class="${gridClass}"><div class="layui-form-item yunj-form-item"><div class="actions-box"></div></div></div>`;
            that.buildBoxEl.find(`.filter-form[lay-filter=${formId}] > .layui-row`).append(actionsBoxContent);
        }

        // 设置当前表单布局
        _setCurrFormLayout() {
            let that = this;
            if (!that.currFormEl) return;
            let currFormEl = that.currFormEl;

            that._setCurrFormLabelLayout();

            that._setCurrFormButtonLayout();

            //判断筛选字段数量是否>2（包含按钮）
            if (currFormEl.find(".layui-row > div").length <= 2) return;

            //适配屏宽
            let otherFormItemEl = currFormEl.find(".layui-row > div:not(:first,:last)");
            if (doc.body.offsetWidth > 768) {
                //展开其他的条件项
                otherFormItemEl.show('fast');
                //隐藏展开、收起按钮
                currFormEl.removeClass('filter-form-stow').addClass('filter-form-unfold');
            } else {
                //隐藏其他的条件项
                otherFormItemEl.hide('fast');
                //显示展开、收起按钮
                currFormEl.removeClass('filter-form-stow').addClass('filter-form-unfold');
            }
        }

        // 设置当前表单字段label布局
        _setCurrFormLabelLayout() {
            let that = this;
            let labelMaxWidth = 0;
            let formItemEl = that.currFormEl.find('.yunj-form-item:not(.yunj-form-item-label-width-fill,:has(.yunj-form-item-label-width-fill))');
            formItemEl.find('.layui-form-label').css('width', 'auto');
            formItemEl.each(function () {
                let currLabelWidth = $(this).find('.layui-form-label').outerWidth();
                if (currLabelWidth > labelMaxWidth) labelMaxWidth = currLabelWidth;
            });
            formItemEl.find('.layui-form-label').css('width', labelMaxWidth + 2 + 'px');
        }

        // 设置筛选表单按钮布局
        _setCurrFormButtonLayout() {
            let that = this;
            let lastFormItemEl = that.currFormEl.find('.yunj-form-item:last .actions-box');
            if (lastFormItemEl.html().length > 0) return;
            let formId = that.getCurrFormId();
            let boxFilter = `.filter-form[lay-filter=${formId}] .yunj-form-item:last .actions-box`;
            button('search', formId).render(boxFilter);
            button('reset', formId).render(boxFilter);
            lastFormItemEl.append(`<button type="button" class="layui-btn layui-btn-sm layui-btn-primary layui-icon filter-form-layout-control"></button>`);
        }

        // 渲染前
        _renderBefore() {
        }

        // 渲染后
        _renderAfter() {
            let that = this;

            // 绑定获取请求filter data的触发事件
            let eventRepeatKey = `YUNJ_TABLE_${that.tableId}_GET_REQUEST_FILTER_DATA_EVENT_BIND_BY_FILTER`;
            if (yunj.isUndefined(win[eventRepeatKey])) {
                win[eventRepeatKey] = true;
                $(doc).bind(`yunj_table_${that.tableId}_get_request_filter_data`, function (e, data, args) {
                    if (!args.filter) return;
                    let filterValues = yunj.formData(that.generateFormId(args.state ? args.state : false), validate);
                    Object.assign(data, filterValues);
                });
            }
        }

        setEventBind() {
            let that = this;

            // 绑定文档宽度发生变化时触发
            $(doc).bind(`yunj_table_${that.tableId}_doc_width_change`, function (e) {
                that._setCurrFormLayout();
            });
            // unfold展开/stow收起
            that.buildBoxEl.on('click', '.filter-form-layout-control', function () {
                // 是否展开
                console.log(123123);
                let isUnfold = that.currFormEl.hasClass('filter-form-unfold');
                that.currFormEl.removeClass(`filter-form-${isUnfold ? "unfold" : "stow"}`).addClass(`filter-form-${isUnfold ? "stow" : "unfold"}`);
                that.currFormEl.find(".layui-row > div:not(:first,:last)").slideToggle("fast");
            });
            // 重置
            that.buildBoxEl.on('click', '.yunj-btn-reset', function () {
                $(doc).trigger(`yunj_form_${that.getCurrFormId()}_reset`);
                $(doc).trigger(`yunj_table_${that.tableId}_filter_submit`);
            });
            // 搜索
            that.buildBoxEl.on('click', '.yunj-btn-search', function () {
                // 筛选表单提交的触发事件
                $(doc).trigger(`yunj_table_${that.tableId}_filter_submit`);
            });
            // 监听回车也是搜索事件
            that.buildBoxEl.on("keyup", function (e) {
                if (e.keyCode === 13) {
                    // 判断是否有包含光标的input
                    let inputEl = that.buildBoxEl.find('input:focus');
                    if (inputEl.length > 0) {
                        // input值是否为空也触发，有可能之前有值，后面删除了
                        //that.buildBoxEl.find('.yunj-btn-search').click();
                        $(doc).trigger(`yunj_table_${that.tableId}_filter_submit`);
                    }
                }
            });
        }

        // 生成筛选表单对象id
        generateFormId(state = false) {
            return this.tableId + (state !== false ? `_${state}` : "");
        }

        // 获取当前筛选表单对象id
        getCurrFormId() {
            return this.tableId + (this.isSetState() ? `_${this.getCurrState()}` : "");
        }

    }

    exports('TableBuildFilter', TableBuildFilter);
});