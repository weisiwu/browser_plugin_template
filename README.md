# 1、前置依赖

**1、安装依赖**

```shell
npm install
```

# 2、脚本

```shell
npm run start # 调试开发
npm run start:debug # 调试开发+首行断点
npm run pack # js文件编译打包
npm run build # 插件所有物料打包crx+zip(开发者模式安装)
npm run build:debug # 插件所有物料打包crx+zip+首行断点
npm run deploy # 部署插件到发布平台
```

# 3、目录

**assets**: 存放插件使用的非代码物料  
**template**: 存放插件使用的html类物料  
**styles**: 存放的是插件样式文件  
**src**: 存放插件的逻辑文件（主要是js）  
**scripts**: 存放的是打包、测试、发布的脚本文件  
**dest**: 编译后产出的文件存放目录  
**pem**: 存放的是打包浏览器插件（crx）的公钥证书文件  
**auto_update**: 依赖的子模块

# 4、参考文档

1. [插件 Manifest 文档](https://developer.chrome.com/docs/extensions/mv3/manifest/)

插件icon推荐使用[icon生成器](https://www.logosc.cn/logo)生成
