/**
 * Prints which hosting and provider variables are set. Values are never printed.
 * Exit 0 always: a missing variable is a report, not a crash.
 */
const checks: { name: string; present: boolean; neededFor: string }[] = [
  ["GEO_LAB_RUN_TOKEN", "the daily POST /api/run on a deployed lab"],
  ["GEO_LAB_OWNER_PASSWORD", "the first owner password; rotate it after sign-in"],
  ["GITHUB_TOKEN", "opening pull requests; never used to push main"],
  ["TAVILY_API_KEY", "conventional-search visibility (Tavily_api_key is also read)"],
  ["GEMINI_API_KEY", "Gemini grounded answers; must be an AIza key"],
  ["OPENAI_API_KEY", "OpenAI web search"],
  ["ANTHROPIC_API_KEY", "Claude web search"],
  ["PERPLEXITY_API_KEY", "Perplexity sonar"],
  ["XAI_API_KEY", "Grok web search"],
  ["LLM_PROVIDER", "optional generative calls; no vendor is assumed"],
].map(([name, neededFor]) => ({
  name: name === "TAVILY_API_KEY" ? "TAVILY_API_KEY" : name,
  present: name === "TAVILY_API_KEY" ? Boolean(process.env.TAVILY_API_KEY || process.env.Tavily_api_key) : Boolean(process.env[name]),
  neededFor,
}));

console.log("GEO Lab host check — values are not printed");
for (const row of checks) {
  console.log(`${row.present ? "set  " : "missing"}  ${row.name}  (${row.neededFor})`);
}
console.log("");
console.log("Hosting: not detectable from env. Do not deploy onto the Cloudflare Worker up2datewebsiteseo.");
console.log("A live URL needs an Oracle Always Free VM plus a tunnel for geo-lab.straightflushplumbingoc.com. See DEPLOYMENT.md.");
