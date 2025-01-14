package shutdown

import (
	"yunj/pkg/global"
)

// 关闭数据库连接
func ColseDb() {
	if err := global.MySQL.Close(); err != nil {
		global.Logger.WithError(err).Error("关闭数据库连接失败！")
	}
	global.Logger.Info("关闭数据库连接成功！")

}
