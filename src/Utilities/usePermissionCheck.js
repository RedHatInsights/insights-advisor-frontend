import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
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

  const resources = workspaceId
    ? [
        {
          id: workspaceId,
          type: 'workspace',
          relation: KESSEL_RELATIONS.export,
          reporter: { type: 'rbac' },
        },
        {
          id: workspaceId,
          type: 'workspace',
          relation: KESSEL_RELATIONS.disableRec,
          reporter: { type: 'rbac' },
        },
        {
          id: workspaceId,
          type: 'workspace',
          relation: KESSEL_RELATIONS.viewRecs,
          reporter: { type: 'rbac' },
        },
      ]
    : [];

  const { data, loading, error } = useSelfAccessCheck({ resources });

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
