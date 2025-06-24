import {Glue} from './Template/Glue.js';

/**
 * @type {function}
 * @param {String} path
 * @param {*} params
 * @return {*}
 */
const paramFromPath = (path, params) => {
    if (path.includes(Glue.PATH)) {
        return path.split(Glue.PATH).reduce((name, currentValue) => name?.[currentValue], params);
    }
    return params[path];
};

export {paramFromPath};
