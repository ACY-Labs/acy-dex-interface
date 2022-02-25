/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-return-await */
/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
import {
    AcyCard,
    AcyIcon,
    AcyPeriodTime,
    AcyTabs,
    AcyCuarrencyCard,
    AcyConnectWalletBig,
    AcyModal,
    AcyInput,
    AcyCoinItem,
    AcyLineChart,
    AcyConfirm,
    AcyApprove,
    AcyButton,
    AcyDescriptions,
    AcySmallButton,
} from '@/components/Acy';
import TokenSelectorModal from "@/components/TokenSelectorModal";
// ymj swapBox components start
import { PriceBox } from './components/PriceBox';
import { DetailBox } from './components/DetailBox';

import { MARKET, LIMIT, LONG, SHORT, SWAP } from './constant'
import { 
    getNextToAmount, 
    getNextFromAmount, 
    getTokenInfo, 
    parseValue, 
    getUsd, 
    expandDecimals, 
    formatAmountFree,
    formatAmount,
    shouldRaiseGasError,
    helperToast,
    replaceNativeTokenAddress,
    isTriggerRatioInverted,
    bigNumberify
} from '@/acy-dex-futures/utils'
import { USD_DECIMALS, BASIS_POINTS_DIVISOR, MARGIN_FEE_BASIS_POINTS } from '@/acy-dex-futures/utils'
import { getInfoTokens_test } from './utils'
import Pattern from '@/utils/pattern'

// swapBox compontent end

import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress, abbrNumber } from '@/utils/utils';
import axios from 'axios';

import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
    Error,
    approve,
    calculateGasMargin,
    checkTokenIsApproved,
    computeTradePriceBreakdown,
    getAllowance,
    getContract,
    getRouterContract,
    getUserTokenBalance,
    getUserTokenBalanceRaw,
    isZero,
    supportedTokens,
    parseArbitrageLog,
} from '@/acy-dex-swap/utils/index';

//hj add, get rid of getContract 
import { getContractAddress } from '@/acy-dex-futures/utils/Addresses'


import { ethers } from "ethers";
const { AddressZero } = ethers.constants;

import * as Api from '@/acy-dex-futures/core/Perpetual'

import { swapGetEstimated, swap } from '@/acy-dex-swap/core/swap';

import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';
import Router from "@/acy-dex-futures/abis/Router.json";


