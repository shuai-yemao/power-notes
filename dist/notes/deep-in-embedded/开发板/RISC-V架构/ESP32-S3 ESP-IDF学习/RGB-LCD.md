> 来源：Deep-In-Embedded / [开发板/RISC-V架构/ESP32-S3 ESP-IDF学习/RGB-LCD.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/RGB-LCD.md)

### 程序流程图

![file-20260421201557224.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RGB-LCD/file-20260421201557224.png)

### RGB-LCD 函数解析

需要导入必要的头文件：

#include "esp_lcd_panel_ops.h"

#include "esp_lcd_panel_rgb.h"

esp_err_t esp_lcd_new_rgb_panel(const esp_lcd_rgb_panel_config_t*rgb_panel_config, esp_lcd_panel_handle_t *ret_panel);

	该函数通过配置结构体参数的方式将参数以指针的方式传进创建的 RGB 对象

	参数表

		![file-20260421201557227.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RGB-LCD/file-20260421201557227.png)

		结构体定义

			![file-20260421201557230.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RGB-LCD/file-20260421201557230.png)

esp_err_t

esp_lcd_panel_reset(esp_lcd_panel_handle_t panel);

	在创建 RGB 屏幕对象后需要进行 RGB 屏幕复位

	参数表

		![file-20260421201557233.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RGB-LCD/file-20260421201557233.png)

esp_err_t esp_lcd_panel_init(esp_lcd_panel_handle_t panel);

	通过上两个步骤的配置，可以对屏幕进行初始化了

	参数表

		![file-20260421201557236.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E5%BC%80%E5%8F%91%E6%9D%BF/RISC-V%E6%9E%B6%E6%9E%84/ESP32-S3%20ESP-IDF%E5%AD%A6%E4%B9%A0/assets/RGB-LCD/file-20260421201557236.png)
