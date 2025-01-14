/**
 * 云静Admin子页面
 */
layui.use(['jquery', 'yunj'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class YunjIframe {

        constructor() {
            this.version = '1.0.0';

            this.init();
        }

        init() {
            let that = this;

            that.set_style();
            that.set_event_bind();
        }

        /**
         * 设置页面样式
         */
        set_style() {
            let that = this;

            let body = $('body');
            // 是否移动端
            let isMobile = yunj.isMobile();
            if (isMobile) {
                if (!(body.hasClass('yunj-mobile'))) body.addClass('yunj-mobile');
            } else {
                if (body.hasClass('yunj-mobile')) body.removeClass('yunj-mobile');
            }
            // 是否弹出层
            let isPopup = yunj.isPopupPage();
            if (isPopup) {
                if (!(body.hasClass('yunj-popup'))) body.addClass('yunj-popup');
            } else {
                if (body.hasClass('yunj-popup')) body.removeClass('yunj-popup');
            }
        }

        /**
         * 事件绑定
         */
        set_event_bind() {
            let that = this;
            //页面刷新
            $('.yunj-page-refresh').click(function () {
                location.reload();
            });
        };

    }

    win.yunj.iframe = new YunjIframe();
});