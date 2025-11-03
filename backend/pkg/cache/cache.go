package cache

import (
	"time"

	"github.com/dgraph-io/ristretto"
	"golang.org/x/sync/singleflight"
)

type LocalCache struct {
	cache *ristretto.Cache
	group singleflight.Group
}

// NewLocalCache creates a Ristretto-based cache with ~8MB max memory.
func NewLocalCache() *LocalCache {
	c, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e6,     // 预估10万条数据 → 1e6 计数器合理
		MaxCost:     8 << 20, // 8MB 内存上限（真实可控）
		BufferItems: 64,      // 默认推荐
		Cost: func(value any) int64 {
			switch v := value.(type) {
			case string:
				return int64(len(v)) // 字符串按字节算
			case []byte:
				return int64(len(v)) // 二进制数据按真实大小算
			default:
				// 对对象和结构体用固定估算值，避免复杂反射
				return 128 // 128 字节作为通用默认值，安全 & 稳定
			}
		},
	})

	if err != nil {
		panic(err)
	}

	return &LocalCache{cache: c}
}

// Get fetches a value if present
func (c *LocalCache) Get(key string) (any, bool) {
	return c.cache.Get(key)
}

// Set stores a value with TTL
func (c *LocalCache) Set(key string, value any, ttl time.Duration) {
	// Cost=1 means each entry has equal weight. You can customize.
	c.cache.SetWithTTL(key, value, 0, ttl)
}

// GetOrDo ensures only one computation happens on cache miss.
func (c *LocalCache) GetOrDo(key string, ttl time.Duration, fn func() (any, error)) (any, error) {
	// First check
	if v, ok := c.Get(key); ok {
		return v, nil
	}

	// Use singleflight so only one goroutine computes
	v, err, _ := c.group.Do(key, func() (any, error) {
		// Recheck in case another request filled cache during waiting
		if cached, ok := c.Get(key); ok {
			return cached, nil
		}

		// Compute
		res, err := fn()
		if err != nil {
			return nil, err
		}

		// Store
		c.Set(key, res, ttl)
		return res, nil
	})

	return v, err
}
