import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect, useCallback, useMemo } from "react";
import {Form, Button, Alert, Dropdown, InputGroup, FormControl} from "react-bootstrap";
import {
  supportedTokens,
  getRouterContract,
  calculateGasMargin,
  getTokenTotalSupply,
  ACYSwapErrorStatus,
  approve,
  checkTokenIsApproved,
  getUserTokenBalanceRaw,
  getUserTokenBalance,
  addLiquidityGetEstimated,
  getUserRemoveLiquidityBalance,
  removeLiquidityGetEstimated,
  calculateSlippageAmount,
  INITIAL_ALLOWED_SLIPPAGE,
  usePairContract,
  ROUTER_ADDRESS, getAllowance,
} from "../utils";
import {
  Token,
  TokenAmount,
  Fetcher,
  Percent,
  WETH,
  ETHER,
  CurrencyAmount,
  FACTORY_ADDRESS,
} from "@uniswap/sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { splitSignature } from "@ethersproject/bytes";

export async function processInput(
    inputToken0,
    inputToken1,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
    exactIn = true,
    chainId,
    library,
    account,
    setToken0Amount,
    setToken1Amount,
    setSignatureData,
    setRemoveLiquidityStatus
){
  const {
    address: token0Address,
    symbol: token0Symbol,
    decimal: token0Decimal,
    amount: token0Amount,
  } = inputToken0;
  const {
    address: token1Address,
    symbol: token1Symbol,
    decimal: token1Decimal,
    amount: token1Amount,
  } = inputToken1;
  let token0IsETH = token0Symbol === "ETH";
  let token1IsETH = token1Symbol === "ETH";
  if (!inputToken0.symbol || !inputToken1.symbol)
    return new ACYSwapErrorStatus("One or more token input is missing");
  if (
      exactIn &&
      (isNaN(parseFloat(token0Amount)) || token0Amount === "0" || !token0Amount)
  )
    return new ACYSwapErrorStatus("Format Error");
  if (
      !exactIn &&
      (isNaN(parseFloat(token1Amount)) || token1Amount === "0" || !token1Amount)
  )
    return new ACYSwapErrorStatus("Format Error");

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
    console.log("ATTEMPT TO APPROVE")
    console.log("------------------ CONSTRUCT TOKEN ------------------");

    // use WETH for ETHER to work with Uniswap V2 SDK
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
      setRemoveLiquidityStatus(pair.getErrorText());
      return pair;
    }

    console.log("------------------ PARSE AMOUNT ------------------");
    // convert typed in amount to BigNumber using ethers.js's parseUnits,
    let parsedAmount = exactIn
        ? new TokenAmount(token0, parseUnits(token0Amount, token0Decimal))
        : new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));

    let parsedToken0Amount;
    let parsedToken1Amount;

    console.log("estimated dependent amount");
    // console.log(pair.priceOf(token0).quote(inputAmount).raw.toString());
    let dependentTokenAmount;

    if (exactIn) {
      dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);
      let token0TokenAmount = new TokenAmount(
          token0,
          parseUnits(token0Amount, token0Decimal)
      );
      parsedToken0Amount =
          token0 === ETHER
              ? CurrencyAmount.ether(token0TokenAmount.raw)
              : token0TokenAmount;

      parsedToken1Amount =
          token1 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

      setToken1Amount(dependentTokenAmount.toExact());
    } else {
      dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

      let token1TokenAmount = new TokenAmount(
          token1,
          parseUnits(token1Amount, token1Decimal)
      );

      parsedToken0Amount =
          token0 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

      parsedToken1Amount =
          token1 === ETHER
              ? CurrencyAmount.ether(token1TokenAmount.raw)
              : token1TokenAmount;

      setToken0Amount(dependentTokenAmount.toExact());
    }

    console.log(parsedToken0Amount.toExact());
    console.log(parsedToken1Amount.toExact());

    setRemoveLiquidityStatus("input is ok");

    return "input is ok";
  }
}

