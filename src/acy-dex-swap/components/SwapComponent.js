import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect, useCallback } from "react";
import {
    supportedTokens,
    getRouterContract,
    calculateGasMargin,
    getContract,
    isZero,
    ROUTER_ADDRESS,
    getAllowance,
    ACYSwapErrorStatus,
    computeTradePriceBreakdown,
    getUserTokenBalanceRaw,
    approve,
    checkTokenIsApproved,
    getUserTokenBalance,
    INITIAL_ALLOWED_SLIPPAGE,
} from "../utils";

import { Form, Button, Alert, Dropdown,InputGroup,FormControl } from "react-bootstrap";

import WETHABI from "../abis/WETH.json";

import {
    Token,
    TokenAmount,
    Pair,
    TradeType,
    Route,
    Trade,
    Fetcher,
    Percent,
    Router,
    WETH,
    ETHER,
    CurrencyAmount,
    InsufficientReservesError,
    FACTORY_ADDRESS,
} from "@uniswap/sdk";

import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";

// get the estimated amount  of the other token required when swapping, in readable string.
export function checkSwapGetEstimated(
    inputToken0,
    inputToken1,
    exactIn = true,
    chainId,
    library
){
    let {
        address: token0Address,
        symbol: token0Symbol,
        decimal: token0Decimal,
        amount: token0Amount,
    } = inputToken0;
    let {
        address: token1Address,
        symbol: token1Symbol,
        decimal: token1Decimal,
        amount: token1Amount,
    } = inputToken1;


    if(!inputToken0.symbol || !inputToken1.symbol)
        return false;

    if(exactIn && token0Amount=="") return false;
    if(!exactIn && token1Amount=="") return false;

    if (exactIn && (isNaN(parseFloat(token0Amount)))){
        // alert("token0Amount is wrong ");
        return false;
    }

    if (!exactIn && (isNaN(parseFloat(token1Amount)))){
        // alert("token0Amount is wrong");
        return false;
    }
    return true;
}


