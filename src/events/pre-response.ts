import Hapi from "@hapi/hapi";

import { config } from "../config";

export const onPreResponse = (
	request: Hapi.Request,
	h: Hapi.ResponseToolkit
) => {
	if (config.get("strategies.customHeader.enabled")) {
		const headerName = config.get("strategies.customHeader.parameter");

		const response: any = request.response;

		if (response.isBoom) {
			response.output.headers[headerName] = request.pre.version;
		} else {
			response.header(headerName, request.pre.version);
		}
	}

	return h.continue;
};
