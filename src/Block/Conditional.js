import {Block} from '../Block.js';

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
         * @param {*} params
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

export {Conditional};
