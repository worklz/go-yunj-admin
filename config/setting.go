package config

import "yunj/app/consts/def"

// 系统设置
var Setting map[string]any = map[string]any{
	"groups": []map[string]any{
		{
			"key":   "sys",
			"title": "系统设置",
			"icon":  "layui-icon-set",
			"form": map[string]any{
				"field_default": map[string]any{
					"title":             "云静Admin（go）",
					"keywords":          "云静Admin,后台,yunj,admin,go,golang",
					"description":       "云静Admin（go）",
					"favicon":           "/favicon.ico",
					"default_img":       def.IMG_URI,
					"upload_img_ext":    "ico,jpg,png,gif,jpeg",
					"upload_img_size":   1,
					"upload_file_ext":   "txt,pdf,xlsx,xls,csv",
					"upload_file_size":  5,
					"upload_media_ext":  "avi,mkv,mp3,mp4",
					"upload_media_size": 20,
					"qiniu_is_enable":   "off",
					"qiniu_access_key":  "",
					"qiniu_secret_key":  "",
					"qiniu_bucket":      "",
					"qiniu_domain":      "",
				},
			},
		},
	},
}
