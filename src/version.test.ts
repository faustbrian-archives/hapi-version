import Hapi from "@hapi/hapi";

import { plugin } from "../src";

let server: Hapi.Server;

const sendRequest = (url, headers = {}) => {
	server.route({
		method: "GET",
		path: "/",
		handler: () => [],
	});

	server.route({
		method: "GET",
		path: "/v1",
		handler: () => [],
	});

	server.route({
		method: "GET",
		path: "/v2",
		handler: () => [],
	});

	return server.inject({ method: "GET", url, headers });
};

beforeEach(async () => {
	server = new Hapi.Server({ debug: { request: ["*"] } });

	await server.register({
		plugin,
		options: {
			versions: {
				allowed: [1, 2],
				default: 2,
			},
		},
	});
});

describe("Version", () => {
	it("should return version default", async () => {
		const response = await sendRequest("/");

		expect(response.statusCode).toBe(200);
		expect(response.request.pre.version).toBe(2);
	});

	describe("Accept Header - IANA", () => {
		it("should return version 1", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app.v1+json",
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(1);
		});

		it("should return version 2", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app.v2+json",
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(2);
		});

		it("should return status code 400", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app.v3+json",
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe("Accept Header - Parameter", () => {
		it("should return version 1", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app+json; version=1",
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(1);
		});

		it("should return version 2", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app+json; version=2",
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(2);
		});

		it("should return status code 400", async () => {
			const response = await sendRequest("/", {
				Accept: "application/vnd.my-app+json; version=3",
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe("API-Version Header", () => {
		it("should return version 1", async () => {
			const response = await sendRequest("/", {
				"X-API-Version": 1,
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(1);
		});

		it("should return version 2", async () => {
			const response = await sendRequest("/", {
				"X-API-Version": 2,
			});

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(2);
		});

		it("should return status code 400", async () => {
			const response = await sendRequest("/", {
				"X-API-Version": 3,
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe("Path", () => {
		it("should return version 1", async () => {
			const response = await sendRequest("/v1");

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(1);
		});

		it("should return version 2", async () => {
			const response = await sendRequest("/v2");

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(2);
		});

		it("should return status code 400", async () => {
			const response = await sendRequest("/v3");

			expect(response.statusCode).toBe(400);
		});
	});

	describe("Query", () => {
		it("should return version 1", async () => {
			const response = await sendRequest("/?version=1");

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(1);
			// @ts-ignore
			expect(response.request.query.version).toBe("1");
		});

		it("should return version 2", async () => {
			const response = await sendRequest("/?version=2");

			expect(response.statusCode).toBe(200);
			expect(response.request.pre.version).toBe(2);
			// @ts-ignore
			expect(response.request.query.version).toBe("2");
		});

		it("should return status code 400", async () => {
			const response = await sendRequest("/?version=3");

			expect(response.statusCode).toBe(400);
		});
	});
});
