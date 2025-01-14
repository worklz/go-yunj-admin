/**
 * YunjTheme
 */
layui.use(['jquery','cookie','yunj'], function () {
    let win = window;
    let $ = layui.jquery;
    let cookie = layui.cookie;

    class YunjTheme {

        constructor() {
            this.list = YUNJ_THEME;         // 主题列表
            
            this.tpl_id='theme_tpl';        // 模板容器ID

            this.code_key='theme_code';     // 当前主题code的cookie key

            this.curr_code='default';       // 当前主题code

            this.curr_theme=null;           // 当前主题

            this.init();
        }

        // 初始化
        init(){
            let that=this;
            that.setData();
            that.setThemeStylesheet();
            that.setThemeTplLayout();
        }

        // 设置
        set(code){
            let that=this;
            if(!code||!yunj.isString(code)||!that.list.hasOwnProperty(code)) return false;
            cookie.set(that.code_key,code);
            that.init();
        }

        // 设置数据
        setData(){
            let that = this;
            that.curr_code=cookie.get(that.code_key)||'default';
            that.curr_theme=that.list[that.curr_code];
        }

        // 设置当前主题的层叠样式表
        setThemeStylesheet(){
            let that = this;
            // 父页面加载
            that.setThemeStylesheetLink();
            // 子页面全部加载
            $('iframe').each(function (idx,e) {
                that.setThemeStylesheetLink(idx);
            });
        }

        // 设置当前主题的层叠样式表链接
        setThemeStylesheetLink(iframe_idx=null){
            let that=this;
            let headEl=iframe_idx===null?$('head'):$('iframe').eq(iframe_idx).contents().find('head');
            let href=that.curr_theme.style_file;
            // 判断css link是否存在
            let hasExistThemeLink=headEl.find('link[theme]').length;
            if(!hasExistThemeLink){
                headEl.append("<link>");
                headEl.find('link:last').attr({
                    rel: "stylesheet",
                    type: "text/css",
                    href: href,
                    theme: true
                });
            }else {
                let themeLinkEl=headEl.find('link[theme]');
                themeLinkEl.attr('href',href);
            }
            return true;
        }

        // 设置主题模板布局
        setThemeTplLayout(){
            if(yunj.isExistParent()) return false;
            let that = this;
            let hasExistTpl=$(`#${that.tpl_id}`).length;
            if(!hasExistTpl){
                let tplHtml='';
                for(let code in that.list){
                    if(!that.list.hasOwnProperty(code)) continue;
                    let theme=that.list[code];
                    yunj.includeCss(theme.tpl_style_file);
                    tplHtml+=`<li class="${code}" data-code="${code}" title="${theme.title}">
                                <div class="t"></div>
                                <div class="l">
                                    <div class="item"></div>
                                    <div class="item"></div>
                                </div>
                              </li>`;
                }
                tplHtml=`<script type="text/html" id="${that.tpl_id}"><ul class="theme-box">${tplHtml}</ul></script>`;
                $('body').append(tplHtml);
            }
        }

        // 设置主题模板选中
        setThemeTplActive(){
            let that = this;
            let tplEl=$('.theme-box');
            tplEl.find('li').removeClass('active');
            tplEl.find(`li.${that.curr_code}`).eq(0).addClass('active');
        }

    }

    win.yunj.theme=new YunjTheme();
});