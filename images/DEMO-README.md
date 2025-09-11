# 演示二维码说明

## 📋 关于这些二维码

当前目录中的二维码文件是**演示用途**，用于展示网页中二维码的显示效果。

### 📁 演示文件列表

- `miniprogram-index-qrcode.svg` - 首页演示二维码
- `miniprogram-tetris-qrcode.svg` - 俄罗斯方块演示二维码
- `miniprogram-snake-qrcode.svg` - 贪吃蛇演示二维码
- `miniprogram-gomoku-qrcode.svg` - 五子棋演示二维码

### ⚠️ 重要提示

**这些二维码无法扫描使用**，它们只是用于演示网页布局和样式的占位符。

### 🔄 生成真实二维码

要生成可以实际使用的小程序二维码，请：

1. **配置小程序信息**
   ```bash
   # 编辑配置文件
   nano miniprogram-config.json
   ```
   
2. **填入真实的 AppID 和 AppSecret**
   ```json
   {
     "appId": "你的真实AppID",
     "appSecret": "你的真实AppSecret"
   }
   ```

3. **一键生成和更新**
   ```bash
   node generate-and-update-qrcode.js
   ```

### 📖 更多帮助

- 详细配置说明：`如何生成真实二维码.md`
- API接口文档：`miniprogram-api-guide.md`
- 小程序开发指南：`README-miniprogram.md`

---

生成时间: 2025/9/11 15:30:16
