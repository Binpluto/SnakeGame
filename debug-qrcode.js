#!/usr/bin/env node

/**
 * 调试版本的二维码生成脚本
 * 用于查看微信API的实际响应
 */

const https = require('https');
const fs = require('fs');

// 从配置文件读取
const config = JSON.parse(fs.readFileSync('./miniprogram-config.json', 'utf8'));

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

async function debugQRCodeGeneration() {
  try {
    // 1. 获取访问令牌
    console.log('🔑 正在获取访问令牌...');
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
    
    const tokenResponse = await httpsRequest(tokenUrl);
    console.log('Token API 状态码:', tokenResponse.statusCode);
    console.log('Token API 响应头:', tokenResponse.headers);
    
    const tokenResult = JSON.parse(tokenResponse.data.toString());
    console.log('Token API 响应内容:', tokenResult);
    
    if (!tokenResult.access_token) {
      throw new Error(`获取访问令牌失败: ${tokenResult.errmsg} (${tokenResult.errcode})`);
    }
    
    const accessToken = tokenResult.access_token;
    console.log('✅ 访问令牌获取成功');
    
    // 2. 测试小程序信息
    console.log('📱 正在获取小程序基本信息...');
    const infoUrl = `https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${accessToken}`;
    
    const infoResponse = await httpsRequest(infoUrl);
    console.log('Info API 状态码:', infoResponse.statusCode);
    console.log('Info API 响应:', JSON.parse(infoResponse.data.toString()));
    
    // 3. 生成二维码
    console.log('🎯 正在生成小程序码...');
    const qrUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
    
    const qrOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scene: 'test',
        width: 430
      })
    };
    
    const qrResponse = await httpsRequest(qrUrl, qrOptions);
    console.log('QR API 状态码:', qrResponse.statusCode);
    console.log('QR API 响应头:', qrResponse.headers);
    console.log('QR API 数据长度:', qrResponse.data.length);
    
    // 检查响应类型
    const contentType = qrResponse.headers['content-type'] || '';
    console.log('Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      // 返回的是错误信息
      const errorInfo = JSON.parse(qrResponse.data.toString());
      console.log('❌ API 错误响应:', errorInfo);
      throw new Error(`API错误: ${errorInfo.errmsg} (${errorInfo.errcode})`);
    } else if (contentType.includes('image')) {
      // 返回的是图片数据
      console.log('✅ 收到图片数据，长度:', qrResponse.data.length);
      
      // 保存文件
      const filename = 'debug-qrcode.jpg';
      fs.writeFileSync(`./images/${filename}`, qrResponse.data);
      console.log(`💾 调试二维码已保存到: ./images/${filename}`);
      
      // 检查文件大小
      const stats = fs.statSync(`./images/${filename}`);
      console.log('文件大小:', stats.size, '字节');
    } else {
      console.log('⚠️  未知的响应类型');
      console.log('响应数据前100字节:', qrResponse.data.slice(0, 100).toString());
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行调试
debugQRCodeGeneration();