package queue

import (
	"context"
	"fmt"
	"runtime/debug"
	"sync"

	"yunj/pkg/global"
	"yunj/pkg/redis"
)

// 队列工作调度器
type queueJobScheduler struct {
	wg       sync.WaitGroup
	stopChan chan struct{}
	mu       sync.Mutex // 用于保护 stopChan 的关闭操作
}

var QueueJobScheduler *queueJobScheduler

// 初始化队列工作调度器
func NewQueueJobScheduler() *queueJobScheduler {
	QueueJobScheduler = &queueJobScheduler{
		stopChan: make(chan struct{}),
	}
	return QueueJobScheduler
}

// 开启调度器工作
func (qjs *queueJobScheduler) Start(jobs []Job) {
	for _, job := range jobs {
		// 判断是否启用
		if !job.Enable {
			continue
		}
		// 开启配置数量协程
		queue := job.Queue
		coroutineNum := queue.CoroutineNum()
		qjs.wg.Add(coroutineNum)
		for i := 1; i <= coroutineNum; i++ {
			go qjs.runJob(i, job)
		}
	}

	go func() {
		qjs.wg.Wait()
		close(qjs.stopChan)
	}()
}

// 停止调度器工作
// 确保并发安全，引入锁
func (qjs *queueJobScheduler) Stop() {
	qjs.mu.Lock()
	defer qjs.mu.Unlock()
	select {
	case <-qjs.stopChan:
		return
	default:
		close(qjs.stopChan)
	}
	qjs.wg.Wait()
}

// 运行队列任务
func (qjs *queueJobScheduler) runJob(coroutineNo int, job Job) {
	var messages []string
	queue := job.Queue
	logPrefix := LogPrefix(queue)
	defer func() {
		if err := recover(); err != nil {
			// 记录异常日志
			global.Logger.WithError(fmt.Errorf("panic: %v", err)).Error(logPrefix, "异常！")
			// 判断是否已经获取到消息了，重新入队
			qjs.rePushQueueMessages(logPrefix, queue, messages)
			// 停止调度
			return
		}
		qjs.wg.Done()
	}()
	for {
		select {
		case <-qjs.stopChan:
			global.Logger.Info(logPrefix + "停止调度！")
			// 判断是否已经获取到消息了，重新入队
			qjs.rePushQueueMessages(logPrefix, queue, messages)
			return
		default:
			// 获取消息
			messages = []string{}
			messages := qjs.popQueueMessages(logPrefix, queue)
			if len(messages) <= 0 {
				continue
			}
			// 处理消息
			if len(messages) > 0 {
				err := qjs.handleMessages(queue, messages)
				if err != nil {
					// 记录异常日志
					global.Logger.WithError(err).Error(logPrefix, "处理消息异常！")
					// 判断是否已经获取到消息了，重新入队
					qjs.rePushQueueMessages(logPrefix, queue, messages)
					return
				}
			}
		}
	}
}

// 处理队列消息
func (qjs *queueJobScheduler) handleMessages(queue QueueInterface, messages []string) error {
	timeout := queue.Timeout()
	done := make(chan bool)
	errChan := make(chan error)
	if timeout <= 0 {
		// 无超时时间
		func() {
			defer func() {
				if err := recover(); err != nil {
					errChan <- fmt.Errorf("panic: %v", err)
				}
			}()
			queue.Handler(messages)
			done <- true
		}()
	} else {
		// 有超时时间
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		go func(ctx context.Context) {
			defer func() {
				if err := recover(); err != nil {
					errChan <- fmt.Errorf("panic: %v Stack trace: %s", err, string(debug.Stack()))
				}
			}()
			select {
			case <-ctx.Done():
				errChan <- fmt.Errorf("执行超时！")
				return
			default:
				queue.Handler(messages)
				//panic("测试异常")
				done <- true
			}
		}(ctx)
	}

	select {
	case err := <-errChan:
		return err
	case <-done:
		return nil
	}
}

// 弹出队列消息
func (qjs *queueJobScheduler) popQueueMessages(logPrefix string, queue QueueInterface) []string {
	messages := []string{}
	messageNum := queue.MessageNum()
	for i := 0; i < messageNum; i++ {
		message, err := redis.RPop(queue.Queue())
		if err != nil {
			global.Logger.WithError(err).Error(logPrefix, "获取队列消息异常！")
			return nil
		}
		if message != "" {
			messages = append(messages, message)
		}
	}
	return messages
}

// 重新推送队列消息，并滞空消息变量
func (qjs *queueJobScheduler) rePushQueueMessages(logPrefix string, queue QueueInterface, messages []string) {
	for _, message := range messages {
		if err := New(queue).Push(message); err != nil {
			global.Logger.WithField("queueMessage", message).WithError(err).Error(logPrefix, "消息重新入队异常！")
		}
	}
}
