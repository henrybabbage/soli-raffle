import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Keep Replit/low-memory builds from spawning too many webpack workers.
	experimental: {
		cpus: 1,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				port: "",
				pathname: "/images/**",
				search: "",
			},
		],
	},
};

export default nextConfig;
