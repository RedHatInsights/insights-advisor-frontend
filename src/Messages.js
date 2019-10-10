/* eslint-disable max-len */
import { defineMessages } from 'react-intl';

export default defineMessages({
    rules: {
        id: 'rules',
        description: 'Used as a title',
        defaultMessage: 'Rules'
    },
    added: {
        id: 'added',
        description: 'Rule table column title',
        defaultMessage: 'Added'
    },
    rule: {
        id: 'rule',
        description: 'Rule table column title',
        defaultMessage: 'Rule'
    },
    totalRisk: {
        id: 'totalRisk',
        description: 'Rule table column title, Rule details label',
        defaultMessage: 'Total risk'
    },
    systems: {
        id: 'systems',
        description: 'Systems title used in rule table column and systems tab header',
        defaultMessage: 'Systems'
    },
    ansible: {
        id: 'ansible',
        description: 'Rule tablecolumn title',
        defaultMessage: 'Ansible'
    },
    rulesTableHideReportsErrorDisabled: {
        id: 'rulestable.hidereports.errordisabling',
        description: 'Rule table, hide reports action, error for disabling reporting on a rule',
        defaultMessage: 'Disabling reports failed'
    },
    rulesTableHideReportsErrorEnabled: {
        id: 'rulestable.hidereports.errorenabling',
        description: 'Rule table, hide reports action, error for enabling reporting on a rule',
        defaultMessage: 'Enabling reports failed'
    },
    disableRule: {
        id: 'disableRule',
        description: 'Rule table, action text for disabling reporting of a rule',
        defaultMessage: 'Disable rule'
    },
    enableRule: {
        id: 'enableRule',
        description: 'Rule table, action text for enabling reporting of a rule',
        defaultMessage: 'Enable rule'
    },
    rulesTableNoRuleHitsTitle: {
        id: 'rulestable.norulehits.title',
        description: 'Rule table, no rule hits message, title',
        defaultMessage: 'No rule hits'
    },
    rulesTableNoRuleHitsEnabledRulesBody: {
        id: 'rulestable.norulehits.enabledrulesbody',
        description: 'Rule table, no rule hits message for enabled rules, body',
        defaultMessage: 'None of your connected systems are affected by enabled rules.'
    },
    rulesTableNoRuleHitsAnyRulesBody: {
        id: 'rulestable.norulehits.anyrulesbody',
        description: 'Rule table, no rule hits message for any known rules, body',
        defaultMessage: 'None of your connected systems are affected by any known rules.'
    },
    rulesTableNoRuleHitsAddDisabledButton: {
        id: 'rulestable.norulehits.adddisabledbutton',
        description: 'Rule table, no rule hits message for any enabled rules, include disabled rules button',
        defaultMessage: 'Include disabled rules'
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
        description: 'Search text placeholder for rules table',
        defaultMessage: 'Find a rule...'
    },
    rulesTableActionExportJson: {
        id: 'rulestable.action.exportjson',
        description: 'Button text to export/download rules table data as json',
        defaultMessage: 'Export as JSON'
    },
    rulesTableActionExportCsv: {
        id: 'rulestable.action.exportcsv',
        description: 'Button text to export/download rules table data as csv',
        defaultMessage: 'Export as CSV'
    },
    rulesTableActionShowrulehits: {
        id: 'rulestable.action.showrulehits',
        description: 'Checkbox label for action show only rules that affect systems',
        defaultMessage: 'Show rules with hits'
    },
    rulesTableFetchRulesError: {
        id: 'rulestable.fetchrules.error',
        description: 'Rule table, fetch rules, error message',
        defaultMessage: 'There was an error fetching rules list.'
    },
    loading: {
        id: 'loading',
        description: 'Loading text',
        defaultMessage: 'Loading...'
    },
    summaryChartNoHits: {
        id: 'summarychart.nohits',
        description: 'The no hits text for the summary chart',
        defaultMessage: 'Your connected systems have no rule hits.'
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
        defaultMessage: 'Your connected systems have no categorized rule hits.'
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
    knowledgebaseArticle: {
        id: 'knowledgebasearticle',
        description: 'Knowledgebase Article',
        defaultMessage: 'Knowledgebase Article'
    },
    riskofchange: {
        id: 'riskofchange',
        description: 'Risk of Change',
        defaultMessage: 'Risk of change'
    },
    rulesDetailsTotalriskBody: {
        id: 'rulesdetails.totalriskbody',
        description: 'Text explaining the total risk value of this rule',
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
        defaultMessage: 'Rule hits by category'
    },
    overviewSeverityChartTitle: {
        id: 'overview.severitychart.title',
        description: 'Overview severity chart title',
        defaultMessage: 'Rule hits by severity'
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
        defaultMessage: `Learn how to connect a system to insights`
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
        defaultMessage: 'Get started'
    },
    rulesDetailsPubishdate: {
        id: 'rulesdetails.publishdate',
        description: 'Rules details, publish date',
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
    topics: {
        id: 'topics',
        description: 'Topics Title',
        defaultMessage: 'Topics'
    },
    topicsListNotopicsTitle: {
        id: 'topicslist.notopics.title',
        description: 'Topics list, no topics title',
        defaultMessage: 'There was an issue fetching topics'
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
        description: 'Identifying the list of topics that include this rule',
        defaultMessage: 'Topics related to this rule'
    },
    name: {
        id: 'name',
        description: 'Used in the system table title column, identifying display name of a system',
        defaultMessage: 'Name'
    },
    numberRuleHits: {
        id: 'numberRuleHits',
        description: 'Used in the system table title column, number of rule hits per system',
        defaultMessage: 'Number of rule hits'
    },
    lastSeen: {
        id: 'lastSeen',
        description: 'Used in the system table title column, the last time a system has checked in',
        defaultMessage: 'Last seen'
    },
    systemTableNoHitsTitle: {
        id: 'systemtable.nohits.title',
        description: 'System table, no hits message, title',
        defaultMessage: 'No matching systems found'
    },
    systemTableNoHitsEnabledRulesBody: {
        id: 'systemtable.nohits.enabledrulesbody',
        description: 'System table, no  hits messags, body',
        defaultMessage: 'The filter criteria matches no systems. Try changing your filter settings.'
    },
    search: {
        id: 'search',
        description: 'Commonly used in text input search fields ',
        defaultMessage: 'Search'
    },
    systemTableFetchError: {
        id: 'systemtable.fetch.error',
        description: 'System table, fetch , error message',
        defaultMessage: 'There was an error fetching systems.'
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
    all: {
        id: 'all',
        description: 'Filter value',
        defaultMessage: 'All'
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
    ruleStatus: {
        id: 'ruleStatus',
        description: 'Filter title',
        defaultMessage: 'Rule Status'
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
    }
});
