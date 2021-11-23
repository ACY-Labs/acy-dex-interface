import { AcyModal } from '@/components/Acy';
import { StylesContext } from '@material-ui/styles';
import {useEffect} from 'react';
import styles from './index.less';
import classNames from 'classnames';

const AcyActionModal = ({
    children,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    title,
    content,
    visible,
    disabled,
}) => {

    return (
        <AcyModal
            visible={visible}
            onCancel={onCancel}
            width={400}
            bodyStyle={{
                padding: '21px',
                background: '#0e0304',
                borderRadius: '.5rem',
                color: '#FFF',
            }}
        >
            { title && (
                <h2 className={styles.title}>{title}</h2>
            )}
            <div>
                {children}
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.buttonPadding}>
                    <button 
                        className={(disabled && classNames(styles.button,styles.buttonDisabled)) || styles.button}
                        onClick={onConfirm}
                    >
                        {confirmText? confirmText : 'OK'}
                    </button>
                </div>
            </div>
        </AcyModal>
    );
};
export default AcyActionModal;