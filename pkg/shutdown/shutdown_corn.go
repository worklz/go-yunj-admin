package shutdown

import (
	"yunj/pkg/global"
)

// 停止定时任务
func StopCorn() {
	global.Corn.Stop()
	global.Logger.Info("定时任务执行停止！")
}
