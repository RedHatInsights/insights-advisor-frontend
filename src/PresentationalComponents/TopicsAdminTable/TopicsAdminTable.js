import './_TopicsAdminTable.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { sortable } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';

import AddEditTopic from '../Modals/AddEditTopic';
import BanIcon from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import EditAltIcon from '@patternfly/react-icons/dist/esm/icons/edit-alt-icon';
import Failed from '../Loading/Failed';
import Loading from '../Loading/Loading';
import MessageState from '../MessageState/MessageState';
import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import messages from '../../Messages';
import { useGetTopicsAdminQuery } from '../../Services/Topics';
import { useIntl } from 'react-intl';

const TopicsAdminTable = () => {
  const intl = useIntl();

  const {
    data: topics = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTopicsAdminQuery();

  const [cols] = useState([
    { title: intl.formatMessage(messages.title), transforms: [sortable] },
    { title: intl.formatMessage(messages.tag), transforms: [sortable] },
    { title: intl.formatMessage(messages.topicSlug), transforms: [sortable] },
    { title: intl.formatMessage(messages.status), transforms: [sortable] },
    { title: intl.formatMessage(messages.featured), transforms: [sortable] },
    '',
    '',
  ]);
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [addEditTopicOpen, setAddEditTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState({});
  const [topicsArray, setTopicsArray] = useState([]);

  const onSort = useCallback(
    (_event, index, direction) => {
      const attrIndex = {
        0: 'name',
        1: 'tag',
        2: 'slug',
        3: 'enabled',
        4: 'featured',
      };
      const attr = attrIndex[index];
      const arrayCopy = [...topicsArray];
      setSortBy({ index, direction });
      setTopicsArray(
        arrayCopy.sort((a, b) => {
          if (direction === 'asc') {
            if (attr === 'enabled' || attr === 'featured') {
              return a[attr] > b[attr] ? -1 : 1;
            } else {
              return a[attr] > b[attr] ? 1 : -1;
            }
          } else {
            if (attr === 'enabled' || attr === 'featured') {
              return a[attr] > b[attr] ? 1 : -1;
            } else {
              return a[attr] > b[attr] ? -1 : 1;
            }
          }
        })
      );
    },
    [setSortBy, setTopicsArray, topicsArray]
  );

  const hideTopics = (topic) => {
    if (!topic) {
      setAddEditTopicOpen(true);
    } else {
      setSelectedTopic(topic);
      setAddEditTopicOpen(true);
    }
  };

  const handleModalToggleCallback = (modalToggle) => {
    setAddEditTopicOpen(modalToggle);
    refetch();
  };

  useEffect(() => {
    setTopicsArray(topics);
  }, [topics]);

  useEffect(() => {
    if (topicsArray.length === 0) {
      setRows([
        {
          cells: [
            {
              title: (
                <MessageState icon="none" title={''} text={''}></MessageState>
              ),
              props: { colSpan: 7 },
            },
          ],
        },
      ]);
    } else {
      const rows = topicsArray.flatMap((value, key) => [
        {
          isOpen: false,
          rule: value,
          cells: [
            {
              title: <span key={key}> {value.name}</span>,
            },
            {
              title: <span key={key}> {value.tag}</span>,
            },
            {
              title: <span key={key}> {value.slug}</span>,
            },
            {
              title: (
                <span>
                  {value.enabled ? (
                    <span>
                      <CheckCircleIcon className="success" />{' '}
                      {intl.formatMessage(messages.enabled)}
                    </span>
                  ) : (
                    <span>
                      <BanIcon className="ban" />{' '}
                      {intl.formatMessage(messages.disabled)}
                    </span>
                  )}
                </span>
              ),
            },
            {
              title: (
                <span>
                  {value.featured ? (
                    <span>
                      <StarIcon /> {intl.formatMessage(messages.featured)}
                    </span>
                  ) : (
                    <span></span>
                  )}
                </span>
              ),
            },
            '',
            {
              title: (
                <Button
                  ouiaId="hide"
                  variant="link"
                  onClick={() => hideTopics(value)}
                >
                  <EditAltIcon /> {intl.formatMessage(messages.topicAdminEdit)}
                </Button>
              ),
            },
          ],
        },
      ]);
      setRows(rows);
    }
  }, [topicsArray, intl]);

  return (
    <React.Fragment>
      {addEditTopicOpen && (
        <AddEditTopic
          isModalOpen={addEditTopicOpen}
          handleModalToggleCallback={handleModalToggleCallback}
          topic={selectedTopic}
        />
      )}
      <PageHeader>
        <Title headingLevel="h3" size="2xl" className="titlePaddingOverride">
          {intl.formatMessage(messages.topicAdminTitle)}
        </Title>
      </PageHeader>
      <section className="pf-v5-l-page__main-section pf-v5-c-page__main-section">
        <React.Fragment>
          <PrimaryToolbar className="toolbar-padding-override">
            <Button
              variant="primary"
              ouiaId="adminCreate"
              onClick={(_) => hideTopics(_)}
            >
              {intl.formatMessage(messages.topicAdminCreate)}
            </Button>
          </PrimaryToolbar>
          {!isLoading && !isFetching && (
            <Table
              ouiaId="adminTable"
              aria-label={'topics-admin-table'}
              sortBy={sortBy}
              onSort={onSort}
              cells={cols}
              rows={rows}
              isStickyHeader
            >
              <TableHeader />
              <TableBody />
            </Table>
          )}
          {isFetching && <Loading />}
          {isError && (
            <Failed
              message={intl.formatMessage(messages.systemTableFetchError)}
            />
          )}
          <TableToolbar />
        </React.Fragment>
      </section>
    </React.Fragment>
  );
};

export default TopicsAdminTable;
