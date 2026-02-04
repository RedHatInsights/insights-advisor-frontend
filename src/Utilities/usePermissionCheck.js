import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { PERMISSIONS, KESSEL_RELATIONS } from '../AppConstants';
import { useRbac } from './Hooks';

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
    isAllowed: canExport,
    isLoading: isExportLoading,
  } = useSelfAccessCheck({
    resourceType: 'advisor',
    relation: KESSEL_RELATIONS.export,
  });

  const {
    isAllowed: canDisableRec,
    isLoading: isDisableRecLoading,
  } = useSelfAccessCheck({
    resourceType: 'advisor',
    relation: KESSEL_RELATIONS.disableRec,
  });

  const {
    isAllowed: canViewRecs,
    isLoading: isViewRecsLoading,
  } = useSelfAccessCheck({
    resourceType: 'advisor',
    relation: KESSEL_RELATIONS.viewRecs,
  });

  const isLoading = isExportLoading || isDisableRecLoading || isViewRecsLoading;

  return [canExport, canDisableRec, canViewRecs, isLoading];
};
