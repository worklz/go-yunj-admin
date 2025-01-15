package global

import (
	"yunj/config"

	"github.com/go-playground/validator/v10"
	"github.com/gomodule/redigo/redis"
	"github.com/jinzhu/gorm"
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

var (
	Config   *config.Config
	Logger   *logrus.Logger
	MySQL    *gorm.DB
	Redis    *redis.Pool
	Setting  map[string]map[string]any // {group:{key:value,...},...}
	Validate *validator.Validate
	Corn     *cron.Cron
)
