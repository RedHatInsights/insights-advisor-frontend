export function onNavigate(_event, _item, key) {
    history.go(-key);
}

export function parseBreadcrumbs(breadcrumbs, params) {
    if (breadcrumbs[0].navigate === '/rules') {
        return breadcrumbs;
    } else {
        let crumbs = [];
        crumbs.push({
            title: breadcrumbs[0].title,
            navigate: breadcrumbs[0].navigate
        });
        crumbs.push({
            title: params.type.replace('-', ' '),
            navigate: breadcrumbs[0].navigate + '/' + params.type
        });
        return crumbs;
    }

}
