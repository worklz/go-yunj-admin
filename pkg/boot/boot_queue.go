package boot

import (
	"yunj/app/queue/config"
	"yunj/pkg/queue"
)

// 启动队列工作
func InitQueueJobs() {
	queueJobScheduler := queue.NewQueueJobScheduler()
	queueJobScheduler.Start(config.QueueJobs)
}
