
export default (fn) => {
    if (typeof fn === 'function') {
        return true;
    }

    throw new Error(`Expected ${typeof fn} to be callable`);
};
