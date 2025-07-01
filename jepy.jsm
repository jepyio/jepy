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
        const isValid = this.#cachedValue !== null && this.#validationCallback(params, this);
        if (!isValid) {
            this.#cachedValue = this.#blockToCache.render(params);
        }
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
        if (content.includes('\n')) {
            return indent + content.replace(new RegExp('\\n', 'g'), '\n' + indent);
        }
        return indent + content;
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
        if (!this.#content) {
            return '';
        }
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
                    '(?<path>[^\\' +
                    Bracket.CLOSE +
                    ']*)' +
                    '\\' +
                    Bracket.CLOSE,
                'gm',
            );
            const tags = content.matchAll(tagPattern);
            for (const tag of tags) {
                const param = callback(tag.groups.path);
                content = content.replaceAll(tag[0], this.#indentParam(param, tag.groups.indent));
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
                    '&#' + (match.charCodeAt(0) * 0x400 + match.charCodeAt(1) - 0x35fdc00) + ';',
            );
    }

    #build() {
        const escapedBlockPrefixes = Object.values(BlockPrefix).map(
            (blockPrefix) => '\\' + blockPrefix,
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
            'gm',
        );
        let counter = 0;
        let matches = [];
        let blockPartials = {};
        while ((matches = Array.from(this.#content.matchAll(blockPattern))).length > 0) {
            const block = matches[0];
            const blockId = 'block_' + counter;
            counter++;
            const blockPlaceholder =
                Prefix.RAW + Bracket.OPEN + Operator.PARTIAL + blockId + Bracket.CLOSE;
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
        switch (prefix) {
        case BlockPrefix.CONDITIONAL:
            return (params) => {
                let contentOnTrue = block.groups.content;
                let contentOnFalse = '';
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
                    contentOnFalse = contentParts[1];
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
                    new Template(contentOnFalse, partials),
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
                if (!Object.hasOwn(this.#partials, cacheName)) {
                    this.#partials[cacheName] = new Cached(
                        new Template(block.groups.content, partials),
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

export { jepy as default };
