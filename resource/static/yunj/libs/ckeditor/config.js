/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
    // 语言
	config.language = 'zh-cn';

	// config.uiColor = '#AADC6E';

    // 额外的插件
    config.extraPlugins = 'codesnippet';

    // 上传地址
    config.filebrowserUploadUrl = yunj.fileUploadUrl("ckeditor");

    // 图片上传地址
    config.image_previewText=' ';
    config.filebrowserImageUploadUrl= yunj.fileUploadUrl("ckeditor");

    // 删除附件上传的 目标、高级 tab栏   图片上传的 连接、高级 tab栏
    config.removeDialogTabs = 'link:advanced;link:target;image:Link;image:advanced';

    // 折叠工具栏
    // config.toolbarCanCollapse = true;
};
