# Markdown 渲染能力测试

## Mermaid 图表

```mermaid
flowchart LR
  A[Markdown] --> B[解析器]
  B --> C[Mermaid / ECharts]
  C --> D[阅读页]
```

## ECharts 图表

```echarts
{"title":{"text":"每周学习时间"},"tooltip":{"trigger":"axis"},"xAxis":{"type":"category","data":["周一","周二","周三"]},"yAxis":{"type":"value","name":"小时"},"series":[{"name":"学习时间","type":"bar","data":[2,3,4]}],"ariaLabel":"周一到周三的学习时间依次为 2、3、4 小时"}
```

## C / C++ 代码块

```cpp
#include <cstdint>

int main() {
    const std::uint32_t answer = 42;
    return static_cast<int>(answer);
}
```

## 图片

![Power Notes 图片渲染测试](../assets/render-test.svg "本地 SVG 图片")
