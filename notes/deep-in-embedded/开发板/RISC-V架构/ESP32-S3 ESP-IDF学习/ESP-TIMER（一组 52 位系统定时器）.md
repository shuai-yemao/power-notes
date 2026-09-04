> 来源：Deep-In-Embedded / [开发板/RISC-V架构/ESP32-S3 ESP-IDF学习/ESP-TIMER（一组 52 位系统定时器）.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/ESP-TIMER%EF%BC%88%E4%B8%80%E7%BB%84%2052%20%E4%BD%8D%E7%B3%BB%E7%BB%9F%E5%AE%9A%E6%97%B6%E5%99%A8%EF%BC%89.md)

#### 定时器简介
定时器是单片机内部集成的功能，它能够通过编程进行灵活控制。
**单片机的定时功能依赖于内部的计数器实现**，每当单片机经历一个机器周期并产生一个脉冲时，计数器就会递增。
**定时器的主要作用在于计时**，当设定的时间到达后，它会触发中断，从而通知系统计时完成。
在中断服务函数中，我们可以编写特定的程序以实现所需的功能。

#### 硬件定时器和软件定时器
硬件定时器
	依托微控制器的内置硬件机制，通过专门的计时/计数器电路达成定时功能。**其显著优势在于高精度与高可靠性。**
	因为硬件定时器的工作独立于软件任务和操作系统调度
[[软件定时器]]
	通过操作系统或软件库模拟实现的定时功能。这类定时器的性能受系统当前负载和任务调度策略制约，因此在精度上较硬件定时器稍逊一筹。
	适用于对时间控制要求不那么严格的场景
#### ESP-TIMER函数解析
必要头文件#include "esp_timer.h"

esp_err_t esp_timer_create(const esp_timer_create_args_t* create_args,esp_timer_handle_t* out_handle);
	该函数用于创建 ESPTIMER 实例
	参数表
		![file-20260421201554704.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/ESP-TIMER%EF%BC%88%E4%B8%80%E7%BB%84%2052%20%E4%BD%8D%E7%B3%BB%E7%BB%9F%E5%AE%9A%E6%97%B6%E5%99%A8%EF%BC%89/file-20260421201554704.png)
	 esp_timer_create_args_t 结构体的成员变量描述
		 ![file-20260421201554709.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/ESP-TIMER%EF%BC%88%E4%B8%80%E7%BB%84%2052%20%E4%BD%8D%E7%B3%BB%E7%BB%9F%E5%AE%9A%E6%97%B6%E5%99%A8%EF%BC%89/file-20260421201554709.png)

esp_err_t IRAM_ATTR esp_timer_start_periodic(esp_timer_handle_t timer,uint64_t period_us);
	该函数用于使能定时器的指定中断
	参数表
		![file-20260421201554712.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/ESP-TIMER%EF%BC%88%E4%B8%80%E7%BB%84%2052%20%E4%BD%8D%E7%B3%BB%E7%BB%9F%E5%AE%9A%E6%97%B6%E5%99%A8%EF%BC%89/file-20260421201554712.png)
		
