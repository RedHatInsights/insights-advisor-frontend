import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { getKesselAccessCheckParams } from '@redhat-cloud-services/frontend-components-utilities/kesselPermissions';
import { PERMISSIONS, KESSEL_RELATIONS } from '../AppConstants';
import { useRbac } from './Hooks';
import { useDefaultWorkspace } from './useDefaultWorkspace';

export const useRbacV1Permissions = () => {
  const [[canExport, canDisableRec, canViewRecs], isLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return [canExport, canDisableRec, canViewRecs, isLoading];
};

export const useKesselPermissions = () => {
  const { workspaceId, isLoading: workspaceLoading } = useDefaultWorkspace();

  const params = workspaceId
    ? getKesselAccessCheckParams({
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
      })
    : { resources: [] };

  const { data, loading, error } = useSelfAccessCheck(params);

  if (workspaceLoading) {
    return [false, false, false, true];
  }

  if (!workspaceId || error) {
    return [false, false, false, false];
  }

  const canExport = data?.[0]?.allowed ?? false;
  const canDisableRec = data?.[1]?.allowed ?? false;
  const canViewRecs = data?.[2]?.allowed ?? false;

  return [canExport, canDisableRec, canViewRecs, loading];
};
