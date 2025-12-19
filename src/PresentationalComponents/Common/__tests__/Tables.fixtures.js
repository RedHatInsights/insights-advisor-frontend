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
  'filter[system_profile][workloads][ansible][controller_version][not_nil]': true,
  'filter[system_profile][workloads][sap][sap_system]': true,
};

export default {
  allWorkloadsFiltersTrue,
  fullBuiltWorkloadQuery,
};
