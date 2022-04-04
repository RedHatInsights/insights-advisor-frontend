const allWorkloadsFiltersTrue = {
  'Ansible Automation Platform': {
    group: {
      name: 'Workloads',
    },
    item: {
      value: 'Ansible Automation Platform',
    },
    isSelected: true,
  },
  SAP: {
    group: {
      name: 'Workloads',
    },
    item: {
      value: 'SAP',
    },
    isSelected: true,
  },
};

const fullBuiltWorkloadQuery = {
  'filter[system_profile][ansible]': 'not_nil',
  'filter[system_profile][sap_system]': true,
  'filter[system_profile][sap_sids][contains][]': ['AB1', 'XY1'],
};

export default {
  allWorkloadsFiltersTrue,
  fullBuiltWorkloadQuery,
};
