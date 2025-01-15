package model

type Setting struct {
	Model
	Group string `gorm:"column:group" json:"group" form:"group"`
	Key   string `gorm:"column:key" json:"key" form:"key"`
	Value string `gorm:"column:value" json:"value" form:"value"`
}
