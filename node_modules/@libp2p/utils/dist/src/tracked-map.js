class TrackedMap extends Map {
    metric;
    constructor(init) {
        super();
        const { name, metrics } = init;
        this.metric = metrics.registerMetric(name);
        this.updateComponentMetric();
    }
    set(key, value) {
        super.set(key, value);
        this.updateComponentMetric();
        return this;
    }
    delete(key) {
        const deleted = super.delete(key);
        this.updateComponentMetric();
        return deleted;
    }
    clear() {
        super.clear();
        this.updateComponentMetric();
    }
    updateComponentMetric() {
        this.metric.update(this.size);
    }
}
export function trackedMap(config) {
    const { name, metrics } = config;
    let map;
    if (metrics != null) {
        map = new TrackedMap({ name, metrics });
    }
    else {
        map = new Map();
    }
    return map;
}
//# sourceMappingURL=tracked-map.js.map