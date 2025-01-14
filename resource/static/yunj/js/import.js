/**
 * 云静导入
 */
layui.use(['jquery', 'yunj', 'elemProgress'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let elemProgress = layui.elemProgress;

    class YunjImport {

        constructor(obj) {
            this.id = obj.id;           // 当前对象id

            this.rawEl = obj.elem;      // 原始元素

            this.rawArgs = obj.args;    // 原始数据

            this.boxEl = null;          // 顶部父元素
            this.btnBoxEl = null;       // 按钮容器
            this.stepBoxEl = null;      // 步骤容器
            this.contentBoxEl = null;   // 内容容器

            this.stepNames = ["one", "two", "three"];     // 步骤实例对象名数组，控制构件加载顺序
            this.stepMap = {};                            // 步骤实例对象map
            this.step = "";                               // 当前步骤

            this.defaultSheetName = "Sheet1";             // 默认工作表名称
            // 上传数据状态枚举
            this.DataStateEnum = {
                ERROR: {code: "error", tips: "数据错误"},
                WAIT: {code: "wait", tips: "等待导入"},
                IMPORTING: {code: "importing", tips: "正在导入"},
                SUCCESS: {code: "success", tips: "导入成功"},
                FAIL: {code: "fail", tips: "导入失败"},
            };

            this._init().catch(e => {
                console.log(e);
                yunj.error(e);
            });

        }

        // 初始化
        async _init() {
            let that = this;
            if (!that.id || !that.rawArgs || yunj.isEmptyObj(that.rawArgs)) throw new Error("导入构建器参数异常");
            await that._initData();
            // 进度0
            let elemProgressObj = elemProgress({elem: that.boxEl});
            // 设置当前步骤
            that.setCurrStep(that.stepNames[0]).then(res => {
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

        // 判断是否设置sheet
        isSetSheet() {
            return this.rawArgsIsSetAttr("sheet");
        }

        // 判断是否设置cols
        isSetCols() {
            return this.rawArgsIsSetAttr("cols");
        }

        // 判断是否设置templet
        isSetTemplet() {
            return this.rawArgsIsSetAttr("templet") && this.rawArgs.templet;
        }

        // 初始化数据
        async _initData() {
            let that = this;
            that._setBoxEl();
            // step
            for (let i = 0, l = that.stepNames.length; i < l; i++) {
                let stepUcfirst = that.stepNames[i].slice(0, 1).toUpperCase() + that.stepNames[i].slice(1);
                let layModule = `ImportStep${stepUcfirst}`;
                let step = await new Promise(resolve => {
                    layui.use(layModule, () => {
                        resolve(new layui[layModule](that));
                    });
                });
                that.stepMap[step.name] = step;
            }
        }

        // 设置基础结构
        _setBoxEl() {
            let that = this;

            let headFixed = false;

            let tipsHtml = "";
            that.rawArgs.tips.forEach((v, i) => tipsHtml += `<li>${i + 1}. ${v}</li>`);

            let layout = `<div class="yunj-import-box ${headFixed ? 'head-fixed' : ''}" id="yunj_import_${that.id}">
                            <div class="yunj-import-header">
                                <div class="yunj-import-btn-box">
                                    <button type="button" class="layui-btn layui-btn-sm layui-btn-primary btn-import-prev">上一步</button>
                                    <button type="button" class="layui-btn layui-btn-sm btn-import-next">下一步</button>
                                </div>
                                <div class="yunj-import-step-box"></div>
                            </div>
                            <div class="yunj-import-content-box"></div>
                        </div>`;
            that.rawEl.after(layout);
            that.boxEl = $(`#yunj_import_${that.id}`);
            that.btnBoxEl = that.boxEl.find(".yunj-import-btn-box");
            that.stepBoxEl = that.boxEl.find(".yunj-import-step-box");
            that.contentBoxEl = that.boxEl.find(".yunj-import-content-box");
        }

        /**
         * 设置当前步骤
         * @param step      步骤
         * @param refresh   是否刷新
         * @returns {Promise<void>}
         */
        async setCurrStep(step, refresh = false) {
            let that = this;
            that.step = step;

            // 渲染
            await that.stepMap[step].render(refresh);
            // 显示
            that.btnBoxEl.find('.layui-btn').removeClass('active');
            that.stepBoxEl.children('.item').removeClass('finish').removeClass('curr');
            that.contentBoxEl.find('.yunj-import-step-content').removeClass('active');

            if (step !== 'one') {
                that.btnBoxEl.find(".btn-import-prev").addClass('active');
            }
            if (step !== 'three') {
                that.btnBoxEl.find('.btn-import-next').addClass('active');
            }
            let currItemEl = that.stepBoxEl.children(`.item[data-step=${step}]`);
            currItemEl.prevAll('.item').addClass('finish');
            currItemEl.addClass('curr');
            that.contentBoxEl.find(`.yunj-import-step-content[data-step=${step}]`).addClass('active');
        }

        // 上传结束、终止
        importEnd() {
            this.stepMap.three.importEnd();
        }

        /**
         * 是否正在导入
         * @return {boolean}
         */
        isImporting() {
            this.stepMap.three.isImporting;
        }

        // 下一步，刷新
        next() {
            let that = this;
            let currStep = that.step;
            let currStepIdx = that.stepNames.indexOf(currStep);
            // 不存在或最后一步不能执行下一步
            if (currStepIdx === false || (currStepIdx + 1) >= that.stepNames) return;
            let nextStep = that.stepNames[currStepIdx + 1];
            that.setCurrStep(nextStep, true).catch(e => {
                console.log(e);
                yunj.error(e);
                that.prev();
            });
        }

        // 上一步，不刷新
        prev() {
            let that = this;
            let currStep = that.step;
            let currStepIdx = that.stepNames.indexOf(currStep);
            // 不存在或第一步不能执行上一步
            if (currStepIdx === false || currStepIdx <= 0) return;
            let exec = () => {
                let prevStep = that.stepNames[currStepIdx - 1];
                that.setCurrStep(prevStep).catch(e => {
                    console.log(e);
                });
            };
            // 不是第三步直接返回上一步
            if (currStep !== "three") {
                exec();
                return;
            }
            // 第三步，判断是否正在导入
            if (that.isImporting()) {
                yunj.confirm("正在进行数据导入，返回上一步将终止导入过程。是否继续", () => {
                    that.importEnd();
                    exec();
                });
            } else {
                exec();
            }
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            for (let i = 0, l = that.stepNames.length; i < l; i++) {
                that.stepMap[that.stepNames[i]].setEventBind();
            }

            that.btnBoxEl.on('click', '.btn-import-next', function () {
                that.next();
            });

            that.btnBoxEl.on('click', '.btn-import-prev', function () {
                that.prev();
            });

        }

    }

    $(doc).ready(function () {
        win.yunj.import = {};

        let importEls = $('import[type=yunj]');
        if (yunj.isUndefined(YUNJ_IMPORT) || !yunj.isObj(YUNJ_IMPORT) || importEls.length <= 0) return;

        yunj.includeCss(`/static/yunj/css/import.min.css?v=${YUNJ_VERSION}`).then(() => {
            yunj.includeXlsxStyle().then(() => {
                importEls.each(function () {
                    let id = $(this).attr('id');
                    if (!YUNJ_IMPORT.hasOwnProperty(id)) return true;
                    let args = YUNJ_IMPORT[id];
                    win.yunj.import[id] = new YunjImport({
                        id: id,
                        elem: $(this),
                        args: args
                    });
                });
            });
        });

    });

});