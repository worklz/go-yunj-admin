/**
 * FormFieldFile
 */
layui.define(['FormField', 'yunj', 'upload'], function (exports) {

    let FormField = layui.FormField;
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let upload = layui.upload;

    class FormFieldFile extends FormField {

        constructor(options = {}) {
            super(options);
            // 预览容器
            this.previewBoxEl = null;
            // 选中的文件
            this.chooseFiles = {};
            // 触发上传的元素选择器
            this.triggerUploadSelector = `#${this.id} .upload-trigger`;
            // Sortable排序对象
            this.sortable = null;


            // 上传操作元素标识
            this.uploadActionFilter = `#${this.id} .files-upload-box .upload-action-elem`;
            // 文件预览容器dom元素对象
            this.filesPreviewBoxEl = null;
            // 上传文件
            this.uploadFiles = {};
            // 上传进度的数据
            this.uploadProgressData = {};
            // 上传进度的定时器
            this.uploadProgressTimer = {};
        }

        defineExtraArgs() {
            let that = this;
            return {
                multi: false,
                size: yunj.config("file.upload_file_size"),
                ext: yunj.config("file.upload_file_ext"),
                text: "文件上传"
            };
        }

        handleArgs(args) {
            // verify
            if (this.isMulti(args.multi)) {
                if (args.verify.indexOf("urls") === -1)
                    args.verify += (args.verify ? "|" : "") + "urls";
            } else {
                if (args.verify.indexOf("url") === -1)
                    args.verify += (args.verify ? "|" : "") + "url";
            }
            return args;
        }

        layoutControl() {
            let that = this;
            let controlHtml = `<div class="file-box ${that.isMulti() ? 'multi' : ''}">
                                    <div class="preview-box"></div>
                                    <div class="select-box ${that.isReadonly() ? 'readonly' : ''}" title="${that.isReadonly() ? '禁用' : '选择文件上传'}">
                                        <i class="layui-icon layui-icon-upload upload-icon"></i>
                                        <span>${that.args.text}</span>
                                        <span class="limit-count-desc"></span>
                                    </div>
                                    <i class="upload-trigger"></i>
                                </div>`;
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        // 设置字段简介内容
        descContent() {
            let that = this;
            let desc = that.args.desc;
            if (!desc) {
                desc = `允许上传大小不超过 ${that.args.size}MB 且格式为 ${that.args.ext.replace(/,/g,'/')} 的文件。`;
                if (that.isMulti()) {
                    desc += `允许最大上传数 ${that.getMultiLimitCount()}。`
                }
            }
            return desc;
        }

        // 渲染后执行
        async renderDone() {
            let that = this;
            that.previewBoxEl = that.boxEl.find('.preview-box');

            // 拖拽排序事件
            if (that.isMulti() && !that.isReadonly()) {
                await yunj.includeJs('/static/yunj/libs/Sortable/Sortable.min.js');
                // 监听表格内拖拽排序事件
                let dragSortEventBindKey = `${that.id}_event_bind_sort`;
                if (yunj.isUndefined(win[dragSortEventBindKey])) {
                    win[dragSortEventBindKey] = true;
                    let sortableConfig = {
                        handle: `.preview-box>.item`,
                        animation: 150,
                        ghostClass: 'sort-checked',
                    };
                    that.sortable = new Sortable(doc.querySelector(`#${that.id} .preview-box`), sortableConfig);
                }
            }
            return 'done';
        }

        setValue(val = '') {
            let that = this;

            let urlArr = val;
            if (yunj.isString(urlArr) && urlArr.length > 0)
                urlArr = yunj.isJson(urlArr) ? JSON.parse(urlArr) : (urlArr.indexOf(",") !== -1 ? urlArr.split(",") : [urlArr]);
            if (!yunj.isArray(urlArr)) urlArr = [];

            that.previewBoxEl.hide();

            that.getPreviewItemHtml(urlArr).then((html) => {
                that.setPreviewBoxHtml(html);
                // 选择框是否显示
                let selectBoxDisplay = html.length > 0 && that.isReadonly() ? 'none' : 'flex';
                that.boxEl.find('.select-box').css('display', selectBoxDisplay);
            });
        }

        getValue() {
            let that = this;

            let urlArr = [];
            that.previewBoxEl.find('.item').each(function () {
                let itemDownloadEl = $(this).find('.item-download');
                if (itemDownloadEl.length <= 0) {
                    return true;
                }
                let url = itemDownloadEl.data('url');
                if (!url || !yunj.isString(url) || url.length > 2000) {
                    return true;
                }
                urlArr.push(yunj.urlAppendDomain(url));
            });
            return urlArr.length > 0 ? (that.isMulti() ? urlArr : urlArr[0]) : "";
        }

        // 设置多图上传的限制图片数量描述
        setMultiLimitCountDesc() {
            let that = this;
            if (!that.isMulti()) {
                return;
            }
            let desc = that.previewBoxEl.children('.item').length + '/' + that.getMultiLimitCount();
            that.boxEl.find('.select-box .limit-count-desc').html(desc).show();
        }

        // 设置预览的html
        setPreviewBoxHtml(html) {
            let that = this;
            that.previewBoxEl.html(html).show();
            that.setMultiLimitCountDesc();
        }

        // 追加预览的html
        appendPreviewBoxHtml(html) {
            let that = this;
            that.previewBoxEl.append(html).show();
            that.setMultiLimitCountDesc();
        }

        /**
         * 获取预览的html
         * @param files  可以是src数组，也可以是选择图片的预览只
         * @return {Promise<string>}
         */
        async getPreviewItemHtml(files) {
            let that = this;
            let content = '';
            for (let i = 0, l = files.length; i < l; i++) {
                let file = files[i];
                let url, name, index;
                if (yunj.isObj(file)) {
                    // 上传预览
                    name = file.name;
                    index = file.index;
                    content += `<div class="item" data-index="${index}">
                                    <input type="text" class="layui-input item-input" value="${name}" placeholder="文件名称" readonly>
                                    <span class="item-action-box">
                                        <i class="item-action item-upload-progress">0%</i>
                                        <i class="layui-icon layui-icon-close item-action item-upload-cancel" title="取消"></i>
                                    </span>
                                </div>`;
                } else {
                    // 值设置
                    url = file;
                    name = yunj.urlFileName(url);
                    let actionHtml = `<i class="layui-icon layui-icon-download-circle item-action item-download" title="下载:${name}" data-url="${url}"></i>`;
                    if (!that.isReadonly()) {
                        actionHtml += `<i class="layui-icon layui-icon-delete item-action item-delete" title="删除"></i>`;
                    }
                    content += `<div class="item">
                                    <input type="text" class="layui-input item-input" readonly value="${name}">
                                    <span class="item-action-box">${actionHtml}</span>
                                </div>`;
                }
            }
            return content;
        }

        // 设置上传前的选择文件预览
        async setChooseFilesPreview() {
            let that = this;
            let files = [];
            for (let index in that.chooseFiles) {
                if (!that.chooseFiles.hasOwnProperty(index)) continue;
                let file = that.chooseFiles[index];

                files.push({
                    index: index,
                    name: file.name,
                });
            }
            let previewHtml = await that.getPreviewItemHtml(files);
            that.isMulti() ? that.appendPreviewBoxHtml(previewHtml) : that.setPreviewBoxHtml(previewHtml);

            for (let index in that.chooseFiles) {
                if (!that.chooseFiles.hasOwnProperty(index)) continue;
                that.setChooseFileUploadStart(index);
            }
        }

        // 设置选择文件上传进度
        setChooseFileUploadProgress(index, args = {}) {
            let that = this;
            let defArgs = {
                elem: null,
                rate_num: 0
            };
            args = yunj.objSupp(args, defArgs);
            let chooseFile = that.chooseFiles[index] || null;
            if (!chooseFile) {
                return;
            }
            if (!chooseFile.hasOwnProperty('uploadProgress')) {
                chooseFile.uploadProgress = defArgs;
            }
            let uploadProgress = chooseFile.uploadProgress;

            uploadProgress.elem = uploadProgress.elem || that.previewBoxEl.find(`.item[data-index=${index}]`);
            uploadProgress.rate_num = args.rate_num;
            let percent = args.rate_num + '%';
            uploadProgress.elem.find('.item-upload-progress').html(percent);
        }

        // 设置选择文件上传开始
        setChooseFileUploadStart(index) {
            let that = this;

            that.setChooseFileUploadProgress(index, {
                rate_num: 0,
            });
            let uploadProgress = that.chooseFiles[index].uploadProgress;
            uploadProgress.timer = setInterval(function () {
                let rateNum = uploadProgress.rate_num;
                rateNum = rateNum + Math.random() * 10 | 0;
                rateNum = rateNum > 99 ? 99 : rateNum;

                that.setChooseFileUploadProgress(index, {
                    rate_num: rateNum,
                });
            }, 300 + Math.random() * 1000);
        }

        // 设置选择图片上传结束
        setChooseFileUploadEnd(index, data) {
            let that = this;

            let chooseFile = that.chooseFiles[index] || null;
            if (!chooseFile) {
                return;
            }
            // 删除定时器，防止还在跑进度
            let uploadProgress = that.chooseFiles[index].uploadProgress;
            uploadProgress.timer && clearInterval(uploadProgress.timer);
            // 设置100%进度
            that.setChooseFileUploadProgress(index, {
                rate_num: 100,
            });

            setTimeout(function () {
                let url = data;
                let name = yunj.urlFileName(url);
                uploadProgress.elem.find('.item-input').val(name);
                let actionBoxContent = `<i class="layui-icon layui-icon-download-circle item-action item-download" title="下载:${name}" data-url="${url}"></i>
                                  <i class="layui-icon layui-icon-delete item-action item-delete" title="删除"></i>`;
                uploadProgress.elem.find('.item-action-box').html(actionBoxContent);
                that.deleteChooseFileUploadData(index);
            }, 1000);
        }

        // 设置选择图片上传错误
        setChooseFileUploadError(index, tips = '') {
            let that = this;
            let chooseFile = that.chooseFiles[index] || null;
            if (!chooseFile) {
                return;
            }
            let uploadProgress = chooseFile.uploadProgress;


            let filename = uploadProgress.elem.find('.item-input').val();
            let error = `文件：${filename} 上传异常！${tips}`;
            let actionBoxContent = `<i class="layui-icon layui-icon-speaker item-action item-tips" title="${error}"></i>
                                  <i class="layui-icon layui-icon-delete item-action item-delete" title="删除"></i>`;
            uploadProgress.elem.find('.item-action-box').html(actionBoxContent);
            that.deleteChooseFileUploadData(index);
        }

        // 删除选择文件的上传数据
        deleteChooseFileUploadData(index) {
            let that = this;
            let chooseFile = that.chooseFiles[index] || null;
            if (!chooseFile) {
                return;
            }
            // 有上传进度的
            let uploadProgress = chooseFile.uploadProgress || null;
            if (uploadProgress) {
                // 删除定时器
                uploadProgress.timer && clearInterval(uploadProgress.timer);
            }
            delete that.chooseFiles[index];
        }

        // layui的上传渲染
        layuiUploadRender() {
            let that = this;

            let args = {
                elem: `#${that.id} .select-box`,
                url: yunj.fileUploadUrl('nameUnchanged'),
                accept: 'file',
                exts: that.args.ext.replace(/,/g, '|'),
                auto: false,
                bindAction: that.triggerUploadSelector,
                field: 'file',
                size: that.args.size * 1024,
                multiple: that.isMulti(),
                drag: false,
                choose: function (obj) {
                    if (!yunj.isEmptyObj(that.chooseFiles)) {
                        yunj.msg('待上传完成后，执行此操作');
                        return false;
                    }

                    that.chooseFiles = obj.pushFile();

                    // 多图上传判断是否超过限制数量
                    if (that.isMulti()) {
                        let count = (that.previewBoxEl.find('.item').length | 0) + (Object.keys(that.chooseFiles).length | 0);
                        let limitCount = that.getMultiLimitCount();
                        if (count > limitCount) {
                            yunj.msg(`限制最大上传数 ${limitCount}`);
                            for (let idx in that.chooseFiles) {
                                if (!that.chooseFiles.hasOwnProperty(idx)) continue;
                                delete that.chooseFiles[idx];
                            }
                            return false;
                        }
                    }
                    // 设置预览文件，并触发上传
                    that.setChooseFilesPreview().then(res => {
                        $(that.triggerUploadSelector).click();
                    });
                },
                done: function (res, index, upload) {
                    if (res.errcode !== 0) {
                        that.setChooseFileUploadError(index, res.msg);
                        return false;
                    }
                    that.setChooseFileUploadEnd(index, res.data);
                }
            };
            upload.render(args);
        }

        defineExtraEventBind() {
            let that = this;

            if (that.isReadonly()) {
                that.boxEl.on('click', '.select-box', function (e) {
                    yunj.msg(`只读模式，禁止操作`);
                    e.stopPropagation();
                });
            } else {
                // 上传
                that.layuiUploadRender();

                // 删除/取消
                that.boxEl.on('click', '.preview-box .item-delete,.item-upload-cancel', function (e) {
                    let itemEl = $(this).parents('.item');
                    let index = itemEl.data('index');
                    that.deleteChooseFileUploadData(index);
                    itemEl.remove();
                    that.setMultiLimitCountDesc();
                    e.stopPropagation();
                });

                // 提醒
                that.boxEl.on('click', '.preview-box .item-tips', function (e) {
                    let tips = $(this).attr('title');
                    yunj.error(tips);
                    e.stopPropagation();
                });
            }

            // 下载
            that.boxEl.on('click', '.item-input', function (e) {
                let name = $(this).val();
                yunj.copy(name);
            });

            // 下载
            that.boxEl.on('click', '.preview-box .item-download', function (e) {
                let url = $(this).data('url');
                if (!url || !yunj.isString(url) || url.length > 2000) {
                    return;
                }
                yunj.download(url);
            });
        }

        // 是否多文件
        isMulti(multi = null) {
            let that = this;
            if (multi === null) {
                if (yunj.isUndefined(that._multi)) {
                    that._multi = that.args.multi === true || yunj.isPositiveInt(that.args.multi);
                }
                return that._multi;
            }
            return multi === true || yunj.isPositiveInt(multi);
        }

        // 获取多文件上传限制数量
        getMultiLimitCount() {
            let that = this;
            that._multiLimitCount = that._multiLimitCount || (yunj.isPositiveInt(this.args.multi) ? this.args.multi : 9);
            return that._multiLimitCount;
        }

    }

    exports('FormFieldFile', FormFieldFile);
});