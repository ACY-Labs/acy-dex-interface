import { Card } from 'antd';
import { Children } from 'react';
import classNames from 'classnames';
import styles from './styles.less';
const ComponentButton = (props) => {
    const { children, type, onClick, disabled, ...rest } = props;
    return <div className={(disabled && classNames(styles.componentbutton, styles.disabled)) || styles.componentbutton} onClick={() => !disabled && onClick()} {...rest}>
        {children}
    </div>
}
export default ComponentButton;
