/**
 * Environment context configuration for IoP environment.
 * This object defines all feature flags, permissions, and configuration
 * options specific to the IoP/Foreman/Satellite integration.
 *
 * @constant {Object}
 * @property {boolean} isLightspeedEnabled - Whether Lightspeed features are enabled (false for IoP)
 * @property {boolean} isLoading - Loading state for environment context
 * @property {boolean} isExportEnabled - Whether data export is enabled (false for IoP)
 * @property {boolean} isDisableRecEnabled - Whether disabling recommendations is allowed (false for IoP)
 * @property {boolean} isAllowedToViewRec - Whether user can view recommendations
 * @property {boolean} displayGroupsTagsColumns - Whether to show groups/tags columns (false for IoP)
 * @property {boolean} displayRuleRatings - Whether to show rule ratings (false for IoP)
 * @property {boolean} displayRecPathways - Whether to show pathways feature (false for IoP)
 * @property {boolean} displayExecReportLink - Whether to show executive report link (false for IoP)
 * @property {boolean} displayDownloadPlaybookButton - Whether to show playbook download button (true for IoP)
 * @property {boolean} changeRemediationButtonForIop - Whether to use IoP-specific remediation button
 * @property {boolean} loadChromeless - Whether to load in chromeless mode (true for IoP)
 * @property {Function} updateDocumentTitle - Function to update document title
 * @property {Function} getUser - Function to get user info (noop for IoP)
 * @property {Function} on - Event listener function (noop for IoP)
 * @property {Function} hideGlobalFilter - Function to hide global filter (noop for IoP)
 * @property {Function} mapGlobalFilter - Function to map global filter (noop for IoP)
 * @property {Function} globalFilterScope - Function for global filter scope (noop for IoP)
 * @property {Function} requestPdf - Function to request PDF generation (noop for IoP)
 * @property {boolean} isProd - Whether running in production environment
 *
 * @example
 * import { IOP_ENVIRONMENT_CONTEXT } from './IoP/constants';
 *
 * <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
 *   <MyComponent />
 * </EnvironmentContext.Provider>
 */
export const IOP_ENVIRONMENT_CONTEXT = {
  isLightspeedEnabled: false,
  isLoading: false,
  isExportEnabled: false,
  isDisableRecEnabled: false,
  isAllowedToViewRec: true,
  displayGroupsTagsColumns: false,
  displayRuleRatings: false,
  displayRecPathways: false,
  displayExecReportLink: false,
  displayDownloadPlaybookButton: true,
  changeRemediationButtonForIop: true,
  loadChromeless: true,
  updateDocumentTitle: (name) => (document.title = name),
  getUser: () => '',
  on: () => {},
  hideGlobalFilter: () => {},
  mapGlobalFilter: () => {},
  globalFilterScope: () => {},
  requestPdf: () => Promise.resolve(),
  isProd: !/stage.*\.redhat\.com$/.test(window.location.hostname),
};
