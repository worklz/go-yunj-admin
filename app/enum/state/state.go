package state

type StateConst int

// 定义状态常量
const (
	// 正常
	NORMAL StateConst = 11

	// 回收站
	RECYLE_BIN StateConst = 22

	// 已删除
	DELETED StateConst = 33
)

// 所有常量属性
var AllConstAttrs = map[StateConst]interface{}{
	NORMAL: map[string]interface{}{
		"desc": "正常",
	},
	RECYLE_BIN: map[string]interface{}{
		"desc": "回收站",
	},
	DELETED: map[string]interface{}{
		"desc": "已删除",
	},
}
