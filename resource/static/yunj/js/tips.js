/**
 * 云静提示
 */
layui.use(['jquery','yunj'],function (){
    let win=window;
    let doc=document;
    let $ = layui.jquery;

    class YunjTips{

        constructor(){
            this.version = '1.0.0';

            this.action_box_el=null;

            this.init();
        }

        init(){
            let that=this;
            that.set_data();
            that.set_event_bind();
        }

        // 设置数据
        set_data(){
            let that=this;
            let actionBoxEl=$('.tips-action');
            that.action_box_el=actionBoxEl;
        }

        // 事件绑定
        set_event_bind(){
            let that=this;

            that.action_box_el.on('click','a',function () {
                let action=$(this).data('action');
                if(action==='__LOGIN__'){
                    yunj.redirectLogin();
                    return;
                }

                if(yunj.isPopupPage()){
                    yunj.closeCurr();
                }else if(yunj.isTabPage()){
                    yunj.closeCurr();
                }else {
                    history.length <= 1?(location.href='/admin'):(location=document.referrer);
                }
            });
        }

    }

    $(doc).ready(function () {
        win.yunj.tips=new YunjTips();
    });

});