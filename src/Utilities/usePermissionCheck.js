import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { getKesselAccessCheckParams } from '@redhat-cloud-services/frontend-components-utilities/kesselPermissions';
import { PERMISSIONS, KESSEL_RELATIONS } from '../AppConstants';
import { useRbac } from './Hooks';
import { useDefaultWorkspace } from './useDefaultWorkspace';

/**
 * RBAC v1 permission check for Advisor recommendations.
 * Reads the user's `advisor` permissions from Chrome and derives the
 * export / disable-recommendation / view-recommendations capability flags.
 * Used when the Kessel migration flag is off.
 *
 *  @returns {[boolean, boolean, boolean, boolean]} Tuple of
 *    `[canExport, canDisableRec, canViewRecs, isLoading]`.
 */
export const useRbacV1Permissions = () => {
  const [[canExport, canDisableRec, canViewRecs], isLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return [canExport, canDisableRec, canViewRecs, isLoading];
};

/**
 * Kessel permission check for Advisor recommendations.
 * Resolves the default workspace, then runs a single bulk self-access check for the
 * export / disable-recommendation / view-recommendations relations against that
 * workspace (reporter `rbac`). Used when the Kessel migration flag is on.
 * Returns all-false while the workspace resolves, and all-false if the workspace
 * cannot be resolved or the check errors.
 *
 *  @returns {[boolean, boolean, boolean, boolean]} Tuple of
 *    `[canExport, canDisableRec, canViewRecs, isLoading]`.
 */
export const useKesselPermissions = () => {
  const { workspaceId, isLoading: workspaceLoading } = useDefaultWorkspace();

  const params = getKesselAccessCheckParams({
    requiredPermissions: [
      KESSEL_RELATIONS.export,
      KESSEL_RELATIONS.disableRec,
      KESSEL_RELATIONS.viewRecs,
    ],
    resourceIdOrIds: workspaceId,
    options: {
      resourceType: 'workspace',
      reporter: { type: 'rbac' },
    },
  });

  const { data, loading, error } = useSelfAccessCheck(params);

  if (workspaceLoading) {
    return [false, false, false, true];
  }

  if (!workspaceId || error) {
    return [false, false, false, false];
  }

  const allowedByRelation = new Map(
    (data ?? []).map((item) => [item.relation, item.allowed]),
  );
  const canExport = allowedByRelation.get(KESSEL_RELATIONS.export) ?? false;
  const canDisableRec =
    allowedByRelation.get(KESSEL_RELATIONS.disableRec) ?? false;
  const canViewRecs = allowedByRelation.get(KESSEL_RELATIONS.viewRecs) ?? false;

  return [canExport, canDisableRec, canViewRecs, loading];
};
