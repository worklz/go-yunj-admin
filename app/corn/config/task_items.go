package config

import (
	appCorn "yunj/app/corn"
	"yunj/pkg/corn"
)

// 任务项集合
var TaskItems = []corn.TaskItem{
	// 每10秒执行一次
	{Enable: false, Spec: "*/10 * * * * *", Task: &appCorn.Tests{}},
}
