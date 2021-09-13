import {useWeb3React} from "@web3-react/core";
import {InjectedConnector} from "@web3-react/injected-connector";
import { getAddress } from "@ethersproject/address";
import {useCallback, useEffect, useState} from "react";
import {Alert, Button, Dropdown, Form, FormControl, InputGroup} from "react-bootstrap";
import {
    ACYSwapErrorStatus,
    approve,
    calculateGasMargin,
    calculateSlippageAmount,
    checkTokenIsApproved,
    getAllowance,
    getPairContract,
    getRouterContract,
    getTokenTotalSupply,
    getUserTokenBalanceRaw,
    INITIAL_ALLOWED_SLIPPAGE,
    ROUTER_ADDRESS,
    supportedTokens
} from "../utils";
import {ETHER, Fetcher, Percent, Token, TokenAmount, WETH,CurrencyAmount} from "@uniswap/sdk";


import {BigNumber} from "@ethersproject/bignumber";
import {parseUnits} from "@ethersproject/units";
import {splitSignature} from "@ethersproject/bytes";

export async function getPositionAndBalance(
    inToken0,
    inToken1,
    chainId,
    account,
    library,
    setBalance,
    setBalanceShow,
    setPosition
) 
{
    setBalance("0");
    setBalanceShow(false);
    setPosition("");

    let {
        address: inToken0Address,
        symbol: inToken0Symbol,
        decimal: inToken0Decimal,
    } = inToken0;
    let {
        address: inToken1Address,
        symbol: inToken1Symbol,
        decimal: inToken1Decimal,
    } = inToken1;


    const token0 = new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

    if (token0.equals(token1)) {
        setBalance("0");
        setBalanceShow(false);
        setPosition(['tokens can\'t be the same']);
        return;
    }

    let checkLiquidityPositionTasks = [];
    let userNonZeroLiquidityPositions = [];

    // queue get pair task
    const pairTask = Fetcher.fetchPairData(token0, token1, library);
    checkLiquidityPositionTasks.push(pairTask);

    let pairs = await Promise.allSettled(checkLiquidityPositionTasks);

    for (let pair of pairs) {
        if (pair.status === "rejected") {
            setBalance("0");
            setBalanceShow(false);
            setPosition(["this pair's fetch is reject"]);
            return;
        }
        pair = pair.value;

        let first = new TokenAmount(token0, parseUnits("1", inToken0Decimal));
        let firstPrice = pair.priceOf(token0).quote(first);
        let second = new TokenAmount(token1, parseUnits("1", inToken1Decimal));
        let secondPrice = pair.priceOf(token1).quote(second);

        let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);
        if (userPoolBalance.isZero()) {
            setBalance("0");
            setBalanceShow(true);
            setPosition(["user pool balance is zero"]);
            return;
        }

        userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);
        let totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);
        let token0Deposited = pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false);
        let token1Deposited = pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false);
        let totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

        console.log(token0Deposited);

        /*
        不能把getLiquidityValue的结果作为getLiquiditMinted的输入值
        let liquidityMinted = pair.getLiquidityMinted(
            totalSupply,
            token0Deposited,
            token1Deposited
        );
         */
        let poolTokenPercentage = new Percent(userPoolBalance.raw, totalSupply.raw).toFixed(4);

        console.log("user pool balance");
        console.log(userPoolBalance);
//        console.log(liquidityMinted.toExact());
        console.log(totalSupply.toExact());

        console.log("symbol");
//        console.log(liquidityMinted.token.symbol);

        userNonZeroLiquidityPositions.push([
            `pool: ${pair.token0.symbol}/${pair.token1.symbol}`,
            `pool balance: ${userPoolBalance.toExact()}/${userPoolBalance.token.symbol}`,
            `token0Balance: ${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`,
            `token1Balance: ${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`,
            `token0Reserve: ${pair.reserve0.toExact()} ${pair.token0.symbol}`,
            `token1Reserve: ${pair.reserve1.toExact()} ${pair.token1.symbol}`,
            `price0: 1${inToken0Symbol} = ${firstPrice.toExact()} ${inToken1Symbol}`,
            `price1: 1${inToken1Symbol} = ${secondPrice.toExact()} ${inToken0Symbol}`,
            `share: ${poolTokenPercentage}%`,
        ]);

        console.log("token pairs that user has positions:");
        console.log(userNonZeroLiquidityPositions);

        // setToken0Balance(`${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`);
        // setToken1Balance(`${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`);

        setBalance(userPoolBalance.toExact() + ' ' + userPoolBalance.token.symbol);
        setBalanceShow(true);
        setPosition(userNonZeroLiquidityPositions[0]);
        return;
    }
}


