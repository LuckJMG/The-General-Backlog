export class Entry {
	title: string;
	score: number;
	duration: number;
	priority: number;

	constructor(title: string, score: number, duration: number) {
		this.title = title;
		this.score = score;
		this.duration = duration;
		this.priority = score / duration;
	}

	static getID(title: string) {
		return title.toLowerCase().replace(" ", "_")
	}

	getID() {
		return Entry.getID(this.title);
	}
}
