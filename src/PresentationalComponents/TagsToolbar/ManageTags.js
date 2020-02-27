import { Modal } from '@patternfly/react-core/dist/js/components/Modal/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import TagsList from './TagsList';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const ViewHostAcks = ({ handleModalToggle, intl, selectedTags, isModalOpen, tags }) => <Modal
    width='50%'
    title={intl.formatMessage(messages.tagsCount, { count: selectedTags.length })}
    isOpen={isModalOpen}
    onClose={() => { handleModalToggle(false); }}
    isFooterLeftAligned>
    <TagsList tags={tags} />
</Modal>;

ViewHostAcks.propTypes = {
    isModalOpen: PropTypes.bool,
    selectedTags: PropTypes.array,
    handleModalToggle: PropTypes.func,
    tags: PropTypes.array,
    intl: PropTypes.any
};

ViewHostAcks.defaultProps = {
    isModalOpen: false,
    handleModalToggle: () => undefined
};

const mapStateToProps = ({ AdvisorStore, ownProps }) => ({
    selectedTags: AdvisorStore.selectedTags,
    ...ownProps
});

export default injectIntl(connect(mapStateToProps)(ViewHostAcks));
