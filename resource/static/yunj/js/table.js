/**
 * 云静表格
 */
layui.use(['jquery', 'yunj', 'elemProgress'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let elemProgress = layui.elemProgress;

    class YunjTable {

        // 渲染方式
        static RENDER_MODE = {
            STATE_SWITCH: 'STATE_SWITCH'    // 状态栏切换
        };

        constructor(obj) {
            this.id = obj.id;                         // 当前对象id

            this.rawEl = obj.elem;                    // 原始元素

            this.rawArgs = obj.args;                  // 原始数据

            this.boxEl = null;                       // 顶部父元素

            this.url = null;                         // 请求地址

            this.buildNames = [];                     // 当前构件实例对象名数组，控制构件加载顺序

            this.buildMap = {};                       // 当前构件实例对象map

            this._init().catch(e => {
                yunj.error(e)
            });
        }

        async _init() {
            let that = this;
            if (!that.id || !that.rawArgs || yunj.isEmptyObj(that.rawArgs)) throw new Error("表格构建器参数异常");
            // 初始化数据
            await that._initData();
            // 进度0
            let elemProgressObj = elemProgress({elem: that.boxEl});
            // 渲染
            that.render().then(res => {
                // 设置事件绑定
                that.setEventBind();
                // 进度100%
                elemProgressObj.reset_progress(100);
            });
        }

        /**
         * 原始数据是否设置某个属性
         * @param {string} attr
         * @private {bool}
         */
        rawArgsIsSetAttr(attr) {
            return this.rawArgs.hasOwnProperty(attr);
        }

        // 判断是否设置state
        isSetState() {
            return this.rawArgsIsSetAttr("state");
        }

        // 判断是否设置page
        isSetPage() {
            return this.rawArgsIsSetAttr("page");
        }

        // 判断是否设置limit
        isSetLimit() {
            return this.rawArgsIsSetAttr("limit");
        }

        // 判断是否设置limits
        isSetLimits() {
            return this.rawArgsIsSetAttr("limits");
        }

        // 判断是否设置filter
        isSetFilter() {
            return this.rawArgsIsSetAttr("filter");
        }

        // 判断是否设置toolbar
        isSetToolbar() {
            return this.rawArgsIsSetAttr("toolbar");
        }

        // 判断是否设置filter
        isSetDefaultToolbar() {
            return this.rawArgsIsSetAttr("defaultToolbar");
        }

        /**
         * 判断是否设置tree
         * @param {boolean|string} currState
         * true表示判断当前状态是否设置tree
         * false之判断是否有tree配置
         * 字符串判断指定状态是否配置
         * @returns {boolean}
         */
        isSetTree(currState = true) {
            if (!this.rawArgsIsSetAttr("tree")) {
                return false;
            }
            // 不是判断当前状态，只需判断值是否设置
            if (currState === false) {
                return true;
            }
            // 判断是否有设置state
            let state
            if (yunj.isString(currState)) {
                state = currState;
            } else {
                if (!this.isSetState()) {
                    // 没有设置state直接返回true
                    return true;
                }
                state = this.getCurrState();
            }
            return this.rawArgs.tree.hasOwnProperty(state) && this.rawArgs.tree[state];
        }

        // 判断是否设置cols
        isSetCols() {
            return this.rawArgsIsSetAttr("cols");
        }

        // 数据初始化
        async _initData() {
            let that = this;
            // boxEl
            that.rawEl.after(`<div class="yunj-table-box" lay-filter="${that.id}"></div>`);
            that.boxEl = $(`.yunj-table-box[lay-filter=${that.id}]`);
            // url
            that.url = yunj.url(false);

            // build
            let buildArr = ["state", "filter", "table"];
            for (let i = 0, l = buildArr.length; i < l; i++) {
                let buildUcfirst = buildArr[i].slice(0, 1).toUpperCase() + buildArr[i].slice(1);
                if (!that[`isSet${buildArr[i] === "table" ? "Cols" : buildUcfirst}`]()) continue;
                let layModule = `TableBuild${buildUcfirst}`;
                let build = await new Promise(resolve => {
                    layui.use(layModule, () => {
                        resolve(new layui[layModule](that));
                    });
                });
                that.buildNames.push(build.buildName);
                that.buildMap[build.buildName] = build;
            }
        }

        /**
         * 渲染
         * @param mode  渲染方式
         * @return {Promise<void>}
         */
        async render(mode = '') {
            let that = this;

            for (let i = 0, l = that.buildNames.length; i < l; i++) {
                await that.buildMap[that.buildNames[i]].render(mode);
            }

            // 渲染完成事件触发
            $(doc).trigger(`yunj_table_${that.id}_render_done`);
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            for (let i = 0, l = that.buildNames.length; i < l; i++) {
                that.buildMap[that.buildNames[i]].setEventBind();
            }

            // 文档页面宽度发生变化时触发
            $(win).resize(function () {
                $(doc).trigger(`yunj_table_${that.id}_doc_width_change`);
            });
        }

        // 获取当前状态值
        getCurrState() {
            return this.isSetState() ? this.buildMap.state.getValue() : undefined;
        }

        // 获取当前列表主键key
        getCurrPk() {
            let that = this;
            let pk = 'id';
            let rawArgs = that.rawArgs;
            if (!rawArgs.hasOwnProperty('pk')) {
                return pk;
            }

            let rawPk = rawArgs.pk;
            if (yunj.isString(rawPk)) {
                pk = rawPk;
            } else {
                if (that.isSetState()) {
                    let state = that.getCurrState();
                    if (rawPk.hasOwnProperty(state)) {
                        pk = rawPk[state];
                    }
                }
            }
            return pk;
        }

        // 获取当前列表主键集合key
        getCurrPksKey() {
            let that = this;
            return that.getCurrPk() + 's';
        }

        /**
         * 获取当前请求筛选条件
         * @param args
         * @returns {any}
         */
        getCurrRequestFilter(args = {}) {
            let that = this;
            let defArgs = {
                filter: true,                   // 是否包含筛选表单的值
                convert: true,                  // 是否转换为json字符串
                state: that.getCurrState(),     // 指定状态下的筛选条件（默认当前状态）
            };
            let pksKey = that.getCurrPksKey();
            defArgs[pksKey] = false;            // 是否包含当前选中数据行的主键集合数组
            args = yunj.objSupp(args, defArgs);
            let data = {};
            // 触发获取请求filter data的事件
            $(doc).trigger(`yunj_table_${that.id}_get_request_filter_data`, [data, args]);
            return args.convert ? JSON.stringify(data) : data;
        }

        /**
         * 获取当前组件表格对象
         * @returns {*}
         */
        getCurrBuildTable() {
            return this.isSetCols() ? this.buildMap.table : null;
        }

        /**
         * 获取当前lay表格对象
         * @returns {*}
         */
        getCurrLayTable() {
            let buildTable = this.getCurrBuildTable();
            return buildTable ? buildTable.layTable : null;
        }

    }

    $(doc).ready(function () {
        win.yunj.table = {};

        let tableEls = $('table[type=yunj]');
        if (yunj.isUndefined(YUNJ_TABLE) || !yunj.isObj(YUNJ_TABLE) || tableEls.length <= 0) return;
        win.YunjTable = YunjTable;
        tableEls.each(function () {
            let id = $(this).attr('id');
            if (!YUNJ_TABLE.hasOwnProperty(id)) return true;
            let args = YUNJ_TABLE[id];
            win.yunj.table[id] = new YunjTable({
                id: id,
                elem: $(this),
                args: args
            });
        });
    });

});
