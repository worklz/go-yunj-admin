package boot

import (
	"fmt"
	"time"

	"yunj/pkg/global"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

// 初始化数据库连接
func InitDb() {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		global.Config.Database.User,
		global.Config.Database.Password,
		global.Config.Database.Host,
		global.Config.Database.Port,
		global.Config.Database.Name,
	)

	mysql, err := gorm.Open(global.Config.Database.Type, dsn)

	if err != nil {
		panic(fmt.Sprintf("初始化数据库连接失败！%v", err))
	}

	gorm.DefaultTableNameHandler = func(db *gorm.DB, defaultTableName string) string {
		return global.Config.Database.TablePrefix + defaultTableName
	}

	mysql.SingularTable(true)
	// Mysql.Callback().Create().Replace("gorm:update_time_stamp", updateTimeStampForCreateCallback)
	// Mysql.Callback().Update().Replace("gorm:update_time_stamp", updateTimeStampForUpdateCallback)
	// Mysql.Callback().Delete().Replace("gorm:delete", deleteCallback)
	mysql.DB().SetMaxIdleConns(global.Config.Database.MaxIdleConns) // 设置最大空闲连接数
	mysql.DB().SetMaxOpenConns(global.Config.Database.MaxOpenConns) // 设置最大连接数
	mysql.DB().SetConnMaxLifetime(5 * time.Minute)                  // 设置每个链接的过期时间

	// 启用Logger，显示详细日志
	mysql.LogMode(true)

	global.MySQL = mysql
}
