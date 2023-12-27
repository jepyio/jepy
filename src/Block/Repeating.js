import {Block} from '../Block.js';
import {paramFromPath} from '../params.js';

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

export {Repeating};
