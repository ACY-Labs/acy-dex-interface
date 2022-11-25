import { connect } from "umi";
import { useState } from 'react';
import Media from 'react-media';
import styles from './style.less';
import { Graphics } from "./components/graphics"
import { VaultCard } from "./components/vaultCard";
import { StartegyCard } from "./components/strategyCard";
import { ValueCalculations } from "./components/valueCalculations"
import { useHistory } from 'react-router-dom'
import ComponentTabs from "@/components/ComponentTabs";

const stats = (props) => {
  /* #region  graph */
  const graphData1 = {
    iframeUrl: "https://dune.xyz/embeds/278146/524806/476159a6-b7bb-4cf7-96e2-e74f99170b4a",
    label: (<div className={styles.label}>
      Total&nbsp;Supply
    </div>),
    data: 'XXXX',
    unit: 'OUSD',
    hasData: true
  }
  const graphData2 = {
    iframeUrl: "https://dune.xyz/embeds/271634/519050/34dc346b-e90f-4c4b-86ab-1107fe8d6a4b",
    label: (<div class="label">
      Trailing&nbsp;365 Day&nbsp;APY
    </div>),
    data: 'XXXX',
    hasData: true
  }
  const graphData3 = {
    iframeUrl: "https://dune.xyz/embeds/284182/536054/8efedf92-132d-43f9-974c-d6aaa2ad53b6",
    hasData: false
  }
  const graphData4 = {
    iframeUrl: "https://dune.xyz/embeds/284273/536199/c65ae6a8-90cf-4d06-8d86-84d0080aa39d",
    hasData: false
  }
  const graphData5 = {
    iframeUrl: "https://dune.xyz/embeds/284704/537456/a450c5db-957f-4832-8e5b-b91dd8c5db55",
    hasData: false
  }
  const graphData6 = {
    iframeUrl: "https://dune.xyz/embeds/285485/539422/ea76c2ad-232d-4001-9c78-ecf5231b9700",
    hasData: false
  }
  const graphData7 = {
    iframeUrl: "https://dune.xyz/embeds/283166/534275/1d88ccea-eec7-4e8f-9a86-3bc47b605053",
    hasData: false
  }
  const graphData8 = {
    iframeUrl: "https://dune.xyz/embeds/284111/536003/6b5abcab-4856-4590-b03f-47da6959202e",
    hasData: false
  }
  const graphData9 = {
    iframeUrl: "https://dune.xyz/embeds/278734/528075/c2b8b10f-9a32-495b-a5e1-bccbae2a860a",
    hasData: false
  }
  const graphData10 = {
    iframeUrl: "https://dune.xyz/embeds/412267/786810/c0746688-f5a3-450e-b7ae-f6d7f86dec58",
    hasData: false
  }
  const graphData11 = {
    iframeUrl: "https://dune.xyz/embeds/415779/792793/c522b4f5-65e4-467b-ae8c-2aec9cc5e5af",
    hasData: false
  }
  /* #endregion */

  const vaultData1 = {
    tittle: 'Vault Holdings',
    list: [{
      imgSrc: '',
      tokenName: 'DAI',
      value: '56,404,403.67'
    },
    {
      imgSrc: '',
      tokenName: 'USDT',
      value: '56,404,403.67'
    },
    {
      imgSrc: '',
      tokenName: 'USDC',
      value: '56,404,403.67'
    },
    {
      imgSrc: '',
      tokenName: 'COMP',
      value: '56,404,403.67'
    }
    ]
  }

  const startegyData1 = {
    imgSrc: '',
    tittle: 'Compound Strategy Alloctaion',
    list: [{
      tokenName: 'DAI',
      value: '56,404,403.67'
    },
    {
      tokenName: 'USDT',
      value: '56,404,403.67'
    },
    {
      tokenName: 'USDC',
      value: '56,404,403.67'
    },
    ]
  }

  const history = useHistory()

  const [statsType, setStatsType] = useState("StableCoin")
  const statsTypes = ["Market", "Future", "StableCoin"]
  const onChangeStats = item => {
    history.push('/statistics/' + item.toLowerCase())
  }

  return (
    <div className={styles.statsPage}>
      {/* <div className={`${styles.colItem}`}>
        <div
          className={styles.optionTab}
          onClick={() => {
            history.push('/statistics/market')
          }}
        >
          Market
        </div>
        <div
          className={styles.optionTab}
          onClick={() => {
            history.push('/statistics/future')
          }}
        >
          Future
        </div>
        <div className={styles.optionTabSelected}> StableCoin </div>
      </div> */}
      {/* <div className={styles.tittle}>
                USDA ANALYTICS
            </div> */}
      <div className={styles.statsTab}>
        <ComponentTabs
          option={statsType}
          options={statsTypes}
          onChange={onChangeStats}
        />
      </div>
      <div className={`${styles.content} ${styles.container}`}>
        <div className={styles.graph} >
          <Graphics {...graphData1}></Graphics>
          <Graphics {...graphData2}></Graphics>
        </div>

        <div className={styles.columns}>
          <VaultCard {...vaultData1} className={styles.leftVaultCard}></VaultCard>
          <VaultCard {...vaultData1} className={styles.rightVaultCard}></VaultCard>
        </div>

        <div className={styles.columns}>
          <StartegyCard {...startegyData1}></StartegyCard>
          <StartegyCard {...startegyData1}></StartegyCard>
          <StartegyCard {...startegyData1}></StartegyCard>
        </div>

        <div className={styles.graph}>
          <Graphics {...graphData3}></Graphics>
          <Graphics {...graphData4}></Graphics>
          <Graphics {...graphData5}></Graphics>
          <Graphics {...graphData6}></Graphics>
          <Graphics {...graphData7}></Graphics>
          <Graphics {...graphData8}></Graphics>
          <Graphics {...graphData9}></Graphics>
          <Graphics {...graphData10}></Graphics>
          <Graphics {...graphData11}></Graphics>
        </div>
        <ValueCalculations></ValueCalculations>
      </div>

    </div>
  )
}

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(stats);