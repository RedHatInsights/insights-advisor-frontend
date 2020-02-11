// Builds returns url params from table filters, pushes to url if history object is passed
export const urlBuilder = (filters, history) => {
    const queryString = `?${Object.keys(filters).map(key => `${key}=${Array.isArray(filters[key]) ? filters[key].join() : filters[key]}`).join('&')}`;
    history && history.replace({
        search: queryString
    });
    return queryString;
};

// transforms array of strings -> comma seperated strings, required by advisor api
export const filterFetchBuilder = (filters) => Object.assign({},
    ...Object.entries(filters).map(([filterName, filterValue]) => Array.isArray(filterValue) ?
        ((filterValue[0] === 'true') || (filterValue[0] === 'false')) && filterValue.length > 1 ? null
            : { [filterName]: filterValue.join() }
        : { [filterName]: filterValue })
);

// parses url params for use in table/filter chips
export const paramParser = (history) => {
    const searchParams = new URLSearchParams(history.location.search);
    return Array.from(searchParams).reduce((acc, [key, value]) => ({
        ...acc, [key]: (value === 'true' || value === 'false') ? JSON.parse(value) : value.split(',')
    }), {});
};
