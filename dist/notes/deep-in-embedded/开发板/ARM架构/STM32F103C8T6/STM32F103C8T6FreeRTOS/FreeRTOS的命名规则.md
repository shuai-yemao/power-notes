> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/FreeRTOS的命名规则.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/FreeRTOS%E7%9A%84%E5%91%BD%E5%90%8D%E8%A7%84%E5%88%99.md)

![file-20260421201627124.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/FreeRTOS%E7%9A%84%E5%91%BD%E5%90%8D%E8%A7%84%E5%88%99/file-20260421201627124.png)

TickType_t 代表的是节拍数%% （算机中的 “节拍数” 指 CPU 的时钟周期（Clock Cycle），是控制操作的最小时间单位。时钟频率（主频）以 GHz 为单位，例如 3 GHz 表示每秒 30 亿个周期 1。） %% 类型，BaseType_t 代表的是基本的整数类型，由芯片决定，stm32 为 32 位宽

![file-20260421201627130.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/FreeRTOS%E7%9A%84%E5%91%BD%E5%90%8D%E8%A7%84%E5%88%99/file-20260421201627130.png)

函数名命名规则，v 为返回类型，task 表示所在头文件，priorityset 表示函数的功能
