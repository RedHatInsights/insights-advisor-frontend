/* eslint-disable camelcase */
import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';

import React, { useEffect, useRef, useState } from 'react';

import AnsibeTowerIcon from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
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
import { systemReducer } from '../../AppReducer';
import { useStore } from 'react-redux';

let page = 1;
let pageSize = 50;
let rule_id = '';
const Inventory = ({ tableProps, onSelectRows, rows, intl, rule, addNotification, items, afterDisableFn, onSortFn }) => {
    const inventory = useRef(null);
    const [InventoryTable, setInventoryTable] = useState();
    const [selected, setSelected] = useState([]);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [bulkSelect, setBulkSelect] = useState();
    const [filters, setFilters] = useState({ sort: '-display_name' });

    const store = useStore();

    const sortIndices = {
        1: 'display_name',
        2: 'last_seen'
    };

    const onSort = ({ index, direction }) => {
        const sort = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
        setFilters({ ...filters, sort });
        onSortFn(sort);
    };

    const calculateSort = () => {
        const sortIndex = Number(Object.entries(sortIndices).find(item => item[1] === filters.sort || `-${item[1]}` === filters.sort)[0]);
        return {
            index: sortIndex,
            key: sortIndex !== 2 ? sortIndices[sortIndex] : 'updated',
            direction: filters.sort[0] === '-' ? 'desc' : 'asc'
        };
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
        try {
            result.remediation && addNotification(result.getNotification());
        } catch (error) {
            addNotification(
                { variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` }
            );
        }
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
        (async () => {
            const { inventoryConnector, mergeWithEntities, INVENTORY_ACTION_TYPES } = await insights.loadInventory({
                react: React, reactRouterDom, pfReactTable
            });

            getRegistry().register({
                ...mergeWithEntities(
                    systemReducer(
                        [
                            { title: intl.formatMessage(messages.name), transforms: [pfReactTable.sortable], key: 'display_name' },
                            { title: intl.formatMessage(messages.lastSeen), transforms: [pfReactTable.sortable], key: 'updated' }
                        ],
                        INVENTORY_ACTION_TYPES
                    )
                )
            });

            const { InventoryTable } = inventoryConnector(store);
            setInventoryTable(() => InventoryTable);
        })();
    }, [intl, store]);

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
            sortBy={calculateSort()}
            onSort={onSort}
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
                    props: { isDisabled: selected.length === 0 },
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
    afterDisableFn: PropTypes.func,
    onSortFn: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
    addNotification: data => dispatch(addNotification(data)),
    onSelectRows: (id, selected) => dispatch({ type: 'SELECT_ENTITY', payload: { id, selected } })
});

export default injectIntl(routerParams(connect(({ entities, props }) => ({
    rows: entities && entities.rows,
    ...props
}), mapDispatchToProps)(Inventory)));