export async function swapGetEstimated(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    setSwapStatus,
    setSwapBreakdown,
    setToken0Amount,
    setToken1Amount,
    setSwapButtonContent,
    setSwapButtonState,
    setNeedApprove,
    setApproveAmount
) {
    setSwapBreakdown("");
    setSwapStatus("");
    // check uniswap
    console.log(FACTORY_ADDRESS);
    // change slippage from bips (0.01%) into percentage
    let slippage=allowedSlippage*0.01;
    allowedSlippage = new Percent(allowedSlippage, 10000);

    let contract = getRouterContract(library, account);

    let {
        address: token0Address,
        symbol: token0Symbol,
        decimal: token0Decimal,
        amount: token0Amount,
    } = inputToken0;
    let {
        address: token1Address,
        symbol: token1Symbol,
        decimal: token1Decimal,
        amount: token1Amount,
    } = inputToken1;

    console.log(`input: ${token0Amount}`);
    let token0IsETH = token0Symbol === "ETH";
    let token1IsETH = token1Symbol === "ETH";

    console.log(inputToken0);
    console.log(inputToken1);

    if(token0IsETH && token1IsETH){
        // alert("Doesn't support ETH to ETH");
        setSwapStatus("ETH to ETH is not supported");
        setSwapButtonState(false);
        setSwapButtonContent("change tokens");
        return ;
    }

    // ================================================
    // wait to change
    // check user account balance
    console.log("------------------ CHECK BALANCE ------------------");
    // Big Number comparison


    let userToken0Balance = await getUserTokenBalanceRaw(
        token0IsETH
            ? ETHER
            : new Token(chainId, token0Address, token0Decimal, token0Symbol),
        account,
        library
    );


    let wethContract;

    // if one is ETH and other WETH, use WETH contract's deposit and withdraw
    // wrap ETH into WETH
    if (token0IsETH && token1Symbol === "WETH") {
        // UI should sync value of ETH and WETH
        if (exactIn) setToken1Amount(token0Amount);
        else setToken0Amount(token1Amount);

        let userHasSufficientBalance = userToken0Balance.gte(
            parseUnits(token0Amount, token0Decimal)
        );

        // quit if user doesn't have enough balance, otherwise this will cause error
        if (!userHasSufficientBalance){

            // setSwapStatus("Not enough balance");
            setSwapButtonState(false);
            setSwapButtonContent("Not enough balance");
            return;
        }

        console.log(userToken0Balance);
        console.log("token0Amount");
        console.log(token0Amount);


        setSwapButtonState(true);
        setSwapButtonContent("WRAP");
        return ;


    }
    else if(token0Symbol === "WETH" && token1IsETH){
        if (exactIn) setToken1Amount(token0Amount);
        else setToken0Amount(token1Amount);

        let userHasSufficientBalance = userToken0Balance.gte(
            parseUnits(token0Amount, token0Decimal)
        );

        // quit if user doesn't have enough balance, otherwise this will cause error
        if (!userHasSufficientBalance){

            // setSwapStatus("Not enough balance");
            setSwapButtonState(false);
            setSwapButtonContent("Not enough balance");
            return;
        }


        setSwapButtonState(true);
        setSwapButtonContent("UNWRAP");
        return ;

    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    else {
        // use WETH for ETHER to work with Uniswap V2 SDK

        setSwapButtonContent("SWAP");
        setSwapButtonState(true);


        const token0 = token0IsETH
            ? WETH[chainId]
            : new Token(chainId, token0Address, token0Decimal, token0Symbol);
        const token1 = token1IsETH
            ? WETH[chainId]
            : new Token(chainId, token1Address, token1Decimal, token1Symbol);

        if (token0.equals(token1)) {
            // alert("the token should not be the same");
            setSwapStatus("the token should not be the same");
            return ;//  exactIn ? token0Amount : token1Amount;
        }

        // get pair using our own provider
        const pair = await Fetcher.fetchPairData(token0, token1, library).catch(
            (e) => {

                setSwapStatus(`${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`);
                setSwapButtonState(false);

                return new ACYSwapErrorStatus(
                    `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
                );
            }
        );

        if (pair instanceof ACYSwapErrorStatus) return;

        console.log("------------------ CONSTRUCT ROUTE ------------------");
        // This is where we let Uniswap SDK know we are not using WETH but ETHER
        const route = new Route(
            [pair],
            token0IsETH ? ETHER : token0,
            token1IsETH ? ETHER : token1
        );

        console.log(route);
        console.log("------------------ PARSE AMOUNT ------------------");

        // convert typed in amount to BigNumbe rusing ethers.js's parseUnits then to string,
        console.log(token0Amount);
        console.log(token0Decimal);

        let parsedAmount = exactIn
            ? new TokenAmount(
                token0,
                parseUnits(token0Amount, token0Decimal)
            ).raw.toString(16)
            : new TokenAmount(
                token1,
                parseUnits(token1Amount, token1Decimal)
            ).raw.toString(16);

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
                setSwapStatus("Insufficient reserve!");
                console.log("Insufficient reserve!");
            } else {
                setSwapStatus("Unhandled exception!");
                console.log("Unhandled exception!");
                console.log(e);
            }
            return ;// exactIn ? token1Amount : token0Amount;
        }

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



        } else
            {
            console.log(
                `By algorithm, expected to get: ${trade.inputAmount.toExact()}`
            );
            maxAmountIn = trade.maximumAmountIn(allowedSlippage);
            slippageAdjustedAmount = maxAmountIn.raw.toString();
            setToken0Amount(trade.inputAmount.toExact());
            // updated input token field, check if still below account balance
            //
            // console.log(userToken0Balance.toString());
            // console.log(trade.inputAmount.raw.toString());
            //
            // userHasSufficientBalance = userToken0Balance.gte(
            //     BigNumber.from(trade.inputAmount.raw.toString())
            // );
            //
            // // quit if user doesn't have enough balance, otherwise this will cause error
            // if (!userHasSufficientBalance){
            //     setSwapStatus("Not enough balance");
            //     setSwapButtonState(false);
            //     setSwapButtonContent("Not enough balance");
            //
            //     return;
            //
            // }
                // return new ACYSwapErrorStatus("Not enough balance");
            console.log(`Maximum pay: ${slippageAdjustedAmount}`);
        }

        let userHasSufficientBalance = userToken0Balance.gte(
            parseUnits(token0Amount, token0Decimal)
        );

        // quit if user doesn't have enough balance, otherwise this will cause error
        if (!userHasSufficientBalance){
            // setSwapStatus("Not enough balance");
            setSwapButtonState(false);
            setSwapButtonContent("Not enough balance");
            return;
        }

        console.log("------------------ BREAKDOWN ------------------");

        let { priceImpactWithoutFee, realizedLPFee } =
            computeTradePriceBreakdown(trade);

        let breakdownInfo = [
            // `Slice Slippage tolerance:` ${allowedSlippage} %`
            `Slippage tolerance : ${ slippage}%`,
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
        setSwapBreakdown(breakdownInfo);
        console.log(breakdownInfo);
        setSwapButtonState(true);
        setSwapButtonContent("SWAP");
        setSwapStatus("you can click the swap button");
        console.log("------------------ ALLOWANCE ------------------");
        if (!token0IsETH) {
            let allowance = await getAllowance(
                token0Address,
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
                token0Address,
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
                return new ACYSwapErrorStatus("Need approve");
            }
        }

        return ;
    }
}

export async function swap(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    setSwapOperatorStatus

) {
    let status = await (async () => {
        // check uniswap
        console.log(FACTORY_ADDRESS);
        // change slippage from bips (0.01%) into percentage
        allowedSlippage = new Percent(allowedSlippage, 10000);

        let contract = getRouterContract(library, account);
        let {
            address: token0Address,
            symbol: token0Symbol,
            decimal: token0Decimal,
            amount: token0Amount,
        } = inputToken0;
        let {
            address: token1Address,
            symbol: token1Symbol,
            decimal: token1Decimal,
            amount: token1Amount,
        } = inputToken1;

        console.log(`input: ${token0Amount}`);
        let token0IsETH = token0Symbol === "ETH";
        let token1IsETH = token1Symbol === "ETH";
        if (!inputToken0.symbol || !inputToken1.symbol)
            return new ACYSwapErrorStatus("One or more token input is missing");
        if (exactIn && (isNaN(parseFloat(token0Amount)) || token0Amount === "0"))
            return new ACYSwapErrorStatus("Format Error");
        if (!exactIn && (isNaN(parseFloat(token1Amount)) || token1Amount === "0"))
            return new ACYSwapErrorStatus("Format Error");

        console.log(inputToken0);
        console.log(inputToken1);
        if (token0IsETH && token1IsETH)
            return new ACYSwapErrorStatus("Doesn't support ETH to ETH");

        // check user account balance
        console.log("------------------ CHECK BALANCE ------------------");
        // Big Number comparison
        let userToken0Balance = await getUserTokenBalanceRaw(
            token0IsETH
                ? ETHER
                : new Token(chainId, token0Address, token0Decimal, token0Symbol),
            account,
            library
        );

        console.log(userToken0Balance);
        let userHasSufficientBalance = userToken0Balance.gte(
            parseUnits(token0Amount, token0Decimal)
        );

        // quit if user doesn't have enough balance, otherwise this will cause error
        if (!userHasSufficientBalance)
            return new ACYSwapErrorStatus("Not enough balance");

        let wethContract;

        console.log("------------------ WRAP OR SWAP  ------------------");
        // if one is ETH and other WETH, use WETH contract's deposit and withdraw
        // wrap ETH into WETH
        if (token0IsETH && token1Symbol === "WETH") {
            console.log("WRAP");

            // UI should sync value of ETH and WETH
            // if (exactIn) setToken1Amount(token0Amount);
            // else setToken0Amount(token1Amount);

            wethContract = getContract(token1Address, WETHABI, library, account);
            let wrappedAmount = BigNumber.from(
                parseUnits(token0Amount, token0Decimal)
            ).toHexString();
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
        else if (token0Symbol === "WETH" && token1IsETH) {
            console.log("UNWRAP");

            // UI should sync value of ETH and WETH
            // if (exactIn) setToken1Amount(token0Amount);
            // else setToken0Amount(token1Amount);

            wethContract = getContract(token0Address, WETHABI, library, account);

            let wrappedAmount = BigNumber.from(
                parseUnits(token0Amount, token0Decimal)
            ).toHexString();

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
                : new Token(chainId, token0Address, token0Decimal, token0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, token1Address, token1Decimal, token1Symbol);

            console.log(token0);
            console.log(token1);

            // quit if the two tokens are equivalent, i.e. have the same chainId and address
            if (token0.equals(token1)) return new ACYSwapErrorStatus("Equal tokens!");

            // helper function from uniswap sdk to get pair address, probably needed if want to replace fetchPairData
            let pairAddress = Pair.getAddress(token0, token1);
            console.log(`Pair address: ${pairAddress}`);

            // get pair using our own provider
            console.log("------------------ CONSTRUCT PAIR ------------------");
            console.log("FETCH");
            const pair = await Fetcher.fetchPairData(token0, token1, library).catch(
                (e) => {
                    return new ACYSwapErrorStatus(
                        `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
                    );
                }
            );
            if (pair instanceof ACYSwapErrorStatus) return pair;

            console.log("------------------ CONSTRUCT ROUTE ------------------");
            // This is where we let Uniswap SDK know we are not using WETH but ETHER
            const route = new Route(
                [pair],
                token0IsETH ? ETHER : token0,
                token1IsETH ? ETHER : token1
            );
            console.log(route);

            console.log("------------------ PARSE AMOUNT ------------------");
            // convert typed in amount to BigNumbe rusing ethers.js's parseUnits then to string,
            let parsedAmount = exactIn
                ? new TokenAmount(
                    token0,
                    parseUnits(token0Amount, token0Decimal)
                ).raw.toString(16)
                : new TokenAmount(
                    token1,
                    parseUnits(token1Amount, token1Decimal)
                ).raw.toString(16);

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
                    console.log("Insufficient reserve!");
                } else {
                    console.log("Unhandled exception!");
                    console.log(e);
                }
                return new ACYSwapErrorStatus("Error with Trade object");
            }

            console.log(trade);

            console.log("------------------ SLIPPAGE CALCULATE ------------------");
            let slippageAdjustedAmount;
            let minAmountOut;
            let maxAmountIn;

            // calculate slippage adjusted amount
            if (exactIn) {
                console.log(
                    `By algorithm, expected to get: ${trade.outputAmount.toExact()}`
                );
                // if provided exact token in, we want to know min out token amount
                minAmountOut = trade.minimumAmountOut(allowedSlippage);
                slippageAdjustedAmount = minAmountOut.raw.toString();

                // update UI with estimated output token amount
                // setToken1Amount(trade.outputAmount.toExact());

                console.log(`Minimum received: ${slippageAdjustedAmount}`);
            } else {
                console.log(
                    `By algorithm, expected to get: ${trade.inputAmount.toExact()}`
                );
                maxAmountIn = trade.maximumAmountIn(allowedSlippage);
                slippageAdjustedAmount = maxAmountIn.raw.toString();

                // setToken0Amount(trade.inputAmount.toExact());

                // updated input token field, check if still below account balance

                console.log(userToken0Balance.toString());
                console.log(trade.inputAmount.raw.toString());
                userHasSufficientBalance = userToken0Balance.gt(
                    BigNumber.from(trade.inputAmount.raw.toString())
                );

                // quit if user doesn't have enough balance, otherwise this will cause error
                if (!userHasSufficientBalance)
                    return new ACYSwapErrorStatus("Not enough balance");

                console.log(`Maximum pay: ${slippageAdjustedAmount}`);
            }

            console.log("------------------ BREAKDOWN ------------------");

            let { priceImpactWithoutFee, realizedLPFee } =
                computeTradePriceBreakdown(trade);

            let breakdownInfo = [
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
            // setSwapBreakdown(breakdownInfo);
            // console.log(breakdownInfo);

            console.log("------------------ ALLOWANCE ------------------");
            if (!token0IsETH) {
                let allowance = await getAllowance(
                    token0Address,
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
                    token0Address,
                    token0AmountToApprove,
                    library,
                    account
                );
                console.log(token0approval);

                if (!token0approval) {
                    console.log("Not enough allowance");
                    // setApproveAmount(token0AmountToApprove);
                    // // when needApprove = true, please show the button of [Approve]
                    // setNeedApprove(true);
                    return new ACYSwapErrorStatus("Need approve");
                }
            }

            console.log("------------------ PREPARE SWAP ------------------");

            let { methodName, args, value } = Router.swapCallParameters(trade, {
                feeOnTransfer: false,
                allowedSlippage,
                recipient: account,
                ttl: 60,
            });

            const options = !value || isZero(value) ? {} : { value };

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
        setSwapOperatorStatus(status.getErrorText());
    } else {
        console.log(status);
        let url="https://rinkeby.etherscan.io/tx/"+status.hash;

        setSwapOperatorStatus(<a href={url}  target={"_blank"}>view it on etherscan</a>);
    }
}

const SwapComponent = () => {
    let [token0, setToken0] = useState(null);
    let [token1, setToken1] = useState(null);

    let [token0Balance, setToken0Balance] = useState("0");
    let [token1Balance, setToken1Balance] = useState("0");

    let [token0BalanceShow,setToken0BalanceShow] = useState(false);
    let [token1BalanceShow,setToken1BalanceShow] = useState(false);


    let [token0Amount, setToken0Amount] = useState();
    let [token1Amount, setToken1Amount] = useState();
    let [slippageTolerance,setSlippageTolerance]=useState(INITIAL_ALLOWED_SLIPPAGE/100);

    // when exactIn is true, it means the firt line
    // when exactIn is false, it means the second line
    let [exactIn, setExactIn] = useState(true);

    let [swapStatus, setSwapStatus] = useState();
    let [needApprove, setNeedApprove] = useState(false);
    let [approveAmount, setApproveAmount] = useState("0");
    // Breakdown shows the estimated information for swap
    let [swapBreakdown, setSwapBreakdown] = useState();

    let [swapButtonContent,setSwapButtonContent] = useState("Connect to Wallet");
    let [swapButtonState,setSwapButtonState] = useState(true);

    let [swapOperatorStatus,setSwapOperatorStatus]=useState("");

    const individualFieldPlaceholder = "Enter amount";
    const dependentFieldPlaceholder = "Estimated value";
    const slippageTolerancePlaceholder="please input a number from 1.00 to 100.00";



    const { account, chainId, library, activate } = useWeb3React();


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

        let state=checkSwapGetEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },

            exactIn,
            chainId,
            library
        );
        if(state==false) return;


        await swapGetEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },
            slippageTolerance*100,
            exactIn ,
            chainId,
            library,
            account,
            setSwapStatus,
            setSwapBreakdown,
            setToken0Amount,
            setToken1Amount,
            setSwapButtonContent,
            setSwapButtonState,
            setNeedApprove,
            setApproveAmount
        );
    }, [token0, token1, token0Amount, token1Amount, exactIn, chainId, library]);

    // token0Amount is changed according to token1Amount
    let t1Changed = useCallback(async () => {
        if (!token0 || !token1) return;
        if (exactIn) return;
        let state=checkSwapGetEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },
            exactIn,
            chainId,
            library
        );
        if(state==false) return;

        await swapGetEstimated(
            {
                ...token0,
                amount: token0Amount,
            },
            {
                ...token1,
                amount: token1Amount,
            },
            slippageTolerance*100,
            exactIn ,
            chainId,
            library,
            account,
            setSwapStatus,
            setSwapBreakdown,
            setToken0Amount,
            setToken1Amount,
            setSwapButtonContent,
            setSwapButtonState,
            setNeedApprove,
            setApproveAmount
        );
    }, [token0, token1, token0Amount, token1Amount, exactIn, chainId, library]);

    useEffect(() => {
        t0Changed();
    }, [token0Amount]);

    useEffect(() => {
        t1Changed();
    }, [token1Amount]);

    useEffect(()=>{
        if(account==undefined){
            setSwapButtonState(true);
            setSwapButtonContent("Connect to Wallet");
        }else {
            setSwapButtonState(false);
            setSwapButtonContent("swap");
        }

    },[account]);
    return (
        <div>
            <button
                onClick={()=>{
                    activate(injected);
                }}
            >
            connect
            </button>
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
                                        if(account==undefined){
                                            alert("please connect to your account");
                                        }else if(chainId==undefined){
                                            alert("please connect to rinkey testnet");
                                        }else if(library==undefined){
                                            alert("please get your library connected");
                                        }else {
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
                        onFocus={(e)=>{
                            setExactIn(true);
                        }
                        }
                        onChange={(e) => {
                            setToken0Amount(e.target.value);
                        }}
                    />
                    {token0BalanceShow ? <small>Balance: {token0Balance}</small> :<small>not know yet</small>  }
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
                                        if(account==undefined){
                                            alert("please connect to your account");
                                        }else if(chainId==undefined){
                                            alert("please connect to rinkey testnet");
                                        }else if(library==undefined){
                                            alert("please get your library connected");
                                        }else {
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
                        onFocus={(e)=>{
                            setExactIn(false);
                        }}
                        onChange={(e) => {
                            setToken1Amount(e.target.value);
                        }}
                    />
                    {token1BalanceShow ? <small>Balance: {token1Balance}</small> :<small>not know yet</small> }
                </Form.Group>

                <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-sizing-sm">Slippage tolerance </InputGroup.Text>
          <FormControl
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              placeholder={ slippageTolerancePlaceholder}
              onChange={(e=>{
                setSlippageTolerance(e.target.value);
              })}

          />
          <InputGroup.Text>%</InputGroup.Text>
        </InputGroup>

        {/*<Alert variant="danger">*/}
        {/*  Slippage tolerance: {INITIAL_ALLOWED_SLIPPAGE} bips ({INITIAL_ALLOWED_SLIPPAGE*0.01}%)*/}
        {/*</Alert>*/}

        <Alert variant="danger">
          the Slippage Tolerance you choose is [ {slippageTolerance}% ]
        </Alert>

                <Alert variant="info">Swap status: {swapStatus}</Alert>

                <Alert variant="primary">
                    Swap breakdown:
                    {swapBreakdown && swapBreakdown.map((info) => <p>{info}</p>)}
                </Alert>

                {
                    needApprove==true &&  <mark>
                        <Button
                            variant="warning"
                            onClick={() => {
                                approve(token0.address, approveAmount, library, account);
                            }}
                            disabled={!needApprove}
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
                        if (account==undefined) {
                            activate(injected);

                            setSwapButtonContent("choose tokens and amount");
                            setSwapButtonState(false);

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
                                setSwapOperatorStatus
                            );
                        }
                    }
                    }
                >
                    {swapButtonContent}
                </Button>

                <Alert variant="primary">
                    swapOperatorStatus:
                    {swapOperatorStatus }
                </Alert>

            </Form>


        </div>
    );
};

export default SwapComponent;
