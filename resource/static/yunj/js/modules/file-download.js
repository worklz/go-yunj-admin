/**
 * 文件下载进度
 * fileDownloadProgress
 */
layui.define(['yunj'], function (exports) {

    class YunjFileDownload {

        constructor(args) {
            this.rawArgs = args;

            this.filename = '';

            this.time = null;

            this.id = '';

            this.fileDownloadItemsEl = null;

            this.elem = null;

            this.progressNum = 0;       // 实时进度

            this.init();
        }

        init() {
            let that = this;
            that.setData();
            that.setElem();
        }

        setData() {
            let that = this;
            that.filename = that.rawArgs.filename;
            that.time = that.rawArgs.time;
            that.id = yunj.md5(that.time + that.filename);
            that.fileDownloadItemsEl = top.yunj.page.fileDownloadEl.find('.items-box');
        }

        setElem() {
            let that = this;

            let html = `<div class="item" id="${that.id}">
                            <div class="top">
                                <div class="item-desc">
                                    <span class="time">${that.time}</span>
                                    <span class="name">${that.filename}</span>
                                </div>
                                <div class="item-action">
                                    <i class="yunj-icon yunj-icon-remove remove" title="取消"></i>
                                </div>
                            </div>
                            <div class="bottom">
                                <div class="layui-progress layui-progress-big" lay-showpercent="true" lay-filter="${that.id}">
                                    <div class="layui-progress-bar" lay-percent="0%"></div>
                                </div>
                            </div>
                        </div>`;
            that.fileDownloadItemsEl.append(html);
            that.elem = that.fileDownloadItemsEl.find(`#${that.id}`);
        }

        setProgress(num) {
            let that = this;
            if (num <= 0) {
                num = 0;
            }
            if (num >= 100) {
                num = 100;
            }
            that.progressNum = num;
            let percent = num + '%';
            top.layui.element.progress(that.id, percent);
        }
    }

    let fileDownloadProgress = (args = {}) => {
        args = yunj.objSupp(args, {
            filename: '',
            time: '',
        });
        return new YunjFileDownload(args);
    };

    exports('fileDownloadProgress', fileDownloadProgress);
});