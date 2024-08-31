import * as path from 'node:path'

const base = import.meta.env.BASE_URL;

export function usePath(pathOf: string) {
    return path.join(base, pathOf);
}