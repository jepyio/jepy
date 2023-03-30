var jepy = (function () {
    'use strict';

    /**
     * @interface
     */
    class Block {
        /**
         * @abstract
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render() {}
    }

    /**
     * @implements {Block}
     */
    class Composite extends Block {
        /**
         * @param {Array<Block>} blocks
         */
        constructor(blocks) {
            super();
            /** @type {Array<Block>} */
            this.blocks_ = blocks;
        }

        /**
         * @override
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            return this.blocks_.map((block) => block.render(params)).join('');
        }
    }

    /**
     * @implements {Block}
     */
    class Conditional extends Block {
        /**
         * @param {function} conditionCallback
         * @param {Block} blockOnTrue
         * @param {Block} blockOnFalse
         */
        constructor(conditionCallback, blockOnTrue, blockOnFalse) {
            super();
            /**
             * @type {function}
             * @param {Object} params
             */
            this.conditionCallback_ = conditionCallback;
            /** @type {Block} */
            this.blockOnTrue_ = blockOnTrue;
            /** @type {Block} */
            this.blockOnFalse_ = blockOnFalse;
        }

        /**
         * @override
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            const isTrue = this.conditionCallback_(params);
            if (isTrue) {
                return this.blockOnTrue_.render(params);
            }
            return this.blockOnFalse_ ? this.blockOnFalse_.render(params) : '';
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

    /**
     * @implements {Block}
     */
    class Repeating extends Block {
        /**
         * @param {String} path
         * @param {Block} repeatingBlock
         * @param {function} callback
         */
        constructor(path, repeatingBlock, callback) {
            super();
            /** @type {String} */
            this.path_ = path;
            /** @type {Block} */
            this.repeatingBlock_ = repeatingBlock;
            /**
             * @type {function}
             * @param {*} item
             * @param {Object} params
             */
            this.callback_ = callback;
        }

        /**
         * @override
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            return paramFromPath(this.path_, params)
                .map((item) => {
                    const itemParams = this.callback_ ? this.callback_(item, params) : item;
                    return this.repeatingBlock_.render(itemParams);
                })
                .join('');
        }
    }

    /**
     * @implements {Block}
     */
    class Simple extends Block {
        /**
         * @param {String} content
         */
        constructor(content) {
            super();
            /** @type {String} */
            this.content_ = content;
        }

        /**
         * @override
         * @public
         * @function
         * @return {String}
         */
        render() {
            return this.content_;
        }
    }

    /**
     * @implements {Block}
     */
    class Callback extends Block {
        /**
         * @param {function} renderCallback
         */
        constructor(renderCallback) {
            super();
            /**
             * @type {function}
             * @param {Object} params
             */
            this.renderCallback_ = renderCallback;
        }

        /**
         * @override
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            return this.renderCallback_(params);
        }
    }

    /**
     * @implements {Block}
     */
    class Cached extends Block {
        /**
         * @param {Block} blockToCache
         * @param {function} validationCallback
         */
        constructor(blockToCache, validationCallback) {
            super();
            /** @type {Block} */
            this.blockToCache_ = blockToCache;
            /**
             * @type {function}
             * @param {Object} params
             * @param {Cached} block
             */
            this.validationCallback_ = validationCallback
                ? validationCallback
                : () => true;
            /** @type {String} */
            this.cachedValue_ = null;
        }

        /**
         * @override
         * @public
         * @function
         * @param {Object} params
         * @return {String}
         */
        render(params) {
            const isValid = this.cachedValue_ !== null
                && this.validationCallback_(params, this);
            if (!isValid) {
                this.cachedValue_ = this.blockToCache_.render(params);
            }
            return this.cachedValue_;
        }
    }

    const jepy = {
        Composite,
        Conditional,
        Placeholder,
        Repeating,
        Simple,
        Callback,
        Cached
    };

    return jepy;

})();
