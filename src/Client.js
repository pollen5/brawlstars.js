const ladybug = require("ladybug-fetch");
const Club = require("./structures/Club.js");
const Player = require("./structures/Player.js");
const { clean, validate } = require("./utils");

/**
 * https://brawlapi.cf/api/events?type=current
 * https://brawlapi.cf/api/events?type=upcoming
 * https://brawlapi.cf/api/leaderboards/players?brawler=shelly&count=20
 * https://brawlapi.cf/api/leaderboards/players?count=20
 * https://brawlapi.cf/api/leaderboards/clubs?count=20
 */

/**
 * Represents a client interacting with the API.
 * @constructor
 * @param {any} [options] Optional object of options
 * @param {String} options.token - The Authorization token to use.
 */
class Client {
  constructor(options = {}) {
    if(!options.token) throw new Error("Missing Authorization Token.");

    /**
     * The token used for requests.
     * @type {String}
     * @private
     */
    Object.defineProperty(this, "token", { value: options.token });
  }

  _get(endpoint, query = {}) {
    return ladybug(`https://brawlapi.cf/api/${endpoint}`)
      .query(query)
      .set("Authorization", this.token)
      .then((res) => res.body);
  }

  /**
   * Gets a list of all endpoints in the api
   * @returns {Promise<Array<string>>} Array of endpoints
   */
  getEndpoints() {
    return this._get("").then((res) => res.data.endpoints);
  }

  /**
   * Gets a player by tag.
   * @param {String} tag - The tag to request.
   * @returns {Promise<Player>} The Requested Player
   */
  getPlayer(tag) {
    if(!validate(tag)) return Promise.reject(new Error("Invalid Tag."));
    return this._get("player", { tag: clean(tag) })
      .then((res) => new Player(this, res));
  }

  /**
   * Gets a club by tag.
   * @param {String} tag - The tag to request.
   * @returns {Promise<Band>} The Requested Band
   */
  getClub(tag) {
    if(!validate(tag)) return Promise.reject(new Error("Invalid Tag."));
    return this._get("club", { tag: clean(tag) })
      .then((res) => new Club(this, res));
  }

  /**
   * Returns some info about the API.
   * @returns {Promise<any>} Info
   */
  about() {
    return this._get("about");
  }

  /**
   * Gets top players
   * @param {Object} [options] - Options to custumize response.
   * @param {String} [options.brawler] - Brawler name to filter response with.
   * @param {Number} [options.count] - Limit the number of responses returned.
   * @returns {Promise<Array<Player>>} The Top Players
   */
  getTopPlayers({ count, brawler } = {}) {
    if(count && isNaN(count))
      return Promise.reject(new TypeError("Count must be a number."));
    const query = {};
    if(count) query["count"] = count;
    if(brawler) query["brawler"] = brawler;
    return this._get("/leaderboards/players", query)
      .then((res) => res.map((player) => new Player(this, player)));
  }

  /**
   * Returns top bands.
   * @param {Number} [count] - Limit of bands to fetch, leave empty for all.
   * @returns {Promise<Array<Band>>} The Top Bands
   */
  getTopClubs(count) {
    if(count && isNaN(count))
      return Promise.reject(new TypeError("Count must be a number."));
    const query = {};
    if(count) query["count"] = count;
    return this._get("/leaderboards/clubs", query)
      .then((res) => res.map((club) => new Club(this, club)));
  }

  _events(type) {
    return this._get("events", { type });
  }

  /**
   * Gets upcoming events.
   * @returns {Promise<any>} The Events Data
   */
  getUpcomingEvents() {
    return this._events("upcoming");
  }

  /**
   * Gets the current events.
   * @returns {Promise<any>} The Events Data
   */
  getCurrentEvents() {
    return this._events("current");
  }

  /**
   * Gets some misc data, such as season and shop reset time.
   * @returns {Promise<any>}
   */
  getMisc() {
    return this._get("misc");
  }

  /**
   * Searches clubs with a query.
   * @param {String} query - The query to search for.
   * @returns {Array<Club>}
   */
  clubSearch(query) {
    return this._get("clubSearch", { query })
      .then((res) => res.map((club) => new Club(this, club)));
  }
}

module.exports = Client;
