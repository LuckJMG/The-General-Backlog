/**
* @readonly
* @enum {string}
*/
const Column = {
	TITLE: "title",
	SCORE: "score",
	DURATION: "duration",
	PRIORITY: "priority",
};

class Entry {
	/**
	* @constructor
	* @param {string} title
	* @param {number} score
	* @param {number} duration
	*/
	constructor(title, score, duration) {
		/** @type {string} */
		this.title = title;

		/** @type {number} */
		this.score = score;

		/** @type {number} */
		this.duration = duration;

		/** @type {number} */
		this.priority = score / duration;
	}

	/**
	* @param {string} newTitle
	* @param {number} newScore
	* @param {number} newDuration
	*/
	edit(newTitle, newScore, newDuration) {
		this.title = newTitle;
		this.score = newScore;
		this.duration = newDuration;
		this.priority = newScore / newDuration;
	}

	/**
	* @static
	* @param {string} title
	* @returns {string}
	*/
	static getId(title) {
		return title.toLowerCase().replace(new RegExp(" ", "g"), "_");
	}
}

