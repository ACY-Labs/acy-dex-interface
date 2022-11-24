import { useState } from "react";
import { Button, Icon, Divider } from 'antd';
import Modal from "./Modal.js";
import styles from './style.less';

const AcyPattern = ({ leverage, ...rest }) => {
  const [visibleCross, setVisibleCross] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pmm, setPmm] = useState([{ value: 'Cross', checked: true }, { value: 'Isolated', checked: false }]);
  const onCheck = (ind) => {
    setPmm(data => {
      return data.map((item, index) => {
        item.checked = false;
        if (index == ind) {
          item.checked = true;
        }
        return item;
      })
    })
  }
  return (<div {...rest}>
    <div className={styles.pattern}>
      <div onClick={() => setVisibleCross(true)}>Cross</div>
      <div onClick={() => setVisible(true)}>2x</div>
    </div>
    <Modal
      title="Perpetual Margin Mode"
      visible={visibleCross}
      onCancel={() => setVisibleCross(false)}
      footer={null}
    >
      <div className={styles.btngroup}>
        {
          pmm.map((item, index) => <div onClick={() => onCheck(index)} className={`${styles.btn} ${item.checked && styles.active}`}>
            {item.value}
            {
              item.checked && <><div className={styles.check}></div>
                <div className={styles.icon}><Icon type="check" /></div></>
            }

          </div>)
        }
      </div>
      {
        pmm.filter(item => item.value == "Cross" && item.checked).length > 0 &&
        <div className={styles.tips}>
          All cross positions under the same margin asset share the same asset cross margin balance. In the event of liquidation, your assets full margin balance along with any remaining open positions under the asset may be forfeited.
          <br />
          Under cross margin, all available balance of the corresponding margin account will be deployed to meet maintenance margin requirements and prevent liquidation. All corresponding available balance can be lost in the event of liquidation. Please note that adjusting the leverage will affect all positions and active orders under the current pair.
        </div> || <div className={styles.tips}>
           Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of a position reached 100%, the position will be liquidated. Margin can be added or removed to positions using this mode.
          <br />
          Under isolated margin, a specific amount of margin, i.e. initial margin, is applied to a position, and position margin can be adjusted manually. In the event of a liquidation, you may lose the initial margin and extra margin added to this position. Please note that adjusting the leverage will affect all positions and active orders under the current pair.
        </div>
      }


      <Button className={styles.confirm} type="primary">Confirm</Button>
    </Modal>
    <Modal
      title="Adjust Leverage"
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={null}
    >
      {leverage}
      <Button className={styles.confirm} type="primary">Confirm</Button>
    </Modal>
  </div>
  );
};
export default AcyPattern;
