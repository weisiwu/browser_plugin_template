# 简介

## 开发命令
**1、测试/debug**
``` shell
npm run test
```
运行后，会先编译然后在本地启动 dev-server 并打开插件配置页（主提功能），启用 `hmr`(热刷新 hot module replace)。

**2、打包产物**
打包产物前，先升级 `package.json` 中的 `version` 字段。然后运行
``` shell
npm run build
```
最终产物会在 `build` 目录下刚设置的 `version` 的子目录下，主要包含文件有两个  
1. xxv1.3.0.crx
2. xxv1.3.0.zip

**2、部署**
**Notice** 发布产物前，一定记得先打包，也就是上一步的`build`。然后再运行命令
``` shell
npm run deploy
```

## 各目录介绍
**assets**: 存放插件使用的非代码物料  
**template**: 存放插件使用的html类物料  
**styles**: 存放的是插件样式文件  
**src**: 存放插件的逻辑文件（主要是js）  
**scripts**: 存放的是打包、测试、发布的脚本文件  
**dest**: 编译后产出的文件存放目录  
**pem**: 存放的是打包浏览器插件（crx）的公钥证书文件  
**auto_update**: 依赖的子模块

## 开发参考文档

1. [插件 Manifest 文档](https://developer.chrome.com/docs/extensions/mv3/manifest/)