import {
    Token,
    TokenAmount,
    Pair,
    TradeType,
    Route,
    Trade,
    Fetcher,
    Percent,
    // Router,
    // WETH,
    // ETHER,
    CurrencyAmount,
    InsufficientReservesError,
} from '@acyswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { hexlify } from '@ethersproject/bytes';

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button, Input, Icon, Radio, Tabs, Slider } from 'antd';
import { RiseOutlined, FallOutlined, LineChartOutlined, FieldTimeOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;

import { Alert } from 'antd';
import spinner from '@/assets/loading.svg';
import moment from 'moment';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';

import { AcyRadioButton } from '@/components/AcyRadioButton';

import styled from "styled-components";
const StyledRadioButton = styled(Radio.Button)`
  background-color: #29292c;
  border: none;
  border-left: none !important;
`;

const StyledSlider = styled(Slider)`
  .ant-slider-track{
    background: #be4d00;
  }
  .ant-slider-rail {
    background: #3b0000;
  }
  .ant-slider-dot {
    background: transparent;
  }
`;

// var CryptoJS = require("crypto-js");
const SwapComponent = props => {
//hj find in '@/pages/perpetual 的<perpetual component
    // ymj props
    const { account, library, chainId, tokenList: INITIAL_TOKEN_LIST, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader(props);
    console.log("constant loader chainid", chainId);
    const { dispatch, onSelectToken0, onSelectToken1, onSelectToken, token, isLockedToken1 = false } = props;
    const { profitsIn, liqPrice } = props;
    const { entryPriceMarket, exitPrice, borrowFee } = props;
    const { infoTokens_test, usdgSupply, positions } = props;
    // const { isConfirming, setIsConfirming, isPendingConfirmation, setIsPendingConfirmation } = props;

    // 选择货币的弹窗
    const [visible, setVisible] = useState(null);

    // 选择货币前置和后置
    const [before, setBefore] = useState(true);

    // 交易对前置货币
    const [token0, setToken0] = useState(INITIAL_TOKEN_LIST[0]);
    // 交易对后置货币
    const [token1, setToken1] = useState(INITIAL_TOKEN_LIST[1]);

    // 交易对前置货币余额
    const [token0Balance, setToken0Balance] = useState('0');
    // 交易对后置货币余额
    const [token1Balance, setToken1Balance] = useState('0');

    // 交易对前置货币兑换量
    const [token0Amount, setToken0Amount] = useState('');
    // 交易对后置货币兑换量
    const [token1Amount, setToken1Amount] = useState('');
    // 交易中用户使用Flash Arbitrage的额外获利
    const [bonus0, setBonus0] = useState(null);
    const [bonus1, setBonus1] = useState(null);

    const [token0BalanceShow, setToken0BalanceShow] = useState(false);
    const [token1BalanceShow, setToken1BalanceShow] = useState(false);



    // when exactIn is true, it means the firt line
    // when exactIn is false, it means the second line
    const [exactIn, setExactIn] = useState(true);

    const [needApprove, setNeedApprove] = useState(false);
    const [approveAmount, setApproveAmount] = useState('0');
    const [approveButtonStatus, setApproveButtonStatus] = useState(true);

    // Breakdown shows the estimated information for swap

    // let [estimatedStatus,setEstimatedStatus]=useState();
    const [swapBreakdown, setSwapBreakdown] = useState();
    const [swapButtonState, setSwapButtonState] = useState(false);
    const [swapButtonContent, setSwapButtonContent] = useState('Connect to Wallet');
    const [swapStatus, setSwapStatus] = useState();


    const [pair, setPair] = useState();
    const [route, setRoute] = useState();
    const [trade, setTrade] = useState();
    const [slippageAdjustedAmount, setSlippageAdjustedAmount] = useState();
    const [minAmountOut, setMinAmountOut] = useState();
    const [maxAmountIn, setMaxAmountIn] = useState();
    const [wethContract, setWethContract] = useState();
    const [wrappedAmount, setWrappedAmount] = useState();
    const [showSpinner, setShowSpinner] = useState(false);

    const [methodName, setMethodName] = useState();
    const [midTokenAddress, setMidTokenAddress] = useState();
    const [poolExist, setPoolExist] = useState(true);

    // ymj useState
    const [fromTokenAddress, setFromTokenAddress] = useState("0x0000000000000000000000000000000000000000");
    const [toTokenAddress, setToTokenAddress] = useState("0xf97f4df75117a78c1A5a0DBb814Af92458539FB4");
    const [fromTokenInfo, setFromTokenInfo] = useState();
    const [toTokenInfo, setToTokenInfo] = useState();
    const [mode, setMode] = useState(LONG);
    const [type, setType] = useState(MARKET);
    const [fees, setFees] = useState(0.1);
    const [leverage, setLeverage] = useState(5);
    const [entryPriceLimit, setEntryPriceLimit] = useState(0);
    const [anchorOnFromAmount, setAnchorOnFromAmount] = useState(true);
    const [fromValue, setFromValue] = useState("");
    const [toValue, setToValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); //hj add
    const [triggerPriceValue, setTriggerPriceValue] = useState("");
    const [priceValue, setPriceValue] = useState('');
    const [entryMarkPrice, setEntryMarkPrice] = useState('');
    const [pendingTxns, setPendingTxns] = useState([]); //hj add from
    const [triggerRatioValue, setTriggerRatioValue] = useState("");
    const triggerRatioInverted = useMemo(() => {
        return isTriggerRatioInverted(fromTokenInfo, toTokenInfo);
    }, [toTokenInfo, fromTokenInfo]);

    const triggerRatio = useMemo(() => {
        if (!triggerRatioValue) {
            return bigNumberify(0);
        }
        let ratio = parseValue(triggerRatioValue, USD_DECIMALS);
        if (ratio.eq(0)) {
            return bigNumberify(0);
        }
        if (triggerRatioInverted) {
            ratio = PRECISION.mul(PRECISION).div(ratio);
        }
        return ratio;
    }, [triggerRatioValue, triggerRatioInverted]);
    //hj add to



    const connectWalletByLocalStorage = useConnectWallet();
    const { activate } = useWeb3React();


    // ymj const
    const individualFieldPlaceholder = 'Enter amount';
    const dependentFieldPlaceholder = 'Estimated value';
    const slippageTolerancePlaceholder = 'Please input a number from 1.00 to 100.00';
    // 先写固定地址
    //const fromToken = getToken(chainId, fromTokenAddress); 
    //const toToken = getToken(chainId, toTokenAddress);
    const infoTokens = getInfoTokens_test();
    const fromToken = {
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        isNative: true,
        isShortable: true,
        name: "Ethereum",
        symbol: "ETH"
    };
    const toToken = {
        address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
        decimals: 18,
        isStable: false,
        name: "Chainlink",
        symbol: "LINK",
    };
    // const fromTokenAddress = BigNumber.from(fromToken.address);
    // const toTokenAddress = BigNumber.from(toToken.address);
    //const fromTokenAddress = fromToken.address;
    //const toTokenAddress = toToken.address;
    // const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
    // const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
    const fromAmount = parseValue(fromValue, fromToken && fromToken.decimals);
    const toAmount = parseValue(toValue, toToken && toToken.decimals);
    const isMarketOrder = type === MARKET;
    const triggerPriceUsd = type === MARKET
        ? 0
        : parseValue(triggerPriceValue, USD_DECIMALS);
    // const indexTokenAddress = toTokenAddress === AddressZero ? nativeTokenAddress : toTokenAddress;
    const indexTokenAddress = toTokenAddress;
    const shortCollateralAddress = indexTokenAddress; // need change
    const collateralTokenAddress = mode === LONG
        ? indexTokenAddress
        : shortCollateralAddress;
    //const collateralToken = getToken(chainId, collateralTokenAddress);
    const collateralToken = {
        name: 'Chainlink',
        symbol: 'LINK',
        decimals: 18,
        address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
        isStable: false
    };
    const shortCollateralToken = getTokenInfo(infoTokens, shortCollateralAddress);
    const totalTokenWeights = BigNumber.from("0x0186a0")
    const fromUsdMin = getUsd(fromAmount, fromTokenAddress, false, infoTokens);
    const toUsdMax = getUsd(
        toAmount,
        toTokenAddress,
        true,
        infoTokens,
        mode,
        triggerPriceUsd
    );
    const perpetualMode = [LONG, MARKET];
    const perpetualType = [{
        name: 'Market',
        icon: <LineChartOutlined />,
        id: MARKET,
    }, {
        name: 'Limit',
        icon: <FieldTimeOutlined />,
        id: LIMIT,
    }];
    const leverageSlider = {
        2: {
            style: {
                color: '#b5b6b6',
            },
            label: '2x'
        },
        5: {
            style: {
                color: '#b5b6b6',
            },
            label: '5x'
        },
        10: {
            style: {
                color: '#b5b6b6',
            },
            label: '10x'
        },
        15: {
            style: {
                color: '#b5b6b6',
            },
            label: '15x'
        },
        20: {
            style: {
                color: '#b5b6b6',
            },
            label: '20x'
        },
        25: {
            style: {
                color: '#b5b6b6',
            },
            label: '25x'
        },
        30: {
            style: {
                color: '#b5b6b6',
            },
            label: '30x'
        }
    };

    // ymj useEffect
    // initialization
    useEffect(() => {
        console.log("chainId here", chainId);
        console.log('ymj 1', infoTokens_test, infoTokens)
        setFromTokenInfo(getTokenInfo(infoTokens, fromTokenAddress));
        setToTokenInfo(getTokenInfo(infoTokens, toTokenAddress));
        //setEntryMarkPrice(mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice);
        if (!INITIAL_TOKEN_LIST) return
        setVisible(null);
        // 选择货币前置和后置
        setBefore(true);
        // 交易对前置货币
        setToken0(INITIAL_TOKEN_LIST[0]);
        // 交易对后置货币
        setToken1(INITIAL_TOKEN_LIST[1]);
        // 交易对前置货币余额
        setToken0Balance('0');
        // 交易对后置货币余额
        setToken1Balance('0');
        // 交易对前置货币兑换量
        setToken0Amount('');
        // 交易对后置货币兑换量
        setToken1Amount('');
        // 交易中用户使用Flash Arbitrage的额外获利
        setBonus0(null);
        setBonus1(null);
        setToken0BalanceShow(false);
        setToken1BalanceShow(false);
        setExactIn(true);
        setNeedApprove(false);
        setApproveAmount('0');
        setApproveButtonStatus(true);
        // Breakdown shows the estimated information for swap
        // let [estimatedStatus,setEstimatedStatus]=useState();
        setSwapBreakdown();
        setSwapButtonState(false);
        setSwapButtonContent('Connect to Wallet');
        setSwapStatus();
        setPair();
        setRoute();
        setTrade();
        setSlippageAdjustedAmount();
        setMinAmountOut();
        setMaxAmountIn();
        setWethContract();
        setWrappedAmount();
        setShowSpinner(false);
        setMethodName();
        setMidTokenAddress();
        setPoolExist(true);
    }, [chainId])

    useCallback(() => {
        setFromTokenInfo(getTokenInfo(infoTokens, fromTokenAddress));
        setToTokenInfo(getTokenInfo(infoTokens, toTokenAddress));
        //setEntryMarkPrice(mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice);
    }, [
        fromTokenAddress,
        toTokenAddress
    ]);
    useCallback(() => {
        setEntryMarkPrice(mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice);
    }, [
        toTokenInfo
    ]);

    // connect to page model, reflect changes of pair ratio in this component
    useEffect(() => {
        const { swap: { token0: modelToken0, token1: modelToken1 } } = props;
        setToken0(modelToken0);
        setToken1(modelToken1);
    }, [props.swap]);

    useEffect(() => {
        if (token) {
            setToken0(token.token0);
            setToken1(token.token1);
        }
    }, [token]);

    useEffect(
        () => {
            if (!account || !chainId || !library) {
                setToken0BalanceShow(false);
                setToken1BalanceShow(false);
                return;
            }
            const _token0 = INITIAL_TOKEN_LIST[0];
            const _token1 = INITIAL_TOKEN_LIST[1];
            setToken0(_token0);
            setToken1(_token1);
            async function refreshBalances() {
                setToken0Balance(await getUserTokenBalance(_token0, chainId, account, library).catch(e => console.log("refrersh balances error", e)));
                setToken0BalanceShow(true);
                setToken1Balance(await getUserTokenBalance(_token1, chainId, account, library).catch(e => console.log("refrersh balances error", e)));
                setToken1BalanceShow(true);
            }
            try {
                refreshBalances();
            } catch {
                e => console.log("refrersh balances error", e)
            }
        },
        [account, INITIAL_TOKEN_LIST]
    );
    // t0 or t1 changed
    useEffect(
        async () => {
            await t0Changed(token0Amount);
        },
        [
            token0,
            token1,
            exactIn,
            chainId,
            library,
            account,
        ]
    );
    useEffect(
        async () => {
            await t1Changed(token1Amount);
        },
        [
            token0,
            token1,
            exactIn,
            chainId,
            library,
            account,
        ]
    );
    // connect wallet
    useEffect(
        () => {
            if (account == undefined) {
                setSwapButtonState(false);
                setSwapButtonContent('Connect to Wallet');
            }
            // else {
            //     setSwapButtonState(true);
            //     setSwapButtonContent('Swap');
            // }

        },
        [account]
    );

    useEffect(() => {
        if (type == MARKET && entryPriceMarket) {
            setEntryPriceLimit(entryPriceMarket);
        }
        else if (type == LIMIT) {
            setEntryPriceLimit(0)
        }

    }, [type]);

    useEffect(() => {
        if (mode === LONG || mode === SHORT)
            updateLeverageAmounts();
        else {
            // swap function
        }
    }, [
        anchorOnFromAmount,
        fromAmount,
        toAmount,
        fromToken,
        toToken,
        fromTokenAddress,
        toTokenAddress,
        infoTokens,
        fromUsdMin,
        toUsdMax,
        isMarketOrder,
        type,
        triggerPriceUsd,
        //triggerRatio,
        //hasLeverageOption,
        leverage,
        usdgSupply,
        totalTokenWeights,
        chainId,
        collateralTokenAddress,
        indexTokenAddress]);


    // ymj function
    // token1Amount is changed according to token0Amount
    const t0Changed =
        async (e) => {
            if (!token0 || !token1) return;
            if (!exactIn) return;
            setAnchorOnFromAmount(true);
        }

    // token0Amount is changed according to token1Amount
    const t1Changed =
        async (e) => {
            if (!token0 || !token1) return;
            if (exactIn) return;
            setAnchorOnFromAmount(false);
        }

    const updateLeverageAmounts = () => {
        if (!leverage) {
            return;
        }
        if (anchorOnFromAmount) {
            if (!fromAmount) {
                setToValue("");
                setToken1Amount("");
                return;
            }

            const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
            console.log("ymj 111", toTokenInfo);
            if (
                toTokenInfo &&
                toTokenInfo.maxPrice &&
                fromUsdMin &&
                fromUsdMin.gt(0)
            ) {
                const leverageMultiplier = parseInt(
                    leverage * BASIS_POINTS_DIVISOR
                );
                const toTokenPriceUsd =
                    type === !MARKET && triggerPriceUsd && triggerPriceUsd.gt(0)
                        ? triggerPriceUsd
                        : toTokenInfo.maxPrice;

                const { feeBasisPoints } = getNextToAmount(
                    chainId,
                    fromAmount,
                    collateralTokenAddress,
                    indexTokenAddress,
                    infoTokens,
                    undefined,
                    undefined,
                    usdgSupply,
                    totalTokenWeights
                );
                let fromUsdMinAfterFee = fromUsdMin;
                if (feeBasisPoints) {
                    fromUsdMinAfterFee = fromUsdMin
                        .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR);
                }

                const baseToUsd = fromUsdMinAfterFee
                    .mul(leverageMultiplier)
                    .div(BASIS_POINTS_DIVISOR);
                fromUsdMinAfterFee = fromUsdMinAfterFee.sub(
                    baseToUsd.mul(MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
                );
                const nextToUsd = fromUsdMinAfterFee
                    .mul(leverageMultiplier)
                    .div(BASIS_POINTS_DIVISOR);
                const nextToAmount = nextToUsd
                    .mul(expandDecimals(1, toToken.decimals))
                    .div(toTokenPriceUsd);
                const nextToValue = formatAmountFree(
                    nextToAmount,
                    toToken.decimals,
                    toToken.decimals
                );

                console.log("ymj updateSwapAmounts 456", nextToValue);
                setToValue(nextToValue);
                setToken1Amount(nextToValue);
            }
            return;
        }

        if (!toAmount) {
            setFromValue("");
            setToken0Amount("");
            return;
        }

        const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
        if (
            fromTokenInfo &&
            fromTokenInfo.minPrice &&
            toUsdMax &&
            toUsdMax.gt(0)
        ) {
            const leverageMultiplier = parseInt(
                leverage * BASIS_POINTS_DIVISOR
            );
            const baseFromAmountUsd = toUsdMax
                .mul(BASIS_POINTS_DIVISOR)
                .div(leverageMultiplier);
            let fees = toUsdMax
                .mul(MARGIN_FEE_BASIS_POINTS)
                .div(BASIS_POINTS_DIVISOR);

            const { feeBasisPoints } = getNextToAmount(
                chainId,
                fromAmount,
                collateralTokenAddress,
                indexTokenAddress,
                infoTokens,
                undefined,
                undefined,
                usdgSupply,
                totalTokenWeights
            );
            console.log("ymj updateSwapAmounts fee2", feeBasisPoints);
            if (feeBasisPoints) {
                const swapFees = baseFromAmountUsd
                    .mul(feeBasisPoints)
                    .div(BASIS_POINTS_DIVISOR);
                fees = fees.add(swapFees);
            }

            const nextFromUsd = baseFromAmountUsd.add(fees);
            const nextFromAmount = nextFromUsd
                .mul(expandDecimals(1, fromToken.decimals))
                .div(fromTokenInfo.minPrice);
            const nextFromValue = formatAmountFree(
                nextFromAmount,
                fromToken.decimals,
                fromToken.decimals
            );
            setFromValue(nextFromValue);
            setToken0Amount(nextFromValue);
        }
    };

    const onCoinClick = async token => {
        onCancel();
        if (before) {
            if (account == undefined) {
                alert('Please connect to your account');
            } else {
                console.log('SET TOKEN 0');
                console.log(onSelectToken0);
                onSelectToken0(token);
                setToken0(token);
                setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
                setToken0BalanceShow(true);
            }
        } else {
            if (account == undefined) {
                alert('Please connect to your account');
            } else {
                onSelectToken1(token);
                setToken1(token);
                setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
                setToken1BalanceShow(true);
            }
        }
    };

    const onClickCoin = () => {
        setVisible(true);
    };
    const onCancel = () => {
        setVisible(false);
    };

    const onSwitchCoinCard = () => {
        let tempToken = token1;
        let tempAmount = token1Amount;
        let tempBalance = token1Balance;

        setToken1(token0);
        setToken1Amount(token0Amount);
        setToken1Balance(token0Balance);

        setToken0(tempToken);
        setToken0Amount(tempAmount);
        setToken0Balance(tempBalance);
    };

    const wrap = async () => {
        setIsSubmitting(true);

        const contract = new ethers.Contract(
            getContractAddress(chainId, "NATIVE_TOKEN"),
            WETHABI,
            library.getSigner()
        );
        Api.callContract(chainId, contract, "deposit", {
            value: fromAmount,
            sentMsg: "Swap submitted!",
            successMsg: `Swapped ${formatAmount(
                fromAmount,
                fromToken.decimals,
                4,
                true
            )} ${fromToken.symbol} for ${formatAmount(
                toAmount,
                toToken.decimals,
                4,
                true
            )} ${toToken.symbol}`,
            failMsg: "Swap failed.",
            setPendingTxns
        })
            .then(async res => { })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const unwrap = async () => {
        setIsSubmitting(true);

        const contract = new ethers.Contract(
            getContractAddress(chainId, "NATIVE_TOKEN"),
            WETHABI,
            library.getSigner()
        );
        Api.callContract(chainId, contract, "withdraw", [fromAmount], {
            sentMsg: "Swap submitted!",
            failMsg: "Swap failed.",
            successMsg: `Swapped ${formatAmount(
                fromAmount,
                fromToken.decimals,
                4,
                true
            )} ${fromToken.symbol} for ${formatAmount(
                toAmount,
                toToken.decimals,
                4,
                true
            )} ${toToken.symbol}`,
            setPendingTxns
        })
            .then(async res => { })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const swap = async () => {
        if (fromToken.isNative && toToken.isWrapped) {
            wrap();
            return;
        }

        if (fromTokenAddress.isWrapped && toToken.isNative) {
            unwrap();
            return;
        }

        setIsSubmitting(true);
        let path = [fromTokenAddress, toTokenAddress];
        if (anchorOnFromAmount) {
            const { path: multiPath } = getNextToAmount(
                chainId,
                fromAmount,
                fromTokenAddress,
                toTokenAddress,
                infoTokens,
                undefined,
                undefined,
                usdgSupply,
                totalTokenWeights
            );
            if (multiPath) {
                path = multiPath;
            }
        } else {
            const { path: multiPath } = getNextFromAmount(
                chainId,
                toAmount,
                fromTokenAddress,
                toTokenAddress,
                infoTokens,
                undefined,
                undefined,
                usdgSupply,
                totalTokenWeights
            );
            if (multiPath) {
                path = multiPath;
            }
        }

        let method;
        let contract;
        let value;
        let params;
        let minOut;
        if (
            shouldRaiseGasError(
                getTokenInfo(infoTokens, fromTokenAddress),
                fromAmount
            )
        ) {
            setIsSubmitting(false);
            setIsPendingConfirmation(true);
            helperToast.error(
                `Leave at least ${formatAmount(DUST_BNB, 18, 3)} ${getConstant(
                    chainId,
                    "nativeTokenSymbol"
                )} for gas`
            );
            return;
        }

        if (!isMarketOrder) {
            minOut = toAmount;
            Api.createSwapOrder(
                chainId,
                library,
                path,
                fromAmount,
                minOut,
                triggerRatio,
                getContractAddress(chainId, "NATIVE_TOKEN"),
                {
                    sentMsg: "Swap Order submitted!",
                    successMsg: "Swap Order created!",
                    failMsg: "Swap Order creation failed",
                    pendingTxns,
                    setPendingTxns
                }
            )
                .then(() => {
                    setIsConfirming(false);
                })
                .finally(() => {
                    setIsSubmitting(false);
                    setIsPendingConfirmation(false);
                });
            return;
        }

        path = replaceNativeTokenAddress(path, getContractAddress(chainId, "NATIVE_TOKEN"));
        method = "swap";
        value = bigNumberify(0);
        if (toTokenAddress === AddressZero) {
            method = "swapTokensToETH";
        }

        minOut = toAmount
            .mul(BASIS_POINTS_DIVISOR - savedSlippageAmount)
            .div(BASIS_POINTS_DIVISOR);
        params = [path, fromAmount, minOut, account];
        if (fromTokenAddress === AddressZero) {
            method = "swapETHToTokens";
            value = fromAmount;
            params = [path, minOut, account];
        }
        contract = new ethers.Contract(
            getContractAddress(chainId, "Router"),
            Router.abi,
            library.getSigner()
        );

        Api.callContract(chainId, contract, method, params, {
            value,
            sentMsg: `Swap ${!isMarketOrder ? " order " : ""} submitted!`,
            successMsg: `Swapped ${formatAmount(
                fromAmount,
                fromToken.decimals,
                4,
                true
            )} ${fromToken.symbol} for ${formatAmount(
                toAmount,
                toToken.decimals,
                4,
                true
            )} ${toToken.symbol}`,
            failMsg: "Swap failed.",
            setPendingTxns
        })
            .then(async () => {
                setIsConfirming(false);
            })
            .finally(() => {
                setIsSubmitting(false);
                setIsPendingConfirmation(false);
            });
    };

    function handleSwap() {
        //when need approval :
        //orderbook approval, setOrders to Open
        //approve from token (in gmx = approve in acy)
        //modal
        //after isSwap
        if (
            fromTokenAddress === AddressZero &&
            toTokenAddress === getContractAddress(chainId, "NATIVE_TOKEN")
        ) {
            wrap();
            return
        }

        if (
            token0Addr === getContractAddress(chainId, "NATIVE_TOKEN") &&
            token1Addr === AddressZero
        ) {
            unwrap();
            return;
        }
        //setIsConfirming(true);
        //metamask operations
    }

    // swap的交易状态
    const swapCallback = async (status, inputToken, outToken) => {
        // 循环获取交易结果
        const {
            transaction: { transactions },
        } = props;
        // 检查是否已经包含此交易
        const transLength = transactions.filter(item => item.hash == status.hash).length;

        const sti = async (hash) => {
            library.getTransactionReceipt(hash).then(async receipt => {
                console.log(`receiptreceipt for ${hash}: `, receipt);
                // receipt is not null when transaction is done
                if (!receipt)
                    setTimeout(sti(hash), 500);
                else {

                    if (!receipt.status) {
                        setSwapButtonContent("Failed");
                    } else {

                        props.onGetReceipt(receipt.transactionHash, library, account);

                        // set button to done and disabled on default
                        setSwapButtonContent("Done");
                    }

                    const newData = transactions.filter(item => item.hash != hash);
                    dispatch({
                        type: 'transaction/addTransaction',
                        payload: {
                            transactions: newData
                        },
                    });

                }
            });
        }
        sti(status.hash);
    };

    // LONG or SHORT
    const modeSelect = (input) => {
        setMode(input.target.value);
    }
    // MARKET or LIMIT
    const typeSelect = (input) => {
        setType(input);
    }
    const calculateFee = () => {
        return fees * 100;
    }
    const limitOnChange = (e) => {
        const check = Pattern.coinNum.test(e.target.value);
        if (check) {
            setEntryPriceLimit(e.target.value)
            setPriceValue(e.target.value.toString())
            setTriggerPriceValue(e.target.value.toString())
            if (!e.target.value) {
                setEntryPriceLimit(0);
                setPriceValue("")
                setTriggerPriceValue("")
            }
        }
    };
    const markOnClick = (e) => {
        //setTriggerPriceValue(marketPrice.toString());
        setTriggerPriceValue(e.toString());
        setPriceValue(e.toString())

    }
    const leverageSliderOnChange = (e) => {
        setLeverage(e);
    }

    return (
        <div>
            <div>
                <Radio.Group
                    defaultValue={LONG} buttonStyle="solid" className={styles.modeSelector}
                    onChange={modeSelect}>
                    <StyledRadioButton value={LONG} className={styles.modeSubOption}><RiseOutlined />Long</StyledRadioButton>
                    <StyledRadioButton value={SHORT} className={styles.modeSubOption}><FallOutlined />Short</StyledRadioButton>
                    <StyledRadioButton value={SWAP} className={styles.modeSubOption}><FallOutlined />Swap</StyledRadioButton>

                </Radio.Group>
            </div>
            <div>
                <Tabs defaultActiveKey={MARKET} onChange={typeSelect}
                    size={'small'}
                    tabBarGutter={0}
                    type={'line'}
                    tabPosition={'top'}
                    tabBarStyle={{ border: '0px black' }}
                //animated={false}
                >
                    {perpetualType.map(i => (
                        <TabPane tab={<span>{i.icon}{i.name}{' '}</span>} key={i.id}>
                        </TabPane>
                    ))}
                </Tabs>
            </div>
            <AcyCuarrencyCard
                icon="eth"
                title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(3)}`}
                //coin={(token0 && token0.symbol) || 'Select'}
                coin={(fromTokenInfo && fromTokenInfo.symbol) || 'Select'}
                logoURI={token0 && token0.logoURI}
                yuan="566.228"
                dollar={`${token0Balance}`}
                //token={token0Amount}
                token={fromValue}
                bonus={!exactIn && bonus0}
                showBalance={token1BalanceShow}
                onChoseToken={() => {
                    onClickCoin();
                    setBefore(true);
                }}
                onChangeToken={e => {
                    //setToken0Amount(e);
                    setFromValue(e)
                    setExactIn(true);
                    t0Changed(e);
                }}
                library={library}
            />

            <div
                className={styles.arrow}
                disabled={isLockedToken1}
                onClick={() => {
                    if (!isLockedToken1) {
                        onSwitchCoinCard();
                    }

                }}
            >
                <Icon style={{ fontSize: '16px' }} type="arrow-down" />
            </div>

            <AcyCuarrencyCard
                icon="eth"
                title={token1BalanceShow && `Balance: ${parseFloat(token1Balance).toFixed(3)}`}
                coin={(token1 && token1.symbol) || 'Select'}
                //coin={(toTokenInfo && toTokenInfo.symbol) || 'Select'}
                logoURI={token1 && token1.logoURI}
                yuan="566.228"
                dollar={`${token1Balance}`}
                //token={token1Amount}
                token={toValue}
                bonus={exactIn && bonus1}
                showBalance={token1BalanceShow}
                onChoseToken={() => {
                    onClickCoin();
                    setBefore(false);
                }}
                onChangeToken={e => {
                    // setToken1ApproxAmount(e);
                    //setToken1Amount(e);
                    setToValue(e);
                    setExactIn(false);
                    t1Changed(e);
                }}
                isLocked={isLockedToken1}
                library={library}
            />

            {type === LIMIT &&
                <div className={styles.priceBox}>
                    <PriceBox
                        onChange={limitOnChange}
                        markOnClick={markOnClick}
                        priceValue={priceValue}
                        toTokenInfo={toTokenInfo}
                        mode={mode}
                    />
                </div>
            }
            {mode !== SWAP &&
                <div>
                    <AcyDescriptions>
                        <div className={styles.breakdownTopContainer}>
                            <div className={styles.slippageContainer}>
                                <span style={{ fontWeight: 600 }}>Leverage ymj</span>
                                <span className={styles.leverageSlider}>
                                    <StyledSlider marks={leverageSlider} defaultValue={leverage} max={30.51} min={1.10} onChange={leverageSliderOnChange} step={0.1}
                                        style={{ color: 'red' }} />
                                </span>
                            </div>
                        </div>
                    </AcyDescriptions>
                    <DetailBox
                        leverage={leverage}
                        shortOrLong={mode}
                        marketOrLimit={type}
                        profitsIn={profitsIn}
                        entryPriceLimit={entryPriceLimit}
                        liqPrice={liqPrice}
                        entryPriceMarket={entryPriceMarket}
                        exitPrice={exitPrice}
                        borrowFee={borrowFee}
                        token1Symbol={token1.symbol}
                        fromUsdMin={fromUsdMin}
                        toUsdMax={toUsdMax}
                        toTokenInfo={toTokenInfo}
                        triggerPriceValue={triggerPriceValue}
                    />
                </div>
            }
            {mode === SWAP &&
                <DetailBox
                    leverage={leverage}
                    shortOrLong={mode}
                    marketOrLimit={type}
                    profitsIn={profitsIn}
                    entryPriceLimit={entryPriceLimit}
                    liqPrice={liqPrice}
                    entryPriceMarket={entryPriceMarket}
                    exitPrice={exitPrice}
                    borrowFee={borrowFee}
                    token1Symbol={token1.symbol}
                    fromUsdMin={fromUsdMin}
                    toUsdMax={toUsdMax}
                    toTokenInfo={toTokenInfo}
                    triggerPriceValue={triggerPriceValue}
                />
            }
            {needApprove
                ? <div>
                    <AcyButton
                        style={{ marginTop: '25px' }}
                        disabled={!approveButtonStatus}
                        onClick={async () => {
                            setShowSpinner(true);
                            setApproveButtonStatus(false);
                            const state = await approve(token0.address, approveAmount, library, account);
                            setApproveButtonStatus(true);
                            setShowSpinner(false);

                            if (state) {
                                setSwapButtonState(true);
                                setSwapButtonContent('Swap');
                                setApproveButtonStatus(false);
                                setNeedApprove(false);
                                console.log("test needApprove false")
                            }
                        }}
                    >
                        Approve{' '}
                        {showSpinner && <Icon type="loading" />}
                    </AcyButton>{' '}
                </div>

                : <AcyButton
                    style={{ marginTop: '25px' }}
                    disabled={!swapButtonState}
                    onClick={() => {
                        if (account == undefined) {
                            // connectWalletByLocalStorage();
                        } else {
                            //hj TODO
                            // if ( currentTab == "swap" ) {
                            //     setSwapButtonState( false )
                            //     handleSwap();
                            // }
                            console.log("ready for function ymj");
                        }
                    }}
                >
                    {swapButtonContent}
                </AcyButton>
            }

            <AcyDescriptions>
                {swapStatus && <AcyDescriptions.Item> {swapStatus}</AcyDescriptions.Item>}
            </AcyDescriptions>

            <TokenSelectorModal
                onCancel={onCancel} width={400} visible={visible} onCoinClick={onCoinClick}
            />
        </div>
    );
};

export default connect(({ global, transaction, swap, loading }) => ({
    global,
    transaction,
    account: global.account,
    swap,
    loading: loading.global,
}))(SwapComponent);

