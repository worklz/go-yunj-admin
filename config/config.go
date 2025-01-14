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
	// 默认值
	Default struct {
		Article struct {
			Cover string
		}
		Category struct {
			Id   int
			Pid  int
			Name string
			Img  string
		}
	}
	// 百度站点地图
	Baidu struct {
		SiteMapSite  string `mapstructure:"site_map_site"`
		SiteMapToken string `mapstructure:"site_map_token"`
	}
	// elasticsearch
	Elasticsearch struct {
		Enable      bool     `mapstructure:"enable"`
		IndexPrefix string   `mapstructure:"index_prefix"`
		Hosts       []string `mapstructure:"hosts"`
	}
}
