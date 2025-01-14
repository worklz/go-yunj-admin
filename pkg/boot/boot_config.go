package boot

import (
	"yunj/pkg/global"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

// 初始化配置
func InitConfig() {
	// viper文件配置
	viper.SetConfigType("yaml")
	viper.SetConfigFile("config/config.yaml")

	// 读取配置
	if err := viper.ReadInConfig(); err != nil {
		panic("配置文件内容读取错误！")
	}

	// 监听配置文件
	viper.WatchConfig()
	// 添加方法监听配置文件更改处理
	viper.OnConfigChange(func(in fsnotify.Event) {
		if err := viper.Unmarshal(&global.Config); err != nil {
			global.Logger.WithError(err).Error("配置文件修改后报错了！")
		}
	})

	// 将配置文件内容写入到结构体
	if err := viper.Unmarshal(&global.Config); err != nil {
		panic("配置文件内容写入结构体错误！")
	}

}
