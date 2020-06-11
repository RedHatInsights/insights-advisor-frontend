import './_TagsToolbar.scss';

import React, { useEffect, useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/dist/js/components/Select/index';
import { Tooltip, TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import ManageTags from './ManageTags';
import PropTypes from 'prop-types';
import TagIcon from '@patternfly/react-icons/dist/js/icons/tag-icon';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import intersection from 'lodash/intersection';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';
import { tagUrlBuilder } from './Common';
import { useIntl } from 'react-intl';

const TagsToolbar = ({ selectedTags, setSelectedTags }) => {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [manageTagsModalOpen, setManageTagsModalOpen] = useState(false);
    const showMoreCount = 20;
    const onToggle = isOpen => setIsOpen(isOpen);

    useEffect(() => {
        const url = new URL(window.location);
        let params = new URLSearchParams(url.search);
        params = params.get('tags');
        const fetchTags = async () => {
            try {
                const response = await API.get(`${BASE_URL}/tag/`);
                setTags(response.data.tags);
                params === null && selectedTags === null && setSelectedTags([]);
                if (params.length) {
                    const tagsToSet = intersection(params.split(','), response.data.tags);
                    tagUrlBuilder(tagsToSet);
                    setSelectedTags(tagsToSet);
                }
            } catch (error) {
                addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
            }
        };

        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        tagUrlBuilder(selectedTags);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location]);

    const titleFn = () => <React.Fragment>
        <TagIcon />&nbsp;
        {tags.length > 0 ?
            <React.Fragment>
                {intl.formatMessage(messages.filterResults)} {selectedTags.length === 0 && intl.formatMessage(messages.allSystems)}
            </React.Fragment>
            : intl.formatMessage(messages.noTags)}
    </React.Fragment>;

    const onSelect = (e, selection) => {
        const tagsToSet = selectedTags.includes(selection) ? selectedTags.filter(item => item !== selection)
            : [...selectedTags, selection];
        setSelectedTags(tagsToSet);
        tagUrlBuilder(tagsToSet);
    };

    return selectedTags !== null && <div className='tagsToolbarContainer'>
        {<ManageTags
            handleModalToggle={(toggleModal) => setManageTagsModalOpen(toggleModal)}
            isModalOpen={manageTagsModalOpen}
            tags={tags}
        />}
        <Select
            className='dropDownOverride'
            variant={SelectVariant.checkbox}
            aria-label='Select Group Input'
            onToggle={onToggle}
            onSelect={onSelect}
            selections={selectedTags}
            isExpanded={isOpen}
            placeholderText={titleFn()}
            ariaLabelledBy='select-group-input'
            isDisabled={tags.length === 0}
        >
            {tags.slice(0, showMoreCount || tags.length).map(item =>
                <SelectOption key={item} value={`${item}`}>
                    <Tooltip content={`${decodeURIComponent(item)}`} position={TooltipPosition.right}>
                        <span>{`${decodeURIComponent(item)}`}</span>
                    </Tooltip>
                </SelectOption>
            )}
            <Button key='manage all tags'
                variant='link' onClick={(toggleModal) => setManageTagsModalOpen(toggleModal)}>
                {(showMoreCount > 0 && tags.length > showMoreCount) ?
                    intl.formatMessage(messages.countMoreTags, { count: tags.length - showMoreCount }) : intl.formatMessage(messages.manageTags)
                }
            </Button>
        </Select>
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
