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

/**
 * @implements {Block}
 */
class Repeating extends Block {
    /** @type {String} */
    #path;
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
     * @param {function} callback
     */
    constructor(path, repeatingBlock, callback) {
        super();
        this.#path = path;
        this.#repeatingBlock = repeatingBlock;
        this.#callback = callback;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        return paramFromPath(this.#path, params)
            .map((item) => {
                const itemParams = this.#callback ? this.#callback(item, params) : item;
                return this.#repeatingBlock.render(itemParams);
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

const jepy = {
    Block,
    Composite,
    Conditional,
    Placeholder,
    Repeating,
    Simple,
    Callback,
    Cached
};

export { jepy as default };
