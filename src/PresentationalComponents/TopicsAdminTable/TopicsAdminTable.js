import './_TopicsAdminTable.scss';

import * as AppActions from '../../AppActions';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, sortable } from '@patternfly/react-table';

import AddEditTopic from '../Modals/AddEditTopic';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import EditAltIcon from '@patternfly/react-icons/dist/js/icons/edit-alt-icon';
import Failed from '../Loading/Failed';
import Immutable from 'seamless-immutable';
import Loading from '../Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import MessageState from '../MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import StarIcon  from '@patternfly/react-icons/dist/js/icons/star-icon';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

const TopicsAdminTable = ({ topicsFetchStatus, fetchTopicsAdmin, topics, intl }) => {

    const [cols] =  useState([
        { title: intl.formatMessage(messages.title), transforms: [sortable] },
        { title: intl.formatMessage(messages.tag), transforms: [sortable] },
        { title: intl.formatMessage(messages.topicSlug), transforms: [sortable] },
        { title: intl.formatMessage(messages.status), transforms: [sortable] },
        { title: intl.formatMessage(messages.featured), transforms: [sortable] },
        '', ''
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [addEditTopicOpen, setAddEditTopicOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState({});
    const [topicsArray, setTopicsArray] = useState([]);

    const onSort = useCallback((_event, index, direction) => {
        const attrIndex = {
            0: 'name',
            1: 'tag',
            2: 'slug',
            3: 'enabled',
            4: 'featured'
        };
        const attr = attrIndex[index];
        setSortBy({ index, direction });
        setTopicsArray(
            Immutable.from(
                topicsArray.asMutable().sort((a, b) => {
                    if (direction === 'asc') {
                        if (attr === 'enabled' || attr === 'featured') {
                            return a[attr] > b[attr] ? -1 : 1;
                        } else { return a[attr] > b[attr] ? 1 : -1; }
                    } else {
                        if (attr === 'enabled' || attr === 'featured') {
                            return a[attr] > b[attr] ? 1 : -1;
                        } else { return a[attr] > b[attr] ? -1 : 1; }
                    }
                })
            )
        );
    }, [setSortBy, setTopicsArray, topicsArray]);

    const hideTopics = (topic) => {
        if (!topic) {
            setAddEditTopicOpen(true);
        } else {
            setSelectedTopic(topic);
            setAddEditTopicOpen(true);
        }
    };

    useEffect(() => {
        setTopicsArray(topics);
    }, [topics]);

    useEffect(() => {
        fetchTopicsAdmin();
    }, [fetchTopicsAdmin]);

    useEffect(() => {
        if (topicsArray.length === 0) {
            setRows([{
                cells: [{
                    title: (
                        <MessageState icon='none' title={''}
                            text={''}>
                        </MessageState>),
                    props: { colSpan: 7 }
                }]
            }]);
        } else {
            const rows = topicsArray.flatMap((value, key) => ([{
                isOpen: false,
                rule: value,
                cells: [{
                    title: <span key={key}> {value.name}</span>
                }, {
                    title: <span key={key}> {value.tag}</span>
                }, {
                    title: <span key={key}> {value.slug}</span>
                }, {
                    title: <span>
                        {value.enabled ? <span>
                            <CheckCircleIcon
                                className='success'
                            /> {intl.formatMessage(messages.enabled)}
                        </span> : <span>
                            <BanIcon
                                className='ban'
                            /> {intl.formatMessage(messages.disabled)}
                        </span>}
                    </span>
                }, {
                    title: <span>
                        {value.featured ? <span>
                            <StarIcon/> {intl.formatMessage(messages.featured)}
                        </span> : <span></span>
                        }
                    </span>
                }, '', {
                    title: <Button
                        ouiaId="hide"
                        variant='link'
                        onClick={ () => hideTopics(value) }
                    ><EditAltIcon/> {intl.formatMessage(messages.topicAdminEdit)}</Button>
                }]
            }]));
            setRows(rows.asMutable());
        }
    }, [topicsArray, intl]);

    return <React.Fragment>
        {addEditTopicOpen && <AddEditTopic
            isModalOpen={addEditTopicOpen}
            handleModalToggle={setAddEditTopicOpen}
            topic={selectedTopic}
        />}
        <PageHeader>
            <Title headingLevel="h3" size="2xl" className='titlePaddingOverride'>
                {intl.formatMessage(messages.topicAdminTitle)}
            </Title>
        </PageHeader>
        <Main>
            <React.Fragment>
                <PrimaryToolbar className='toolbar-padding-override'>
                    <Button
                        variant='primary'
                        ouiaId="adminCreate"
                        onClick={ (_) => hideTopics(_) }
                    >
                        {intl.formatMessage(messages.topicAdminCreate)}
                    </Button>
                </PrimaryToolbar>
                { topicsFetchStatus === 'fulfilled' &&
                    <Table
                        ouiaId="adminTable"
                        aria-label={'topics-admin-table'}
                        sortBy={sortBy}
                        onSort={onSort}
                        cells={cols}
                        rows={rows}
                    >
                        <TableHeader/>
                        <TableBody/>
                    </Table>
                }
                { topicsFetchStatus === 'pending' && (<Loading />)}
                { topicsFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.systemTableFetchError)} />)}
                <TableToolbar/>
            </React.Fragment>
        </Main>
    </React.Fragment>;

};

TopicsAdminTable.propTypes = {
    fetchTopicsAdmin: PropTypes.func,
    topicsFetchStatus: PropTypes.string,
    topics: PropTypes.array,
    addNotification: PropTypes.func,
    history: PropTypes.object,
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    topics: state.AdvisorStore.topics,
    topicsFetchStatus: state.AdvisorStore.topicsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchTopicsAdmin: () => dispatch(AppActions.fetchTopicsAdmin()),
    addNotification: data => dispatch(addNotification(data))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(TopicsAdminTable)));
