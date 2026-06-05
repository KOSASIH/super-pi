import { Resolver } from 'dns/promises';
import { RecordType } from '../index.js';
import { getTypes } from '../utils/get-types.js';
import { toDNSResponse } from '../utils/to-dns-response.js';
const nodeResolver = async (fqdn, options = {}) => {
    const resolver = new Resolver();
    const listener = () => {
        resolver.cancel();
    };
    const types = getTypes(options.types);
    try {
        options.signal?.addEventListener('abort', listener);
        const answers = await Promise.all(types.map(async (type) => {
            if (type === RecordType.A) {
                return mapToAnswers(fqdn, type, await resolver.resolve4(fqdn));
            }
            if (type === RecordType.CNAME) {
                return mapToAnswers(fqdn, type, await resolver.resolveCname(fqdn));
            }
            if (type === RecordType.TXT) {
                return mapToAnswers(fqdn, type, await resolver.resolveTxt(fqdn));
            }
            if (type === RecordType.AAAA) {
                return mapToAnswers(fqdn, type, await resolver.resolve6(fqdn));
            }
            throw new TypeError('Unsupported DNS record type');
        }));
        return toDNSResponse({
            Question: types.map(type => ({
                name: fqdn,
                type
            })),
            Answer: answers.flat()
        });
    }
    finally {
        options.signal?.removeEventListener('abort', listener);
    }
};
export function defaultResolver() {
    return [
        nodeResolver
    ];
}
function mapToAnswer(name, type, data) {
    return {
        name,
        type,
        data
    };
}
function mapToAnswers(name, type, data) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    return data.map(data => {
        if (Array.isArray(data)) {
            return data.map(data => mapToAnswer(name, type, data));
        }
        return mapToAnswer(name, type, data);
    })
        .flat();
}
//# sourceMappingURL=default.js.map