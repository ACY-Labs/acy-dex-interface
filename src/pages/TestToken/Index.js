import BuyInputSection from "../BuyGlp/components/BuyInputSection"
import ComponentButton from "@/components/ComponentButton";
import { formatAmount } from "@/acy-dex-futures/utils"
import { bigNumberify } from "@/acy-dex-futures/utils"
import { getTokens, getTokenBySymbol, getContract, getTokenByAddress } from '@/constants/future.js';
import { useState } from "react"

const TestToken = () => {
    const chainId = 80001
    
    ///// input box
    const initialToToken = getTokenBySymbol(80001, "USDT")
    const [fromToken, setFromToken] = useState(initialToToken)
    const [fromValue, setFromValue] = useState("");
    let balance = bigNumberify(0)
    const tokens = getTokens(chainId)

    let payBalance = "$0.00"
    let receiveBalance = "-"
    const onFromValueChange = e => {
        setFromValue(e.target.value);
    }

    const selectFromToken = symbol => {
        const token = getTokenBySymbol(chainId, symbol)
        setFromToken(token)
    };

    ///// button
    const [isPrimaryEnabled, setIsPrimaryEnabled] = useState(true)

    const getPrimaryText = () => {
        return "Mint"
    }

    const onClickPrimary = () => {

    }

    return (
        <>
            <div>hello this is a test token faucet page</div>

            <BuyInputSection
                token={fromToken}
                tokenlist={tokens.filter(token => !token.isWrapped)}
                topLeftLabel="Pay"
                balance={payBalance}
                topRightLabel='Balance: '
                tokenBalance={formatAmount(balance, fromToken.decimals, 4, true)}
                inputValue={fromValue}
                onInputValueChange={onFromValueChange}
                onSelectToken={selectFromToken}
            />

            <ComponentButton
                style={{ marginTop: '25px' }}
                onClick={onClickPrimary}
                disabled={!isPrimaryEnabled}
            >
                {getPrimaryText()}
            </ComponentButton>
        </>
    )
}
export default TestToken