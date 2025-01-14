package model

import "yunj/app/enum/state"

type Model struct {
	Id             int              `gorm:"primary_key;autoIncrement;column:id" json:"id,omitempty" form:"id"`
	CreateTime     int64            `gorm:"column:create_time" json:"create_time,omitempty" form:"create_time"`
	LastUpdateTime int64            `gorm:"column:last_update_time" json:"last_update_time,omitempty" form:"last_update_time"`
	State          state.StateConst `gorm:"column:state" json:"state" form:"state"`
}
