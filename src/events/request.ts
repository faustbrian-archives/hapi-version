import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import { stringify } from "querystring";

import { config } from "../config";
import { isValid } from "../helpers";
import {
	matchAcceptHeader,
	matchCustomHeader,
	matchPath,
	matchQuery,
} from "../matchers";

const buildUri = (request, version, pathContainsVersion) => {
	const basePath = config.get("basePath");

	const versionedPath = pathContainsVersion
		? `${basePath}${request.path.slice(basePath.length - 1)}`
		: `${basePath}v${version}${request.path.slice(basePath.length - 1)}`;

	const method =
		request.method === "options"
			? request.headers["access-control-request-method"]
			: request.method;
	const route = request.server.match(method, versionedPath);

	if (!route) {
		return;
	}

	if (route.path.indexOf(`${basePath}v${version}/`) === 0) {
		const fullPath = `${basePath}v${version}${request.path.slice(
			basePath.length - 1
		)}`;

		const hasQuery = Object.keys(request.query).length > 0;

		request.setUrl(
			hasQuery ? `${fullPath}?${stringify(request.query)}` : fullPath
		);
	}
};

export const onRequest = (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	let pathContainsVersion = false;
	let requestedVersion;

	if (config.get("strategies.customHeader.enabled")) {
		requestedVersion = matchCustomHeader(request);
	}

	if (
		!isValid(requestedVersion) &&
		config.get("strategies.acceptHeader.enabled")
	) {
		requestedVersion = matchAcceptHeader(request);
	}

	if (!isValid(requestedVersion) && config.get("strategies.query.enabled")) {
		requestedVersion = matchQuery(request);
	}

	if (!isValid(requestedVersion) && config.get("strategies.path.enabled")) {
		requestedVersion = matchPath(request);

		if (isValid(requestedVersion)) {
			pathContainsVersion = true;
		}
	}

	if (
		isValid(requestedVersion) &&
		!config.get("versions.allowed").includes(requestedVersion)
	) {
		return Boom.badRequest("The specified API version is not supported.");
	}

	if (!isValid(requestedVersion)) {
		requestedVersion = config.get("versions.default");
	}

	buildUri(request, requestedVersion, pathContainsVersion);

	request.pre.version = requestedVersion;

	return h.continue;
};
