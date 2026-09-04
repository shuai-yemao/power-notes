> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/tick溢出问题.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/tick%E6%BA%A2%E5%87%BA%E9%97%AE%E9%A2%98.md)

tick是系统定时器产生的固定周期的一个tick中断时间，tick中断发生后，系统RT0S会更新内部的时间基准，同时会进行任务的切换，tick=1000，也就是1ms切换一次任务![file-20260421201632031.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/tick%E6%BA%A2%E5%87%BA%E9%97%AE%E9%A2%98/file-20260421201632031.png)（在freertosconfig头文件中修改和查看）
这里显示tick为1ms，1/1000
TickType_t 类型为unsigned int 在STM32中是32位，计时时间是2^32/1000(系统嘀嗒计时器频率)约定于49天，超过阈值后数值清零![file-20260421201632034.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/tick%E6%BA%A2%E5%87%BA%E9%97%AE%E9%A2%98/file-20260421201632034.png)
利用无符号类型的溢出特性
