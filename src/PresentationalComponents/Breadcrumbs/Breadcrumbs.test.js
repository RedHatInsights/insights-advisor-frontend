import { buildBreadcrumbs } from './helpers';

describe('Breadcrumbs', () => {
  it('set to IOP Recommendations when location contains foreman_rh_cloud', () => {
    const location = [
      '',
      'foreman_rh_cloud',
      'recommendations',
      'cifs_fstab_backslash|CIFS_FSTAB_BACKSLASH',
    ];

    const crumbs = buildBreadcrumbs(location, true);
    expect(crumbs).toEqual([
      {
        title: 'Recommendations',
        navigate: '/foreman_rh_cloud/insights_cloud',
      },
    ]);
  });

  it('set to hosted Recommendations when location[3] is recommendations', () => {
    const location = [
      '',
      'insights',
      'advisor',
      'recommendations',
      'unable_boot_missing_lvm2|UNABLE_BOOT_MISSING_LVM2_WARN',
    ];
    const crumbs = buildBreadcrumbs(location, true);
    expect(crumbs).toEqual([
      {
        title: 'Recommendations',
        navigate: '/recommendations',
      },
    ]);
  });

  it('set to Pathways when location contains pathways', () => {
    const location = [
      '',
      'insights',
      'advisor',
      'recommendations',
      'pathways',
      'update-kernel-boot-options',
    ];
    const crumbs = buildBreadcrumbs(location, true);
    expect(crumbs).toEqual([
      {
        title: 'Pathways',
        navigate: '/recommendations/pathways',
      },
    ]);
  });
});
