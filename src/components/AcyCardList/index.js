import React, { PureComponent } from 'react';
import styles from './style.less';

const Thin = ({ children, ...rest }) => {
  return (
    <div className={styles.thin} {...rest}>
      {children}
    </div>

  );
}
const Fat = ({ children, ...rest }) => {
  return (
    <div className={styles.fat} {...rest}>
       {children}
    </div>

  );
}
const Agree = ({ children, ...rest }) => {
  return (
    <div className={styles.agree} {...rest}>
       {children}
    </div>

  );
}
export default class AcyCardList extends PureComponent {

  render() {
    const { children,title,grid, ...restProps} = this.props;
    return (
      <div className={styles.acycardlist} {...restProps}>
      {
        title&& <div className={styles.acl_title}>{title}</div>
      } 
      {grid ? 
        <div className={styles.acl_list_grid}>
        {children}
        </div>
      :
        <div className={styles.acl_list}>
          {children}
        </div>
      }
      </div>
  
    );
  }
}

AcyCardList.Thin=Thin;
AcyCardList.Fat=Fat;
AcyCardList.Agree=Agree;