// get the estimated amount of the other token required when adding liquidity, in readable string.
export async function getEstimated(
    inputToken0,
    inputToken1, // 这里是不包含amount信息的
    token0Amount,
    token1Amount,
    index,
    percent,
    amount,
    chainId,
    library,
    account,
    setToken0Amount,
    setToken1Amount,
    setBalance,
    setBalanceShow,
    setPercent,
    setAmount,
    setBreakdown,
    setNeedApprove,
    setButtonStatus,
    setButtonContent,
    setRemoveStatus
) {
    let {
        address: inToken0Address,
        symbol: inToken0Symbol,
        decimal: inToken0Decimal,
    } = inputToken0;
    let {
        address: inToken1Address,
        symbol: inToken1Symbol,
        decimal: inToken1Decimal,
    } = inputToken1;

    if (!inToken0Symbol || !inToken1Symbol) {
        setToken0Amount("0");
        setToken1Amount("0");
        setBalance("0");
        setBalanceShow(false);
        setNeedApprove(false);
        setButtonStatus(false);
        setButtonContent("one or more token is missing");
        return false;
    }
    //init
    setToken0Amount("loading...")
    setToken1Amount("loading...");
    setBalance("0")
    setBalanceShow(false);
    setBreakdown("");
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent("loading...");
    setRemoveStatus("");

    let token0IsETH = inToken0Symbol === "ETH";
    let token1IsETH = inToken1Symbol === "ETH";
    if (token0IsETH && token1IsETH) {
        setToken0Amount("0");
        setToken1Amount("0");
        setNeedApprove(false);
        setButtonStatus(false);
        setButtonContent("the tokens are both ETH");
        return;
    }
    if (
        (token0IsETH && inToken1Symbol === "WETH") ||
        (inToken0Symbol === "WETH" && token1IsETH)
    ) {
        setToken0Amount("0");
        setToken1Amount("0");
        setNeedApprove(false);
        setButtonStatus(false);
        setButtonContent("invalid pair of ETH/WETH");
        return;
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    else {
        // use WETH for ETHER to work with Uniswap V2 SDK
        const token0 = token0IsETH
            ? WETH[chainId]
            : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
        const token1 = token1IsETH
            ? WETH[chainId]
            : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

        if (token0.equals(token1)) {
            setToken0Amount("0");
            setToken1Amount("0");
            setBalanceShow(false);
            setNeedApprove(false);
            setButtonStatus(false);
            setButtonContent("tokens can't be the same");
            return;
        }

        // get pair using our own provider
        let pair = await Fetcher.fetchPairData(token0, token1, library)
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
        if (pair instanceof ACYSwapErrorStatus) {
            setToken0Amount("0");
            setToken1Amount("0");
            setBalance("");
            setBalanceShow(false);
            setNeedApprove(false);
            setButtonStatus(false);
            setButtonContent("pool does not exist");
            return;
        }

        console.log("this is pair");
        console.log(pair);
// 流动性代币的总量
        let totalPoolTokens = await getTokenTotalSupply(
            pair.liquidityToken,
            library,
            account
        );

        let userPoolBalance = await getUserTokenBalanceRaw(
            pair.liquidityToken,
            account,
            library
        );

        if(userPoolBalance.isZero()){
            setToken0Amount("0");
            setToken1Amount("0");
            setBalance("0");
            setBalanceShow(true);
            setNeedApprove(false);
            setButtonStatus(false);
            setButtonContent("user pool balance is zero");
            return;
        }
        // 用户拥有的流动性代币
        userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

        console.log(userPoolBalance);
        console.log(userPoolBalance.toExact());

        setBalance(userPoolBalance.toExact());
        setBalanceShow(true);

        console.log(token0);
        console.log(pair.token0);
        console.log(token0==pair.token0);


        let token0Deposited = pair.getLiquidityValue(
            token0,
            totalPoolTokens,
            userPoolBalance,
            false
        );
        let token1Deposited = pair.getLiquidityValue(
            token1,
            totalPoolTokens,
            userPoolBalance,
            false
        );
        console.log(token0Deposited);
        console.log(token1Deposited);

        // 这个也是用户拥有的流动代币的总值？
        /*
        这是错误的，因为getLiquidityValue的输出不能作为 liqudityMinted的输入
        let liquidityMinted = pair.getLiquidityMinted(
            totalSupply,
            token0Deposited,
            token1Deposited
        );
        */

        console.log("----------------------------");
        console.log(userPoolBalance.raw);
        console.log(userPoolBalance.toExact());

        let liquidityAmount;
        let percentToRemove;

        if (index === 0) {
            let shang = percent * 100;
            percentToRemove = new Percent(
                shang.toString(),
                "10000"
            );

            console.log("shoe percentToMove");
            console.log(shang.toString());
            console.log("10000");
            console.log(percentToRemove.toSignificant());

            liquidityAmount = new TokenAmount(
                userPoolBalance.token,
                percentToRemove.multiply(userPoolBalance.raw).quotient
            );

            setAmount(liquidityAmount.toExact());


        } else {
            liquidityAmount = new TokenAmount(
                userPoolBalance.token,
                parseUnits(amount, userPoolBalance.token.decimals)
            );

           percentToRemove = new Percent(
                liquidityAmount.raw,
                userPoolBalance.raw
            );
            console.log("hello");
            console.log(liquidityAmount.raw);
            console.log(userPoolBalance.raw);
            setPercent(percentToRemove.toSignificant(2));
        }

        let first = new TokenAmount(token0, parseUnits("1", inToken0Decimal));
        let firstPrice = pair.priceOf(token0).quote(first);
        let second = new TokenAmount(token1, parseUnits("1", inToken1Decimal));
        let secondPrice = pair.priceOf(token1).quote(second);

        let token0TokenAmount = new TokenAmount(
            token0,
            percentToRemove.multiply(token0Deposited.raw).quotient
        );

        let token1TokenAmount = new TokenAmount(
            token1,
            percentToRemove.multiply(token1Deposited.raw).quotient
        );

        let parsedToken0Amount;
        let parsedToken1Amount;

        parsedToken0Amount =
            token0 === ETHER
                ? CurrencyAmount.ether(token0TokenAmount.raw)
                : token0TokenAmount;
        parsedToken1Amount =
            token1 === ETHER
                ? CurrencyAmount.ether(token1TokenAmount.raw)
                : token1TokenAmount;

        setToken0Amount(parsedToken0Amount.toExact());
        setToken1Amount(parsedToken1Amount.toExact());





        setBreakdown([
            'you will receive',
            `${parsedToken0Amount.toExact()} ${token0.symbol}`,
            `${parsedToken1Amount.toExact()} ${token1.symbol}`,
            `Output is estimated. If the price changes by more than 0.5% your transaction will revert.`,
            `pair token burned  ${amount}`,
            `price0: 1${inToken0Symbol} = ${firstPrice.toExact()} ${inToken1Symbol}`,
            `price1: 1${inToken1Symbol} = ${secondPrice.toExact()} ${inToken0Symbol}`,
        ]);

        console.log("CHECK IF HAVE ENOUGH BALANCE");
        console.log(pair.liquidityToken);
        let pairBalance = await getUserTokenBalanceRaw(
            pair.liquidityToken,
            account,
            library
        );
        let needAmount = parseUnits(amount,pair.liquidityToken.decimals);
        console.log(pairBalance);
        console.log(needAmount);

        let  userHasSufficientBalance =pairBalance.gte(
            needAmount
        );


        if(!userHasSufficientBalance){
            setNeedApprove(false);
            setButtonStatus(false);
            setButtonContent("not enough balance");
            return ;
        }

        console.log("GET ALLOWANCE");
        let liquidityApproval = await checkTokenIsApproved(
            liquidityAmount.token.address,
            liquidityAmount.raw.toString(),
            library,
            account
        );

        if (!liquidityApproval) {
            setNeedApprove(true);
            setButtonStatus(false);
            setButtonContent("need approve");
            return;
        }

        setNeedApprove(false);
        setButtonStatus(true);
        setButtonContent("remove Liquidity");
        return;
    }
    return;

}


export async function signOrApprove(
    inputToken0,
    inputToken1,
    index,
    percent,
    amount,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    chainId,
    library,
    account,
    setNeedApprove,
    setButtonStatus,
    setButtonContent,
    setRemoveStatus,
    setSignatureData
) {
    let status = await (async () => {
        console.log("hhhh");
        console.log(inputToken0);
        console.log(inputToken1);

        // let router = await getRouterContract(library, account);
        const {
            symbol: inToken0Symbol,
            address: inToken0Address,
            decimal: inToken0Decimal
        } = inputToken0;
        const {
            symbol: inToken1Symbol,
            address: inToken1Address,
            decimal: inToken1Decimal
        } = inputToken1;

        let token0IsETH = inToken0Symbol === "ETH";
        let token1IsETH = inToken1Symbol === "ETH";

        if (!inputToken0.symbol || !inputToken1.symbol)
            return new ACYSwapErrorStatus("One or more token input is missing");

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
            return new ACYSwapErrorStatus("Invalid pair WETH/ETH");
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("ATTEMPT TO APPROVE")
            console.log("------------------ CONSTRUCT TOKEN ------------------");

            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

            if (token0.equals(token1)) return new ACYSwapErrorStatus("Equal tokens!");

            // get pair using our own provider
            console.log("------------------ CONSTRUCT PAIR ------------------");
            console.log("FETCH");
            // if an error occurs, because pair doesn't exists
            const pair = await Fetcher.fetchPairData(token0, token1, library).catch(
                (e) => {
                    console.log(e);
                    return new ACYSwapErrorStatus(
                        `${token0.symbol} - ${token1.symbol} pool does not exist.`
                    );
                }
            );
            console.log(pair);
            if (pair instanceof ACYSwapErrorStatus) {
                setRemoveStatus(pair.getErrorText());
                return pair;
            }

            let pairContract = await getPairContract(
                pair.liquidityToken.address,
                library,
                account
            );

            console.log(pairContract);

            // try to gather a signature for permission


            let totalPoolTokens = await getTokenTotalSupply(
                pair.liquidityToken,
                library,
                account
            );

            let userPoolBalance = await getUserTokenBalanceRaw(
                pair.liquidityToken,
                account,
                library
            );

            userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

            console.log("getLiquidityValue");
            console.log(pair.token0);

            let shang = percent * 100;
            let percentToRemove = new Percent(
                shang.toString(),
                "10000"
            );
            let liquidityAmount = new TokenAmount(
                userPoolBalance.token,
                percentToRemove.multiply(userPoolBalance.raw).quotient
            );



            console.log(userPoolBalance.toExact());
            console.log(percentToRemove.toSignificant(2));
            console.log(liquidityAmount.raw);

            //
            //
            //
            // console.log( liquidityAmount.raw.toString());
            // let state=await approve(liquidityAmount.token.address, liquidityAmount.raw.toString(), library, account);
            // if(state==true){
            //     setButtonStatus(true);
            // }
            // return "just approve";

            const nonce = await pairContract.nonces(account);

            const EIP712Domain = [
                {name: "name", type: "string"},
                {name: "version", type: "string"},
                {name: "chainId", type: "uint256"},
                {name: "verifyingContract", type: "address"},
            ];
            const domain = {
                name: "Uniswap V2",
                version: "1",
                chainId: chainId,
                verifyingContract: pair.liquidityToken.address,
            };

            console.log("Router address");
            console.log(ROUTER_ADDRESS);

            console.log("pair.liquidityToken.address");
            console.log(pair.liquidityToken.address);

            const Permit = [
                {name: "owner", type: "address"},
                {name: "spender", type: "address"},
                {name: "value", type: "uint256"},
                {name: "nonce", type: "uint256"},
                {name: "deadline", type: "uint256"},
            ];

            var now=new Date();

            const deadlineTime=Math.floor(now.getTime()/1000)+60*20;

            console.log("deadlineTime");
            console.log(deadlineTime);
            console.log(deadlineTime);
            console.log(deadlineTime);

            let message = {
                owner: account,
                spender: ROUTER_ADDRESS,
                value: liquidityAmount.raw.toString(),
                nonce: nonce.toHexString(),
                deadline:deadlineTime
                //1630718219////Math.floor(new Date().getTime() / 1000) + 60,
            };

            console.log("message")
            console.log(message)

            const data = JSON.stringify({
                types: {
                    EIP712Domain,
                    Permit,
                },
                domain,
                primaryType: "Permit",
                message,
            });

            library
                .send("eth_signTypedData_v4", [account, data])
                .then(splitSignature)
                .then(signature => {

                    console.log("sign!!!!!");
                    console.log("signature");
                    console.log(signature);
                    setSignatureData({
                        v: signature.v,
                        r: signature.r,
                        s: signature.s,
                        deadline: deadlineTime//1630718219//Math.floor(new Date().getTime() / 1000) + 60//1630717588 //Math.floor(new Date().getTime() / 1000) + 60,
                    });

                   //  console.log(deadlineTime);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);
                   // console.log(Math.floor(new Date().getTime() / 1000) + 60);


                    setNeedApprove(false);
                    setButtonContent("remove liquidity");
                    setButtonStatus(true);

                })
                .catch(error => {
                    // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
                    if (error.code != 4001) {
                        // approveCallback();
                        // const [approval, approveCallback] = useApproveCallback(
                        //     liquidityAmount,
                        //     ROUTER_ADDRESS,
                        //     library,
                        //     account);
                        // export async function approve(tokenAddress, requiredAmount, library, account) {
                        alert("error code !=4001!");
                        let state = approve(liquidityAmount.token.address, liquidityAmount.raw.toString(), library, account);
                        if (state == true) {
                            setNeedApprove(false);
                            setButtonContent("remove liquidity");
                            setButtonStatus(true);
                            return "approve success";
                        }
                    } else {
                        alert("error code 4001!");
                        console.log("error code 4001!");
                        return new ACYSwapErrorStatus(" 4001 (EIP-1193 user rejected request), fall back to manual approve");
                    }
                });

            //
            // let allowance = await getAllowance(
            //     liquidityAmount.token.address,
            //     account, // owner
            //     ROUTER_ADDRESS, //spender
            //     library, // provider
            //     account // active account
            // );
            //
            // console.log(`ALLOWANCE FOR TOKEN ${liquidityAmount.token.address}`);
            // console.log(allowance);
            return "end";


        }
    })();
    if (status instanceof ACYSwapErrorStatus) {
        setRemoveStatus(status.getErrorText());
    } else {

        setRemoveStatus("just click right button");
        console.log(status);
        console.log("it seems ok");
    }
}

