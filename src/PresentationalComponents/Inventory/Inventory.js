import './_Inventory.scss';

import * as pfReactTable from '@patternfly/react-table';

import React, { useEffect, useRef, useState } from 'react';

import AnsibeTowerIcon from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Loading from '../Loading/Loading';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { systemReducer } from '../../AppReducer';

let page = 1;
let pageSize = 50;
let rule_id = '';
const Inventory = ({ tableProps, onSelectRows, rows, intl, rule, addNotification, items, afterDisableFn, onSortFn, filters }) => {
    const inventory = useRef(null);
    const [selected, setSelected] = useState([]);
    const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
    const [bulkSelect, setBulkSelect] = useState();

    const sortIndices = {
        1: 'display_name',
        2: 'updated'
    };

    const onSort = ({ index, direction }) => onSortFn(`${direction === 'asc' ? '' : '-'}${sortIndices[index]}`);

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

    return <React.Fragment>
        {disableRuleModalOpen && <DisableRule
            handleModalToggle={handleModalToggle}
            isModalOpen={disableRuleModalOpen}
            rule={rule}
            afterFn={afterDisableFn}
            hosts={selected} />
        }
        <InventoryTable
            ref={inventory}
            items={items}
            sortBy={calculateSort()}
            onSort={onSort}
            onRefresh={onRefresh}
            page={page}
            total={items.length}
            perPage={pageSize}
            tableProps={tableProps}
            dedicatedAction={<RemediationButton
                key='remediation-button'
                isDisabled={selected.length === 0 || rule.playbook_count === 0}
                dataProvider={remediationDataProvider}
                onRemediationCreated={(result) => onRemediationCreated(result)}>
                <AnsibeTowerIcon size='sm' className='ins-c-background__default' />
                &nbsp;{intl.formatMessage(messages.remediate)}
            </RemediationButton>}
            actionsConfig={{
                actions: ['', {
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
                    ...items && items.length > pageSize ? {
                        title: intl.formatMessage(messages.selectPage, { items: pageSize }),
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
            fallback={Loading}
            onLoad={({ mergeWithEntities, INVENTORY_ACTION_TYPES }) => {
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
            }}
        />
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
    onSortFn: PropTypes.func,
    filters: PropTypes.object
};

const mapDispatchToProps = (dispatch) => ({
    addNotification: data => dispatch(addNotification(data)),
    onSelectRows: (id, selected) => dispatch({ type: 'SELECT_ENTITY', payload: { id, selected } })
});

export default injectIntl(routerParams(connect(({ entities, props }) => ({
    rows: entities && entities.rows,
    ...props
}), mapDispatchToProps)(Inventory)));
