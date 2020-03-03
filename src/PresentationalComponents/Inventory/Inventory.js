/* eslint-disable camelcase */
import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';

import React, { useEffect, useRef, useState } from 'react';

import  AnsibeTowerIcon  from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import global_BackgroundColor_100 from '@patternfly/react-tokens/dist/js/global_BackgroundColor_100';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

let page = 1;
let pageSize = 50;
let rule_id = '';
const Inventory = ({ tableProps, onSelectRows, rows, intl, rule, addNotification, items, afterDisableFn }) => {
    const inventory = useRef(null);
    const [InventoryTable, setInventoryTable] = useState();
    const [selected, setSelected] = useState([]);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [bulkSelect, setBulkSelect] = useState();
    const [internalTableProps, setInternalTableProps] = useState();

    const loadInventory = async () => {
        const {
            inventoryConnector,
            mergeWithEntities
        } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            pfReactTable
        });

        getRegistry().register({
            ...mergeWithEntities()
        });

        const { InventoryTable } = inventoryConnector();
        setInventoryTable(() => InventoryTable);
    };

    const onRefresh = (options) => {
        if (rule_id !== rule.rule_id) {
            page = 1;
            pageSize = 50;
        }

        if (inventory && inventory.current) {
            page = options.page;
            pageSize = options.per_page;
            rule_id = rule.rule_id;
            inventory.current.onRefreshData(options);
        }
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
            setBulkSelect(false) : rule.playbook_count > 0 ?
                setSelected(rows.filter(entity => entity.selected === true).map(entity => entity.id)) : null ;;
        rows && calculateSelectedItems(rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    useEffect(() => {
        const updateTableProps = (rule) => rule.playbook_count > 0 ?
            setInternalTableProps(tableProps) :
            setInternalTableProps({
                ...tableProps,
                onSelect: null
            });
        rule && updateTableProps(rule);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rule]);

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
            ref={inventory}
            items={items}
            onRefresh={onRefresh}
            page={page}
            total={items.length}
            perPage={pageSize}
            tableProps={internalTableProps}
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
            bulkSelect={ rule.playbook_count > 0 ? {
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
            } : null }
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
