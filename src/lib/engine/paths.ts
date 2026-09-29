export const getParentPath = (path: string): string | null => {
    const parts = path.split('/');
    if (parts.length <= 1) return null;
    parts.pop();
    return parts.join('/');
};

export const getDepth = (path: string): number => {
    return path.split('/').length - 1;
};

export const isDescendant = (parentPath: string, candidateChildPath: string): boolean => {
    return candidateChildPath.startsWith(parentPath + '/');
};

/**
 * Generate next child path under a parent section
 */
export const getNextChildPath = (parentPath: string, existingPaths: string[]): string => {
    const prefix = parentPath + '/';
    const directChildren = existingPaths.filter(
        (p) => p.startsWith(prefix) && p.split('/').length === parentPath.split('/').length + 1
    );

    let maxIdx = 0;
    for (const p of directChildren) {
        const lastSeg = p.split('/').pop() || '0';
        const num = parseInt(lastSeg, 10);
        if (!isNaN(num) && num > maxIdx) maxIdx = num;
    }
    return `${parentPath}/${String(maxIdx + 1).padStart(2, '0')}`;
};

/**
 * Generate next root sibling path
 */
export const getNextRootPath = (existingPaths: string[]): string => {
    const rootPaths = existingPaths.filter((p) => !p.includes('/'));
    let maxIdx = 0;
    for (const p of rootPaths) {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num > maxIdx) maxIdx = num;
    }
    return String(maxIdx + 1).padStart(2, '0');
};