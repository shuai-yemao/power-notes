这是一篇用于验证文章同步插件的公开测试笔记，不包含私人资料。测试日期：2026-10-07。

## 测试范围

- Markdown 标题与段落。
- C 语言代码块。
- 本地 PNG 配图。
- HTTPS 网站链接。
- 博客知识库目录索引。

## 代码块

下面是格式测试用的 C 函数示例，不代表任何工程或硬件的实测结果。

```c
static int clamp_example(int value, int minimum, int maximum)
{
    if (value < minimum)
    {
        return minimum;
    }
    if (value > maximum)
    {
        return maximum;
    }
    return value;
}
```

## 本地图片

![文章同步测试流程](assets/wechatsync-2026-10-07/image-1.png)

上图为本地生成的测试配图，用于核对发布后图片是否可以正常显示。

## 网站链接

[WeChatSync 扩展仓库](https://github.com/shuai-yemao/Wechatsync)

[Power Notes 博客首页](https://shuai-yemao.github.io/power-notes/)

## 验收标记

WECHATSYNC-POWERNOTES-LIVE-TEST-20261007

若官网阅读页可以看到本文、代码块、本地图片及两个网站链接，即可确认这篇测试笔记的发布结果。
