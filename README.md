<h1 align="center">
  <img src="https://github.com/JAVClub/core/raw/master/docs/logo.png" alt="JAVClub" width="200">
  <br>JAVClub</br>
</h1>

## Features

- 支持在线播放
- 全自动爬取、下载、上传、处理
- 视频、图片数据不占用本地空间
- 代理后速度播放速度可观, 不代理亦可看
- 多用户系统, 可以与的好基友一起穿越
- 可从公开/私有站点下载数据, 多种选择
- Docker 自动部署
- 支持收藏夹
- ~~面熟的话大概可以直接白嫖~~

## 简介

这是一个涩情系列 Repos, 包含三个子项目, 分别是 [fetcher](https://github.com/JAVClub/fetcher)、[web](https://github.com/JAVClub/web) 还有这个项目

稍微逛了一下 GitHub, 发现现有的 JAV 数据库都仅限于存储 Metadata(JAV 元数据[车牌号、cover 等等]) 及没啥用的种子信息, 没法做到在线观看, 所以这就是一个集搜集、下载、存储、观看、管理为一体的东西了

<details>

  <summary>往下看之前请先确保你已满 18 周岁</summary>

  ![Are you 18](https://github.com/JAVClub/core/raw/master/docs/are-you-18.jpg)

</details>

## TODO

- [ ] 公告栏
- [ ] 用户系统
  - [ ] 邀请注册


## DEMO

因为项目的特殊性就不提供在线 DEMO 了, 仅放一些图片 #SFW

<details>

  <summary>页面截图 (点击展开)</summary>

  ![Home](https://github.com/JAVClub/core/raw/master/docs/Home.png)

  ![Metadata List](https://github.com/JAVClub/core/raw/master/docs/MetadataList.png)

  ![Metadata Info Top](https://github.com/JAVClub/core/raw/master/docs/MetadataInfoTop.png)

  ![Metadata Info Bottom](https://github.com/JAVClub/core/raw/master/docs/MetadataInfoBottom.png)

  ![Bookmark List](https://github.com/JAVClub/core/raw/master/docs/BookmarkList.png)

  ![Bookmark Info](https://github.com/JAVClub/core/raw/master/docs/BookmarkInfo.png)

  ![Tag List](https://github.com/JAVClub/core/raw/master/docs/TagList.png)

  ![Star List](https://github.com/JAVClub/core/raw/master/docs/StarList.png)

  ![Series List](https://github.com/JAVClub/core/raw/master/docs/SeriesList.png)

  ![Profile](https://github.com/JAVClub/core/raw/master/docs/Profile.png)

</details>

## 部署

**Docker 部署方式请[出门左拐](https://github.com/JAVClub/docker)**

部署之前请确保你拥有/完成以下能力/事情:
- 一台有稳定国际互联网的服务器
- Node.js / JavaScript 基础
- 基本的报错阅读能力
- Linux 基础
- 阅读过《[提问的智慧](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)》
- ~~可以克制住自己想把作者往死里揍心情的能力~~

### Fetcher 部署

参考 [JAVClub/fetcher](https://github.com/JAVClub/fetcher)

### Core&Web 部署

#### Docker

参考 [core - JAVClub/docker](https://github.com/JAVClub/docker/tree/master/core)

#### 非 Docker

##### 拉取

请确保主机已安装 Node.js 环境 (版本 10.0+)

```bash
git clone https://github.com/JAVClub/core.git JAVClub_core
cd JAVClub_core
cp config/dev.example.json config/dev.json
npm i
```

##### 配置文件

<details>

  <summary>配置文件 (点击展开)</summary>

```json
{
    "system": {
        "logLevel": "debug",
        "port": 3000,
        "path": "/api",
        "allowChangeUsername": false,
        "userMaxBookmarkNum": 10,
        "userMaxBookmarkItemNum": 100,
        "corsDomain": [
            "https://yourdomain.com"
        ],
        "searchParmaNum": 3
    },
    "database": {
        "connectionLimit": 5,
        "host": "127.0.0.1",
        "user": "javclub",
        "password": "javclub",
        "database": "javclub"
    },
    "importer": {
        "settings": {
            "googleDrive": {
                "queueNum": 5
            }
        },
        "cron": [
            {
                "driveId": 1,
                "interval": 36000000,
                "doFull": true
            }
        ]
    },
    "proxy": [
        "https://your.img.proxy/"
    ]
}

```
</details>

- **system**
  - path: API 监听的路径
  - corsDomain: cors 头允许的域名
  - searchParmaNum: 搜索允许的关键词数量
- **importer**
  - settings.googleDrive.queueNum: (Int) Importer 导入时队列并行数
  - cron[].driverId: (Int) 数据库 `drivers` 表中条目的 ID
  - cron[].interval: (Int) 每隔多少毫秒 扫描一次这个云端硬盘
  - cron[].doFull: (Boolean) 启动程序后第一次运行时是否扫描云盘全部内容 (建议第一次导入完成后关闭)
- **proxy** (Array) 用于代理 Metadata Cover 及 Star Cover 的反代 URL (请求格式: `https://your.img.proxy/https://url.to/imgage.png`)

按照提示修改 `config/dev.json` 并更改相关配置即可

其中 `cron` 字段的相关设定可以暂时不用填写, 下文会有详细讲解
至于 `proxy` 字段, 如果不想部署图片代理的话也可以直接填写 `[""]`

##### 数据库

因程序不打算弄太复杂, 所以没有安装界面, 请自行导入数据表

推荐使用 PMA 可视化操作

数据库文件: https://github.com/JAVClub/docker/blob/master/core/sql.db

导入后会自动添加第一个用户, 账号密码: `admin/123456`

##### 配置

core 中的数据来源是 fetcher 上传至 Google Drive 中的数据, 请在使用前 1-2 天部署好 fetcher 以获取足够的数据

首先要做的是往数据库里添加有关 Google Drive 的信息, SQL 命令如下
```sql
INSERT INTO `drivers` (`id`, `name`, `driverType`, `driverData`, `isEnable`, `createTime`, `updateTime`) VALUES
(1, 'My first drive', 'gd', '{\"oAuth\":{\"client_id\":\"【your_client_here】\",\"client_secret\":\"【your_client_secret_here】\",\"redirect_uri\":\"urn:ietf:wg:oauth:2.0:oob\",\"token\":{\"access_token\":\"【your_access_token_here_optional】\",\"refresh_token\":\"【your_refresh_token_here】\",\"scope\":\"https://www.googleapis.com/auth/drive\",\"token_type\":\"Bearer\",\"expiry_date\":1583679345619}},\"drive\":{\"driveId\":\"【your_drive_or_folder_id_here】\"},\"encryption\":{\"secret\":\"【path_ase_secret】\",\"server\":\"【your_gd_proxy_server_here】"}}', 1, '1583679345619', '1583679345619');
```

`driverData` 是这部分的核心, 看起来挺乱的, 这里给一个格式化后的方便理解
```json
{
    "oAuth":{
        "client_id":"xxx.apps.googleusercontent.com",
        "client_secret":"",
        "redirect_uri":"urn:ietf:wg:oauth:2.0:oob",
        "token":{
            "access_token":"",
            "refresh_token":"",
            "scope":"https://www.googleapis.com/auth/drive",
            "token_type":"Bearer",
            "expiry_date":1583679345619
        }
    },
    "drive":{
        "driveId":"987b3d98q7deuiedsr"
    },
    "encryption":{
        "secret":"secret",
        "server":"https://proxy.abc.workers.dev,https://proxy.def.workers.dev"
    }
}
```
- oAuth 中的顾名思义就是 Google API 的鉴权信息, 按照你的凭证填写即可
- drive.driveId 是你的云端硬盘 ID, 也就是云端硬盘根目录浏览器地址栏的那一长串东西
- encryption 是给 Workers 使用的选项
  - secret 请随便填写串字符, 部署 Workers 时使用的 `aes_password` 请与此处的保持一致
  - server 是你部署的 Workers 的地址, 多个地址用 `,` 隔开

成功添加数据库条目之后, `id` 字段的值就是[上文](#配置文件)中 `cron[].driverId` 以及马上提到的该写的东西

下一步就是要告诉程序你添加了这个硬盘并且希望扫描/导入这个硬盘中的内容
那么就只需要在 `dev.json` 中的 `cron` 字段按[上文](#配置文件)中所述添加相应内容即可

到现在 core 应该已经配置完成并可以工作了

##### 配置 WebUI

到现在只剩下 WebUI 程序就可以正常工作了, 不过关于 Nginx 的使用方法在这里就不多讲了, 只描述应该怎么做

首先是拉取并构建 Web UI
```bash
git clone https://github.com/JAVClub/web.git JAVClub_web
cd JAVClub_web
cp src/config.example.js src/config.js
npm i && npm run build
```
运行完成之后前端资源就已经构建完成了, 位于 `./dist` 目录下
这时候只需要在 Nginx 中将除 `/api` 以外的请求重定向至 `./dist/index.html` 文件即可
至于 `/api` 的请求请转发给 core 核心

##### 启动:

`NODE_ENV=dev node src/app.js`

没有意外的话现在 Web UI 和 API 服务器应该已经启动并正常工作了, 可以观察一下输出日志中有没有错误 (如果有务必将错误日志提交至 Issue

如果有任何不明白的欢迎开 Issue 提问

### 完成

现在 JAVClub 已经成功运行起来了

那么在这里祝你身体健康

## 后续

先感谢看完这篇废话连篇的使用文档, 有很多东西可能没有说明白, 如果有问题请尽管开 IS 来轰炸我吧

正常来讲现在整套系统应该已经在正常工作了, 如果没有请再次检查是否漏掉了任何一个步骤

如果还是嫌麻烦也可以直接邮箱来硬肛，不保证看得到+发号就是了 (提盘来见就最好了 hhh

## FAQ

- 遇到一大堆问题没办法解决
可以先参考一下 [core#11](https://github.com/JAVClub/core/issues/11) [core#12](https://github.com/JAVClub/core/issues/12) [fetcher#3](https://github.com/JAVClub/fetcher/issues/3#issuecomment-623198549)
这里是被踩的最多的坑, 可以看看有没有自己遇到的问题

- Docker 部署的相关问题
有关 Docker 部署的任何问题请提交 Issue 或者直接发送邮件询问

- 没有 M-Team 的账号怎么办
现在重写后的 fetcher 也已经支持 OneJAV 了, 所以不需要 M-Team 账号也可以正常使用了

- 这玩意儿真的有人成功部署过吗
说实话我也不知道, 我已经尽最大努力简化安装过程&写说明文档了, 如果还是有不懂的可以提交 Issue

## 捐赠

嘛写这个虽然不算麻烦但还是挺繁琐的, 所以如果想请咱喝一杯咖啡也是可以哒

用[爱发电](https://afdian.net/@isXiaoLin) (雾

## 免责声明

本程序仅供学习了解, 请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源

使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责
