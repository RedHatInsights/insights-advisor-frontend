import React, { useContext, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';

import { Button } from '@patternfly/react-core/dist/esm/components/Button/Button';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { DeleteApi } from '../../Utilities/Api';
import { List } from 'react-content-loader';
import { Modal } from '@patternfly/react-core/dist/esm/components/Modal/Modal';
import OutlinedBellIcon from '@patternfly/react-icons/dist/esm/icons/outlined-bell-icon';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import { useDispatch } from 'react-redux';
import { useGetHostAcksQuery } from '../../Services/Acks';
import { useIntl } from 'react-intl';
import { EnvironmentContext } from '../../App';
import { getCsrfTokenHeader } from '../helper';

/**
 * Modal for viewing and managing host acknowledgements in IoP environment.
 * Shows a table of systems where a rule has been disabled with justification notes,
 * disable dates, and the ability to re-enable the rule for individual systems.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} [props.handleModalToggle=() => {}] - Callback to toggle modal visibility
 * @param {boolean} [props.isModalOpen=false] - Controls whether the modal is visible
 * @param {Object} [props.rule={}] - Rule object containing rule_id and hosts_acked_count
 * @param {string} props.rule.rule_id - The ID of the rule
 * @param {number} props.rule.hosts_acked_count - Number of systems with acknowledgements
 * @param {Function} [props.afterFn=() => {}] - Callback executed after changes are made
 * @returns {React.ReactElement} Modal component with host acknowledgements table
 *
 * @example
 * <IopViewHostAcks
 *   isModalOpen={true}
 *   handleModalToggle={(isOpen) => setModalOpen(isOpen)}
 *   rule={{ rule_id: 'RULE_123', hosts_acked_count: 5 }}
 *   afterFn={() => refetchRuleData()}
 * />
 */
const IopViewHostAcks = ({
  handleModalToggle = () => {},
  isModalOpen = false,
  rule = {},
  afterFn = () => {},
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const addNotification = (data) => dispatch(notification(data));
  const columns = [
    intl.formatMessage(messages.systemName),
    intl.formatMessage(messages.justificationNote),
    intl.formatMessage(messages.dateDisabled),
    '',
  ];
  const [rows, setRows] = useState([]);
  const [unclean, setUnclean] = useState(false);
  const {
    data: hostAcks,
    isFetching,
    isLoading,
    refetch,
  } = useGetHostAcksQuery(
    {
      rule_id: rule.rule_id,
      limit: rule.hosts_acked_count,
      customBasePath: envContext.BASE_URL,
    },
    {
      skip: !isModalOpen,
      refetchOnMountOrArgChange: true,
    },
  );
  /**
   * Deletes a host acknowledgement, re-enabling the rule for a specific system.
   *
   * @async
   * @param {Object} host - Host acknowledgement object
   * @param {string} host.id - The acknowledgement ID
   * @param {string} host.system_uuid - The system UUID
   * @param {string} [host.display_name] - The system display name
   * @throws {Error} If the API call fails, shows error notification and closes modal
   */
  const deleteAck = async (host) => {
    try {
      await DeleteApi(
        `${envContext.BASE_URL}/hostack/${host.id}/`,
        {},
        getCsrfTokenHeader(),
      );
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
    if (isModalOpen) {
      refetch();
    }
  }, [isModalOpen, refetch]);

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
              key={item.system_uuid}
              isInline
              variant="link"
              onClick={() => deleteAck(item)}
            >
              <OutlinedBellIcon size="sm" />
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

IopViewHostAcks.propTypes = {
  isModalOpen: PropTypes.bool,
  handleModalToggle: PropTypes.func,
  rule: PropTypes.object,
  afterFn: PropTypes.func,
};

export default IopViewHostAcks;
