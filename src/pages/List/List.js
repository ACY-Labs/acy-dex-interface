import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'umi';
import { Input } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

@connect()
class SearchList extends Component {
  handleTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'articles':
        history.push(`${match.url}/articles`);
        break;
      case 'applications':
        history.push(`${match.url}/applications`);
        break;
      case 'projects':
        history.push(`${match.url}/projects`);
        break;
      default:
        break;
    }
  };

  handleFormSubmit = value => {
    // eslint-disable-next-line
    console.log(value);
  };

  render() {
    const tabList = [
      {
        key: 'articles',
        tab: '文章',
      },
      {
        key: 'projects',
        tab: '项目',
      },
      {
        key: 'applications',
        tab: '应用',
      },
    ];

    const mainSearch = (
      <div style={{ textAlign: 'center' }}>
        <Input.Search
          placeholder="请输入"
          enterButton="搜索"
          size="large"
          onSearch={this.handleFormSubmit}
          style={{ width: 522 }}
        />
      </div>
    );

    const { match, children, location } = this.props;

    return (
      <PageHeaderWrapper
        title="搜索列表"
        content={mainSearch}
        tabList={tabList}
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
      >
        {children}
        {/* <Switch>
          {routes.map(item => (
            <Route key={item.key} path={item.path} component={item.component} exact={item.exact} />
          ))}
        </Switch> */}
      </PageHeaderWrapper>
    );
  }
}

export default SearchList;
