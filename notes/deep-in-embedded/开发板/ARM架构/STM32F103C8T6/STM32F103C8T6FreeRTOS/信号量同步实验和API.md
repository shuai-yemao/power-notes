> 来源：Deep-In-Embedded / [开发板/ARM架构/STM32F103C8T6/STM32F103C8T6FreeRTOS/信号量同步实验和API.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI.md)

使用信号量要先将动态分配的宏置一

![file-20260421201639300.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201639300.png)

使用计数信号量时，要使计数信号量宏置一

![file-20260421201639303.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201639303.png) 递增 ![file-20260421201639312.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201639312.png)

递减

![file-20260421201639315.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/file-20260421201639315.png)

___

通过信号量来实现 A->B->C 任务 (优先级相同) 的执行

	定义一个信号量![Pasted image 20250629125043.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629125043.png)

	![Pasted image 20250629121323.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629121323.png)

	通过xSemaphoreTake来获取信号量，形参为信号量变量名和等待时间

	任务运行完后需要释放信号量

	![Pasted image 20250629121529.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629121529.png)

	通过xSemaphoreGive来释放信号量，形参为信号量变量名

	![Pasted image 20250629121645.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629121645.png)

	三个任务内容相似，导致调度器卡死在taskYILED函数（让当前的任务放弃CPU执行权交给下一个任务），==卡死在此处的原因是调期度器当中没有任务处于就绪态，也就是其他任务没有被唤醒，一直处于阻塞态==

	![Pasted image 20250629122215.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629122215.png)

	==在第一个运行的任务前加入释放任务量函数==，因为信号量定义初始值为0（会导致任务死锁，一直等待信号量），通过释放函数置一

	![Pasted image 20250629122528.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629122528.png)

	每一个任务中放入printf函数来串口通信，其结果是，只有一个任务在执行，因为其printf函数在此类似于一个阻塞操作，会阻止其他任务的运行，并且一直占用CPU资源

	![Pasted image 20250629122931.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629122931.png)

	![Pasted image 20250629123355.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/ARM%E6%9E%B6%E6%9E%84/STM32F103C8T6/STM32F103C8T6FreeRTOS/assets/%E4%BF%A1%E5%8F%B7%E9%87%8F%E5%90%8C%E6%AD%A5%E5%AE%9E%E9%AA%8C%E5%92%8CAPI/Pasted%20image%2020250629123355.png)

	通过vTaskDelay或者taskYILED来手动过渡任务，释放CPU资源，可以解决printf问题
