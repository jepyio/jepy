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
        return items
            .map((item) => {
                if (this.#alias) {
                    item = Object.defineProperty({}, this.#alias, {
                        value: item
                    });
                }
                if (this.#callback) {
                    item = this.#callback(item, params);
                }
                return this.#repeatingBlock.render(Object.assign(item, params));
            })
            .join('');
    }
}

export {Repeating};
