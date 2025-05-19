
const fs = require('fs');
const path = require('path');

// 修改项目级别的build.gradle文件
const projectBuildGradlePath = path.join(__dirname, '../android/build.gradle');

try {
  let content = fs.readFileSync(projectBuildGradlePath, 'utf8');
  
  // 检查是否已经添加了阿里云镜像
  if (!content.includes('maven.aliyun.com')) {
    // 找到repositories块并添加阿里云Maven仓库
    content = content.replace(
      /repositories\s*{/g, 
      `repositories {
        // 阿里云Maven镜像
        maven { url 'https://maven.aliyun.com/repository/public/' }
        maven { url 'https://maven.aliyun.com/repository/google/' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin/' }`
    );
    
    fs.writeFileSync(projectBuildGradlePath, content);
    console.log('成功添加阿里云Maven镜像到项目build.gradle文件');
  } else {
    console.log('阿里云Maven镜像已经存在于项目build.gradle文件中');
  }
} catch (error) {
  console.error('修改项目build.gradle文件时出错:', error);
}

// 修改settings.gradle文件
const settingsGradlePath = path.join(__dirname, '../android/settings.gradle');

try {
  let content = fs.readFileSync(settingsGradlePath, 'utf8');
  
  // 检查是否已经添加了阿里云镜像
  if (!content.includes('maven.aliyun.com')) {
    // 添加阿里云镜像的配置
    let mirrorConfig = `
pluginManagement {
    repositories {
        // 阿里云Maven镜像
        maven { url 'https://maven.aliyun.com/repository/public/' }
        maven { url 'https://maven.aliyun.com/repository/google/' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin/' }
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
`;
    
    // 如果文件已经包含pluginManagement，我们需要替换它而不是添加
    if (content.includes('pluginManagement')) {
      content = content.replace(/pluginManagement\s*{[\s\S]*?}/m, mirrorConfig.trim());
    } else {
      content = mirrorConfig + content;
    }
    
    fs.writeFileSync(settingsGradlePath, content);
    console.log('成功添加阿里云Maven镜像到settings.gradle文件');
  } else {
    console.log('阿里云Maven镜像已经存在于settings.gradle文件中');
  }
} catch (error) {
  console.error('修改settings.gradle文件时出错:', error);
}

// 修改gradle.properties文件，添加中文支持和一些优化设置
const gradlePropertiesPath = path.join(__dirname, '../android/gradle.properties');

try {
  let content = fs.readFileSync(gradlePropertiesPath, 'utf8');
  
  // 添加额外的优化设置
  const optimizationSettings = `
# 使用阿里云镜像
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.jvmargs=-Xmx3072m -XX:MaxPermSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.enableR8=true`;
  
  // 检查是否已经添加了这些设置
  let needToAddSettings = false;
  const settingsToCheck = [
    'org.gradle.daemon=true',
    'org.gradle.parallel=true',
    'org.gradle.configureondemand=true'
  ];
  
  for (const setting of settingsToCheck) {
    if (!content.includes(setting)) {
      needToAddSettings = true;
      break;
    }
  }
  
  if (needToAddSettings) {
    content += optimizationSettings;
    fs.writeFileSync(gradlePropertiesPath, content);
    console.log('成功添加优化设置到gradle.properties文件');
  } else {
    console.log('优化设置已经存在于gradle.properties文件中');
  }
} catch (error) {
  console.error('修改gradle.properties文件时出错:', error);
}

console.log('阿里云Maven镜像配置完成！请重新同步你的Android项目。');
