> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/Gatekeeper Task.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/Gatekeeper%20Task.md)

gatakeeper 的基础作用是协调不同任务，决定哪些任务什么时候可以访问哪些资源以及某些操作的共享频率

创建一个 gatekeeper task![file-20260421201627945.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/Gatekeeper%20Task/file-20260421201627945.png)

![file-20260421201627948.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/Gatekeeper%20Task/file-20260421201627948.png)

接收和处理其他任务的数据
