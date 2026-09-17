const escapeRegExpForJsonQuery = (value) => {
  const text = Array.isArray(value) ? value[0] : value;
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
};

export const nameFilter = {
  type: 'text',
  label: 'Name',
  filterAttribute: 'name',
  filterSerialiser: (filterConfigItem, value) =>
    `regex(.${filterConfigItem.filterAttribute}, "${escapeRegExpForJsonQuery(value)}", "i")`,
};

export default [nameFilter];
