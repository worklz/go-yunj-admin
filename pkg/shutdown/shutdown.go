package shutdown

// 关闭处理
func Handle() {
	// 停止定时任务
	StopCorn()
	// 停止队列工作任务
	StopQueueJobs()
	// 关闭数据库连接
	ColseDb()
}
