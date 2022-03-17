import { connect } from "umi";
import Media from 'react-media';
import styles from './styles.less';
 
const stats = (props) => {

    return (
        <div></div>
    )
}

export default connect(({ profile, loading }) => ({
    profile,
    loading: loading.effects['profile/fetchBasic'],
}))(stats);