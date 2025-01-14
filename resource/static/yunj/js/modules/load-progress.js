/**
 * 加载进度弹窗
 * loadProgress
 */
layui.define(['yunj'], function (exports) {

    class YunjLoadProgress{

        constructor(args){
            this.version = '1.0.0';     // 版本号

            this.raw_args=args;

            this.index = null;          // 弹窗索引

            this.elem = null;           // 弹窗的dom

            this.auto_close = true;     // 加载完成后是否自动关闭

            this.rand_progress = true;  // 使用随机进度

            this.rand_progress_timer_rate = 1000;    // 进度定时器周期比率，rand_progress=true才有效

            this.rand_progress_timer = null; // 进度定时器，rand_progress=true才有效

            this.progress_num = 0;      // 实时进度

            this.tips = '';             // 提示

            this.open_callback = null;  // 弹窗打开的回调

            this.done_callback = null;  // 加载完成的回调

            this.close_callback = null; // 弹窗关闭的回调

            this.init();
        }

        init(){
            let that=this;
            that.set_data();
            that.open();
            return that;
        }

        set_data(){
            let that=this;
            that.auto_close=that.raw_args.auto_close;
            that.tips=that.raw_args.tips;
            that.rand_progress=that.raw_args.rand_progress;
            that.rand_progress_timer_rate=that.raw_args.rand_progress_timer_rate;
            that.open_callback=that.raw_args.open;
            that.done_callback=that.raw_args.done;
            that.close_callback=that.raw_args.close;
        }

        open(){
            let that=this;

            let param={
                title: false,
                shade:0.2,
                btn: [],
                time: 60 * 60 * 1000,
                skin: 'yunj-load-progress',
                content: `<div class="load-box">
                              <div class="tips-box"></div>
                              <div class="progress-box">
                                <div class="layui-progress layui-progress-big">
                                  <div class="layui-progress-bar" style="width:0%;">
                                    <span class="layui-progress-text">0%</span>
                                  </div>
                                </div>
                              </div>
                          </div>`,
                success: function(layero, index){
                    that.elem=layero;
                    that.set_tips();
                    that.reset_progress(0);
                    that.rand_progress && that.set_rand_progress();
                    that.open_callback && that.open_callback();
                },
                end:function () {
                    that.rand_progress_timer &&  clearInterval(that.rand_progress_timer) && (that.rand_progress_timer = null);
                    that.close_callback && that.close_callback();
                }
            };

            that.index=top.layer.open(param);
        }

        set_tips(content=''){
            let that=this;
            content=content || that.tips;
            that.elem.find('.tips-box').html(content);
            that.tips=content;
        }

        set_rand_progress(){
            let that=this;

            that.rand_progress_timer=setInterval(function () {
                let num = that.progress_num + Math.random()*10|0;
                num = num>99?99:num;
                that.reset_progress(num);
            },300+Math.random()*that.rand_progress_timer_rate);
        }

        reset_progress(num){
            let that=this;
            if(num>=100){
                that.rand_progress_timer && clearInterval(that.rand_progress_timer) && (that.rand_progress_timer = null);
                that.done_callback&&that.done_callback(that);
                if(that.auto_close){
                    setTimeout(function () {
                        yunj.close(that.index);
                    },2000);
                }
            }
            that.progress_num = num;
            let percent=num+'%';
            that.elem.find('.progress-box .layui-progress-bar').css({'width':percent});
            that.elem.find('.progress-box .layui-progress-text').html(percent);
        }

    }

    let loadProgress = (args={})=>{
        args=yunj.objSupp(args,{
            auto_close:true,
            tips:'',
            rand_progress:true,
            rand_progress_timer_rate:1000,
            open:null,
            done:null,
            close:null,
        });
        return new YunjLoadProgress(args);
    };

    exports('loadProgress', loadProgress);
});