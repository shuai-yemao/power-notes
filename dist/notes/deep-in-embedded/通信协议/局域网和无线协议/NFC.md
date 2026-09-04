> 来源：Deep-In-Embedded / [通信协议/局域网和无线协议/NFC.md](https://github.com/shuai-yemao/Deep-In-Embedded/blob/5fcab575fc20cf681f3e79e163337211097c898a/%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE/%E5%B1%80%E5%9F%9F%E7%BD%91%E5%92%8C%E6%97%A0%E7%BA%BF%E5%8D%8F%E8%AE%AE/NFC.md)

### 简介

红外遥控是一种无线、非接触控制技术，具有抗干扰能力强，信息传输可靠，功耗低，成本低，易实现等显著优点，被诸多电子设备特别是家用电器广泛采用，并越来越多的应用到计算机系统中。

### 特点

红外遥控的编码方式目前广泛使用的是：[[PWM]]（脉冲宽度调制）的 NEC 协议，其特征如下：

1，8 位地址和 8 位指令长度；

2，地址和命令 2 次传输（确保可靠性）；

3，[[PWM]] 脉冲位置调制，以发射红外载波的占空比代表“0”和“1”；

4，载波频率为 38Khz；

5，位时间为 1.125ms 或 2.25ms；

### 时序

在 NEC 协议中，如何为协议中的数据‘0’或者‘1’？这里分开红外接收器和红外发射器。

红外发射器：发送协议数据‘0’ = 发射载波信号 560us + 不发射载波信号 560us

发送协议数据‘1’ = 发射载波信号 560us + 不发射载波信号 1680us

![Pasted image 20251013201640.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE/%E5%B1%80%E5%9F%9F%E7%BD%91%E5%92%8C%E6%97%A0%E7%BA%BF%E5%8D%8F%E8%AE%AE/assets/NFC/Pasted%20image%2020251013201640.png)

红外接收器：接收到协议数据‘0’ = 560us 低电平 + 560us 高电平

接收到协议数据‘1’ = 560us 低电平 + 1680us 高电平

![Pasted image 20251013201701.png](https://github.com/shuai-yemao/Deep-In-Embedded/raw/5fcab575fc20cf681f3e79e163337211097c898a/%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE/%E5%B1%80%E5%9F%9F%E7%BD%91%E5%92%8C%E6%97%A0%E7%BA%BF%E5%8D%8F%E8%AE%AE/assets/NFC/Pasted%20image%2020251013201701.png)

**NEC 遥控指令的数据格式为：同步码头、地址码、地址反码、控制码、控制反码**。

同步码由一个 9ms 的低电平和一个 4.5ms 的高电平组成，地址码、地址反码、控制码、控制反码均是 8

位数据格式。按照低位在前，高位在后的顺序发送。采用反码是为了增加传输的可靠性（可用于校验）。
