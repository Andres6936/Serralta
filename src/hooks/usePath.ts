import * as path from 'node:path'

const base = import.meta.env.BASE_URL;

export function usePath(pathOf?: string) {
    if (pathOf) {
        return path.join(base, pathOf);
    } else {
        return base;
    }
}