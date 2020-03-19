# JAVClub

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

部署这套系统至少需要两台服务器, 其中一台是用来运行 [fetcher](https://github.com/JAVClub/fetcher) 的, 因为要持续跑满宽带及 CPU, 所以不建议在上面建站(fetcher 的具体部署方式参考其 README); 第二台是网站 / API / 数据库服务器, 因为目前数据库查询及写入优化做得不是很好, 建议 2C 以上

### 配置

<details>

  <summary>配置文件 (点击展开)</summary>

```json
{
    "system": {
        "logLevel": "debug",
        "port": 3000
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

如果有意向的话可以给咱发邮件嘛 (i#amxiaol.in (小声

## 免责声明

本程序仅供学习了解, 请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源

使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责
