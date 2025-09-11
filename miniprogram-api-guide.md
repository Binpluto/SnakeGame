# 小程序二维码API接口生成指南

## 概述

微信提供了三个主要的API接口来生成小程序二维码，每个接口适用于不同的业务场景。

## 接口类型

### 接口A：获取小程序码（数量限制）
**适用场景**：需要的码数量较少的业务场景

```javascript
// 接口地址
POST https://api.weixin.qq.com/wxa/getwxacode?access_token=ACCESS_TOKEN

// 请求参数
{
  "path": "pages/index/index",        // 小程序页面路径
  "width": 430,                       // 二维码宽度，默认430px
  "auto_color": false,                // 自动配置线条颜色
  "line_color": {"r":0,"g":0,"b":0}, // 线条颜色
  "is_hyaline": false,               // 是否透明底色
  "env_version": "release"            // 版本：release正式版，trial体验版，develop开发版
}
```

### 接口B：获取不限制的小程序码（推荐）
**适用场景**：需要的码数量极多的业务场景

```javascript
// 接口地址
POST https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=ACCESS_TOKEN

// 请求参数
{
  "scene": "a=1&b=2",                 // 最大32个字符的场景值
  "page": "pages/index/index",        // 页面路径，可选
  "check_path": true,                 // 是否检查页面存在
  "env_version": "release",           // 版本
  "width": 430,                       // 宽度
  "auto_color": false,                // 自动配置颜色
  "line_color": {"r":0,"g":0,"b":0}, // 线条颜色
  "is_hyaline": false                // 透明底色
}
```

### 接口C：获取小程序二维码（不推荐）
**适用场景**：传统二维码格式

```javascript
// 接口地址
POST https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=ACCESS_TOKEN

// 请求参数
{
  "path": "pages/index/index",        // 页面路径
  "width": 430                        // 宽度
}
```

## Node.js 实现示例

### 1. 获取 Access Token

```javascript
const axios = require('axios');

// 获取访问令牌
async function getAccessToken(appId, appSecret) {
  try {
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    return response.data.access_token;
  } catch (error) {
    console.error('获取access_token失败:', error);
    throw error;
  }
}
```

### 2. 生成小程序码（推荐使用接口B）

```javascript
const fs = require('fs');
const path = require('path');

// 生成不限制的小程序码
async function generateUnlimitedQRCode(accessToken, options = {}) {
  const defaultOptions = {
    scene: 'default',
    page: 'pages/index/index',
    width: 430,
    auto_color: false,
    line_color: { r: 0, g: 0, b: 0 },
    is_hyaline: false,
    env_version: 'release'
  };
  
  const params = { ...defaultOptions, ...options };
  
  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
      data: params,
      responseType: 'arraybuffer'
    });
    
    // 检查是否返回错误信息
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      const errorInfo = JSON.parse(response.data.toString());
      throw new Error(`API错误: ${errorInfo.errmsg} (${errorInfo.errcode})`);
    }
    
    return response.data; // 返回图片二进制数据
  } catch (error) {
    console.error('生成小程序码失败:', error);
    throw error;
  }
}
```

### 3. 保存二维码图片

```javascript
// 保存二维码到文件
async function saveQRCodeToFile(imageBuffer, filename) {
  const filePath = path.join(__dirname, 'qrcodes', filename);
  
  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, imageBuffer);
  console.log(`二维码已保存到: ${filePath}`);
  return filePath;
}
```

### 4. 完整使用示例

```javascript
// 完整的生成流程
async function generateMiniProgramQRCode() {
  const APP_ID = 'your_app_id';        // 替换为你的小程序AppID
  const APP_SECRET = 'your_app_secret'; // 替换为你的小程序AppSecret
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken(APP_ID, APP_SECRET);
    console.log('获取access_token成功');
    
    // 2. 生成小程序码
    const qrCodeBuffer = await generateUnlimitedQRCode(accessToken, {
      scene: 'game=tetris&from=web',  // 自定义场景参数
      page: 'pages/tetris/tetris',    // 指定页面
      width: 280                      // 设置宽度
    });
    
    // 3. 保存到文件
    const filename = `miniprogram-qrcode-${Date.now()}.jpg`;
    await saveQRCodeToFile(qrCodeBuffer, filename);
    
    console.log('小程序二维码生成成功!');
    
  } catch (error) {
    console.error('生成失败:', error.message);
  }
}

// 调用生成函数
generateMiniProgramQRCode();
```

## Express.js 服务端实现

```javascript
const express = require('express');
const app = express();

// 生成二维码的API端点
app.post('/api/generate-qrcode', async (req, res) => {
  try {
    const { scene, page, width } = req.body;
    
    // 获取访问令牌
    const accessToken = await getAccessToken(process.env.APP_ID, process.env.APP_SECRET);
    
    // 生成二维码
    const qrCodeBuffer = await generateUnlimitedQRCode(accessToken, {
      scene: scene || 'default',
      page: page || 'pages/index/index',
      width: width || 430
    });
    
    // 设置响应头
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': qrCodeBuffer.length
    });
    
    // 返回图片数据
    res.send(qrCodeBuffer);
    
  } catch (error) {
    res.status(500).json({
      error: '生成二维码失败',
      message: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

## 前端调用示例

```javascript
// 前端请求生成二维码
async function requestQRCode(scene, page) {
  try {
    const response = await fetch('/api/generate-qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scene: scene,
        page: page,
        width: 280
      })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // 显示二维码
      const img = document.getElementById('qrcode-image');
      img.src = imageUrl;
    } else {
      console.error('生成二维码失败');
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

## 重要注意事项

1. **接口限制**：
   - 接口A + 接口C：总共100,000个码的限制
   - 接口B：无数量限制，但有频率限制（5000次/分钟）

2. **版本要求**：
   - 只能生成已发布小程序的二维码
   - 开发版二维码需要在开发者工具中预览生成

3. **参数说明**：
   - `scene`：最大32个字符，支持数字、英文、特殊字符
   - `path`：页面路径，不要以`/`开头
   - `scancode_time`：系统保留参数，不允许配置

4. **错误处理**：
   - 成功时返回图片二进制数据
   - 失败时返回JSON格式错误信息

5. **安全建议**：
   - AppSecret不要暴露在前端代码中
   - 使用环境变量存储敏感信息
   - 实现访问令牌的缓存机制

## 获取场景值

在小程序中获取二维码中的场景值：

```javascript
// 小程序端获取场景值
App({
  onLaunch(options) {
    // 从二维码进入时
    if (options.scene === 1047) {
      const scene = decodeURIComponent(options.query.scene);
      console.log('场景值:', scene);
      // 解析场景值参数
      const params = new URLSearchParams(scene);
      const game = params.get('game');
      const from = params.get('from');
    }
  }
});
```

通过以上API接口，您可以灵活地为不同页面和场景生成对应的小程序二维码。