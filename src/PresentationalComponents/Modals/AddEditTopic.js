import './_AddEditTopic.scss';

import React, { useState } from 'react';
import {
  Split,
  SplitItem,
} from '@patternfly/react-core/dist/js/layouts/Split/index';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { Checkbox } from '@patternfly/react-core/dist/js/components/Checkbox/Checkbox';
import { Form } from '@patternfly/react-core/dist/js/components/Form/Form';
import { FormGroup } from '@patternfly/react-core/dist/js/components/Form/FormGroup';
import { Modal } from '@patternfly/react-core/dist/js/components/Modal/Modal';
import PropTypes from 'prop-types';
import { Radio } from '@patternfly/react-core/dist/js/components/Radio/Radio';
import { TextArea } from '@patternfly/react-core/dist/js/components/TextArea/TextArea';
import { TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import { fetchTopicsAdmin } from '../../AppActions';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';

const AddEditTopic = ({
  handleModalToggle,
  intl,
  isModalOpen,
  topic,
  addNotification,
  fetchTopicsAdmin,
}) => {
  const [name, setName] = useState(topic.name || '');
  const [description, setDescription] = useState(topic.description || '');
  const [tag, setTag] = useState(topic.tag || '');
  const [enabled, setEnabled] = useState(topic.enabled || false);
  const [featured, setFeatured] = useState(topic.featured || false);
  const [slug, setSlug] = useState(topic.slug || undefined);

  const editTopic = async ({ type }) => {
    try {
      const data = { name, slug, tag, description, enabled, featured };
      if (type === 'DELETE') {
        await API.delete(`${BASE_URL}/topic/${slug}`);
      } else if (topic.slug) {
        await API.put(`${BASE_URL}/topic/${slug}/`, data);
      } else {
        await API.post(`${BASE_URL}/topic/`, {}, data);
      }
    } catch (error) {
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: Object.entries(error.response.data).map(
          ([key, value]) => `${key.toUpperCase()}:${value} `
        ),
      });
    } finally {
      handleModalToggle(false);
      fetchTopicsAdmin();
    }
  };

  const setNameAndSlug = (name) => {
    if (topic.slug) {
      setName(name);
    } else {
      setName(name);
      setSlug(name.replace(/\s/g, '').toLowerCase());
    }
  };

  const footer = (
    <Split className="split-override" hasGutter>
      <SplitItem>
        <Button
          key="confirm"
          variant="primary"
          onClick={() => editTopic({ type: 'POST/PUT' })}
          ouiaId="confirm"
        >
          {intl.formatMessage(messages.save)}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button
          key="cancel"
          variant="secondary"
          onClick={() => handleModalToggle(false)}
          ouiaId="cancel"
        >
          {intl.formatMessage(messages.cancel)}
        </Button>
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <Button
          key="delete"
          ouiaId="delete"
          variant="danger"
          isDisabled={topic.slug ? false : true}
          onClick={() => editTopic({ type: 'DELETE' })}
        >
          {intl.formatMessage(messages.deleteTopic)}
        </Button>
      </SplitItem>
    </Split>
  );

  return (
    <Modal
      title={intl.formatMessage(messages.topicAdminTitle)}
      isOpen={isModalOpen}
      onClose={() => handleModalToggle(false)}
      footer={footer}
      className="modal-width-override"
    >
      <Form>
        <FormGroup
          label={intl.formatMessage(messages.name)}
          fieldId="topic-form-name"
          className="text-input-override"
        >
          <TextInput
            value={name}
            isRequired
            type="text"
            id="topic-form-name"
            name="topic-form-name"
            onChange={(name) => setNameAndSlug(name)}
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.topicAddEditDescription)}
          fieldId="topic-form-description"
          helperText={intl.formatMessage(
            messages.topicAddEditDescriptionHelperText
          )}
          className="text-area-override"
        >
          <TextArea
            value={description}
            isRequired
            name="topic-form-description"
            id="topic-form-description"
            onChange={(desc) => setDescription(desc)}
          />
        </FormGroup>
        <FormGroup isInline fieldId="topic-form-labels">
          <FormGroup
            label={intl.formatMessage(messages.tag)}
            fieldId="topic-form-tag"
            helperText={intl.formatMessage(messages.topicAddEditTagHelperText)}
            className="text-input-override"
          >
            <TextInput
              value={tag.replace(/\s/g, '').toLowerCase()}
              isRequired
              type="text"
              id="topic-form-tag"
              name="topic-form-tag"
              onChange={(tag) => setTag(tag.replace(/\s/g, '').toLowerCase())}
            />
          </FormGroup>
          <FormGroup
            label={intl.formatMessage(messages.topicSlug)}
            fieldId="topic-form-name-2"
            helperText=""
            className="text-input-override"
          >
            <TextInput
              value={slug || name.replace(/\s/g, '').toLowerCase()}
              isDisabled={topic.slug}
              type="text"
              id="topic-form-name-2"
              name="topic-form-name-2"
              onChange={(name) => setNameAndSlug(name)}
            />
          </FormGroup>
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.status)}
          fieldId="topic-form-enabled"
        >
          <Radio
            isChecked={!enabled}
            id="disabled"
            label={intl.formatMessage(messages.topicAddEditDisabled)}
            onChange={() => setEnabled(!enabled)}
            className="radio-override"
          />
          <Radio
            isChecked={enabled}
            id="enabled"
            label={intl.formatMessage(messages.topicAddEditEnabled)}
            onChange={() => setEnabled(!enabled)}
            className="radio-override"
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.featured)}
          fieldId="topic-form-featured"
        >
          <Checkbox
            isChecked={featured}
            label={intl.formatMessage(messages.topicAddEditFeatureBox)}
            id="checkbox-featured"
            name="checkbox-featured"
            aria-label="update-featured"
            onChange={() => setFeatured(!featured)}
            className="checkbox-override"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

AddEditTopic.propTypes = {
  handleModalToggle: PropTypes.func,
  isModalOpen: PropTypes.bool,
  topic: PropTypes.object,
  intl: PropTypes.any,
  addNotification: PropTypes.func,
  fetchTopicsAdmin: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  addNotification: (data) => dispatch(addNotification(data)),
  fetchTopicsAdmin: () => dispatch(fetchTopicsAdmin()),
});

export default injectIntl(connect(null, mapDispatchToProps)(AddEditTopic));
