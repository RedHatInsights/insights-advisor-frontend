import './_TagsToolbar.scss';

import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { Chip } from '@patternfly/react-core/dist/js/components/ChipGroup/Chip';
import { ChipGroup } from '@patternfly/react-core/dist/js/components/ChipGroup/ChipGroup';
import { DataList } from '@patternfly/react-core/dist/js/components/DataList/DataList';
import { DataListCell } from '@patternfly/react-core/dist/js/components/DataList/DataListCell';
import { DataListCheck } from '@patternfly/react-core/dist/js/components/DataList/DataListCheck';
import { DataListItem } from '@patternfly/react-core/dist/js/components/DataList/DataListItem';
import { DataListItemCells } from '@patternfly/react-core/dist/js/components/DataList/DataListItemCells';
import { DataListItemRow } from '@patternfly/react-core/dist/js/components/DataList/DataListItemRow';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { setSelectedTags } from '../../AppActions';

const TagsList = ({ setSelectedTags, selectedTags, showMoreCount, intl, tags, handleModalToggle }) => {
    const updateSelectedTags = (value, e) => selectedTags.indexOf(e.target.name) > -1 ?
        setSelectedTags(selectedTags.filter(item => item !== e.target.name))
        : setSelectedTags([...selectedTags, e.target.name]);

    return <React.Fragment>
        {!showMoreCount && <ChipGroup>
            {selectedTags.map(currentChip => (
                <Chip key={currentChip} onClick={() => updateSelectedTags(null, { target: { name: currentChip } })}>
                    {currentChip}
                </Chip>
            ))}
        </ChipGroup>}
        <div className='tagsListContainer'>
            <DataList aria-label="tag-list">
                {tags.slice(0, showMoreCount || tags.length).map(item => <DataListItem aria-labelledby="tag-list-item" key={item}>
                    <DataListItemRow>
                        <DataListCheck aria-labelledby={`${item}-check`} name={item} onChange={updateSelectedTags}
                            isChecked={selectedTags.indexOf(item) > -1} />
                        <DataListItemCells dataListCells={[
                            <DataListCell key="primary content">
                                {`${item}`}
                            </DataListCell>]} />
                    </DataListItemRow>
                </DataListItem>)}
                {tags.length === 0 && <DataListItem aria-labelledby="tag-list-item-no-tags" key='no-tags'>
                    <DataListItemRow>
                        <DataListItemCells dataListCells={[
                            <DataListCell key="primary content">
                                {intl.formatMessage(messages.noTags)}
                            </DataListCell>]} />
                    </DataListItemRow>
                </DataListItem>}
                {showMoreCount > 0 && tags.length > showMoreCount && <DataListItem aria-labelledby="tag-list-item-show-more">
                    <DataListItemRow>
                        <DataListItemCells dataListCells={[
                            <DataListCell key="primary content">
                                <Button key="view all tags" variant="link" onClick={() => handleModalToggle(true)}>
                                    {intl.formatMessage(messages.countMore, { count: tags.length - showMoreCount })}
                                </Button>
                            </DataListCell>]} />
                    </DataListItemRow>
                </DataListItem>}
            </DataList>
        </div>
    </React.Fragment>;
};

TagsList.propTypes = {
    setSelectedTags: PropTypes.func,
    selectedTags: PropTypes.array,
    tags: PropTypes.object.isRequired,
    showMoreCount: PropTypes.number,
    handleModalToggle: PropTypes.func.isRequired,
    intl: PropTypes.any
};

TagsList.defaultProps = {
    showMoreCount: 0
};

const mapStateToProps = (state, ownProps) => ({
    selectedTags: state.AdvisorStore.selectedTags,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    setSelectedTags: (tags) => dispatch(setSelectedTags(tags))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(TagsList));
