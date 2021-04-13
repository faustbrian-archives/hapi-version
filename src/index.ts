import { Server } from "@hapi/hapi";

import { config } from "./config";
import { onPreResponse } from "./events/pre-response";
import { onRequest } from "./events/request";

export const plugin = {
	pkg: require("../package.json"),
	once: true,
	register: (server: Server, options = {}) => {
		// Configure...
		config.load(options);

		if (config.hasError()) {
			throw config.getError();
		}

		// Extend...
		server.ext("onRequest", onRequest);
		server.ext("onPreResponse", onPreResponse);
	},
};
