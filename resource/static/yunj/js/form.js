/**
 * 云静表单
 */
layui.use(['jquery', 'yunj', 'elemProgress'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let elemProgress = layui.elemProgress;

    class YunjForm {

        constructor(obj) {
            this.id = obj.id;                       // 当前对象id

            this.rawEl = obj.elem;                  // 原始元素

            this.rawArgs = obj.args;                // 原始数据

            this.url = null;                        // 请求地址

            this.urlParam = null;                   // url参数

            this.isPopup = false;                   // 是否弹出层

            this.boxEl = null;                      // 顶部父元素

            this.tabBoxEl = null;                   // 顶部父元素

            this.buildNames = [];                    // 当前构件实例对象名数组，控制构件加载顺序

            this.buildMap = {};                      // 当前构件实例对象map

            this._init().catch(e => {
                yunj.error(e);
            });
        }

        async _init() {
            let that = this;

            if (!that.id || !that.rawArgs || yunj.isEmptyObj(that.rawArgs)) throw new Error("表单构建器参数异常");
            // 初始化数据
            await that._initData();
            // 进度0
            let elemProgressObj = elemProgress({elem: that.boxEl});
            // 渲染
            that.render().then(res => {
                // 设置事件绑定
                that.setEventBind();
                // 手动触发tab change事件，适配表单多tab 模式下某些字段类型不能正常显示
                if (that.isSetTab()) $(doc).trigger(`yunj_form_${that.id}_tab_change`);
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
        isSetTab() {
            return this.rawArgsIsSetAttr("tab");
        }

        // 判断是否设置page
        isSetField() {
            return this.rawArgsIsSetAttr("field");
        }

        // 判断是否设置limit
        isSetButton() {
            return this.rawArgsIsSetAttr("button");
        }

        // 数据初始化
        async _initData() {
            let that = this;
            // url
            that.url = yunj.url(false);
            that.urlParam = yunj.urlParam(null, {});
            that.isPopup = that.urlParam.hasOwnProperty('isPopup') && that.urlParam.isPopup === 'yes';
            // boxEl
            that.rawEl.after(`<div class="yunj-form-box" lay-filter="${that.id}">
                                    <div class="yunj-form-header">
                                        <div class="partition"></div>
                                            <div class="content">
                                                <h2>${yunj.currPageTitle(that.isPopup)}</h2>
                                            </div>
                                    </div>
                                    <div class="layui-tab" lay-filter="${that.id}_tab"></div>
                                </div>`);
            that.boxEl = $(`.yunj-form-box[lay-filter=${that.id}]`);
            that.tabBoxEl = that.boxEl.find(`.layui-tab[lay-filter=${that.id}_tab]`);

            // build
            let buildArr = ["tab", "field", "button"];
            for (let i = 0, l = buildArr.length; i < l; i++) {
                let buildUcfirst = buildArr[i].slice(0, 1).toUpperCase() + buildArr[i].slice(1);
                if (!that[`isSet${buildUcfirst}`]()) continue;
                let layModule = `FormBuild${buildUcfirst}`;
                let build = await new Promise(resolve => {
                    layui.use(layModule, () => {
                        resolve(new layui[layModule](that));
                    });
                });
                that.buildNames.push(build.buildName);
                that.buildMap[build.buildName] = build;
            }
        }

        // 渲染
        async render() {
            let that = this;

            for (let i = 0, l = that.buildNames.length; i < l; i++) {
                await that.buildMap[that.buildNames[i]].render();
            }

            // 渲染完成事件触发
            $(doc).trigger(`yunj_form_${that.id}_render_done`, [that]);
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            for (let i = 0, l = that.buildNames.length; i < l; i++) {
                that.buildMap[that.buildNames[i]].setEventBind();
            }

            // 窗口大小发生变化时触发
            $(win).resize(function () {
                $(doc).trigger(`yunj_form_${that.id}_win_resize`);
            });

        }

        // 获取当前切换栏值
        getCurrTab() {
            return this.isSetTab() ? this.buildMap.tab.getValue() : undefined;
        }

        /**
         * 获取字段对象
         * @param {string} key   配置的字段key
         */
        getFieldObj(key) {
            let that = this;
            let id = yunj.generateFormFieldId(that.id, key);
            if (that.buildMap.hasOwnProperty('field')
                && that.buildMap.field.hasOwnProperty('fields')
                && that.buildMap.field.fields.hasOwnProperty(id)
            ) {
                return that.buildMap.field.fields[id];
            }
            return null;
        }

    }

    $(doc).ready(function () {
        win.yunj.form = {};

        let formEls = $('form[type=yunj]');
        if (yunj.isUndefined(YUNJ_FORM) || !yunj.isObj(YUNJ_FORM) || formEls.length <= 0) return;
        formEls.each(function () {
            let id = $(this).attr('id');
            if (!YUNJ_FORM.hasOwnProperty(id)) return true;
            let args = YUNJ_FORM[id];
            win.yunj.form[id] = new YunjForm({
                id: id,
                elem: $(this),
                args: args
            });
        });
    });

});