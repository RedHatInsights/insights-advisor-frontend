import * as AppActions from '../../AppActions';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/components/PageHeader';
import React, { useEffect } from 'react';

import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import PropTypes from 'prop-types';
import TopicsTable from '../../PresentationalComponents/TopicsTable/TopicsTable';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const List = ({ fetchTopics, intl }) => {
    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    return <React.Fragment>
        <PageHeader>
            <PageHeaderTitle title={intl.formatMessage(messages.topics)} />
        </PageHeader>
        <Main>
            <TopicsTable />
        </Main>
    </React.Fragment>;
};

List.displayName = 'list-topics';
List.propTypes = { fetchTopics: PropTypes.func, intl: PropTypes.any };

const mapDispatchToProps = dispatch => ({ fetchTopics: () => dispatch(AppActions.fetchTopics()) });

export default injectIntl(routerParams(connect(null, mapDispatchToProps)(List)));
