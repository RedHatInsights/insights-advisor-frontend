import './_AddEditTopic.scss';

import { DeleteApi, Post, Put } from '../../Utilities/Api';
import React, { useState } from 'react';
import {
  Split,
  SplitItem,
  Form,
  FormGroup,
  Checkbox,
  Button,
  Radio,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';

import { BASE_URL } from '../../AppConstants';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { useIntl } from 'react-intl';

const AddEditTopic = ({ handleModalToggleCallback, isModalOpen, topic }) => {
  const intl = useIntl();
  const addNotification = useAddNotification();

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
        await DeleteApi(`${BASE_URL}/topic/${slug}`);
      } else if (topic.slug) {
        await Put(`${BASE_URL}/topic/${slug}/`, data);
      } else {
        await Post(`${BASE_URL}/topic/`, {}, data);
      }
    } catch (error) {
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: Object.entries(error.response.data).map(
          ([key, value]) => `${key.toUpperCase()}:${value} `,
        ),
      });
    } finally {
      handleModalToggleCallback(false);
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
          onClick={() => handleModalToggleCallback(false)}
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
      onClose={() => handleModalToggleCallback(false)}
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
            onChange={(_event, name) => setNameAndSlug(name)}
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.topicAddEditDescription)}
          fieldId="topic-form-description"
          helperText={intl.formatMessage(
            messages.topicAddEditDescriptionHelperText,
          )}
          className="text-area-override"
        >
          <TextArea
            value={description}
            isRequired
            name="topic-form-description"
            id="topic-form-description"
            onChange={(_event, desc) => setDescription(desc)}
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
              onChange={(_event, tag) =>
                setTag(tag.replace(/\s/g, '').toLowerCase())
              }
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
              onChange={(_event, name) => setNameAndSlug(name)}
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
            className="adv-c-radio"
          />
          <Radio
            isChecked={enabled}
            id="enabled"
            label={intl.formatMessage(messages.topicAddEditEnabled)}
            onChange={() => setEnabled(!enabled)}
            className="adv-c-radio"
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
            className="adv-c-check"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

AddEditTopic.propTypes = {
  handleModalToggleCallback: PropTypes.func,
  isModalOpen: PropTypes.bool,
  topic: PropTypes.object,
  intl: PropTypes.any,
};

export default AddEditTopic;
