# 考研数学 · 公式与方法速查表

> 从 243 张知识卡片中抽出的「公式 + 方法」速查版：**公式卡 49 张 + 方法卡 56 张 = 105 张**。
> 用法：先默写，再对照；表格第二列给出条件、变形与典型用法，帮助把公式放回题型。

## 0. 速查索引

| 科目 | 章节 | 公式/方法卡 |
|---|---|---|
| 高等数学 | 极限与连续 | 6 |
| 高等数学 | 导数与微分 | 9 |
| 高等数学 | 中值定理与导数应用 | 8 |
| 高等数学 | 一元函数积分 | 13 |
| 高等数学 | 多元函数微分学 | 11 |
| 高等数学 | 常微分方程 | 12 |
| 高等数学 | 无穷级数 | 10 |
| 线性代数 | 行列式 | 9 |
| 线性代数 | 矩阵 | 8 |
| 线性代数 | 向量组 | 8 |
| 线性代数 | 线性方程组 | 3 |
| 线性代数 | 特征值与相似对角化 | 5 |
| 线性代数 | 二次型 | 3 |

## 高等数学

### 极限与连续（2 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **写出 $x\to0$ 时的常用等价无穷小（至少 7 组）。** | $\sin x\sim x$，$\tan x\sim x$，$\arcsin x\sim x$，$\arctan x\sim x$，$1-\cos x\sim\frac{x^2}{2}$，$\ln(1+x)\sim x$，$e^x-1\sim x$，$a^x-1\sim x\ln a$，$(1+x)^\alpha-1\sim\alpha x$，$x-\sin x\sim\frac{x^3}{6}$，$\tan x-x\sim\frac{x^3}{3}$，$x-\ln(1+x)\sim\frac{x^2}{2}$。 |
| **两个重要极限是什么？各自的变形如何使用？** | $\lim_{x\to0}\frac{\sin x}{x}=1,\qquad \lim_{x\to\infty}\left(1+\frac1x\right)^x=e$ 变形：$\lim_{x\to0}(1+x)^{1/x}=e$；$1^\infty$ 型统一用 $\lim u^v=\exp\big(\lim v(u-1)\big)$。 |

### 导数与微分（6 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **写出基本初等函数的导数公式（幂、指、对、三角、反三角）。** | $(x^\alpha)'=\alpha x^{\alpha-1}$，$(a^x)'=a^x\ln a$，$(e^x)'=e^x$，$(\ln x)'=\frac1x$，$(\log_a x)'=\frac{1}{x\ln a}$； $(\sin x)'=\cos x$，$(\cos x)'=-\sin x$，$(\tan x)'=\sec^2x$，$(\cot x)'=-\csc^2x$，$(\sec x)'=\sec x\tan x$，$(\csc x)'=-\csc x\cot x$； $(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$，$(\arccos x)'=-\frac{1}{\sqrt{1-x^2}}$，$(\arctan x)'=\frac{1}{1+x^2}$，$(\operatorname{arccot} x)'=-\frac{1}{1+x^2}$。 |
| **复合函数求导的链式法则是什么？** | 若 $y=f(u)$，$u=g(x)$，则 $\frac{dy}{dx}=f'(u)\,g'(x)$，即 $\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}$。 多层复合逐层乘下去，如 $y=f(g(h(x)))$：$y'=f'(g(h(x)))\cdot g'(h(x))\cdot h'(x)$。 |
| **参数方程 $\begin{cases}x=\varphi(t)\\ y=\psi(t)\end{cases}$ 的一阶、二阶导数公式是什么？** | $\frac{dy}{dx}=\frac{\psi'(t)}{\varphi'(t)},\qquad \frac{d^2y}{dx^2}=\frac{d}{dt}\!\left(\frac{\psi'(t)}{\varphi'(t)}\right)\Big/\varphi'(t)$ |
| **高阶导数的莱布尼茨公式是什么？** | $(uv)^{(n)}=\sum_{k=0}^{n}\binom{n}{k}u^{(n-k)}v^{(k)}$ 与二项式定理同构，用于 $x^m e^x$、$x^2\sin x$ 这类“多项式 × 初等函数”的 $n$ 阶导。 |
| **常见函数的 $n$ 阶导数公式有哪些？** | $(e^{ax})^{(n)}=a^ne^{ax}$；$(\sin ax)^{(n)}=a^n\sin(ax+\frac{n\pi}{2})$；$(\cos ax)^{(n)}=a^n\cos(ax+\frac{n\pi}{2})$； $\left(\frac{1}{x+a}\right)^{(n)}=\frac{(-1)^nn!}{(x+a)^{n+1}}$；$(\ln(1+x))^{(n)}=\frac{(-1)^{n-1}(n-1)!}{(1+x)^n}$（$n\ge1$）。 |
| **反函数求导公式是什么？** | 若 $y=f(x)$ 单调可导且 $f'(x)\neq0$，则其反函数 $x=f^{-1}(y)$ 可导，且$\frac{dx}{dy}=\frac{1}{f'(x)},\qquad \left(f^{-1}\right)'(y)=\frac{1}{f'(f^{-1}(y))}$ |

