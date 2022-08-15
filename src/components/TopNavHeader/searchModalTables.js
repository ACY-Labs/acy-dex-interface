import React, { useState, useEffect } from 'react';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';
import styles from './styles.less'

export class PairsTable extends React.Component {
    constructor(props) {
      super(props);
    }
  
    state = {
      mode: this.props.mode,
      tableData: this.props.data,
      updateState: 0,
    };
  
    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.data !== prevProps.data) {
        this.setState({
          tableData: this.props.data,
        });
      }
    }
  
    renderBody = entry => {
      let content = <></>;
  
      if (this.props.data.length == 0) {
        return;
      }
  
      if (this.state.mode == 'pairs') {
        content = (
          <div className={styles.tableItem}>
            <AcyTokenIcon symbol={entry.logoURI} />
            <span className={styles.coinShort}>{entry.name}</span>
            <div style={{lineHeight: '30px'}}>
                <span>Token: {entry.tokenAddress}</span>
                <span style={{marginLeft: '10px'}}>|</span>
                <span style={{marginLeft: '10px'}}>Pair: {entry.pairAddress}</span>
                <span style={{marginLeft: '10px'}}>|</span>
                <span style={{marginLeft: '10px'}}>Tx: {entry.tx}</span>
                <span className={styles.tableItemTag}>{entry.chain}</span>
                <span className={styles.tableItemTag}>{entry.company}</span>
            </div>
          </div>
        );
      } else {
        content = (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AcyTokenIcon symbol={entry.logoURL1} width={20} />
            <AcyTokenIcon symbol={entry.logoURL2} width={20} />
            <Link
              style={{ color: 'white' }}
              to={`/market/info/pool/${entry.address}`}
            >
              <span className={styles.coinName}>
                {entry.coin1}{' / '}{entry.coin2}
              </span>
            </Link>
          </div>
        );
      }
  
      return (
        <tr className={styles.smallTableRow}>
          <td className={styles.smallTableBody}>{content}</td>
        </tr>
      );
    };
  
  
    render() {
      return (
        <table className={styles.smallTable}>
          <tbody>
            {this.state.tableData.map(item => this.renderBody(item))}
          </tbody>
        </table>
      );
    }
  }