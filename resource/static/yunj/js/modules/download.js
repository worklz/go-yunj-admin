/**
 * download（文件下载）
 */
layui.define(['yunj'], function (exports) {
    let win = window;
    let doc = document;

    class YunjDownload{

        constructor(args){
            this.name=args.name;        // 下载文件名称
            this.url=args.url;          // 下载地址
            this.blob=args.blob;        // 下载blob

            this.size=null;             // 文件大小，单位B

            this.loadProgress=null;    // 加载进度对象

            this.xhr=null;              // 文件数据请求对象
        }

        // 执行
        async exec(){
            let that=this;
            // 设置文件大小
            await that.setSize();
            // 请求文件
            await that.request();
        }

        // 设置文件大小
        setSize(){
            let that=this;
            return new Promise((resolve, reject)=>{
                if(that.blob){
                    that.size = that.blob.size;
                    resolve(true);
                    return;
                }

                let msgIdx=yunj.msg('文件连接中...',null,60*60*1000);
                let xhr = new XMLHttpRequest();
                xhr.open('HEAD', that.url, true);
                xhr.onreadystatechange = () => {
                    yunj.close(msgIdx);
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200||xhr.status === 0) {
                            that.size=xhr.getResponseHeader('Content-Length');
                            resolve(true);
                        } else {
                            yunj.msg('文件连接异常');
                            reject(false);
                        }
                    }
                };
                xhr.send();
            });
        }

        // 请求文件
        request(){
            let that=this;

            // 进度弹窗
            let size,sizeUnit;
            if(that.size<1048576){
                size=(that.size/1024).toFixed(1);
                sizeUnit="KB";
            }else {
                size=(that.size/(1024*1024)).toFixed(2);
                sizeUnit="MB";
            }
            let progressTimerRate=1000+(size>20?(Math.ceil((size-20)/30)*2000):0);
            let tipsPrefix=`文件:${that.name}<br>大小:${size+sizeUnit}`;

            yunj.loadProgress({
                tips:`${tipsPrefix}&nbsp;&nbsp;正在下载中...`,
                progress_timer_rate:progressTimerRate,
                done:(obj)=>{
                    obj.set_tips(`${tipsPrefix}&nbsp;&nbsp;正在导出中...`);
                },
                close:(obj)=>{
                    if(that.xhr) that.xhr.abort();
                }
            }).then(obj=>{
                that.loadProgress=obj;

                if(that.blob){
                    that.loadProgress.reset_progress(100);
                    that.save_blob(that.blob);
                    return;
                }

                // 发送请求
                that.xhr = new XMLHttpRequest();
                that.xhr.open('GET', that.url, true);
                that.xhr.responseType = 'blob';
                that.xhr.onload = function () {
                    if (that.xhr.status === 200){
                        that.loadProgress.reset_progress(100);
                        that.save_blob(that.xhr.response);
                    }
                };
                that.xhr.send();
            });
        }

        save_blob(blob){
            let that=this;

            if (win.navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, that.name);
                return true;
            }
            let url = window.URL.createObjectURL(blob);
            that.save_url(url);
        }

        save_url(url){
            let that = this;
            let link = doc.createElement('a');
            let body = doc.querySelector('body');
            link.href = url;
            link.download = that.name;

            // fix Firefox
            link.style.display = 'none';
            body.appendChild(link);
            link.click();
            body.removeChild(link);
            win.URL.revokeObjectURL(link.href);
        }

    }

    let download = (url,name = '')=>{
        let args = yunj.isObj(url)?url:{
            url:url,
            name:name
        };
        args = yunj.objSupp(args,{
            name:"",
            url:"",
            blob:null
        });
        let obj = new YunjDownload(args);
        obj.exec().then();
    };

    exports('download', download);
});