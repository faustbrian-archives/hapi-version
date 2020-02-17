import { config } from "./config";

export const caster = version => (config.get("versions.type") === "number" ? +version : version);

export const isValid = version => {
	if (!version) {
		return false;
	}

	return config.get("versions.validation", Number.isInteger)(version);
};
