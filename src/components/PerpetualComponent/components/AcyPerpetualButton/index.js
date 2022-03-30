import { Card } from 'antd';
import { Children } from 'react';
import classNames from 'classnames';
import styles from './index.less';
const AcyPerpetualButton = (props) => {
    const { children, type, onClick, disabled, ...rest } = props;
    return <div className={(disabled && classNames(styles.acyperpetualbutton, styles.disabled)) || styles.acyperpetualbutton} onClick={() => !disabled && onClick()} {...rest}>
        {children}
    </div>
}
export default AcyPerpetualButton;
