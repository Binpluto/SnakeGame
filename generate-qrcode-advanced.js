#!/usr/bin/env node

/**
 * 高级小程序二维码生成脚本
 * 支持配置文件和命令行参数
 * 使用方法：
 *   node generate-qrcode-advanced.js
 *   node generate-qrcode-advanced.js --config=custom-config.json
 *   node generate-qrcode-advanced.js --page=pages/tetris/tetris --scene=game=tetris
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value || true;
    }
  });
  return args;
}

/**
 * 加载配置文件
 */
function loadConfig(configPath = 'miniprogram-config.json') {
  try {
    if (!fs.existsSync(configPath)) {
      // 如果配置文件不存在，尝试使用示例配置
      const examplePath = 'miniprogram-config.example.json';
      if (fs.existsSync(examplePath)) {
        console.log(`⚠️  配置文件 ${configPath} 不存在，使用示例配置 ${examplePath}`);
        console.log('请复制示例配置文件并修改其中的 appId 和 appSecret');
        configPath = examplePath;
      } else {
        throw new Error(`配置文件 ${configPath} 不存在`);
      }
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // 验证必要的配置项
    if (!config.appId || !config.appSecret) {
      throw new Error('配置文件中缺少 appId 或 appSecret');
    }
    
    if (config.appId === 'your_app_id_here' || config.appSecret === 'your_app_secret_here') {
      throw new Error('请在配置文件中设置正确的 appId 和 appSecret');
    }
    
    console.log(`✅ 配置文件加载成功: ${configPath}`);
    return config;
    
  } catch (error) {
    console.error(`❌ 加载配置文件失败: ${error.message}`);
    throw error;
  }
}

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
 * 获取访问令牌（带缓存）
 */
let cachedToken = null;
let tokenExpireTime = 0;

async function getAccessToken(appId, appSecret, useCache = true) {
  // 检查缓存
  if (useCache && cachedToken && Date.now() < tokenExpireTime) {
    console.log('🔄 使用缓存的访问令牌');
    return cachedToken;
  }
  
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  
  try {
    console.log('🔑 正在获取访问令牌...');
    const response = await httpsRequest(url);
    const result = JSON.parse(response.data.toString());
    
    if (result.access_token) {
      console.log('✅ 访问令牌获取成功');
      
      // 缓存令牌（提前5分钟过期）
      cachedToken = result.access_token;
      tokenExpireTime = Date.now() + (result.expires_in - 300) * 1000;
      
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
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
  
  try {
    console.log(`🎯 正在生成小程序码: ${options.page || 'pages/index/index'}`);
    
    const response = await httpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
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
function saveImageToFile(imageBuffer, filename, outputDir = './images') {
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
 * 生成单个二维码
 */
async function generateSingleQRCode(config, qrConfig, accessToken) {
  const options = {
    scene: qrConfig.scene,
    page: qrConfig.page,
    ...config.qrCodeOptions
  };
  
  try {
    const imageBuffer = await generateQRCode(accessToken, options);
    const filePath = saveImageToFile(imageBuffer, qrConfig.filename, config.outputDir);
    
    return {
      success: true,
      name: qrConfig.name,
      filename: qrConfig.filename,
      filePath: filePath
    };
  } catch (error) {
    return {
      success: false,
      name: qrConfig.name,
      error: error.message
    };
  }
}

/**
 * 批量生成二维码
 */
async function generateBatchQRCodes(config) {
  console.log('🚀 开始批量生成小程序二维码\n');
  
  try {
    // 获取访问令牌
    const accessToken = await getAccessToken(config.appId, config.appSecret);
    
    console.log(`\n📋 准备生成 ${config.qrCodeConfigs.length} 个二维码:\n`);
    
    const results = [];
    
    // 逐个生成二维码
    for (const qrConfig of config.qrCodeConfigs) {
      console.log(`\n🎯 生成 ${qrConfig.name} (${qrConfig.page})`);
      
      const result = await generateSingleQRCode(config, qrConfig, accessToken);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${qrConfig.name} 生成成功`);
      } else {
        console.error(`❌ ${qrConfig.name} 生成失败: ${result.error}`);
      }
      
      // 避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 输出结果统计
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log('\n📊 生成结果统计:');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    
    if (successCount > 0) {
      console.log('\n🎉 生成的二维码文件:');
      results.filter(r => r.success).forEach(r => {
        console.log(`  - ${r.name}: ${r.filename}`);
      });
    }
    
    if (failCount > 0) {
      console.log('\n💥 失败的二维码:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('\n💥 批量生成过程中出现错误:', error.message);
    throw error;
  }
}

/**
 * 生成单个自定义二维码
 */
async function generateCustomQRCode(config, args) {
  console.log('🎯 生成自定义小程序二维码\n');
  
  try {
    // 获取访问令牌
    const accessToken = await getAccessToken(config.appId, config.appSecret);
    
    // 构建二维码配置
    const qrConfig = {
      name: args.name || '自定义二维码',
      scene: args.scene || 'from=custom',
      page: args.page || 'pages/index/index',
      filename: args.filename || `custom-qrcode-${Date.now()}.jpg`
    };
    
    console.log('配置信息:', JSON.stringify(qrConfig, null, 2));
    
    const result = await generateSingleQRCode(config, qrConfig, accessToken);
    
    if (result.success) {
      console.log('\n🎉 自定义二维码生成成功!');
      console.log(`文件路径: ${result.filePath}`);
    } else {
      console.error('\n💥 自定义二维码生成失败:', result.error);
    }
    
  } catch (error) {
    console.error('\n💥 生成过程中出现错误:', error.message);
    throw error;
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('🔧 小程序二维码生成工具\n');
  console.log('使用方法:');
  console.log('  node generate-qrcode-advanced.js                    # 批量生成（使用默认配置）');
  console.log('  node generate-qrcode-advanced.js --config=my.json   # 使用指定配置文件');
  console.log('  node generate-qrcode-advanced.js --page=pages/test/test --scene=test=1  # 生成单个自定义二维码');
  console.log('\n参数说明:');
  console.log('  --config     配置文件路径（默认: miniprogram-config.json）');
  console.log('  --page       小程序页面路径');
  console.log('  --scene      场景值参数');
  console.log('  --filename   输出文件名');
  console.log('  --name       二维码名称');
  console.log('  --help       显示帮助信息');
  console.log('\n配置文件示例: miniprogram-config.example.json\n');
}

/**
 * 主函数
 */
async function main() {
  const args = parseArgs();
  
  // 显示帮助
  if (args.help) {
    showHelp();
    return;
  }
  
  try {
    // 加载配置
    const configPath = args.config || 'miniprogram-config.json';
    const config = loadConfig(configPath);
    
    // 判断是批量生成还是单个生成
    if (args.page || args.scene) {
      // 生成单个自定义二维码
      await generateCustomQRCode(config, args);
    } else {
      // 批量生成二维码
      await generateBatchQRCodes(config);
    }
    
    console.log('\n📝 使用说明：');
    console.log('1. 将生成的二维码替换项目中的占位符图片');
    console.log('2. 用户可以扫码直接进入对应的小程序页面');
    console.log('3. 通过 scene 参数可以追踪用户来源\n');
    
  } catch (error) {
    console.error('\n💥 程序执行失败:', error.message);
    
    console.log('\n🔍 常见问题排查：');
    console.log('1. 检查配置文件中的 appId 和 appSecret 是否正确');
    console.log('2. 确保小程序已经发布（开发版无法生成正式二维码）');
    console.log('3. 检查页面路径是否存在于小程序中');
    console.log('4. 确保网络连接正常');
    console.log('5. 使用 --help 查看详细使用说明\n');
    
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAccessToken,
  generateQRCode,
  saveImageToFile,
  generateSingleQRCode,
  generateBatchQRCodes,
  loadConfig
};