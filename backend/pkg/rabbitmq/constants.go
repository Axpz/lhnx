package rabbitmq

const (
	// QueueCompanySync 是用于企业数据同步到 Elasticsearch 的队列名称
	QueueCompanySync = "company_sync_es"
)

// SyncMessage 定义了同步消息的结构
type SyncMessage struct {
	ID     string `json:"id"`     // 数据 ID (UUID)
	Action string `json:"action"` // 动作: "index" (更新/新增) 或 "delete" (删除)
}
