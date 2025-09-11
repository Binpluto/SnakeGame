#!/usr/bin/env node

/**
 * 生成演示用的小程序二维码
 * 使用公开的测试小程序生成演示二维码，让用户可以立即看到效果
 * 注意：这些是演示用的二维码，实际使用时需要配置真实的小程序信息
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 演示用的小程序配置（使用微信官方测试小程序）
const DEMO_CONFIG = {
  appId: 'wx8c8d5e8c8d5e8c8d', // 这是一个示例AppID
  appSecret: 'demo_secret_for_testing', // 这是一个示例AppSecret
  note: '这是演示配置，实际使用时请替换为真实的小程序信息'
};

// 演示二维码配置
const DEMO_QR_CONFIGS = [
  {
    name: '首页演示',
    filename: 'miniprogram-index-qrcode.jpg',
    description: '小程序首页二维码（演示）'
  },
  {
    name: '俄罗斯方块演示',
    filename: 'miniprogram-tetris-qrcode.jpg',
    description: '俄罗斯方块游戏页面二维码（演示）'
  },
  {
    name: '贪吃蛇演示',
    filename: 'miniprogram-snake-qrcode.jpg',
    description: '贪吃蛇游戏页面二维码（演示）'
  },
  {
    name: '五子棋演示',
    filename: 'miniprogram-gomoku-qrcode.jpg',
    description: '五子棋游戏页面二维码（演示）'
  }
];

/**
 * 生成演示用的二维码图片（使用Canvas生成简单的二维码样式）
 */
function generateDemoQRCode(config) {
  // 创建一个简单的SVG二维码
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="280" height="280" fill="white" stroke="#ddd" stroke-width="1"/>
  
  <!-- 模拟二维码图案 -->
  <g fill="black">
    <!-- 左上角定位点 -->
    <rect x="20" y="20" width="60" height="60" fill="black"/>
    <rect x="30" y="30" width="40" height="40" fill="white"/>
    <rect x="40" y="40" width="20" height="20" fill="black"/>
    
    <!-- 右上角定位点 -->
    <rect x="200" y="20" width="60" height="60" fill="black"/>
    <rect x="210" y="30" width="40" height="40" fill="white"/>
    <rect x="220" y="40" width="20" height="20" fill="black"/>
    
    <!-- 左下角定位点 -->
    <rect x="20" y="200" width="60" height="60" fill="black"/>
    <rect x="30" y="210" width="40" height="40" fill="white"/>
    <rect x="40" y="220" width="20" height="20" fill="black"/>
    
    <!-- 模拟数据点 -->
    <rect x="100" y="30" width="10" height="10"/>
    <rect x="120" y="30" width="10" height="10"/>
    <rect x="140" y="40" width="10" height="10"/>
    <rect x="160" y="50" width="10" height="10"/>
    <rect x="100" y="60" width="10" height="10"/>
    <rect x="130" y="70" width="10" height="10"/>
    <rect x="150" y="80" width="10" height="10"/>
    <rect x="170" y="90" width="10" height="10"/>
    <rect x="110" y="100" width="10" height="10"/>
    <rect x="140" y="110" width="10" height="10"/>
    <rect x="160" y="120" width="10" height="10"/>
    <rect x="180" y="130" width="10" height="10"/>
    <rect x="120" y="140" width="10" height="10"/>
    <rect x="100" y="150" width="10" height="10"/>
    <rect x="130" y="160" width="10" height="10"/>
    <rect x="150" y="170" width="10" height="10"/>
    <rect x="170" y="180" width="10" height="10"/>
    <rect x="190" y="190" width="10" height="10"/>
    <rect x="110" y="200" width="10" height="10"/>
    <rect x="140" y="210" width="10" height="10"/>
    <rect x="160" y="220" width="10" height="10"/>
    <rect x="180" y="230" width="10" height="10"/>
    <rect x="200" y="240" width="10" height="10"/>
    <rect x="220" y="250" width="10" height="10"/>
  </g>
  
  <!-- 游戏标识 -->
  <circle cx="140" cy="140" r="25" fill="white" stroke="black" stroke-width="2"/>
  <text x="140" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="black">小程序</text>
  <text x="140" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="black">${config.name}</text>
</svg>`;

  return svgContent;
}

/**
 * 将SVG转换为JPG格式的占位符
 * 注意：这里生成的是SVG格式，实际项目中可以使用图片转换库
 */
function saveDemoQRCode(config, outputDir) {
  const svgContent = generateDemoQRCode(config);
  const outputPath = path.join(outputDir, config.filename.replace('.jpg', '.svg'));
  
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`✅ 已生成演示二维码: ${outputPath}`);
  
  return outputPath;
}

/**
 * 创建演示说明文件
 */
function createDemoReadme(outputDir) {
  const readmeContent = `# 演示二维码说明

## 📋 关于这些二维码

当前目录中的二维码文件是**演示用途**，用于展示网页中二维码的显示效果。

### 📁 演示文件列表

- \`miniprogram-index-qrcode.svg\` - 首页演示二维码
- \`miniprogram-tetris-qrcode.svg\` - 俄罗斯方块演示二维码
- \`miniprogram-snake-qrcode.svg\` - 贪吃蛇演示二维码
- \`miniprogram-gomoku-qrcode.svg\` - 五子棋演示二维码

### ⚠️ 重要提示

**这些二维码无法扫描使用**，它们只是用于演示网页布局和样式的占位符。

### 🔄 生成真实二维码

要生成可以实际使用的小程序二维码，请：

1. **配置小程序信息**
   \`\`\`bash
   # 编辑配置文件
   nano miniprogram-config.json
   \`\`\`
   
2. **填入真实的 AppID 和 AppSecret**
   \`\`\`json
   {
     "appId": "你的真实AppID",
     "appSecret": "你的真实AppSecret"
   }
   \`\`\`

3. **一键生成和更新**
   \`\`\`bash
   node generate-and-update-qrcode.js
   \`\`\`

### 📖 更多帮助

- 详细配置说明：\`如何生成真实二维码.md\`
- API接口文档：\`miniprogram-api-guide.md\`
- 小程序开发指南：\`README-miniprogram.md\`

---

生成时间: ${new Date().toLocaleString('zh-CN')}
`;

  const readmePath = path.join(outputDir, 'DEMO-README.md');
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`📝 已创建演示说明: ${readmePath}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🎨 生成演示用小程序二维码');
  console.log('=' .repeat(40));
  console.log('');
  console.log('⚠️  注意：这些是演示用的二维码，无法实际扫描使用');
  console.log('📖 要生成真实二维码，请参考：如何生成真实二维码.md');
  console.log('');

  const outputDir = './images';
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 已创建目录: ${outputDir}`);
  }

  // 生成演示二维码
  console.log('🔄 正在生成演示二维码...');
  console.log('');
  
  for (const config of DEMO_QR_CONFIGS) {
    saveDemoQRCode(config, outputDir);
  }
  
  console.log('');
  
  // 创建说明文件
  createDemoReadme(outputDir);
  
  console.log('');
  console.log('🎉 演示二维码生成完成！');
  console.log('');
  console.log('📝 接下来可以：');
  console.log('1. 运行 node update-qrcode-references.js 更新网页引用');
  console.log('2. 刷新浏览器查看演示效果');
  console.log('3. 配置真实小程序信息后生成真实二维码');
  console.log('');
}

// 运行脚本
if (require.main === module) {
  main();
}