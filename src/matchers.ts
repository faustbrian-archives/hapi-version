import Hapi from "@hapi/hapi";
import MediaType from "media-type";
import { config } from "./config";
import { caster } from "./helpers";

export function matchQuery(request: Hapi.Request) {
	return caster(request.query[config.get("strategies.query.parameter")]);
}

export function matchPath(request: Hapi.Request) {
	const pattern = new RegExp(config.get("strategies.path.pattern"));
	const match = pattern.exec(request.path);

	return match && match.length === 2 ? caster(match[1]) : null;
}

export function matchCustomHeader(request: Hapi.Request) {
	const strategy = config.get("strategies.customHeader");

	const versionHeader = request.headers[strategy.parameter];
	const pattern = new RegExp(strategy.pattern);

	return pattern.test(versionHeader) ? caster(versionHeader) : null;
}

export function matchAcceptHeader(request: Hapi.Request) {
	const standardsTree = config.get("strategies.acceptHeader.standardsTree");
	const pattern = new RegExp(`^${standardsTree}.[a-z][a-z0-9.!#$&^_-]{0,126}.v[0-9]+$`, "i");

	const media = MediaType.fromString(request.headers.accept);

	if (media.isValid()) {
		const subType = config.get("strategies.acceptHeader.subType");

		// 1. Check the accept header for IANA compliance
		if (pattern.test(media.subtype)) {
			const vendorFacets = media.subtypeFacets.slice(1, media.subtypeFacets.length - 1);
			const vendorName = vendorFacets.join(".");

			if (vendorName === subType) {
				return caster(media.subtypeFacets[media.subtypeFacets.length - 1].slice(1));
			}
		}

		// 2. Check the header for a version parameter
		const versionParam = media.parameters[config.get("strategies.acceptHeader.parameter")];
		if (versionParam && media.subtype.includes(subType)) {
			const vendorFacets = media.subtypeFacets.slice(1);
			const vendorName = vendorFacets.join(".");

			if (vendorName === subType) {
				return caster(versionParam);
			}
		}
	}

	return null;
}
