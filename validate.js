const fs = require('fs-extra');
const path = require('path');

// 配置项
const CONFIG = {
  // 输出目录
  distDir: 'dist',
  // 必须包含的文件
  requiredFiles: [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'icons/icon.svg'
  ]
};

// 日志记录
const logStream = fs.createWriteStream('build.log', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

// 验证插件完整性
async function validateExtension() {
  try {
    log('开始验证插件完整性...');
    
    // 1. 检查输出目录是否存在
    if (!await fs.exists(CONFIG.distDir)) {
      throw new Error(`输出目录 ${CONFIG.distDir} 不存在`);
    }
    
    // 2. 检查必须包含的文件
    log('检查必须包含的文件...');
    const missingFiles = [];
    for (const file of CONFIG.requiredFiles) {
      const filePath = path.join(CONFIG.distDir, file);
      if (!await fs.exists(filePath)) {
        missingFiles.push(file);
      } else {
        log(`  - ✅ ${file}`);
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`缺少必要文件: ${missingFiles.join(', ')}`);
    }
    
    // 3. 验证manifest.json格式
    log('验证manifest.json格式...');
    const manifestPath = path.join(CONFIG.distDir, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // 检查manifest.json必填字段
    const requiredManifestFields = [
      'manifest_version',
      'name',
      'version',
      'description',
      'permissions',
      'background',
      'content_scripts',
      'action',
      'icons'
    ];
    
    const missingManifestFields = requiredManifestFields.filter(field => !manifest[field]);
    if (missingManifestFields.length > 0) {
      throw new Error(`manifest.json缺少必填字段: ${missingManifestFields.join(', ')}`);
    }
    
    log('  - ✅ manifest.json格式正确');
    log(`  - 插件名称: ${manifest.name}`);
    log(`  - 插件版本: ${manifest.version}`);
    log(`  - 清单版本: ${manifest.manifest_version}`);
    
    // 4. 检查图标文件
    log('检查图标文件...');
    const iconsDir = path.join(CONFIG.distDir, 'icons');
    const iconFiles = await fs.readdir(iconsDir);
    if (iconFiles.length === 0) {
      throw new Error('图标目录为空');
    }
    log(`  - ✅ 图标文件: ${iconFiles.join(', ')}`);
    
    // 5. 检查ZIP包是否存在
    log('检查ZIP安装包...');
    const distFiles = await fs.readdir(CONFIG.distDir);
    const zipFiles = distFiles.filter(file => file.endsWith('.zip'));
    
    if (zipFiles.length === 0) {
      throw new Error('未找到ZIP安装包');
    }
    
    for (const zipFile of zipFiles) {
      const zipPath = path.join(CONFIG.distDir, zipFile);
      const stats = await fs.stat(zipPath);
      log(`  - ✅ ${zipFile} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
    
    // 6. 检查版本信息文档
    log('检查版本信息文档...');
    const versionInfoPath = path.join(CONFIG.distDir, 'version-info.json');
    if (await fs.exists(versionInfoPath)) {
      log('  - ✅ version-info.json');
    } else {
      log('  - ⚠️ version-info.json 不存在（可选）');
    }
    
    log('插件完整性验证通过！');
    log('打包成功，插件可以正常安装和运行。');
    
    // 7. 输出安装说明
    log('\n--- 安装说明 ---');
    log('1. 打开Chrome浏览器');
    log('2. 输入地址: chrome://extensions/');
    log('3. 开启右上角"开发者模式"');
    log('4. 点击"加载已解压的扩展程序"');
    log('5. 选择dist目录或直接拖拽ZIP文件');
    log('6. 插件安装完成，可以开始使用！');
    
    logStream.end();
    return true;
    
  } catch (error) {
    log(`验证失败: ${error.message}`);
    logStream.end();
    process.exit(1);
  }
}

// 执行验证
validateExtension();
