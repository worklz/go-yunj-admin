package service

import (
	"yunj/app/model"
	"yunj/config"
	"yunj/pkg/global"
)

type Setting struct {
	Service
}

// 获取设置值

func (s *Setting) Value(key string) (val any, err error) {

}

// 初始化全局setting值
func InitGlobalSetting() (err error) {
	setting := map[string]map[string]any{}
	// 获取默认的设置值
	configSettingGroups, exists := config.Setting["groups"]
	if exists {
		configSettingGroupSlice, ok := configSettingGroups.([]map[string]any)
		if ok {
			for _, group := range configSettingGroupSlice {
				groupKey, exists := group["key"]
				if !exists {
					continue
				}
				groupKeyStr, ok := groupKey.(string)
				if !ok || groupKeyStr == "" {
					continue
				}
				form, exists := group["form"]
				if !exists {
					continue
				}
				formMap, ok := form.(map[string]any)
				if !ok {
					continue
				}
				formFieldDefault, exists := formMap["field_default"]
				if !exists {
					continue
				}
				formFieldDefaultMap, ok := formFieldDefault.(map[string]any)
				if !ok {
					continue
				}
				setting[groupKeyStr] = formFieldDefaultMap
			}
		}
	}

	// 查询数据库所有设置值
	var settings []model.Setting
	err = global.MySQL.Model(&model.Setting{}).Select("group,key,value").Find(&settings).Error
	if err != nil {
		return
	}
	for _, item := range settings {
		if _, exists := setting[item.Group]; exists {
			setting[item.Group][item.Key] = item.Value
		} else {
			setting[item.Group] = map[string]any{item.Key: item.Value}
		}
	}

	global.Setting = setting
	return
}
