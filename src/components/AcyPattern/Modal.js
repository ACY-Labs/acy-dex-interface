import { Modal,Icon } from 'antd';
import styles from "./style.less";

export default function KpDrawer(props) {
    return <Modal wrapClassName={styles.modal} width={420} {...props}>
        <div className={styles.title}>
            <span>{props.title}</span><Icon type="close" onClick={()=>props.onCancel&&props.onCancel()}/>
        </div>
        {props.children}
    </Modal>;
}
