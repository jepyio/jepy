import {Block} from '../Block.js';
import {paramFromPath} from '../params.js';

/**
 * @enum {String}
 */
const Prefix = {
    ESCAPED: '$',
    RAW: '%',
    PARTIAL: '@'
};

/**
 * @implements {Block}
 */
class Placeholder extends Block {
    /**
     * @param {String} content
     * @param {Object} partials
     */
    constructor(content, partials) {
        super();
        /** @type {String} */
        this.content_ = content;
        /** @type {Object} */
        this.partials_ = partials;
    }

    /**
     * @override
     * @public
     * @function
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        let content = this.content_;
        if (this.partials_ !== undefined) {
            content = this.replaceTagsByPrefix_(content, Prefix.PARTIAL, (path) => {
                let partial = paramFromPath(path, this.partials_);
                if (typeof partial === 'function') {
                    partial = partial(params);
                }
                const isBlock = typeof partial === 'object' && partial instanceof Block;
                if (isBlock) {
                    return partial.render(params);
                }
                return partial;
            });
        }
        if (params) {
            content = this.replaceTagsByPrefix_(content, Prefix.RAW, (path) =>
                paramFromPath(path, params)
            );
            content = this.replaceTagsByPrefix_(content, Prefix.ESCAPED, (path) => {
                const param = paramFromPath(path, params);
                return typeof param === 'string' ? this.escape_(param) : param;
            });
        }
        return content;
    }

    /**
     * @private {function}
     * @param {String} content
     * @param {Prefix} prefix
     * @param {function} callback
     * @return {String}
     */
    replaceTagsByPrefix_(content, prefix, callback) {
        for (const tag of this.tags_(content, prefix)) {
            content = content.replaceAll(tag[0], callback(tag[1]));
        }
        return content;
    }
    
    /**
     * @private {function}
     * @param {String} content
     * @param {Prefix} prefix
     * @return {Array}
     */
    tags_(content, prefix) {
        const tagPattern = new RegExp('\\' + prefix + '\\{(\\w*(?:\\.\\w*)*)\\}', 'g');
        let tag;
        let tags = [];
        while ((tag = tagPattern.exec(content)) !== null) {
            tags.push(tag);
        }
        return tags;
    }

    /**
     * @private {function}
     * @param {String} text
     * @return {String}
     */
    escape_(text) {
        return text
            .replace(/([<>&]|[^#-~| |!])/g, (match) => '&#' + match.charCodeAt(0) + ';')
            .replace(
                /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                (match) =>
                    '&#' + (match.charCodeAt(0) * 0x400 + match.charCodeAt(1) - 0x35fdc00) + ';'
            );
    }
}

export {Placeholder};
