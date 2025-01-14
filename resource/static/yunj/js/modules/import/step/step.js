/**
 * ImportStep
 */
layui.define(['jquery', 'yunj'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class ImportStep {

        constructor(importObj, name = "", desc = "") {
            // import对象
            this.importObj = importObj;
            // import id
            this.importId = importObj.id;
            // import box
            this.importBoxEl = importObj.boxEl;
            // import stepBoxEl
            this.importStepBoxEl = importObj.stepBoxEl;
            // import contentBoxEl
            this.importContentBoxEl = importObj.contentBoxEl;
            // 名称
            this.name = name;
            // 描述
            this.desc = desc;
            // 当前步骤内容容器
            this.contentBoxEl = null;

            this._init();
        }

        // 初始化
        _init() {
            let that = this;
            that._initLayout();
            that._initDate();
        }

        // 初始化结构
        _initLayout() {
            let that = this;
            let no = that.importStepBoxEl.children(".item").length + 1;
            let stepHtml = `<div class="item" data-step="${that.name}">
                                <div class="line"></div>
                                <div class="content">
                                    <div class="icon-box">
                                        <span class="no">${no}</span>
                                        <i class="layui-icon layui-icon-ok"></i>
                                    </div>
                                    <div class="txt">${that.desc}</div>
                                </div>
                            </div>`;
            that.importStepBoxEl.append(stepHtml);
            let contentHtml = `<div class="yunj-import-step-content ${that.name}" data-step="${that.name}"></div>`;
            that.importContentBoxEl.append(contentHtml);
        }

        // 初始化数据
        _initDate() {
            let that = this;
            that.contentBoxEl = that.importContentBoxEl.find(`.yunj-import-step-content[data-step=${that.name}]`);
        }

        // 判断是否设置sheet
        isSetSheet() {
            return this.importObj.isSetSheet();
        }

        // 判断是否设置cols
        isSetCols() {
            return this.importObj.isSetCols();
        }

        // 判断是否设置templet
        isSetTemplet() {
            return this.importObj.isSetTemplet();
        }

        /**
         * 渲染
         * @param refresh   刷新
         * @returns {Promise<void>}
         */
        async render(refresh = false) {
        }

        setEventBind() {
        }

        getCols(sheet = false) {
            let that = this;
            if (!that.isSetCols()) return {};
            let cols = that.importObj.rawArgs.cols;
            return sheet === false ? cols : (cols.hasOwnProperty(sheet) ? cols[sheet] : {});
        }

        getCurrUploadFile() {
            return this.importObj.stepMap.one.uploadFile;
        }

        // 获取选中的上传数据
        getCheckedImportItems() {
            return this.importObj.stepMap.two.getCheckedImportItems();
        }

    }

    exports('ImportStep', ImportStep);
});