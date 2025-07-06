var jepy = (function () {
    'use strict';

    /**
     * @interface
     */
    class Block {
        /**
         * @abstract
         * @param {Object} params
         * @return {String}
         */
        render() {}
    }

    /**
     * @implements {Block}
     */
    class Composite extends Block {
        /** @type {Array<Block>} */
        #blocks;

        /**
         * @param {Array<Block>} blocks
         */
        constructor(blocks) {
            super();
            this.#blocks = blocks;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            return this.#blocks.map((block) => block.render(params)).join('');
        }
    }

    /**
     * @implements {Block}
     */
    class Conditional extends Block {
        /**
         * @type {function}
         * @param {Object} params
         */
        #conditionCallback;
        /** @type {Block} */
        #blockOnTrue;
        /** @type {Block} */
        #blockOnFalse;

        /**
         * @param {function} conditionCallback
         * @param {Block} blockOnTrue
         * @param {Block} blockOnFalse
         */
        constructor(conditionCallback, blockOnTrue, blockOnFalse) {
            super();
            this.#conditionCallback = conditionCallback;
            this.#blockOnTrue = blockOnTrue;
            this.#blockOnFalse = blockOnFalse;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            const isTrue = this.#conditionCallback(params);
            if (isTrue) {
                return this.#blockOnTrue.render(params);
            }
            return this.#blockOnFalse ? this.#blockOnFalse.render(params) : '';
        }
    }

    /**
     * @enum {String}
     */
    const Glue = {
        PATH: '.',
        PARAM: ':',
        FILTER: '|',
    };

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

    /**
     * @implements {Block}
     */
    class Repeating extends Block {
        /** @type {String} */
        #path;
        /** @type {String} */
        #alias;
        /** @type {Block} */
        #repeatingBlock;
        /**
         * @type {function}
         * @param {*} item
         * @param {Object} params
         */
        #callback;

        /**
         * @param {String} path
         * @param {Block} repeatingBlock
         * @param {function} [callback]
         * @param {String} [alias]
         */
        constructor(path, repeatingBlock, callback, alias = '') {
            super();
            this.#path = path;
            this.#repeatingBlock = repeatingBlock;
            this.#callback = callback;
            this.#alias = alias;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            let items = paramFromPath(this.#path, params);
            const size = items.length;
            const lastIndex = size - 1;
            return items
                .map((item, index) => {
                    if (this.#alias) {
                        item = {
                            [this.#alias]: item,
                        };
                    }
                    if (this.#callback) {
                        item = this.#callback(item, params);
                    }
                    let loopParams = Object.assign({}, params, item);
                    loopParams.loop = {
                        index,
                        first: index === 0,
                        last: index === lastIndex,
                        number: index + 1,
                        size,
                    };
                    return this.#repeatingBlock.render(loopParams);
                })
                .join('');
        }
    }

    /**
     * @implements {Block}
     */
    class Simple extends Block {
        /** @type {String} */
        #content;

        /**
         * @param {String} content
         */
        constructor(content) {
            super();
            this.#content = content;
        }

        /**
         * @override
         * @return {String}
         */
        render() {
            return this.#content;
        }
    }

    /**
     * @implements {Block}
     */
    class Callback extends Block {
        /**
         * @type {function}
         * @param {Object} params
         */
        #renderCallback;

        /**
         * @param {function} renderCallback
         */
        constructor(renderCallback) {
            super();
            this.#renderCallback = renderCallback;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            return this.#renderCallback(params);
        }
    }

    /**
     * @implements {Block}
     */
    class Cached extends Block {
        /** @type {Block} */
        #blockToCache;
        /**
         * @type {function}
         * @param {Object} params
         * @param {Cached} block
         */
        #validationCallback;
        /** @type {String} */
        #cachedValue = null;
        /** @type {Object} */
        #cachedParams = {};

        /**
         * @param {Block} blockToCache
         * @param {function} validationCallback
         */
        constructor(blockToCache, validationCallback) {
            super();
            this.#blockToCache = blockToCache;
            this.#validationCallback = validationCallback ? validationCallback : () => true;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            const isValid =
                this.#cachedValue !== null && this.#validationCallback(params, this.#cachedParams);
            if (!isValid) {
                this.#cachedValue = this.#blockToCache.render(params);
            }
            this.#cachedParams = params;
            return this.#cachedValue;
        }
    }

    /**
     * @enum {String}
     */
    const IndentType = {
        SPACE: ' ',
        TAB: '\t',
    };

    /**
     * @implements {Block}
     */
    class Indented extends Block {
        /** @type {Block} */
        #block;
        /** @type {IndentType} */
        #indentType;
        /** @type {Number} */
        #indentLevel;

        /**
         * @param {Block} block
         * @param {IndentType} indentType
         * @param {Number} indentLevel
         */
        constructor(block, indentType, indentLevel) {
            super();
            this.#block = block;
            this.#indentType = indentType;
            this.#indentLevel = indentLevel;
        }

        /**
         * @override
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            const indent = String().padStart(this.#indentLevel, this.#indentType);
            const content = this.#block.render(params);
            return content.replace(new RegExp('^', 'gm'), indent);
        }
    }

    /**
     * @enum {String}
     */
    const Prefix = {
        ESCAPED: '$',
        RAW: '%',
    };

    /**
     * @enum {String}
     */
    const BlockPrefix = {
        REPEATING: '#',
        CONDITIONAL: '?',
        TAB_INDENTED: '>',
        SPACE_INDENTED: '_',
        CACHED: '=',
    };

    /**
     * @enum {String}
     */
    const Bracket = {
        OPEN: '{',
        CLOSE: '}',
    };

    /**
     * @enum {String}
     */
    const Operator = {
        NULL: '',
        NOT: '!',
        PARTIAL: '@',
    };

    /**
     * @enum {String}
     */
    const GenericFilter = {
        STRINGIFY: 'stringify',
    };
    /**
     * @enum {String}
     */
    const StringFilter = {
        UPPER: 'upper',
        LOWER: 'lower',
        CAPITALIZE: 'capitalize',
        TRIM: 'trim',
    };
    /**
     * @enum {String}
     */
    const NumberFilter = {
        ABS: 'abs',
        ROUND: 'round',
        FLOOR: 'floor',
        CEIL: 'ceil',
    };
    /**
     * @enum {String}
     */
    const ArrayFilter = {
        FIRST: 'first',
        LAST: 'last',
        MIN: 'min',
        MAX: 'max',
    };

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
                    '\\|]*)(\\' +
                    Glue.FILTER +
                    '(?<filter>[^\\' +
                    Bracket.CLOSE +
                    '\\|]+))?\\' +
                    Bracket.CLOSE +
                    ')',
                'm',
            );
            let tag;
            while ((tag = tagPattern.exec(content))) {
                let param = this.#paramFromPath(tag.groups.path, params);
                if (tag.groups.filter) {
                    param = this.#applyFilter(tag.groups.filter, param);
                }
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
         * @param {Filter} filter
         * @param {*} param
         * @return {String}
         */
        #applyFilter(filter, param) {
            switch (filter) {
            case GenericFilter.STRINGIFY:
                return JSON.stringify(param);
            case StringFilter.LOWER:
                return param.toLowerCase();
            case StringFilter.UPPER:
                return param.toUpperCase();
            case StringFilter.CAPITALIZE:
                return param.at(0).toUpperCase() + param.slice(1);
            case StringFilter.TRIM:
                return param.trim();
            case NumberFilter.ABS:
                return Math.abs(parseFloat(param));
            case NumberFilter.ROUND:
                return Math.round(parseFloat(param));
            case NumberFilter.FLOOR:
                return Math.floor(parseFloat(param));
            case NumberFilter.CEIL:
                return Math.ceil(parseFloat(param));
            case ArrayFilter.FIRST:
                return param.at(0);
            case ArrayFilter.LAST:
                return param.at(-1);
            case ArrayFilter.MIN:
                return Math.min(...param);
            case ArrayFilter.MAX:
                return Math.max(...param);
            default:
                throw new SyntaxError('unhandled filter "' + filter + '"');
            }
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

    const jepy = {
        Block,
        Composite,
        Conditional,
        Repeating,
        Simple,
        Callback,
        Cached,
        IndentType,
        Indented,
        Template,
    };

    return jepy;

})();
