import React from 'react';
import { Spinner } from '@patternfly/react-core';

export const compileTitle = (itemsTotal, loading) => {
  if (itemsTotal === 0 && !loading) {
    return null;
  } else if (loading) {
    return (
      <React.Fragment>
        <Spinner size="sm" />
        {`     ${itemsTotal} selected`}
      </React.Fragment>
    );
  } else {
    return `${itemsTotal} selected`;
  }
};

export const checkboxState = (selectedItemsTotal, itemsTotal) => {
  if (selectedItemsTotal === 0) {
    return false;
  } else if (selectedItemsTotal === itemsTotal) {
    return true;
  } else {
    return null;
  }
};

export const selectOrUnselect = (selected) =>
  selected ? 'Unselect' : 'Select';

const allItemsIncluded = (items = [], selection = []) =>
  items?.filter((item) => selection.includes(item)).length === items.length;

export const checkCurrentPageSelected = (items = [], selectedItems = []) => {
  if (selectedItems.length === 0) {
    return false;
  } else {
    return allItemsIncluded(items, selectedItems);
  }
};

export const itemIds = (items) => items.map(({ itemId }) => itemId);

export const selectItemTransformer = (item, selectedIds = []) => ({
  ...item,
  rowProps: {
    selected: selectedIds.includes(item.itemId),
  },
});
