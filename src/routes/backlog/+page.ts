import { getEntries } from '$lib/entry';

export const load = async () => {
	// Hard coded for testing pourpuses, next step is using params
    const backlogId = 1; 

    const entries = await getEntries(backlogId);

    return {
        entries
    };
};

