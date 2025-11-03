package model

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Product represents the products table with JSONB info payload.
type Product struct {
	ID        uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string            `gorm:"type:varchar(255)" json:"name"`
	CompanyID uuid.UUID         `gorm:"type:uuid;index" json:"company_id"`
	Info      datatypes.JSONMap `gorm:"type:jsonb;not null;default:'{}'::jsonb" json:"info"`
	UpdatedAt time.Time         `json:"updated_at"`

	Company *Company `json:"company,omitempty" gorm:"foreignKey:CompanyID"`
}

// MergeInfo merges the provided key-value pairs into the product info payload.
// A nil value removes the key from the info map.
func (p *Product) MergeInfo(updates datatypes.JSONMap) {
	if p.Info == nil {
		p.Info = datatypes.JSONMap{}
	}
	for k, v := range updates {
		if v == nil {
			delete(p.Info, k)
			continue
		}
		p.Info[k] = v
	}
}

// ReplaceInfo replaces the current info payload with the provided struct or map value.
func (p *Product) ReplaceInfo(data any) error {
	raw, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("marshal product info: %w", err)
	}
	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil {
		return fmt.Errorf("unmarshal product info: %w", err)
	}
	p.Info = datatypes.JSONMap(m)
	return nil
}

// DecodeInfo decodes the info payload into the provided destination structure.
func (p *Product) DecodeInfo(dst any) error {
	raw, err := json.Marshal(p.Info)
	if err != nil {
		return fmt.Errorf("marshal product info: %w", err)
	}
	if len(raw) == 0 || string(raw) == "null" {
		raw = []byte("{}")
	}
	if err := json.Unmarshal(raw, dst); err != nil {
		return fmt.Errorf("unmarshal product info: %w", err)
	}
	return nil
}
