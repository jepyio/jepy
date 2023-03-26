/**
 * @type {function}
 * @param {String} path
 * @param {*} params
 * @return {*}
 */
const paramFromPath = (path, params) => {
    if (path.includes('.')) {
        return path.split('.').reduce((name, currentValue) => name?.[currentValue], params);
    }
    return params[path];
};

export {paramFromPath};