### 中值定理与导数应用（3 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **泰勒公式的佩亚诺余项与拉格朗日余项分别是什么？各用于什么场合？** | 佩亚诺：$f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+o((x-x_0)^n)$，用于**求极限**。 拉格朗日：$R_n=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}$，用于**估计误差、证明不等式**。 |
| **写出 $e^x,\ \sin x,\ \cos x,\ \ln(1+x),\ (1+x)^\alpha$ 的麦克劳林展开（到 $x^3$ 或通项）。** | $e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots$；$\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots$；$\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots$； $\ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots$（$-1<x\le1$）；$(1+x)^\alpha=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+\cdots$。 |
| **曲率与曲率半径的公式是什么？** | $K=\frac{\vert{}y''\vert{}}{\left(1+y'^2\right)^{3/2}},\qquad \rho=\frac1K=\frac{\left(1+y'^2\right)^{3/2}}{\vert{}y''\vert{}}$参数方程：$K=\frac{\vert{}x'y''-y'x''\vert{}}{(x'^2+y'^2)^{3/2}}$。 |

### 一元函数积分（7 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **变上限积分函数的性质是什么？** | 设 $\Phi(x)=\int_a^x f(t)dt$： ① $f$ 可积时 $\Phi$ 连续； ② $f$ 连续时 $\Phi$ 可导且 $\Phi'(x)=f(x)$。 复合形式：$\frac{d}{dx}\int_{a(x)}^{b(x)}f(t)dt=f(b(x))b'(x)-f(a(x))a'(x)$。 |
| **牛顿-莱布尼茨公式的内容与使用前提是什么？** | 若 $f$ 在 $[a,b]$ 连续，$F$ 是 $f$ 的任一原函数，则$\int_a^b f(x)dx=F(b)-F(a)$前提：$f$ 连续（或可积且 $F$ 连续）。 |
| **分部积分公式是什么？如何选择 $u$ 与 $dv$？** | $\int u\,dv=uv-\int v\,du$选 $u$ 的口诀“**反对幂指三**”（反三角、对数、幂、指数、三角），排前者作 $u$。 |
| **华里士（Wallis）公式是什么？** | $I_n=\int_0^{\pi/2}\sin^nx\,dx=\int_0^{\pi/2}\cos^nx\,dx=\begin{cases}\frac{n-1}{n}\cdot\frac{n-3}{n-2}\cdots\frac12\cdot\frac{\pi}{2}, & n\text{ 偶}\\[4pt]\frac{n-1}{n}\cdot\frac{n-3}{n-2}\cdots\frac23\cdot1, & n\text{ 奇}\end{cases}$ |
| **旋转体体积的圆盘法与壳法公式分别是什么？** | 绕 $x$ 轴：$V=\pi\int_a^b f^2(x)dx$（圆盘）； 绕 $y$ 轴（柱壳）：$V=2\pi\int_a^b x\,f(x)dx$； 参数方程：$V=\pi\int_\alpha^\beta y^2(t)x'(t)dt$。 |
| **平面曲线弧长公式是什么（直角坐标、参数、极坐标）？** | 直角坐标：$s=\int_a^b\sqrt{1+y'^2}\,dx$； 参数：$s=\int_\alpha^\beta\sqrt{x'^2+y'^2}\,dt$； 极坐标：$s=\int_{\theta_1}^{\theta_2}\sqrt{r^2+r'^2}\,d\theta$。 |
| **$\Gamma$ 函数的定义与性质是什么？与 Wallis 公式有何联系？** | $\Gamma(s)=\int_0^{+\infty}x^{s-1}e^{-x}dx$（$s>0$），满足 $\Gamma(s+1)=s\Gamma(s)$，$\Gamma(n+1)=n!$，$\Gamma(\frac12)=\sqrt\pi$。 $\int_0^{\pi/2}\sin^nx\,dx=\frac{\sqrt\pi\,\Gamma(\frac{n+1}{2})}{2\,\Gamma(\frac{n}{2}+1)}$。 |

