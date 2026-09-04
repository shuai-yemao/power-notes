> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/tick hook.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/tick%20hook.md)

tick hook是tick中断的回调函数
特点：
	![file-20260421201632922.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/tick%20hook/file-20260421201632922.png)
	configUSE_TICK_HOOK置一
![file-20260421201632926.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/tick%20hook/file-20260421201632926.png)
产生系统中断的核心函数‘
![file-20260421201632929.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/tick%20hook/file-20260421201632929.png)
vPortRaiseBASEPRI函数是临时提高中断屏蔽寄存器的等级提到最高优先级，防止被其他任务打断
xTaskIncrementTick函数是更新系统的tick时间，检查是否有任务延时到期，有任务切换就返回pdTURE，没有就返回pdFALSE
