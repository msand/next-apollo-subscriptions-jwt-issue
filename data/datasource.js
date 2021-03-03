const { RESTDataSource } = require("apollo-datasource-rest");

class UserAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://jsonplaceholder.typicode.com";
  }

  async getUsers() {
    return this.get(`users`);
  }
}

module.exports = UserAPI;
