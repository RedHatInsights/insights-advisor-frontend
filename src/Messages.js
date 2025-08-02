import { defineMessages } from 'react-intl';

export default defineMessages({
  rules: {
    id: 'rules',
    description: 'Used as a title',
    defaultMessage: 'Rules',
  },
  recommendation: {
    id: 'recommendation',
    description: 'Recommendation',
    defaultMessage: 'Recommendation',
  },
  recommendations: {
    id: 'recommendations',
    description: 'Used as a title',
    defaultMessage: 'Recommendations',
  },
  modified: {
    id: 'modified',
    description: 'Recommendation table column title',
    defaultMessage: 'Modified',
  },
  rule: {
    id: 'rule',
    description: 'Recommendation table column title',
    defaultMessage: 'Rule',
  },
  totalRisk: {
    id: 'totalRisk',
    description:
      'Recommendation table column title, recommendation details label',
    defaultMessage: 'Total risk',
  },
  systems: {
    id: 'systems',
    description:
      'Systems title used in recommendation table column and systems tab header',
    defaultMessage: 'Systems',
  },
  system: {
    id: 'system',
    description: 'System',
    defaultMessage: 'System',
  },
  systemsExposed: {
    id: 'systemsExposed',
    description: 'Systems title used in exec report',
    defaultMessage: 'Systems exposed',
  },
  remediation: {
    id: 'remediation',
    description: 'Remediation table column title',
    defaultMessage: 'Remediation type',
  },
  playbook: {
    id: 'playbook',
    description: 'Remediation/Playbook table cell text',
    defaultMessage: 'Playbook',
  },
  manual: {
    id: 'manual',
    description: 'Maunal table cell text',
    defaultMessage: 'Manual',
  },
  notAvailable: {
    id: 'notAvailable',
    description: 'Not available table cell text',
    defaultMessage: 'N/A',
  },
  rulesTableHideReportsErrorEnabled: {
    id: 'rulestable.hidereports.errorenabling',
    description:
      'Recommendation table, hide reports action, error for enabling reporting on a recommendation',
    defaultMessage: 'Enabling reports failed',
  },
  disableRule: {
    id: 'disableRule',
    description:
      'Recommendation table, action text for disabling reporting of a recommendation',
    defaultMessage: 'Disable recommendation',
  },
  disableRuleForSystems: {
    id: 'disableRuleForSystems',
    description:
      'Recommendation detail system table, action text for disabling reporting of a recommendation for a system',
    defaultMessage: 'Disable recommendation for selected systems',
  },
  disableRuleBody: {
    id: 'disableRuleBody',
    description: 'Explaining the action of disabling a recommendation',
    defaultMessage: `This recommendation will not be shown in reports and dashboards.`,
  },
  disableRuleSingleSystem: {
    id: 'disableRuleSingleSystem',
    description:
      'Explaining the action of disabling a recommendation for a single system',
    defaultMessage: 'Disable only for this system',
  },
  ruleIsDisabled: {
    id: 'ruleIsDisabled',
    description: 'Exclaiming that the recommendation is disabled',
    defaultMessage: 'Recommendation is disabled',
  },
  recSuccessfullyDisabled: {
    id: 'recSuccessfullyDisabled',
    description: 'Explaining that the rec was disabled successfully',
    defaultMessage: 'Recommendation disabled',
  },
  recSuccessfullyEnabled: {
    id: 'recSuccessfullyEnabled',
    description: 'Explaining that the rule was enabled successfully',
    defaultMessage: 'Recommendation enabled',
  },
  ruleIsDisabledTooltip: {
    id: 'ruleIsDisabledTooltip',
    description:
      'Disabled badge tooltip explaining the meaning of a disabled recommendation',
    defaultMessage:
      'Indicates this recommendation across all systems will not be shown in reports and dashboards.',
  },
  ruleIsDisabledBody: {
    id: 'ruleIsDisabledBody',
    description: 'Explaining that the recommendations disabled',
    defaultMessage: 'This recommendation was disabled and has no results.',
  },
  ruleIsDisabledBodyWithJustification: {
    id: 'ruleIsDisabledBodyWithJustification',
    description: 'Explaining that the recommendation is disabled',
    defaultMessage:
      'This recommendation has been disabled because {reason} and has no results.',
  },
  ruleIsDisabledJustification: {
    id: 'ruleIsDisabledJustification',
    description:
      'Explaining that the recommendation is disabled with following justification',
    defaultMessage:
      'This recommendation has been disabled for all systems for the following reason: ',
  },
  ruleIsDisabledForSystems: {
    id: 'ruleIsDisabledForSystems',
    description: 'Exclaiming that the recommendation is disabled for systems',
    defaultMessage: 'Recommendation is disabled for some systems',
  },
  ruleIsDisabledForAllSystems: {
    id: 'ruleIsDisabledForAllSystems',
    description:
      'Exclaiming that the recommendation is disabled for all systems',
    defaultMessage: 'Recommendation is disabled for all systems',
  },
  ruleIsDisabledForSystemsBody: {
    id: 'ruleIsDisabledForSystemsBody',
    description:
      'Exclaiming that the recommendation is disabled for systems (system count)',
    defaultMessage:
      'Recommendation is disabled for {systems, plural, one {# system} other {# systems}}',
  },
  enableRuleForSystems: {
    id: 'enableRuleForSystems',
    description: 'Enable this recommendation for all systems',
    defaultMessage: 'Enable this recommendation for all systems',
  },
  viewSystems: {
    id: 'viewSystems',
    description: 'View systems',
    defaultMessage: 'View systems',
  },
  justificationNote: {
    id: 'justificationNote',
    description: 'Justification note',
    defaultMessage: 'Justification note',
  },
  enableRule: {
    id: 'enableRule',
    description:
      'Recommendation table, action text for enabling reporting of a recommendation',
    defaultMessage: 'Enable recommendation',
  },
  rulesTableNoRuleHitsTitle: {
    id: 'rulestable.norulehits.title',
    description: 'Recommendation table, no recommendations message, title',
    defaultMessage: 'No recommendations',
  },
  rulesTableNoRuleHitsEnabledRulesBody: {
    id: 'rulestable.norulehits.enabledrulesbody',
    description:
      'Recommendation table, no recommendations message for enabled rules, body',
    defaultMessage:
      'None of your connected systems are affected by enabled recommendations.',
  },
  rulesTableNoRuleHitsEnabledRulesBodySecondLine: {
    id: 'rulestable.norulehits.enabledrulesbodysecondline',
    description:
      'Recommendation table, no recommendations message for enabled rules, body second line',
    defaultMessage:
      'To find more recommendations, expand your filter settings to include all recommendations.',
  },
  noRecommendations: {
    id: 'noRecommendations',
    description:
      'Recommendation table, no recommendations message for any known rules, body',
    defaultMessage:
      'None of your connected systems are affected by any known recommendations.',
  },
  rulesTableNoRuleHitsDisabledRulesBody: {
    id: 'rulestable.norules.disabledrulesbody',
    description:
      'Recommendation table, no recommendations message for any disabled rules, body',
    defaultMessage:
      "We haven't detected any issues with your connected systems.",
  },
  rulesTableNoRuleHitsDisabledRulesBodySecondLine: {
    id: 'rulestable.norules.disabledrulesbodysecondline',
    description:
      'Recommendation table, no recommendations message for any disabled rules, body second line',
    defaultMessage:
      'None of your connected systems are affected by enabled recommendations, and you currently have no disabled recommendations.',
  },
  rulesTableNoRuleHitsRedHatDisabledRulesBody: {
    id: 'rulestable.norules.redhatdisabledrulesbody',
    description:
      'Recommendation table, no recommendations message for any Red Hat disabled rules, body',
    defaultMessage:
      'This recommendation was disabled proactively by Red Hat and has no results.',
  },
  rulesTableNoRuleHitsAddDisabledButton: {
    id: 'rulestable.norulehits.adddisabledbutton',
    description:
      'Recommendation table, no recommendations message for any enabled rules, include disabled recommendations button',
    defaultMessage: 'Include disabled recommendations',
  },
  disabled: {
    id: 'disabled',
    description: 'Disabled',
    defaultMessage: 'Disabled',
  },
  redhatDisabled: {
    id: 'redhatDisabled',
    description: 'Red Hat disabled',
    defaultMessage: 'Red Hat disabled',
  },
  nA: {
    id: 'nA',
    description: 'Abbreviated as N/A, text equivalent, Not Applicable',
    defaultMessage: 'N/A',
  },
  rulesTableFilterInputText: {
    id: 'rulestable.filter.inputtext',
    description: 'Search text placeholder for recommendation table',
    defaultMessage: 'Find a recommendation...',
  },
  exportData: {
    id: 'exportData',
    description: 'Describes function of export icon',
    defaultMessage: 'Export data',
  },
  exportJson: {
    id: 'exportJson',
    description:
      'Button text to export/download recommendation table data as json',
    defaultMessage: 'Export to JSON',
  },
  exportCsv: {
    id: 'exportCsv',
    description:
      'Button text to export/download recommendation table data as csv',
    defaultMessage: 'Export to CSV',
  },
  exportPdf: {
    id: 'exportPdf',
    description: 'Button text to export/download data as pdf',
    defaultMessage: 'Export to PDF',
  },
  rulesTableActionShow: {
    id: 'rulestable.action.show',
    description:
      'Label for action show all recommendationsincluding those that affect systems',
    defaultMessage: 'Show recommendations with no impacted systems',
  },
  rulesTableActionHide: {
    id: 'rulestable.action.hide',
    description:
      'Label for action show only recommendationsthat affect systems',
    defaultMessage: 'Hide recommendations with no impacted systems',
  },
  rulesTableActionShowDisabled: {
    id: 'rulestable.action.showDisabled',
    description:
      'Label for action show all recommendationsincluding those that are disabled',
    defaultMessage: 'Show disabled recommendations',
  },
  rulesTableActionHideDisabled: {
    id: 'rulestable.action.hideDisabled',
    description: 'Label for action show only recommendationsthat are enabled',
    defaultMessage: 'Hide disabled recommendations',
  },
  rulesTableFetchRulesError: {
    id: 'rulestable.fetchrules.error',
    description: 'Recommendation table, fetch rules, error message',
    defaultMessage: 'There was an error fetching recommendations list.',
  },
  loading: {
    id: 'loading',
    description: 'Loading text',
    defaultMessage: 'Loading...',
  },
  summaryChartNoHits: {
    id: 'summarychart.nohits',
    description: 'The no hits text for the summary chart',
    defaultMessage: 'Your connected systems have no recommendations.',
  },
  summaryChartItem: {
    id: 'summarychart.item',
    description: 'Text for each summary chart item of varying severity',
    defaultMessage:
      '{numIssues} {name} affecting {affectedSystems} {affectedSystems, plural, one {system} other {systems}}',
  },
  summaryChartItemNoHits: {
    id: 'summarychart.itemnohits',
    description:
      'Text for each summary chart item of varying severity that has no hits',
    defaultMessage: 'No {severity} hits.',
  },
  overviewChartNoHits: {
    id: 'overviewchart.nohits',
    description: 'The no hits text for the overview chart',
    defaultMessage:
      'Your connected systems have no categorized recommendations.',
  },
  totalHits: {
    id: 'total hits',
    description: 'The total hits label for the overview donut chart',
    defaultMessage: 'Total hits',
  },
  resetFilters: {
    id: 'resetFilters',
    description: 'Filter action, reset all filter chips',
    defaultMessage: 'Reset filters',
  },
  filterBy: {
    id: 'filterBy',
    description: 'Filter by name',
    defaultMessage: 'Filter by name',
  },
  filterTagsInModal: {
    id: 'filterTagsInModal',
    description: 'Filter text input, for ManageTags Modal',
    defaultMessage: 'Filter tags',
  },
  knowledgebaseArticle: {
    id: 'knowledgebasearticle',
    description: 'Knowledgebase article',
    defaultMessage: 'Knowledgebase article',
  },
  riskOfChange: {
    id: 'riskOfChange',
    description: 'Risk of Change',
    defaultMessage: 'Risk of change',
  },
  undefined: {
    id: 'undefined',
    description: 'Undefined',
    defaultMessage: 'Undefined',
  },
  learnMore: {
    id: 'learnMore',
    description: 'Topic card, link to topic details page',
    defaultMessage: 'Learn more',
  },
  countMore: {
    id: 'countMore',
    description: 'Accepts a count of items, appends the text more',
    defaultMessage: '{count} more',
  },
  countMoreTags: {
    id: 'countMoreTags',
    description: 'Accepts a count of additional taks available',
    defaultMessage: '{count} more tags available',
  },
  recommended: {
    id: 'recommended',
    description: 'Recommended',
    defaultMessage: 'Recommended',
  },
  featured: {
    id: 'featured',
    description: 'Featured',
    defaultMessage: 'Featured',
  },
  status: {
    id: 'status',
    description: 'Status',
    defaultMessage: 'Status',
  },
  label: {
    id: 'label',
    description: 'Label',
    defaultMessage: 'Label',
  },
  topicCardSystemsaffected: {
    id: 'topiccard.systemsaffected',
    description: 'Topic card, systems affected text',
    defaultMessage:
      '{systems, plural, one {# system} other {# systems}} affected',
  },
  overview: {
    id: 'overview',
    description: 'Overview',
    defaultMessage: 'Overview',
  },
  overviewCategoryChartTitle: {
    id: 'overview.categorychart.title',
    description: 'Overview Category donut chart title',
    defaultMessage: 'Recommendations by category',
  },
  overviewSeverityChartTitle: {
    id: 'overview.severitychart.title',
    description: 'Overview severity chart title',
    defaultMessage: 'Recommendations by severity',
  },
  overviewSystemInventory: {
    id: 'overview.systemInventory.title',
    description: 'Overview system inventory chart title',
    defaultMessage: 'System inventory',
  },
  overviewSystemInventoryStale: {
    id: 'overview.systemInventory.stale',
    description: 'Overview system inventory chart stale systems',
    defaultMessage:
      '{systems, plural, one {# stale system} other {# stale systems}}',
  },
  overviewSystemInventoryRemoved: {
    id: 'overview.systemInventory.Removed',
    description: 'Overview system inventory chart systems to be removed',
    defaultMessage:
      '{systems, plural, one {# system} other {# systems}} to be removed',
  },
  overviewSystemInventoryOK: {
    id: 'overview.systemInventory.OK',
    description: 'Overview system inventory chart systems OK',
    defaultMessage: 'All systes are up to date',
  },
  overviewConnectsystemsTitle: {
    id: 'overview.connectsystems.title',
    description: 'Overview, title for connecting first systems',
    defaultMessage: 'Connect your first systems',
  },
  overviewConnectsystemsBody: {
    id: 'overview.connectsystems.body',
    description: 'Overview, body for connecting first systems',
    defaultMessage:
      'Connect at least 10 systems to get a better awareness of issues and optimizations identified across your infastructure',
  },
  overviewDeployAction: {
    id: 'overview.deploy.action',
    description: 'Overview, action link for deploy',
    defaultMessage: 'Download Ansible Playbook',
  },
  overviewActionCallNoSystemsAction: {
    id: 'overview.actioncallnosystems.action',
    description: 'Overview, action call link for when there are no systems',
    defaultMessage: 'Getting started documentation',
  },
  installClient: {
    id: 'installClient',
    description: 'Install the client on the RHEL system',
    defaultMessage: 'Install the client on the RHEL system.',
  },
  rulesDetailsModifieddate: {
    id: 'rulesdetails.modifieddate',
    description: 'Recommendations details, last updated on date',
    defaultMessage: 'Recommendation last modified on: {date}',
  },
  pathwaysDetailsModifieddate: {
    id: 'pathwaysdetails.modifieddate',
    description: 'Pathways details, last updated on date',
    defaultMessage: 'Pathway last modified on: {date}',
  },
  affectedSystems: {
    id: 'affectedSystems',
    description: 'Affected systems',
    defaultMessage: 'Affected systems',
  },
  readmore: {
    id: 'readmore',
    description: 'Read more',
    defaultMessage: 'Read more',
  },
  readless: {
    id: 'readless',
    description: 'Read less',
    defaultMessage: 'Read less',
  },
  deleteTopic: {
    id: 'deleteTopic',
    description: 'Used for Button in Edit Topic Modal',
    defaultMessage: 'Delete topic',
  },
  topicDetailslNodetailsTitle: {
    id: 'topicdetails.nodetails.title',
    description: 'Topic details, title when none are present or exist',
    defaultMessage: 'No details for topic',
  },
  topicDetailslNodetailsBody: {
    id: 'topicdetails.nodetails.body',
    description: 'Topic details, body when none are present or exist',
    defaultMessage: 'There exist no further details for this topic.',
  },
  title: {
    id: 'title',
    description:
      'Used in the topics admin table title column, identifying display title of a topic',
    defaultMessage: 'Title',
  },
  tag: {
    id: 'tag',
    description:
      'Used in the topics admin table tag column, identifying display tag for a topic',
    defaultMessage: 'Tag',
  },
  topicAddEditDescription: {
    id: 'topicAddEditDescription',
    description: 'description header for TopicAddEdit Modal',
    defaultMessage: 'Description',
  },
  topicAddEditDescriptionHelperText: {
    id: 'topicAddEditDescriptionHelperText',
    description: 'helper text for description text area on TopicAddEdit Modal',
    defaultMessage: 'Shown to users to describe the topic',
  },
  topicAddEditDisabled: {
    id: 'topicAddEditDisabled',
    description: 'Disabled label in TopicAddEdit radio buttons',
    defaultMessage: 'Disabled (not visible)',
  },
  topicAddEditEnabled: {
    id: 'topicAddEditEnabled',
    description: 'Enabled label in TopicAddEdit radio buttons',
    defaultMessage: 'Enabled (visible)',
  },
  topicAddEditFeatureBox: {
    id: 'topicAddEditFeatureBox',
    description: 'label for feature checkbox in TopicAddEdit Modal',
    defaultMessage: 'Feature this topic',
  },
  topicAddEditTagHelperText: {
    id: 'topicAddEditLabelHelperText',
    description: 'helper text for tag text input in TopicAddEdit Modal',
    defaultMessage:
      'Recommendations tagged with this tag will be added to the topic',
  },
  topicAdminCreate: {
    id: 'topicAdminCreate',
    description: 'Create Label',
    defaultMessage: 'Create new topic',
  },
  topicAdminEdit: {
    id: 'topicAdminEdit',
    description: 'Edit Label',
    defaultMessage: 'Edit topic',
  },
  topicAdminTitle: {
    id: 'topicAdminTitle',
    description: 'The title for the Topic Admin page',
    defaultMessage: 'Topic - administration',
  },
  topics: {
    id: 'topics',
    description: 'Topics Title',
    defaultMessage: 'Topics',
  },
  topicSlug: {
    id: 'topicslug',
    description:
      'Used in the topics admin table slug column, identifying display slug for a topic',
    defaultMessage: 'Slug',
  },
  topicsListNotopicsTitle: {
    id: 'topicslist.notopics.title',
    description: 'Topics list, no topics title',
    defaultMessage: 'No topics',
  },
  topicsListNotopicsBody: {
    id: 'topicslist.notopics.body',
    description: 'Topics list, no topics body',
    defaultMessage:
      'Either no topics presently exist or there is an issue presenting them.',
  },
  topicsListNoHitsBody: {
    id: 'topicslist.nohits.body',
    description: 'Topics list, no topics body',
    defaultMessage: 'To continue, edit your filter settings and search again.',
  },
  downloadPlaybookButtonText: {
    id: 'downloadPlaybook',
    description: 'Download playbook',
    defaultMessage: 'Download playbook',
  },
  selectAll: {
    id: 'selectAll',
    description: 'Action, Bulk select all items in a table with number',
    defaultMessage: 'Select all ({items} items)',
  },
  selectPage: {
    id: 'selectPage',
    description: 'Action, Bulk select all visible items in table, with number',
    defaultMessage: 'Select page ({items} items)',
  },
  selectNone: {
    id: 'selectNone',
    description: 'Action, Bulk deselect all',
    defaultMessage: 'Select none (0 items)',
  },
  topicRelatedToRule: {
    id: 'topicRelatedToRule',
    description:
      'Identifying the list of topics that include this recommendation',
    defaultMessage: 'Topics related to this recommendation',
  },
  name: {
    id: 'name',
    description:
      'Used in the system table title column, identifying display name of a system',
    defaultMessage: 'Name',
  },
  numberRuleHits: {
    id: 'numberRuleHits',
    description:
      'Used in the system table title column, number of recommendations per system',
    defaultMessage: 'Recommendations',
  },
  lastSeen: {
    id: 'lastSeen',
    description:
      'Used in the system table title column, the last time a system has checked in',
    defaultMessage: 'Last seen',
  },
  noTags: {
    id: 'noTags',
    description: 'No tags message, title',
    defaultMessage: 'No tags',
  },
  noHitsTitle: {
    id: 'nohits.title',
    description: 'No hits message, title',
    defaultMessage: 'No matching {item} found',
  },
  noHitsBody: {
    id: 'nohits.body',
    description: 'No hits messags, body',
    defaultMessage:
      'The filter criteria matches no {item}. Try changing your filter settings.',
  },
  search: {
    id: 'search',
    description: 'Commonly used in text input search fields ',
    defaultMessage: 'Search',
  },
  systemTableFetchError: {
    id: 'systemtable.fetch.error',
    description: 'System table, fetch , error message',
    defaultMessage: 'There was an error fetching systems',
  },
  low: {
    id: 'low',
    description: 'Filter value',
    defaultMessage: 'Low',
  },
  moderate: {
    id: 'moderate',
    description: 'Filter value',
    defaultMessage: 'Moderate',
  },
  important: {
    id: 'important',
    description: 'Filter value',
    defaultMessage: 'Important',
  },
  critical: {
    id: 'critical',
    description: 'Filter value',
    defaultMessage: 'Critical',
  },
  veryLow: {
    id: 'veryLow',
    description: 'Filter value',
    defaultMessage: 'Very Low',
  },
  medium: {
    id: 'medium',
    description: 'Filter value',
    defaultMessage: 'Medium',
  },
  high: {
    id: 'high',
    description: 'Filter value',
    defaultMessage: 'High',
  },
  availability: {
    id: 'availability',
    description: 'Filter value',
    defaultMessage: 'Availability',
  },
  performance: {
    id: 'performance',
    description: 'Filter value',
    defaultMessage: 'Performance',
  },
  stability: {
    id: 'stability',
    description: 'Filter value',
    defaultMessage: 'Stability',
  },
  security: {
    id: 'security',
    description: 'Filter value',
    defaultMessage: 'Security',
  },
  enabled: {
    id: 'enabled',
    description: 'Filter value',
    defaultMessage: 'Enabled',
  },
  impact: {
    id: 'impact',
    description: 'Filter title',
    defaultMessage: 'Impact',
  },
  impactLevel: {
    id: 'impactLevel',
    description: 'Describes the impact level of a rule',
    defaultMessage: '{level} impact',
  },
  impactDescription: {
    id: 'impactDescription',
    description:
      'Used in the SeverityLine tooltip to describe the impact of a rule',
    defaultMessage:
      'The impact of the problem would be {level} if it occurred.',
  },
  category: {
    id: 'category',
    description: 'Filter title',
    defaultMessage: 'Category',
  },
  likelihood: {
    id: 'likelihood',
    description: 'Filter title',
    defaultMessage: 'Likelihood',
  },
  likelihoodLevel: {
    id: 'likelihoodLevel',
    description: 'Describes the likelihood of a rule',
    defaultMessage: '{level} likelihood',
  },
  likelihoodDescription: {
    id: 'likelihoodDescription',
    description:
      'Used in the SeverityLine tooltip to describe the likelihood of a rule',
    defaultMessage: 'The likelihood that this will be a problem is {level}.',
  },
  riskOfChangeText: {
    id: 'riskOfChangeText',
    description: 'Risk of change text',
    defaultMessage:
      'The risk of change is <strong>{ level }</strong>, because the change takes very little time to implement and there is minimal impact to system operations.',
  },
  riskOfChangeLabel: {
    id: 'riskOfChangeLabel',
    defaultMessage: '{level}',
  },
  riskOfChangeTextOne: {
    id: 'riskOfChangeTextOne',
    description: 'Risk of change text explaining a value one',
    defaultMessage:
      'The risk of change is <strong>very low</strong>, because the change takes very little time to implement and there is minimal impact to system operations.',
  },
  riskOfChangeTextTwo: {
    id: 'riskOfChangeTextTwo',
    description: 'Risk of change text explaining a value two',
    defaultMessage:
      'The risk of change is <strong>low</strong>, because the change does not require that a system be taken offline.',
  },
  riskOfChangeTextThree: {
    id: 'riskOfChangeTextThree',
    description: 'Risk of change text explaining a value three',
    defaultMessage:
      'The risk of change is <strong>moderate</strong>, because the change will likely require an outage window.',
  },
  riskOfChangeTextFour: {
    id: 'riskOfChangeTextFour',
    description: 'Risk of change text explaining a value four',
    defaultMessage: `The risk of change is <strong>high</strong>, because the change takes a significant amount of time and planning to execute, and will impact the system and business operations of the host due to downtime.`,
  },
  no: {
    id: 'no',
    description: 'Used to signal no ansible playbook',
    defaultMessage: `No`,
  },
  description: {
    id: 'description',
    description: 'Description',
    defaultMessage: `Description`,
  },
  save: {
    id: 'save',
    description: 'Save',
    defaultMessage: `Save`,
  },
  cancel: {
    id: 'cancel',
    description: 'Cancel',
    defaultMessage: `Cancel`,
  },
  none: {
    id: 'none',
    description: 'None',
    defaultMessage: `None`,
  },
  is: {
    id: 'is',
    description: 'is',
    defaultMessage: 'is',
  },
  isNot: {
    id: 'is not',
    description: 'is not',
    defaultMessage: 'is not',
  },
  dateDisabled: {
    id: 'dateDisabled',
    description: 'Date disabled',
    defaultMessage: 'Date disabled',
  },
  hostAckModalTitle: {
    id: 'hostAckModalTitle',
    description: 'Title for host ack table modal',
    defaultMessage: 'Recommendation has been disabled for:',
  },
  systemName: {
    id: 'systemName',
    description: 'System name',
    defaultMessage: 'System name',
  },
  systemReboot: {
    id: 'systemReboot',
    description: 'Says remediation does requires system reboot',
    defaultMessage: 'System reboot <strong>{ status }</strong> required.',
  },
  enable: {
    id: 'enable',
    description: 'Enable',
    defaultMessage: 'Enable',
  },
  error: {
    id: 'error',
    description: 'Error',
    defaultMessage: 'Error',
  },
  ruleHelpful: {
    id: 'ruleHelpful',
    description: 'Asking the user if they find a recommendation helpful',
    defaultMessage: 'Is this recommendation helpful?',
  },
  feedbackThankYou: {
    id: 'feedbackThankYou',
    description: 'Thanking user for feedback',
    defaultMessage: 'Thank you for your feedback!',
  },
  all: {
    id: 'all',
    description: 'All',
    defaultMessage: 'All',
  },
  os: {
    id: 'os',
    description: 'Operating system',
    defaultMessage: 'Os',
  },
  operatingSystem: {
    id: 'operatingSystem',
    description: 'Operating system',
    defaultMessage: 'Operating system',
  },
  incidentRules: {
    id: 'incidentRules',
    description: 'Pathways with incidents',
    defaultMessage: 'Incident',
  },
  nonIncidentRules: {
    id: 'nonIncidentRules',
    description: 'Pathways with no incidents',
    defaultMessage: 'Non-incident',
  },
  incidentSystems: {
    id: 'incidentSystems',
    description: 'Systems with incidents',
    defaultMessage: 'Incident systems',
  },
  nonIncidentSystems: {
    id: 'nonIncidentSystems',
    description: 'Systems with no incidents',
    defaultMessage: 'Non-incident systems',
  },
  incidents: {
    id: 'incidents',
    description: 'Incidents',
    defaultMessage: 'Incidents',
  },
  incident: {
    id: 'incident',
    description: 'Incident',
    defaultMessage: 'Incident',
  },
  incidentTooltip: {
    id: 'incidentTooltip',
    description: 'Incident badge tooltip text',
    defaultMessage:
      'Indicates configurations that are currently affecting your systems',
  },
  downloadExecutiveLabel: {
    id: 'downloadExecutiveLabel',
    description: 'Label given to link for downloading exec report',
    defaultMessage: 'Download executive report',
  },
  insightsHeader: {
    id: 'insightsHeader',
    description: 'Type value for Executive Reports Download Button',
    defaultMessage: 'Advisor',
  },
  execReportHeader: {
    id: 'execReportHeader',
    description:
      'Header in the Executive Report describing the number of systems and risk analyzed',
    defaultMessage: `This report is an executive summary of recommendations that may impact your Red Hat Enterprise Linux servers. Red Hat Advisor service is analyzing {systems} and has identified {risks} that impact 1 or more of these systems.`,
  },
  execReportHeaderSystems: {
    id: 'execReportHeaderSystems',
    description: 'System part of the exec report header',
    defaultMessage:
      '{systems, plural, one {# RHEL system} other {# RHEL systems}}',
  },
  execReportHeaderRisks: {
    id: 'execReportHeaderRisks',
    description: 'Risk part of the exec report header',
    defaultMessage: '{risks, plural, one {# Risk} other {# Risks}}',
  },
  sysTableCount: {
    id: 'sysTableCount',
    description: 'Systable pdf report',
    defaultMessage: 'This report identified {systems}.',
  },
  filtersApplied: {
    id: 'filtersApplied',
    description: 'Systable pdf report',
    defaultMessage: 'Filters applied:',
  },
  tagsApplied: {
    id: 'tagsApplied',
    description: 'Systable pdf report',
    defaultMessage: 'Tags applied:',
  },
  recNumAndPercentage: {
    id: 'recNumAndPercentage',
    description: 'Given number and total displays percentage',
    defaultMessage: '{count} ({total}% of total)',
  },
  severity: {
    id: 'severity',
    description: 'Severity',
    defaultMessage: 'Severity',
  },
  severityHeader: {
    id: 'severityHeader',
    description: 'Header for Severity Section of Exec Report',
    defaultMessage: 'Identified recommendations by severity',
  },
  categoryHeader: {
    id: 'categoryHeader',
    description: 'Header for Category Section of Exec Report',
    defaultMessage: 'Recently identified recommendations by category',
  },
  top3RulesHeader: {
    id: 'topThreeRulesHeader',
    description: 'Header for Top 3 section of Exec Report',
    defaultMessage: 'Top 3 recommendations in your infrastructure',
  },
  poundOfRecs: {
    id: 'poundOfRecs',
    description: '# of recommendations',
    defaultMessage: '# of recommendations',
  },
  redhatDisabledRuleAlert: {
    id: 'redhatDisabledRuleAlert',
    description: 'Red Hat disabled rule alert body',
    defaultMessage:
      'We want you to focus on the more important risks to your systems.  Red Hat disabled recommendations can be found under the Status filter.',
  },
  redhatDisabledRuleAlertTitle: {
    id: 'redhatDisabledRuleAlertTitle',
    description: 'Red Hat disabled rule alert title',
    defaultMessage:
      'Red Hat has proactively disabled certain low risk recommendations',
  },
  inventoryIdNotFound: {
    id: 'inventoryIdNotFound',
    description:
      'Thrown as error when classic id does not correspond to an inventory id',
    defaultMessage: 'No system found in inventory for the given Advisor ID',
  },
  invalidPathname: {
    id: 'invalidPathname',
    description: 'Message thrown when classic redirect receives invalid path',
    defaultMessage: 'Invalid pathname',
  },
  permsTitle: {
    id: 'permsTitle',
    description: 'You do not have access to Advisor',
    defaultMessage: 'You do not have access to Advisor',
  },
  permsBody: {
    id: 'permsBody',
    description: 'To view the content',
    defaultMessage:
      'To view the content of this page, you must be granted permissions to use Advisor from your Organization Administrator.',
  },
  permsAction: {
    id: 'permsAction',
    description:
      'You do not have the required advisor permissions to perform this action',
    defaultMessage:
      'You do not have the required advisor permissions to perform this action',
  },
  oneOrMore: {
    id: 'oneOrMore',
    description: '1 or more',
    defaultMessage: '1 or more',
  },
  ansibleSupportYes: {
    id: 'ansibleSupportYes',
    description: 'Ansible playbook',
    defaultMessage: 'Ansible playbook',
  },
  ansibleSupportNo: {
    id: 'ansibleSupportNo',
    description: 'Manual',
    defaultMessage: 'Manual',
  },
  yes: {
    id: 'yes',
    description: 'yes',
    defaultMessage: 'Yes',
  },
  actions: {
    id: 'actions',
    description: 'actions',
    defaultMessage: 'Actions',
  },
  dueTo: {
    id: 'dueTo',
    description: 'Due to browser limitations, showing the first 1000 systems',
    defaultMessage:
      ' - Due to browser limitations, showing the first 1000 systems',
  },
  byEnabling: {
    id: 'byEnabling',
    description: 'By enabling this recommendation',
    defaultMessage:
      'By enabling this recommendation, it will impact {systems, plural, one {# system} other {# systems}}.',
  },
  required: {
    id: 'required',
    description: 'Required',
    defaultMessage: 'Required',
  },
  notRequired: {
    id: 'notRequired',
    description: 'Not required',
    defaultMessage: 'Not required',
  },
  pathways: {
    id: 'pathways',
    description: 'pathways',
    defaultMessage: 'Pathways',
  },
  pathwaysName: {
    id: 'pathwaysName',
    description: 'Column title for pathway name in pathways table',
    defaultMessage: 'Name',
  },
  recommendedPathways: {
    id: 'recommendedPathways',
    description: 'Recommended pathways group multiple Advisor',
    defaultMessage:
      'Recommended pathways group multiple Advisor recommendations under common actions to power more efficient remediation.',
  },
  improveRecommended: {
    id: 'improveRecommended',
    description: 'Recommended Pathways',
    defaultMessage: 'Recommended Pathways',
  },
  viewPathway: {
    id: 'viewPathway',
    description: 'View pathway',
    defaultMessage: 'View pathway',
  },
  noOverviewAvailable: {
    id: 'noOverviewAvailable',
    description: 'No Overview Available',
    defaultMessage: 'No Overview Available',
  },
  overviewDashbarError: {
    id: 'overviewDashbarError',
    description:
      'An unexpected error has occurred while trying to fetch the overview information. Please try again.',
    defaultMessage:
      'An unexpected error has occurred while trying to fetch the overview information. Please try again.',
  },
  overviewDashbarResponseMissingDataError: {
    id: 'overviewDashbarResponseMissingDataError',
    description:
      'Response from the server did not contain any data while trying to fetch the overview information for the Dashbar',
    defaultMessage:
      'Response from the server did not contain any data while trying to fetch the overview information for the Dashbar',
  },
  reboot: {
    id: 'reboot',
    description: 'Reboot',
    defaultMessage: 'Reboot',
  },
  reclvl: {
    id: 'reclvl',
    description: 'Recommendation level',
    defaultMessage: 'Recommendation level',
  },
  reclvldetails: {
    id: 'reclvldetails',
    description: 'Recommendation level explination',
    defaultMessage: `Indicates a recommendation's urgency on a scale of high (fix immediately) to low (fix when convenient). Recommendations levels are constantly re-calculated based on your infrastructure's number of applicable recommendations, associated risks and total number of impacted systems.`,
  },
  noResults: {
    id: 'noResults',
    description: 'No results found',
    defaultMessage: 'No results found',
  },
  adjustFilters: {
    id: 'adjustFilters',
    description: 'Adjust your filters and try again.',
    defaultMessage: 'Adjust your filters and try again.',
  },
  totalRiskPathway: {
    id: 'totalRiskPathway',
    description: 'Total risk of pathway',
    defaultMessage: 'Total risk of pathway',
  },
  resolution: {
    id: 'resolution',
    description: 'Resolution',
    defaultMessage: 'Resolution',
  },
  thisPathway: {
    id: 'thisPathway',
    description: 'By enabling this recommendation',
    defaultMessage:
      'This pathway is expected to improve <strong>{category}</strong> on <strong>{systems, plural, one {# system} other {# systems}}</strong> and resolve <strong>{incidents, plural, one {# incident} other {# incidents}}</strong>.',
  },
  notConnectedTitleInsights: {
    id: 'notConnectedTitleInsights',
    description: 'Not Connected title text',
    defaultMessage: 'This system is not yet connected to Insights',
  },
  notConnectedTitle: {
    id: 'notConnectedTitle',
    description: 'Not Connected title text',
    defaultMessage: 'This system is not yet connected to Red Hat Lightspeed',
  },
  notConnectedBody: {
    id: 'notConnectedBody',
    description: 'Not Connected body text',
    defaultMessage:
      'Activate the Insights client for this system to get started.',
  },
  notConnectedButton: {
    id: 'notConnectedButton',
    description: 'Not Connected button text',
    defaultMessage: 'Learn about the Insights client',
  },
  staticRemediationDesc: {
    id: 'staticRemediationDesc',
    description: 'static remediation description',
    defaultMessage:
      ' To fully remediate all recommendations, there may be additional steps needed.',
  },
  firstImpacted: {
    id: 'firstImpacted',
    description: 'First impacted',
    defaultMessage: 'First impacted',
  },
  edgeWarning: {
    id: 'edgeWarning',
    description: 'Warning text for edge devices',
    defaultMessage: 'Immutable systems are not shown in this list.',
  },
  viewAffectedSystems: {
    id: 'viewAffectedSystems',
    description: 'Label text for systems count in rule detail expanded row',
    defaultMessage:
      'View {systems, plural, one {the affected system} other {# affected systems}}',
  },
  noSystemsFoundHeader: {
    id: 'noSystemsFoundHeader',
    description: 'Top message displayed in an empty Systems table.',
    defaultMessage: 'No matching systems found',
  },
  noSystemsFoundBody: {
    id: 'noSystemsFoundBody',
    description: 'Bottom message displayed in an empty Systems table.',
    defaultMessage: 'To continue, edit your filter settings and search again.',
  },
});
