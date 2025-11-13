import React, { useContext, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';

import { BASE_URL } from '../../AppConstants';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { DeleteApi } from '../../Utilities/Api';
import { List } from 'react-content-loader';
import OutlinedBellIcon from '@patternfly/react-icons/dist/esm/icons/outlined-bell-icon';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { useGetHostAcksQuery } from '../../Services/Acks';
import { useIntl } from 'react-intl';
import { EnvironmentContext } from '../../App';
import { Modal, Button } from '@patternfly/react-core';

const ViewHostAcks = ({
  handleModalToggle = () => {},
  isModalOpen = false,
  rule = {},
  afterFn = () => {},
}) => {
  const addNotification = useAddNotification();
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);
  const columns = [
    intl.formatMessage(messages.systemName),
    intl.formatMessage(messages.justificationNote),
    intl.formatMessage(messages.dateDisabled),
    '',
  ];
  const [rows, setRows] = useState([]);
  const [unclean, setUnclean] = useState(false);
  const {
    data: hostAcks = [],
    isFetching,
    isLoading,
    refetch,
  } = useGetHostAcksQuery({
    rule_id: rule.rule_id,
    limit: rule.hosts_acked_count,
    customBasePath: envContext.BASE_URL,
  });
  const deleteAck = async (host) => {
    try {
      await DeleteApi(`${BASE_URL}/hostack/${host.id}/`);
      refetch();
      setUnclean(true);
    } catch (error) {
      handleModalToggle(false);
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  useEffect(() => {
    const rows = hostAcks?.map((item) => ({
      cells: [
        item.display_name || item.system_uuid,
        item.justification || intl.formatMessage(messages.none),
        {
          title: (
            <DateFormat date={new Date(item.updated_at)} type="onlyDate" />
          ),
        },
        {
          title: (
            <Button
              icon={<OutlinedBellIcon size="sm" />}
              key={item.system_uuid}
              isInline
              variant="link"
              onClick={() => deleteAck(item)}
            >
              {` ${intl.formatMessage(messages.enable)}`}
            </Button>
          ),
        },
      ],
    }));

    if (!isLoading && hostAcks.length === 0) {
      afterFn();
      handleModalToggle(false);
    }

    setRows(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostAcks]);

  return (
    <Modal
      width={'75%'}
      title={intl.formatMessage(messages.hostAckModalTitle)}
      isOpen={isModalOpen}
      onClose={() => {
        unclean && afterFn();
        handleModalToggle(false);
      }}
    >
      {!isFetching ? (
        <Table
          aria-label={'host-ack-table'}
          ouiaId={'host-ack-table'}
          rows={rows}
          cells={columns}
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <Table
          aria-label={'host-ack-table'}
          ouiaId={'host-ack-table'}
          rows={[
            {
              cells: [{ props: { colSpan: 3 }, title: <List /> }],
            },
          ]}
          cells={columns}
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
    </Modal>
  );
};

ViewHostAcks.propTypes = {
  isModalOpen: PropTypes.bool,
  handleModalToggle: PropTypes.func,
  rule: PropTypes.object,
  afterFn: PropTypes.func,
};

export default ViewHostAcks;
