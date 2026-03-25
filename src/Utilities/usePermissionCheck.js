import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { getKesselAccessCheckParams } from '@redhat-cloud-services/frontend-components-utilities/kesselPermissions';
import { PERMISSIONS, KESSEL_RELATIONS } from '../AppConstants';
import { useRbac } from './Hooks';
import { useDefaultWorkspace } from './useDefaultWorkspace';
import { useKesselWorkspaceIds } from './useKesselWorkspaceIds';

export const useRbacV1Permissions = () => {
  const [[canExport, canDisableRec, canViewRecs], isLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return [canExport, canDisableRec, canViewRecs, isLoading];
};

export const useKesselPermissions = () => {
  const {
    workspaceId,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useDefaultWorkspace();
  const {
    workspaceIds,
    isLoading: workspacesLoading,
    error: workspacesError,
  } = useKesselWorkspaceIds();

  const paramsOneWorkspace = useMemo(
    () =>
      getKesselAccessCheckParams({
        requiredPermissions: [
          KESSEL_RELATIONS.export,
          KESSEL_RELATIONS.disableRec,
        ],
        resourceIdOrIds: workspaceId,
        options: {
          resourceType: 'workspace',
          reporter: { type: 'rbac' },
        },
      }),
    [workspaceId],
  );

  const paramsMultipleWorkspaces = useMemo(
    () =>
      getKesselAccessCheckParams({
        requiredPermissions: [KESSEL_RELATIONS.viewRecs],
        resourceIdOrIds: workspaceIds,
        options: {
          resourceType: 'workspace',
          reporter: { type: 'rbac' },
        },
      }),
    [workspaceIds],
  );
  const mergedParams = useMemo(
    () => ({
      resources: [
        ...(paramsOneWorkspace?.resources ?? []),
        ...(paramsMultipleWorkspaces?.resources ?? []),
      ],
    }),
    [paramsOneWorkspace, paramsMultipleWorkspaces],
  );

  const { data, loading, error } = useSelfAccessCheck(mergedParams);

  if (workspaceLoading || workspacesLoading) {
    return [false, false, false, true];
  }

  if (
    !workspaceId ||
    workspaceError ||
    !workspaceIds?.length ||
    workspacesError ||
    error
  ) {
    return [false, false, false, false];
  }

  const checks = Array.isArray(data) ? data : [];

  const canExport =
    checks.find((item) => item.relation === KESSEL_RELATIONS.export)?.allowed ??
    false;
  const canDisableRec =
    checks.find((item) => item.relation === KESSEL_RELATIONS.disableRec)
      ?.allowed ?? false;
  const canViewRecs = checks.some(
    (item) => item.relation === KESSEL_RELATIONS.viewRecs && item.allowed,
  );

  return [canExport, canDisableRec, canViewRecs, loading];
};
