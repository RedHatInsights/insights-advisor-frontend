export const buildBreadcrumbs = (location, skip) => {
  let crumbs = [];

  // add base
  if (location[3]) {
    const baseNameWithCapitalLetter =
      location[3].slice(0, 1).toUpperCase() + location[3].slice(1);
    crumbs.push({
      title: `${baseNameWithCapitalLetter}`,
      navigate: `/${location[3]}`,
    });
  }

  // if applicable, add :id breadcrumb
  if (!skip) {
    crumbs.push({
      title: data?.description,
      navigate: `/${location[1]}/${location[2]}`,
    });
  }

  if (location[4] === 'pathways') {
    crumbs = [
      {
        title: 'Pathways',
        navigate: '/recommendations/pathways',
      },
    ];
  }

  // Only effective in IOP environment
  if (location[1] === 'foreman_rh_cloud') {
    crumbs = [
      {
        title: 'Recommendations',
        navigate: '/foreman_rh_cloud/insights_cloud',
      },
    ];
  }
  return crumbs;
};