export async function removeLiquidity(
    inputToken0,
    inputToken1,
    index,
    percent,
    amount,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    chainId,
    library,
    account,
    setToken0Amount,
    setToken1Amount,
    signatureData,
    setNeedApprove,
    setButtonStatus,
    setButtonContent,
    setRemoveStatus
) {
    /**
     1. Check parameter, token amount valid?, token exists? token{0/1}IsETH
     2. Create 2 Uniswap Token
     3. Create Uniswap Pair, get liquidity token
     4. Parse amount into TokenAmount or CurrencyAmount
     5. Check liquidity balance and get pair contract
     7. Try to sign with pair contract from (4), requires nonce, library, setSignatureData
     8. Manual approve fallback
     9. Check approval, then check ETH, use normal version
     10. Signature exists, check ETH, use permit version
     11. estimate Gas for all methods
     12. index of Successful estimation by checking if gas estimate is BigNumber
     13. call method
     **/
    let status = await (async () => {
        let router = getRouterContract(library, account);
       let  {
            address: token0Address,
            symbol: token0Symbol,
            decimal: token0Decimal,
        } = inputToken0;
        let{
            address: token1Address,
            symbol: token1Symbol,
            decimal: token1Decimal,
        } = inputToken1;

        console.log(token0Address);
        token0Address=getAddress(token0Address);
        console.log(token0Address);

        console.log(token1Address);
        token1Address=getAddress(token1Address);
        console.log(token1Address);

        let token0IsETH = token0Symbol === "ETH";
        let token1IsETH = token1Symbol === "ETH";

        if (!inputToken0.symbol || !inputToken1.symbol)
            return new ACYSwapErrorStatus("One or more token input is missing");


            if (index==0 && percent == "0")
            return new ACYSwapErrorStatus("percent is 0");
        if (index==1 && amount == "0")
            return new ACYSwapErrorStatus("amount is 0");
        if(index==0 && percent == "")
            return new ACYSwapErrorStatus("percent is \"\"");
        if(index==1 && amount=="")
            return new ACYSwapErrorStatus("amount is \"\"");
        if (index==0 && (isNaN(parseFloat(percent))))
            return new ACYSwapErrorStatus("percent is NaN");
        if (index==1 && (isNaN(parseFloat(amount))))
            return new ACYSwapErrorStatus("amount is NaN");

        console.log("------------------ RECEIVED TOKEN ------------------");
        console.log("token0");
        console.log(inputToken0);
        console.log("token1");
        console.log(inputToken1);

        if (token0IsETH && token1IsETH)
            return new ACYSwapErrorStatus("Doesn't support ETH to ETH");

        if (
            (token0IsETH && token1Symbol === "WETH") ||
            (token0Symbol === "WETH" && token1IsETH)
        ) {
            return new ACYSwapErrorStatus("Invalid pair WETH/ETH");
        }
        // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
        else {
            console.log("------------------ CONSTRUCT TOKEN ------------------");
            // use WETH for ETHER to work with Uniswap V2 SDK
            const token0 = token0IsETH
                ? WETH[chainId]
                : new Token(chainId, token0Address, token0Decimal, token0Symbol);
            const token1 = token1IsETH
                ? WETH[chainId]
                : new Token(chainId, token1Address, token1Decimal, token1Symbol);


            if (token0.equals(token1)) return new ACYSwapErrorStatus("Equal tokens!");


            // get pair using our own provider
            console.log("------------------ CONSTRUCT PAIR ------------------");
            console.log("FETCH");
            // if an error occurs, because pair doesn't exists
            const pair = await Fetcher.fetchPairData(token0, token1, library).catch(
                (e) => {
                    console.log(e);
                    return new ACYSwapErrorStatus(
                        `${token0.symbol} - ${token1.symbol} pool does not exist.`
                    );
                }
            );
            console.log(pair);
            if (pair instanceof ACYSwapErrorStatus) {
                setRemoveStatus(pair.getErrorText());
                return pair;
            }

            let pairContract = getPairContract(
                pair.liquidityToken.address,
                library,
                account
            );

            console.log(pairContract);

            let totalPoolTokens = await getTokenTotalSupply(
                pair.liquidityToken,
                library,
                account
            );

            let userPoolBalance = await getUserTokenBalanceRaw(
                pair.liquidityToken,
                account,
                library
            );

            userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

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
            // 这是一个tokenAMount
            console.log(token0Deposited);
            console.log(token1Deposited);


            let shang = percent * 100;
            let percentToRemove = new Percent(
                shang.toString(),
                "10000"
            );

            let liquidityAmount = new TokenAmount(
                userPoolBalance.token,
                percentToRemove.multiply(userPoolBalance.raw).quotient
            );

            let token0TokenAmount = new TokenAmount(
                token0,
                percentToRemove.multiply(token0Deposited.raw).quotient
            );

            console.log("this is ok?");
            console.log(percentToRemove.multiply(token0Deposited.raw).quotient);
            console.log(token0TokenAmount.raw);
            console.log(token0TokenAmount.toExact());
            console.log(token0TokenAmount);

            let token1TokenAmount = new TokenAmount(
                token1,
                percentToRemove.multiply(token1Deposited.raw).quotient
            );

            let parsedToken0Amount;
            let parsedToken1Amount;


           // 先假设都不是ETH
            parsedToken0Amount =
                token0 === ETHER
                    ? CurrencyAmount.ether(token0TokenAmount.raw)
                    : token0TokenAmount;
            parsedToken1Amount =
                token1 === ETHER
                    ? CurrencyAmount.ether(token1TokenAmount.raw)
                    : token1TokenAmount;

            // parsedToken0Amount = token0TokenAmount;
            // parsedToken1Amount = token1TokenAmount;

            // setToken0Amount(parsedToken0Amount.toExact());
            // setToken1Amount(parsedToken1Amount.toExact());


            let liquidityApproval = await checkTokenIsApproved(
                liquidityAmount.token.address,
                liquidityAmount.raw.toString(),
                library,
                account
            );

            if (!liquidityApproval && signatureData === null) {
                console.log("liquidityApproval is not ok");
                return new ACYSwapErrorStatus(
                    'need approve for liquidityApproval'
                );
            }

            let oneCurrencyIsETH = token0IsETH || token1IsETH
            let estimate
            let methodNames
            let args
            let value

            console.log("allowedSlippage");
            console.log(allowedSlippage);


            const amountsMin = {
                ["CURRENCY_A"]: calculateSlippageAmount(parsedToken0Amount, allowedSlippage)[0].toString(),
                ["CURRENCY_B"]: calculateSlippageAmount(parsedToken1Amount, allowedSlippage)[0].toString()
            }

            if (liquidityApproval) {
                if (oneCurrencyIsETH) {
                    console.log("111");
                    methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
                    args = [
                        token1IsETH ? token0Address : token1Address,
                        liquidityAmount.raw.toString(),
                        amountsMin[token0IsETH ? "CURRENCY_A" : "CURRENCY_B"].toString(),
                        amountsMin[token1IsETH ? "CURRENCY_B" : "CURRENCY_A"].toString(),
                        // amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
                        // amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
                        account,
                        `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`
                    ]
                } else {
                    console.log("222");
                    methodNames = ['removeLiquidity']
                    args = [
                        token0Address,
                        token1Address,
                        liquidityAmount.raw.toString(),
                        amountsMin["CURRENCY_A"].toString(),
                        amountsMin["CURRENCY_B"].toString(),
                        account,
                        `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`
                    ]
                }

            } else if (signatureData !== null) {
                if (oneCurrencyIsETH) {
                    console.log("333");
                    methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
                    args = [
                        token1IsETH ? token0Address : token1Address,
                        liquidityAmount.raw.toString(),
                        amountsMin[token1IsETH ? "CURRENCY_A" : "CURRENCY_B"].toString(),
                        amountsMin[token1IsETH ? "CURRENCY_B" : "CURRENCY_A"].toString(),
                        account,
                        signatureData.deadline,
                        false,
                        signatureData.v,
                        signatureData.r,
                        signatureData.s
                    ]
                } else {
                    console.log("444");
                    methodNames = ['removeLiquidityWithPermit']
                    args = [
                        token0Address,
                        token1Address,
                        liquidityAmount.raw.toString(),
                        amountsMin["CURRENCY_A"].toString(),
                        amountsMin["CURRENCY_B"].toString(),
                        account,
                        signatureData.deadline,
                        false,
                        signatureData.v,
                        signatureData.r,
                        signatureData.s
                    ]
                }

            } else {
                return new ACYSwapErrorStatus(
                    "Attempting to confirm without approval or a signature. Please contact support."
                );
            }
            let safeGasEstimates;

                let result;

                safeGasEstimates= await Promise.all(
                    result= methodNames.map(methodName =>
                        router.estimateGas[methodName](...args)
                            .then(calculateGasMargin)
                            .catch(error => {
                                console.error(`estimateGas failed`, methodName, args, error)
                                return new ACYSwapErrorStatus(console.error(`estimateGas failed`, methodName, args, error))
                            })
                    )
                )

            console.log("i want to see");
            console.log(result);
                console.log(safeGasEstimates);

            for(let item in safeGasEstimates){
                if(item instanceof ACYSwapErrorStatus){
                    console.log("safeGasEstimates is wrong");
                    return item;
                }
            }

                //return new ACYSwapErrorStatus("safeGasEstimates is wrong");

            const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
                BigNumber.isBigNumber(safeGasEstimate)
            )


            if (indexOfSuccessfulEstimation === -1) {
                console.error("This transaction would fail. Please contact support.");
                return new ACYSwapErrorStatus("safeGasEstimates is wrong");

            } else {
                const methodName = methodNames[indexOfSuccessfulEstimation]
                const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

                let result = await router[methodName](...args, {
                    gasLimit: safeGasEstimate
                }).then((response)=>{
                    console.log(response);
                    return response;

                }).catch((e)=>{
                    return new ACYSwapErrorStatus("error happen");
                });

                if(result instanceof  ACYSwapErrorStatus){
                    console.log("result is error");

                }
                return result;

            }
        }
    })();
    if (status instanceof ACYSwapErrorStatus) {
        setRemoveStatus(status.getErrorText());
    } else {
        console.log(status);

        let url = "https://rinkeby.etherscan.io/tx/" + status.hash;
        setRemoveStatus(<a href={url} target={"_blank"}>view it on etherscan</a>);
    }
}

