import { getEntries } from '$lib/entry';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	// Paging
	let page = Number(url.searchParams.get('page')) || 1;
	let pageSize = Number(url.searchParams.get('limit')) || 10;

	// Sorting
	let sortBy = url.searchParams.get('sortBy') || 'priority';
	let sortDir = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

	// Hard coded for testing pourpuses, next step is using params
    const backlogId = 1; 

    const paginatedResult = await getEntries(backlogId, page, pageSize, sortBy, sortDir);

    return {
        entries: paginatedResult
    };
};

