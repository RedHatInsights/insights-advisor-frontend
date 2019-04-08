function getBaseName(pathname) {
    let release = '/';
    const pathName = pathname.split('/');

    pathName.shift();

    if (pathName[0] === 'beta') {
        pathName.shift();
        release = `/beta/`;
    }

    // Most apps need this to be the first *two* elements
    // Insights needs only one
    return `${release}${pathName[0]}`;
}

export default getBaseName;

