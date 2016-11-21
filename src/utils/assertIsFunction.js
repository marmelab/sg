import isGenerator from './isGenerator';

export default (fn) => {
    if (typeof fn === 'function' && !isGenerator(fn)) {
        return true;
    }
    if (isGenerator(fn)) {
        throw new Error('Expected generator function to be a function');
    }

    throw new Error(`Expected ${typeof fn} to be a function`);
};