### 多元函数微分学（7 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **多元复合函数求导的链式法则如何写（以 $z=f(u,v),u=u(x,y),v=v(x,y)$ 为例）？** | $\frac{\partial z}{\partial x}=f_u\frac{\partial u}{\partial x}+f_v\frac{\partial v}{\partial x},\qquad \frac{\partial z}{\partial y}=f_u\frac{\partial u}{\partial y}+f_v\frac{\partial v}{\partial y}$ |
| **隐函数 $F(x,y,z)=0$ 确定 $z=z(x,y)$ 时，$\frac{\partial z}{\partial x}$ 与 $\frac{\partial z}{\partial y}$ 怎么求？** | $\frac{\partial z}{\partial x}=-\frac{F_x}{F_z},\qquad \frac{\partial z}{\partial y}=-\frac{F_y}{F_z}\qquad(F_z\neq0)$ |
| **空间曲面的切平面与法线方程怎么写？** | 曲面 $F(x,y,z)=0$ 在 $P_0$ 处法向量 $\mathbf n=(F_x,F_y,F_z)\vert{}_{P_0}$： 切平面：$F_x(x-x_0)+F_y(y-y_0)+F_z(z-z_0)=0$； 法线：$\frac{x-x_0}{F_x}=\frac{y-y_0}{F_y}=\frac{z-z_0}{F_z}$。 |
| **二重积分在直角坐标与极坐标下的公式分别是什么？** | 直角：$\iint_D f\,dxdy=\int_a^b dx\int_{y_1(x)}^{y_2(x)}f\,dy$（X 型）或先 $x$ 后 $y$（Y 型）。 极坐标：$\iint_D f\,dxdy=\int_{\theta_1}^{\theta_2}d\theta\int_{r_1(\theta)}^{r_2(\theta)}f(r\cos\theta,r\sin\theta)\,r\,dr$。 |
| **格林公式的内容与使用条件是什么？** | 设 $D$ 为平面有界闭区域，边界 $L$ 取**正向**（逆时针），$P,Q$ 在 $D$ 上有连续一阶偏导，则$\oint_L Pdx+Qdy=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dxdy$ |
| **高斯公式与斯托克斯公式的内容分别是什么？** | 高斯：$\oiint_\Sigma P\,dydz+Q\,dzdx+R\,dxdy=\iiint_\Omega\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)dV$（$\Sigma$ 取外侧）。 斯托克斯：$\oint_\Gamma Pdx+Qdy+Rdz=\iint_\Sigma\begin{vmatrix}dydz&dzdx&dxdy\\ \partial_x&\partial_y&\partial_z\\ P&Q&R\end{vmatrix}$。 |
| **散度与旋度的定义及物理意义是什么？** | $\operatorname{div}\mathbf F=\nabla\cdot\mathbf F=\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}$（源强）； $\operatorname{rot}\mathbf F=\nabla\times\mathbf F$（涡旋强度）。 |

### 常微分方程（2 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **一阶线性微分方程 $y'+P(x)y=Q(x)$ 的通解公式是什么？** | $y=e^{-\int Pdx}\left(\int Q\,e^{\int Pdx}dx+C\right)$其中 $e^{\int Pdx}$ 为**积分因子**。 |
| **二阶常系数齐次线性方程 $y''+py'+qy=0$ 的通解如何由特征根写出？** | 特征方程 $r^2+pr+q=0$： ① 两相异实根 $r_1,r_2$：$y=C_1e^{r_1x}+C_2e^{r_2x}$； ② 二重根 $r$：$y=(C_1+C_2x)e^{rx}$； ③ 共轭复根 $\alpha\pm\beta i$：$y=e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)$。 |

### 无穷级数（4 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **$p$ 级数与几何级数的敛散性分别如何？** | $\sum_{n=1}^\infty\frac1{n^p}$：$p>1$ 收敛，$p\le1$ 发散（$p=1$ 为调和级数）。 $\sum_{n=0}^\infty aq^n$：$\vert{}q\vert{}<1$ 收敛于 $\frac{a}{1-q}$，$\vert{}q\vert{}\ge1$ 发散（$q=-1$ 振荡）。 |
| **幂级数 $\sum a_n(x-x_0)^n$ 的收敛半径公式是什么？** | $R=\lim_{n\to\infty}\left\vert{}\frac{a_n}{a_{n+1}}\right\vert{}\quad\text{或}\quad R=\frac{1}{\limsup\sqrt[n]{\vert{}a_n\vert{}}}$收敛区间为 $(x_0-R,x_0+R)$，端点需**单独判断**。 |
| **$\frac{1}{1-x}$、$\ln(1+x)$、$\arctan x$ 的展开式分别是什么？** | $\frac{1}{1-x}=\sum_{n=0}^\infty x^n$（$\vert{}x\vert{}<1$）； $\ln(1+x)=\sum_{n=1}^\infty\frac{(-1)^{n-1}}{n}x^n$（$-1<x\le1$）； $\arctan x=\sum_{n=0}^\infty\frac{(-1)^n}{2n+1}x^{2n+1}$（$\vert{}x\vert{}\le1$）。 |
| **傅里叶级数的系数公式是什么（周期 $2\pi$）？** | $a_0=\frac1\pi\int_{-\pi}^{\pi}f(x)dx,\quad a_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\cos nx\,dx,\quad b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin nx\,dx$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^\infty(a_n\cos nx+b_n\sin nx)$ |


