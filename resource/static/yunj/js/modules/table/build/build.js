/**
 * TableBuild
 */
layui.define(['jquery', 'yunj'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableBuild {

        constructor(table, buildName = "") {
            // table对象
            this.table = table;
            // table id
            this.tableId = table.id;
            // table boxEl
            this.tableBoxEl = table.boxEl;

            this.buildName = buildName;      // 构件名
            this.buildArgs = null;          // 构件配置参数
            this.buildBoxEl = null;         // 构件父元素
            this._initBuild();
        }

        // 初始化build
        _initBuild() {
            let that = this;

            // 获取当前构件的原始配置参数
            // 因为使用uglifyjs会导致class类名被压缩，所以此处不能这样写
            // let buildName = that.constructor.name.replace("TableBuild", "");
            // console.log(that.constructor.name);
            // console.log(buildName);
            // console.log(buildName.slice(0, 1).toLowerCase() + buildName.slice(1));
            // buildName = buildName.slice(0, 1).toLowerCase() + buildName.slice(1);
            // that.buildName = buildName;
            let buildName = that.buildName;
            if (!that.table.rawArgs.hasOwnProperty(buildName)) throw new Error(`表格[${that.tableId}]未设置[${buildName}]`);
            that.buildArgs = that.table.rawArgs[buildName];

            // 设置当前build box
            let buildBoxElClass = `yunj-table-${buildName.replace(/(?<=[a-z])([A-Z])/, "-$1").toLowerCase()}-box`;
            that.tableBoxEl.append(`<div class="${buildBoxElClass}"></div>`);
            that.buildBoxEl = that.tableBoxEl.find(`.${buildBoxElClass}`);
        }

        /**
         * 渲染
         * @param mode  渲染方式(YunjTable.RENDER_MODE)
         * @return {Promise<void>}
         */
        async render(mode = '') {
        }

        setEventBind() {
        }

        // 判断是否设置state
        isSetState() {
            return this.table.isSetState();
        }

        // 判断是否设置page
        isSetPage() {
            return this.table.isSetPage();
        }

        // 判断是否设置limit
        isSetLimit() {
            return this.table.isSetLimit();
        }

        // 判断是否设置limits
        isSetLimits() {
            return this.table.isSetLimits();
        }

        // 判断是否设置filter
        isSetFilter() {
            return this.table.isSetFilter();
        }

        // 判断是否设置toolbar
        isSetToolbar() {
            return this.table.isSetToolbar();
        }

        // 判断是否设置filter
        isSetDefaultToolbar() {
            return this.table.isSetDefaultToolbar();
        }

        // 判断是否设置import
        isSetTree() {
            return this.table.isSetTree();
        }

        // 判断是否设置cols
        isSetCols() {
            return this.table.isSetCols();
        }

        // 获取当前状态值
        getCurrState() {
            return this.table.getCurrState();
        }

        // 获取当前列表主键key
        getCurrPk() {
            return this.table.getCurrPk();
        }

        // 获取当前列表主键集合key
        getCurrPksKey() {
            return this.table.getCurrPksKey();
        }

        // 获取当前请求筛选条件
        getCurrRequestFilter(args = {}) {
            return this.table.getCurrRequestFilter(args);
        }

    }

    exports('TableBuild', TableBuild);
});