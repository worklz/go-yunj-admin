/**
 * FormFieldEditor
 */
layui.define(['FormField', 'yunj'], function (exports) {

    let FormField = layui.FormField;

    class FormFieldEditor extends FormField {

        constructor(options = {}) {
            super(options);
            this.mode = null;         // 富文本模式
            this.editor_id = null;    // 富文本容器id
            this.editor = null;       // 富文本对象
        }

        defineExtraArgs() {
            let that = this;
            return {
                mode: "ckeditor",
                modeConfig: {
                    ckeditor: {
                        toolbar: [
                            'Source', '-', 'Undo', 'Redo', '-', 'Preview', '-', 'SelectAll', '-', 'Bold', 'Italic', 'Underline', 'Strike', '-',
                            'NumberedList', 'BulletedList', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-',
                            'BidiLtr', 'BidiRtl', '-', 'Link', 'Image', 'CodeSnippet', '-', 'Styles', 'Format', 'Font', 'FontSize', '-',
                            'TextColor', 'BGColor', '-', 'Maximize'
                        ]
                    }
                }
            };
        }

        handleArgs(args) {
            let that = this;
            let mode = args.mode;
            let modeConfig = args.modeConfig;
            let defaultModeConfig = that.defineExtraArgs().modeConfig;
            if (!modeConfig.hasOwnProperty(mode)) {
                modeConfig[mode] = defaultModeConfig[mode];
                args.modeConfig = modeConfig;
                return args;
            }
            modeConfig[mode] = Object.assign({}, defaultModeConfig[mode], modeConfig[mode]);
            if (mode === "ckeditor") {
                // 若果是ckeditor，对toolbar取交集
                modeConfig[mode].toolbar = yunj.arrayIntersect(modeConfig[mode].toolbar, defaultModeConfig[mode].toolbar);
            }
            args.modeConfig = modeConfig;
            return args;
        }

        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-item-label-width-fill" id="${that.id}">__layout__</div>`;
        }

        layoutControl() {
            let that = this;
            return that[`layout_control_${that.mode}`]();
        }

        async renderBefore() {
            let that = this;
            that.mode = that.args.mode;
            that.editor_id = `${that.id}_editor_${that.mode}`;
            await that[`render_before_${that.mode}`]();
            return 'done';
        }

        renderDone() {
            let that = this;
            that[`render_done_${that.mode}`]();
        }

        setValue(val = '') {
            let that = this;
            that[`set_value_${that.mode}`](val);
        }

        getValue() {
            let that = this;
            return that[`get_value_${that.mode}`]();
        }

        layout_control_ckeditor() {
            let that = this;
            return `<div class="layui-input-inline yunj-form-item-control"><textarea id="${that.editor_id}"></textarea></div>`;
        }

        async render_before_ckeditor() {
            let that = this;
            await yunj.includeJs('/static/yunj/libs/ckeditor/ckeditor.js');
            return 'done';
        }

        render_done_ckeditor() {
            let that = this;
            CKEDITOR.replace(that.editor_id, {
                filebrowserUploadUrl: yunj.fileUploadUrl("ckeditor"),
                filebrowserImageUploadUrl: yunj.fileUploadUrl("ckeditor"),
                toolbar: [
                    {
                        name: 'init',
                        items: that.args.modeConfig.ckeditor.toolbar,
                    }
                ],
                readOnly: that.args.readonly
            });
            that.editor = CKEDITOR.instances[that.editor_id];
        }

        set_value_ckeditor(val = '') {
            let that = this;
            that.editor.setData(val);
        }

        get_value_ckeditor() {
            let that = this;
            return that.editor.getData();
        }

    }

    exports('FormFieldEditor', FormFieldEditor);
});