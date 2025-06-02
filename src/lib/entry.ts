export class Entry {
	id: string;
	title: string;
	score: number;
	duration: number;
	priority: number;

	constructor(title: string, score: number, duration: number) {
		this.id = Entry.getId(title);
		this.title = title;
		this.score = score;
		this.duration = duration;
		this.priority = score / duration;
	}

	static getId(title: string) {
		return title.toLowerCase().replace(" ", "_")
	}
}
