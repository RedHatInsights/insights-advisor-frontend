import React, { useEffect, useState } from 'react';

import { DEBOUNCE_DELAY } from '../../AppConstants';
import PropTypes from 'prop-types';
import { TagModal } from '@redhat-cloud-services/frontend-components/components/TagModal';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';
import { useIntl } from 'react-intl';

const ManageTags = ({ toggleModal, fetchTags, selectedTags, setSelectedTags, totalTags, isOpen }) => {
    const [tags, setTags] = useState();
    const [loaded, setLoaded] = useState(false);
    const [selected, setSelected] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState();
    const intl = useIntl();
    const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

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

    useEffect(() => {
        setSelected(selectedTags.length ? selectedTags.map(id => ({ id, selected: true })) : []);
    }, [selectedTags, setSelected]);

    return <TagModal
        systemName={intl.formatMessage(messages.insightsHeader).toLowerCase()}
        {...loaded && {
            loaded,
            pagination: {
                perPage,
                page,
                count: totalTags
            },
            rows: tags.map(tag => ({
                id: tag.id,
                selected: selected.find(selection => selection.id === tag.id),
                cells: [tag.key, tag.value, tag.namespace, tag.count]
            }))
        }}
        loaded={ loaded }
        width='auto'
        isOpen={ isOpen }
        toggleModal={() => {
            setPerPage(10);
            setPage(1);
            setSearchText();
            setSelected([]);
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
        onSelect={(selected) => setSelected(selected.map(tag => ({ id: tag.id, selected: true })))}
        onApply={() => {
            setSelectedTags(selected.map(tag => tag.id));
            setSelected([]);
        }}
        tableProps={{ canSelectAll: false }}
    />;
};

ManageTags.propTypes = {
    toggleModal: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    totalTags: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    selectedTags: PropTypes.array,
    setSelectedTags: PropTypes.func
};

export default connect(
    ({ AdvisorStore }) => ({ selectedTags: AdvisorStore.selectedTags }),
    dispatch => ({
        setSelectedTags: (tags) => dispatch(setSelectedTags(tags))
    }))(ManageTags);
