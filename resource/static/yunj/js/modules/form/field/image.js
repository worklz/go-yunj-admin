/**
 * FormFieldImage
 */
layui.define(['FormField', 'jquery', 'yunj', 'upload'], function (exports) {

    let FormField = layui.FormField;
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let upload = layui.upload;

    class FormFieldImage extends FormField {

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
        }

        defineExtraArgs() {
            let that = this;
            return {
                multi: false,
                size: yunj.config("file.upload_img_size"),
                ext: yunj.config("file.upload_img_ext"),
                text: "图片上传"
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
            let controlHtml = `<div class="image-box ${that.isMulti() ? 'multi' : ''}">
                                    <div class="preview-box">
                                        <div class="select-box ${that.isReadonly() ? 'readonly' : ''}" title="${that.isReadonly() ? '禁用' : '选择图片上传'}">
                                            <div><i class="layui-icon layui-icon-upload upload-icon"></i><span class="limit-count-desc"></span></div>
                                            <div>${that.args.text}</div>
                                        </div>
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
                desc = `允许上传大小不超过 ${that.args.size}MB 且格式为 ${that.args.ext.replace(/,/g,'/')} 的图片。`;
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
                        onStart: function (evt) {
                            // 序列化可排序的列表单元的data-id
                            that.sortDataIds = that.sortable.toArray();
                        },
                        onEnd: function (evt) {
                            // 通过自定义列表单元的data-id的数组对列表单元进行排序
                            that.sortable.sort(that.sortDataIds);
                        },
                    };
                    that.sortable = new Sortable(doc.querySelector(`#${that.id} .preview-box`), sortableConfig);
                }
            }
            return 'done';
        }

        setValue(val = '') {
            let that = this;

            let srcArr = val;
            if (yunj.isString(srcArr) && srcArr.length > 0)
                srcArr = yunj.isJson(srcArr) ? JSON.parse(srcArr) : (srcArr.indexOf(",") !== -1 ? srcArr.split(",") : [srcArr]);
            if (!yunj.isArray(srcArr)) srcArr = [];

            that.previewBoxEl.hide();

            that.getPreviewItemHtml(srcArr).then((html) => {
                that.setPreviewBoxHtml(html);
                // 图片选择框是否显示
                let selectBoxDisplay = html.length > 0 && that.isReadonly() ? 'none' : 'flex';
                that.boxEl.find('.select-box').css('display', selectBoxDisplay);
            });
        }

        getValue() {
            let that = this;
            let srcArr = [];
            that.previewBoxEl.find('.item img').each(function () {
                let src = $(this).attr('src');
                if (!src || !yunj.isString(src) || src.length > 2000) {
                    return true;
                }
                srcArr.push(yunj.urlAppendDomain(src));
            });
            return srcArr.length > 0 ? (that.isMulti() ? srcArr : srcArr[0]) : "";
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
            that.previewBoxEl.children('.item').remove();
            that.previewBoxEl.children('.select-box').before(html);
            that.previewBoxEl.css('display', 'flex');
            that.setMultiLimitCountDesc();
        }

        // 追加预览的html
        appendPreviewBoxHtml(html) {
            let that = this;
            that.previewBoxEl.children('.select-box').before(html);
            that.previewBoxEl.css('display', 'flex');
            that.setMultiLimitCountDesc();
        }

        /**
         * 获取预览的html
         * @param imgs  可以是src数组，也可以是选择图片的预览只
         * @return {Promise<string>}
         */
        async getPreviewItemHtml(imgs) {
            let that = this;
            let content = '';
            for (let i = 0, l = imgs.length; i < l; i++) {
                let img = imgs[i];
                let src = img;
                let index = null;
                if (yunj.isObj(img)) {
                    src = img.src;
                    index = img.index;
                }
                let imgStyle = await yunj.previewImgStyle(src, {width: 110, height: 110});
                let imgActionHtml = ''
                if (!that.isReadonly()) {
                    imgActionHtml = `<i class="layui-icon layui-icon-delete item-delete" title="删除"></i>`;
                }
                content += `<div class="item" ${index ? `data-index="${index}"` : ''}>
                                <img src="${src}" alt="" title="点击预览" ${yunj.defaultImageAttrOnerror()} ${imgStyle}>
                                ${imgActionHtml}
                            </div>`;
            }
            return content;
        }

        // 设置上传前的选择文件预览
        async setChooseFilesPreview() {
            let that = this;
            let imgs = [];
            for (let index in that.chooseFiles) {
                if (!that.chooseFiles.hasOwnProperty(index)) continue;
                await new Promise((resolve, reject) => {
                    let file = that.chooseFiles[index];
                    let reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        resolve({
                            index: index,
                            src: this.result,
                        });
                    }
                }).then(img => {
                    imgs.push(img);
                });
            }
            let previewHtml = await that.getPreviewItemHtml(imgs);
            that.isMulti() ? that.appendPreviewBoxHtml(previewHtml) : that.setPreviewBoxHtml(previewHtml);

            for (let index in that.chooseFiles) {
                if (!that.chooseFiles.hasOwnProperty(index)) continue;
                that.setChooseFileUploadStart(index);
            }
        }

        // 设置选择图片上传进度
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

            if (uploadProgress.elem.find('.layui-progress').length <= 0) {
                let progressHtml = `<div class="layui-progress layui-progress-big">
                                          <div class="layui-progress-bar" style="width:0%;">
                                            <span class="layui-progress-text">0%</span>
                                          </div>
                                      </div>`;
                uploadProgress.elem.append(progressHtml);
            }

            let percent = args.rate_num + '%';
            uploadProgress.elem.find('.layui-progress-bar').css({'width': percent});
            uploadProgress.elem.find('.layui-progress-text').html(percent);
        }

        // 设置选择图片上传开始
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
                uploadProgress.elem.find('img').attr('src', data.url);
                uploadProgress.elem.find('img').attr('alt', data.fileName);
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
            let html = `<div class="error-tips" title="${tips}">${tips}</div>`;
            uploadProgress.elem.append(html);
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
                // 隐藏进度条
                uploadProgress.elem.find('.layui-progress').hide();
            }
            delete that.chooseFiles[index];
        }

        // layui的上传渲染
        layuiUploadRender() {
            let that = this;

            let args = {
                elem: `#${that.id} .select-box`,
                url: yunj.fileUploadUrl(),
                accept: 'image',
                acceptMime: that.args.ext.split(',').map(item => {
                    return `image/${item}`;
                }).join(','),
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

                // 删除
                that.boxEl.on('click', '.preview-box .item-delete', function (e) {
                    let itemEl = $(this).parent('.item');
                    let index = itemEl.data('index');
                    that.deleteChooseFileUploadData(index);
                    itemEl.remove();
                    that.setMultiLimitCountDesc();
                    e.stopPropagation();
                });
            }

            // 预览
            that.boxEl.on('click', '.preview-box img', function (e) {
                let src = that.getValue();
                if (src.length <= 0) return false;
                let currSrc = $(this).attr('src');
                let idx = src.indexOf(currSrc);
                if (idx === -1) idx = 0;
                yunj.previewImg(src, idx);
            });
        }

        // 是否多图
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

        // 获取多图上传限制数量
        getMultiLimitCount() {
            let that = this;
            that._multiLimitCount = that._multiLimitCount || (yunj.isPositiveInt(this.args.multi) ? this.args.multi : 9);
            return that._multiLimitCount;
        }

    }

    exports('FormFieldImage', FormFieldImage);
});