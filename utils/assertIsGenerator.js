import isGenerator from './isGenerator';

export default (fn) => {
    if (isGenerator(fn)) {
        return true;
    }

    throw new Error(`Expected ${typeof fn} to be a generator function`);
};
