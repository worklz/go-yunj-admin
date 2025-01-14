/**
 * 下拉按钮组
 * ydropdown
 */
layui.define(['jquery','yunj'], function (exports) {
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class YunjDropdown{

        constructor(){
            this.init();

            this.container_el=null;             // 容器元素
            this.control_el=null;               // 控制元素
            this.dropdown_container_el=null;    // 保存下拉元素的容器
        }

        init(){
            let that=this;
            //设置事件绑定
            that.set_event_bind();
        }

        // 设置元素
        set_el(control_el){
            let that=this;
            let containerEl=control_el.parent('.yunj-dropdown-group');
            that.container_el=containerEl;
            that.control_el=control_el;
            that.dropdown_container_el=containerEl.find('dl');
            return that;
        }

        // 是否展开
        is_open(){
            let that=this;
            return that.control_el.hasClass('btn-group-retract');
        }

        // 设置事件绑定
        set_event_bind(){
            let that=this;

            $(win).resize(function () {
                that.retract();
            });

            $(doc).scroll(function () {
                that.retract();
            });

            $(doc).click(function (e) {
                if ($(e.target).parents(".yunj-dropdown-group").length === 0) {
                    that.retract();
                }
            });

            $(doc).on('click','.yunj-dropdown-group>button.btn-group-control',function (e) {
                that.set_el($(this)).is_open()?that.retract():that.retract().open();
                e.stopPropagation();
            });

        }

        // 展开
        open(){
            let that=this;
            that.control_el.removeClass('btn-group-open').addClass('btn-group-retract');
            let controlEl=that.control_el;
            let containerEl=that.container_el;
            let dropdownContainerEl=that.dropdown_container_el;

            let x=containerEl.offset().left;
            let y=containerEl.offset().top;
            let w=$(doc).width();
            let scrollH=$(doc).scrollTop();
            let controlElW=controlEl.outerWidth();
            let controlElH=controlEl.outerHeight();
            let inc=5;
            let top=parseInt(y+controlElH-scrollH+inc);
            let left=parseInt(x);
            let right=parseInt(w-x-controlElW);

            dropdownContainerEl.css({
                'top':`${top}px`,
                'left':left<right?`${left}px`:'auto',
                'right':left>right?`${right}px`:'auto',
                'text-align':left<right?'left':'right',
            });
            dropdownContainerEl.slideToggle("fast");
            return that;
        };

        // 收起
        retract(){
            let that=this;
            $(doc).find('.yunj-dropdown-group>button.btn-group-control').removeClass('btn-group-retract').addClass('btn-group-open');
            $(doc).find('.yunj-dropdown-group>dl').hide();
            return that;
        }

        // 布局结构
        layout(dd){
            let that=this;
            return `<div class="yunj-dropdown-group">
                            <button type="button" class="layui-btn layui-btn-xs layui-btn-primary layui-icon btn-group-control btn-group-open">操作</button>
                            <dl>${dd}</dl>
                        </div>`;
        }

    }

    if(!yunj.hasOwnProperty('dropdown')){
        yunj.dropdown = new YunjDropdown();
    }

    exports('ydropdown', yunj.dropdown);
});