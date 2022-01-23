# 前端项目入门指南

[acy-dex-interface 项目链接](https://github.com/ACY-Labs/acy-dex-interface)

## 钱包与链

DeFi（Decentralized Finance）允许用户通过代币（token）的交易来获取利益。

目前常见的DeFi区块链包括 Binance Smart Chain (BSC)、Polygon (Matic) 等。用户在每一种链上都有自己的账本，彼此独立。

在区块链上进行交易时，我们需要使用钱包才能和区块链进行通信，我们常用Metamask进行测试。

[如何使用Metamask？](https://www.youtube.com/watch?v=yWfZnjkhhhg)

[Metamask如何切换网络？](https://autofarm.gitbook.io/autofarm-network/how-tos/defi-beginners-guide/switching-networks-on-metamask)

[如何添加网络？](https://metamask.zendesk.com/hc/en-us/articles/360058992772-Add-a-network-using-Chainlist-Extension-or-Mobile-)

acy-dex-interface目前支持bsc（链号56）和polygon（137）网络。在开发时，我们可以**通过钱包**切换至他们对应的测试网（bsc testnet 97，polygon mumbai testnet 80001）。测试网的钱包账户可以**和开发团队获取**，账户中有足够的token用以调试。

## 项目简介

打个不完全准确的比喻，ACY类似于一家银行。打开[我们项目的网页](https://app.acy.finance/)，目前的核心模块包括以下5个。标题括号对应页面的目录，例如Exchange（pages/swap）表示https://app.acy.finance/#/exchange对应`src/pages/swap`。

### Exchange（pages/swap）

类似外汇交易：打算兑换token的用户可以用token1换token2。ACY有一个神奇的多路径exchange算法，使得兑换率更偏向用户。在兑换金额之上，用户也需要支付一定的交易费（Fee）。

### Liquidity（pages/pool）

类似活期存款：打算挣钱的用户（Liquidity provider）可以给exchange提供兑换用的token。这些用户把资金存入池子（Liquidity pool）中，只要有人进行exchange，他们支付的部分手续费会被投入到池子里，这样provider在移除自己投入的**百分比**时，就可以带走部分Fee，即获得了利润。通常需要同时提供2种token。

用户向Liquidity pool提供资金（add liquidity）后，会获得凭证（Liquidity pool token，简称 LP Token）。将LP Token归还给pool后（即remove liquidity，移除流动性），我们可以取出自己投资的**百分比**

投资需谨慎，关于风险方面请参考 impermanent loss。

### Farm（pages/farm）

类似定期存款：LP Token持有者可以将自己的LP Token锁进farm以赚取更高的回报。到期后会自动解锁，用户才能取回LP token，来移除流动性（remove liquidity）。

### LaunchPad（pages/launchPad）

类似广告板：用户可以了解到有什么平台将会上线，同时通过我们平台来购买新项目的token。

### Market（pages/market）

该页汇总Exchange、Liquidity的数据，包括token和liquidity pool的交易量（volume）、锁定的总价值（total value locked / TVL）。

## 启动项目与commit

建议把项目安装在SSD上，运行速度快。第一次clone好项目后，记得通过`npm install`安装依赖库。安装过程中可能会遇到冲突，可以咨询技术群；安装好后将会出现一个新的`node_modules`文件夹。

`npm run start`：启动项目。稍等5分钟后命令行里会有一个localhost的链接，可以在开发中预览当前的网页。

提交commit的方式请参考Mark的文件。

## 重要文件夹

项目原代码都在`src`下，下面介绍部分重要的文件夹：

### Pages

该文件夹下包含所有网页上显示的页面。关于网址和页面文件的对应关系请参考`acy-dex-interface\config\router.config.js`。

### Layouts

本站所有网页Header、Footer的源文件都在该文件夹下。

### Components

使用VS Code开发时，在代码中出现的组件上单击并按F12，VS Code会打开对应组件代码。组件都保存在`src/components`文件夹下。

### Constants

对应不同的链（BSC、Polygon），项目需要加载不同的token列表、API请求前缀、路由地址（router contract address）等，这些都作为常量出现在代码中。

调用方式有两种：

1. React component：`useConstantLoader()`会返回一个state，代码可以再从中destruct出需要的常量。使用方法可参考`src/components/SwapComponent` 。
   该方法返回的是一个react state，因此切换钱包的链号后，该state也会发生变化（可能有少许延时，因为`useConstantLoader`是React custom hook）。
2. 普通JavaScript函数：`ConstantLoader(<chainId>)`会返回一个object，可以从中destruct出需要的常量。
   **注意，**因为该方法返回的是object，因此每次用到常量前必须重新调用一次，以获得最新的常量object。

### Models

（可跳过）

项目的全局state，类似Redux。本项目是用Umi.js搭建的，因此包含2种models：全局models以及页面models。详情请参考[文档](https://v2.umijs.org/zh/guide/with-dva.html#model-%E6%B3%A8%E5%86%8C)。

### Acy-dex-swap

（可跳过）

尤其是`core`目录下的文件，负责向链上合约发送读/写请求。按页面分类，函数与页面的对应关系为：

1. Exchange：swap.js
2. Liquidity：addLiquidity.js, 和removeLiquidity.js
3. Farm：farm.js
4. LaunchPad：launchPad.js

[如何调用合约上的函数？](https://ethereum.stackexchange.com/questions/79510/how-to-call-function-from-smartcontract)，[视频](https://www.youtube.com/watch?v=4cPEGO4NAao)

#### 需要了解的概念与知识

RPC：区块链服务的接入点，这是一个URL。

ABI：合约函数的目录，这是一个JSON。

web3.js或ethers.js：与区块链交互的js库。

（开发时可参考）[Uniswap文档](https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02)：exchange、liquidity的合约函数文档。可以参考Router02、Pair、Pair (ERC-20)。

#### 开发者工具

bscScan.com或polygonScan.com：查询交易的overview和logs。

#### 😵 具体函数在做什么？

若不是开发该模块，可以跳过本部分。

swap: approve -> swap

add liquidity: approve token0, approve token1 -> add liquidity

remove liquidity: sign / approve LP token -> remove liquidity



