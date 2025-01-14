/**
 * FormFieldMarkdown
 */
layui.define(['FormField', 'yunj', 'jquery'], function (exports) {

    let FormField = layui.FormField;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormFieldMarkdown extends FormField {

        constructor(options = {}) {
            super(options);
            this.mode = null;                   // 模式
            this.markdownContainerId = null;    // 容器id
            this.markdown = null;               // 对象
        }

        defineExtraArgs() {
            let that = this;
            return {
                mode: "cherry",
                modeConfig: {
                    cherry: {
                        toolbar: [
                            'undo', 'redo', '|',
                            'bold', 'italic', 'underline', 'strikethrough', 'color', 'size', '|',
                            'header', 'list', 'hr', 'panel', '|',
                            'image', 'link', 'code', 'table', '|', 'togglePreview',
                        ],
                        toolbarRight: ['export', 'theme', 'copy'],
                        mobileToolbar: [
                            'undo',
                            {bold: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'size']}, 'header',
                            {insert: ['list', 'hr', 'panel', 'image', 'link', 'code', 'table']}, 'togglePreview',
                        ],
                    },
                    editormd: {
                        height: 250,
                        watch: false,
                        placeholder: "此处开始编写...",
                        imageFormats: yunj.config("file.upload_img_ext").split(","),
                        // 全屏展开编辑有bug
                        toolbar: [
                            "undo", "redo", "|", "bold", "del", "italic", "quote", "|"
                            , "h1", "h2", "h3", "h4", "|", "list-ul", "list-ol", "hr", "|"
                            , "align-left", "align-center", "align-right", "align-justify", "|"
                            , "table", "datetime", "html-entities", "pagebreak", "code", "code-block", "|"
                            , "link", "reference-link", "image", "video", "|"
                            , "watch", "preview", /*"fullscreen",*/ "clear", "search", "|", "help"
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
            if (mode === "editormd") {
                // 若果是editormd，对toolbar取交集
                modeConfig[mode].toolbar = yunj.arrayIntersect(modeConfig[mode].toolbar, defaultModeConfig[mode].toolbar);
            }
            args.modeConfig = modeConfig;
            return args;
        }

        layoutControl() {
            let that = this;
            return that[`layout_control_${that.mode}`]();
        }

        async renderBefore() {
            let that = this;
            that.mode = that.args.mode;
            that.markdownContainerId = `${that.id}_markdown_${that.mode}`;
            await that[`render_before_${that.mode}`]();
            return 'done';
        }

        async renderDone() {
            let that = this;
            await that[`render_done_${that.mode}`]();
            return 'done';
        }

        setValue(val = '') {
            let that = this;
            that[`set_value_${that.mode}`](val);
        }

        getValue() {
            let that = this;
            return that[`get_value_${that.mode}`]();
        }

        layout_control_cherry() {
            let that = this;
            return `<div class="layui-input-inline yunj-form-item-control cherry"><div id="${that.markdownContainerId}" style="width: 100%;height:100%;box-sizing: border-box"></div></div>`;
        }

        async render_before_cherry() {
            let that = this;
            await yunj.includeCss('/static/yunj/libs/cherry-markdown/dist/cherry-markdown.min.css');
            await yunj.includeJs('/static/yunj/libs/cherry-markdown/dist/cherry-markdown.core.js');
            return 'done';
        }

        async render_done_cherry() {
            let that = this;
            let options = that.get_options_cherry();
            that.markdown = new Cherry(options);
            return 'done';
        }

        set_value_cherry(val = '') {
            let that = this;
            that.markdown.setValue(val,true);
        }

        get_value_cherry() {
            let that = this;
            return that.markdown.getMarkdown();
        }

        // 默认配置
        get_options_cherry() {
            let that = this;
            // 完整配置详见：https://github.com/Tencent/cherry-markdown/wiki/%E9%85%8D%E7%BD%AE%E9%A1%B9%E5%85%A8%E8%A7%A3
            let options = {
                id: that.markdownContainerId,
                nameSpace: 'cherry',
                themeSettings: {
                    // 目前应用的主题
                    mainTheme: 'light',
                    // 目前应用的代码块主题
                    codeBlockTheme: 'default',
                    // 工具栏主题
                    toolbarTheme: 'light',
                },
                editor: {
                    defaultModel: 'edit&preview',
                }
            };
            if (that.isReadonly()) {
                options.editor.defaultModel = 'previewOnly';
                return options;
            }
            // 工具栏
            options.toolbars = {
                // 选中文字时弹出的“悬浮工具栏”
                bubble: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'size'],
                // 光标出现在行首位置时出现的“提示工具栏”
                float: ['header', 'code'],
            };
            // 判断是否小屏幕（屏宽<=768px）设备：顶部工具栏、顶部右侧工具栏
            if (yunj.isSmallScreen()) {
                options.toolbars.toolbar = that.args.modeConfig.cherry.mobileToolbar
            } else {
                options.toolbars.toolbar = that.args.modeConfig.cherry.toolbar;
                options.toolbars.toolbarRight = that.args.modeConfig.cherry.toolbarRight;
            }
            // 回调方法
            options.callback = {
                // 文件上传
                fileUpload: function (file, callback) {
                    if (/image/i.test(file.type)) {
                        yunj.fileUpload(file).then(res => {
                            callback(res.data.url);
                        }).catch(err => {
                            yunj.error(err);
                        });
                    } else {
                        yunj.msg('当前仅支持图片上传');
                    }
                },
                // 多文件上传
                fileUploadMulti: function (files, callback) {
                    let promises = [];
                    for (let i = 0; i < files.length; i++) {
                        let file = files[i];
                        if (!(/image/i.test(file.type))) {
                            yunj.msg('当前仅支持图片上传');
                            return;
                        }
                        let promise = new Promise((resolve, reject) => {
                            yunj.fileUpload(file).then(res => {
                                resolve({url: res.data.url, params: {name: res.data.fileName,}});
                            }).catch(err => {
                                reject(err);
                            });
                        });
                        promises.push(promise);
                    }
                    Promise.all(promises).then(res => {
                        callback(res);
                    }).catch(err => {
                        yunj.error(err);
                    });
                }
            };
            return options;
        }

        layout_control_editormd() {
            let that = this;
            return `<div class="layui-input-inline yunj-form-item-control"><div id="${that.markdownContainerId}" style="width: auto;"><textarea></textarea></div></div>`;
        }

        async render_before_editormd() {
            let that = this;
            win.jQuery = $;
            win.$ = $;
            await yunj.includeCss('/static/yunj/libs/editor.md/css/editormd.min.css');
            await yunj.includeJs('/static/yunj/libs/editor.md/editormd.min.js');
            return 'done';
        }

        async render_done_editormd() {
            let that = this;
            await new Promise(resolve => {
                let options = that.get_options_editormd();
                options.onload = () => {
                    // 工具栏遮挡了输入的地方
                    // let toolbarHeight = that.boxEl.find('.editormd-toolbar').height();
                    // console.log(toolbarHeight, 123456);
                    // that.boxEl.find('.editormd').css({
                    //     paddingTop: toolbarHeight
                    // });
                    // $(doc).bind(`yunj_form_${that.formId}_render_done`, function (e,form) {
                    //     console.log(234234);
                    //     that.boxEl.find(`.editormd-toolbar .editormd-menu i[name="watch"]`).click();
                    //     that.boxEl.find(`.editormd-toolbar .editormd-menu i[name="watch"]`).click();
                    // });
                    // console.log(that.boxEl.find(`.editormd-toolbar .editormd-menu i[name="watch"]`),456);
                    resolve('done');
                }
                that.markdown = editormd(that.markdownContainerId, options);
            });
            return 'done';
        }

        set_value_editormd(val = '') {
            let that = this;
            that.markdown.setMarkdown(val);
        }

        get_value_editormd() {
            let that = this;
            return that.markdown.getMarkdown();
        }

        // 默认配置
        get_options_editormd() {
            let that = this;
            return {
                width: "auto",
                height: that.args.modeConfig.editormd.height,
                path: '/static/yunj/libs/editor.md/lib/',
                watch: that.args.modeConfig.editormd.watch,
                placeholder: that.args.modeConfig.editormd.placeholder,
                autoFocus: true,
                readOnly: that.isReadonly(),
                taskList: true,
                tex: true,
                flowChart: true,
                sequenceDiagram: true,
                syncScrolling: "single",
                htmlDecode: "style,script,iframe|filterXSS",
                imageUpload: true,
                imageFormats: that.args.modeConfig.editormd.imageFormats,
                imageUploadURL: yunj.fileUploadUrl("editormd"),
                toolbarIcons: () => {
                    return that.args.modeConfig.editormd.toolbar;
                },
                toolbarIconsClass: {
                    "align-left": "fa-align-left",
                    "align-center": "fa-align-center",
                    "align-right": "fa-align-right",
                    "align-justify": "fa-align-justify",
                    "video": "fa-file-video-o",
                },
                lang: {
                    toolbar: {
                        "align-left": "左对齐",
                        "align-center": "居中对齐",
                        "align-right": "右对齐",
                        "align-justify": "两端对齐",
                        "video": "插入视频",
                    }
                },
                toolbarHandlers: {
                    "align-left": (cm, icon, cursor, selection) => {
                        cm.replaceSelection(`<p align="left">${selection}</p>`);
                        selection === "" && cm.setCursor(cursor.line, cursor.ch + 1);
                    },
                    "align-center": (cm, icon, cursor, selection) => {
                        cm.replaceSelection(`<p align="center">${selection}</p>`);
                        selection === "" && cm.setCursor(cursor.line, cursor.ch + 1);
                    },
                    "align-right": (cm, icon, cursor, selection) => {
                        cm.replaceSelection(`<p align="right">${selection}</p>`);
                        selection === "" && cm.setCursor(cursor.line, cursor.ch + 1);
                    },
                    "align-justify": (cm, icon, cursor, selection) => {
                        cm.replaceSelection(`<p align="justify">${selection}</p>`);
                        selection === "" && cm.setCursor(cursor.line, cursor.ch + 1);
                    },
                    "video": (cm, icon, cursor, selection) => {
                        cm.replaceSelection(`\r\n<video src="http://xxxx.com/xxxx.mp4" style="width: 100%; height: 100%;" controls="controls"></video>\r\n`);
                        selection === "" && cm.setCursor(cursor.line, cursor.ch + 1);
                    },
                },
            };
        }

        // 重载editormd，适配表单多tab模式下editormd被影响后不能正常显示
        reloadEditormd() {
            let that = this;
            let options = that.get_options_editormd();
            options.markdown = that.getValue();
            that.markdown = editormd(that.markdownContainerId, options);
        }

        defineExtraEventBind() {
            let that = this;

        }

    }

    exports('FormFieldMarkdown', FormFieldMarkdown);
});