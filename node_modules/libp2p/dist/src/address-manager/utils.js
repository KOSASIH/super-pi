export function debounce(func, wait) {
    let timeout;
    return function () {
        const later = function () {
            timeout = undefined;
            func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
//# sourceMappingURL=utils.js.map