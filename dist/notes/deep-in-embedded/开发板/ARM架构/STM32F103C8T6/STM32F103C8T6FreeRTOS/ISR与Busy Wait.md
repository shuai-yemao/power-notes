> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/ISR与Busy Wait.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/ISR%E4%B8%8EBusy%20Wait.md)

ISR(中断服务程序)

BusyWait(不断轮询某一个东西的概念)

![file-20260421201630032.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/ISR%E4%B8%8EBusy%20Wait/file-20260421201630032.png)

串行逻辑，在实时操作系统中会导致 bug，因为逻辑是等待倒车雷达的回应，无回应则卡死在此处

![file-20260421201630040.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/ISR%E4%B8%8EBusy%20Wait/file-20260421201630040.png)

中断程序中一般都是定时读取任务，主函数中存放执行，同时要确定好中断程序的优先级，这也就是前后台线程

![file-20260421201630043.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/ISR%E4%B8%8EBusy%20Wait/file-20260421201630043.png)

RTOS 的 CPU 通过快速切换线程来模拟并行逻辑
