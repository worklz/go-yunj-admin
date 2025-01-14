package config

import (
	appQueue "yunj/app/queue"
	"yunj/pkg/queue"
)

// 队列工作项
var QueueJobs = []queue.Job{
	{Enable: true, Queue: &appQueue.Tests{}}, // 测试
}
