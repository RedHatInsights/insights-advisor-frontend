/* eslint-disable camelcase */
import { Button, Modal } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import { fetchHostAcks, setAck } from '../../AppActions';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { OutlinedBellIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const ViewHostAcks = ({ fetchHostAcks, handleModalToggle, intl, isModalOpen, hostAcks, rule, afterFn }) => {
    const columns = [
        intl.formatMessage(messages.systemName),
        intl.formatMessage(messages.justificationNote),
        intl.formatMessage(messages.dateDisabled),
        ''
    ];
    const [rows, setRows] = useState([]);

    const deleteAck = async (host) => {
        try {
            await API.delete(`${BASE_URL}/hostack/${host.id}/`);
            fetchHostAcks({ limit: 100000 });
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
            const rows = hostAcks.data.filter(item => item.rule === rule.rule_id).map(item => ({
                cells: [
                    item.system_uuid,
                    item.justification || intl.formatMessage(messages.none),
                    (new Date(item.updated_at)).toLocaleDateString(),
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

    return <Modal
        width={'50%'}
        title={intl.formatMessage(messages.hostAckModalTitle)}
        isOpen={isModalOpen}
        onClose={() => { afterFn(); handleModalToggle(false); }}
        isFooterLeftAligned
    >
        <Table aria-label="host-ack-table" rows={rows} cells={columns}>
            <TableHeader />
            <TableBody />
        </Table>
    </Modal>;
};

ViewHostAcks.propTypes = {
    isModalOpen: PropTypes.bool,
    handleModalToggle: PropTypes.func,
    intl: PropTypes.any,
    rule: PropTypes.object,
    fetchHostAcks: PropTypes.func,
    hostAcks: PropTypes.object,
    addNotification: PropTypes.func,
    afterFn: PropTypes.func

};

ViewHostAcks.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined,
    rule: {},
    afterFn: () => undefined
};

const mapStateToProps = (state, ownProps) => ({
    hostAcks: state.AdvisorStore.hostAcks,
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
