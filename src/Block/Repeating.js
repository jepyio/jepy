import {Block} from '../Block.js';
import {paramFromPath} from '../params.js';

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
         * @param {*} params
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

export {Repeating};
