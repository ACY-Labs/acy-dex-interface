import {useWeb3React} from "@web3-react/core";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useCallback, useEffect, useState} from "react";
import {
    ACYSwapErrorStatus,
    approve,
    calculateGasMargin,
    checkTokenIsApproved,
    computeTradePriceBreakdown,
    getAllowance,
    getContract,
    getRouterContract,
    getUserTokenBalance,
    getUserTokenBalanceRaw,
    INITIAL_ALLOWED_SLIPPAGE,
    isZero,
    ROUTER_ADDRESS,
    supportedTokens,
} from "../utils";

import {Alert, Button, Dropdown, Form, FormControl, InputGroup} from "react-bootstrap";

import WETHABI from "../abis/WETH.json";

import {
    CurrencyAmount,
    ETHER,
    FACTORY_ADDRESS,
    Fetcher,
    InsufficientReservesError,
    Pair,
    Percent,
    Route,
    Router,
    Token,
    TokenAmount,
    Trade,
    TradeType,
    WETH,
} from "@uniswap/sdk";

import {BigNumber} from "@ethersproject/bignumber";
import {parseUnits} from "@ethersproject/units";

// get the estimated amount  of the other token required when swapping, in readable string.
export async function swapGetEstimated(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    setToken0Amount,
    setToken1Amount,
    setNeedApprove,
    setApproveAmount,
    setApproveButtonStatus,
    setSwapBreakdown,
    setSwapButtonState,
    setSwapButtonContent,
    setSwapStatus,
    setPair,
    setRoute,
    setTrade,
    setSlippageAdjustedAmount,
    setMinAmountOut,
    setMaxAmountIn,
    setWethContract,
    setWrappedAmount
)
{
    let status = await (async () => {
        // check uniswap
        console.log(FACTORY_ADDRESS);
        // change slippage from bips (0.01%) into percentage
        let slippage = allowedSlippage * 0.01;
        allowedSlippage = new Percent(allowedSlippage, 10000);
        setSwapBreakdown("");
        setSwapButtonState(false);
        setSwapButtonContent("loading...");
        setSwapStatus("");

        let contract = getRouterContract(library, account);
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
        if(exactIn && inToken0Amount == "")
            return new ACYSwapErrorStatus("token0Amount is \"\"");
        if(!exactIn && inToken1Amount=="")
            return new ACYSwapErrorStatus("token1Amount is \"\"");
        if (exactIn && (isNaN(parseFloat(inToken0Amount))))
            return new ACYSwapErrorStatus("token0Amount is NaN");
        if (!exactIn && (isNaN(parseFloat(inToken1Amount))))
            return new ACYSwapErrorStatus("token1Amount is NaN");

        console.log(`token0Amount: ${inToken0Amount}`);
        console.log(`token1Amount: ${inToken1Amount}`);

        let token0IsETH = inToken0Symbol === "ETH";
        let token1IsETH = inToken1Symbol === "ETH";

        console.log(inputToken0);
        console.log(inputToken1);

        if (token0IsETH && token1IsETH) {
            setSwapButtonState(false);
            setSwapButtonContent("don't support ETH to ETH");
            return new ACYSwapErrorStatus("don't support ETH to ETH");
        }
            // if one is ETH and other WETH, use WETH contract's deposit and withdraw
        // wrap ETH into WETH
        else if (token0IsETH && inToken1Symbol === "WETH") {
            // UI should sync value of ETH and WETH
            if (exactIn) {
                setToken1Amount(inToken0Amount);
                inToken1Amount=inToken0Amount;
            }
            else {
                setToken0Amount(inToken1Amount);
                inToken0Amount=inToken1Amount;
            }
            console.log("------------------ CHECK BALANCE ------------------");
            // Big Number comparison

            let userToken0Balance = await getUserTokenBalanceRaw(
                token0IsETH
                    ? ETHER
                    : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
                account,
                library
            );

            let userHasSufficientBalance;
            try {
                userHasSufficientBalance = userToken0Balance.gte(
                    parseUnits(inToken0Amount, inToken0Decimal)
                );
            }catch(e){
                console.log("this is wrong!");
                console.log(e);
                setSwapButtonState(false);
                if(e.fault==="underflow") setSwapButtonContent(e.fault);
                else setSwapButtonContent("unknow error");
                return new ACYSwapErrorStatus(e.fault);
            };



            console.log(userToken0Balance);
            console.log("token0Amount");
            console.log(inToken0Amount);

            // quit if user doesn't have enough balance, otherwise this will cause error
            if (!userHasSufficientBalance) {
                setSwapButtonState(false);
                setSwapButtonContent("NOT enough balance");
                return new ACYSwapErrorStatus("NOT enough balance");
            }
            // setEstimatedStatus("change ETH to WETH");
            setSwapButtonState(true);
            setSwapButtonContent("wrap");

            const wethContract = getContract(inToken1Address, WETHABI, library, account);
            let wrappedAmount;

            try{
                wrappedAmount = BigNumber.from(
                    parseUnits(inToken0Amount, inToken0Decimal)
                ).toHexString();
            }catch(e){
                console.log("wrappedAmount!!");
                console.log(e);
                setSwapButtonState(false);
                if(e.fault==="underflow") {
                    setSwapButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                }else{
                    setSwapButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }

            };


            setWethContract(wethContract);
            setWrappedAmount(wrappedAmount);

            // let result = await wethContract
            //     .deposit({
            //         value: wrappedAmount,
            //     })
            //     .catch((e) => {
            //         console.log(e);
            //         return new ACYSwapErrorStatus("WETH Deposit failed");
            //     });
            // return result;
            return "Wrap is ok";
        }
        else if (inToken0Symbol === "WETH" && token1IsETH) {
            console.log("UNWRAP");
            if (exactIn) {
                setToken1Amount(inToken0Amount);
                inToken1Amount=inToken0Amount;
            }
            else {
                setToken0Amount(inToken1Amount);
                inToken0Amount=inToken1Amount;
            }

            let userToken0Balance = await getUserTokenBalanceRaw(
                token0IsETH
                    ? ETHER
                    : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
                account,
                library
            );

            let userHasSufficientBalance;
            try{
                userHasSufficientBalance = userToken0Balance.gte(
                    parseUnits(inToken0Amount, inToken0Decimal)
                );
            }catch(e){
                console.log("userHasSufficientBalance!!!");
                console.log(e);
                setSwapButtonState(false);
                if(e.fault==="underflow"){
                    setSwapButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                }else{
                    setSwapButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }
            };

            // quit if user doesn't have enough balance, otherwise this will cause error
            if (!userHasSufficientBalance) {
                setSwapButtonState(false);
                setSwapButtonContent("Not enough balance");
                return new ACYSwapErrorStatus("NOT enough balance");
            }

            setSwapButtonState(true);
            setSwapButtonContent("unwrap");

            const wethContract = getContract(inToken0Address, WETHABI, library, account);

            let wrappedAmount;
            try{
                wrappedAmount = BigNumber.from(
                    parseUnits(inToken0Amount, inToken0Decimal)
                ).toHexString();
            }catch(e){
                console.log("wrappedAmount!!!");
                console.log(e);
                setSwapButtonState(false);
                if(e.fault==="underflow") {
                    setSwapButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                }else{
                    setSwapButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }
            }
            setWethContract(wethContract);
            setWrappedAmount(wrappedAmount);

            // let result = await wethContract.withdraw(wrappedAmount).catch((e) => {
            //     console.log(e);
            //     return new ACYSwapErrorStatus("WETH Withdrawal failed");
            // });
            // return result;

            return "unwrap is ok";
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("SWAP");
            console.log("------------------ CONSTRUCT TOKEN ------------------");
            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

            if (token0.equals(token1)) {
                setSwapButtonState(false);
                setSwapButtonContent("tokens are same");
                return new ACYSwapErrorStatus("tokens are same");
            }
            // get pair using our own provider
            const pair = await Fetcher.fetchPairData(token0, token1, library).catch(
                (e) => {
                    return new ACYSwapErrorStatus(
                        `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
                    );
                }
            );
            if (pair instanceof ACYSwapErrorStatus) {
                setSwapButtonState(false);
                setSwapButtonContent("pool doesn't exist");
                return pair;
            }

            console.log(pair);
            setPair(pair);
            console.log("------------------ CONSTRUCT ROUTE ------------------");
            // This is where we let Uniswap SDK know we are not using WETH but ETHER

            const route = new Route(
                [pair],
                token0IsETH ? ETHER : token0,
                token1IsETH ? ETHER : token1
            );

            console.log(route);

            setRoute(route);
            console.log("------------------ PARSE AMOUNT ------------------");

            // convert typed in amount to BigNumbe rusing ethers.js's parseUnits then to string,
            console.log(inToken0Amount);
            console.log(inToken0Decimal);

            let parsedAmount;

            try{
                parsedAmount = exactIn
                    ? new TokenAmount(
                        token0,
                        parseUnits(inToken0Amount, inToken0Decimal)
                    ).raw.toString(16)
                    : new TokenAmount(
                        token1,
                        parseUnits(inToken1Amount, inToken1Decimal)
                    ).raw.toString(16);
            }catch(e){
                console.log("parsedAmount!!!");
                console.log(e);
                setSwapButtonState(false);
                if(e.fault==="underflow") {
                    setSwapButtonContent(e.fault);
                    return new ACYSwapErrorStatus(e.fault);
                }else{
                    setSwapButtonContent("unknow error");
                    return new ACYSwapErrorStatus("unknow error");
                }
            }

            let inputAmount;
            // CurrencyAmount instance is required for Trade contructor if input is ETHER
            if ((token0IsETH && exactIn) || (token1IsETH && !exactIn)) {
                inputAmount = new CurrencyAmount(ETHER, `0x${parsedAmount}`);
            } else {
                inputAmount = new TokenAmount(
                    exactIn ? token0 : token1,
                    `0x${parsedAmount}`
                );
            }
            console.log("estimated dependent amount");
            // console.log(pair.priceOf(token0).quote(inputAmount).raw.toString());
            let dependentTokenAmount = pair
                .priceOf(token0)
                .quote(new TokenAmount(token0, inputAmount.raw));

            let parsed =
                token1 === ETHER
                    ? CurrencyAmount.ether(dependentTokenAmount.raw)
                    : dependentTokenAmount;
            console.log(parsed.toExact());

//===================================================================================

            console.log("------------------ CONSTRUCT TRADE ------------------");
            let trade;
            try {
                trade = new Trade(
                    route,
                    inputAmount,
                    exactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
                );
            } catch (e) {
                if (e instanceof InsufficientReservesError) {
                    setSwapButtonState(false);
                    setSwapButtonContent("Insufficient liquidity for this trade");
                    console.log("Insufficient reserve!");
                    return new ACYSwapErrorStatus("Insufficient reserve!");
                } else {
                    setSwapButtonState(false);
                    setSwapButtonContent("Unhandled exception!");
                    console.log("Unhandled exception!");
                    console.log(e);
                    return new ACYSwapErrorStatus("Unhandled exception!");
                }
            }

            console.log(trade);
            setTrade(trade);
            console.log("------------------ SLIPPAGE CALCULATE ------------------");

            let slippageAdjustedAmount;
            let minAmountOut;
            let maxAmountIn;

            // calculate slippage adjusted amount
            if (exactIn) {
                // console.log(trade.outputAmount.toExact());
                // setToken1Amount(trade.outputAmount.toExact());
                console.log(
                    `By algorithm, expected to get: ${trade.outputAmount.toExact()}`
                );
                // if provided exact token in, we want to know min out token amount
                minAmountOut = trade.minimumAmountOut(allowedSlippage);
                slippageAdjustedAmount = minAmountOut.raw.toString();

                // update UI with estimated output token amount
                setToken1Amount(trade.outputAmount.toExact());
                console.log(`Minimum received: ${slippageAdjustedAmount}`);

            } else {
                console.log(
                    `By algorithm, expected to get: ${trade.inputAmount.toExact()}`
                );
                maxAmountIn = trade.maximumAmountIn(allowedSlippage);
                slippageAdjustedAmount = maxAmountIn.raw.toString();
                setToken0Amount(trade.inputAmount.toExact());
                console.log(`Maximum pay: ${slippageAdjustedAmount}`);
            }


            setSlippageAdjustedAmount(slippageAdjustedAmount);
            setMinAmountOut(minAmountOut);
            setMaxAmountIn(maxAmountIn);

            let userToken0Balance = await getUserTokenBalanceRaw(
                token0IsETH
                    ? ETHER
                    : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
                account,
                library
            );


            let userHasSufficientBalance;
            try{
                userHasSufficientBalance = userToken0Balance.gte(
                    parseUnits(inToken0Amount, inToken0Decimal)
                );
            }catch(e){
                console.log("wrappedAmount!!!");
                console.log(e);
                setSwapButtonState(false);
                setSwapButtonContent(e.fault);
                return new ACYSwapErrorStatus(e.fault);
            }


            // quit if user doesn't have enough balance, otherwise this will cause error
            if (!userHasSufficientBalance) {
                setSwapButtonState(false);
                setSwapButtonContent("Not Enough balance");
                return;
            }

            console.log("------------------ BREAKDOWN ------------------");
            let {priceImpactWithoutFee, realizedLPFee} =
                computeTradePriceBreakdown(trade);
            let breakdownInfo = [
                // `Slice Slippage tolerance:` ${allowedSlippage} %`
                `Slippage tolerance : ${slippage}%`,
                `Price impact : ${priceImpactWithoutFee.toFixed(2)}%`,
                `LP FEE : ${realizedLPFee?.toSignificant(6)} ${
                    trade.inputAmount.currency.symbol
                }`,
                `${exactIn ? "Min received:" : "Max sold"} : ${
                    exactIn ? minAmountOut.toSignificant(4) : maxAmountIn.toSignificant(4)
                } ${
                    exactIn
                        ? trade.outputAmount.currency.symbol
                        : trade.inputAmount.currency.symbol
                }`,
            ];

            // setEstimatedStatus("you can click the swap button");
            setSwapBreakdown(breakdownInfo);

            console.log("------------------ ALLOWANCE ------------------");
            if (!token0IsETH) {
                let allowance = await getAllowance(
                    inToken0Address,
                    account,
                    ROUTER_ADDRESS,
                    library,
                    account
                );

                console.log(
                    `Current allowance for ${trade.inputAmount.currency.symbol}:`
                );
                console.log(allowance);
                let token0AmountToApprove = exactIn
                    ? inputAmount.raw.toString()
                    : slippageAdjustedAmount;
                let token0approval = await checkTokenIsApproved(
                    inToken0Address,
                    token0AmountToApprove,
                    library,
                    account
                );
                console.log(token0approval);
                if (!token0approval) {
                    console.log("Not enough allowance");
                    setApproveAmount(token0AmountToApprove);
                    // when needApprove = true, please show the button of [Approve]
                    setNeedApprove(true);
                    setApproveButtonStatus(true);
                    setSwapButtonState(false);
                    setSwapButtonContent("need approve");
                    return "approve is ok";
                }else {
                    setSwapButtonContent("swap");
                    setSwapButtonState(true);
                    return "swap is ok";
                }
            }
            setSwapButtonContent("swap");
            setSwapButtonState(true);


            return "swap is ok";
        }
    })();
    if (status instanceof ACYSwapErrorStatus) {
        console.log(status.getErrorText());
    } else {
        console.log(status);
    }
    return;
}

export async function swap(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    pair,
    route,
    trade,
    slippageAdjustedAmount,
    minAmountOut,
    maxAmountIn,
    wethContract,
    wrappedAmount,
    setSwapStatus
) {
    let status = await (async () => {
        // check uniswap
        console.log(FACTORY_ADDRESS);
        // change slippage from bips (0.01%) into percentage
        allowedSlippage = new Percent(allowedSlippage, 10000);

        let contract = getRouterContract(library, account);
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

        console.log(`token0Amount: ${inToken0Amount}`);
        console.log(`token1Amount: ${inToken1Amount}`);

        let token0IsETH = inToken0Symbol === "ETH";
        let token1IsETH = inToken1Symbol === "ETH";

        console.log(inputToken0);
        console.log(inputToken1);

        if (token0IsETH && token1IsETH)
            return new ACYSwapErrorStatus("Doesn't support ETH to ETH");
        console.log("------------------ WRAP OR SWAP  ------------------");
        // if one is ETH and other WETH, use WETH contract's deposit and withdraw
        // wrap ETH into WETH
        if (token0IsETH && inToken1Symbol === "WETH") {
            console.log("WRAP");
            // UI should sync value of ETH and WETH
            // if (exactIn) setToken1Amount(token0Amount);
            // else setToken0Amount(token1Amount);
            let result = await wethContract
                .deposit({
                    value: wrappedAmount,
                })
                .catch((e) => {
                    console.log(e);
                    return new ACYSwapErrorStatus("WETH Deposit failed");
                });

            return result;
        }
        // unwrap WETH into ETH
        else if (inToken0Symbol === "WETH" && token1IsETH) {
            console.log("UNWRAP");

            // UI should sync value of ETH and WETH
            // if (exactIn) setToken1Amount(token0Amount);
            // else setToken0Amount(token1Amount);

            let result = await wethContract.withdraw(wrappedAmount).catch((e) => {
                console.log(e);
                return new ACYSwapErrorStatus("WETH Withdrawal failed");
            });
            return result;
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("SWAP");

            console.log("------------------ CONSTRUCT TOKEN ------------------");
            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);
            console.log(token0);
            console.log(token1);
            // quit if the two tokens are equivalent, i.e. have the same chainId and address
            if (token0.equals(token1)) return new ACYSwapErrorStatus("Equal tokens!");
            // helper function from uniswap sdk to get pair address, probably needed if want to replace fetchPairData
            // get pair using our own provider
            console.log("------------------ CONSTRUCT PAIR ------------------");
            console.log("FETCH");
            console.log(pair);
            console.log("------------------ CONSTRUCT ROUTE ------------------");
            // This is where we let Uniswap SDK know we are not using WETH but ETHER
            console.log(route);
            console.log("------------------ PARSE AMOUNT ------------------");

            console.log("------------------ CONSTRUCT TRADE ------------------");
            console.log(trade);
            console.log("------------------ SLIPPAGE CALCULATE ------------------");
            console.log(slippageAdjustedAmount);
            console.log(minAmountOut);
            console.log(maxAmountIn);
            console.log("------------------ ALLOWANCE ------------------");
            console.log("say something about allowance");
            console.log("------------------ PREPARE SWAP ------------------");


            let {methodName, args, value} = Router.swapCallParameters(trade, {
                feeOnTransfer: false,
                allowedSlippage,
                recipient: account,
                ttl: 60,
            });
            const options = !value || isZero(value) ? {} : {value};

            console.log("------------------ ARGUMENTS ------------------");
            console.log(options);
            console.log(args);

            let result = await contract.estimateGas[methodName](...args, options)
                .then((gasEstimate) => {
                    return contract[methodName](...args, {
                        gasLimit: calculateGasMargin(gasEstimate),
                        ...options,
                    });
                })
                .catch((e) => {
                    return new ACYSwapErrorStatus(`${methodName} failed with error ${e}`);
                });
            return result;
        }
    })();
    if (status instanceof ACYSwapErrorStatus) {
        setSwapStatus(status.getErrorText());
    } else {
        console.log(status);
        let url = "https://rinkeby.etherscan.io/tx/" + status.hash;
        setSwapStatus(<div><a href={url} target={"_blank"}>view it on etherscan</a></div>);
    }
}

const SwapComponent = () => {
    let [token0, setToken0] = useState(null);
    let [token1, setToken1] = useState(null);
    let [token0Balance, setToken0Balance] = useState("not know yet");
    let [token1Balance, setToken1Balance] = useState("not know yet");
    let [token0BalanceShow, setToken0BalanceShow] = useState(false);
    let [token1BalanceShow, setToken1BalanceShow] = useState(false);
    let [token0Amount, setToken0Amount] = useState();
    let [token1Amount, setToken1Amount] = useState();
    let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
    //exactIn = true 在第一行输入
    //exactIn = false 在第二行输入
    let [exactIn, setExactIn] = useState(true);

    let [needApprove, setNeedApprove] = useState(false);
    let [approveAmount, setApproveAmount] = useState("0");
    let [approveButtonStatus,setApproveButtonStatus]=useState(true);

    // Breakdown shows the estimated information for swap

    // let [estimatedStatus,setEstimatedStatus]=useState();
    let [swapBreakdown, setSwapBreakdown] = useState();
    let [swapButtonState, setSwapButtonState] = useState(true);
    let [swapButtonContent, setSwapButtonContent] = useState("Connect to Wallet");
    let [swapStatus, setSwapStatus] = useState();


    let[pair,setPair]=useState();
    let[route,setRoute]=useState();
    let[trade,setTrade]=useState();
    let[slippageAdjustedAmount,setSlippageAdjustedAmount]=useState();
    let[minAmountOut,setMinAmountOut]=useState();
    let[maxAmountIn,setMaxAmountIn]=useState();
    let[wethContract,setWethContract]=useState();
    let[wrappedAmount,setWrappedAmount]=useState();


    const individualFieldPlaceholder = "Enter amount";
    const dependentFieldPlaceholder = "Estimated value";
    const slippageTolerancePlaceholder = "please input a number from 1.00 to 100.00";

    const {account, chainId, library, activate} = useWeb3React();


    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42, 80001],
    });

    // This is to connect wallet.
    useEffect(() => {
        // activate(injected);
    }, []);

    // token1Amount is changed according to token0Amount
    let t0Changed = useCallback(async () => {
        if (!token0 || !token1) return;
        if (!exactIn) return;
        await swapGetEstimated(
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
            setNeedApprove,
            setApproveAmount,
            setApproveButtonStatus,
            setSwapBreakdown,
            setSwapButtonState,
            setSwapButtonContent,
            setSwapStatus,
            setPair,
            setRoute,
            setTrade,
            setSlippageAdjustedAmount,
            setMinAmountOut,
            setMaxAmountIn,
            setWethContract,
            setWrappedAmount
        );
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, exactIn, chainId, library, account]);
    // token0Amount is changed according to token1Amount
    let t1Changed = useCallback(async () => {
        if (!token0 || !token1) return;
        if (exactIn) return;
        await swapGetEstimated(
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
            setNeedApprove,
            setApproveAmount,
            setApproveButtonStatus,
            setSwapBreakdown,
            setSwapButtonState,
            setSwapButtonContent,
            setSwapStatus,
            setPair,
            setRoute,
            setTrade,
            setSlippageAdjustedAmount,
            setMinAmountOut,
            setMaxAmountIn,
            setWethContract,
            setWrappedAmount
        );
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, exactIn, chainId, library, account]);
    useEffect(() => {
        t0Changed();
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, exactIn, chainId, library, account]);
    useEffect(() => {
        t1Changed();
    }, [token0, token1, token0Amount, token1Amount, slippageTolerance, exactIn, chainId, library, account]);

    useEffect(() => {
        if (account == undefined) {
            setSwapButtonState(true);
            setSwapButtonContent("Connect to Wallet");
        } else {
            setSwapButtonState(false);
            setSwapButtonContent("choose tokens and amount");
        }
    }, [account]);
    return (
        <div>
            <h1>swap</h1>
            <Alert variant="success">
                <Alert.Heading>Hey, nice to see you</Alert.Heading>
                <p>{account}</p>
            </Alert>
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
                                    }
                                    }
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
                        onFocus={(e) => {
                            setExactIn(true);
                        }
                        }
                        onChange={(e) => {
                            setToken0Amount(e.target.value);
                        }}
                    />
                    {token0BalanceShow ? <small>Balance: {token0Balance}</small> : <small>not know yet</small>}
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
                        onFocus={(e) => {
                            setExactIn(false);
                        }}
                        onChange={(e) => {
                            setToken1Amount(e.target.value);
                        }}
                    />
                    {token1BalanceShow ? <small>Balance: {token1Balance}</small> : <small>not know yet</small>}
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

                <Alert variant="info">
                    {swapBreakdown && <mark> Swap breakdown:</mark>}
                    {swapBreakdown && swapBreakdown.map((info) => <p>{info}</p>)}
                </Alert>
                {
                    needApprove == true && <mark>
                        <Button
                            variant="warning"
                            onClick={async () => {
                                let state = await approve(token0.address, approveAmount, library, account);
                                if (state == true) {
                                    setSwapButtonState(true);
                                    setSwapButtonContent("SWAP");
                                    setApproveButtonStatus(false);
                                }
                            }}
                            disabled={!approveButtonStatus}
                        >
                            Approve
                        </Button>
                        {' '}

                    </mark>
                }


                <Button
                    variant="success"
                    disabled={!swapButtonState}

                    onClick={() => {
                        if (account == undefined) {
                            activate(injected);
                        } else {


                            swap(
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
                                pair,
                                route,
                                trade,
                                slippageAdjustedAmount,
                                minAmountOut,
                                maxAmountIn,
                                wethContract,
                                wrappedAmount,
                                setSwapStatus
                            );
                        }
                    }
                    }
                >
                    {swapButtonContent}
                </Button>
                <Alert variant="primary">
                    { swapStatus && <mark> swapStatus:</mark>}
                    { swapStatus && <p> {swapStatus}</p>}
                </Alert>
            </Form>
        </div>
    );
};

export default SwapComponent;
