/* 算法动画引擎：代码逐行高亮 + 可视化 */
(function () {
  'use strict';

  const A = {};
  const BASE = [7, 3, 9, 1, 5, 8, 2, 6, 4];
  const $ = (s, el) => (el || document).querySelector(s);

  // ---------------------------------------------------------------- helpers
  function snap(arr, extra) {
    return Object.assign({ kind: 'array', arr: arr.slice() }, extra || {});
  }
  function step(steps, line, note, viz) {
    steps.push({ line: line, note: note, viz: viz });
  }
  function swap(a, i, j) {
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }

  // ---------------------------------------------------------------- 排序
  A.bubble = {
    title: '冒泡排序', group: '排序', kind: 'array',
    code: [
      'void bubbleSort(int a[], int n) {',
      '  for (int i = 0; i < n - 1; i++) {',
      '    bool swapped = false;',
      '    for (int j = 0; j < n - 1 - i; j++) {',
      '      if (a[j] > a[j + 1]) {',
      '        swap(a[j], a[j + 1]);',
      '        swapped = true;',
      '      }',
      '    }',
      '    if (!swapped) break;',
      '  }',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [], n = a.length;
      step(s, 1, '从第 1 趟开始，每趟把最大的元素“冒”到末尾', snap(a, { i: 0 }));
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        step(s, 2, '第 ' + (i + 1) + ' 趟：swapped = false', snap(a, { i: i, sortedFrom: n - i }));
        for (let j = 0; j < n - 1 - i; j++) {
          step(s, 3, '比较 a[' + j + '] 与 a[' + (j + 1) + ']', snap(a, { i: i, j: j, comparing: [j, j + 1], sortedFrom: n - i }));
          if (a[j] > a[j + 1]) {
            step(s, 4, 'a[' + j + '] > a[' + (j + 1) + ']，需要交换', snap(a, { i: i, j: j, comparing: [j, j + 1], sortedFrom: n - i }));
            swap(a, j, j + 1);
            swapped = true;
            step(s, 5, '交换后：' + a[j] + ' 与 ' + a[j + 1] + ' 归位', snap(a, { i: i, j: j, comparing: [j, j + 1], sortedFrom: n - i }));
          }
        }
        step(s, 8, swapped ? '本趟发生了交换，继续下一趟' : '本趟没有交换，数组已有序，提前结束', snap(a, { i: i, sortedFrom: n - i - 1 }));
        if (!swapped) break;
      }
      step(s, 11, '排序完成：' + a.join(' '), snap(a, { sortedFrom: 0 }));
      return s;
    }
  };

  A.insertion = {
    title: '直接插入排序', group: '排序', kind: 'array',
    code: [
      'void insertionSort(int a[], int n) {',
      '  for (int i = 1; i < n; i++) {',
      '    int key = a[i];',
      '    int j = i - 1;',
      '    while (j >= 0 && a[j] > key) {',
      '      a[j + 1] = a[j];',
      '      j--;',
      '    }',
      '    a[j + 1] = key;',
      '  }',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [], n = a.length;
      step(s, 1, '从第 2 个元素开始，依次插入前面已有序的部分', snap(a, { i: 1 }));
      for (let i = 1; i < n; i++) {
        const key = a[i];
        step(s, 2, '取出 key = a[' + i + '] = ' + key, snap(a, { i: i, key: i, sortedTo: i }));
        let j = i - 1;
        step(s, 3, '从 j = ' + j + ' 开始向前比较', snap(a, { i: i, j: j, key: i }));
        while (j >= 0 && a[j] > key) {
          step(s, 4, 'a[' + j + '] = ' + a[j] + ' > key，后移', snap(a, { i: i, j: j, key: i }));
          a[j + 1] = a[j];
          j--;
          step(s, 5, '元素后移一位，j 减 1', snap(a, { i: i, j: j, key: i }));
        }
        a[j + 1] = key;
        step(s, 8, '把 key 放到位置 ' + (j + 1), snap(a, { i: i, j: j, key: j + 1, sortedTo: i + 1 }));
      }
      step(s, 10, '排序完成：' + a.join(' '), snap(a, { sortedTo: n }));
      return s;
    }
  };

  A.selection = {
    title: '简单选择排序', group: '排序', kind: 'array',
    code: [
      'void selectionSort(int a[], int n) {',
      '  for (int i = 0; i < n - 1; i++) {',
      '    int min = i;',
      '    for (int j = i + 1; j < n; j++)',
      '      if (a[j] < a[min]) min = j;',
      '    if (min != i) swap(a[i], a[min]);',
      '  }',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [], n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        step(s, 2, '第 ' + (i + 1) + ' 趟：假设 a[' + i + '] 最小', snap(a, { active: [i], min: min, sortedTo: i }));
        for (let j = i + 1; j < n; j++) {
          step(s, 3, '比较 a[' + j + '] 与当前最小值 a[' + min + ']', snap(a, { active: [i], j: j, min: min, comparing: [j, min], sortedTo: i }));
          if (a[j] < a[min]) {
            min = j;
            step(s, 4, '发现更小值，min 更新为 ' + j, snap(a, { active: [i], j: j, min: min, sortedTo: i }));
          }
        }
        if (min !== i) {
          swap(a, i, min);
          step(s, 5, '把最小值换到位置 ' + i, snap(a, { active: [i], min: min, sortedTo: i + 1 }));
        } else {
          step(s, 5, 'a[' + i + '] 已是最小，无需交换', snap(a, { active: [i], sortedTo: i + 1 }));
        }
      }
      step(s, 7, '排序完成：' + a.join(' '), snap(a, { sortedTo: n }));
      return s;
    }
  };

  A.shell = {
    title: '希尔排序', group: '排序', kind: 'array',
    code: [
      'void shellSort(int a[], int n) {',
      '  for (int gap = n / 2; gap > 0; gap /= 2) {',
      '    for (int i = gap; i < n; i++) {',
      '      int key = a[i], j = i - gap;',
      '      while (j >= 0 && a[j] > key) {',
      '        a[j + gap] = a[j];',
      '        j -= gap;',
      '      }',
      '      a[j + gap] = key;',
      '    }',
      '  }',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [], n = a.length;
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        step(s, 1, '增量 gap = ' + gap + '，对相隔 gap 的元素做插入排序', snap(a, { gap: gap }));
        for (let i = gap; i < n; i++) {
          const key = a[i];
          let j = i - gap;
          step(s, 3, '取出 a[' + i + '] = ' + key + '，与前面相隔 ' + gap + ' 的元素比较', snap(a, { gap: gap, active: [i], key: i }));
          while (j >= 0 && a[j] > key) {
            step(s, 4, 'a[' + j + '] > key，后移 gap 位', snap(a, { gap: gap, j: j, comparing: [j, j + gap] }));
            a[j + gap] = a[j];
            j -= gap;
            step(s, 5, '后移完成，j = ' + j, snap(a, { gap: gap, j: j }));
          }
          a[j + gap] = key;
          step(s, 8, 'key 放到位置 ' + (j + gap), snap(a, { gap: gap, active: [j + gap] }));
        }
      }
      step(s, 11, '排序完成：' + a.join(' '), snap(a, {}));
      return s;
    }
  };

  A.quick = {
    title: '快速排序（Lomuto 划分）', group: '排序', kind: 'array',
    code: [
      'void quickSort(int a[], int low, int high) {',
      '  if (low >= high) return;',
      '  int pivot = a[high], i = low - 1;',
      '  for (int j = low; j < high; j++) {',
      '    if (a[j] <= pivot) {',
      '      i++; swap(a[i], a[j]);',
      '    }',
      '  }',
      '  swap(a[i + 1], a[high]);',
      '  int p = i + 1;',
      '  quickSort(a, low, p - 1);',
      '  quickSort(a, p + 1, high);',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [];

      function qs(low, high) {
        if (low >= high) {
          if (low === high) step(s, 1, '区间只剩一个元素，天然有序', snap(a, { range: [low, high] }));
          return;
        }
        const pivot = a[high];
        step(s, 2, '取 a[' + high + '] = ' + pivot + ' 作为基准', snap(a, { range: [low, high], pivot: high }));
        let i = low - 1;
        for (let j = low; j < high; j++) {
          step(s, 3, '比较 a[' + j + '] = ' + a[j] + ' 与基准 ' + pivot, snap(a, { range: [low, high], pivot: high, i: i, j: j, comparing: [j] }));
          if (a[j] <= pivot) {
            i++;
            if (i !== j) swap(a, i, j);
            step(s, 5, 'a[' + j + '] ≤ 基准，交换到左区，i = ' + i, snap(a, { range: [low, high], pivot: high, i: i, j: j }));
          }
        }
        swap(a, i + 1, high);
        step(s, 8, '基准归位到位置 ' + (i + 1), snap(a, { range: [low, high], pivot: i + 1, i: i + 1 }));
        qs(low, i);
        qs(i + 2, high);
      }
      qs(0, a.length - 1);
      step(s, 12, '排序完成：' + a.join(' '), snap(a, {}));
      return s;
    }
  };

  A.merge = {
    title: '归并排序', group: '排序', kind: 'array',
    code: [
      'void mergeSort(int a[], int l, int r) {',
      '  if (l >= r) return;',
      '  int m = (l + r) / 2;',
      '  mergeSort(a, l, m);',
      '  mergeSort(a, m + 1, r);',
      '  merge(a, l, m, r);',
      '}',
      'void merge(int a[], int l, int m, int r) {',
      '  int tmp[], i = l, j = m + 1, k = 0;',
      '  while (i <= m && j <= r)',
      '    tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];',
      '  while (i <= m) tmp[k++] = a[i++];',
      '  while (j <= r) tmp[k++] = a[j++];',
      '  for (k = 0; k < r - l + 1; k++) a[l + k] = tmp[k];',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [];

      function ms(l, r) {
        if (l >= r) return;
        const m = (l + r) >> 1;
        step(s, 2, '把区间 [' + l + ',' + r + '] 从中间 ' + m + ' 分开', snap(a, { range: [l, r] }));
        ms(l, m);
        ms(m + 1, r);
        step(s, 5, '合并 [' + l + ',' + m + '] 与 [' + (m + 1) + ',' + r + ']', snap(a, { range: [l, r] }));
        const tmp = [];
        let i = l, j = m + 1;
        while (i <= m && j <= r) {
          step(s, 10, '比较 ' + a[i] + ' 与 ' + a[j] + '，取较小者放入临时数组', snap(a, { range: [l, r], comparing: [i, j], merged: tmp.length }));
          if (a[i] <= a[j]) tmp.push(a[i++]); else tmp.push(a[j++]);
        }
        while (i <= m) tmp.push(a[i++]);
        while (j <= r) tmp.push(a[j++]);
        for (let k = 0; k < tmp.length; k++) a[l + k] = tmp[k];
        step(s, 13, '把临时数组写回原数组', snap(a, { range: [l, r], sortedTo: r + 1 }));
      }
      ms(0, a.length - 1);
      step(s, 14, '排序完成：' + a.join(' '), snap(a, { sortedTo: a.length }));
      return s;
    }
  };

  A.heap = {
    title: '堆排序（大根堆）', group: '排序', kind: 'array',
    code: [
      'void heapSort(int a[], int n) {',
      '  for (int i = n / 2 - 1; i >= 0; i--)',
      '    siftDown(a, i, n);',
      '  for (int end = n - 1; end > 0; end--) {',
      '    swap(a[0], a[end]);',
      '    siftDown(a, 0, end);',
      '  }',
      '}',
      'void siftDown(int a[], int i, int n) {',
      '  while (2 * i + 1 < n) {',
      '    int c = 2 * i + 1;',
      '    if (c + 1 < n && a[c + 1] > a[c]) c++;',
      '    if (a[i] >= a[c]) break;',
      '    swap(a[i], a[c]); i = c;',
      '  }',
      '}'
    ],
    build() {
      const a = BASE.slice(), s = [], n = a.length;
      const hv = (extra) => Object.assign({ kind: 'heap', arr: a.slice() }, extra || {});
      function sift(i, end, phase) {
        while (2 * i + 1 < end) {
          let c = 2 * i + 1;
          step(s, 10, '结点 ' + i + ' 的左孩子是 ' + c, hv({ heapEnd: end, active: [i], comparing: [c] }));
          if (c + 1 < end && a[c + 1] > a[c]) {
            c++;
            step(s, 11, '右孩子更大，选右孩子 ' + c, hv({ heapEnd: end, active: [i], comparing: [c] }));
          }
          if (a[i] >= a[c]) {
            step(s, 12, '父结点不小于孩子，下沉结束', hv({ heapEnd: end, active: [i] }));
            break;
          }
          swap(a, i, c);
          step(s, 13, '交换父子结点，继续向下调整', hv({ heapEnd: end, active: [c] }));
          i = c;
        }
      }
      step(s, 1, '从最后一个非叶结点开始建堆', hv({ phase: 'build' }));
      for (let i = (n >> 1) - 1; i >= 0; i--) {
        step(s, 2, '对结点 ' + i + ' 下沉，构造大根堆', hv({ active: [i], phase: 'build' }));
        sift(i, n, 'build');
      }
      step(s, 3, '大根堆建成，堆顶是最大值', hv({ root: true }));
      for (let end = n - 1; end > 0; end--) {
        swap(a, 0, end);
        step(s, 4, '堆顶与末尾交换，最大值 ' + a[end] + ' 归位', hv({ sortedTo: end, heapEnd: end }));
        sift(0, end, 'sort');
      }
      step(s, 7, '排序完成：' + a.join(' '), hv({ sortedTo: 0 }));
      return s;
    }
  };

  // ---------------------------------------------------------------- 查找
  A.binary = {
    title: '折半查找', group: '查找', kind: 'array',
    code: [
      'int binarySearch(int a[], int n, int key) {',
      '  int low = 0, high = n - 1;',
      '  while (low <= high) {',
      '    int mid = (low + high) / 2;',
      '    if (a[mid] == key) return mid;',
      '    else if (a[mid] < key) low = mid + 1;',
      '    else high = mid - 1;',
      '  }',
      '  return -1;',
      '}'
    ],
    build() {
      const a = [1, 3, 5, 7, 9, 11, 13, 15, 17], key = 13, s = [];
      let low = 0, high = a.length - 1;
      step(s, 1, '有序数组，查找 key = ' + key, snap(a, { low: low, high: high, key: key }));
      while (low <= high) {
        const mid = (low + high) >> 1;
        step(s, 3, 'mid = (' + low + ' + ' + high + ') / 2 = ' + mid, snap(a, { low: low, high: high, mid: mid, key: key }));
        step(s, 4, '比较 a[' + mid + '] = ' + a[mid] + ' 与 key = ' + key, snap(a, { low: low, high: high, mid: mid, comparing: [mid], key: key }));
        if (a[mid] === key) {
          step(s, 4, '查找成功，下标为 ' + mid, snap(a, { low: low, high: high, mid: mid, found: mid, key: key }));
          return s;
        } else if (a[mid] < key) {
          low = mid + 1;
          step(s, 5, 'a[mid] < key，向右半区查找', snap(a, { low: low, high: high, key: key }));
        } else {
          high = mid - 1;
          step(s, 6, 'a[mid] > key，向左半区查找', snap(a, { low: low, high: high, key: key }));
        }
      }
      step(s, 8, '查找失败，返回 -1', snap(a, { low: low, high: high, key: key }));
      return s;
    }
  };

  // ---------------------------------------------------------------- KMP
  A.kmp = {
    title: 'KMP 匹配（含 next 数组）', group: '串', kind: 'string',
    code: [
      'void getNext(char p[], int next[]) {',
      '  int i = 0, j = -1; next[0] = -1;',
      '  while (i < m - 1) {',
      '    if (j == -1 || p[i] == p[j]) next[++i] = ++j;',
      '    else j = next[j];',
      '  }',
      '}',
      'int kmp(char s[], char p[]) {',
      '  int i = 0, j = 0;',
      '  while (i < n && j < m) {',
      '    if (j == -1 || s[i] == p[j]) { i++; j++; }',
      '    else j = next[j];',
      '  }',
      '  return j == m ? i - m : -1;',
      '}'
    ],
    build() {
      const text = 'ABABABCABABC', pat = 'ABABC', s = [];
      const next = [];
      step(s, 0, '先求模式串 "' + pat + '" 的 next 数组', { kind: 'string', text: text, pat: pat, i: 0, j: 0, next: next.slice() });
      let i = 0, j = -1;
      next[0] = -1;
      step(s, 1, 'next[0] = -1，i = 0，j = -1', { kind: 'string', text: text, pat: pat, i: 0, j: 0, next: next.slice() });
      while (i < pat.length - 1) {
        if (j === -1 || pat[i] === pat[j]) {
          i++; j++; next[i] = j;
          step(s, 3, 'next[' + i + '] = ' + j, { kind: 'string', text: text, pat: pat, i: i, j: j, next: next.slice() });
        } else {
          j = next[j];
          step(s, 4, '失配，j 回退到 next[' + j + '] = ' + j, { kind: 'string', text: text, pat: pat, i: i, j: j, next: next.slice() });
        }
      }
      step(s, 6, 'next = [' + next.join(', ') + ']', { kind: 'string', text: text, pat: pat, next: next.slice() });
      let a = 0, b = 0;
      while (a < text.length && b < pat.length) {
        step(s, 8, '比较文本[' + a + '] 与模式[' + b + ']', { kind: 'string', text: text, pat: pat, i: a, j: b, next: next.slice() });
        if (b === -1 || text[a] === pat[b]) { a++; b++; }
        else { b = next[b]; step(s, 11, '失配，模式串右移，j = next[' + b + ']', { kind: 'string', text: text, pat: pat, i: a, j: Math.max(0, b), next: next.slice() }); }
      }
      step(s, 13, b === pat.length ? '匹配成功，起始位置 ' + (a - pat.length) : '匹配失败', { kind: 'string', text: text, pat: pat, i: a, j: b, next: next.slice(), found: b === pat.length ? a - pat.length : -1 });
      return s;
    }
  };

  // ---------------------------------------------------------------- 树
  const TREE = {
    nodes: [
      { id: 'A', x: 50, y: 14 }, { id: 'B', x: 28, y: 42 }, { id: 'C', x: 72, y: 42 },
      { id: 'D', x: 15, y: 72 }, { id: 'E', x: 40, y: 72 }, { id: 'F', x: 60, y: 72 }, { id: 'G', x: 85, y: 72 }
    ],
    edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['C', 'G']]
  };

  function treeViz(extra) {
    return Object.assign({ kind: 'tree', nodes: TREE.nodes, edges: TREE.edges, visited: [], stack: [] }, extra);
  }

  A.preorder = {
    title: '二叉树先序遍历', group: '树', kind: 'tree',
    code: [
      'void preorder(BTNode *p) {',
      '  if (p == NULL) return;',
      '  visit(p);',
      '  preorder(p->lchild);',
      '  preorder(p->rchild);',
      '}',
      '// 非递归：根入栈，弹出即访问',
      '// 右孩子先入栈，左孩子后入栈'
    ],
    build() {
      const s = [], visited = [], stack = [];
      // 显式模拟递归：A -> B -> D -> E -> C -> F -> G
      const order = ['A', 'B', 'D', 'E', 'C', 'F', 'G'];
      order.forEach((id) => {
        stack.push(id);
        step(s, 2, '访问根结点 ' + id + '（根 → 左 → 右）', treeViz({ visited: visited.concat([id]), current: id, stack: stack.slice() }));
        visited.push(id);
        stack.pop();
        step(s, 3, '递归进入左子树，处理下一个结点', treeViz({ visited: visited.slice(), stack: stack.slice(), current: id }));
      });
      step(s, 4, '遍历序列：' + order.join(' → '), treeViz({ visited: visited.slice(), order: order }));
      return s;
    }
  };

  A.inorder = {
    title: '二叉树中序遍历', group: '树', kind: 'tree',
    code: [
      'void inorder(BTNode *p) {',
      '  if (p == NULL) return;',
      '  inorder(p->lchild);',
      '  visit(p);',
      '  inorder(p->rchild);',
      '}'
    ],
    build() {
      const s = [], visited = [], order = ['D', 'B', 'E', 'A', 'F', 'C', 'G'];
      let stack = [];
      order.forEach((id) => {
        stack.push(id);
        step(s, 3, '左子树到底后访问结点 ' + id, treeViz({ visited: visited.concat([id]), current: id, stack: stack.slice() }));
        visited.push(id);
        stack.pop();
        step(s, 4, '转向右子树', treeViz({ visited: visited.slice(), stack: stack.slice(), current: id }));
      });
      step(s, 5, '中序序列：' + order.join(' → '), treeViz({ visited: visited.slice(), order: order }));
      return s;
    }
  };

  A.postorder = {
    title: '二叉树后序遍历', group: '树', kind: 'tree',
    code: [
      'void postorder(BTNode *p) {',
      '  if (p == NULL) return;',
      '  postorder(p->lchild);',
      '  postorder(p->rchild);',
      '  visit(p);',
      '}'
    ],
    build() {
      const s = [], visited = [], order = ['D', 'E', 'B', 'F', 'G', 'C', 'A'];
      order.forEach((id) => {
        step(s, 4, '左右子树都访问完，最后访问 ' + id, treeViz({ visited: visited.concat([id]), current: id }));
        visited.push(id);
      });
      step(s, 5, '后序序列：' + order.join(' → '), treeViz({ visited: visited.slice(), order: order }));
      return s;
    }
  };

  A.level = {
    title: '二叉树层序遍历', group: '树', kind: 'tree',
    code: [
      'void levelOrder(BTNode *root) {',
      '  Queue Q; InitQueue(Q);',
      '  if (root) EnQueue(Q, root);',
      '  while (!IsEmpty(Q)) {',
      '    BTNode *p = DeQueue(Q);',
      '    visit(p);',
      '    if (p->lchild) EnQueue(Q, p->lchild);',
      '    if (p->rchild) EnQueue(Q, p->rchild);',
      '  }',
      '}'
    ],
    build() {
      const s = [], order = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      let q = [];
      order.forEach((id) => {
        q.push(id);
        step(s, 5, '出队并访问 ' + id, treeViz({ visited: order.slice(0, order.indexOf(id) + 1), current: id, queue: q.slice() }));
        q.shift();
        step(s, 6, '把 ' + id + ' 的孩子入队', treeViz({ visited: order.slice(0, order.indexOf(id) + 1), current: id, queue: q.slice() }));
      });
      step(s, 8, '层序序列：' + order.join(' → '), treeViz({ visited: order.slice(), order: order }));
      return s;
    }
  };

  // ---------------------------------------------------------------- 图
  const G = {
    nodes: [
      { id: 'A', x: 18, y: 30 }, { id: 'B', x: 46, y: 12 }, { id: 'C', x: 48, y: 58 },
      { id: 'D', x: 76, y: 28 }, { id: 'E', x: 74, y: 72 }, { id: 'F', x: 92, y: 50 }
    ],
    edges: [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3]]
  };
  function graphViz(extra) {
    return Object.assign({ kind: 'graph', nodes: G.nodes, edges: G.edges, visited: [], frontier: [], path: [] }, extra);
  }

  A.bfs = {
    title: '图的广度优先遍历（BFS）', group: '图', kind: 'graph',
    code: [
      'void BFS(Graph G, int v) {',
      '  visit(v); visited[v] = true;',
      '  InitQueue(Q); EnQueue(Q, v);',
      '  while (!IsEmpty(Q)) {',
      '    DeQueue(Q, u);',
      '    for (w in Adj(u))',
      '      if (!visited[w]) {',
      '        visit(w); visited[w] = true;',
      '        EnQueue(Q, w);',
      '      }',
      '  }',
      '}'
    ],
    build() {
      const s = [], adj = {};
      G.edges.forEach(([u, v]) => { (adj[u] = adj[u] || []).push(v); (adj[v] = adj[v] || []).push(u); });
      const visited = ['A'], q = ['A'];
      step(s, 1, '从 A 出发，访问并入队', graphViz({ visited: visited.slice(), frontier: q.slice() }));
      while (q.length) {
        const u = q.shift();
        step(s, 4, '出队 ' + u + '，检查它的邻接点', graphViz({ visited: visited.slice(), frontier: q.slice(), current: u }));
        (adj[u] || []).forEach((w) => {
          step(s, 5, '检查邻接点 ' + w, graphViz({ visited: visited.slice(), frontier: q.slice(), current: u, checking: w }));
          if (!visited.includes(w)) {
            visited.push(w); q.push(w);
            step(s, 7, w + ' 未访问：访问并入队', graphViz({ visited: visited.slice(), frontier: q.slice(), current: w }));
          }
        });
      }
      step(s, 11, 'BFS 序列：' + visited.join(' → ') + '（可用来求无权图最短路）', graphViz({ visited: visited.slice(), order: visited }));
      return s;
    }
  };

  A.dfs = {
    title: '图的深度优先遍历（DFS）', group: '图', kind: 'graph',
    code: [
      'void DFS(Graph G, int v) {',
      '  visit(v); visited[v] = true;',
      '  for (w in Adj(v))',
      '    if (!visited[w])',
      '      DFS(G, w);',
      '}'
    ],
    build() {
      const s = [], adj = {};
      G.edges.forEach(([u, v]) => { (adj[u] = adj[u] || []).push(v); (adj[v] = adj[v] || []).push(u); });
      const visited = [];
      function dfs(u, depth) {
        visited.push(u);
        step(s, 1, '访问 ' + u + '（深度 ' + depth + '），继续深入', graphViz({ visited: visited.slice(), current: u, depth: depth }));
        (adj[u] || []).forEach((w) => {
          step(s, 2, u + ' 的邻接点 ' + w + (visited.includes(w) ? ' 已访问，跳过' : ' 未访问，深入'), graphViz({ visited: visited.slice(), current: u, checking: w }));
          if (!visited.includes(w)) dfs(w, depth + 1);
        });
        step(s, 4, u + ' 的邻接点处理完，回溯', graphViz({ visited: visited.slice(), current: u, depth: depth }));
      }
      dfs('A', 0);
      step(s, 5, 'DFS 序列：' + visited.join(' → ') + '（可用来判连通、求割点）', graphViz({ visited: visited.slice(), order: visited }));
      return s;
    }
  };

  A.topo = {
    title: '拓扑排序（AOV 网）', group: '图', kind: 'graph',
    code: [
      'bool TopologicalSort(Graph G) {',
      '  InitStack(S);',
      '  for (i = 0; i < n; i++)',
      '    if (indegree[i] == 0) Push(S, i);',
      '  while (!IsEmpty(S)) {',
      '    Pop(S, i); print(i); count++;',
      '    for (p = G.vertices[i].first; p; p = p->next)',
      '      if (--indegree[p->adjvex] == 0)',
      '        Push(S, p->adjvex);',
      '  }',
      '  return count == n;',
      '}'
    ],
    build() {
      const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
      const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'F'], ['D', 'E'], ['E', 'F']];
      const indeg = { A: 0, B: 1, C: 1, D: 2, E: 1, F: 2 };
      const coords = { A: { x: 12, y: 50 }, B: { x: 34, y: 24 }, C: { x: 34, y: 76 }, D: { x: 58, y: 50 }, E: { x: 78, y: 28 }, F: { x: 78, y: 74 } };
      const gnodes = nodes.map((id) => ({ id: id, x: coords[id].x, y: coords[id].y }));
      const s = [], zero = ['A'], order = [];
      function viz(extra) { return Object.assign({ kind: 'graph', nodes: gnodes, edges: edges, directed: true, indeg: Object.assign({}, indeg), frontier: zero.slice() }, extra); }
      step(s, 3, '入度为 0 的结点 A 入栈', viz({ visited: [] }));
      while (zero.length) {
        const u = zero.pop();
        order.push(u);
        step(s, 5, '弹出 ' + u + '，加入拓扑序列', viz({ visited: order.slice(), current: u }));
        edges.filter((e) => e[0] === u).forEach((e) => {
          const v = e[1];
          indeg[v]--;
          if (indeg[v] === 0) zero.push(v);
          step(s, 7, '删除边 ' + u + '→' + v + '，' + v + ' 入度变为 ' + indeg[v] + (indeg[v] === 0 ? '，入栈' : ''), viz({ visited: order.slice(), current: u }));
        });
      }
      step(s, 10, '拓扑序列：' + order.join(' → ') + (order.length === nodes.length ? '（无环）' : '（有环）'), viz({ visited: order.slice(), order: order }));
      return s;
    }
  };

  A.dijkstra = {
    title: 'Dijkstra 单源最短路', group: '图', kind: 'graph',
    code: [
      'void Dijkstra(Graph G, int s) {',
      '  for (i = 0; i < n; i++) { dist[i] = INF; done[i] = false; }',
      '  dist[s] = 0;',
      '  for (k = 0; k < n; k++) {',
      '    u = 未确定结点中 dist 最小者;',
      '    if (dist[u] == INF) break;',
      '    done[u] = true;',
      '    for (w in Adj(u))',
      '      if (!done[w] && dist[u] + w(u,w) < dist[w])',
      '        dist[w] = dist[u] + w(u,w);',
      '  }',
      '}'
    ],
    build() {
      const s = [], ids = ['A', 'B', 'C', 'D', 'E', 'F'];
      const dist = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity };
      const done = {};
      const adj = {};
      G.edges.forEach(([u, v, w]) => { (adj[u] = adj[u] || []).push([v, w]); (adj[v] = adj[v] || []).push([u, w]); });
      function viz(extra) { return Object.assign({ kind: 'graph', nodes: G.nodes, edges: G.edges, dist: Object.assign({}, dist), done: Object.keys(done), current: null }, extra || {}); }
      step(s, 2, '初始化：dist[A] = 0，其余为 ∞', viz());
      for (let k = 0; k < ids.length; k++) {
        let u = null, best = Infinity;
        ids.forEach((id) => { if (!done[id] && dist[id] < best) { best = dist[id]; u = id; } });
        if (!u) break;
        done[u] = true;
        step(s, 6, '选出未确定结点中 dist 最小的 ' + u + '（' + dist[u] + '），确定其最短路', viz({ current: u }));
        (adj[u] || []).forEach(([v, w]) => {
          const nd = dist[u] + w;
          step(s, 8, '松弛边 ' + u + '-' + v + '：' + dist[u] + ' + ' + w + ' = ' + nd + (nd < dist[v] ? ' < ' + (dist[v] === Infinity ? '∞' : dist[v]) + '，更新' : '，不更新'), viz({ current: u }));
          if (nd < dist[v]) {
            dist[v] = nd;
            step(s, 9, 'dist[' + v + '] 更新为 ' + nd, viz({ current: u, updated: v }));
          }
        });
      }
      step(s, 11, '最短路结果：' + ids.map((id) => id + '=' + dist[id]).join('，'), viz({ order: ids }));
      return s;
    }
  };

  // ---------------------------------------------------------------- 渲染
  function renderArray(v) {
    const arr = v.arr || [];
    const max = Math.max.apply(null, arr.concat([1]));
    const cells = arr.map((x, i) => {
      let cls = 'bar';
      if (v.comparing && v.comparing.includes(i)) cls += ' cmp';
      if (v.active && v.active.includes(i)) cls += ' act';
      if (v.pivot === i) cls += ' pivot';
      if (v.found === i) cls += ' found';
      if (v.sortedTo !== undefined && i >= v.sortedTo) cls += ' sorted';
      if (v.range && i >= v.range[0] && i <= v.range[1]) cls += ' inrange';
      const h = Math.round((x / max) * 150) + 26;
      return '<div class="' + cls + '" style="height:' + h + 'px"><span class="bv">' + x + '</span>' +
        '<span class="bi">' + i + '</span></div>';
    }).join('');
    const marks = [];
    if (v.i !== undefined) marks.push('i=' + v.i);
    if (v.j !== undefined) marks.push('j=' + v.j);
    if (v.low !== undefined) marks.push('low=' + v.low);
    if (v.high !== undefined) marks.push('high=' + v.high);
    if (v.mid !== undefined) marks.push('mid=' + v.mid);
    if (v.min !== undefined) marks.push('min=' + v.min);
    if (v.key !== undefined) marks.push('key=' + v.key);
    return '<div class="viz-array">' + cells + '</div>' +
      (marks.length ? '<div class="viz-marks">' + marks.map((m) => '<span>' + m + '</span>').join('') + '</div>' : '');
  }

  function renderString(v) {
    const text = v.text || '', pat = v.pat || '';
    const t = text.split('').map((ch, i) =>
      '<span class="ch' + (v.i === i ? ' cur' : '') + '">' + ch + '</span>').join('');
    const p = pat.split('').map((ch, j) =>
      '<span class="ch' + (v.j === j ? ' cur' : '') + '">' + ch + '</span>').join('');
    const next = v.next ? '<div class="viz-next">next = [' + v.next.join(', ') + ']</div>' : '';
    return '<div class="viz-str"><div class="row"><b>文本</b>' + t + '</div>' +
      '<div class="row"><b>模式</b>' + p + '</div>' + next + '</div>';
  }

  function renderTree(v) {
    const W = 320, H = 190;
    const pos = {};
    (v.nodes || []).forEach((n) => { pos[n.id] = { x: n.x * 2.8 + 20, y: n.y * 1.6 + 20 }; });
    const edges = (v.edges || []).map(([a, b]) => {
      const p1 = pos[a], p2 = pos[b];
      return '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" />';
    }).join('');
    const nodes = (v.nodes || []).map((n) => {
      const p = pos[n.id];
      let cls = 'tn';
      if ((v.visited || []).includes(n.id)) cls += ' vis';
      if (v.current === n.id) cls += ' cur';
      return '<g class="' + cls + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="15" />' +
        '<text x="' + p.x + '" y="' + (p.y + 5) + '">' + n.id + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 320 190" class="viz-svg">' + edges + nodes + '</svg>' +
      (v.stack && v.stack.length ? '<div class="viz-queue">栈/队列：' + v.stack.join(' ') + '</div>' : '');
  }

  function renderHeap(v) {
    const arr = v.arr || [];
    const n = arr.length;
    const W = 340, H = 210;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const depth = Math.floor(Math.log2(i + 1));
      const first = Math.pow(2, depth) - 1;
      const offset = i - first;
      const count = Math.pow(2, depth);
      const gap = W / (count + 1);
      pos[i] = { x: gap * (offset + 1), y: 28 + depth * 56 };
    }
    let edges = '';
    for (let i = 1; i < n; i++) {
      const p = Math.floor((i - 1) / 2);
      edges += '<line x1="' + pos[p].x + '" y1="' + pos[p].y + '" x2="' + pos[i].x + '" y2="' + pos[i].y + '" />';
    }
    let nodes = '';
    for (let i = 0; i < n; i++) {
      let cls = 'hn';
      if ((v.comparing || []).includes(i)) cls += ' cmp';
      if ((v.active || []).includes(i)) cls += ' cur';
      if (v.sortedTo !== undefined && i >= v.sortedTo) cls += ' done';
      nodes += '<g class="' + cls + '"><circle cx="' + pos[i].x + '" cy="' + pos[i].y + '" r="15" />' +
        '<text x="' + pos[i].x + '" y="' + (pos[i].y + 4) + '">' + arr[i] + '</text>' +
        '<text class="ix" x="' + pos[i].x + '" y="' + (pos[i].y + 26) + '">' + i + '</text></g>';
    }
    const legend = (v.sortedTo !== undefined ? '已归位 ' + (n - v.sortedTo) + ' 个 · ' : '') +
      '大根堆：父结点 ≥ 孩子';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="viz-svg">' + edges + nodes + '</svg>' +
      '<div class="viz-queue">' + legend + '</div>';
  }

  function renderGraph(v) {
    const W = 340, H = 200;
    const pos = {};
    (v.nodes || []).forEach((n) => { pos[n.id] = { x: n.x * 3.2 + 20, y: n.y * 1.7 + 20 }; });
    const edges = (v.edges || []).map(([a, b, w]) => {
      const p1 = pos[a], p2 = pos[b];
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      return '<g class="ge"><line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" />' +
        (w ? '<text x="' + mx + '" y="' + (my - 4) + '">' + w + '</text>' : '') + '</g>';
    }).join('');
    const nodes = (v.nodes || []).map((n) => {
      const p = pos[n.id];
      let cls = 'gn';
      if ((v.visited || []).includes(n.id)) cls += ' vis';
      if (v.current === n.id) cls += ' cur';
      if ((v.frontier || []).includes(n.id)) cls += ' front';
      const label = v.dist ? n.id + (v.dist[n.id] === Infinity ? ':∞' : ':' + v.dist[n.id]) : n.id;
      return '<g class="' + cls + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="16" />' +
        '<text x="' + p.x + '" y="' + (p.y + 4) + '">' + label + '</text></g>';
    }).join('');
    const extra = [];
    if (v.dist) extra.push('点击“下一步”观察 dist 的松弛更新');
    if (v.frontier && v.frontier.length) extra.push('队列/栈：' + v.frontier.join(' '));
    return '<svg viewBox="0 0 340 200" class="viz-svg">' + edges + nodes + '</svg>' +
      (extra.length ? '<div class="viz-queue">' + extra.join(' · ') + '</div>' : '');
  }

  function renderViz(v) {
    if (!v) return '';
    if (v.kind === 'array') return renderArray(v);
    if (v.kind === 'string') return renderString(v);
    if (v.kind === 'tree') return renderTree(v);
    if (v.kind === 'graph') return renderGraph(v);
    if (v.kind === 'heap') return renderHeap(v);
    return '';
  }

  // ---------------------------------------------------------------- 播放器
  let ui = null, steps = [], idx = 0, timer = null, playing = false;

  function ensureUI() {
    if (ui) return ui;
    const wrap = document.createElement('div');
    wrap.id = 'animModal';
    wrap.className = 'anim-modal hidden';
    wrap.innerHTML =
      '<div class="anim-box">' +
        '<div class="anim-head"><div><b id="animTitle">算法动画</b><span id="animGroup"></span></div>' +
          '<button class="icon-btn" id="animClose">✕</button></div>' +
        '<div class="anim-body">' +
          '<div class="anim-viz"><div id="animViz"></div><div id="animNote" class="anim-note"></div></div>' +
          '<div class="anim-code"><div class="code-title">代码</div><div id="animCode"></div></div>' +
        '</div>' +
        '<div class="anim-foot">' +
          '<button class="btn primary" id="animPlay">▶ 开始</button>' +
          '<button class="btn" id="animNext">下一步 →</button>' +
          '<button class="btn" id="animReset">重置</button>' +
          '<span id="animProg" class="anim-prog"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    ui = wrap;
    $('#animClose', wrap).onclick = close;
    $('#animPlay', wrap).onclick = togglePlay;
    $('#animNext', wrap).onclick = next;
    $('#animReset', wrap).onclick = reset;
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    return wrap;
  }

  function open(id) {
    const algo = A[id];
    if (!algo) return;
    ensureUI();
    steps = algo.build();
    idx = 0;
    playing = false;
    $('#animTitle', ui).textContent = algo.title;
    $('#animGroup', ui).textContent = algo.group;
    $('#animCode', ui).innerHTML = algo.code.map((l, i) =>
      '<div class="cl" data-i="' + i + '"><span class="ln">' + (i + 1) + '</span><code>' + escapeHtml(l) + '</code></div>').join('');
    ui.classList.remove('hidden');
    paint();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function paint() {
    const st = steps[idx];
    if (!st) return;
    $('#animViz', ui).innerHTML = renderViz(st.viz);
    $('#animNote', ui).textContent = st.note || '';
    const lines = ui.querySelectorAll('.cl');
    lines.forEach((el) => el.classList.remove('on'));
    const active = ui.querySelector('.cl[data-i="' + st.line + '"]');
    if (active) {
      active.classList.add('on');
      active.scrollIntoView({ block: 'nearest' });
    }
    $('#animProg', ui).textContent = (idx + 1) + ' / ' + steps.length;
    const atEnd = idx >= steps.length - 1;
    $('#animNext', ui).disabled = atEnd;
    $('#animPlay', ui).textContent = playing ? '⏸ 暂停' : (atEnd ? '↻ 重播' : '▶ 开始');
  }

  function togglePlay() {
    if (playing) { pause(); return; }
    if (idx >= steps.length - 1) { idx = 0; }
    playing = true;
    $('#animPlay', ui).textContent = '⏸ 暂停';
    timer = setInterval(() => {
      if (idx < steps.length - 1) { idx++; paint(); }
      else pause();
    }, 620);
    paint();
  }

  function pause() {
    playing = false;
    clearInterval(timer); timer = null;
    if (ui) $('#animPlay', ui).textContent = idx >= steps.length - 1 ? '↻ 重播' : '▶ 开始';
    if (ui) $('#animPlay', ui).classList.remove('playing');
  }

  function next() {
    pause();
    if (idx < steps.length - 1) { idx++; paint(); }
  }

  function reset() {
    pause();
    idx = 0;
    paint();
  }

  function close() {
    pause();
    if (ui) ui.classList.add('hidden');
  }

  function list() {
    return Object.keys(A).map((id) => ({ id: id, title: A[id].title, group: A[id].group }));
  }

  function code(id) {
    return A[id] ? A[id].code : [];
  }

  window.KMAnim = { open: open, list: list, code: code, close: close };
})();
