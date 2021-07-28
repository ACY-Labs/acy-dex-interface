import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import styles from './style.less';

export default class AcyApprove extends PureComponent {
  state = {
    colors: [
      { color: '#C51E4E', activity: true },
      { color: '#C51E4E', activity: false },
      { color: '#C51E4E', activity: false },
      { color: '#EB5C20', activity: false },
      { color: '#EB5C20', activity: false },
      { color: '#EB5C20', activity: false },
      { color: '#E29226', activity: false },
      { color: '#E29226', activity: false },
      { color: '#E29226', activity: false },
    ],
  };
  componentDidMount() {
    const { colors } = this.state;

    let ind = 0;
    this.timer = setInterval(() => {
      if (ind > 8) {
        ind = -1;
        let newColors = colors.map(item => {
          item.activity = false;
          return item;
        });
        this.setState({
          colors: newColors,
        });
      } else {
        colors[ind].activity = true;
      }
      ind++;
      this.setState({
        random: new Date(),
      });
    }, 150);
  }
  render() {
    const { ...rest } = this.props;
    const { colors } = this.state;
    return (
      <Modal
        className={styles.acyapprove}
        bodyStyle={{
          padding: '21px 100px',
          background: '#2A2A2D',
          borderRadius: ' 20px',
        }}
        footer={null}
        closable={false}
        {...rest}
      >
        <div className={styles.title}>Approve</div>
        <div className={styles.block}>
          {colors.map((item, index) => (
            <div
              style={
                (item.activity && { background: item.color }) || {
                  border: `1px solid ${item.color}`,
                }
              }
              className={styles.box}
            />
          ))}
        </div>
        <p>Please approve in your wallet</p>
      </Modal>
    );
  }
}
