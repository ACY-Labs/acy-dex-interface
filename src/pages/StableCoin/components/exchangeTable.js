import styles from './exchangeTable.less';
export const ExchangeTable = props => {
  //read props

  return (
    <div className={styles.exchangeTable}>
      <table className={styles.tableStyle}>
        <tr>
          <td>Exchange</td>
          <td>Est.received</td>
          <td>Gas estimate</td>
          <td>Diff</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>Filpper</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>Origin Vault</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>Uniswap V3</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>Curve</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>Uniswap V2</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
        <tr>
          <td className={styles.exchangeName}>SushiSwap</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTr}>-</td>
          <td className={styles.tableTrRight}>-</td>
        </tr>
      </table>
    </div>

  );
};