## 线性代数

### 行列式（7 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **行列式按行（列）展开定理是什么？** | $\vert{}A\vert{}=\sum_{j=1}^{n}a_{ij}A_{ij}\quad(\text{按第 }i\text{ 行展开}),\qquad \sum_{j=1}^{n}a_{ij}A_{kj}=0\ (i\neq k)$其中 $A_{ij}=(-1)^{i+j}M_{ij}$ 为代数余子式。 |
| **克拉默法则的内容与适用条件是什么？** | 若 $A\mathbf x=\mathbf b$ 且 $\vert{}A\vert{}\neq0$，则 $x_j=\frac{\vert{}A_j\vert{}}{\vert{}A\vert{}}$，$A_j$ 是把 $A$ 的第 $j$ 列换成 $\mathbf b$ 所得矩阵。 |
| **范德蒙德行列式的值与形式是什么？** | $V_n=\begin{vmatrix}1&1&\cdots&1\\ x_1&x_2&\cdots&x_n\\ \vdots&&&\vdots\\ x_1^{n-1}&x_2^{n-1}&\cdots&x_n^{n-1}\end{vmatrix}=\prod_{1\le i<j\le n}(x_j-x_i)$ |
| **三阶行列式的对角线法则（萨吕斯法则）如何写？** | $\vert{}A\vert{}=a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}-a_{13}a_{22}a_{31}-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}$ |
| **上（下）三角、对角、副对角行列式的值分别是什么？** | 上/下三角与对角行列式 $=$ 主对角线元素之积； 副对角行列式 $=(-1)^{\frac{n(n-1)}{2}}a_{1n}a_{2,n-1}\cdots a_{n1}$。 |
| **分块矩阵的行列式有哪些常用公式？** | $\begin{vmatrix}A&O\\O&B\end{vmatrix}=\vert{}A\vert{}\vert{}B\vert{},\qquad \begin{vmatrix}A&C\\O&B\end{vmatrix}=\vert{}A\vert{}\vert{}B\vert{},\qquad \begin{vmatrix}O&A\\B&O\end{vmatrix}=(-1)^{mn}\vert{}A\vert{}\vert{}B\vert{}$（$A$ 为 $m$ 阶、$B$ 为 $n$ 阶）。 |
| **$\vert{}kA\vert{}$、$\vert{}AB\vert{}$、$\vert{}A^{-1}\vert{}$、$\vert{}A^*\vert{}$ 分别等于什么？** | $\vert{}kA\vert{}=k^n\vert{}A\vert{}$（$A$ 为 $n$ 阶）；$\vert{}AB\vert{}=\vert{}A\vert{}\vert{}B\vert{}$；$\vert{}A^{-1}\vert{}=\frac{1}{\vert{}A\vert{}}$；$\vert{}A^*\vert{}=\vert{}A\vert{}^{n-1}$。 |

