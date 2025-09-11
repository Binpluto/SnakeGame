#!/usr/bin/env node

/**
 * 小程序二维码生成脚本
 * 使用方法：node generate-qrcode.js
 * 需要先配置 APP_ID 和 APP_SECRET
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置信息（请替换为你的小程序信息）
const CONFIG = {
  APP_ID: 'your_app_id_here',        // 替换为你的小程序AppID
  APP_SECRET: 'your_app_secret_here', // 替换为你的小程序AppSecret
  OUTPUT_DIR: './images'              // 输出目录
};

/**
 * 发送HTTPS请求
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = Buffer.alloc(0);
      
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * 获取访问令牌
 */
async function getAccessToken(appId, appSecret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  
  try {
    console.log('正在获取访问令牌...');
    const response = await httpsRequest(url);
    const result = JSON.parse(response.data.toString());
    
    if (result.access_token) {
      console.log('✅ 访问令牌获取成功');
      return result.access_token;
    } else {
      throw new Error(`获取访问令牌失败: ${result.errmsg} (${result.errcode})`);
    }
  } catch (error) {
    console.error('❌ 获取访问令牌失败:', error.message);
    throw error;
  }
}

/**
 * 生成小程序码
 */
async function generateQRCode(accessToken, options = {}) {
  const defaultOptions = {
    scene: 'from=web',
    page: 'pages/index/index',
    width: 430,
    auto_color: false,
    line_color: { r: 0, g: 0, b: 0 },
    is_hyaline: false,
    env_version: 'release'
  };
  
  const params = { ...defaultOptions, ...options };
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
  
  try {
    console.log('正在生成小程序码...');
    console.log('参数:', JSON.stringify(params, null, 2));
    
    const response = await httpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    // 检查响应类型
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // 返回的是错误信息
      const errorInfo = JSON.parse(response.data.toString());
      throw new Error(`API错误: ${errorInfo.errmsg} (${errorInfo.errcode})`);
    } else {
      // 返回的是图片数据
      console.log('✅ 小程序码生成成功');
      return response.data;
    }
  } catch (error) {
    console.error('❌ 生成小程序码失败:', error.message);
    throw error;
  }
}

/**
 * 保存图片到文件
 */
function saveImageToFile(imageBuffer, filename) {
  const outputDir = CONFIG.OUTPUT_DIR;
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 创建输出目录: ${outputDir}`);
  }
  
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, imageBuffer);
  
  console.log(`💾 二维码已保存到: ${filePath}`);
  return filePath;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成小程序二维码\n');
  
  // 检查配置
  if (CONFIG.APP_ID === 'your_app_id_here' || CONFIG.APP_SECRET === 'your_app_secret_here') {
    console.error('❌ 请先在脚本中配置正确的 APP_ID 和 APP_SECRET');
    console.log('\n配置方法：');
    console.log('1. 登录微信公众平台: https://mp.weixin.qq.com/');
    console.log('2. 进入开发管理 -> 开发设置');
    console.log('3. 复制 AppID 和 AppSecret');
    console.log('4. 修改本脚本中的 CONFIG 对象\n');
    return;
  }
  
  try {
    // 1. 获取访问令牌
    const accessToken = await getAccessToken(CONFIG.APP_ID, CONFIG.APP_SECRET);
    
    // 2. 生成不同页面的二维码
    const qrCodes = [
      {
        name: 'index',
        scene: 'from=web&page=index',
        page: 'pages/index/index',
        filename: 'miniprogram-index-qrcode.jpg'
      },
      {
        name: 'tetris',
        scene: 'from=web&game=tetris',
        page: 'pages/tetris/tetris',
        filename: 'miniprogram-tetris-qrcode.jpg'
      },
      {
        name: 'snake',
        scene: 'from=web&game=snake',
        page: 'pages/snake/snake',
        filename: 'miniprogram-snake-qrcode.jpg'
      },
      {
        name: 'gomoku',
        scene: 'from=web&game=gomoku',
        page: 'pages/gomoku/gomoku',
        filename: 'miniprogram-gomoku-qrcode.jpg'
      }
    ];
    
    console.log(`\n📋 准备生成 ${qrCodes.length} 个二维码:\n`);
    
    // 3. 逐个生成二维码
    for (const qrConfig of qrCodes) {
      try {
        console.log(`🎯 生成 ${qrConfig.name} 页面二维码...`);
        
        const imageBuffer = await generateQRCode(accessToken, {
          scene: qrConfig.scene,
          page: qrConfig.page,
          width: 280
        });
        
        saveImageToFile(imageBuffer, qrConfig.filename);
        
        // 避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 生成 ${qrConfig.name} 二维码失败:`, error.message);
      }
    }
    
    console.log('\n🎉 二维码生成完成！');
    console.log('\n📝 使用说明：');
    console.log('1. 将生成的二维码替换项目中的占位符图片');
    console.log('2. 用户可以扫码直接进入对应的小程序页面');
    console.log('3. 通过 scene 参数可以追踪用户来源\n');
    
  } catch (error) {
    console.error('\n💥 生成过程中出现错误:', error.message);
    console.log('\n🔍 常见问题排查：');
    console.log('1. 检查 AppID 和 AppSecret 是否正确');
    console.log('2. 确保小程序已经发布（开发版无法生成正式二维码）');
    console.log('3. 检查页面路径是否存在于小程序中');
    console.log('4. 确保网络连接正常\n');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAccessToken,
  generateQRCode,
  saveImageToFile
};