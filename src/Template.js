import {Block} from './Block.js';
import {Cached} from './Block/Cached.js';
import {Conditional} from './Block/Conditional.js';
import {Repeating} from './Block/Repeating.js';
import {Indented, IndentType} from './Block/Indented.js';
import {Simple} from './Block/Simple.js';
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
     * @param {String} content
     * @param {Object} [partials]
     */
    constructor(content, partials = {}) {
        this.#content = content;
        this.#partials = partials;
        this.#build();
    }

    /**
     * @override
     * @param {Object} [params]
     * @return {String}
     */
    render(params = {}) {
        let content = this.#content;
        const tagPattern = new RegExp(
            '(?<indent>[ \\t]*)(?<placeholder>(?<prefix>[\\' +
                Object.values(Prefix).join('\\') +
                '])\\' +
                Bracket.OPEN +
                '(?<path>[^\\' +
                Bracket.CLOSE +
                ']*)\\' +
                Bracket.CLOSE +
                ')',
            'm',
        );
        let tag;
        while ((tag = tagPattern.exec(content))) {
            let param = this.#paramFromPath(tag.groups.path, params);
            if (typeof param === 'string') {
                if (tag.groups.prefix === Prefix.ESCAPED) {
                    param = this.#escape(param);
                }
                if (tag.groups.indent && param.includes('\n')) {
                    param = param.replace(new RegExp('\\n', 'g'), '\n' + tag.groups.indent);
                }
            }
            content = content.replaceAll(tag.groups.placeholder, param);
        }
        return content;
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
                    '&#' + (match.charCodeAt(0) * 0x400 + match.charCodeAt(1) - 0x35fdc00) + ';',
            );
    }

    #build() {
        const blockPattern = new RegExp(
            '(?<prefix>[\\' +
                Object.values(BlockPrefix).join('\\') +
                '])' +
                '\\' +
                Bracket.OPEN +
                '(?<operator>[\\' +
                Operator.NOT +
                '])?' +
                '(?<placeholder>(?<name>[^\\' +
                Glue.PARAM +
                '\\' +
                Bracket.CLOSE +
                ']*)(?:\\' +
                Glue.PARAM +
                '[^\\' +
                Bracket.CLOSE +
                ']+)?)' +
                '\\' +
                Bracket.CLOSE +
                '(?<content>(.|\n)*?)\\k<prefix>\\' +
                Bracket.OPEN +
                '\\/\\k<name>' +
                '\\' +
                Bracket.CLOSE,
            'm',
        );
        let counter = 0;
        let block = [];
        let blockPartials = {};
        while ((block = blockPattern.exec(this.#content))) {
            const blockId = 'block_' + counter;
            counter++;
            const blockPlaceholder =
                Prefix.RAW + Bracket.OPEN + Operator.PARTIAL + blockId + Bracket.CLOSE;
            this.#content = this.#content.replace(block[0], blockPlaceholder);
            blockPartials[blockId] = this.#blockCallback(block);
        }
        this.#partials = Object.assign(this.#partials, blockPartials);
    }

    /**
     * @param {Object} block
     * @return {Function}
     */
    #blockCallback(block) {
        const prefix = block.groups.prefix;
        const placeholder = block.groups.placeholder;
        const partials = Object.assign({}, this.#partials);
        switch (prefix) {
        case BlockPrefix.CONDITIONAL:
            return (params) => {
                let contentOnTrue = block.groups.content;
                let blockOnFalse = new Simple('');
                const expectsFalse = block.groups.operator === Operator.NOT;
                const elseTag =
                        BlockPrefix.CONDITIONAL +
                        Bracket.OPEN +
                        (expectsFalse ? Operator.NULL : Operator.NOT) +
                        placeholder +
                        Bracket.CLOSE;
                const hasElseTag = contentOnTrue.includes(elseTag);
                if (hasElseTag) {
                    const contentParts = contentOnTrue.split(elseTag);
                    contentOnTrue = contentParts[0];
                    blockOnFalse = new Template(contentParts[1], partials);
                }
                return new Conditional(
                    () => {
                        const param = this.#paramFromPath(placeholder, params);
                        const isFalse =
                                !param ||
                                (Object.hasOwn(param, 'length') && param.length === 0) ||
                                (typeof param === 'object' && Object.keys(param).length === 0);
                        const isFulfilled =
                                (isFalse && expectsFalse) || (!isFalse && !expectsFalse);
                        return isFulfilled;
                    },
                    new Template(contentOnTrue, partials),
                    blockOnFalse,
                );
            };
        case BlockPrefix.REPEATING:
            return () => {
                const parts = placeholder.split(Glue.PARAM);
                const path = parts.at(0);
                const alias = placeholder.includes(Glue.PARAM) ? parts.at(1) : '';
                return new Repeating(
                    path,
                    new Template(block.groups.content, partials),
                    (item) => item,
                    alias,
                );
            };
        case BlockPrefix.TAB_INDENTED:
        case BlockPrefix.SPACE_INDENTED:
            return () => {
                const indentLevel = placeholder.includes(Glue.PARAM)
                    ? parseInt(placeholder.split(Glue.PARAM).at(1))
                    : 0;
                return new Indented(
                    new Template(block.groups.content, partials),
                    prefix === BlockPrefix.TAB_INDENTED ? IndentType.TAB : IndentType.SPACE,
                    indentLevel,
                );
            };
        case BlockPrefix.CACHED:
            return () => {
                const parts = placeholder.split(Glue.PARAM);
                const cacheName = 'cached_' + parts.at(0);
                const validationCallback = placeholder.includes(Glue.PARAM)
                    ? (params, cachedParams) => {
                        const path = parts.at(1);
                        if (path.startsWith(Operator.PARTIAL)) {
                            return paramFromPath(path.slice(1), this.#partials)(
                                params,
                                cachedParams,
                            );
                        }
                        return paramFromPath(path, params);
                    }
                    : () => true;
                if (!Object.hasOwn(this.#partials, cacheName)) {
                    this.#partials[cacheName] = new Cached(
                        new Template(block.groups.content, partials),
                        validationCallback,
                    );
                }
                return this.#partials[cacheName];
            };
        default:
            throw new SyntaxError('unhandled prefix "' + prefix + '"');
        }
    }
}

export {Template};
