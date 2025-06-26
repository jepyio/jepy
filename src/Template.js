import {Block} from './Block.js';
import {Cached} from './Block/Cached.js';
import {Conditional} from './Block/Conditional.js';
import {Simple} from './Block/Simple.js';
import {Repeating} from './Block/Repeating.js';
import {Indented, IndentType} from './Block/Indented.js';
import {Glue} from './Template/Glue.js';
import {Prefix, BlockPrefix} from './Template/Prefix.js';
import {Bracket} from './Template/Bracket.js';
import {Operator} from './Template/Operator.js';
import {paramFromPath} from './params.js';

/**
 * @implements {Block}
 */
class Template {
    /**
     * @var {String}
     */
    #content = '';
    /**
     * @var {Object}
     */
    #partials = {};
    /**
     * @var {Boolean}
     */
    #initialised = false;

    /**
     * @param {String} content
     * @param {Object} [partials]
     */
    constructor(content, partials = {}) {
        this.#content = content;
        this.#partials = partials;
    }

    /**
     * @override
     * @param {Object} [params]
     * @return {String}
     */
    render(params = {}) {
        if (!this.#initialised) {
            this.#build();
        }
        let content = this.#content;
        /**
         * @param {String} prefix
         * @param {function} callback
         */
        const replaceTagsByPrefix = (prefix, callback) => {
            const tagPattern = new RegExp(
                '(?<indent>[ \\t]*)' +
                    '\\' +
                    prefix +
                    '\\' +
                    Bracket.OPEN +
                    '(?<path>\\' + Operator.PARTIAL + '?\\w+(?:\\' +
                    Glue.PATH +
                    '(\\w|\\_\\-)+)*)' +
                    '\\' +
                    Bracket.CLOSE,
                'gm'
            );
            const tags = content.matchAll(tagPattern);
            for (const tag of tags) {
                const param = callback(tag.groups.path);
                content = content.replaceAll(
                    tag[0], 
                    this.#indentParam(param, tag.groups.indent)
                );
            }
        };
        replaceTagsByPrefix(Prefix.RAW, (path) => this.#paramFromPath(path, params));
        replaceTagsByPrefix(Prefix.ESCAPED, (path) => {
            const param = this.#paramFromPath(path, params);
            if (typeof param === 'string') {
                return this.#escape(param);
            }
            return param;
        });
        return content;
    }

    /**
     * @param {String} param
     * @param {String} indent
     * @return {String}
     */
    #indentParam(param, indent) {
        if (!indent) {
            return param;
        }
        if (typeof param === 'string' && param.includes('\n')) {
            return indent + param.replace(new RegExp('\\n', 'g'), '\n' + indent);
        }
        return indent + param;
    }

    /**
     * @param {String} path
     * @param {*} params
     * @return {*}
     */
    #paramFromPath(path, params) {
        if (path.startsWith(Operator.PARTIAL)) {
            return this.#partialFromPath(path, params);
        }
        return paramFromPath(path, params);
    }

    /**
     * @param {String} path
     * @param {*} params
     * @return {*}
     */
    #partialFromPath(path, params) {
        const partialName = path.slice(1);
        let partial = paramFromPath(partialName, this.#partials);
        if (typeof partial === 'function') {
            partial = partial(params);
        }
        const isBlock = typeof partial === 'object' && partial instanceof Block;
        if (isBlock) {
            return partial.render(params);
        }
        return partial;
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

    #build() {
        const escapedBlockPrefixes = Object.values(BlockPrefix).map(
            (blockPrefix) => '\\' + blockPrefix
        );
        const blockPattern = new RegExp(
            '(?<prefix>[' +
                escapedBlockPrefixes.join('') +
                '])' +
                '\\' +
                Bracket.OPEN +
                '(?<operator>[\\' +
                Operator.NOT +
                '])?' +
                '(?<placeholder>(?<name>\\' + Operator.PARTIAL + '?\\w+(?:\\' +
                Glue.PATH +
                '\\w+)*)(?:\\' +
                Glue.PARAM +
                '[\\w\\d]+)?)' +
                '\\' +
                Bracket.CLOSE +
                '(?<content>(.|\n)*?)\\k<prefix>\\' +
                Bracket.OPEN +
                '\\/\\k<name>' +
                '\\' +
                Bracket.CLOSE,
            'gm'
        );
        let counter = 0;
        let matches = [];
        let blockPartials = {};
        while ((matches = Array.from(this.#content.matchAll(blockPattern))).length > 0) {
            const block = matches[0];
            const blockId = 'block_' + counter;
            counter++;
            const blockPlaceholder = Prefix.RAW + Bracket.OPEN + Operator.PARTIAL + blockId + Bracket.CLOSE;
            this.#content = this.#content.replace(block[0], blockPlaceholder);
            blockPartials[blockId] = this.#blockCallback(block);
        }
        this.#partials = Object.assign(this.#partials, blockPartials);
        this.#initialised = true;
    }

    /**
     * @param {Object} block
     * @return {Function}
     */
    #blockCallback(block) {
        const prefix = block.groups.prefix;
        const placeholder = block.groups.placeholder;
        const partials = Object.assign({}, this.#partials);
        const blockTemplate = new Template(block.groups.content, partials);
        switch (prefix) {
        case BlockPrefix.CONDITIONAL:
            return (params) => {
                return new Conditional(
                    () => {
                        const param = this.#paramFromPath(placeholder, params);
                        const isFalse =
                                !param ||
                                (Object.hasOwn(param, 'length') && param.length === 0) ||
                                (typeof param === 'object' && Object.keys(param).length === 0);
                        const expectsFalse = block.groups.operator === Operator.NOT;
                        const isFulfilled =
                                (isFalse && expectsFalse) || (!isFalse && !expectsFalse);
                        return isFulfilled;
                    },
                    blockTemplate,
                    new Simple('')
                );
            };
        case BlockPrefix.REPEATING:
            return () => {
                const parts = placeholder.split(Glue.PARAM);
                const path = parts.at(0);
                const alias = placeholder.includes(Glue.PARAM) ? parts.at(1) : '';
                return new Repeating(path, blockTemplate, (item) => item, alias);
            };
        case BlockPrefix.TAB_INDENTED:
        case BlockPrefix.SPACE_INDENTED:
            return () => {
                const indentLevel = placeholder.includes(Glue.PARAM)
                    ? parseInt(placeholder.split(Glue.PARAM).at(1))
                    : 0;
                return new Indented(
                    blockTemplate,
                    prefix === BlockPrefix.TAB_INDENTED ? IndentType.TAB : IndentType.SPACE,
                    indentLevel
                );
            };
        case BlockPrefix.CACHED:
            return () => {
                const parts = placeholder.split(Glue.PARAM);
                const cacheName = 'cached_' + parts.at(0);
                if (!Object.hasOwn(this.#partials, cacheName)) {
                    this.#partials[cacheName] = new Cached(blockTemplate);
                }
                return this.#partials[cacheName];
            };
        default:
            throw new SyntaxError('unhandled prefix "' + prefix + '"');
        }
    }

}

export {Template};
