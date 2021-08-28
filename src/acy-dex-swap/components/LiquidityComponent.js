import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  calculateSlippageAmount,
  INITIAL_ALLOWED_SLIPPAGE,
} from '../utils';

import { Form, Button, Alert, Dropdown, InputGroup, FormControl } from 'react-bootstrap';
import {
  Token,
  TokenAmount,
  Fetcher,
  Percent,
  WETH,
  ETHER,
  CurrencyAmount,
  FACTORY_ADDRESS,
} from '@uniswap/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';

export async function addLiquidity(
  inputToken0,
  inputToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
  exactIn = true,
  chainId,
  library,
  account,
  setNeedApproveToken0,
  setNeedApproveToken1,
  setApproveAmountToken0,
  setApproveAmountToken1,
  setLiquidityStatus,
  setLiquidityBreakdown,
  setToken0Amount,
  setToken1Amount
) {
  let status = await (async () => {
    // check uniswap
    console.log(FACTORY_ADDRESS);

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

    let token0IsETH = token0Symbol === 'ETH';
    let token1IsETH = token1Symbol === 'ETH';

    if (!inputToken0.symbol || !inputToken1.symbol)
      return new ACYSwapErrorStatus('One or more token input is missing');
    if (exactIn && (isNaN(parseFloat(token0Amount)) || token0Amount === '0' || !token0Amount))
      return new ACYSwapErrorStatus('Format Error');
    if (!exactIn && (isNaN(parseFloat(token1Amount)) || token1Amount === '0' || !token1Amount))
      return new ACYSwapErrorStatus('Format Error');

    console.log('------------------ RECEIVED TOKEN ------------------');
    console.log('token0');
    console.log(inputToken0);
    console.log('token1');
    console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new ACYSwapErrorStatus("Doesn't support ETH to ETH");

    if ((token0IsETH && token1Symbol === 'WETH') || (token0Symbol === 'WETH' && token1IsETH)) {
      // UI should sync value of ETH and WETH
      if (exactIn) setToken1Amount(token0Amount);
      else setToken0Amount(token1Amount);

      return new ACYSwapErrorStatus('Invalid pair WETH/ETH');
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    else {
      console.log('ADD LIQUIDITY');
      console.log('------------------ CONSTRUCT TOKEN ------------------');

      // use WETH for ETHER to work with Uniswap V2 SDK
      const token0 = token0IsETH
        ? WETH[chainId]
        : new Token(chainId, token0Address, token0Decimal, token0Symbol);
      const token1 = token1IsETH
        ? WETH[chainId]
        : new Token(chainId, token1Address, token1Decimal, token1Symbol);

      // quit if the two tokens are equivalent, i.e. have the same chainId and address
      if (token0.equals(token1)) return new ACYSwapErrorStatus('Equal tokens!');

      // check user account balance
      console.log('------------------ CHECK BALANCE ------------------');

      let userToken0Balance = await getUserTokenBalanceRaw(
        token0IsETH ? ETHER : new Token(chainId, token0Address, token0Decimal, token0Symbol),
        account,
        library
      );

      let userToken1Balance = await getUserTokenBalanceRaw(
        token1IsETH ? ETHER : new Token(chainId, token1Address, token1Decimal, token1Symbol),
        account,
        library
      );

      console.log('token0 balance');
      console.log(userToken0Balance);

      console.log('token1 balance');
      console.log(userToken1Balance);

      let userHasSufficientBalance =
        userToken0Balance.gt(parseUnits(token0Amount, token0Decimal)) &&
        userToken1Balance.gt(parseUnits(token1Amount, token1Decimal));

      // quit if user doesn't have enough balance, otherwise this will cause error
      if (!userHasSufficientBalance) return new ACYSwapErrorStatus('Not enough balance');

      // get pair using our own provider
      console.log('------------------ CONSTRUCT PAIR ------------------');
      console.log('FETCH');
      // if an error occurs, because pair doesn't exists
      const pair = await Fetcher.fetchPairData(token0, token1, library).catch(e => {
        console.log(e);
        return new ACYSwapErrorStatus(
          `${token0.symbol} - ${token1.symbol} pool does not exist. Creating one`
        );
      });

      console.log(pair);
      let noLiquidity = false;
      if (pair instanceof ACYSwapErrorStatus) {
        setLiquidityStatus(pair.getErrorText());
        noLiquidity = true;
      }

      console.log('------------------ PARSE AMOUNT ------------------');
      // convert typed in amount to BigNumber using ethers.js's parseUnits,
      let parsedAmount = exactIn
        ? new TokenAmount(token0, parseUnits(token0Amount, token0Decimal))
        : new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));

      let parsedToken0Amount;
      let parsedToken1Amount;

      if (!noLiquidity) {
        console.log('estimated dependent amount');
        // console.log(pair.priceOf(token0).quote(inputAmount).raw.toString());
        let dependentTokenAmount;
        if (exactIn) {
          dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);

          let token0TokenAmount = new TokenAmount(token0, parseUnits(token0Amount, token0Decimal));

          parsedToken0Amount =
            token0 === ETHER ? CurrencyAmount.ether(token0TokenAmount.raw) : token0TokenAmount;

          parsedToken1Amount =
            token1 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

          setToken1Amount(dependentTokenAmount.toExact());
        } else {
          dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

          let token1TokenAmount = new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));

          parsedToken0Amount =
            token0 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

          parsedToken1Amount =
            token1 === ETHER ? CurrencyAmount.ether(token1TokenAmount.raw) : token1TokenAmount;

          setToken0Amount(dependentTokenAmount.toExact());
        }
      } else {
        if (token0Amount === '0' || token1Amount === '0') {
          if (noLiquidity) {
            return new ACYSwapErrorStatus('Creating a new pool, please enter both amounts');
          }
          return new ACYSwapErrorStatus("One field is empty, it's probably a new pool");
        }

        parsedToken0Amount = new TokenAmount(token0, parseUnits(token0Amount, token0Decimal));
        parsedToken1Amount = new TokenAmount(token1, parseUnits(token1Amount, token1Decimal));
      }

      console.log('------------------ BREAKDOWN ------------------');

      if (!noLiquidity) {
        let totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);
        console.log('Liquidity MInted');
        console.log(pair.liquidityToken);
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
          `Pool reserve: ${pair.reserve0.toExact()} ${
            pair.token0.symbol
          } + ${pair.reserve1.toExact()} ${pair.token1.symbol}`,
          `Pool share: ${poolTokenPercentage}%`,
          `${token0.symbol}: ${parsedToken0Amount.toExact()}`,
          `${token1.symbol}: ${parsedToken1Amount.toExact()}`,
          // noLiquidity ? "100" : `${poolTokenPercentage?.toSignificant(4)}} %`,
        ]);
      } else {
        setLiquidityBreakdown(['New pool']);
      }

      let approveStatus = 0;

      console.log('------------------ ALLOWANCE ------------------');
      if (!token0IsETH) {
        let token0approval = await checkTokenIsApproved(
          token0Address,
          parsedToken0Amount.raw.toString(),
          library,
          account
        );
        console.log('token 0 approved?');
        console.log(token0approval);

        if (!token0approval) {
          console.log('Not enough allowance');
          setApproveAmountToken0(parsedToken0Amount.raw.toString());
          setNeedApproveToken0(true);
          approveStatus += 1;
        }
      }

      if (!token1IsETH) {
        console.log(`Inside addLiquidity, amount needed: ${parsedToken1Amount.raw.toString()}`);
        let token1approval = await checkTokenIsApproved(
          token1Address,
          parsedToken1Amount.raw.toString(),
          library,
          account
        );
        console.log('token 1 approved?');
        console.log(token1approval);

        if (!token1approval) {
          console.log('Not enough allowance for token1');
          setApproveAmountToken1(parsedToken1Amount.raw.toString());
          setNeedApproveToken1(true);
          approveStatus += 2;
        }
      }

      if (approveStatus > 0) {
        return new ACYSwapErrorStatus(
          `Need approve ${
            approveStatus === 1
              ? token0Symbol
              : approveStatus === 2
              ? token1Symbol
              : `${token0Symbol} and ${token1Symbol}`
          }`
        );
      }

      console.log('------------------ PREPARE ADD LIQUIDITY ------------------');

      setLiquidityStatus('Processing add liquidity request');
      console.log('parsed token 0 amount');
      console.log(parsedToken0Amount.raw);
      console.log('parsed token 1 amount');
      console.log(parsedToken1Amount.raw);
      console.log('slippage');
      console.log(allowedSlippage);

      let estimate;
      let method;
      let args;
      let value;

      if (token0IsETH || token1IsETH) {
        estimate = router.estimateGas.addLiquidityETH;
        method = router.addLiquidityETH;
        let nonETHToken = token0IsETH ? token1 : token0;

        let parsedNonETHTokenAmount = token0IsETH ? parsedToken1Amount : parsedToken0Amount;

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
          token0Address,
          token1Address,
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

      console.log(args);

      let result = await estimate(...args, value ? { value } : {}).then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).catch(e => {
          return new ACYSwapErrorStatus('Error in transaction');
        })
      );

      return result;
    }
  })();
  if (status instanceof ACYSwapErrorStatus) {
    setLiquidityStatus(status.getErrorText());
  } else {
    console.log(status);
    setLiquidityStatus('OK');
  }
}