export async function signOrApprove(
  inputToken0,
  inputToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  exactIn = true,
  chainId,
  library,
  account,
  setToken0Amount,
  setToken1Amount,
  setSignatureData,
  setRemoveLiquidityStatus
) {
  let status = await (async () => {
    let router =await getRouterContract(library, account);
    const {
      address: token0Address,
      symbol: token0Symbol,
      decimal: token0Decimal,
      amount: token0Amount,
    } = inputToken0;
    const {
      address: token1Address,
      symbol: token1Symbol,
      decimal: token1Decimal,
      amount: token1Amount,
    } = inputToken1;

    let token0IsETH = token0Symbol === "ETH";
    let token1IsETH = token1Symbol === "ETH";

    if (!inputToken0.symbol || !inputToken1.symbol)
      return new ACYSwapErrorStatus("One or more token input is missing");
    if (
      exactIn &&
      (isNaN(parseFloat(token0Amount)) || token0Amount === "0" || !token0Amount)
    )
      return new ACYSwapErrorStatus("Format Error");
    if (
      !exactIn &&
      (isNaN(parseFloat(token1Amount)) || token1Amount === "0" || !token1Amount)
    )
      return new ACYSwapErrorStatus("Format Error");

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
      console.log("ATTEMPT TO APPROVE")
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
        setRemoveLiquidityStatus(pair.getErrorText());
        return pair;
      }

      console.log("------------------ PARSE AMOUNT ------------------");
      // convert typed in amount to BigNumber using ethers.js's parseUnits,
      let parsedAmount = exactIn
          ? new TokenAmount(token0, parseUnits(token0Amount, token0Decimal))
          : new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));

      let parsedToken0Amount;
      let parsedToken1Amount;

      console.log("estimated dependent amount");
      // console.log(pair.priceOf(token0).quote(inputAmount).raw.toString());
      let dependentTokenAmount;

      if (exactIn) {
        dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);
        let token0TokenAmount = new TokenAmount(
            token0,
            parseUnits(token0Amount, token0Decimal)
        );
        parsedToken0Amount =
            token0 === ETHER
                ? CurrencyAmount.ether(token0TokenAmount.raw)
                : token0TokenAmount;

        parsedToken1Amount =
            token1 === ETHER
                ? CurrencyAmount.ether(dependentTokenAmount.raw)
                : dependentTokenAmount;

        setToken1Amount(dependentTokenAmount.toExact());
      } else {
        dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

        let token1TokenAmount = new TokenAmount(
            token1,
            parseUnits(token1Amount, token1Decimal)
        );

        parsedToken0Amount =
            token0 === ETHER
                ? CurrencyAmount.ether(dependentTokenAmount.raw)
                : dependentTokenAmount;

        parsedToken1Amount =
            token1 === ETHER
                ? CurrencyAmount.ether(token1TokenAmount.raw)
                : token1TokenAmount;

        setToken0Amount(dependentTokenAmount.toExact());
      }



      console.log(parsedToken0Amount.toExact());
      console.log(parsedToken1Amount.toExact());

      let pairContract =await usePairContract(
          pair.liquidityToken.address,
          library,
          account
      );

      console.log(pairContract);


      // try to gather a signature for permission
      const nonce = await pairContract.nonces(account);

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

      let independentAmount = exactIn ? parsedToken0Amount : parsedToken1Amount;

      let liquidityValue = exactIn
          ? new TokenAmount(token0, token0Deposited.raw)
          : new TokenAmount(token1, token1Deposited.raw);

      let percentToRemove = new Percent(
          independentAmount.raw,
          liquidityValue.raw
      );

      let liquidityAmount = new TokenAmount(
          userPoolBalance.token,
          percentToRemove.multiply(userPoolBalance.raw).quotient
      );


       await approve(liquidityAmount.token.address, liquidityAmount.raw.toString(), library, account);
       return "just approve";

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
      const message = {
        owner: account,
        spender: ROUTER_ADDRESS,
        value: liquidityAmount.raw.toString(),
        nonce: nonce.toHexString(),
        deadline: Math.floor(new Date().getTime() / 1000) + 60,
      };
      const data = JSON.stringify({
        types: {
          EIP712Domain,
          Permit,
        },
        domain,
        primaryType: "Permit",
        message,
      });

      await library
          .send("eth_signTypedData_v4", [account, data])
          .then(splitSignature)
          .then(signature => {

            console.log("sign!!!!!");

            setSignatureData({
              v: signature.v,
              r: signature.r,
              s: signature.s,
              deadline: Math.floor(new Date().getTime() / 1000) + 60,
            });


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
              approve(liquidityAmount.token.address, liquidityAmount.raw.toString(), library, account);


            } else {

              alert("error code 4001!");
              console.log("error code 4001!");
              return new ACYSwapErrorStatus(" 4001 (EIP-1193 user rejected request), fall back to manual approve");
            }
          });




      let allowance = await getAllowance(
          liquidityAmount.token.address,
          account, // owner
          ROUTER_ADDRESS, //spender
          library, // provider
          account // active account
      );

      console.log(`ALLOWANCE FOR TOKEN ${liquidityAmount.token.address}`);
      console.log(allowance);


      return "maybe";


    }
  })();
  if (status instanceof ACYSwapErrorStatus) {
    setRemoveLiquidityStatus(status.getErrorText());
  } else {

    setRemoveLiquidityStatus("OK");
    console.log(status);
    console.log("it seems ok");
  }
}

