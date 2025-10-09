export type SelectType = { label: string, badgeClass: string }

export const Status = {
	BLOCKED: {
		label: 'Blocked',
		badgeClass: 'bg-red-100 text-red-800 border-red-200'
	},
	PENDING: {
		label: 'Pending',
		badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
	},
	IN_PROGRESS: {
		label: 'In Progress',
		badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
	},
	TO_REVIEW: {
		label: 'To Review',
		badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
	},
	COMPLETED: {
		label: 'Completed',
		badgeClass: 'bg-green-100 text-green-800 border-green-200'
	},
	HUNDRED_PERCENT: {
		label: '100%',
		badgeClass: 'bg-green-100 text-green-800 border-green-200'
	}
};

export class Entry {
	title: string;
	score: number;
	duration: number;
	priority: number;
	status: SelectType;

	constructor(title: string, score: number, duration: number, status: SelectType=Status.PENDING) {
		this.title = title;
		this.score = score;
		this.duration = duration;
		this.priority = score / duration;
		this.status = status;
	}

	static getID(title: string) {
		return title.toLowerCase().replace(" ", "_")
	}

	getID() {
		return Entry.getID(this.title);
	}
}
