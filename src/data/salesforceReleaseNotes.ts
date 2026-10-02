import type { UpdateCard } from "./intelMock";

/**
 * Winter '27 (release 264) "What shipped" source.
 *
 * Content is drawn from the Salesforce help release notes landing page for
 * release 264, which groups the top Winter '27 innovations. Each entry below
 * maps a highlighted feature from that page into the agency portal's
 * UpdateCard shape so the "What shipped" tab reads from a single, cited
 * source instead of the generic SaaS/API/DS/Infra/Media mocks.
 *
 * Source: https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&language=en_US&type=5&release=264
 */
export const SALESFORCE_RELEASE_NOTES = {
  id: "sf-winter-27-264",
  label: "Salesforce Winter '27 Release Notes",
  release: "264",
  releaseLabel: "Winter ’27",
  gaDate: "12 Oct 2026",
  sourceName: "help.salesforce.com",
  sourceUrl:
    "https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&language=en_US&type=5&release=264",
} as const;

export const SALESFORCE_FETCH_STEPS = [
  "Connecting to help.salesforce.com…",
  "Reading Winter ’27 release 264 notes…",
  "Extracting feature highlights…",
  "Ranking by client relevance…",
];

/**
 * Shipped Winter '27 features from the release 264 notes.
 * Client mapping leans on the two prototype clients:
 *   - aether (telecom / network operations) picks up voice contact centre
 *     and autonomous field-service dispatch.
 *   - hexworth (streaming / media / partner hub) picks up commerce search,
 *     partner + renewal quoting, and agentic marketing activation.
 * Everything else is left as a shared release note (client: null).
 */
export const SALESFORCE_SHIPPED: UpdateCard[] = [
  {
    id: "sf-264-slack-code",
    type: "platform",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Slack Code: multiplayer agentic coding in Slack",
    description:
      "Dedicated code channels let developers, product, design, and nontechnical teammates write, review, and ship code with AI agents side by side.",
    client: null,
  },
  {
    id: "sf-264-adaptive-dynamic-plans",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Adaptive Experiences & Dynamic Plans for Service Rep Assistant",
    description:
      "An ambient AI agent listens to live case and messaging conversations and updates the resolution plan as the issue changes.",
    client: null,
  },
  {
    id: "sf-264-agentforce-contact-center",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Agentforce Contact Center expands to 30+ countries",
    description:
      "CRM, voice, and AI in a single contact centre so human and AI agents work from the same real-time customer data without a third-party CCaaS.",
    client: "aether",
  },
  {
    id: "sf-264-tableau-knowledge",
    type: "platform",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Tableau Knowledge grounds agents in governed context",
    description:
      "Ingests structured and unstructured data into living knowledge graphs and delivers curated context to agents over open standards.",
    client: null,
  },
  {
    id: "sf-264-informatica-headless",
    type: "platform",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Informatica Headless brings governed data into the IDE",
    description:
      "IDMC’s backend is decoupled from its UI, so VS Code, Cursor, Slack, and MCP servers can call enterprise-grade data management directly.",
    client: null,
  },
  {
    id: "sf-264-agentic-segmentation-activation",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Agentic Segmentation and Activation for marketers",
    description:
      "Describe an audience in plain language; the Segmentation agent builds the plan and the Activation agent sets up multichannel campaigns across ad platforms.",
    client: "hexworth",
  },
  {
    id: "sf-264-autonomous-scheduling-voice",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Autonomous Scheduling with Agentforce Voice",
    description:
      "Customers book 24/7 by phone: the agent checks real-time availability and dispatches the right technician in the right territory, no human handoff.",
    client: "aether",
  },
  {
    id: "sf-264-agent-skills-plugins",
    type: "platform",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Agent Skills and Plugins across every surface",
    description:
      "A unified registry of 100+ prebuilt skills and plug-ins — including the Salesforce Development plug-in in the Claude Code marketplace — so agents reuse governed workflows.",
    client: null,
  },
  {
    id: "sf-264-third-party-agent-orchestration",
    type: "platform",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Third-Party Agent Orchestration for Agentforce",
    description:
      "Native A2A orchestration lets Agentforce drive or participate alongside agents from AWS, Azure, Google, and other vendors — no point-to-point integrations.",
    client: null,
  },
  {
    id: "sf-264-agentic-commerce-search",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Agentic Commerce Search for Shopper Agent",
    description:
      "A per-merchant small language model interprets natural-language queries over the catalogue, with early results showing a 13% conversion lift and 17% add-to-cart lift.",
    client: "hexworth",
  },
  {
    id: "sf-264-slack-frontline",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Slack Frontline unifies shift workers with HQ",
    description:
      "A purpose-built Slack experience for frontline teams keeps conversation, company news, tasks, and support in one governed work operating system.",
    client: null,
  },
  {
    id: "sf-264-marketing-goals-agent",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Agentforce Marketing Goals Agent",
    description:
      "Marketers set goals, budgets, and guardrails; the agent orchestrates and optimises every campaign in real time, arbitrating conflicts and over-messaging.",
    client: null,
  },
  {
    id: "sf-264-revenue-management-agent",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Revenue Management Agent — buyers, partners, AEs",
    description:
      "Self-service quoting for buyers, integrated quoting for partners, and automated renewal packages for AEs with risk signals surfaced in-flow.",
    client: "hexworth",
  },
  {
    id: "sf-264-claims-service-assistance",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Claims Service Customer Assistance for FNOL",
    description:
      "A voice-enabled template so policyholders can file First Notice of Loss across six business lines, with automatic claim and case record creation.",
    client: null,
  },
  {
    id: "sf-264-voice-visit-logging",
    type: "product",
    date: SALESFORCE_RELEASE_NOTES.gaDate,
    title: "Voice Based Visit Logging for life sciences field reps",
    description:
      "Hands-free voice capture of key insights, objections, and questions from HCP visits, so field teams reclaim time lost to manual data entry.",
    client: null,
  },
];

/** Seed cards shown before the Fetch latest notes action. */
export const SALESFORCE_SEED_HEADLINES: UpdateCard[] = [
  SALESFORCE_SHIPPED.find((item) => item.id === "sf-264-agentforce-contact-center")!,
  SALESFORCE_SHIPPED.find((item) => item.id === "sf-264-agentic-commerce-search")!,
  SALESFORCE_SHIPPED.find((item) => item.id === "sf-264-agent-skills-plugins")!,
];
