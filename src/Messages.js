import { defineMessages } from 'react-intl';

export default defineMessages({
    rulesTitle: {
        id: 'title.rules',
        description: 'Rules Title',
        defaultMessage: 'Rules'
    },
    rulesTableColumnTitleAdded: {
        id: 'rulestable.columntitle.added',
        description: 'Rulestable column title, added',
        defaultMessage: 'Added'
    },
    rulesTableColumnTitleRule: {
        id: 'rulestable.columntitle.rule',
        description: 'Rulestable column title, rule',
        defaultMessage: 'Rule'
    },
    rulesTableColumnTitleTotalrisk: {
        id: 'rulestable.columntitle.totalrisk',
        description: 'Rulestable column title, total risk',
        defaultMessage: 'Total Risk'
    },
    rulesTableColumnTitleSystems: {
        id: 'rulestable.columntitle.systems',
        description: 'Rulestable column title, systems',
        defaultMessage: 'Systems'
    },
    rulesTableColumnTitleAnsible: {
        id: 'rulestable.columntitle.ansible',
        description: 'Rulestable column title, ansible',
        defaultMessage: 'Ansible'
    },
    rulesTableHideReportsErrorDisabled: {
        id: 'rulestable.hidereports.errordisabling',
        description: 'Rulestable, hide reports action, error for disabling reporting on a rule',
        defaultMessage: 'Disabling reports failed'
    },
    rulesTableHideReportsErrorEnabled: {
        id: 'rulestable.hidereports.errorenabling',
        description: 'Rulestable, hide reports action, error for enabling reporting on a rule',
        defaultMessage: 'Enabling reports failed'
    },
    rulesTableActionDisableRule: {
        id: 'rulestable.action.disablerule',
        description: 'Rulestable, action text for disabling reporting of a rule',
        defaultMessage: 'Disable Rule'
    },
    rulesTableActionEnableRule: {
        id: 'rulestable.action.enablerule',
        description: 'Rulestable, action text for enabling reporting of a rule',
        defaultMessage: 'Enable Rule'
    },
    rulesTableNoRuleHitsTitle: {
        id: 'rulestable.norulehits.title',
        description: 'Rulestable, no rule hits message, title',
        defaultMessage: 'No rule hits'
    },
    rulesTableNoRuleHitsEnabledRulesBody: {
        id: 'rulestable.norulehits.enabledrulesbody',
        description: 'Rulestable, no rule hits message for enabled rules, body',
        defaultMessage: 'None of your connected systems are affected by enabled rules.'
    },
    rulesTableNoRuleHitsAnyRulesBody: {
        id: 'rulestable.norulehits.anyrulesbody',
        description: 'Rulestable, no rule hits message for any known rules, body',
        defaultMessage: 'None of your connected systems are affected by any known rules.'
    },
    rulesTableNoRuleHitsAddDisabledButton: {
        id: 'rulestable.norulehits.adddisabledbutton',
        description: 'Rulestable, no rule hits message for any enabled rules, include disabled rules button',
        defaultMessage: 'Include disabled rules'
    },
    disabled: {
        id: 'disabled',
        description: 'Disabled',
        defaultMessage: 'Disabled'
    },
    notapplicable: {
        id: 'notapplicable',
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
        description: 'Rulestable, fetch rules, error message',
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
    overviewChartTotalHits: {
        id: 'overviewchart.totalhits',
        description: 'The total hits text for the overview chart',
        defaultMessage: 'Total Hits'
    },
    filterChipsClearAll: {
        id: 'filter.chips.clearall',
        description: 'Clear all filter chips text',
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
        defaultMessage: 'Risk of Change'
    },
    rulesDetailsTotalriskBody: {
        id: 'rulesdetails.totalriskbody',
        description: 'Text explaining the total risk value of this rule',
        defaultMessage: `The <strong>likelihood</strong> that this will be a problem is
        {likelihood}. The <strong>impact</strong> of the problem would be
        {impact} if it occurred.` },
    rulesDetailsRiskofchangeBody: {
        id: 'rulesdetails.riskofchangebody',
        description: 'Text explaining the risk of change value of this rule',
        defaultMessage: 'Clear filters'
    },
    undefined: {
        id: 'undefined',
        description: 'Undefined',
        defaultMessage: 'Undefined'
    },
    topicCardLearnMoreLink: {
        id: 'topiccard.learnmorelink',
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
        defaultMessage: '{systems} {systems, plural, one {system} other {systems}} affected'
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
        defaultMessage: 'Remediate Insights findings with Ansibles'
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
        defaultMessage: `With predictive analytics, avoid problems and unplanned <break></break>
        downtime in your Red Hat environment. Red Hat Insights is <break></break>
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
        defaultMessage: 'Publish Date: {date}'
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
    topicsTitle: {
        id: 'title.topics',
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
        description: 'Bulk select all items in a table with number',
        defaultMessage: 'Select all ({items} items)'
    },
    selectPage: {
        id: 'selectPage',
        description: 'Bulk select all visible items in table, with number',
        defaultMessage: 'Select page ({items} items)'
    },
    selectNone: {
        id: 'selectNone',
        description: 'Bulk deselect all',
        defaultMessage: 'Select none (0 items)'
    },
    topicRelatedToRule: {
        id: 'topicRelatedToRule',
        description: 'Identifying the list of topics that include this rule',
        defaultMessage: 'Topics related to this rule:'
    }
});
