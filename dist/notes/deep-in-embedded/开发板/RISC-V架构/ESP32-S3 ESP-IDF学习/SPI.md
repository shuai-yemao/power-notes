> 来源：Deep-In-Embedded / [开发板/RISC-V架构/ESP32-S3 ESP-IDF学习/SPI.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/SPI.md)

 ### SPI_LCD 函数解析

需要导入必要的头文件：

#include "driver/spi_master.h"

esp_err_t spi_bus_initialize(spi_host_device_t host_id,const spi_bus_config_t *bus_config,spi_dma_chan_t dma_chan);

	该函数用于初始化 SPI 总线，并配置其 GPIO引脚和主模式下的时钟等参数

	参数表

		![file-20260421201557964.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/SPI/file-20260421201557964.png)

		![Pasted image 20251007161326.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/SPI/Pasted%20image%2020251007161326.png)

esp_err_t spi_bus_add_device(spi_host_device_t host_id,const spi_device_interface_config_t *dev_config,spi_device_handle_t *handle);

	该函数用于在 SPI 总线上分配设备

	参数表

		![Pasted image 20251007161514.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/SPI/Pasted%20image%2020251007161514.png)

		![Pasted image 20251007161532.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/SPI/Pasted%20image%2020251007161532.png)

数据传输

**资源未找到：Pasted image 20251007161612.png**
