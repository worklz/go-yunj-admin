package util

import (
	"sync"
	"time"

	"math/rand"

	"github.com/bwmarrin/snowflake"
)

var (
	rng         *rand.Rand
	rngMutex    sync.Mutex
	rngInitOnce sync.Once
)

func init() {
	rngInitOnce.Do(func() {
		// 创建一个新的随机数源，并将其传递给 rand.New 函数，从而创建一个新的 rand.Rand 实例。这个实例会存储在全局变量 rng 中。
		rng = rand.New(rand.NewSource(time.Now().UnixNano()))
	})
}

// 雪花算法生成的递增唯一id
func SnowflakeId() (int64, error) {
	node, err := snowflake.NewNode(1)
	if err != nil {
		return 0, err
	}
	id := node.Generate()
	return id.Int64(), nil
}

// 获取指定范围内的随机整数
// 单次初始化：使用 sync.Once 确保 rand.Rand 只被初始化一次。
// 线程安全：使用 sync.Mutex 来保护对 rng 的访问，确保在多线程环境下也是线程安全的。
// 标准库：使用 math/rand 包代替 golang.org/x/exp/rand，因为前者是 Go 标准库的一部分，更为稳定和可靠。
func RandomInt(min, max int) int {
	rngMutex.Lock()
	defer rngMutex.Unlock()
	// 确保 max 大于等于 min，否则交换它们
	if max < min {
		min, max = max, min
	}
	// 生成一个 [0, max-min+1) 范围内的随机整数，并加上 min 以得到 [min, max] 范围内的随机整数
	return rng.Intn(max-min+1) + min
}
