# 部署到 GitHub Pages（静态托管）

> 目标：把 `部署-静态网站/` 发布成一个网址，手机/电脑打开即用。
> 本目录已经整理成「纯静态、全 ASCII 路径、首页为 index.html」，可直接上传。

---

## 一、准备

- 一个 GitHub 账号（免费）；
- 本目录内容：`index.html` `home.html` `math/` `cs408/` `docs/` `anki/` `.nojekyll`；
- 不需要安装任何构建工具，也不需要 Node / Python（本地预览除外）。

## 二、创建仓库并上传（任选一种）

### 方法 A：网页上传（最简单，不用 Git）

1. 打开 https://github.com/new ，仓库名填 `kaoyan-cards`（可自定义）；
2. 选择 **Public**（私有仓库的 Pages 需付费），点 **Create repository**；
3. 在仓库页点 **Add file → Upload files**；
4. 把 `部署-静态网站/` **里面的所有文件与文件夹**拖进去（注意：不要上传外层文件夹本身，要让 `index.html` 位于仓库根目录）；
5. 点 **Commit changes**。

### 方法 B：命令行（推荐，后续更新方便）

```bash
cd "考研知识点梳理/部署-静态网站"
git init
git add .
git commit -m "init: 考研知识点梳理"
git branch -M main
git remote add origin https://github.com/<你的用户名>/kaoyan-cards.git
git push -u origin main
```

> 若本机没配 SSH，用 HTTPS 地址 + Personal Access Token 作为密码即可。

## 三、开启 Pages

1. 进入仓库 → **Settings → Pages**；
2. **Source** 选 `Deploy from a branch`；
3. **Branch** 选 `main`，目录选 `/ (root)`，点 **Save**；
4. 等待 1–2 分钟，页面顶部出现：
   `Your site is live at https://<用户名>.github.io/kaoyan-cards/`

## 四、访问

| 页面 | 地址 |
|---|---|
| 科目选择（入口） | `https://<用户名>.github.io/kaoyan-cards/` |
| 数学应用 | `https://<用户名>.github.io/kaoyan-cards/math/app.html` |
| 408 应用 | `https://<用户名>.github.io/kaoyan-cards/cs408/app.html` |
| 文档 | `.../docs/guide-math.html` 等 |

打开首页后会自动跳到 `home.html`；也可把 `math/app.html` 直接收藏。

## 五、算法动画（本次新增）

408 的 36 张算法卡新增了「动画演示」：

- 卡片内先展示**算法代码区**（独立代码块，带行号）；
- 卡片**右下角**有 `▶ 动画演示` 按钮，点击进入播放器；
- 播放器左侧是动画、右侧是代码，底部有 **开始/暂停**、**下一步**、**重置**；
- 「下一步」逐行执行，**当前代码行标红**，上方同步显示数组/树/图的每一步状态；
- 覆盖：冒泡、插入、选择、希尔、快速、归并、堆排序、折半查找、KMP、二叉树四种遍历、BFS/DFS、拓扑排序、Dijkstra；
- 侧栏「🎬 算法动画」可直接打开动画库，共 17 个算法。

## 六、性能优化（首次加载）

部署版已拆分资源，卡片优先可用：

| 资源 | 大小 | 加载方式 |
|---|---|---|
| `cs408/app.html` | ~450 KB | 立即加载（含卡片数据） |
| `assets/app.js` | ~40 KB | 立即加载（预加载） |
| `assets/mathjax.js` | ~2.2 MB | 异步并行加载，公式就绪后自动渲染 |
| `assets/anim.js` | ~36 KB | 空闲时后台加载 |

- 打开页面先出卡片，公式随后补齐；动画模块最后加载；
- **动画未加载完时，点「算法动画」无反应**（入口显示为半透明加载态），加载完成后自动恢复；
- 更新时缓存参数会变，浏览器会拉取新文件；未变的部分走缓存。

## 七、本次新增（部署前请重新上传）

- **公式与代码标准化**：408 卡片中的 `O(n)`、`log₂n`、`⌊x⌋`、`2^n`、`a/b` 等已统一转为 LaTeX（MathJax 排版），代码用等宽代码块；
- **卡片状态徽标**：右上角显示 **新卡（蓝）/ 到期（红）/ 已排期（灰）**，列表左侧用同色圆点提示；
- **搜索兼容公式**：可直接搜 `O(n)`、`log2n` 等。

## 八、更新内容

改完 `考研知识点梳理/部署-静态网站/` 后重新执行：

```bash
git add .
git commit -m "update"
git push
```

Pages 会自动重新构建（1–2 分钟）。若页面没变，强制刷新（Mac：`Cmd+Shift+R`；手机：清缓存或换隐私窗口）。

## 九、常见问题

**1）404 / 页面空白**
- 确认 `index.html` 在仓库根目录，而不是在某个子文件夹里；
- Settings → Pages 里 Branch 是否为 `main` + `/ (root)`；
- 刚保存后等 1–2 分钟再刷新。

**2）中文文件名链接打不开**
- 本目录已全部改为 ASCII 路径（`math/`、`cs408/`、`docs/`），不会出现中文编码问题；
- 本地中文版（`考研知识点梳理/` 根目录）仅用于离线，不建议直接上传。

**3）Anki 卡组点击没下载**
- 浏览器可能直接打开二进制；右键「链接存储为」；或到 `anki/index.html` 逐个下载。

**4）进度会丢吗**
- 不会随部署丢失。进度存在**当前域名**的浏览器 localStorage；
- 换域名（如从 `github.io` 换到自定义域名）会视为新站点，需要重新学或导入之前的导出记录。

**5）仓库大小限制**
- Pages 站点建议 < 1 GB，单文件 < 100 MB；本目录约 8.6 MB，完全够用。

## 十、稳定性说明（重要）

**GitHub Pages 能保证稳定吗？不能“保证”。**

- 官方 SLA：GitHub Pages 属于免费服务，**没有可用性 SLA**；
- 国内网络：`github.io` 域名在部分地区/运营商会出现**间歇性慢或打不开**，GitHub 主站也常被干扰；
- 实测（本机、当前网络）：`pages.github.com`、`octocat.github.io` 约 0.7–1.7 秒可打开；`github.com` 主站偶发超时。

**建议的组合方案：**

| 方案 | 稳定性 | 成本 | 适合 |
|---|---|---|---|
| GitHub Pages | 中（国内波动） | 免费 | 个人自用、偶尔分享 |
| Cloudflare Pages | 较高 | 免费 | 想更稳、又不想备案 |
| Vercel / Netlify | 较高 | 免费额度 | 同上 |
| 腾讯云 COS / 阿里云 OSS + CDN | 高 | 几元/月 | 国内稳定访问、可绑自定义域名 |
| 本地离线文件 | 最高（不依赖网络） | 免费 | 通勤/无网环境 |

**最稳妥的用法**：GitHub Pages 作为“在线备份 + 手机随时打开”，同时保留本地 `考研知识点梳理/` 文件夹（U 盘/网盘各一份）。即使 Pages 打不开，本地版照样能用。

**想提升国内稳定性：**
1. 绑定自己的域名 + Cloudflare 代理（免费），比裸 `github.io` 稳一些；
2. 用 Cloudflare Pages 部署同一份目录（GitHub 仓库可直接连），国内可达性通常更好；
3. 对稳定性要求高时，改用国内对象存储 + CDN，但域名需备案。

> 结论：**GitHub Pages 适合“够用”，不适合“保证”。** 重要资料请始终保留本地副本。
