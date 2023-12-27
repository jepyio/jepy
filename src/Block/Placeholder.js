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
 * @enum {String}
 */
const Bracket = {
    OPEN: '{',
    CLOSE: '}'
};

/**
 * @implements {Block}
 */
class Placeholder extends Block {
    /** @type {String} */
    #content;
    /** @type {Object} */
    #partials;

    /**
     * @param {String} content
     * @param {Object} partials
     */
    constructor(content, partials) {
        super();
        this.#content = content;
        this.#partials = partials;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        let content = this.#content;
        if (this.#partials !== undefined) {
            content = this.#replaceTagsByPrefix(content, Prefix.PARTIAL, (path) => {
                let partial = paramFromPath(path, this.#partials);
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
            content = this.#replaceTagsByPrefix(content, Prefix.RAW, (path) =>
                paramFromPath(path, params)
            );
            content = this.#replaceTagsByPrefix(content, Prefix.ESCAPED, (path) => {
                const param = paramFromPath(path, params);
                return typeof param === 'string' ? this.#escape(param) : param;
            });
        }
        return content;
    }

    /**
     * @param {String} content
     * @param {Prefix} prefix
     * @param {function} callback
     * @return {String}
     */
    #replaceTagsByPrefix(content, prefix, callback) {
        const tagPattern = new RegExp(
            '\\' +
                prefix +
                '\\' +
                Bracket.OPEN +
                '(?<path>\\w+(?:\\.\\w+)*)' +
                '\\' +
                Bracket.CLOSE,
            'g'
        );
        const tags = content.matchAll(tagPattern);
        for (const tag of tags) {
            content = content.replaceAll(tag[0], callback(tag.groups.path));
        }
        return content;
    }

    /**
     * @param {String} text
     * @return {String}
     */
    #escape(text) {
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
