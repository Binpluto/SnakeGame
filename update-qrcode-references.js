#!/usr/bin/env node

/**
 * 自动更新网页中的二维码引用脚本
 * 在生成真实二维码后运行此脚本，自动更新所有网页文件中的二维码路径
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_FILE = './miniprogram-config.json';
const FILES_TO_UPDATE = [
  {
    file: './index.html',
    oldPath: 'images/miniprogram-qrcode.svg',
    newPath: 'images/miniprogram-index-qrcode.svg',
    description: '主页面二维码'
  },
  {
    file: './hey-welcome/vielspass.html',
    oldPath: '../images/miniprogram-qrcode.svg',
    newPath: '../images/miniprogram-index-qrcode.svg',
    description: '游戏选择页二维码'
  },
  {
    file: './miniprogram-entry.js',
    oldPath: 'images/miniprogram-qrcode.svg',
    newPath: 'images/miniprogram-index-qrcode.svg',
    description: '小程序入口组件二维码'
  }
];

/**
 * 检查配置文件是否已正确配置
 */
function checkConfig() {
  // 检查是否为演示模式
  const isDemoMode = process.argv.includes('--demo') || fs.existsSync('./images/miniprogram-index-qrcode.svg');
  
  if (isDemoMode) {
    console.log('🎨 检测到演示模式，跳过配置检查');
    return true;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (config.appId === 'your_app_id_here' || config.appSecret === 'your_app_secret_here') {
      console.log('❌ 请先在 miniprogram-config.json 中配置正确的 AppID 和 AppSecret');
      console.log('📖 参考文档：如何生成真实二维码.md');
      console.log('💡 或者运行演示模式: node update-qrcode-references.js --demo');
      return false;
    }
    return true;
  } catch (error) {
    console.log('❌ 无法读取配置文件:', error.message);
    return false;
  }
}

/**
 * 检查二维码文件是否存在
 */
function checkQRCodeFiles() {
  const qrCodeFile = './images/miniprogram-index-qrcode.svg';
  if (!fs.existsSync(qrCodeFile)) {
    console.log('❌ 未找到二维码文件:', qrCodeFile);
    console.log('💡 请先运行: node generate-demo-qrcode.js 或 node generate-qrcode-advanced.js');
    return false;
  }
  return true;
}

/**
 * 更新单个文件中的二维码引用
 */
function updateFile(fileConfig) {
  try {
    if (!fs.existsSync(fileConfig.file)) {
      console.log(`⚠️  文件不存在: ${fileConfig.file}`);
      return false;
    }

    let content = fs.readFileSync(fileConfig.file, 'utf8');
    const originalContent = content;

    // 替换二维码路径
    content = content.replace(new RegExp(fileConfig.oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fileConfig.newPath);

    if (content !== originalContent) {
      fs.writeFileSync(fileConfig.file, content, 'utf8');
      console.log(`✅ 已更新 ${fileConfig.description}: ${fileConfig.file}`);
      return true;
    } else {
      console.log(`ℹ️  ${fileConfig.description} 无需更新: ${fileConfig.file}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ 更新文件失败 ${fileConfig.file}:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔄 开始更新网页中的二维码引用...');
  console.log('');

  // 检查配置
  if (!checkConfig()) {
    process.exit(1);
  }

  // 检查二维码文件
  if (!checkQRCodeFiles()) {
    process.exit(1);
  }

  console.log('✅ 配置检查通过，开始更新文件...');
  console.log('');

  // 更新所有文件
  let successCount = 0;
  for (const fileConfig of FILES_TO_UPDATE) {
    if (updateFile(fileConfig)) {
      successCount++;
    }
  }

  console.log('');
  console.log(`🎉 更新完成！成功更新 ${successCount}/${FILES_TO_UPDATE.length} 个文件`);
  console.log('');
  console.log('📝 更新内容：');
  console.log('   • 将占位符 SVG 二维码替换为真实的 JPG 二维码');
  console.log('   • 所有网页现在显示真实的小程序二维码');
  console.log('');
  console.log('🌐 刷新浏览器查看更新后的二维码！');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { updateFile, checkConfig, checkQRCodeFiles };