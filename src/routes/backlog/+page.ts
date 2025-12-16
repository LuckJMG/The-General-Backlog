import { getEntries } from '$lib/entry';
import { getBacklogs } from '$lib/backlog';
import type { PageLoad } from './$types';
import type { EntryInterest, EntryStatus } from '$lib/types/db';

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

	// Search
	let search = (url.searchParams.get('search') || '').trim();

	// Filters
	let statusFilter = url.searchParams.get('status') as EntryStatus || null;
	let interestFilter = url.searchParams.get('interest') as EntryInterest || null;

    let paginatedResult = activeBacklog
		? await getEntries(
			activeBacklog.id,
			page,
			pageSize,
			sortBy,
			sortDir,
			search,
			statusFilter,
			interestFilter
		)
		: { data: [], total: 0, page: 1, pageSize: 10 };  // Fallback

    return {
		backlogs,
		activeBacklog,
        entries: paginatedResult
    };
};

