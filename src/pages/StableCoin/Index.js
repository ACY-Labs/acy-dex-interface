import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "umi";
import Media from 'react-media';
const StableCoin = (props) => {

  return (
    <PageHeaderWrapper>

    </PageHeaderWrapper>
  )
}

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(StableCoin);