async function removeLiquidity(
  inputToken0,
  inputToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  exactIn = true,
  chainId,
  library,
  account,
  signatureData,
  setToken0Amount,
  setToken1Amount,
  setSignatureData,
  setRemoveLiquidityStatus
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
  const {
    address: token0Address,
    symbol: token0Symbol,
    decimal: token0Decimal,
    amount: token0Amount,
  } = inputToken0;
  const {
    address: token1Address,
    symbol: token1Symbol,
    decimal: token1Decimal,
    amount: token1Amount,
  } = inputToken1;

  let token0IsETH = token0Symbol === "ETH";
  let token1IsETH = token1Symbol === "ETH";

  if (!inputToken0.symbol || !inputToken1.symbol)
    return new ACYSwapErrorStatus("One or more token input is missing");
  if (
      exactIn &&
      (isNaN(parseFloat(token0Amount)) || token0Amount === "0" || !token0Amount)
  )
    return new ACYSwapErrorStatus("Format Error");
  if (
      !exactIn &&
      (isNaN(parseFloat(token1Amount)) || token1Amount === "0" || !token1Amount)
  )
    return new ACYSwapErrorStatus("Format Error");

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
      setRemoveLiquidityStatus(pair.getErrorText());
      return pair;
    }

    console.log("------------------ PARSE AMOUNT ------------------");
    // convert typed in amount to BigNumber using ethers.js's parseUnits,
    let parsedAmount = exactIn
        ? new TokenAmount(token0, parseUnits(token0Amount, token0Decimal))
        : new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));

    let parsedToken0Amount;
    let parsedToken1Amount;

    console.log("estimated dependent amount");
    // console.log(pair.priceOf(token0).quote(inputAmount).raw.toString());
    let dependentTokenAmount;

    if (exactIn) {
      dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);
      let token0TokenAmount = new TokenAmount(
          token0,
          parseUnits(token0Amount, token0Decimal)
      );
      parsedToken0Amount =
          token0 === ETHER
              ? CurrencyAmount.ether(token0TokenAmount.raw)
              : token0TokenAmount;

      parsedToken1Amount =
          token1 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

      setToken1Amount(dependentTokenAmount.toExact());
    } else {
      dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

      let token1TokenAmount = new TokenAmount(
          token1,
          parseUnits(token1Amount, token1Decimal)
      );

      parsedToken0Amount =
          token0 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

      parsedToken1Amount =
          token1 === ETHER
              ? CurrencyAmount.ether(token1TokenAmount.raw)
              : token1TokenAmount;

      setToken0Amount(dependentTokenAmount.toExact());
    }

    console.log(parsedToken0Amount.toExact());
    console.log(parsedToken1Amount.toExact());

    let pairContract = usePairContract(
        pair.liquidityToken.address,
        library,
        account
    );

    console.log(pairContract);


    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);

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

    let independentAmount = exactIn ? parsedToken0Amount : parsedToken1Amount;

    let liquidityValue = exactIn
        ? new TokenAmount(token0, token0Deposited.raw)
        : new TokenAmount(token1, token1Deposited.raw);

    let percentToRemove = new Percent(
        independentAmount.raw,
        liquidityValue.raw
    );

    let liquidityAmount = new TokenAmount(
        userPoolBalance.token,
        percentToRemove.multiply(userPoolBalance.raw).quotient
    );

    console.log("show percent");
    console.log(liquidityAmount);
    console.log(percentToRemove);

    console.log(percentToRemove.multiply(userPoolBalance.raw).quotient);


    let liquidityApproval = await checkTokenIsApproved(
        liquidityAmount.token.address,
        liquidityAmount.raw.toString(),
        library,
        account
    );

    if (!liquidityApproval) {
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
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          token1IsETH ? token0Address : token1Address,
          liquidityAmount.raw.toString(),
          amountsMin[ token0IsETH? "CURRENCY_A" : "CURRENCY_B"].toString(),
          amountsMin[ token1IsETH? "CURRENCY_B" : "CURRENCY_A"].toString(),
          // amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          // amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`
        ]
      } else {
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

    const safeGasEstimates = await Promise.all(
        methodNames.map(methodName=>
            router.estimateGas[methodName](...args)
                .then(calculateGasMargin)
                .catch(error => {
                  console.error(`estimateGas failed`, methodName, args, error)
                  return ACYSwapErrorStatus(console.error(`estimateGas failed`, methodName, args, error))
                })
        )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
        BigNumber.isBigNumber(safeGasEstimate)
    )

    if(indexOfSuccessfulEstimation === -1) {
      console.error("This transaction would fail. Please contact support.");

    }else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      await router[methodName](...args, {
        gasLimit: safeGasEstimate
      })
          .then((response) => {
            console.log(response);

          })
    }
  }
})();

