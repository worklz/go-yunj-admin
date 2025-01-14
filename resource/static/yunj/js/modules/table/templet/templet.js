/**
 * TableTemplet
 */
layui.define(['jquery', 'yunj'], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class TableTemplet {

        constructor(options) {
            options = Object.assign({}, {
                tableId: "",
                state: "",
                key: "",
            }, options);

            this.options = options;
            this.tableId = options.tableId;             // 表格id
            this.state = options.state;                 // 状态
            this.key = options.key;                     // key
            this.table = yunj.table[options.tableId];   // 表格对象

            this.id = "";                               // 模板id
            this.boxHtml = "";                          // 模板盒子html

            this._init();
        }

        _init() {
            let that = this;
            // 设置数据
            that._setData();
        }

        // 设置数据
        _setData() {
            let that = this;
            that._setId();
            that._setBoxHtml();
        }

        // 生成id
        _setId() {
            let that = this;
            that.id = `templet_${that.tableId + (that.state ? `_${that.state}` : "") + (that.key ? `_${that.key}` : "")}`;
        }

        // 设置布局
        _setBoxHtml() {
            let that = this;
            that.boxHtml = `<script type="text/html" id="${that.id}"><div class="templet-item-box">__layout__</div></script>`;
        }

        // 渲染
        async render() {
            let that = this;
            if ($(doc).find(`body #${that.id}`).length > 0) return that;
            await that.renderBefore();
            let layout = that.layout();
            let templetLayout = that.boxHtml.replace('__layout__', layout);
            $(doc).find('body').append(templetLayout);
            that.renderDone();
            that._setEventBind();
            return that;
        }

        // 返回模板内容
        layout() {
        }

        // 渲染前执行
        async renderBefore() {
            return 'done'
        }

        // 渲染后执行
        renderDone() {
        }

        // 事件绑定
        _setEventBind() {
            let that = this;
            that.defineExtraEventBind();
        }

        // 定义额外的事件绑定
        defineExtraEventBind() {
        }

    }

    exports('TableTemplet', TableTemplet);
});