package boot

import (
	"time"

	"yunj/pkg/global"

	rotatelog "github.com/lestrrat-go/file-rotatelogs"
	"github.com/rifflock/lfshook"
	"github.com/sirupsen/logrus"
)

// 初始化日志
func InitLogger() {
	logger := logrus.New()
	// json格式记录
	logger.SetFormatter(&logrus.JSONFormatter{})
	// 记录调用信息（代码位置），有些许性能代价
	// logger.SetReportCaller(true)
	logWriter, _ := rotatelog.New(
		"storage/log/%Y/%m/%d.log",
		rotatelog.WithMaxAge(7*24*time.Hour),
		rotatelog.WithRotationTime(24*time.Hour),
		rotatelog.WithLinkName("curr.log"),
	)

	writeMap := lfshook.WriterMap{
		logrus.PanicLevel: logWriter,
		logrus.FatalLevel: logWriter,
		logrus.ErrorLevel: logWriter,
		logrus.WarnLevel:  logWriter,
		logrus.InfoLevel:  logWriter,
		logrus.DebugLevel: logWriter,
		logrus.TraceLevel: logWriter,
	}
	hook := lfshook.NewHook(writeMap, &logrus.JSONFormatter{
		TimestampFormat:   "2006-01-02 15:04:05",
		DisableHTMLEscape: true,
	})
	logger.AddHook(hook)

	global.Logger = logger
}
