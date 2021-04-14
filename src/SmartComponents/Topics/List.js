import * as AppActions from '../../AppActions';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import React, { useEffect } from 'react';

import { Main } from '@redhat-cloud-services/frontend-components/Main';
import PropTypes from 'prop-types';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';

const List = ({ fetchTopics, intl, selectedTags, workloads, SID }) => {
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: messages.topics.defaultMessage,
  });

  useEffect(() => {
    let options = selectedTags !== null &&
      selectedTags.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
    fetchTopics(options);
  }, [fetchTopics, selectedTags, workloads, SID]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle
          title={`${intl.formatMessage(
            messages.insightsHeader
          )} ${intl.formatMessage(messages.topics).toLowerCase()}`}
        />
      </PageHeader>
      <Main>
        <TopicsTable />
      </Main>
    </React.Fragment>
  );
};

List.displayName = 'list-topics';
List.propTypes = {
  fetchTopics: PropTypes.func,
  intl: PropTypes.any,
  selectedTags: PropTypes.array,
  workloads: PropTypes.object,
  SID: PropTypes.object,
};
const mapStateToProps = ({ AdvisorStore, ownProps }) => ({
  selectedTags: AdvisorStore.selectedTags,
  workloads: AdvisorStore.workloads,
  SID: AdvisorStore.SID,
  ...ownProps,
});
const mapDispatchToProps = (dispatch) => ({
  fetchTopics: (options) => dispatch(AppActions.fetchTopics(options)),
});

export default injectIntl(
  routerParams(connect(mapStateToProps, mapDispatchToProps)(List))
);
