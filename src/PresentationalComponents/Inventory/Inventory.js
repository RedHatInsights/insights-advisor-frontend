/* eslint-disable camelcase */
import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';

import React, { useEffect, useState } from 'react';

import { AnsibeTowerIcon } from '@patternfly/react-icons';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const Inventory = ({ tableProps, onSelectRows, rows, intl, rule, addNotification, items, afterDisableFn }) => {
    const [InventoryTable, setInventoryTable] = useState();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [selected, setSelected] = useState([]);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [bulkSelect, setBulkSelect] = useState();

    const loadInventory = async () => {
        const {
            inventoryConnector,
            mergeWithEntities
        } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons,
            pfReactTable
        });

        getRegistry().register({
            ...mergeWithEntities()
        });

        const { InventoryTable } = inventoryConnector();
        setInventoryTable(() => InventoryTable);
    };

    const onRefresh = ({ page, per_page: perPage }) => {
        setPage(page);
        setPageSize(perPage);
    };

    const remediationDataProvider = () => ({
        issues: [{
            id: `advisor:${rule.rule_id}`,
            description: rule.description
        }],
        systems: selected
    });

    const onRemediationCreated = result => {
        onSelectRows(-1, false);
        addNotification(result.getNotification());
    };

    const handleModalToggle = (disableRuleModalOpen) => {
        setDisableRuleModalOpen(disableRuleModalOpen);
    };

    const bulkSelectfn = () => {
        setBulkSelect(true);
        setSelected(items);
        onSelectRows(0, true);
    };

    useEffect(() => {
        const calculateSelectedItems = (rows) => bulkSelect ?
            setBulkSelect(false) : setSelected(rows.filter(entity => entity.selected === true).map(entity => entity.id));;
        rows && calculateSelectedItems(rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    useEffect(() => {
        loadInventory();
    }, []);

    return <React.Fragment>
        {disableRuleModalOpen && <DisableRule
            handleModalToggle={handleModalToggle}
            isModalOpen={disableRuleModalOpen}
            rule={rule}
            afterFn={afterDisableFn}
            hosts={selected} />
        }
        {InventoryTable && <InventoryTable
            items={items}
            onRefresh={onRefresh}
            page={page}
            total={items.length}
            perPage={pageSize}
            tableProps={tableProps}
            actionsConfig={{
                actions: [<RemediationButton
                    key='remediation-button'
                    isDisabled={selected.length === 0}
                    dataProvider={remediationDataProvider}
                    onRemediationCreated={(result) => onRemediationCreated(result)}>
                    <AnsibeTowerIcon size='sm' color={global_BackgroundColor_100.value} />
                    &nbsp;{intl.formatMessage(messages.remediate)}
                </RemediationButton>,
                {
                    label: intl.formatMessage(messages.disableRuleForSystems),
                    onClick: () => handleModalToggle(true)
                }]
            }}
            bulkSelect={{
                count: selected.length,
                items: [{
                    title: intl.formatMessage(messages.selectNone),
                    onClick: () => {
                        onSelectRows(-1, false);
                    }
                },
                {
                    ...items && items.length > 0 ? {
                        title: intl.formatMessage(messages.selectPage, { items: pageSize || 0 }),
                        onClick: () => {
                            onSelectRows(0, true);
                        }
                    } : {}
                },
                {
                    ...items && items.length > 0 ? {
                        title: intl.formatMessage(messages.selectAll, { items: items.length || 0 }),
                        onClick: () => {
                            bulkSelectfn();
                        }
                    } : {}
                }],
                checked: selected.length === items.length ? 1 : selected.length === pageSize ? null : 0,
                onSelect: () => { selected.length > 0 ? onSelectRows(-1, false) : bulkSelectfn(); }
            }}
        />}
    </React.Fragment>;
};

Inventory.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        selected: PropTypes.bool
    })),
    onSelectRows: PropTypes.func,
    items: PropTypes.array,
    tableProps: PropTypes.any,
    intl: PropTypes.any,
    rule: PropTypes.object,
    addNotification: PropTypes.func,
    afterDisableFn: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
    addNotification: data => dispatch(addNotification(data)),
    onSelectRows: (id, selected) => dispatch({ type: 'SELECT_ENTITY', payload: { id, selected } })
});

export default injectIntl(routerParams(connect(({ entities, props }) => ({
    rows: entities && entities.rows,
    ...props
}), mapDispatchToProps)(Inventory)));