### 矩阵（6 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **转置运算的性质有哪些？** | $(A^T)^T=A$；$(A+B)^T=A^T+B^T$；$(kA)^T=kA^T$；$(AB)^T=B^TA^T$；$(A^{-1})^T=(A^T)^{-1}$。 |
| **伴随矩阵的定义与三条核心公式是什么？** | $A^*=(A_{ij})^T$（代数余子式转置）。核心：$AA^*=A^*A=\vert{}A\vert{}I,\qquad A^{-1}=\frac{1}{\vert{}A\vert{}}A^*,\qquad \vert{}A^*\vert{}=\vert{}A\vert{}^{n-1}$ |
| **矩阵秩的不等式有哪些？** | $r(A+B)\le r(A)+r(B)$；$r(AB)\le\min\{r(A),r(B)\}$；$r(A)+r(B)-n\le r(AB)$（西尔维斯特）； $AB=0$ ⟹ $r(A)+r(B)\le n$；$r(A)=r(A^T)=r(A^TA)$。 |
| **分块矩阵的乘法与求逆有哪些常用结论？** | $\begin{pmatrix}A&O\\O&B\end{pmatrix}^{-1}=\begin{pmatrix}A^{-1}&O\\O&B^{-1}\end{pmatrix}$； $\begin{pmatrix}O&A\\B&O\end{pmatrix}^{-1}=\begin{pmatrix}O&B^{-1}\\A^{-1}&O\end{pmatrix}$；$\begin{pmatrix}A&C\\O&B\end{pmatrix}^{-1}$ 需用分块消元（舒尔补）。 |
| **矩阵的迹有哪些性质？** | $\operatorname{tr}(A+B)=\operatorname{tr}A+\operatorname{tr}B$；$\operatorname{tr}(kA)=k\operatorname{tr}A$；$\operatorname{tr}(AB)=\operatorname{tr}(BA)$；$\operatorname{tr}(A)=\sum\lambda_i$；$\operatorname{tr}(P^{-1}AP)=\operatorname{tr}A$。 |
| **$\begin{pmatrix}a&b\\c&d\end{pmatrix}$ 的逆矩阵公式是什么？** | $\begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\frac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}\qquad(ad-bc\neq0)$ |

### 向量组（4 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **过渡矩阵与坐标变换公式是什么？** | 若基 $B_1=(\alpha_1,\dots,\alpha_n)$ 到 $B_2=(\beta_1,\dots,\beta_n)$ 的过渡矩阵为 $P$，即 $(\beta_1,\dots,\beta_n)=(\alpha_1,\dots,\alpha_n)P$，则坐标满足 $\mathbf x_{B_1}=P\mathbf x_{B_2}$。 |
| **向量组 $\alpha_1,\dots,\alpha_s$ 与 $\beta_1,\dots,\beta_t$ 的秩之间有什么不等式？** | $r(\alpha_1,\dots,\alpha_s,\beta_1,\dots,\beta_t)\le r(\alpha)+r(\beta)$； 若 $(II)$ 可由 $(I)$ 线性表示，则 $r(II)\le r(I)$。 |
| **向量空间维数公式（和空间与交空间）是什么？** | $\dim(V_1+V_2)=\dim V_1+\dim V_2-\dim(V_1\cap V_2)$ |
| **齐次线性方程组解空间的维数公式是什么？** | $A$ 为 $m\times n$ 矩阵，$A\mathbf x=\mathbf0$ 的解空间（零空间）维数为 $n-r(A)$，基础解系含 $n-r(A)$ 个向量。 |

### 特征值与相似对角化（1 条）

| 公式 / 结论 | 条件、变形与用法 |
|---|---|
| **特征值的两条“和与积”公式是什么？** | $\sum_{i=1}^{n}\lambda_i=\operatorname{tr}A,\qquad \prod_{i=1}^{n}\lambda_i=\vert{}A\vert{}$ |


## 附：最易混的 12 组公式

| 易混点 | 正确写法 | 常见错误 |
|---|---|---|
| $|kA|$ | $k^n|A|$ | 写成 $k|A|$ |
| $(AB)^T$ | $B^TA^T$ | 写成 $A^TB^T$ |
| $(AB)^{-1}$ | $B^{-1}A^{-1}$ | 写成 $A^{-1}B^{-1}$ |
| $r(AB)$ | $\le\min\{r(A),r(B)\}$ | 误以为 $=r(A)r(B)$ |
| $A$ 可对角化 | 几何重数 = 代数重数 | 只看“有 $n$ 个特征值” |
| 正定 | 各阶顺序主子式全 $>0$ | 只验 $|A|>0$ |
| 极值第二条件 | $f''(x_0)\neq0$ 才可判 | $f''(x_0)=0$ 仍下结论 |
| 洛必达 | 每步都需是 $\frac00$ 或 $\frac\infty\infty$ | 非未定式也用 |
| 等价无穷小 | 只能替换乘除因子 | 加减项中直接替换 |
| 二重积分极坐标 | $dxdy=r\,dr\,d\theta$ | 漏掉 $r$ |
| 级数收敛 | 通项趋于 0 只是必要条件 | 由 $u_n\to0$ 断定收敛 |
| 矩阵方程 | $AX=B$ 有解 $\Leftrightarrow r(A)=r(A|B)$ | 直接写 $X=A^{-1}B$ |

---

> 完整推导、应用提醒与串联关系见《考研数学-高数线代知识卡片总表.md》；
> 刷题请用三个 `.apkg` 卡组（高数 / 线代 / 串联）。
