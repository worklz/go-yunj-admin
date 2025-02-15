package config

import "time"

type Config struct {
	// 应用配置
	App struct {
		Mode        string
		Port        string
		Url         string
		Name        string
		Keywords    string
		Description string
		Version     string
		Author      struct {
			QQ    string `mapstructure:"qq"`
			Email string
		}
		Admin struct {
			UseDemo        bool `mapstructure:"use_demo"`
			Entrance       string
			DashboardUrl   string   `mapstructure:"dashboard_url"`
			StyleFileList  []string `mapstructure:"style_file_list"`
			ScriptFileList []string `mapstructure:"script_file_list"`
		}
	}
	// 数据库配置
	Database struct {
		Type         string
		Host         string
		Port         string
		User         string
		Password     string
		Name         string
		TablePrefix  string `mapstructure:"table_prefix"`
		MaxIdleConns int    `mapstructure:"max_idle_conns"`
		MaxOpenConns int    `mapstructure:"max_open_conns"`
	}
	// Redis配置
	Redis struct {
		Host        string
		Port        string
		DB          int `mapstructure:"db"`
		Password    string
		Prefix      string
		MaxIdle     int           `mapstructure:"max_idle"`
		MaxActive   int           `mapstructure:"max_active"`
		IdleTimeout time.Duration `mapstructure:"idle_timeout"`
	}
}

// 获取后台安全入口，默认为"/admin"
func (c *Config) GetAppAdminEntrance() string {
	entrance := c.App.Admin.Entrance
	if entrance == "" {
		entrance = "/admin"
	}
	return entrance
}
