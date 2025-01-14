package group

import "yunj/app/enum/redis/key"

type RedisGroupConst int

// 定义redis group常量
const (
	// 文章
	ARTICLE RedisGroupConst = iota

	// 友情链接
	LINK
)

// 所有常量属性
var AllConstAttrs = map[RedisGroupConst]interface{}{
	ARTICLE: map[string]interface{}{
		"desc":   "文章分组",
		"parent": "",
		"keys": []key.RedisKeyConst{
			key.ARTICLE_STATE_NORMAL_STATUS_PUBLISH_COUNT,
			key.ARTICLE_VIEW_COUNT,
			key.TEST,
		},
	},
	LINK: map[string]interface{}{
		"desc":   "友情链接分组",
		"parent": "",
		"keys": []key.RedisKeyConst{
			key.INDEX_LINK_ITEMS,
		},
	},
}
