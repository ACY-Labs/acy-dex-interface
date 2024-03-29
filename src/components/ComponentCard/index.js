import { Card } from 'antd';
import { Children } from 'react';
import className from 'classnames';
import styles from './styles.less';
const ComponentCard = ({ className: styledClassName, ...props }) => {
    const { max } = props;
    return <Card
        {...props}
        className={className(styles.acycard, styledClassName)}
        headStyle={{
            borderBottom: 0,
        }}
        bodyStyle={{
            padding: '0px',
        }}
        title={
            props.title && <div className={styles.card_header}>
                {
                    props.title
                }
            </div>
        }
    >
        {props.children}
    </Card>
}
export default ComponentCard;
