/**
 * elemProgress（元素进度条）
 */
layui.define(['jquery', 'yunj'], function (exports) {

    let $ = layui.jquery;

    class YunjElemProgress {

        constructor(args) {
            this.version = '1.0.0';

            this.raw_args = args;

            this.elem = null;                         // 对象元素

            this.rand_progress = true;              // 使用随机进度

            this.rand_progress_timer_rate = 1000;    // 进度定时器周期比率，rand_progress=true才有效

            this.rand_progress_timer = null;        // 进度定时器，rand_progress=true才有效

            this.progress_num = 0;                    // 实时进度

            this.progress_el = null;                  // 进度条元素

            this.init();
        }

        init() {
            let that = this;
            that.set_data();
            that.render();
        }

        set_data() {
            let that = this;
            that.elem = yunj.isString(that.raw_args.elem) ? $(that.raw_args.elem) : that.raw_args.elem;
            that.rand_progress = that.raw_args.rand_progress;
            that.rand_progress_timer_rate = that.raw_args.rand_progress_timer_rate;
        }

        render() {
            let that = this;
            if (that.elem.find('.yunj-elem-progress').length <= 0) {
                let progressHtml = `<div class="layui-progress yunj-elem-progress">
                                        <div class="layui-progress-bar yunj-elem-progress-bar" style="width:0%;"></div>
                                    </div>`;
                that.elem.prepend(progressHtml);
            }
            that.progress_el = that.elem.find('.yunj-elem-progress');
            that.rand_progress && that.set_rand_progress();
        }

        set_rand_progress() {
            let that = this;

            that.rand_progress_timer = setInterval(function () {
                let num = that.progress_num + Math.random() * 10 | 0;
                num = num > 99 ? 99 : num;
                that.reset_progress(num);
            }, 300 + Math.random() * that.rand_progress_timer_rate);
        }

        reset_progress(num) {
            let that = this;
            if (num >= 100) {
                that.rand_progress_timer && clearInterval(that.rand_progress_timer) && (that.rand_progress_timer = null);
                setTimeout(function () {
                    that.progress_el.remove();
                }, 1000);
            }
            that.progress_num = num;
            that.progress_el.find('.yunj-elem-progress-bar').css({'width': num + '%'});
        }

    }

    let elemProgress = (args) => {
        args = yunj.objSupp(args, {
            elem: null,
            rand_progress: true,
            rand_progress_timer_rate: 1000,
        });
        return new YunjElemProgress(args);
    };

    exports('elemProgress', elemProgress);
});