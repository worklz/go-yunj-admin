package model

import (
	"time"
	"yunj/app/enum/state"
)

type Model struct {
	Id        uint64           `gorm:"primary_key;autoIncrement;column:id" json:"id,omitempty" form:"id"`
	CreatedAt time.Time        `gorm:"column:created_at" json:"created_at,omitempty" form:"created_at"`
	UpdatedAt time.Time        `gorm:"column:updated_at" json:"updated_at,omitempty" form:"updated_at"`
	State     state.StateConst `gorm:"column:state" json:"state" form:"state"`
}
