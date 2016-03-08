# PKUwebmaster

PKU IPGW Chrome Extension, by Harttle, Rea and Mr.S. 

北京大学网关Chrome插件，欢迎Folk。

## 安装方式

### 从 Chrome 商店安装

> 可以访问Google的建议使用该方法安装，可自动更新最新版本。

前往 Chrome 扩展商店安装：https://chrome.google.com/webstore/detail/pkuwebmaster（北京大学网关插件）/bnlipdfmheddpljigcaaamjpnbhhklkb

### 从本地安装

1. [下载本仓库Zip包][zip]
2. 解压后找到`src/`文件夹
3. 打开[Chrome扩展程序页][ext]，从右上角打开『开发者模式』
4. 将`src`目录拖动到[Chrome扩展程序页][ext]

## 使用帮助

### 设置用户

在Chrome中右击插件图标，点击『选项』进入设置页面。设置用户名与密码。

### 连接与断开

* **连接**： 设置完成后，点击插件图标，选择『连接到免费』或『连接到收费』即可。
* **断开**： 设置完成后，点击插件图标，选择『断开全部连接』即可。

### 状态提示

> 连接状态提示可能不正确，只显示上次操作结果。详见： [Issue 1][is1]

点击插件按钮，最下方将显示上一次操作结果。另外不同状态下插件按钮也有区别：

* 『网关默认图标』：连接到免费
* 『绿色对号图标』：连接到收费
* 『红色叉形图标』：断开全部连接

## 开发者导引

### 文件目录

* src: 源码，可用来载入和安装

* bug: 历次bug反馈

* publish: 为历次发布版本

* resource: 为可能会用到的资源

### 调试引导

1. Git Clone（或fork后Clone）本仓库
2. 打开[Chrome扩展程序页][ext]，从右上角打开『开发者模式』
3. 将`src`目录拖动到[Chrome扩展程序页][ext]
4. 通过『检查视图： 背景页』可调试`background/index.js`，通过右击插件按钮的弹出可调式`popup/index.html`。
5. 更改文件并保存后，点击『重新加载』来重新加载插件。

[ext]: chrome://extensions/
[zip]: https://github.com/pku-birdmen/pkuwebmaster/archive/master.zip
[is1]: https://github.com/pku-birdmen/pkuwebmaster/issues/1