const RemoveLiquidityComponent = () => {
    let [token0, setToken0] = useState(null);
    let [token1, setToken1] = useState(null);
    let [token0Amount, setToken0Amount] = useState("0");
    let [token1Amount, setToken1Amount] = useState("0");
    // 仓位信息，确定两种代币之后就可以确定了
    let [position, setPosition] = useState();
    // uni-v2 的余额
    let [balance, setBalance] = useState("0");
    let [balanceShow, setBalanceShow] = useState(false);
    //index==0 表示百分比，index==1 表示数额
    let [index, setIndex] = useState(0);
    // 代币的百分比
    let [percent, setPercent] = useState(0);
    // 代币的数额
    let [amount, setAmount] = useState("0");
    let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
    let [breakdown, setBreakdown] = useState();
    let [needApprove, setNeedApprove] = useState(false);
    let [buttonStatus, setButtonStatus] = useState();
    let [buttonContent, setButtonContent] = useState();
    // 点击按钮之后的返回信息
    let [removeStatus, setRemoveStatus] = useState();
    let [signatureData, setSignatureData] = useState(null);
    const slippageTolerancePlaceholder = "please input a number from 1.00 to 100.00";


    const {account, chainId, library, activate} = useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42, 80001],
    });


    useEffect(() => {
        //  activate(injected);
    }, []);

    // useEffect(() => {
    //     async function getUserRemoveLiquidityPositions() {
    //         if (account == undefined) {
    //             // alert("please connect to your account");
    //             return;
    //         }
    //         if (!token0 || !token1) {
    //             // alert("you need to choose both of the tokens");
    //             return;
    //         }
    //         await getPositionAndBalance(
    //             token0,
    //             token1,
    //             chainId,
    //             account,
    //             library,
    //             setBalance,
    //             setBalanceShow,
    //             setPosition
    //         );
    //     }
    //
    //     getUserRemoveLiquidityPositions();
    // }, [token0, token1, chainId, account, library]);


    let inputChange = useCallback(async () => {
        if(!token0||!token1) return;

        //  alert(percent+" "+amount+" "+needApprove);
        await getEstimated(
            {
                ...token0
            },
            {
                ...token1
            },// 这里是不包含amount信息的
            token0Amount,
            token1Amount,
            index,
            percent,
            amount,
            chainId,
            library,
            account,
            setToken0Amount,
            setToken1Amount,
            setBalance,
            setBalanceShow,
            setPercent,
            setAmount,
            setBreakdown,
            setNeedApprove,
            setButtonStatus,
            setButtonContent,
            setRemoveStatus);
    }, [token0, token1, index, percent, amount,slippageTolerance,chainId, library, account]);


    useEffect(() => {  
        inputChange();
    }, [token0, token1, index, percent, amount,slippageTolerance,chainId, library, account]);

    useEffect(()=>{
        if (account == undefined) {
            setNeedApprove(false);
            setButtonStatus(true);
            setButtonContent("Connect to Wallet");
        } else {
            setNeedApprove(false);
            setButtonStatus(false);
            setButtonContent("choose tokens and amount");
        }
    },[account]);

    return (
        <div>
            <h1>Remove liquidity</h1>
            <Form>
                <Form.Group className="mb-3" controlId="token0">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {(token0 && token0.symbol) || "In token"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {supportedTokens.map((token, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={async () => {
                                        setToken0(token);
                                    }}
                                >
                                    {token.symbol}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control value={token0Amount}/>
                    {/*<small>Balance: {token0Balance}</small>*/}
                </Form.Group>
                <Form.Group className="mb-3" controlId="token1">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {(token1 && token1.symbol) || "Out token"}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {supportedTokens.map((token, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={async () => {
                                        setToken1(token);
                                    }}
                                >
                                    {token.symbol}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form.Control value={token1Amount}/>
                    {/*<small>Balance: {token1Balance}</small>*/}
                </Form.Group>
                <Form.Group className="mb-3" controlId="percent">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            percent
                        </Dropdown.Toggle>
                    </Dropdown>

                    <Form.Control value={percent}

                                  onChange={(e) => {
                                      setPercent(e.target.value);
                                      setIndex(0);
                                  }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="amount">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            amount
                        </Dropdown.Toggle>
                    </Dropdown>
                    <Form.Control value={amount}
                                  onChange={(e) => {
                                      setAmount(e.target.value);
                                      setIndex(1);

                                  }}
                    />
                </Form.Group>

                <div>
                    {<mark>balance</mark>}
                    {balanceShow && <p>{balance}</p>}
                </div>

                {/*<Alert variant="info">*/}
                {/*    {<mark>position</mark>}*/}
                {/*    {position && position.map((info) => <p>{info}</p>)}*/}
                {/*</Alert>*/}

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
                    {<mark>breakdown</mark>}
                    {breakdown && breakdown.map((info) => <p>{info}</p>)}
                </Alert>


                {/* APPROVE BUTTONS */}
                <Button variant="warning" onClick={async () => {
                    await signOrApprove(
                        {...token0,},
                        {...token1,},
                        index,
                        percent,
                        amount,
                        slippageTolerance * 100,
                        chainId,
                        library,
                        account,
                        setNeedApprove,
                        setButtonStatus,
                        setButtonContent,
                        setRemoveStatus,
                        setSignatureData
                    );
                }}
                        disabled={!needApprove}
                >Approve</Button>

                {' '}

                <Button
                    variant="success"
                    onClick={async () => {
                        if(account==undefined){
                            activate(injected);
                            
                        }else{

                     

                        await removeLiquidity(
                            {...token0,},
                            {...token1,},
                            index,
                            percent,
                            amount,
                            slippageTolerance * 100,
                            chainId,
                            library,
                            account,
                            setToken0Amount,
                            setToken1Amount,
                            signatureData,
                            setNeedApprove,
                            setButtonStatus,
                            setButtonContent,
                            setRemoveStatus
                        );
                    }

                    }}
                    disabled={!buttonStatus}
                >
                    {buttonContent}
                </Button>
                <Alert variant="info">
                    {removeStatus}
                </Alert>

            </Form>
        </div>
    );
};

export default RemoveLiquidityComponent;
