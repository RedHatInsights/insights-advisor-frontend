/* eslint-disable max-len */
import { defineMessages } from 'react-intl';

export default defineMessages({
    rules: {
        id: 'rules',
        description: 'Used as a title',
        defaultMessage: 'Rules'
    },
    recommendations: {
        id: 'recommendations',
        description: 'Used as a title',
        defaultMessage: 'Recommendations'
    },
    added: {
        id: 'added',
        description: 'Recommendation table column title',
        defaultMessage: 'Added'
    },
    rule: {
        id: 'rule',
        description: 'Recommendation table column title',
        defaultMessage: 'Rule'
    },
    totalRisk: {
        id: 'totalRisk',
        description: 'Recommendation table column title, recommendationdetails label',
        defaultMessage: 'Total risk'
    },
    systems: {
        id: 'systems',
        description: 'Systems title used in recommendation table column and systems tab header',
        defaultMessage: 'Systems'
    },
    systemsExposed: {
        id: 'systemsExposed',
        description: 'Systems title used in exec report',
        defaultMessage: 'Systems exposed'
    },
    ansible: {
        id: 'ansible',
        description: 'Recommendation table column title',
        defaultMessage: 'Ansible'
    },
    rulesTableHideReportsErrorDisabled: {
        id: 'rulestable.hidereports.errordisabling',
        description: 'Recommendation table, hide reports action, error for disabling reporting on a recommendation',
        defaultMessage: 'Disabling reports failed'
    },
    rulesTableHideReportsErrorEnabled: {
        id: 'rulestable.hidereports.errorenabling',
        description: 'Recommendation table, hide reports action, error for enabling reporting on a recommendation',
        defaultMessage: 'Enabling reports failed'
    },
    disableRule: {
        id: 'disableRule',
        description: 'Recommendation table, action text for disabling reporting of a recommendation',
        defaultMessage: 'Disable recommendation'
    },
    disableRuleForSystems: {
        id: 'disableRuleForSystems',
        description: 'Recommendationdetail system table, action text for disabling reporting of a recommendationfor a system',
        defaultMessage: 'Disable recommendation for selected systems'
    },
    disableRuleBody: {
        id: 'disableRuleBody',
        description: 'Explaining the action of disabling a recommendation',
        defaultMessage: `Disabling a recommendation means that this recommendation across all systems will not be shown in reports and dashboards.`
    },
    disableRuleSingleSystem: {
        id: 'disableRuleSingleSystem',
        description: 'Explaining the action of disabling a recommendationfor a single system',
        defaultMessage: 'Disable only for this system'
    },
    ruleIsDisabled: {
        id: 'ruleIsDisabled',
        description: 'Exclaiming that the recommendationis disabled',
        defaultMessage: 'Recommendation is disabled'
    },
    ruleIsDisabledTooltip: {
        id: 'ruleIsDisabledTooltip',
        description: 'Disabled badge tooltip explaining the meaning of a disabled recommendation',
        defaultMessage: 'Indicates this recommendation across all systems will not be shown in reports and dashboards.'
    },
    ruleIsDisabledBody: {
        id: 'ruleIsDisabledBody',
        description: 'Explaining that the recommendationis disabled',
        defaultMessage: 'This recommendation has been disabled and has no results.'
    },
    ruleIsDisabledJustification: {
        id: 'ruleIsDisabledJustification',
        description: 'Explaining that the recommendationis disabled with following justification',
        defaultMessage: 'This recommendation has been disabled for all systems for the following reason: '
    },
    ruleIsDisabledForSystems: {
        id: 'ruleIsDisabledForSystems',
        description: 'Exclaiming that the recommendationis disabled for systems',
        defaultMessage: 'Recommendation is disabled for some systems'
    },
    ruleIsDisabledForAllSystems: {
        id: 'ruleIsDisabledForAllSystems',
        description: 'Exclaiming that the recommendationis disabled for all systems',
        defaultMessage: 'Recommendation is disabled for all systems'
    },
    ruleIsDisabledForSystemsBody: {
        id: 'ruleIsDisabledForSystemsBody',
        description: 'Exclaiming that the recommendationis disabled for systems (system count)',
        defaultMessage: 'Recommendation is disabled for {systems, plural, one {# system} other {# systems}}'
    },
    enableRuleForSystems: {
        id: 'enableRuleForSystems',
        description: 'Enable this recommendationfor all systems',
        defaultMessage: 'Enable this recommendation for all systems'
    },
    viewSystems: {
        id: 'viewSystems',
        description: 'View systems',
        defaultMessage: 'View systems'
    },
    justificationNote: {
        id: 'justificationNote',
        description: 'Justification note',
        defaultMessage: 'Justification note'
    },
    enableRule: {
        id: 'enableRule',
        description: 'Recommendation table, action text for enabling reporting of a recommendation',
        defaultMessage: 'Enable recommendation'
    },
    rulesTableNoRuleHitsTitle: {
        id: 'rulestable.norulehits.title',
        description: 'Recommendation table, no recommendations message, title',
        defaultMessage: 'No recommendations'
    },
    rulesTableNoRuleHitsEnabledRulesBody: {
        id: 'rulestable.norulehits.enabledrulesbody',
        description: 'Recommendation table, no recommendations message for enabled rules, body',
        defaultMessage: 'None of your connected systems are affected by enabled rules.'
    },
    rulesTableNoRuleHitsAnyRulesBody: {
        id: 'rulestable.norulehits.anyrulesbody',
        description: 'Recommendation table, no recommendations message for any known rules, body',
        defaultMessage: 'None of your connected systems are affected by any known rules.'
    },
    rulesTableNoRuleHitsAddDisabledButton: {
        id: 'rulestable.norulehits.adddisabledbutton',
        description: 'Recommendation table, no recommendations message for any enabled rules, include disabled recommendations button',
        defaultMessage: 'Include disabled recommendations'
    },
    disabled: {
        id: 'disabled',
        description: 'Disabled',
        defaultMessage: 'Disabled'
    },
    nA: {
        id: 'nA',
        description: 'Abreviated as N/A, text equivelent, not applicable',
        defaultMessage: 'N/A'
    },
    rulesTableFilterInputText: {
        id: 'rulestable.filter.inputtext',
        description: 'Search text placeholder for recommendation table',
        defaultMessage: 'Find a rule...'
    },
    rulesTableActionExportJson: {
        id: 'rulestable.action.exportjson',
        description: 'Button text to export/download recommendation table data as json',
        defaultMessage: 'Export as JSON'
    },
    rulesTableActionExportCsv: {
        id: 'rulestable.action.exportcsv',
        description: 'Button text to export/download recommendation table data as csv',
        defaultMessage: 'Export as CSV'
    },
    rulesTableActionShow: {
        id: 'rulestable.action.show',
        description: 'Label for action show all recommendationsincluding those that affect systems',
        defaultMessage: 'Show recommendations with no impacted systems'
    },
    rulesTableActionHide: {
        id: 'rulestable.action.hide',
        description: 'Label for action show only recommendationsthat affect systems',
        defaultMessage: 'Hide recommendations with no impacted systems'
    },
    rulesTableActionShowDisabled: {
        id: 'rulestable.action.showDisabled',
        description: 'Label for action show all recommendationsincluding those that are disabled',
        defaultMessage: 'Show disabled recommendations'
    },
    rulesTableActionHideDisabled: {
        id: 'rulestable.action.hideDisabled',
        description: 'Label for action show only recommendationsthat are enabled',
        defaultMessage: 'Hide disabled recommendations'
    },
    rulesTableFetchRulesError: {
        id: 'rulestable.fetchrules.error',
        description: 'Recommendation table, fetch rules, error message',
        defaultMessage: 'There was an error fetching recommendations list.'
    },
    loading: {
        id: 'loading',
        description: 'Loading text',
        defaultMessage: 'Loading...'
    },
    summaryChartNoHits: {
        id: 'summarychart.nohits',
        description: 'The no hits text for the summary chart',
        defaultMessage: 'Your connected systems have no recommendations.'
    },
    summaryChartItem: {
        id: 'summarychart.item',
        description: 'Text for each summary chart item of varying severity',
        defaultMessage: '{numIssues} {name} affecting {affectedSystems} {affectedSystems, plural, one {system} other {systems}}'
    },
    summaryChartItemNoHits: {
        id: 'summarychart.itemnohits',
        description: 'Text for each summary chart item of varying severity that has no hits',
        defaultMessage: 'No {severity} hits.'
    },
    overviewChartNoHits: {
        id: 'overviewchart.nohits',
        description: 'The no hits text for the overview chart',
        defaultMessage: 'Your connected systems have no categorized recommendations.'
    },
    totalHits: {
        id: 'total hits',
        description: 'The total hits label for the overview donut chart',
        defaultMessage: 'Total hits'
    },
    clearFilters: {
        id: 'clearFilters',
        description: 'Filter action, clear all filter chips',
        defaultMessage: 'Clear filters'
    },
    filterResults: {
        id: 'filterResults',
        description: 'Filter action, for tagstoolbar, ',
        defaultMessage: 'Filter by tags:'
    },
    allSystems: {
        id: 'allSystems',
        description: 'All systems',
        defaultMessage: 'All systems'
    },
    knowledgebaseArticle: {
        id: 'knowledgebasearticle',
        description: 'Knowledgebase article',
        defaultMessage: 'Knowledgebase article'
    },
    riskofchange: {
        id: 'riskofchange',
        description: 'Risk of Change',
        defaultMessage: 'Risk of change'
    },
    rulesDetailsTotalriskBody: {
        id: 'rulesdetails.totalriskbody',
        description: 'Text explaining the total risk value of this recommendation',
        defaultMessage: `The <strong>likelihood</strong> that this will be a problem is
        {likelihood}. The <strong>impact</strong> of the problem would be
        {impact} if it occurred.`
    },
    undefined: {
        id: 'undefined',
        description: 'Undefined',
        defaultMessage: 'Undefined'
    },
    learnMore: {
        id: 'learnMore',
        description: 'Topic card, link to topic details page',
        defaultMessage: 'Learn more'
    },
    countMore: {
        id: 'countMore',
        description: 'Accepts a count of items, appends the text more',
        defaultMessage: '{count} more'
    },
    recommended: {
        id: 'recommended',
        description: 'Recommended',
        defaultMessage: 'Recommended'
    },
    featured: {
        id: 'featured',
        description: 'Featured',
        defaultMessage: 'Featured'
    },
    status: {
        id: 'status',
        description: 'Status',
        defaultMessage: 'Status'
    },
    label: {
        id: 'label',
        description: 'Label',
        defaultMessage: 'Label'
    },
    topicCardSystemsaffected: {
        id: 'topiccard.systemsaffected',
        description: 'Topic card, systems affected text',
        defaultMessage: '{systems, plural, one {# system} other {# systems}} affected'
    },
    overview: {
        id: 'overview',
        description: 'Overview',
        defaultMessage: 'Overview'
    },
    overviewCategoryChartTitle: {
        id: 'overview.categorychart.title',
        description: 'Overview Category donut chart title',
        defaultMessage: 'Recommendations by category'
    },
    overviewSeverityChartTitle: {
        id: 'overview.severitychart.title',
        description: 'Overview severity chart title',
        defaultMessage: 'Recommendations by severity'
    },
    overviewSystemInventory: {
        id: 'overview.systemInventory.title',
        description: 'Overview system inventory chart title',
        defaultMessage: 'System inventory'
    },
    overviewSystemInventoryStale: {
        id: 'overview.systemInventory.stale',
        description: 'Overview system inventory chart stale systems',
        defaultMessage: '{systems, plural, one {# stale system} other {# stale systems}}'
    },
    overviewSystemInventoryRemoved: {
        id: 'overview.systemInventory.Removed',
        description: 'Overview system inventory chart systems to be removed',
        defaultMessage: '{systems, plural, one {# system} other {# systems}} to be removed'
    },
    overviewSystemInventoryOK: {
        id: 'overview.systemInventory.OK',
        description: 'Overview system inventory chart systems OK',
        defaultMessage: 'All systes are up to date'
    },
    overviewActioncallTitle: {
        id: 'overview.actioncall.title',
        description: 'Overview, call to action title',
        defaultMessage: 'Get started with Red Hat Insights'
    },
    overviewConnectsystemsTitle: {
        id: 'overview.connectsystems.title',
        description: 'Overview, title for connecting first systems',
        defaultMessage: 'Connect your first systems'
    },
    overviewConnectsystemsBody: {
        id: 'overview.connectsystems.body',
        description: 'Overview, body for connecting first systems',
        defaultMessage: `Connect at least 10 systems to get a better
        awareness of issues and optimizations
        identified across your infastructure`
    },
    overviewConnectsystemsAction: {
        id: 'overview.connectsystems.action',
        description: 'Overview, action link for connecting first systems',
        defaultMessage: `Learn how to connect a system to Insights`
    },
    overviewRemediateTitle: {
        id: 'overview.remediate.title',
        description: 'Overview, title for remediate',
        defaultMessage: 'Remediate Insights findings with Ansible'
    },
    overviewRemediateBody: {
        id: 'overview.remediate.body',
        description: 'Overview, body for remediate',
        defaultMessage: `Easily generate an Ansible playbook to 
        quickly and effectively remediate Insights findings`
    },
    overviewRemediateAction: {
        id: 'overview.remediate.action',
        description: 'Overview, action link for remediate',
        defaultMessage: 'Get started with Insights and Ansible Playbooks'
    },
    overviewDeployTitle: {
        id: 'overview.deploy.title',
        description: 'Overview, title for deploy',
        defaultMessage: 'Deploy Insights at scale'
    },
    overviewDeployBody: {
        id: 'overview.deploy.body',
        description: 'Overview, body for deploy',
        defaultMessage: `Get more out of Insights with more systems.
        Quickly connect systems with <linkansible> Ansible </linkansible>
        or <linkpuppet> Puppet </linkpuppet>`
    },
    overviewDeployAction: {
        id: 'overview.deploy.action',
        description: 'Overview, action link for deploy',
        defaultMessage: 'Download Ansible Playbook'
    },
    overviewActionCallNoSystemsBody: {
        id: 'overview.actioncallnosystems.body',
        description: 'Overview, action call body when there are no systems',
        defaultMessage: `With predictive analytics, avoid problems and unplanned <break> </break>
        downtime in your Red Hat environment. Red Hat Insights is <break> </break>
        included with your Red Hat Enterprise Linux subscription`
    },
    overviewActionCallNoSystemsAction: {
        id: 'overview.actioncallnosystems.action',
        description: 'Overview, action call link for when there are no systems',
        defaultMessage: 'Getting started documentation'
    },
    installClient: {
        id: 'installClient',
        description: 'Install the client on the RHEL system',
        defaultMessage: 'Install the client on the RHEL system.'
    },
    registerSystem: {
        id: 'registerSystem',
        description: 'Register the system to Red Hat Insights',
        defaultMessage: 'Register the system to Red Hat Insights.'
    },
    rulesDetailsPubishdate: {
        id: 'rulesdetails.publishdate',
        description: 'Recommendationsdetails, publish date',
        defaultMessage: 'Publish date: {date}'
    },
    affectedSystems: {
        id: 'affectedSystems',
        description: 'Affected systems',
        defaultMessage: 'Affected systems'
    },
    readmore: {
        id: 'readmore',
        description: 'Read more',
        defaultMessage: 'Read more'
    },
    readless: {
        id: 'readless',
        description: 'Read less',
        defaultMessage: 'Read less'
    },
    deleteTopic: {
        id: 'deleteTopic',
        description: 'Used for Button in Edit Topic Modal',
        defaultMessage: 'Delete topic'
    },
    topicDetailslNodetailsTitle: {
        id: 'topicdetails.nodetails.title',
        description: 'Topic details, title when none are present or exist',
        defaultMessage: 'No details for topic'
    },
    topicDetailslNodetailsBody: {
        id: 'topicdetails.nodetails.body',
        description: 'Topic details, body when none are present or exist',
        defaultMessage: 'There exist no further details for this topic.'
    },
    title: {
        id: 'title',
        description: 'Used in the topics admin table title column, identifying display title of a topic',
        defaultMessage: 'Title'
    },
    tag: {
        id: 'tag',
        description: 'Used in the topics admin table tag column, identifying display tag for a topic',
        defaultMessage: 'Tag'
    },
    tagsCount: {
        id: 'tagsCount',
        description: 'Tags followed by a count (of selected tags)',
        defaultMessage: 'Tags ({count})'
    },
    noTags: {
        id: 'noTags',
        description: 'When there exist no tags for an account',
        defaultMessage: 'No tags available'
    },
    topicAddEditDescription: {
        id: 'topicAddEditDescription',
        description: 'description header for TopicAddEdit Modal',
        defaultMessage: 'Description'
    },
    topicAddEditDescriptionHelperText: {
        id: 'topicAddEditDescriptionHelperText',
        description: 'helper text for description text area on TopicAddEdit Modal',
        defaultMessage: 'Shown to users to describe the topic'
    },
    topicAddEditDisabled: {
        id: 'topicAddEditDisabled',
        description: 'Disabled label in TopicAddEdit radio buttons',
        defaultMessage: 'Disabled (not visible)'
    },
    topicAddEditEnabled: {
        id: 'topicAddEditEnabled',
        description: 'Enabled label in TopicAddEdit radio buttons',
        defaultMessage: 'Enabled (visible)'
    },
    topicAddEditFeatureBox: {
        id: 'topicAddEditFeatureBox',
        description: 'label for feature checkbox in TopicAddEdit Modal',
        defaultMessage: 'Feature this topic'
    },
    topicAddEditTagHelperText: {
        id: 'topicAddEditLabelHelperText',
        description: 'helper text for tag text input in TopicAddEdit Modal',
        defaultMessage: 'Recommendations tagged with this tag will be added to the topic'
    },
    topicAdminCreate: {
        id: 'topicAdminCreate',
        description: 'Create Label',
        defaultMessage: 'Create new topic'
    },
    topicAdminEdit: {
        id: 'topicAdminEdit',
        description: 'Edit Label',
        defaultMessage: 'Edit topic'
    },
    topicAdminTitle: {
        id: 'topicAdminTitle',
        description: 'The title for the Topic Admin page',
        defaultMessage: 'Topic - administration'
    },
    topics: {
        id: 'topics',
        description: 'Topics Title',
        defaultMessage: 'Topics'
    },
    topicSlug: {
        id: 'topicslug',
        description: 'Used in the topics admin table slug column, identifying display slug for a topic',
        defaultMessage: 'Slug'
    },
    topicsListNotopicsTitle: {
        id: 'topicslist.notopics.title',
        description: 'Topics list, no topics title',
        defaultMessage: 'No topics'
    },
    topicsListNotopicsBody: {
        id: 'topicslist.notopics.body',
        description: 'Topics list, no topics body',
        defaultMessage: 'Either no topics presently exist or there is an issue presenting them.'
    },
    remediate: {
        id: 'remediate',
        description: 'Remediate',
        defaultMessage: 'Remediate'
    },
    selectAll: {
        id: 'selectAll',
        description: 'Action, Bulk select all items in a table with number',
        defaultMessage: 'Select all ({items} items)'
    },
    selectPage: {
        id: 'selectPage',
        description: 'Action, Bulk select all visible items in table, with number',
        defaultMessage: 'Select page ({items} items)'
    },
    selectNone: {
        id: 'selectNone',
        description: 'Action, Bulk deselect all',
        defaultMessage: 'Select none (0 items)'
    },
    topicRelatedToRule: {
        id: 'topicRelatedToRule',
        description: 'Identifying the list of topics that include this recommendation',
        defaultMessage: 'Topics related to this recommendation'
    },
    name: {
        id: 'name',
        description: 'Used in the system table title column, identifying display name of a system',
        defaultMessage: 'Name'
    },
    numberRuleHits: {
        id: 'numberRuleHits',
        description: 'Used in the system table title column, number of recommendations per system',
        defaultMessage: 'Number of recommendations'
    },
    lastSeen: {
        id: 'lastSeen',
        description: 'Used in the system table title column, the last time a system has checked in',
        defaultMessage: 'Last seen'
    },
    noHitsTitle: {
        id: 'nohits.title',
        description: 'No hits message, title',
        defaultMessage: 'No matching {item} found'
    },
    noHitsBody: {
        id: 'nohits.body',
        description: 'No hits messags, body',
        defaultMessage: 'The filter criteria matches no {item}. Try changing your filter settings.'
    },
    search: {
        id: 'search',
        description: 'Commonly used in text input search fields ',
        defaultMessage: 'Search'
    },
    systemTableFetchError: {
        id: 'systemtable.fetch.error',
        description: 'System table, fetch , error message',
        defaultMessage: 'There was an error fetching systems'
    },
    low: {
        id: 'low',
        description: 'Filter value',
        defaultMessage: 'Low'
    },
    moderate: {
        id: 'moderate',
        description: 'Filter value',
        defaultMessage: 'Moderate'
    },
    important: {
        id: 'important',
        description: 'Filter value',
        defaultMessage: 'Important'
    },
    critical: {
        id: 'critical',
        description: 'Filter value',
        defaultMessage: 'Critical'
    },
    veryLow: {
        id: 'veryLow',
        description: 'Filter value',
        defaultMessage: 'Very Low'
    },
    medium: {
        id: 'medium',
        description: 'Filter value',
        defaultMessage: 'Medium'
    },
    high: {
        id: 'high',
        description: 'Filter value',
        defaultMessage: 'High'
    },
    availability: {
        id: 'availability',
        description: 'Filter value',
        defaultMessage: 'Availability'
    },
    performance: {
        id: 'performance',
        description: 'Filter value',
        defaultMessage: 'Performance'
    },
    stability: {
        id: 'stability',
        description: 'Filter value',
        defaultMessage: 'Stability'
    },
    security: {
        id: 'security',
        description: 'Filter value',
        defaultMessage: 'Security'
    },
    enabled: {
        id: 'enabled',
        description: 'Filter value',
        defaultMessage: 'Enabled'
    },
    impact: {
        id: 'impact',
        description: 'Filter title',
        defaultMessage: 'Impact'
    },
    category: {
        id: 'category',
        description: 'Filter title',
        defaultMessage: 'Category'
    },
    likelihood: {
        id: 'likelihood',
        description: 'Filter title',
        defaultMessage: 'Likelihood'
    },
    riskOfChangeTextOne: {
        id: 'riskOfChangeTextOne',
        description: 'Risk of change text explaining a value one',
        defaultMessage: 'The change takes very little time to implement and there is minimal impact to system operations.'
    },
    riskOfChangeTextTwo: {
        id: 'riskOfChangeTextTwo',
        description: 'Risk of change text explaining a value two',
        defaultMessage: 'Typically, these changes do not require that a system be taken offline.'
    },
    riskOfChangeTextThree: {
        id: 'riskOfChangeTextThree',
        description: 'Risk of change text explaining a value three',
        defaultMessage: 'These will likely require an outage window.'
    },
    riskOfChangeTextFour: {
        id: 'riskOfChangeTextFour',
        description: 'Risk of change text explaining a value four',
        defaultMessage: `The change takes a significant amount of time and planning to execute, and will impact the system and business operations of the host due to downtime.`
    },
    no: {
        id: 'no',
        description: 'Used to signal no ansible playbook',
        defaultMessage: `No`
    },
    description: {
        id: 'description',
        description: 'Description',
        defaultMessage: `Description`
    },
    save: {
        id: 'save',
        description: 'Save',
        defaultMessage: `Save`
    },
    cancel: {
        id: 'cancel',
        description: 'Cancel',
        defaultMessage: `Cancel`
    },
    none: {
        id: 'none',
        description: 'None',
        defaultMessage: `None`
    },
    dateDisabled: {
        id: 'dateDisabled',
        description: 'Date disabled',
        defaultMessage: 'Date disabled'
    },
    hostAckModalTitle: {
        id: 'hostAckModalTitle',
        description: 'Title for host ack table modal',
        defaultMessage: 'Recommendation has been disabled for:'
    },
    systemName: {
        id: 'systemName',
        description: 'System name',
        defaultMessage: 'System name'
    },
    enable: {
        id: 'enable',
        description: 'Enable',
        defaultMessage: 'Enable'
    },
    error: {
        id: 'error',
        description: 'Error',
        defaultMessage: 'Error'
    },
    viewAffectedSystems: {
        id: 'viewAffectedSystems',
        description: 'Link text to view all hosts that are affected by a recommendation',
        defaultMessage: 'View {systems, plural, one {the affected system} other {# affected systems}}'
    },
    ruleHelpful: {
        id: 'ruleHelpful',
        description: 'Asking the user if they find a recommendation helpful',
        defaultMessage: 'Is this recommendation helpful?'
    },
    feedbackThankyou: {
        id: 'feedbackThankyou',
        description: 'Thanking user for feedback',
        defaultMessage: 'Thank you for your feedback!'
    },
    all: {
        id: 'all',
        description: 'All',
        defaultMessage: 'All'
    },
    incidentRules: {
        id: 'incidentRules',
        description: 'Recommendationswith incidents',
        defaultMessage: 'Incident recommendations'
    },
    nonIncidentRules: {
        id: 'nonIncidentRules',
        description: 'Recommendationswith no incidents',
        defaultMessage: 'Non-incident recommendations'
    },
    incident: {
        id: 'incident',
        description: 'Incident',
        defaultMessage: 'Incident'
    },
    incidentTooltip: {
        id: 'incidentTooltip',
        description: 'Incident badge tooltip text',
        defaultMessage: 'Indicates configurations that are currently affecting your systems'
    },
    cveAlert: {
        id: 'cveAlert',
        description: 'Cve alert body',
        defaultMessage: 'As of April 20th, 2020, all CVE recommendations previously shown in recommendations have moved over to the Vulnerability section of Red Hat Insights which provides additional capabilities for enhanced CVE identification and remediation.'
    },
    cveAlertTitle: {
        id: 'cveAlertTitle',
        description: 'Cve alert title',
        defaultMessage: 'CVE recommendations relocated'
    },
    downloadExecutiveLabel: {
        id: 'downloadExecutiveLabel',
        description: 'Label given to link for downloading exec report',
        defaultMessage: 'Download executive report'
    },
    insightsHeader: {
        id: 'insightsHeader',
        description: 'Type value for Executive Reports Download Button',
        defaultMessage: 'Advisor'
    },
    execReportHeader: {
        id: 'execReportHeader',
        description: 'Header in the Executive Report describing the number of systems and risk analyzed',
        defaultMessage: `This report is an executive summary of recommendations that may impact your Red Hat Enterprise Linux servers. Red Hat Advisor service is analyzing {systems} and has identified {risks} that impact 1 or more of these systems.`
    },
    execReportHeaderSystems: {
        id: 'execReportHeaderSystems',
        description: 'System part of the exec report header',
        defaultMessage: '{systems, plural, one {# RHEL system} other {# RHEL systems}}'
    },
    execReportHeaderRisks: {
        id: 'execReportHeaderRisks',
        description: 'Risk part of the exec report header',
        defaultMessage: '{risks, plural, one {# Risk} other {# Risks}}'
    },
    recNumAndPercentage: {
        id: 'recNumAndPercentage',
        description: 'Given number and total displays percentage',
        defaultMessage: '{count} ({total}% of total)'
    },
    severity: {
        id: 'severity',
        description: 'Severity',
        defaultMessage: 'Severity'
    },
    severityHeader: {
        id: 'severityHeader',
        description: 'Header for Severity Section of Exec Report',
        defaultMessage: 'Identified recommendations by severity'
    },
    categoryHeader: {
        id: 'categoryHeader',
        description: 'Header for Category Section of Exec Report',
        defaultMessage: 'Recently identified recommendations by category'
    },
    top3RulesHeader: {
        id: 'topThreeRulesHeader',
        description: 'Header for Top 3 section of Exec Report',
        defaultMessage: 'Top 3 recommendations in your infrastructure'
    },
    poundOfRecs: {
        id: 'poundOfRecs',
        description: '# of recommendations',
        defaultMessage: '# of recommendations'
    }
});
