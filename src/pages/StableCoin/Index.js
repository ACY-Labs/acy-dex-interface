import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "umi";
import Media from 'react-media';
import { Banner } from "./components/banner";
const StableCoin = (props) => {

  return (
    <PageHeaderWrapper>
      <Banner></Banner>
    </PageHeaderWrapper>
  )
}

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(StableCoin);