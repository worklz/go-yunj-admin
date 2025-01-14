package util

import (
	"crypto/md5"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"net"
	"reflect"

	"yunj/pkg/global"
)

// 将 IPv4 地址字符串转换为 uint32
func IpToUint32(ipStr string) (uint32, error) {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return 0, fmt.Errorf("无效IP地址: %s", ipStr)
	}

	ipv4 := ip.To4()
	if ipv4 == nil {
		return 0, fmt.Errorf("非IPV4地址: %s", ipStr)
	}
	// 将 IPv4 地址的四个字节转换为 uint32
	return binary.BigEndian.Uint32(ipv4), nil
}

// 计算给定字符串的 MD5 哈希值，并返回其十六进制表示。
func Md5(s string) string {
	// 创建一个新的 MD5 哈希器
	hasher := md5.New()
	// 将字符串的字节写入哈希器
	hasher.Write([]byte(s))
	// 计算哈希值，得到字节切片
	hashBytes := hasher.Sum(nil)
	// 将哈希值字节切片转换为十六进制字符串
	hashString := hex.EncodeToString(hashBytes)
	return hashString
}

// 获取数据库表名
func TableName(model any) string {
	if tabler, ok := model.(interface{ TableName() string }); ok {
		return tabler.TableName()
	}

	t := reflect.TypeOf(model)
	// 如果传入的是指针，获取指针指向的值
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return global.Config.Database.TablePrefix + UppercaseToUnderline(t.Name())
}
