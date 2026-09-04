> 来源：Deep-In-Embedded / [开发板/RISC-V架构/ESP32-S3 ESP-IDF学习/RNG.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/RNG.md)

### 简介
ESP32-S3 内置一个真随机数发生器（RNG），其生成的 32 位随机数可作为加密等操作的基础。

EDP32- S3 的随机数发生器噪声源如图 31.1.1.1 所示：
![file-20260421201557625.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RNG/file-20260421201557625.png)
系统可以从随机数发生器的寄存器**RNG_DATA_REG** 中读取随机数，每个读到的 32 位随机数都是真随机数，噪声源为系统中的热噪声和异步时钟。

### RNG函数解析
需要导入必要的头文件：
#include "esp_random.h"

uint32_t esp_random(void);
	该函数用于获取一个 32 位的硬件随机数，
	返回值描述
		![file-20260421201557631.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RNG/file-20260421201557631.png)
