> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/计数信号量的实验和API.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/%E8%AE%A1%E6%95%B0%E4%BF%A1%E5%8F%B7%E9%87%8F%E7%9A%84%E5%AE%9E%E9%AA%8C%E5%92%8CAPI.md)

定义一个计数信号量并且确定信号量的最大值 ![file-20260421201646097.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E8%AE%A1%E6%95%B0%E4%BF%A1%E5%8F%B7%E9%87%8F%E7%9A%84%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201646097.png)

创建一个计数信号量

![file-20260421201646100.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E8%AE%A1%E6%95%B0%E4%BF%A1%E5%8F%B7%E9%87%8F%E7%9A%84%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201646100.png)

形参为信号量最大值和信号量初始值，返回值为队列结构体指针

![file-20260421201646104.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E8%AE%A1%E6%95%B0%E4%BF%A1%E5%8F%B7%E9%87%8F%E7%9A%84%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201646104.png)

通过信号量获取函数来判断信号量是否被占用，uxSemaphoreGetConut 函数为计数信号量获取函数，形参为信号量句柄，返回值为 UBaseType_t 就是 unsigned long，fflush(stdout) 是清空输出缓冲区
