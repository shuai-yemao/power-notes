> 来源：Deep-In-Embedded / [开发板/RISC-V架构/ESP32-S3 ESP-IDF学习/KEY.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/KEY.md)

#### 按键消抖
机械按键在闭合与分开的过程中，由于机械振动（类似于弹簧效应）的存在，可能导致开关状态在短时间内频繁切换，这种现象被称为按键抖动。![file-20260421201557007.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/KEY/file-20260421201557007.png)
为了消除这种抖动，我们通常采用软件消抖和硬件消抖两种主要方法：
	1. 软件消抖：主要是通过编程的方法，设定一个延迟或计时器，确保在一定的时间内只读取一次按键状态，避免抖动对程序的影响。
	2. 硬件消抖：在按键电路中加入元器件如电阻、电容组成的 RC 低通滤波器，对按键信号进行平滑处理，降低抖动的影响。

原理图
![file-20260421201557009.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/KEY/file-20260421201557009.png)
