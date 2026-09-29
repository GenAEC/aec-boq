import { get, set } from 'idb-keyval';
import type { BOQProjectFile } from '../types/boq';

const STORAGE_KEY = 'openboq_master_project';

export async function saveProjectLocally(project: BOQProjectFile): Promise<void> {
    await set(STORAGE_KEY, project);
}

export async function loadProjectLocally(): Promise<BOQProjectFile | null> {
    const data = await get<BOQProjectFile>(STORAGE_KEY);
    return data || null;
}