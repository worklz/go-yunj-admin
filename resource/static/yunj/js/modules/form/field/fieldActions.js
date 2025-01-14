/**
 * FormFieldActions
 */
layui.define(['jquery', 'yunj', 'elemProgress'], function (exports) {

    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let elemProgress = layui.elemProgress;

    class FormFieldAction {

        constructor(actionsObj, args = {}) {
            let fieldObj = actionsObj.fieldObj;
            this.fieldObj = fieldObj;
            this.fieldBoxEl = fieldObj.boxEl;
            this.fieldValueElSelector = actionsObj.fieldValueElSelector;
            this.fieldValueEl = actionsObj.fieldValueEl;
            this.actionsObj = actionsObj;
            this.actionsEl = actionsObj.actionsEl;
        }

    }

    // 选择弹窗
    class FormFieldActionBySelectPopup extends FormFieldAction {

        constructor(actionsObj, args = {}) {
            super(actionsObj, args);

            // 所有的回调、闭包都要使用()=>{}箭头函数，会自动绑定this
            args = yunj.objSupp(args, {
                contentHtml: null,
                showAfter: null,    // 显示后回调
                hideAfter: null,    // 隐藏后回调
            });
            this.contentHtml = args.contentHtml;
            this.showAfter = args.showAfter;
            this.hideAfter = args.hideAfter;
            this.selectIconEl = null;
            this.selectPopupEl = null;
            this.selectContentEl = null;
            this.selectParentEl = null;

            if (!this.fieldObj.args.readonly && this.actionsEl.children('.select-icon').length <= 0) {
                this.init();
            }
        }

        init() {
            let that = this;
            // 初始化元素
            that.initElement();
            // 设置事件绑定
            that.setEventBind();
        }

        // 初始化元素
        initElement() {
            let that = this;
            that.actionsEl.append(`<i class="action-item layui-icon layui-icon-triangle-d select-icon"></i>`);
            that.fieldValueEl.after(`<div class="select-popup"><div class="content"></div></div>`);
            that.selectIconEl = that.actionsEl.children('.select-icon');
            that.selectPopupEl = that.fieldValueEl.siblings('.select-popup');
            that.selectContentEl = that.selectPopupEl.children('.content');
            that.selectParentEl = that.selectPopupEl.parent();
        }

        // 显示或隐藏选择弹窗
        setSelectPopupShowHide(isShow = null) {
            let that = this;
            let selectIconEl = that.selectIconEl;
            let selectPopupEl = that.selectPopupEl;
            let selectContentEl = that.selectContentEl;
            let selectParentEl = that.selectParentEl;

            // 显示或隐藏
            if (isShow === null) {
                isShow = !selectPopupEl.is(":visible");
            }
            if (isShow) {
                // 先隐藏全部选择弹窗，避免两个选择弹窗靠得太近，引发冲突
                $('.yunj-form-item .yunj-form-item-control .select-icon').removeClass('select-icon-up');
                $('.yunj-form-item .yunj-form-item-control .select-popup').hide();

                // 上下定位
                let winTop = selectParentEl.offset().top - $(win).scrollTop();              // 元素上边离可视化窗口边缘距离
                let winBottom = $(win).height() - winTop - selectParentEl.outerHeight();    // 元素下边离可视化窗口边缘距离，outerHeight为元素高度
                if (winTop > winBottom) {
                    // 元素上边，最大高度减去72，顶部有70高度的面包屑遮挡
                    selectPopupEl.css({'top': 'auto', 'bottom': '42px', 'max-height': (winTop - 72) + 'px'});
                } else {
                    selectPopupEl.css({'top': '42px', 'bottom': 'auto', 'max-height': winBottom + 'px'});
                }

                !selectIconEl.hasClass('select-icon-up') && selectIconEl.addClass('select-icon-up');
                selectPopupEl.show();
                if (yunj.isFunction(that.contentHtml)) {
                    // 进度0
                    let elemProgressObj = elemProgress({elem: selectContentEl});
                    let data = {
                        selectContentEl: selectContentEl,
                        isUp: winTop > winBottom,   // 是否在元素上边展示
                    };
                    that.contentHtml(data).then(contentHtml => {
                        yunj.isString(contentHtml) && selectContentEl.html(contentHtml);
                        // 进度100%
                        elemProgressObj.reset_progress(100);
                        that.showAfter && that.showAfter();
                    });
                } else {
                    selectContentEl.html(that.contentHtml);
                    that.showAfter && that.showAfter();
                }
            } else {
                selectIconEl.removeClass('select-icon-up');
                selectPopupEl.hide();
                yunj.isFunction(that.hideAfter) && that.hideAfter();
            }
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            // 绑定表单tab切换字段渲染完成后执行
            $(doc).bind(`yunj_form_${that.fieldObj.formId}_tab_change`, function (e) {
                that.selectParentEl.css('position', 'relative');
                that.selectPopupEl.css('minWidth', (that.selectParentEl.outerWidth() - 2) + 'px');
            });

            // 此处需要用field.boxEl绑定事件，其他引用此控件的也需要用field.boxEl绑定事件，不然可能会导致e.stopPropagation()阻止事件冒泡失效
            // 父元素点击，如果不是选择弹窗或子元素，则显示/隐藏选择弹窗
            that.fieldBoxEl.on('click', that.selectParentEl, function (e) {
                // 检查点击的目标元素是否为选择弹窗或子元素
                if (!$(e.target).closest(".select-popup").length) {
                    that.setSelectPopupShowHide();
                }
            });

            // 如果点击的目标不是选择弹窗父元素或子元素，则隐藏选择弹窗
            $(doc).on("click", function (e) {
                if (!$(e.target).closest(that.selectParentEl).length) {
                    that.setSelectPopupShowHide(false);
                }
            });
        }
    }

    // 内容明文查看
    class FormFieldActionByContentEye extends FormFieldAction {

        constructor(actionsObj, args = {}) {
            super(actionsObj, args);
            this.eyeEl = null;

            if (!this.fieldObj.args.readonly && this.fieldValueEl.attr('type') === 'password' && this.actionsEl.children('.content-eye').length <= 0) {
                this.init();
            }
        }

        init() {
            let that = this;
            // 初始化元素
            that.initElement();
            // 设置事件绑定
            that.setEventBind();
        }

        // 初始化元素
        initElement() {
            let that = this;
            that.actionsEl.append(`<i class="action-item layui-icon layui-icon-eye content-eye"></i>`);
            that.eyeEl = that.actionsEl.children('.content-eye');
        }

        // 设置内容清理元素显示隐藏
        setContentEyeShowHide(isShow) {
            let that = this;
            if (!that.eyeEl) return;
            if (isShow) {
                that.eyeEl.show();
            } else {
                that.eyeEl.hide();
            }
        }

        // 设置输入框type
        setInputType() {
            let that = this;
            if (that.fieldValueEl.attr('type') === 'password') {
                that.fieldValueEl.attr('type', 'text');
                that.eyeEl.removeClass('layui-icon-eye-invisible').addClass('layui-icon-eye');
            } else {
                that.fieldValueEl.attr('type', 'password');
                that.eyeEl.removeClass('layui-icon-eye').addClass('layui-icon-eye-invisible');
            }
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            let fieldObj = that.fieldObj;

            // 监听文本框输入事件
            that.fieldValueEl.on('input', function () {
                // 设置操作元素显示隐藏
                that.setContentEyeShowHide(!fieldObj.isEmptyValue());
            });

            // 设置输入框type
            that.eyeEl.on('click', function (e) {
                that.setInputType();
                e.stopPropagation();
            });
        }
    }

    // 内容清理
    class FormFieldActionByContentClear extends FormFieldAction {

        constructor(actionsObj, args = {}) {
            super(actionsObj, args);

            args = yunj.objSupp(args, {
                allowFocused: false
            });
            this.allowFocused = args.allowFocused || false;
            this.clearEl = null;
            this.isFocused = false;

            if (!this.fieldObj.args.readonly && this.actionsEl.children('.content-clear').length <= 0) {
                this.init();
            }
        }

        init() {
            let that = this;
            // 初始化元素
            that.initElement();
            // 设置事件绑定
            that.setEventBind();
        }

        // 初始化元素
        initElement() {
            let that = this;
            that.actionsEl.append(`<i class="action-item layui-icon layui-icon-clear content-clear"></i>`);
            that.clearEl = that.actionsEl.children('.content-clear');
        }

        // 设置内容清理元素显示隐藏
        setContentClearShow(isShow) {
            let that = this;
            if (isShow) {
                that.clearEl.show();
            } else {
                that.clearEl.hide();
            }
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            let fieldObj = that.fieldObj;

            // 监听文本框鼠标移入事件
            that.fieldBoxEl.on('mouseenter', that.fieldValueElSelector, function (e) {
                // 设置内容清理元素显示隐藏
                that.setContentClearShow(!fieldObj.isEmptyValue());
            });

            // 监听文本框鼠标移出事件
            that.fieldBoxEl.on('mouseleave', that.fieldValueElSelector, function (e) {
                // 设置内容清理元素隐藏
                that.setContentClearShow(that.isFocused && !fieldObj.isEmptyValue());
            });

            // 监听鼠标移入clear事件
            that.fieldBoxEl.on('mouseenter', '.content-clear', function (e) {
                that.setContentClearShow(true);
            });

            if (that.allowFocused) {
                // 监听文本框输入事件
                that.fieldBoxEl.on('input', that.fieldValueElSelector, function (e) {
                    // 设置内容清理元素显示隐藏
                    that.setContentClearShow(!fieldObj.isEmptyValue());
                });

                // 监听文本框获取焦点事件
                that.fieldBoxEl.on('focus', that.fieldValueElSelector, function () {
                    that.isFocused = true;
                    // 设置内容清理元素显示隐藏
                    that.setContentClearShow(!fieldObj.isEmptyValue());
                });

                // 监听文本框失去焦点事件
                that.fieldBoxEl.on('blur', that.fieldValueElSelector, function (e) {
                    that.isFocused = false;
                    // 设置内容清理元素隐藏
                    that.setContentClearShow(false);
                });
            }

            // 清理文本框内容
            that.clearEl.on('click', function (e) {
                e.stopPropagation();
                fieldObj.setValue();
                that.setContentClearShow(false);
            });
        }
    }

    // 字符数
    class FormFieldActionByCharNum extends FormFieldAction {

        constructor(actionsObj, args = {}) {
            super(actionsObj, args);

            this.charNumEl = null;
            this.limitMaxCharNum = 0;

            if (this.actionsEl.children('.char-num').length <= 0) {
                this.init();
            }
        }

        init() {
            let that = this;
            // 初始化元素
            that.initElement();
            // 初始化限制最大字符数
            that.initLimitMaxCharNum();
            // 设置事件绑定
            that.setEventBind();
        }

        // 初始化控件元素
        initElement() {
            let that = this;

            that.actionsEl.append(`<span class="action-item char-num"></span>`);
            that.charNumEl = that.actionsEl.children('.char-num');
        }

        // 初始化限制最大字符数
        initLimitMaxCharNum() {
            let that = this;
            let verify = that.fieldObj.args.verify;
            if (verify && verify.indexOf("max:") !== -1) {
                let verifyArr = verify.split("|");
                for (let i = 0; i < verifyArr.length; i++) {
                    let verifyItem = verifyArr[i];
                    if (verifyItem.indexOf("max:") === 0) {
                        that.limitMaxCharNum = parseInt(verifyItem.replace("max:", ""));
                        break;
                    }
                }
            }
        }

        // 设置当前字符数
        setCurrCharNum() {
            let that = this;
            let charNum = that.fieldObj.getValue().length;
            let content = charNum;
            let color = "#d2d2d2";
            if (that.limitMaxCharNum > 0) {
                content = `${charNum}/${that.limitMaxCharNum}`;
                if (charNum > that.limitMaxCharNum) {
                    color = "#ff5722";
                }
            }
            that.charNumEl.html(content).css("color", color).show();
            that.actionsEl.show();
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            // 监听输入事件
            that.fieldValueEl.on('input', function (e) {
                // 设置当前字符数
                that.setCurrCharNum();
            });
        }
    }

    class FormFieldActions {

        constructor(args = {}) {
            args = yunj.objSupp(args, {
                fieldObj: null,
                fieldValueElSelector: null,
                fieldValueElNoAutoIndent: false,    // 字段值展示容器宽度不自动缩进，如内容清理等图表展示时字段值展示容器不重新设置padding值
                actions: {}
            });
            let {fieldObj, fieldValueElSelector, fieldValueElNoAutoIndent} = args;
            let fieldValueEl = fieldObj.boxEl.find(fieldValueElSelector);

            this.args = args;
            this.fieldObj = fieldObj;
            this.fieldValueElSelector = fieldValueElSelector;
            this.fieldValueElNoAutoIndent = fieldValueElNoAutoIndent;
            this.fieldValueEl = fieldValueEl;
            this.actions = {};
            this.actionsEl = null;
            this.isCanSetAction = false;  // 是否可以设置操作

            // 定义操作项对应的class类
            this.ACTION_CLASS = {
                charNum: FormFieldActionByCharNum,
                contentClear: FormFieldActionByContentClear,
                contentEye: FormFieldActionByContentEye,
                selectPopup: FormFieldActionBySelectPopup,
            };

            if (yunj.isJQueryEl(fieldValueEl) && fieldValueEl.length > 0 && fieldValueEl.siblings('.field-actions').length <= 0) {
                this.init();
            }
        }

        init() {
            let that = this;
            that.initAttr();
            // 设置事件绑定
            that.setEventBind();
            // 设置配置的操作项
            that.setConfigActions();
        }

        initAttr() {
            let that = this;

            let actions = {};
            Object.entries(that.args.actions).forEach(([action, actionArgs]) => {
                actions[action] = {args: yunj.isObj(actionArgs) ? actionArgs : {}};
            });
            that.actions = actions;

            that.fieldValueEl.after(`<div class="field-actions"></div>`);
            that.actionsEl = that.fieldValueEl.siblings('.field-actions');
            that.fieldValueEl.parent().css('position', 'relative');
        }

        // 设置字段值元素的样式
        setFieldValueElStyle() {
            let that = this;
            let paddingRight = "10px";
            let actionsWidth = that.actionsEl.width();
            if (actionsWidth > 10 && !that.fieldValueElNoAutoIndent) {
                paddingRight = (Math.ceil(actionsWidth) + 1) + 'px';
            }
            that.fieldValueEl.css("padding-right", paddingRight);
        }

        // 设置配置的操作项
        setConfigActions() {
            let that = this;
            that.isCanSetAction = true;
            let actions = that.actions;
            for (let action in actions) {
                if (!actions.hasOwnProperty(action)) {
                    continue;
                }
                that.setAction(action, actions[action].args);
            }
        }

        setAction(action, args = {}) {
            let that = this;

            if (!that.isCanSetAction) {
                return that;
            }

            if (!(that.ACTION_CLASS[action] || null)) {
                throw new Error(`FormFieldActions未找到${action}操作类`);
            }
            args = args || {};
            that.actions[action].obj = new that.ACTION_CLASS[action](that, args);
            return that;
        }

        getActionObj(action) {
            let that = this;
            if (!that.actions.hasOwnProperty(action) || !(that.actions[action].obj || null)) {
                return null;
            }
            return that.actions[action].obj;
        }

        // 设置事件绑定
        setEventBind() {
            let that = this;

            // 绑定表单tab切换字段渲染完成后执行
            $(doc).bind(`yunj_form_${that.fieldObj.formId}_tab_change`, function (e) {
                that.setFieldValueElStyle();
            });

            // 创建一个观察器实例并传入回调函数检查尺寸是否变化
            let observer = new MutationObserver(function (mutationsList, observer) {
                that.setFieldValueElStyle();
            });
            // 开始观察目标节点
            observer.observe(that.actionsEl[0], {
                childList: true, // 观察子节点的增减
                attributes: true, // 观察属性的变化
                characterData: true, // 观察文本内容的变化
                subtree: true, // 应用于目标节点的所有后代节点
                attributeOldValue: true, // 记录属性变更前的值
                characterDataOldValue: true // 记录文本内容变更前的值
                // 注意：没有直接设置 attributeFilter，因为它需要特定的属性名数组
            });
        }

    }

    exports('FormFieldActions', FormFieldActions);
});