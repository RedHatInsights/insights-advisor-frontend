export function onNavigate(_event, _item, key) {
    history.go(-key);
}

export function parseBreadcrumbs(breadcrumbs, params, hops) {
    if (breadcrumbs[0].navigate === '/rules') {
        return breadcrumbs;
    } else {
        let crumbs = [];
        if (hops >= 1) {
            crumbs.push({
                title: breadcrumbs[0].title,
                navigate: breadcrumbs[0].navigate
            });
        }

        if (hops === 2) {
            crumbs.push({
                title: params.type.replace('-', ' '),
                navigate: breadcrumbs[0].navigate + '/' + params.type
            });
        }

        return crumbs;
    }

}

export function buildBreadcrumbs(match, hops) {
    let breadcrumbs = [];
    breadcrumbs.push({
        title: match.path.split('/')[1],
        navigate: '/' + match.path.split('/')[1]
    });
    return parseBreadcrumbs(breadcrumbs, match.params, hops);
}
