// Builds returns url params from table filters, pushes to url if history object is passed
export const urlBuilder = (filters, selectedTags) => {
    const url = new URL(window.location);
    const queryString = `?${Object.keys(filters).map(key => `${key}=${Array.isArray(filters[key]) ? filters[key].join() : filters[key]}`).join('&')}`;
    const params = new URLSearchParams(queryString);
    selectedTags !== null && selectedTags.length ? params.set('tags', selectedTags.join()) : params.delete('tags');
    window.history.replaceState(null, null, `${url.origin}${url.pathname}?${params.toString()}`);
    return `?${queryString}`;
};

// transforms array of strings -> comma seperated strings, required by advisor api
export const filterFetchBuilder = (filters) => Object.assign({},
    ...Object.entries(filters).map(([filterName, filterValue]) => Array.isArray(filterValue) ?
        ((filterValue[0] === 'true') || (filterValue[0] === 'false')) && filterValue.length > 1 ? null
            : { [filterName]: filterValue.join() }
        : { [filterName]: filterValue })
);

// parses url params for use in table/filter chips
export const paramParser = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return Array.from(searchParams).reduce((acc, [key, value]) => ({
        ...acc, [key]: (value === 'true' || value === 'false') ? JSON.parse(value) : value.split(',')
    }), {});
};

// capitalizes text string
export const capitalize = (string) => string[0].toUpperCase() + string.substring(1);
