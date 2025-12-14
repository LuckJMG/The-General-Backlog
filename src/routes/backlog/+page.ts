import { getEntries } from '$lib/entry';
import { getBacklogs } from '$lib/backlog';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	// Backlog
	let backlogs = await getBacklogs();
	let urlBacklogId = Number(url.searchParams.get('backlog'));
	let activeBacklog = backlogs.find(b => b.id === urlBacklogId) || backlogs[0] || null;

	// Paging
	let page = Number(url.searchParams.get('page')) || 1;
	let pageSize = Number(url.searchParams.get('limit')) || 10;

	// Sorting
	let sortBy = url.searchParams.get('sortBy') || 'priority';
	let sortDir = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    let paginatedResult = activeBacklog
		? await getEntries(activeBacklog.id, page, pageSize, sortBy, sortDir)
		: { data: [], total: 0, page: 1, pageSize: 10 };  // Fallback

    return {
		backlogs,
		activeBacklog,
        entries: paginatedResult
    };
};

