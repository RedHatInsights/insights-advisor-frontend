import './_TagsToolbar.scss';

import React, { useEffect, useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/dist/js/components/Select/index';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import ManageTags from './ManageTags';
import PropTypes from 'prop-types';
import TagIcon from '@patternfly/react-icons/dist/js/icons/tag-icon';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';

const TagsToolbar = ({ selectedTags, intl, setSelectedTags }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [manageTagsModalOpen, setManageTagsModalOpen] = useState(false);
    const showMoreCount = 20;
    const onToggle = isOpen => setIsOpen(isOpen);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await API.get(`${BASE_URL}/tag`);
                setTags(response.data.tags);
            } catch (error) {
                addNotification({ variant: 'danger', dismissable: true, title: intl.formatMessage(messages.error), description: `${error}` });
            }
        };

        fetchTags();
    }, [intl]);

    const titleFn = () => <React.Fragment>
        <TagIcon />&nbsp;
        {tags.length > 0 ?
            <React.Fragment>
                {intl.formatMessage(messages.filterResults)} {selectedTags.length === 0 && intl.formatMessage(messages.allSystems)}
            </React.Fragment>
            : intl.formatMessage(messages.noTags) }
    </React.Fragment>;

    const onSelect = (e, selection) => selectedTags.includes(selection) ? setSelectedTags(selectedTags.filter(item => item !== selection))
        : setSelectedTags([...selectedTags, selection]);

    return <div className='tagsToolbarContainer'>
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
            {tags.slice(0, showMoreCount || tags.length).map(item => <SelectOption key={item} value={item} />)}
            {(showMoreCount > 0 && tags.length > showMoreCount) ? <Button key='view all tags'
                variant='link' onClick={(toggleModal) => setManageTagsModalOpen(toggleModal)}>
                {intl.formatMessage(messages.countMore, { count: tags.length - showMoreCount })}
            </Button>
                : <React.Fragment />}
        </Select>
    </div >;
};

TagsToolbar.propTypes = { selectedTags: PropTypes.array, addNotification: PropTypes.func, intl: PropTypes.any, setSelectedTags: PropTypes.func };

export default injectIntl(connect(
    state => ({ selectedTags: state.AdvisorStore.selectedTags }),
    dispatch => ({
        addNotification: data => dispatch(addNotification(data)),
        setSelectedTags: (tags) => dispatch(setSelectedTags(tags))
    }))
(TagsToolbar));
