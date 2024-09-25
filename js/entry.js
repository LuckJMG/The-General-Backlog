/**
* Column types
* @readonly
* @enum {string}
*/
const Column = {
	TITLE: "title",
	SCORE: "score",
	DURATION: "duration",
	PRIORITY: "priority",
};

/**
* An entry on the database
*/
class Entry {
	/**
	* @constructor
	* @param {string} title Title of the entry.
	* @param {number} score Score of the entry.
	* @param {number} duration Duration of the entry.
	*/
	constructor(title, score, duration) {
		/** Title of the entry. @type {string} */
		this.title = title;

		/** Score of the entry. @type {number} */
		this.score = score;

		/** Duration of the entry. @type {number} */
		this.duration = duration;

		/** Priority of the entry. @type {number} */
		this.priority = score / duration;
	}

	/**
	* Edit the info of the entry.
	* @param {string} newTitle New title of the entry.
	* @param {number} newScore New score of the entry.
	* @param {number} newDuration New duration of the entry.
	*/
	edit(newTitle, newScore, newDuration) {
		this.title = newTitle;
		this.score = newScore;
		this.duration = newDuration;
		this.priority = newScore / newDuration;
	}

	/**
	* Get unique id from the entry.
	* @static
	* @param {string} title Title to get id from.
	* @returns {string} Unique id of the entry.
	*/
	static getId(title) {
		return title.toLowerCase().replace(new RegExp(" ", "g"), "_");
	}
}

