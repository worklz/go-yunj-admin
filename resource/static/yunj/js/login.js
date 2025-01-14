/**
 * 云静登录
 */
layui.use(['jquery', 'yunj', 'validate', 'form'], function () {
    let win = window;
    let doc = document;
    let $ = layui.jquery;
    let validate = layui.validate;
    let form = layui.form;

    class YunjTips {

        constructor() {
            this.rememberMeLocalStorageKey = 'admin_remember_me';
            this.usernameEl = null;
            this.passwordEl = null;
            this.captchaBoxEl = null;
            this.captchaCodeEl = null;
            this.captchaImgEl = null;
            this.rememberMeEl = null;
            this.btnSubmitEl = null;
            this.loadingTimer = null;
            this.init();
        }

        init() {
            let that = this;
            that.setData();
            that.setEventBind();
        }

        // 设置数据
        setData() {
            let that = this;
            that.usernameEl = $('#username');
            that.passwordEl = $('#password');
            that.captchaBoxEl = $('.captcha-box');
            that.captchaCodeEl = $('#captcha_code');
            that.captchaImgEl = $('#captcha_img');
            that.rememberMeEl = $('#remember_me');
            that.btnSubmitEl = $('#submit');
            // 初始化记住密码
            that.initRememberMe();
            // 初始化设置验证码
            that.setCaptchaCode(true);
        }

        login() {
            let that = this;
            let btnEl = that.btnSubmitEl;
            if (btnEl.prop('disabled')) return;
            that.setBtnSubmitStatus(true);
            that.getFormData().then(data => {
                yunj.request(btnEl.data('url'), {data: data}, 'post').then(res => {
                    that.setRememberMe();
                    location.href = res.data.url;
                }).catch(err => {
                    yunj.error(err);
                    that.setBtnSubmitStatus(false);
                });
            }).catch(err => {
                yunj.error(err);
                that.setBtnSubmitStatus(false);
            });
        }

        // 获取并验证表单数据
        getFormData() {
            let that = this;
            let usernameEl = that.usernameEl;
            let passwordEl = that.passwordEl;
            let captchaCodeEl = that.captchaCodeEl;
            let captchaImgEl = that.captchaImgEl;
            let data = {
                'username': usernameEl.val(),
                'password': passwordEl.val(),
                'captchaCode': captchaCodeEl.val(),
                'captchaHash': captchaImgEl.data('hash')
            };
            let dataTitle = {
                'username': '账户',
                'password': '密码',
                'captchaCode': '验证码',
                'captchaHash': '验证码'
            };
            let res = validate.rule({
                "username": "require|alphaDash|max:20",
                "password": "require|alphaDash",
                "captchaCode": "require|alphaNum|length:" + captchaCodeEl.attr('maxlength'),
                "captchaHash": "require|alphaNum",
            }).message({
                'username.alphaDash': '账户错误',
                'username.max': '账户错误',
                'password.alphaDash': '密码错误',
                'captchaCode.alphaNum': '验证码错误',
                'captchaCode.length': '验证码错误',
                'captchaHash.require': '验证码错误',
                'captchaHash.alphaNum': '验证码错误',
            }).check(data, dataTitle);

            return new Promise((resolve, reject) => {
                if (!res) {
                    reject(validate.getError());
                    return;
                }
                let key = yunj.randStr(16);
                let iv = yunj.randStr(16);
                yunj.aesEncrypt(JSON.stringify(data), key, iv).then(encrypt => {
                    let res = encodeURIComponent(JSON.stringify({data: encrypt, key: key, iv: iv}));
                    resolve(res);
                }).catch(err => {
                    reject('环境异常');
                });
            });
        }

        // 设置提交按钮状态
        setBtnSubmitStatus(isLogging = false) {
            let that = this;
            that.loadingTimer && clearInterval(that.loadingTimer) && (that.loadingTimer = null);
            if (isLogging) {
                let i = 0;
                that.loadingTimer = setInterval(() => {
                    that.btnSubmitEl.val('登录中' + '.'.repeat(i++ % 3 + 1));
                }, 300);
            } else {
                that.btnSubmitEl.val('登录');
            }
            that.btnSubmitEl.attr('disabled', isLogging);
        }

        // 初始化记住密码
        initRememberMe() {
            let that = this;
            let data = yunj.getLocalStorage(that.rememberMeLocalStorageKey);
            if (!data) {
                return;
            }
            that.usernameEl.val(data.username ? yunj.base64Decode(data.username) : '');
            that.passwordEl.val(data.password ? yunj.base64Decode(data.password) : '');
            that.rememberMeEl.prop("checked", data.rememberMe);
            form.render('checkbox');
        }

        // 设置记住密码
        setRememberMe() {
            let that = this;
            let rememberMe = that.rememberMeEl.prop("checked");
            if (!rememberMe) {
                yunj.clearLocalStorage(that.rememberMeLocalStorageKey);
                return;
            }
            let data = {
                username: yunj.base64Encode(that.usernameEl.val()),
                password: yunj.base64Encode(that.passwordEl.val()),
                rememberMe: true
            };
            yunj.setLocalStorage(that.rememberMeLocalStorageKey, data);
        }

        /**
         * 设置验证码
         * @param {boolean} isInit    是否初始化
         */
        setCaptchaCode(isInit = false) {
            let that = this;
            let boxEl = that.captchaBoxEl;
            if (!isInit && boxEl.hasClass('loading')) return;
            boxEl.addClass('loading');
            yunj.request(boxEl.data('url'), null, 'post').then(res => {
                that.captchaImgEl.attr('src', 'data:image/png;base64,' + res.data.content).data('hash', res.data.hash);
                boxEl.removeClass('loading');
            }).catch(err => {
                yunj.error(err);
                boxEl.removeClass('loading');
            });
        }

        // 事件绑定
        setEventBind() {
            let that = this;

            // 切换验证码
            that.captchaImgEl.on('click', function (e) {
                that.setCaptchaCode();
                e.stopPropagation();
            });

            // 登录
            that.btnSubmitEl.on('click', function (e) {
                that.login();
                e.stopPropagation();
            });

            // 登录
            $(doc).on("keyup", function (e) {
                if (e.keyCode === 13) {
                    // 判断是否有包含光标的input，光标处是否有值，是否有弹窗覆盖
                    let inputEl = $(doc).find('input:focus');
                    if (inputEl.length > 0 && yunj.trim(inputEl.val()) && $(doc).find('.layui-layer').length <= 0) {
                        that.login();
                    }
                }
                e.stopPropagation();
            });
        }

    }

    $(doc).ready(function () {
        win.yunj.tips = new YunjTips();
    });

});