// expects at least has WETH as one of the tokens
async function getAllLiquidityPositions(tokens, chainId, library, account) {
  // we only want WETH
  tokens = tokens.filter(token => token.symbol !== 'ETH');

  let totalTokenCount = tokens.length;
  let userNonZeroLiquidityPositions = [];

  if (totalTokenCount === 1) return;

  let checkLiquidityPositionTasks = [];

  for (let i = 0; i < totalTokenCount; i++) {
    for (let j = i + 1; j < totalTokenCount; j++) {
      const { address: token0Address, symbol: token0Symbol, decimal: token0Decimal } = tokens[i];
      const { address: token1Address, symbol: token1Symbol, decimal: token1Decimal } = tokens[j];

      const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
      const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

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
    if (pair.status === 'rejected') continue;

    pair = pair.value;

    let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

    if (userPoolBalance.isZero()) continue;

    userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    let totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

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

    let totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

    let liquidityMinted = pair.getLiquidityMinted(totalSupply, token0Deposited, token1Deposited);

    let poolTokenPercentage = new Percent(liquidityMinted.raw, totalSupply.raw).toFixed(4);

    userNonZeroLiquidityPositions.push({
      pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
      token0Amount: `${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`,
      token1Amount: `${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`,
      token0Reserve: `${pair.reserve0.toExact()} ${pair.token0.symbol}`,
      token1Reserve: `${pair.reserve1.toExact()} ${pair.token1.symbol}`,
      share: `${poolTokenPercentage}%`,
    });
  }

  console.log('token pairs that user has positions:');
  console.log(userNonZeroLiquidityPositions);
  return userNonZeroLiquidityPositions;
}

const LiquidityComponent = () => {
  let [token0, setToken0] = useState(null);
  let [token1, setToken1] = useState(null);
  let [token0Balance, setToken0Balance] = useState('0');
  let [token1Balance, setToken1Balance] = useState('0');
  let [token0Amount, setToken0Amount] = useState('0');
  let [token1Amount, setToken1Amount] = useState('0');
  let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);

  let [liquidityBreakdown, setLiquidityBreakdown] = useState();
  let [liquidityStatus, setLiquidityStatus] = useState();

  let [needApproveToken0, setNeedApproveToken0] = useState(false);
  let [needApproveToken1, setNeedApproveToken1] = useState(false);

  let [approveAmountToken0, setApproveAmountToken0] = useState('0');
  let [approveAmountToken1, setApproveAmountToken1] = useState('0');
  let [userLiquidityPositions, setUserLiquidityPositions] = useState([]);
  let [exactIn, setExactIn] = useState(true);

  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  useEffect(() => {
    // activate(injected);
  }, []);

  let getDependentField = useCallback(
    async () => {
      let estimated = await addLiquidityGetEstimated(
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

      if (!estimated) estimated = 0;

      return estimated;
    },
    [token0, token1, token0Amount, token1Amount, chainId, library, exactIn]
  );

  let t0Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;

      if (!exactIn) return;

      let estimated = await getDependentField();

      setToken1Amount(estimated);
    },
    [token0, token1, getDependentField, exactIn]
  );

  let t1Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;

      if (exactIn) return;

      let estimated = await getDependentField();

      setToken0Amount(estimated);
    },
    [token0, token1, getDependentField, exactIn]
  );

  useEffect(
    () => {
      t0Changed();
    },
    [token0Amount, t0Changed]
  );

  useEffect(
    () => {
      t1Changed();
    },
    [token1Amount, t1Changed]
  );

  useEffect(
    () => {
      async function getAllUserLiquidityPositions() {
        if (account != undefined) {
          setUserLiquidityPositions(
            await getAllLiquidityPositions(supportedTokens, chainId, library, account)
          );
        }
      }
      getAllUserLiquidityPositions();
    },
    [chainId, library, account]
  );

  return (
    <div>
      <h1>Add liquidity</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {(token0 && token0.symbol) || 'In token'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {supportedTokens.map((token, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={async () => {
                    setToken0(token);
                    setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
                  }}
                >
                  {token.symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            value={token0Amount}
            placeholder={exactIn ? individualFieldPlaceholder : dependentFieldPlaceholder}
            onChange={e => {
              setExactIn(true);
              setToken0Amount(e.target.value);
            }}
          />
          <small>Balance: {token0Balance}</small>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {(token1 && token1.symbol) || 'Out token'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {supportedTokens.map((token, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={async () => {
                    setToken1(token);
                    setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
                  }}
                >
                  {token.symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            value={token1Amount}
            placeholder={exactIn ? dependentFieldPlaceholder : individualFieldPlaceholder}
            onChange={e => {
              setExactIn(false);
              setToken1Amount(e.target.value);
            }}
          />
          <small>Balance: {token1Balance}</small>
        </Form.Group>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-sizing-sm">Slippage tolerance </InputGroup.Text>
          <FormControl
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            placeholder={slippageTolerancePlaceholder}
            onChange={e => {
              setSlippageTolerance(e.target.value);
            }}
          />
          <InputGroup.Text>%</InputGroup.Text>
        </InputGroup>

        {/*<Alert variant="danger">*/}
        {/*  Slippage tolerance: {INITIAL_ALLOWED_SLIPPAGE} bips ({INITIAL_ALLOWED_SLIPPAGE*0.01}%)*/}
        {/*</Alert>*/}

        <Alert variant="danger">
          the Slippage Tolerance you choose is [ {slippageTolerance}% ]
        </Alert>

        {/*<Alert variant="danger">*/}
        {/*  Slippage tolerance: {INITIAL_ALLOWED_SLIPPAGE} bips (0.01%)*/}
        {/*</Alert>*/}

        <Alert variant="primary">
          {liquidityBreakdown && liquidityBreakdown.map(info => <p>{info}</p>)}
        </Alert>
        <Alert variant="info">Liquidity status: {liquidityStatus}</Alert>

        <div>
          {needApproveToken0 == 'true'
            ? 'plase click the left approve button'
            : "you don't need to click the left approve button"}{' '}
          <br />
          {needApproveToken1 == 'true'
            ? 'plase click the right approve button'
            : "you don't need to click the right approve button"}{' '}
          <br />
        </div>

        {/* APPROVE BUTTONS */}
        <Button
          variant="warning"
          onClick={() => {
            approve(token0.address, approveAmountToken0, library, account);
          }}
        >
          Approve {token0 && token0.symbol}
        </Button>
        <Button
          variant="warning"
          onClick={() => {
            approve(token1.address, approveAmountToken1, library, account);
          }}
        >
          Approve {token1 && token1.symbol}
        </Button>

        <Button
          variant="success"
          onClick={() => {
            addLiquidity(
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
              setNeedApproveToken0,
              setNeedApproveToken1,
              setApproveAmountToken0,
              setApproveAmountToken1,
              setLiquidityStatus,
              setLiquidityBreakdown,
              setToken0Amount,
              setToken1Amount
            );
          }}
        >
          Add Liquidity
        </Button>

        <h2>Your positions</h2>
        {userLiquidityPositions.map(position => (
          <Alert variant="dark">
            {Object.values(position).map(field => (
              <p>{field}</p>
            ))}
          </Alert>
        ))}
      </Form>
    </div>
  );
};

export default LiquidityComponent;
