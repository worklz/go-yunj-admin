/**
 * FormBuildButton
 */
layui.define(['jquery', 'yunj', "FormBuild", "button", "validate"], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let FormBuild = layui.FormBuild;
    let button = layui.button;
    let validate = layui.validate;

    class FormBuildButton extends FormBuild {

        constructor(form) {
            super(form, "button");
        }

        // 初始化build box el
        _initBuildBoxEl() {

            let that = this;
            let headerContentEl = that.formBoxEl.find(".yunj-form-header .content");
            headerContentEl.append(`<div class="btn-box"></div>`);
            that.buildBoxEl = headerContentEl.find(".btn-box");
        }

        // 渲染
        async render() {
            let that = this;
            let btnHtml = that.buildBoxEl.html();
            if (btnHtml.length > 0) return;
            that.buildBoxEl.html('');
            let ddHtml = '';
            let isMobile = yunj.isMobile();
            let btns = that.buildArgs;
            for (let key in btns) {
                if (!btns.hasOwnProperty(key)) continue;
                let args = btns[key];
                args.formId = that.formId;
                let _ddHtml = '';
                if (isMobile && args.mobileDropDown) {
                    // 下拉显示
                    _ddHtml = button(key, args).layout(true);
                }
                if (_ddHtml) {
                    ddHtml += _ddHtml;
                } else {
                    // 独立显示
                    button(key, args).render(`.yunj-form-box[lay-filter=${that.formId}] .yunj-form-header .btn-box`);
                }
            }
            if (ddHtml.length > 0) {
                await new Promise(resolve => {
                    layui.use('ydropdown', () => {
                        that.buildBoxEl.append(yunj.dropdown.layout(ddHtml));
                        resolve();
                    });
                });
            }
        }

        // 数据提交
        _submit() {
            let that = this;
            let formData = yunj.formData(that.formId, validate);
            if (yunj.isEmptyObj(formData)) return;
            let requestData = {
                [yunj.config('builder.id_key')]: that.formId,
                [yunj.config('builder.async_type_key')]: 'submit',
                data: JSON.stringify(formData),
            };

            yunj.request({
                url: that.form.url,
                data: requestData,
                type: "post",
                loading: true
            }).then(res => {
                // 刷新来源表格或页面
                if (yunj.isObj(res.data) && res.data.hasOwnProperty('reload') && res.data.reload) {
                    let rawPageWin = yunj.rawPageWin();
                    if (rawPageWin) {
                        let rawTable = yunj.rawTable();
                        if (rawTable) {
                            rawTable.render();
                        } else {
                            rawPageWin.location.reload(true);
                        }
                    }
                }
                // 关闭弹出层
                if (that.form.isPopup) yunj.closeCurr();
            }).catch(e => {
                yunj.error(e);
            });

        }

        setEventBind() {
            let that = this;

            // 绑定窗口大小发生变化时触发
            $(doc).bind(`yunj_form_${that.formId}_win_resize`, function (e) {
                that.render();
            });

            if (that.buildArgs.hasOwnProperty("return")) {
                // 监听return点击
                that.buildBoxEl.on('click', '.yunj-btn-return', function () {
                    yunj.closeCurr();
                });
            }
            if (that.buildArgs.hasOwnProperty("reload")) {
                // 监听reload点击
                that.buildBoxEl.on('click', '.yunj-btn-reload', function () {
                    location.reload(true);
                });
            }

            if (that.buildArgs.hasOwnProperty("reset")) {
                // 监听reset点击
                that.buildBoxEl.on('click', '.yunj-btn-reset', function () {
                    $(doc).trigger(`yunj_form_${that.formId}_reset`);
                });
            }

            if (that.buildArgs.hasOwnProperty("clear")) {
                // 监听clear点击
                that.buildBoxEl.on('click', '.yunj-btn-clear', function () {
                    $(doc).trigger(`yunj_form_${that.formId}_clear`);
                });
            }

            if (that.buildArgs.hasOwnProperty("submit")) {
                // 监听submit点击
                that.buildBoxEl.on('click', '.yunj-btn-submit', function () {
                    that._submit();
                });
            }

        }

    }

    exports('FormBuildButton', FormBuildButton);
});