if (status instanceof ACYSwapErrorStatus) {
  setRemoveLiquidityStatus(status.getErrorText());
} else {
  console.log(status);
  setRemoveLiquidityStatus("OK");
}
}

const RemoveLiquidityComponent = () => {
  let [token0, setToken0] = useState(null);
  let [token1, setToken1] = useState(null);
  let [token0Balance, setToken0Balance] = useState("0");
  let [token1Balance, setToken1Balance] = useState("0");
  let [token0Amount, setToken0Amount] = useState("0");
  let [token1Amount, setToken1Amount] = useState("0");

  let [slippageTolerance,setSlippageTolerance]=useState(INITIAL_ALLOWED_SLIPPAGE/100);
  let [liquidityBreakdown, setLiquidityBreakdown] = useState();
  let [needApprove,setNeedApprove]=useState(false);

  let [exactIn, setExactIn] = useState(true);

  let [userLiquidityPosition,setUserLiquidityPosition]=useState("you need to get tokens");


  let [removeLiquidityStatus, setRemoveLiquidityStatus] = useState("");
  let [signatureData, setSignatureData] = useState(null);



  const individualFieldPlaceholder = "Enter amount";
  const dependentFieldPlaceholder = "Estimated value";
  const slippageTolerancePlaceholder="please input a number from 1.00 to 100.00"


  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });


  useEffect(() => {
  //  activate(injected);
  }, []);

  useEffect( ()=>{
    async function getUserRemoveLiquidityPositions(){
      if(!token0 && !token1){
        setUserLiquidityPosition("you need to choose  tokens");
        return;
      }
      if(!token0||!token1){
        setUserLiquidityPosition("please choose the other token ");
        return;
      }
      if(account==undefined){
        setUserLiquidityPosition("you need to set your account");
        return;
      }
      await getUserRemoveLiquidityBalance(
          token0,
          token1,
          chainId,
          account,
          library,
          setUserLiquidityPosition,
          setToken0Balance,
          setToken1Balance
      );
    }
    getUserRemoveLiquidityPositions();
  },[token0,token1,chainId,account,library]);

  let inputChange = useCallback(async() =>{
    processInput(
        {
          ...token0,
          amount: token0Amount,
        },
        {
          ...token1,
          amount: token1Amount,
        },
        100*slippageTolerance,
        exactIn,
        chainId,
        library,
        account,
        setToken0Amount,
        setToken1Amount,
        setSignatureData,
        setRemoveLiquidityStatus);
  },[token0,token1,token0Amount,token1Amount,slippageTolerance,exactIn,chainId,library,account]);


  useEffect(()=>{
      inputChange();
  },[token0Amount,token1Amount]);


  return (
    <div>
      <h1>Remove liquidity</h1>
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
                    setToken0(token);

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

            onFocus={(e)=>{
              setExactIn(true);
            }}
            onChange={(e) => {

              setToken0Amount(e.target.value);

            }}
          />
          <small>Balance: {token0Balance}</small>
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
                    setToken1(token);


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
          <small>Balance: {token1Balance}</small>
        </Form.Group>

        <h3>user liquidity position</h3>
        <Alert variant="info">{userLiquidityPosition}</Alert>


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

        <h3>Remove Liquidity status</h3>
        <Alert variant="info">{removeLiquidityStatus}</Alert>

        {/* APPROVE BUTTONS */}
        <Button
          variant="warning"
          onClick={() => {
            signOrApprove(
              {
                ...token0,
                amount: token0Amount,
              },
              {
                ...token1,
                amount: token1Amount,
              },
                slippageTolerance*100,
              exactIn,
              chainId,
              library,
              account,
              setToken0Amount,
              setToken1Amount,
              setSignatureData,
              setRemoveLiquidityStatus
          );
            console.log("Approve");
          }}
        >
          Sign or Approve
        </Button>
        {' '}
        <Button
          variant="success"
          onClick={() => {
            removeLiquidity(
              {
                ...token0,
                amount: token0Amount,
              },
              {
                ...token1,
                amount: token1Amount,
              },
                slippageTolerance*100,
              exactIn,
              chainId,
              library,
              account,
              signatureData,
              setToken0Amount,
              setToken1Amount,
              setSignatureData,
              setRemoveLiquidityStatus
            );
          }}
        >
          Remove Liquidity
        </Button>
      </Form>
    </div>
  );
};

export default RemoveLiquidityComponent;
