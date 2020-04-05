<h1 align="center">
  <img src="https://github.com/JAVClub/core/raw/master/docs/logo.png" alt="JAVClub" width="200">
  <br>JAVClub</br>
</h1>

来前排挂个人 (逃

![人(¿)](https://i.loli.net/2020/04/05/pbMzYViheFC4EHv.png)

## Features

- 支持在线播放
- 全自动爬取、下载、上传、处理
- 视频、图片数据不占用本地空间
- 代理后速度播放速度可观, 不代理亦可看
- 多用户系统, 可以与的好基友一起穿越 (不是
- 支持收藏夹
- ~~面熟的话可以直接白嫖~~白嫖 (逃 -> [Google Form](https://forms.gle/SphJGNRxbjjhf4bU8)

## 简介

嘛这是一个星际涩情(划掉)系列 Repos, 包含三个子项目, 分别是 [fetcher](https://github.com/JAVClub/fetcher)、[web](https://github.com/JAVClub/web) 还有这个项目, 用处嘛就是你们想得那样啦

稍微逛了一下 GitHub, 貌似现有的 JAV 数据库都仅限于存储 Metadata(JAV 元数据[车牌号、cover 等等]) 及没啥用的种子信息, 没法做到在线观看, 所以这就是一个集搜集、下载、存储、观看、管理为一体的东西啦 (不是 (大雾

<details>

  <summary>往下看之前请先确保你已满 18 周岁</summary>

  ![Are you 18](https://github.com/JAVClub/core/raw/master/docs/are-you-18.jpg)

</details>


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

部署之前请确保你拥有/完成以下能力/事情:
- Docker 容器的部署(Optional)
- Docker Compose 编排的部署(Optional)
- Node.js / Javascript 基础
- 基本的报错阅读能力
- Linux 基础
- 阅读过《[提问的智慧](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)》
- ~~可以克制住自己想把作者往死里揍心情的能力~~

~~因为原来写的大家反映看不懂, 所以就来写一个 Step by step 的好了~~

写了一小段斟酌了半天, 最后还是选择放弃了, 下面是部署的基本流程, 如果中间有什么不明白的欢迎 Telegram / Email 来骚扰我

~~非常希望有个语文好的 julao 来帮忙补全一下文档~~

~~如果实在需要可以用[爱发电](https://afdian.net/@isXiaoLin) (大雾~~

~~真不是因为懒是语文真的差劲 (((逃~~

### Google OAuth

因为与本项目不怎么相关就不详细介绍了, 请利用搜索引擎查找适合自己的教程

本项目需要的参数: `client_id` `client_secret` `access_token` `refresh_token`

### Option 1: Docker

现在本项目已经支持 Docker 了, 现在来稍微讲一下怎么和隔壁 [Docker LEMP](https://github.com/metowolf/docker-lemp) 快速搭建服务端

请确保 Docker 以及 Docker Compose 已安装

首先肯定是拉取一梭子了 

```bash
git clone https://github.com/metowolf/docker-lemp.git
cd docker-lemp

cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
```

然后编辑 `.env` 更改数据库密码及根据个人喜好定制环境版本, 本项目不需要 Redis 以及 PHP, 如果担心性能消耗可以在 `docker-compose.yml` 中删除相关条目

接下来来拉取本项目

回到用户根目录, 继续拉取一梭子

```bash
git clone https://github.com/JAVClub/core.git JAVClub_core
cd JAVClub_core

cp config/dev.example.json config/dev.json
cp docker-compose.example.yml docker-compose.yml
```

完成后根据[配置](#配置)文档块配置好 `config/dev.json` 即可(MySQL 数据库地址为 `mysql`, 用户名、密码及数据库为你自定义的内容)

还需要做的是配置 Nginx 的转发, Nginx 的作用是提供 WEB UI 以及反代 API, 这里仅提供一段示例 `Nginx conf`

```nginx
server {
    listen 80;

    server_name xxx.net;
    root /var/www/JAVClub_web/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://javclub_core_core_1:3000;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Host              $http_host;
        proxy_set_header   X-Real-IP         $remote_addr;
    }

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|flv|mp4|ico)$ {
        expires 30d;
        access_log off;
    }
    location ~ .*\.(js|css)?$ {
        expires 7d;
        access_log off;
    }
    location ~ /\.ht {
        deny all;
    }
}
```

最后一步就是配置数据库的默认数据了, 参考[数据库](#数据库)文档块配置即可

最最后依次在 `docker-lemp` 和 `JAVClub_core` 目录中输入 `sudo docker-compose up -d` 即可

未完待续.....

**以下为原文档**

### 配置

<details>

  <summary>配置文件 (点击展开)</summary>

```json
{
    "system": {
        "logLevel": "debug",
        "port": 3000,
        "allowChangeUsername": false,
        "userMaxBookmarkNum": 10,
        "userMaxBookmarkItemNum": 100
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
                "doFull": false
            }
        ]
    },
    "proxy": [
        "https://your.img.proxy/"
    ]
}
```
</details>

- **importer**
  - settings.googleDrive.queueNum: (Int) Importer 导入时队列并行数
  - cron[].driverId: (Int) 数据库 `drivers` 表中添加的 Driver ID
  - cron[].interval: (Int) 每隔多少毫秒运行一次该 Driver 的 Importer
  - cron[].doFull: (Boolean) 启动程序后第一次运行时是否扫描全部内容 (建议导入完成后关闭)
- **proxy** (Array) 用于代理 Metadata Cover 及 Star Cover 的反代 URL (请求格式: `https://your.img.proxy/https://url.to/imgage.png`)

将 `config/dev.example.json` 修改为 `config/dev.json` 并更改配置即可

### 数据库

因程序比较简洁, 不准备制作安装界面, 请自行导入数据表

推荐使用 PMA 可视化操作

导入成功后需要加入默认数据, 分别是 user 表、drivers 表, 具体请参考下文

<details>

  <summary>数据表 (点击展开)</summary>

  ```sql
  CREATE TABLE `bookmarks` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `uid` tinyint(4) DEFAULT NULL,
      `name` tinytext,
      `createTime` tinytext,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `bookmarks_mapping` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `bookmarkId` tinyint(4) DEFAULT NULL,
      `metadataId` int(11) DEFAULT NULL,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `drivers` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `name` tinytext NOT NULL,
      `driverType` tinytext NOT NULL,
      `driverData` longtext NOT NULL,
      `isEnable` tinyint(4) DEFAULT '0',
      `createTime` tinytext NOT NULL,
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `files` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `driverId` tinyint(4) NOT NULL,
      `storageData` tinytext NOT NULL,
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `ignore` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `data` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `metadatas` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `title` text NOT NULL,
      `companyName` tinytext NOT NULL,
      `companyId` tinytext NOT NULL,
      `posterFileURL` text,
      `releaseDate` tinytext NOT NULL,
      `screenshotFilesURL` text,
      `version` tinyint(4) DEFAULT '1',
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `series` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `name` text NOT NULL,
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `series_mapping` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `metadataId` int(11) DEFAULT NULL,
      `seriesId` int(11) DEFAULT NULL,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `stars` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `name` tinytext NOT NULL,
      `photoURL` text,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `stars_mapping` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `metadataId` int(11) DEFAULT NULL,
      `starId` int(11) DEFAULT NULL,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `tags` (
      `id` smallint(6) unsigned NOT NULL AUTO_INCREMENT,
      `name` tinytext,
      `updateTime` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `tags_mapping` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `metadataId` int(11) NOT NULL,
      `tagId` smallint(6) NOT NULL,
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `users` (
      `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `username` tinytext,
      `password` tinytext,
      `token` tinytext,
      `updateTime` tinytext,
      `lastSeen` tinytext,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE `videos` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `metadataId` int(11) NOT NULL,
      `videoFileId` int(11) DEFAULT NULL,
      `isHiden` char(1) DEFAULT '0',
      `infoFileId` int(11) NOT NULL,
      `videoMetadata` json NOT NULL,
      `version` tinyint(4) DEFAULT '1',
      `storyboardFileIdSet` json NOT NULL,
      `updateTime` tinytext NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `id` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  ```

</details>

### 安装

core 的入口文件是 src/app.js, 开启时建议使用 dev 模式 (`NODE_ENV=dev node src/app.js`) 以便于获取详细调试信息

**Option 1:** Docker 安装

请确保主机已安装 Docker 环境且已按上述步骤配置完程序

```bash
git clone https://github.com/JAVClub/core.git JAVClub_core
cd JAVClub_core
sudo docker pull javclub/core
sudo docker create -e NODE_ENV=dev -v ./config:/usr/src/app/config --name javclub_core javclub/core
```

**Option 2:** 直接安装

请确保主机已安装 Node.js 环境 (版本 10.0+)

```bash
git clone https://github.com/JAVClub/core.git JAVClub_core
cd JAVClub_core
npm i
```

执行完上述命令后根据选择配置的不同运行 `NODE_ENV=dev/stage node src/app.js` 即可

### 使用

core 中的数据来源是 fetcher 上传至 Google Drive 中的数据, 请在使用前 1-2 天部署好 fetcher 以获取足够的数据

**使用前准备:**
- 向数据库中 `drivers` 表中插入数据, 参考如下, 替换其中以 `【】` 包裹的内容即可 (目前仅支持 Google Drive) (【your_gd_proxy_server_here】的内容请参考 [workers](https://github.com/JAVClub/workers), 需要 `https://` 以及 `/`, 多个地址请用 `,` 分割)
  ```sql
  INSERT INTO `drivers` (`id`, `name`, `driverType`, `driverData`, `isEnable`, `createTime`, `updateTime`) VALUES
  (1, '1', 'gd', '{\"oAuth\":{\"client_id\":\"【your_client_here】\",\"client_secret\":\"【your_client_secret_here】\",\"redirect_uri\":\"urn:ietf:wg:oauth:2.0:oob\",\"token\":{\"access_token\":\"【your_access_token_here_optional】\",\"refresh_token\":\"【your_refresh_token_here】\",\"scope\":\"https://www.googleapis.com/auth/drive\",\"token_type\":\"Bearer\",\"expiry_date\":1583679345619}},\"drive\":{\"driveId\":\"【your_drive_or_folder_id_here】\"},\"encryption\":{\"secret\":\"【path_ase_secret】\",\"server\":\"【your_gd_proxy_server_here】"}}', 1, '【timestanp_in_ms_here】', '【timestanp_in_ms_here】');
  ```
- 向数据库 `users` 表中插入默认用户, 密码加密算法为 Bcrypt(round=10), 添加时可使用默认密码(123456) `$2b$10$pOavdaA2Pb4HXTCqecCbA.wepz0ArXjrNAn35mSwB55K43HVSdGbi` 及猫滚键盘 token, 登录后密码即可自动刷新
- 若还未导入数据请确保在 `dev.json` 中添加了 `cron` 段, 以便于程序在启动时自动扫描并导入数据
- 确保在服务器上可正常运行下列命令并正常输出:
  ```bash
  curl -I https://www.google.com
  curl -I https://www.javbus.com
  ```

如果上述的 Checklist 已经完成, 那么恭喜, 很快新世界的大门就要敞开了! (大雾

**启动服务端及与 WEB 端整合**

如果之前的步骤都有好好完成的话, 那现在剩下的就是启动服务器端以及和 WEB 端整合了

#### 启动:

- Docker: `sudo docker start javclub_core`
- 单机: `NODE_ENV=dev node src/app.js`

没有意外的话现在服务端和 API 服务器应该已经启动并正常工作了, 可以观察一下输出日志中有没有错误 (如果有一定一定一定要来提 IS 哇 (超大声

WEB 端请求的 API 路径默认为 `/api`, 所以只需要在 Nginx 中将 `/api` 代理到 `core:3000` 即可, 详细操作可以至搜索引擎处搜索 `nginx proxy_pass`

### 完成

恭喜现在 JAVClub 已经成功运行起来啦!

那么在这里祝你身体健康 (溜

## 后续

先感谢看完这篇废话连篇的使用文档, 有很多东西可能没有说明白, 如果有问题请尽管开 IS 来轰炸我吧 (不是, 也请有技术的小伙伴多多提交 PR (溜

正常来讲现在整套系统应该已经在正常工作了, 如果没有请再次检查是否漏掉了任何一个步骤

嘛如果实在是不想那么麻烦也可以来使用我们的私有服务(DEMO 的站点), 为了避免被 jvbao 所以现在是自荐加入, Twitter 上被我关注的小伙伴是默认有名额的, 直接私信 username 给咱就可获取到账号一枚(哆啦A梦式), 当然如果觉得跟我很脸熟的话也可以直接在 Telegram 私信我, 会视情况发账号哒

## 捐赠

嘛写这个虽然不算麻烦但还是挺繁琐的, 所以如果想请咱喝一杯咖啡也是可以哒

用[爱发电](https://afdian.net/@isXiaoLin) (大雾

## 免责声明

本程序仅供学习了解, 请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源

使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责
