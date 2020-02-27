import './_TagsToolbar.scss';

import React, { useEffect, useState } from 'react';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Dropdown } from '@patternfly/react-core/dist/js/components/Dropdown/Dropdown';
import { DropdownToggle } from '@patternfly/react-core/dist/js/components/Dropdown/DropdownToggle';
import ManageTags from './ManageTags';
import PropTypes from 'prop-types';
import { TagIcon } from '@patternfly/react-icons';
import TagsList from './TagsList';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const TagsToolbar = ({ selectedTags, intl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [manageTagsModalOpen, setManageTagsModalOpen] = useState(false);
    const showMoreCount = 10;
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

    return <div className='tagsToolbarContainer'>
        {<ManageTags
            handleModalToggle={(toggleModal) => setManageTagsModalOpen(toggleModal)}
            isModalOpen={manageTagsModalOpen}
            tags={tags}
        />}
        <Dropdown
            className='dropDownOverride'
            toggle={<DropdownToggle onToggle={onToggle}>
                <TagIcon /> {intl.formatMessage(messages.filterResults)} {selectedTags.length ?
                    <span>
                        {selectedTags.slice(0, 3).map((item, count) => `${item} ${count !== selectedTags.length - 1 ? ',' : ''} `)}
                        {selectedTags.length > 3 && intl.formatMessage(messages.countMore, { count: selectedTags.length - 3 })}
                    </span>
                    : intl.formatMessage(messages.allSystems)}
            </DropdownToggle>}
            isOpen={isOpen}>
            <TagsList tags={tags} showMoreCount={showMoreCount} handleModalToggle={(toggleModal) => setManageTagsModalOpen(toggleModal)} />
        </Dropdown>
    </div>;
};

TagsToolbar.propTypes = { selectedTags: PropTypes.array, addNotification: PropTypes.func, intl: PropTypes.any };

export default injectIntl(connect(
    state => ({ selectedTags: state.AdvisorStore.selectedTags }),
    dispatch => ({ addNotification: data => dispatch(addNotification(data)) }))
(TagsToolbar));
