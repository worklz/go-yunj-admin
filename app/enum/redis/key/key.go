package key

import (
	"errors"
	"time"

	"yunj/pkg/util"
)

type RedisKeyConst string

// 定义redis key常量
const (

	// 测试
	TEST RedisKeyConst = "test:"

	// 文章正常已发布的数量
	ARTICLE_STATE_NORMAL_STATUS_PUBLISH_COUNT RedisKeyConst = "article.state:normal.status:publish.count"

	// 文章的浏览数量
	ARTICLE_VIEW_COUNT RedisKeyConst = "article.view.count"

	// 前台菜单html结构
	INDEX_CATEGORY_MENU_HTML_LAYOUT RedisKeyConst = "index.category.menu.html.layout"

	// 前台的链接
	INDEX_LINK_ITEMS RedisKeyConst = "index.link.items"

	// 前台对应位置广告
	INDEX_AD_ITEMS_BY_LOCATION RedisKeyConst = "index.ad.items.by.location:"

	// 日志ip2long对应的ip_id
	LOG_IP_ID_BY_LOG2LONG RedisKeyConst = "log.ip.id.by.log2long:"

	// 日志16位MD5的user agent对应的user_agent id
	LOG_UA_ID_BY_MD5_16 RedisKeyConst = "log.ua.id.by.md5.16:"

	// 日志16位MD5的pageUrl对应的page id
	LOG_PAGE_ID_BY_MD5_16 RedisKeyConst = "log.page.id.by.md5.16:"
)

// 所有常量属性
var AllConstAttrs = map[RedisKeyConst]interface{}{
	TEST: map[string]interface{}{
		"desc": "测试",
		"keySuffix": func(rk *RedisKey) (string, error) {
			if args, ok := rk.Args.(map[string]interface{}); ok {
				if id, exists := args["id"]; exists {
					if suffix, err := util.ToString(id); err == nil {
						return suffix, nil
					} else {
						return "", err
					}
				}
			}
			return "", errors.New("args参数异常")
		},
		"value": func(rk *RedisKey) (interface{}, error) {
			return time.Now().Format("2006-01-02 15:04:05"), nil
		},
	},
}

// 定义所有常量获取参数的规则
var AllConstGetArgs = map[RedisKeyConst]func(*RedisKey, ...interface{}) (interface{}, error){}
