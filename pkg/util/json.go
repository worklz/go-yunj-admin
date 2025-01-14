package util

import (
	"encoding/json"
)

// 数据转换为json
func ToJson(data interface{}) (dataJson string, err error) {
	//map转为json串(本质是string)
	//先把map转为byte数组
	marshal, err := json.Marshal(data)
	if err != nil {
		return
	}
	//再把byte数组转为json串
	dataJson = string(marshal)
	return
}

// json转换为指定数据类型
func JsonTo[T any](dataJson string) (data T, err error) {
	//json串(本质是string)转为map
	//先把json串转为byte数组
	//再把byte数组转为map
	err = json.Unmarshal([]byte(dataJson), &data)
	return
}
