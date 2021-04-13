import Joi from "@hapi/joi";

const allowedMethods = ["acceptHeader", "customHeader", "path", "query"];

export const schema = Joi.object({
	/**
	 * The base path used to build URIs.
	 */
	basePath: Joi.string().trim().min(1).default("/"),
	/**
	 * The default version if none is requested.
	 */
	versions: Joi.object({
		/**
		 * The versions that are allowed to be requested.
		 */
		allowed: Joi.array().items(Joi.number().integer()).min(1).default([1]),
		/**
		 * The default version if none is requested.
		 */
		default: Joi.any().valid(Joi.in("allowed")).default(1),
		/**
		 * The type of version which is usually a number.
		 */
		type: Joi.string().valid("string", "number").default("number"),
		/**
		 * The method used to validate the version.
		 */
		validation: Joi.function(),
	}).default(),
	/**
	 * The strategies used by the various matchers.
	 */
	strategies: Joi.object({
		/**
		 * The strategies that allowed to be used for version matching.
		 */
		allowed: Joi.array()
			.items(Joi.valid(...allowedMethods))
			.default(allowedMethods),
		/**
		 * The configuration for the accept header strategy.
		 */
		acceptHeader: Joi.object({
			/**
			 * The value to enable or disable this strategy.
			 */
			enabled: Joi.boolean().default(true),
			/**
			 * The name of the parameter that contains the version (non-IANA).
			 */
			parameter: Joi.string().trim().default("version"),
			/**
			 * The Standards Tree that correlates to the type of project.
			 */
			standardsTree: Joi.string().trim().default("vnd"),
			/**
			 * The subtype is typically a short name of your project, all lowercase.
			 */
			subType: Joi.string().trim().default("my-app"),
		}).default(),
		/**
		 * The configuration for the custom header strategy.
		 */
		customHeader: Joi.object({
			/**
			 * The value to enable or disable this strategy.
			 */
			enabled: Joi.boolean().default(true),
			/**
			 * The name of the parameter that contains the version (non-IANA).
			 */
			parameter: Joi.string().trim().default("x-api-version"),
			/**
			 * The regular expression used to match the version.
			 */
			pattern: Joi.string().default("^[0-9]+$"),
		}).default(),
		/**
		 * The configuration for the path segment strategy.
		 */
		path: Joi.object({
			/**
			 * The value to enable or disable this strategy.
			 */
			enabled: Joi.boolean().default(true),
			/**
			 * The name of the parameter that contains the version (non-IANA).
			 */
			parameter: Joi.string().trim().default("version"),
			/**
			 * The regular expression used to match the version.
			 */
			pattern: Joi.string().default("^/v([0-9])"),
		}).default(),
		/**
		 * The configuration for the query parameter strategy.
		 */
		query: Joi.object({
			/**
			 * The value to enable or disable this strategy.
			 */
			enabled: Joi.boolean().default(true),
			/**
			 * The name of the parameter that contains the version (non-IANA).
			 */
			parameter: Joi.string().trim().default("version"),
		}).default(),
	}).default(),
});
