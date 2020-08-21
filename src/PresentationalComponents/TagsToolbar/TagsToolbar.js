import './_TagsToolbar.scss';

import React, { useEffect, useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectVariant } from '@patternfly/react-core/dist/js/components/Select/index';
import { Tooltip, TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

import API from '../../Utilities/Api';
import { Badge } from '@patternfly/react-core/dist/js/components/Badge/Badge';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { DEBOUNCE_DELAY } from '../../AppConstants';
import { Divider } from '@patternfly/react-core/dist/js/components/Divider/Divider';
import { INV_BASE_URL } from '../../AppConstants';
import { InputGroup } from '@patternfly/react-core/dist/js/components/InputGroup/InputGroup';
import ManageTags from './ManageTags';
import PropTypes from 'prop-types';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import TagIcon from '@patternfly/react-icons/dist/js/icons/tag-icon';
import { TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import intersection from 'lodash/intersection';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';
import { tagUrlBuilder } from './Common';
import { useIntl } from 'react-intl';

const TagsToolbar = ({ selectedTags, setSelectedTags }) => {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState({});
    const [selected, setSelected] = useState([]);
    const [searchText, setSearchText] = useState();
    const [params, setParams] = useState();
    const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
    const [manageTagsModalOpen, setManageTagsModalOpen] = useState(false);
    const showMoreCount = 20;
    const { total, count, data } = tags;

    const groupTags = (tags) => {
        return {
            total: tags.total,
            count: tags.count,
            data: [...new Set(tags.data.map(tag => tag.namespace))].map(source => ({
                source,
                data: tags.data.filter(tag => tag.namespace === source)
            }))
        };
    };

    const formatTags = (tags, total, count) => {
        return {
            total,
            count,
            data: tags.map(item => {
                const { namespace, key, value } = item.tag;
                return {
                    ...item.tag,
                    count: item.count,
                    id: `${namespace}/${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                };
            })
        };
    };

    const getSelectedTagsData = async (selectedTags) => {
        return Promise.all(selectedTags.flatMap(async (id) => {
            const response = await API.get(`${INV_BASE_URL}/tags?search=${id}&registered_with=insights`);
            return response.data.results.map(obj => {
                const { tag, count } = obj;
                return tag && count && { ...tag, id, count };
            });
        }));
    };

    const fetchTags = async (perPage, page, params, filter) => {
        let formattedTags = [];
        try {
            const response = (filter === '' || !filter) ?
                await API.get(`${INV_BASE_URL}/tags?per_page=${perPage}&page=${page}&registered_with=insights`) :
                await API.get(`${INV_BASE_URL}/tags?per_page=${perPage}&page=${page}&search=${filter.toLowerCase()}&registered_with=insights`);
            formattedTags = formatTags(response.data.results, response.data.total, response.data.count);
            params === null && selectedTags === null && setSelectedTags([]);
            if (params.length) {
                const tagsToSet = intersection(params.split(','), selectedTags);
                tagUrlBuilder(tagsToSet);
                setSelectedTags(tagsToSet);
            }
        } catch (error) {
            addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
        }

        return formattedTags;
    };

    // Force triggers the debounce function on mount (i.e. deleting this will break things)
    useEffect(() => {
        setSearchText('');
    }, []);

    useEffect(() => {
        const url = new URL(window.location);
        let params = new URLSearchParams(url.search);
        setParams(params.get('tags'));
        (async() => setSelected(groupTags({
            total: selectedTags.length,
            count: selectedTags.length,
            data: [].concat.apply([], await getSelectedTagsData(selectedTags))
        }).data))();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTags]);

    useEffect(() => {
        const url = new URL(window.location);
        let urlParams = new URLSearchParams(url.search);
        urlParams.get('tags') === params ?
            (async () => setTags(groupTags(await fetchTags(showMoreCount, 1, null, searchText))))() :
            (async () => setTags(groupTags(await fetchTags(showMoreCount, 1, urlParams, searchText))))();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        tagUrlBuilder(selectedTags);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location]);

    const titleFn = () => <React.Fragment>
        <TagIcon />&nbsp;
        {data && data.length > 0 ?
            <React.Fragment>
                {intl.formatMessage(messages.filterResults)} {selectedTags.length === 0 && intl.formatMessage(messages.allSystems)}
            </React.Fragment>
            : intl.formatMessage(messages.noTags)}
    </React.Fragment>;

    const onToggle = isOpen => {
        setSearchText('');
        setIsOpen(isOpen);
    };

    const onSelect = (e, selection) => {
        const tagsToSet = selectedTags.includes(selection) ? selectedTags.filter(item => item !== selection)
            : [...selectedTags, selection];
        setSelectedTags(tagsToSet);
        tagUrlBuilder(tagsToSet);
    };

    return selectedTags !== null && <div className='tagsToolbarContainer'>
        {<ManageTags
            toggleModal={() => setManageTagsModalOpen(!manageTagsModalOpen)}
            isOpen={manageTagsModalOpen}
            fetchTags={fetchTags}
        />}
        {data && <Select
            className='dropDownOverride'
            variant={SelectVariant.checkbox}
            aria-label='Select Group Input'
            onToggle={onToggle}
            onSelect={onSelect}
            selections={selectedTags}
            isOpen={isOpen}
            placeholderText={titleFn()}
            ariaLabelledBy='select-group-input'
            isDisabled={data.length === 0}
        >
            <InputGroup className='tags-filter-group'>
                <TextInput
                    aria-label='tags-filter-input'
                    placeholder={intl.formatMessage(messages.filterTagsInToolbar)}
                    value={searchText}
                    onChange={setSearchText}
                />
                <SearchIcon className='tags-filter-search-icon'/>
            </InputGroup>
            <Divider key="inline-filter-divider"/>
            {[selected, data].map((arr, key) => <React.Fragment key={key}>
                {arr.map((group, index) =>
                    <SelectGroup key={`group${index}`} label={group.source}>
                        {group.data.map((tag, tagIndex) =>
                            <span key={tagIndex} className='tags-select-group'>
                                <SelectOption value={tag.id} isChecked={
                                    selectedTags.find(selection => selection === tag.id)
                                }>
                                    <Tooltip content={`${decodeURIComponent(tag.id)}`} position={TooltipPosition.right}>
                                        <span>{`${decodeURIComponent(tag.key + '=' + tag.value)}`}</span>
                                    </Tooltip>
                                </SelectOption>
                                <Badge className='tags-select-badge'> {tag.count} </Badge>
                            </span>
                        )}
                    </SelectGroup>)}
                {key === 0 && arr.length > 0 && <Divider/>}
            </React.Fragment>)}
            <Button key='manage all tags'
                variant='link' onClick={() => setManageTagsModalOpen(true)}>
                {(showMoreCount > 0 && count >= showMoreCount) ?
                    intl.formatMessage(
                        messages.countMoreTags, {
                            count: total - count
                        }) : intl.formatMessage(messages.manageTags)
                }
            </Button>
        </Select>}
    </div >;
};

TagsToolbar.propTypes = {
    selectedTags: PropTypes.array,
    addNotification: PropTypes.func,
    intl: PropTypes.any,
    setSelectedTags: PropTypes.func,
    history: PropTypes.any
};

export default connect(
    state => ({ selectedTags: state.AdvisorStore.selectedTags }),
    dispatch => ({
        addNotification: data => dispatch(addNotification(data)),
        setSelectedTags: (tags) => dispatch(setSelectedTags(tags))
    }))(TagsToolbar);
