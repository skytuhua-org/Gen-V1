import {z} from 'zod';

export const devServerSchema=z.strictObject({
 id:z.string(),projectId:z.string(),threadId:z.string().nullable(),threadTitle:z.string().nullable(),
 terminalId:z.string(),url:z.string().url(),port:z.number().int().min(1024).max(65535),
 label:z.string().max(120),source:z.enum(['script','terminal']),scriptName:z.string().nullable(),
 startedAt:z.string(),detectedAt:z.string(),
});
export const devServerListSchema=z.strictObject({items:z.array(devServerSchema).max(32)});
export type DevServer=z.infer<typeof devServerSchema>;
