import {Block} from '../Block.js';
import {paramFromPath} from '../params.js';

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

export {Repeating};
