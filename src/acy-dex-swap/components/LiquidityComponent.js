import {useWeb3React} from "@web3-react/core";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useCallback, useEffect, useState} from "react";
import {
    ACYSwapErrorStatus,
    approve,
    calculateGasMargin,
    calculateSlippageAmount,
    checkTokenIsApproved,
    getRouterContract,
    getTokenTotalSupply,
    getUserTokenBalance,
    getUserTokenBalanceRaw,
    INITIAL_ALLOWED_SLIPPAGE,
    supportedTokens,
} from "../utils";

import {Alert, Button, Dropdown, Form, FormControl, InputGroup} from "react-bootstrap";
import {
    CurrencyAmount,
    ETHER,
    FACTORY_ADDRESS,
    Fetcher,
    InsufficientReservesError,
    Percent,
    Token,
    TokenAmount,
    WETH,
} from "@uniswap/sdk";
import {BigNumber} from "@ethersproject/bignumber";
import {parseUnits} from "@ethersproject/units";


// get the estimated amount of the other token required when adding liquidity, in readable string.
export async function getEstimated(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    setToken0Amount,
    setToken1Amount,
    setNeedApproveToken0,
    setNeedApproveToken1,
    setApproveAmountToken0,
    setApproveAmountToken1,
    setApproveToken0ButtonShow,
    setApproveToken1ButtonShow,
    setLiquidityBreakdown,
    setButtonContent,
    setButtonStatus,
    setLiquidityStatus,
    setPair,
    setNoLiquidity,
    setParsedToken0Amount,
    setParsedToken1Amount,
    setArgs,
    setValue
) {
    let status = await (async () => {
        setNeedApproveToken0(false);
        setNeedApproveToken1(false);
        setApproveAmountToken0("0");
        setApproveAmountToken1("0");
        setApproveToken0ButtonShow(false);
        setApproveToken1ButtonShow(false);
        setLiquidityBreakdown("");
        setButtonContent("loading...");
        setButtonStatus(false);
        setLiquidityStatus("");

        console.log(FACTORY_ADDRESS);

        let router = getRouterContract(library, account);
        let slippage = allowedSlippage * 0.01;
        let {
            address: inToken0Address,
            symbol: inToken0Symbol,
            decimal: inToken0Decimal,
            amount: inToken0Amount,
        } = inputToken0;
        let {
            address: inToken1Address,
            symbol: inToken1Symbol,
            decimal: inToken1Decimal,
            amount: inToken1Amount,
        } = inputToken1;

        if (!inputToken0.symbol || !inputToken1.symbol)
            return new ACYSwapErrorStatus("please choose tokens");
        if (exactIn && inToken0Amount == "0")
            return new ACYSwapErrorStatus("token0Amount is 0");
        if (!exactIn && inToken1Amount == "0")
            return new ACYSwapErrorStatus("token1Amount is 0");
        if (exactIn && inToken0Amount == "")
            return new ACYSwapErrorStatus("token0Amount is \"\"");
        if (!exactIn && inToken1Amount == "")
            return new ACYSwapErrorStatus("token1Amount is \"\"");
        if (exactIn && (isNaN(parseFloat(inToken0Amount))))
            return new ACYSwapErrorStatus("token0Amount is NaN");
        if (!exactIn && (isNaN(parseFloat(inToken1Amount))))
            return new ACYSwapErrorStatus("token1Amount is NaN");

        let token0IsETH = inToken0Symbol === "ETH";
        let token1IsETH = inToken1Symbol === "ETH";

        console.log(inputToken0);
        console.log(inputToken1);
        if (token0IsETH && token1IsETH) {
            setButtonContent("Doesn't support ETH to ETH");
            setButtonStatus(false);
            return new ACYSwapErrorStatus("Doesn't support ETH to ETH");
        } else if (
            (token0IsETH && inToken1Symbol === "WETH") ||
            (inToken0Symbol === "WETH" && token1IsETH)
        ) {
            setButtonContent("Invalid pair WETH/ETH");
            setButtonStatus(false);
            return new ACYSwapErrorStatus("Invalid pair WETH/ETH");
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("ADD LIQUIDITY");
            console.log("------------------ CONSTRUCT TOKEN ------------------");

            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

            if (token0.equals(token1)) {
                setButtonContent("Equal tokens");
                setButtonStatus(false);
                return new ACYSwapErrorStatus("Equal tokens!");
            }
            // get pair using our own provider
            const pair = await Fetcher.fetchPairData(token0, token1, library)
                .then((pair) => {
                    console.log(pair.reserve0.raw.toString());
                    console.log(pair.reserve1.raw.toString());
                    return pair;
                })
                .catch((e) => {
                    return new ACYSwapErrorStatus(
                        `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
                    );
                });

            console.log("pair");
            console.log(pair);
            setPair(pair);


            let noLiquidity = false;
            if (pair instanceof ACYSwapErrorStatus) {
                noLiquidity = true;
            }
            setNoLiquidity(noLiquidity);
            console.log("------------------ PARSE AMOUNT ------------------");
            // convert typed in amount to BigNumber using ethers.js's parseUnits,

            let parsedAmount;
            try {
                parsedAmount = exactIn
                    ? new TokenAmount(token0, parseUnits(inToken0Amount, inToken0Decimal))
                    : new TokenAmount(token1, parseUnits(inToken1Amount, inToken1Decimal));

            } catch (e) {
                console.log("parsedAmount");
                console.log(e);
                setButtonStatus(false);
                if (e.fault === "underflow"){
                    setButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                }else {
                    setButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }
            }

            let parsedToken0Amount;
            let parsedToken1Amount;

            // this is have pool
            if (!noLiquidity) {
                console.log("estimated dependent amount");
                let dependentTokenAmount;
                if (exactIn) {
                    dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);


                    let token0TokenAmount;
                    try {
                        token0TokenAmount = new TokenAmount(
                            token0,
                            parseUnits(inToken0Amount, inToken0Decimal)
                        );
                    } catch (e) {
                        console.log("token0TokenAmount");
                        console.log(e);
                        setButtonStatus(false);
                        if (e.fault === "underflow"){
                            setButtonContent(e.fault);
                            return new ACYSwapErrorStatus(e.fault);
                        }else {
                            setButtonContent("unknow error");
                            return new ACYSwapErrorStatus("unknow error");
                        }
                    }

                    parsedToken0Amount =
                        token0 === ETHER
                            ? CurrencyAmount.ether(token0TokenAmount.raw)
                            : token0TokenAmount;

                    parsedToken1Amount =
                        token1 === ETHER
                            ? CurrencyAmount.ether(dependentTokenAmount.raw)
                            : dependentTokenAmount;
                    setToken1Amount(dependentTokenAmount.toExact());
                    inToken1Amount = dependentTokenAmount.toExact();
                } else {
                    dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

                    let token1TokenAmount;
                    try{
                        token1TokenAmount = new TokenAmount(
                            token1,
                            parseUnits(inToken1Amount, inToken1Decimal)
                        );
                    }catch(e){
                        console.log("token0TokenAmount");
                        console.log(e);
                        setButtonStatus(false);
                        if (e.fault === "underflow"){
                            setButtonContent(e.fault);
                            return new ACYSwapErrorStatus(e.fault);
                        }else {
                            setButtonContent("unknow error");
                            return new ACYSwapErrorStatus("unknow error");
                        }
                    }


                    parsedToken0Amount =
                        token0 === ETHER
                            ? CurrencyAmount.ether(dependentTokenAmount.raw)
                            : dependentTokenAmount;

                    parsedToken1Amount =
                        token1 === ETHER
                            ? CurrencyAmount.ether(token1TokenAmount.raw)
                            : token1TokenAmount;
                    setToken0Amount(dependentTokenAmount.toExact());
                    inToken0Amount = dependentTokenAmount.toExact();
                }
            } else {
                // this is to create new pools
                if (inToken0Amount === "0" || inToken1Amount === "0") {
                    if (noLiquidity) {
                        setButtonStatus(false);
                        setButtonContent("create new pool");

                        return new ACYSwapErrorStatus(
                            "Creating a new pool, please enter both amounts"
                        );
                    } else {
                        setButtonStatus(false);
                        setButtonContent("add liquidity");
                        return new ACYSwapErrorStatus(
                            "One field is empty, it's probably a new pool"
                        );
                    }
                }

                try{
                    parsedToken0Amount = new TokenAmount(
                        token0,
                        parseUnits(inToken0Amount, inToken0Decimal)
                    );

                    parsedToken1Amount = new TokenAmount(
                        token1,
                        parseUnits(inToken1Amount, inToken1Decimal)
                    );
                } catch(e) {
                    console.log("parsedToken0Amount and parsedToken1Amount");
                    console.log(e);
                    setButtonStatus(false);
                    if (e.fault === "underflow") {
                        setButtonContent(e.fault);
                        return new ACYSwapErrorStatus(e.fault);
                    } else {
                        setButtonContent("unknow error");
                        return new ACYSwapErrorStatus("unknow error");
                    }
                }
            }
            setParsedToken0Amount(parsedToken0Amount);
            setParsedToken1Amount(parsedToken1Amount);

            // check user account balance
            console.log("------------------ CHECK BALANCE ------------------");
            let userToken0Balance = await getUserTokenBalanceRaw(
                token0IsETH
                    ? ETHER
                    : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
                account,
                library
            );

            let userToken1Balance = await getUserTokenBalanceRaw(
                token1IsETH
                    ? ETHER
                    : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol),
                account,
                library
            );

            console.log("token0 balance");
            console.log(userToken0Balance);

            console.log("token1 balance");
            console.log(userToken1Balance);

            let userHasSufficientBalance;
            try {
                userHasSufficientBalance =
                    userToken0Balance.gte(parseUnits(inToken0Amount, inToken0Decimal)) &&
                    userToken1Balance.gte(parseUnits(inToken1Amount, inToken1Decimal));
            }catch(e){
                console.log(userHasSufficientBalance);
                console.log(e);
                setButtonStatus(false);
                if (e.fault === "underflow") {
                    setButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                } else {
                    setButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }

            }

            // quit if user doesn't have enough balance, otherwise this will cause error
            if (!userHasSufficientBalance) {
                setButtonContent("Not enough balance");
                setButtonStatus(false);
                return new ACYSwapErrorStatus("Not enough balance");
            }


            console.log("------------------ BREAKDOWN ------------------");
            if (!noLiquidity) {
                let totalSupply = await getTokenTotalSupply(
                    pair.liquidityToken,
                    library,
                    account
                );
                console.log("Liquidity Minted");
                console.log(pair.liquidityToken);

                try {
                    let liquidityMinted = pair.getLiquidityMinted(
                        totalSupply,
                        parsedToken0Amount,
                        parsedToken1Amount
                    );
                    let poolTokenPercentage = new Percent(
                        liquidityMinted.raw,
                        totalSupply.add(liquidityMinted).raw
                    ).toFixed(4);

                    setLiquidityBreakdown([
                        `Slippage tolerance : ${slippage}%`,
                        `Pool reserve: ${pair.reserve0.toExact()} ${
                            pair.token0.symbol
                        } + ${pair.reserve1.toExact()} ${pair.token1.symbol}`,
                        `Pool share: ${poolTokenPercentage}%`,
                        `${token0.symbol}: ${parsedToken0Amount.toExact()}`,
                        `${token1.symbol}: ${parsedToken1Amount.toExact()}`,
                        // noLiquidity ? "100" : `${poolTokenPercentage?.toSignificant(4)}} %`,
                    ]);

                } catch (e) {
                    if (e instanceof InsufficientReservesError) {
                        setButtonContent("Insufficient reserve!");
                        setButtonStatus(false);
                        // alert("something wrong !!!!");
                        return new ACYSwapErrorStatus("Insufficient reserve!");
                        console.log("Insufficient reserve!");
                    } else {
                        setButtonContent("Unhandled exception!");
                        setButtonStatus(false);
                        return new ACYSwapErrorStatus("Unhandled exception!");
                        console.log("Unhandled exception!");
                        console.log(e);
                    }
                }
            } else {
                setLiquidityBreakdown(["new pool"]);
            }
            console.log("------------------ ALLOWANCE ------------------");
            let approveStatus = 0;
            if (!token0IsETH) {
                let token0approval = await checkTokenIsApproved(
                    inToken0Address,
                    parsedToken0Amount.raw.toString(),
                    library,
                    account
                );
                console.log("token 0 approved?");
                console.log(token0approval);

                if (!token0approval) {
                    console.log("Not enough allowance");
                    setApproveAmountToken0(parsedToken0Amount.raw.toString());
                    setNeedApproveToken0(true);
                    setApproveToken0ButtonShow(true);
                    approveStatus += 1;
                }
            }
            if (!token1IsETH) {
                console.log(
                    `Inside addLiquidity, amount needed: ${parsedToken1Amount.raw.toString()}`
                );
                let token1approval = await checkTokenIsApproved(
                    inToken1Address,
                    parsedToken1Amount.raw.toString(),
                    library,
                    account
                );
                console.log("token 1 approved?");
                console.log(token1approval);

                if (!token1approval) {
                    console.log("Not enough allowance for token1");
                    setApproveAmountToken1(parsedToken1Amount.raw.toString());
                    setNeedApproveToken1(true);
                    setApproveToken1ButtonShow(true);
                    approveStatus += 2;
                }
            }
            if (approveStatus > 0) {
                setButtonStatus(false);
                setButtonContent("need approve");

                return new ACYSwapErrorStatus(
                    `Need approve ${
                        approveStatus === 1
                            ? inToken0Symbol
                            : approveStatus === 2
                                ? inToken1Symbol
                                : `${inToken0Symbol} and ${inToken1Symbol}`
                    }`
                );
            }
            setButtonStatus(true);
            if (noLiquidity) {
                setButtonContent("create a new pool");
            } else {
                setButtonContent("add liquidity");
            }

            console.log(
                "------------------ PREPARE ADD LIQUIDITY ------------------"
            );
            console.log("parsed token 0 amount");
            console.log(parsedToken0Amount.raw);
            console.log("parsed token 1 amount");
            console.log(parsedToken1Amount.raw);
            console.log("slippage");
            console.log(allowedSlippage);


            let estimate;
            let method;
            let args;
            let value;


            if (token0IsETH || token1IsETH) {
                estimate = router.estimateGas.addLiquidityETH;
                method = router.addLiquidityETH;
                let nonETHToken = token0IsETH ? token1 : token0;

                let parsedNonETHTokenAmount = token0IsETH
                    ? parsedToken1Amount
                    : parsedToken0Amount;

                let minETH = token0IsETH
                    ? calculateSlippageAmount(
                        parsedToken0Amount,
                        noLiquidity ? 0 : allowedSlippage
                    )[0].toString()
                    : calculateSlippageAmount(
                        parsedToken1Amount,
                        noLiquidity ? 0 : allowedSlippage
                    )[0].toString();

                args = [
                    nonETHToken.address,
                    parsedNonETHTokenAmount.raw.toString(),
                    calculateSlippageAmount(
                        parsedNonETHTokenAmount,
                        noLiquidity ? 0 : allowedSlippage
                    )[0].toString(),
                    minETH,
                    account,
                    `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
                ];
                value = BigNumber.from(
                    (token1IsETH ? parsedToken1Amount : parsedToken0Amount).raw.toString()
                );
                console.log(value);
            } else {
                estimate = router.estimateGas.addLiquidity;
                method = router.addLiquidity;
                args = [
                    inToken0Address,
                    inToken1Address,
                    parsedToken0Amount.raw.toString(),
                    parsedToken1Amount.raw.toString(),
                    calculateSlippageAmount(
                        parsedToken0Amount,
                        noLiquidity ? 0 : allowedSlippage
                    )[0].toString(),
                    calculateSlippageAmount(
                        parsedToken1Amount,
                        noLiquidity ? 0 : allowedSlippage
                    )[0].toString(),
                    account,
                    `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
                ];
                value = null;
            }
            console.log("args");
            console.log(args);
            console.log("estimate");
            console.log(estimate);
            console.log("method");
            console.log(method);
            console.log("value");
            console.log(value);

            setArgs(args);
            setValue(value);


        }//  end of
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    })();

    if (status instanceof ACYSwapErrorStatus) {
        console.log(status.getErrorText());
    } else {
        console.log(status);
    }
}

export async function addLiquidity(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    pair,
    noLiquidity,
    parsedToken0Amount,
    parsedToken1Amount,
    args,
    value,
    setLiquidityStatus
) {
    let status = await (async () => {
        // check uniswap
        console.log(FACTORY_ADDRESS);
        let router = getRouterContract(library, account);

        const {
            address: inToken0Address,
            symbol: inToken0Symbol,
            decimal: inToken0Decimal,
            amount: inToken0Amount,
        } = inputToken0;
        const {
            address: inToken1Address,
            symbol: inToken1Symbol,
            decimal: inToken1Decimal,
            amount: inToken1Amount,
        } = inputToken1;

        let token0IsETH = inToken0Symbol === "ETH";
        let token1IsETH = inToken1Symbol === "ETH";


        console.log("------------------ RECEIVED TOKEN ------------------");
        console.log("token0");
        console.log(inputToken0);
        console.log("token1");
        console.log(inputToken1);

        if (token0IsETH && token1IsETH)
            return new ACYSwapErrorStatus("Doesn't support ETH to ETH");

        if (
            (token0IsETH && inToken1Symbol === "WETH") ||
            (inToken0Symbol === "WETH" && token1IsETH)
        ) {
            // UI should sync value of ETH and WETH
            return new ACYSwapErrorStatus("Invalid pair WETH/ETH");
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("ADD LIQUIDITY");
            console.log("------------------ CONSTRUCT TOKEN ------------------");
            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

            // quit if the two tokens are equivalent, i.e. have the same chainId and address
            if (token0.equals(token1)) return new ACYSwapErrorStatus("Equal tokens!");


            // get pair using our own provider
            console.log("------------------ CONSTRUCT PAIR ------------------");
            console.log("FETCH pair");
            // if an error occurs, because pair doesn't exists
            console.log(pair);
            console.log(noLiquidity);
            console.log("------------------ PARSE AMOUNT ------------------");
            console.log(parsedToken0Amount);
            console.log(parsedToken1Amount);
            console.log("------------------ CHECK BALANCE ------------------");
            console.log("------------------ BREAKDOWN ------------------");
            console.log("------------------ ALLOWANCE ------------------");
            console.log("------------------ PREPARE ADD LIQUIDITY ------------------");
            let estimate;
            let method;
            if (token0IsETH || token1IsETH) {
                estimate = router.estimateGas.addLiquidityETH;
                method = router.addLiquidityETH;
                console.log(args);
                console.log(value);
            } else {
                estimate = router.estimateGas.addLiquidity;
                method = router.addLiquidity;
                console.log(args);
                console.log(value);
            }

            setLiquidityStatus("Processing add liquidity request");
            console.log("parsed token 0 amount");
            console.log(parsedToken0Amount.raw);
            console.log("parsed token 1 amount");
            console.log(parsedToken1Amount.raw);
            console.log("slippage");
            console.log(allowedSlippage);

            console.log(estimate);
            console.log(method);
            console.log(args);
            console.log(value);

            let result = await estimate(...args, value ? {value} : {}).then(
                (estimatedGasLimit) =>
                    method(...args, {
                        ...(value ? {value} : {}),
                        gasLimit: calculateGasMargin(estimatedGasLimit),
                    }).catch((e) => {
                        return new ACYSwapErrorStatus("Error in transaction");
                    })
            );
            return result;
        }
    })();
    if (status instanceof ACYSwapErrorStatus) {
        setLiquidityStatus(status.getErrorText());
    } else {
        console.log("status");
        console.log(status);
        let url = "https://rinkeby.etherscan.io/tx/" + status.hash;
        setLiquidityStatus(<a href={url} target={"_blank"}>view it on etherscan</a>);
    }
    return;
}

// expects at least has WETH as one of the tokens
export async function getAllLiquidityPositions(tokens, chainId, library, account) {
    // we only want WETH
    tokens = tokens.filter((token) => token.symbol !== "ETH");

    let totalTokenCount = tokens.length;
    let userNonZeroLiquidityPositions = [];

    if (totalTokenCount === 1) return;

    let checkLiquidityPositionTasks = [];

    for (let i = 0; i < totalTokenCount; i++) {
        for (let j = i + 1; j < totalTokenCount; j++) {
            const {
                address: token0Address,
                symbol: token0Symbol,
                decimal: token0Decimal,
            } = tokens[i];
            const {
                address: token1Address,
                symbol: token1Symbol,
                decimal: token1Decimal,
            } = tokens[j];

            const token0 = new Token(
                chainId,
                token0Address,
                token0Decimal,
                token0Symbol
            );
            const token1 = new Token(
                chainId,
                token1Address,
                token1Decimal,
                token1Symbol
            );

            // quit if the two tokens are equivalent, i.e. have the same chainId and address
            if (token0.equals(token1)) continue;

            // queue get pair task
            const pairTask = Fetcher.fetchPairData(token0, token1, library);
            checkLiquidityPositionTasks.push(pairTask);
        }
    }

    let pairs = await Promise.allSettled(checkLiquidityPositionTasks);

    // now we process the pairs
    for (let pair of pairs) {
        if (pair.status === "rejected") continue;

        pair = pair.value;

        let userPoolBalance = await getUserTokenBalanceRaw(
            pair.liquidityToken,
            account,
            library
        );

        if (userPoolBalance.isZero()) continue;

        userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

        let totalPoolTokens = await getTokenTotalSupply(
            pair.liquidityToken,
            library,
            account
        );

        let token0Deposited = pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false
        );
        let token1Deposited = pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false
        );

        let totalSupply = await getTokenTotalSupply(
            pair.liquidityToken,
            library,
            account
        );

        // let liquidityMinted = pair.getLiquidityMinted(
        //     totalSupply,
        //     token0Deposited,
        //     token1Deposited
        // );

        let poolTokenPercentage = new Percent(
            userPoolBalance.raw,
            totalSupply.raw
        ).toFixed(4);

        userNonZeroLiquidityPositions.push({
            pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
            token0Amount: `${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`,
            token1Amount: `${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`,
            token0Reserve: `${pair.reserve0.toExact()} ${pair.token0.symbol}`,
            token1Reserve: `${pair.reserve1.toExact()} ${pair.token1.symbol}`,
            share: `${poolTokenPercentage}%`,
        });
    }

    console.log("token pairs that user has positions:");
    console.log(userNonZeroLiquidityPositions);
    return userNonZeroLiquidityPositions;
}

const LiquidityComponent = () => {
    let [token0, setToken0] = useState(null);
    let [token1, setToken1] = useState(null);
    let [token0Balance, setToken0Balance] = useState("not know yet");
    let [token1Balance, setToken1Balance] = useState("not know yet");
    let [token0Amount, setToken0Amount] = useState("0");
    let [token1Amount, setToken1Amount] = useState("0");
    let [token0BalanceShow, setToken0BalanceShow] = useState(false);
    let [token1BalanceShow, setToken1BalanceShow] = useState(false);

    // true 指前面的，false指后面的
    let [exactIn, setExactIn] = useState(true);
    let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);

    let [needApproveToken0, setNeedApproveToken0] = useState(false);
    let [needApproveToken1, setNeedApproveToken1] = useState(false);
    let [approveAmountToken0, setApproveAmountToken0] = useState("0");
    let [approveAmountToken1, setApproveAmountToken1] = useState("0");

    let [approveToken0ButtonShow, setApproveToken0ButtonShow] = useState(false);
    let [approveToken1ButtonShow, setApproveToken1ButtonShow] = useState(false);


    let [liquidityBreakdown, setLiquidityBreakdown] = useState();
    let [buttonContent, setButtonContent] = useState("connect to wallet");
    let [buttonStatus, setButtonStatus] = useState(true);
    let [liquidityStatus, setLiquidityStatus] = useState();

    let [pair, setPair] = useState();
    let [noLiquidity, setNoLiquidity] = useState();
    let [parsedToken0Amount, setParsedToken0Amount] = useState();
    let [parsedToken1Amount, setParsedToken1Amount] = useState();

    let [args, setArgs] = useState();
    let [value, setValue] = useState();


    let [userLiquidityPositions, setUserLiquidityPositions] = useState([]);

    const individualFieldPlaceholder = "Enter amount";
    const dependentFieldPlaceholder = "Estimated value";
    const slippageTolerancePlaceholder = "please input a number from 1.00 to 100.00";

    const {account, chainId, library, activate} = useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42, 80001],
    });


    useEffect(() => {
        // activate(injected);
    }, []);

    let t0Changed = useCallback(async () => {
        if (!token0 || !token1) return;
        if (!exactIn) return;
        await getEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },
            slippageTolerance * 100,
            exactIn,
            chainId,
            library,
            account,
            setToken0Amount,
            setToken1Amount,
            setNeedApproveToken0,
            setNeedApproveToken1,
            setApproveAmountToken0,
            setApproveAmountToken1,
            setApproveToken0ButtonShow,
            setApproveToken1ButtonShow,
            setLiquidityBreakdown,
            setButtonContent,
            setButtonStatus,
            setLiquidityStatus,
            setPair,
            setNoLiquidity,
            setParsedToken0Amount,
            setParsedToken1Amount,
            setArgs,
            setValue);

    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, needApproveToken0,needApproveToken1,exactIn, chainId, library, account]);
    let t1Changed = useCallback(async () => {
        if (!token0 || !token1) return;
        if (exactIn) return;
        await getEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },
            slippageTolerance * 100,
            exactIn,
            chainId,
            library,
            account,
            setToken0Amount,
            setToken1Amount,
            setNeedApproveToken0,
            setNeedApproveToken1,
            setApproveAmountToken0,
            setApproveAmountToken1,
            setApproveToken0ButtonShow,
            setApproveToken1ButtonShow,
            setLiquidityBreakdown,
            setButtonContent,
            setButtonStatus,
            setLiquidityStatus,
            setPair,
            setNoLiquidity,
            setParsedToken0Amount,
            setParsedToken1Amount,
            setArgs,
            setValue);
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance,needApproveToken0,needApproveToken1, exactIn, chainId, library, account]);
    useEffect(() => {
        t0Changed();
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, needApproveToken0,needApproveToken1,exactIn, chainId, library, account]);
    useEffect(() => {
        t1Changed();
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance,needApproveToken0,needApproveToken1, exactIn, chainId, library, account]);


    useEffect(() => {
        if (account == undefined) {
            setButtonStatus(true);
            setButtonContent("Connect to Wallet");
        } else {
            setButtonContent("choose tokens and amount");
            setButtonStatus(false);
        }
    }, [chainId, library, account]);

    useEffect(() => {
        async function getAllUserLiquidityPositions() {
            if (account != undefined) {
                setUserLiquidityPositions(
                    await getAllLiquidityPositions(
                        supportedTokens,
                        chainId,
                        library,
                        account
                    )
                );
            }
        }

        getAllUserLiquidityPositions();
    }, [chainId, library, account]);


    return (
        <div>
            <h1>Add liquidity</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {(token0 && token0.symbol) || "In token"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {supportedTokens.map((token, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={async () => {
                                        if (account == undefined) {
                                            alert("please connect to your account");
                                        } else {
                                            setToken0(token);
                                            setToken0Balance(
                                                await getUserTokenBalance(
                                                    token,
                                                    chainId,
                                                    account,
                                                    library
                                                )
                                            );
                                            setToken0BalanceShow(true);
                                        }
                                    }}
                                >
                                    {token.symbol}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control
                        value={token0Amount}
                        placeholder={
                            exactIn ? individualFieldPlaceholder : dependentFieldPlaceholder
                        }
                        onChange={(e) => {
                            setExactIn(true);
                            setToken0Amount(e.target.value);
                        }}
                    />
                    {token0BalanceShow ?
                        <small>Balance: {token0Balance}</small> :
                        <small>not know yet</small>
                    }
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {(token1 && token1.symbol) || "Out token"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {supportedTokens.map((token, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={async () => {
                                        if (account == undefined) {
                                            alert("please connect to your account");
                                        } else {
                                            setToken1(token);
                                            setToken1Balance(
                                                await getUserTokenBalance(
                                                    token,
                                                    chainId,
                                                    account,
                                                    library
                                                )
                                            );
                                            setToken1BalanceShow(true);
                                        }
                                    }}
                                >
                                    {token.symbol}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control
                        value={token1Amount}
                        placeholder={
                            exactIn ? dependentFieldPlaceholder : individualFieldPlaceholder
                        }
                        onChange={(e) => {
                            setExactIn(false);
                            setToken1Amount(e.target.value);
                        }}
                    />
                    {token1BalanceShow ?
                        <small>Balance: {token1Balance}</small> :
                        <small>not know yet</small>
                    }
                </Form.Group>
                <InputGroup size="sm" className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-sm">Slippage tolerance </InputGroup.Text>
                    <FormControl
                        aria-label="Small"
                        aria-describedby="inputGroup-sizing-sm"
                        placeholder={slippageTolerancePlaceholder}
                        onChange={(e => {
                            setSlippageTolerance(e.target.value);
                        })}

                    />
                    <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
                <Alert variant="danger">
                    the Slippage Tolerance you choose is [ {slippageTolerance}% ]
                </Alert>


                <Alert variant="primary">
                    {liquidityBreakdown && <mark>liquidity breakdown</mark>}
                    {liquidityBreakdown && liquidityBreakdown.map((info) => <p>{info}</p>)}
                </Alert>


                {/* APPROVE BUTTONS */}
                {
                    approveToken0ButtonShow == true && <mark>
                        <Button
                            variant="warning"
                            onClick={async () => {
                                let state = await approve(token0.address, approveAmountToken0, library, account);
                                if (state == true) {
                                    setNeedApproveToken0(false);
                                    if (needApproveToken1 == false) {
                                        if (!noLiquidity) setButtonContent("add liquidity");
                                        else setButtonStatus("create new pool");
                                        setButtonStatus(true);
                                    }
                                }
                            }}
                            disabled={!needApproveToken0}
                        >
                            Approve {token0 && token0.symbol}
                        </Button>
                        {' '}
                    </mark>
                }
                {
                    approveToken1ButtonShow == true && <mark>
                        <Button
                            variant="warning"
                            onClick={async () => {
                                let state = await approve(token1.address, approveAmountToken1, library, account);

                                if (state == true) {
                                    setNeedApproveToken1(false);
                                    if (needApproveToken0 == false) {
                                        if (!noLiquidity) setButtonContent("add liquidity");
                                        else setButtonStatus("create new pool");
                                        setButtonStatus(true);
                                    }
                                }
                            }}
                            disabled={!needApproveToken1}
                        >
                            Approve {token1 && token1.symbol}
                        </Button>
                        {' '}
                    </mark>
                }
                <Button
                    variant="success"
                    disabled={!buttonStatus}
                    onClick={async () => {
                        if (account == undefined) {
                            activate(injected);
                            setButtonContent("choose tokens and amount");
                            setButtonStatus(false);
                        } else {
                            await addLiquidity(
                                {
                                    ...token0,
                                    amount: token0Amount,
                                },
                                {
                                    ...token1,
                                    amount: token1Amount,
                                },
                                100 * slippageTolerance,
                                exactIn,
                                chainId,
                                library,
                                account,
                                pair,
                                noLiquidity,
                                parsedToken0Amount,
                                parsedToken1Amount,
                                args,
                                value,
                                setLiquidityStatus
                            );

                        }
                    }
                    }
                >
                    {buttonContent}
                </Button>
                <Alert variant="primary">
                    {liquidityStatus && <mark> liquidityStatus:</mark>}
                    {liquidityStatus && <p> {liquidityStatus}</p>}
                </Alert>

                <h2>Your positions</h2>
                {userLiquidityPositions.map((position) => (
                    <Alert variant="dark">
                        {Object.values(position).map((field) => (
                            <p>{field}</p>
                        ))}
                    </Alert>
                ))}
            </Form>
        </div>
    );
};

export default LiquidityComponent;
