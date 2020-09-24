import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import { fetchHostAcks, setAck } from '../../AppActions';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { DateFormat } from '@redhat-cloud-services/frontend-components/components/DateFormat';
import { List } from 'react-content-loader';
import { Modal } from '@patternfly/react-core/dist/js/components/Modal/Modal';
import OutlinedBellIcon  from '@patternfly/react-icons/dist/js/icons/outlined-bell-icon';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const ViewHostAcks = ({ fetchHostAcks, hostAcksFetchStatus, handleModalToggle, intl, isModalOpen, hostAcks, rule, afterFn }) => {
    const columns = [
        intl.formatMessage(messages.systemName),
        intl.formatMessage(messages.justificationNote),
        intl.formatMessage(messages.dateDisabled),
        ''
    ];
    const [rows, setRows] = useState([]);
    const [unclean, setUnclean] = useState(false);

    const deleteAck = async (host) => {
        try {
            await API.delete(`${BASE_URL}/hostack/${host.id}/`);
            fetchHostAcks({ rule_id: rule.rule_id, limit: rule.hosts_acked_count });
            setUnclean(true);
        } catch (error) {
            handleModalToggle(false);
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: intl.formatMessage(messages.error),
                description: `${error}`
            });
        }
    };

    useEffect(() => {
        if (hostAcks.data) {
            const rows = hostAcks.data.map(item => ({
                cells: [
                    item.display_name || item.system_uuid,
                    item.justification || intl.formatMessage(messages.none),
                    { title: <DateFormat date={new Date(item.updated_at)} type="onlyDate" /> },
                    {
                        title: <Button key={item.system_uuid} isInline variant='link' onClick={() => deleteAck(item)}>
                            <OutlinedBellIcon size='sm' /> &nbsp; {intl.formatMessage(messages.enable)}
                        </Button >
                    }
                ]
            })).asMutable();

            if (!rows.length) { afterFn(); handleModalToggle(false); }

            setRows(rows);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostAcks]);

    useEffect(() => {
        fetchHostAcks({ rule_id: rule.rule_id, limit: rule.hosts_acked_count });
    }, [fetchHostAcks, rule.hosts_acked_count, rule.rule_id]);

    return <Modal
        width={'50%'}
        title={intl.formatMessage(messages.hostAckModalTitle)}
        isOpen={isModalOpen}
        onClose={() => { unclean && afterFn(); handleModalToggle(false); }}
    >
        {hostAcksFetchStatus === 'fulfilled' && <Table aria-label="host-ack-table" rows={rows} cells={columns}>
            <TableHeader />
            <TableBody />
        </Table>}
        {hostAcksFetchStatus !== 'fulfilled' && <Table aria-label="host-ack-table" rows={[{
            cells: [{ props: { colSpan: 3 }, title: (<List />) }]
        }]} cells={columns}>
            <TableHeader />
            <TableBody />
        </Table>}
    </Modal>;
};

ViewHostAcks.propTypes = {
    isModalOpen: PropTypes.bool,
    handleModalToggle: PropTypes.func,
    intl: PropTypes.any,
    rule: PropTypes.object,
    fetchHostAcks: PropTypes.func,
    hostAcks: PropTypes.object,
    hostAcksFetchStatus: PropTypes.string,
    addNotification: PropTypes.func,
    afterFn: PropTypes.func

};

ViewHostAcks.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    rule: {},
    afterFn: () => undefined
};

const mapStateToProps = ({ AdvisorStore, ownProps }) => ({
    hostAcks: AdvisorStore.hostAcks,
    hostAcksFetchStatus: AdvisorStore.hostAcksFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setAck: data => dispatch(setAck(data)),
    fetchHostAcks: data => dispatch(fetchHostAcks(data)),
    addNotification: data => dispatch(addNotification(data))

});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewHostAcks));
