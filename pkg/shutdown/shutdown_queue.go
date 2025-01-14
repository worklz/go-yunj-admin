package shutdown

import (
	"yunj/pkg/global"
	"yunj/pkg/queue"
)

// 停止队列工作任务
func StopQueueJobs() {
	queue.QueueJobScheduler.Stop()
	global.Logger.Info("队列工作任务停止调度！")
}
