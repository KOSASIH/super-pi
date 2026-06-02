import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { RecordType } from '../index.js';
/**
 * This TTL will be used if the remote service does not return one
 */
export const DEFAULT_TTL = 60;
export function toDNSResponse(obj) {
    return {
        Status: obj.Status ?? 0,
        TC: obj.TC ?? obj.flag_tc ?? false,
        RD: obj.RD ?? obj.flag_rd ?? false,
        RA: obj.RA ?? obj.flag_ra ?? false,
        AD: obj.AD ?? obj.flag_ad ?? false,
        CD: obj.CD ?? obj.flag_cd ?? false,
        Question: (obj.Question ?? obj.questions ?? []).map((question) => {
            return {
                name: question.name,
                type: RecordType[question.type]
            };
        }),
        Answer: (obj.Answer ?? obj.answers ?? []).map((answer) => {
            return {
                name: answer.name,
                type: RecordType[answer.type],
                TTL: (answer.TTL ?? answer.ttl ?? DEFAULT_TTL),
                data: answer.data instanceof Uint8Array ? uint8ArrayToString(answer.data) : answer.data
            };
        })
    };
}
//# sourceMappingURL=to-dns-response.js.map