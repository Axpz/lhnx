package auth

import (
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/wechat"
)

// InitOAuth 初始化 OAuth 提供商
func InitOAuth(wechatKey, wechatSecret, wechatCallback string) {
	if wechatKey != "" && wechatSecret != "" {
		goth.UseProviders(
			wechat.New(wechatKey, wechatSecret, wechatCallback, "zh_CN"),
		)
	}
}
