import { getEntries } from '$lib/entry';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('limit')) || 10;

	// Hard coded for testing pourpuses, next step is using params
    const backlogId = 1; 

    const paginatedResult = await getEntries(backlogId, page, pageSize);

    return {
        entries: paginatedResult
    };
};

