import styles from './graphics.less';


export const Graphics = props => {
    //read props
    const { iframeUrl, label, data, unit, hasData } = props
    return (
        <div className={styles.iframeHolder}>
            <iframe src={iframeUrl}></iframe>
            <div className={`${styles.floatingStat} ${styles.smaller}`} hidden={!hasData}>
                {label}
                <div>
                    {data}
                    <small>{unit}</small>
                </div>
            </div>
        </div>
    );
};
