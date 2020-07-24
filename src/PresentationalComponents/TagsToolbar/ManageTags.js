import React, { useEffect, useMemo, useState } from 'react';

import { DEBOUNCE_DELAY } from '../../AppConstants';
import PropTypes from 'prop-types';
import { TagModal } from '@redhat-cloud-services/frontend-components/components/TagModal';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';
import { useIntl } from 'react-intl';

const buildFilterChips = (selected) => {
    const filters = selected.map(tag => tag.namespace).filter(
        (value, index, self) =>
            self.indexOf(value) === index
    ).map(category => ({
        category,
        chips: selected.filter(tag =>
            tag.namespace === category
        ).map(tag => ({
            name: tag.value,
            id: tag.id,
            value: true
        })),
        urlParam: 'tags'
    }));
    return { filters };
};

const ManageTags = ({ toggleModal, fetchTags, selectedTags, setSelectedTags, isOpen }) => {
    const [tags, setTags] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [selected, setSelected] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState();
    const intl = useIntl();
    const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
    const activeFiltersConfig = useMemo(() => buildFilterChips(selected), [selected]);
    const { total, data } = tags;

    useEffect(() => {
        (async () => {
            setPage(1);
            setTags(await fetchTags(perPage, 1, null, searchText));
            setLoaded(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        (async () => {
            setTags(await fetchTags(perPage, page, null, debouncedSearchText));
            setLoaded(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perPage, page]);

    const populateSelected = () => {
        return selectedTags.length ? selectedTags.map(id => ({
            id,
            namespace: id.split('/')[0],
            key: decodeURIComponent(id.split('/')[1].split('=')[0]),
            value: decodeURIComponent(id.split('/')[1].split('=')[1])
        })) : [];
    };

    useEffect(() => {
        setSelected(populateSelected());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTags, setSelected]);

    const onDelete = (e, items, isAll) => {
        if (isAll) {
            setSelected([]);
        } else {
            const ids = items.flatMap(item => item.chips.map(chip => chip.id));
            setSelected(selected.filter(tag => ids.filter(id => id !== tag.id).length));
        }
    };

    return <React.Fragment>
        {data && <TagModal
            title={intl.formatMessage(messages.tagsCount, { count: total })}
            {...loaded && {
                loaded,
                pagination: {
                    perPage,
                    page,
                    count: total
                },
                rows: data.map(tag => ({
                    ...tag,
                    selected: selected.find(selection => selection.id === tag.id),
                    cells: [tag.key, tag.value, tag.namespace, tag.count]
                }))
            }}
            loaded={ loaded }
            width='50%'
            isOpen={ isOpen }
            toggleModal={() => {
                setPerPage(10);
                setPage(1);
                setSearchText();
                setSelected(populateSelected());
                toggleModal();
            }}
            filters={[
                {
                    label: intl.formatMessage(messages.filterTagsInModal),
                    placeholder: intl.formatMessage(messages.filterTagsInModal),
                    value: 'tags-filter',
                    filterValues: {
                        key: 'text-filter',
                        onChange: (event, value) => setSearchText(value),
                        value: searchText
                    }
                }
            ]}
            onUpdateData={(data) => {
                setLoaded(false);
                setPerPage(data.perPage);
                setPage(data.page);
            }}
            columns={ [
                { title: intl.formatMessage(messages.tagsModalName) },
                { title: intl.formatMessage(messages.tagsModalValue) },
                { title: intl.formatMessage(messages.tagsModalSources) },
                { title: intl.formatMessage(messages.systems) }
            ] }
            selected={selected}
            onSelect={(selected) => setSelected(selected.map(tag => ({
                id: tag.id,
                namespace: tag.namespace,
                value: tag.value,
                selected: true
            })))}
            onApply={() => {
                setSelectedTags(selected.map(tag => tag.id));
            }}
            tableProps={{ canSelectAll: false }}
            primaryToolbarProps={{
                activeFiltersConfig: {
                    ...activeFiltersConfig,
                    onDelete
                }
            }}
        />}
    </React.Fragment>;
};

ManageTags.propTypes = {
    toggleModal: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    selectedTags: PropTypes.array,
    setSelectedTags: PropTypes.func
};

export default connect(
    ({ AdvisorStore }) => ({ selectedTags: AdvisorStore.selectedTags }),
    dispatch => ({
        setSelectedTags: (tags) => dispatch(setSelectedTags(tags))
    }))(ManageTags);
