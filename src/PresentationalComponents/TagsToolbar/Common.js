const tagUrlBuilder = (tagsToSet) => {
    const url = new URL(window.location);
    let params = new URLSearchParams(url.search);
    tagsToSet.length ? params.set('tags', tagsToSet.join()) : params.delete('tags');
    window.history.replaceState(null, null, `${url.origin}${url.pathname}${params.toString().length ? '?' : ''}${params.toString()}`);
};

export { tagUrlBuilder };
