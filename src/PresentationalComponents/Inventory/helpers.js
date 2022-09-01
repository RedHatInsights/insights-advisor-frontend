import { Get } from '../../Utilities/Api';
import { mergeArraysByDiffKeys } from '../Common/Tables';
import {
  RULES_FETCH_URL,
  SYSTEMS_FETCH_URL,
  BASE_URL,
} from '../../AppConstants';
import { createOptions } from '../helper';
import { useEffect, useState } from 'react';

/*This functions purpose is to grab the currently set filters, and return all associated systems for it.*/
export const paginatedRequestHelper = async ({
  per_page,
  page,
  advisorFilters,
  filters,
  workloads,
  SID,
  pathway,
  rule,
  selectedTags,
  sort,
}) => {
  let options = createOptions(
    advisorFilters,
    page,
    per_page,
    sort,
    pathway,
    filters,
    selectedTags,
    workloads,
    SID
  );

  return pathway
    ? (
        await Get(
          `${SYSTEMS_FETCH_URL}`,
          {},
          { ...options, pathway: pathway.slug }
        )
      )?.data
    : (
        await Get(
          `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/systems_detail/`,
          {},
          options
        )
      )?.data;
};

export const getEntities =
  (
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIds,
    setFullFilters,
    fullFilters,
    rule
  ) =>
  async (_items, config, showTags, defaultGetEntities) => {
    const {
      per_page,
      page,
      orderBy,
      orderDirection,
      advisorFilters,
      filters,
      workloads,
      SID,
      selectedTags,
    } = config;

    //operating_system is currently not supported, but will be down the line.
    const sort =
      orderBy === 'operating_system'
        ? 'rhel_version'
        : `${orderDirection === 'ASC' ? '' : '-'}${
            orderBy === 'updated' ? 'last_seen' : orderBy
          }`;

    let options = createOptions(
      advisorFilters,
      page,
      per_page,
      sort,
      pathway,
      filters,
      selectedTags,
      workloads,
      SID
    );
    handleRefresh(options);
    const allDetails = { ...config, pathway, handleRefresh, rule, sort };
    setFullFilters(allDetails);
    const fetchedSystems = await paginatedRequestHelper(allDetails);
    const results = await defaultGetEntities(
      fetchedSystems.data.map((system) => system.system_uuid),
      {
        page,
        per_page,
        hasItems: true,
        fields: { system_profile: ['operating_system'] },
      },
      showTags
    );
    setCurPageIds(fetchedSystems.data.map((system) => system.system_uuid));
    setTotal(fetchedSystems.meta.count);
    return Promise.resolve({
      results: mergeArraysByDiffKeys(fetchedSystems.data, results.results).map(
        (item) => {
          return {
            ...item,
            selected: selectedIds?.includes(item.id),
          };
        }
      ),
      total: fetchedSystems.meta.count,
    });
  };

/*Takes in the current filters, and keeps sending get request until there are no pages left*/
const fetchBatched = (fetchFunction, total, filter, batchSize = 100, rule) => {
  const pages = Math.ceil(total / batchSize) || 1;
  return Promise.all(
    [...new Array(pages)].map((_, pageIdx) =>
      fetchFunction({ ...filter, page: pageIdx + 1, per_page: batchSize, rule })
    )
  );
};
/*Grabs all systemIds and maniupaltes the data into one large array of systems*/
export const allCurrentSystemIds =
  (fullFilters, total, rule, setIsLoading) => async () => {
    setIsLoading(true);
    const results = await (
      await fetchBatched(paginatedRequestHelper, total, fullFilters, 100, rule)
    ).map((item) => item.data);

    const merged = [].concat.apply([], results).map((item) => item.system_uuid);
    setIsLoading(false);
    return merged;
  };

export const pathwayCheck = async (
  hasPathwayDetails,
  pathway,
  setHasPathwayDetails,
  setPathwayReportList,
  setPathwayRulesList
) => {
  if (!hasPathwayDetails) {
    if (pathway) {
      let pathwayRules = (
        await Get(
          `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
          {},
          {}
        )
      )?.data.data;

      let pathwayReport = (
        await Get(
          `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
          {},
          {}
        )
      )?.data.rules;
      setHasPathwayDetails(true);
      setPathwayReportList(pathwayReport);
      setPathwayRulesList(pathwayRules);
    }
  }
};

export const rulesCheck = async (
  rule,
  rulesPlaybookCount,
  filters,
  setRulesPlaybookCount
) => {
  if (rulesPlaybookCount < 0) {
    const associatedRuleDetails = (
      await Get(
        `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/`,
        {},
        { name: filters.name }
      )
    )?.data.playbook_count;
    setRulesPlaybookCount(associatedRuleDetails);
  }
};

export const useRemediationButtonStatus = (
  pathwayReportList,
  selectedIds,
  pathway,
  pathwayRulesList,
  rulesPlaybookCount
) => {
  let playbookFound = false;
  const [isRemediationButtonDisabled, setIsRemediationButtonDisabled] =
    useState(true);
  let ruleKeys = Object.keys(pathwayReportList);

  useEffect(() => {
    if (selectedIds?.length <= 0 || selectedIds === undefined) {
      setIsRemediationButtonDisabled(true);
    } else if (pathway) {
      for (let i = 0; i < selectedIds?.length; i++) {
        let system = selectedIds[i];
        if (playbookFound) {
          break;
        }
        ruleKeys.forEach((rule) => {
          //Grab the rule assosciated with that system
          if (pathwayReportList[rule].includes(system)) {
            let assosciatedRule = pathwayReportList[rule];
            //find that associated rule in the pathwayRules endpoint, check for playbook
            let item = pathwayRulesList.find(
              (report) => (report.rule_id = assosciatedRule)
            );
            if (item.resolution_set[0].has_playbook) {
              playbookFound = true;
              setIsRemediationButtonDisabled(false);
              return isRemediationButtonDisabled;
            }
          }
        });
      }
    } else {
      if (rulesPlaybookCount > 0 && selectedIds?.length > 0) {
        setIsRemediationButtonDisabled(false);
        return isRemediationButtonDisabled;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);
  return isRemediationButtonDisabled;
};
