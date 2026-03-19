import Link from "next/link";

import { requireUserContext } from "@/lib/auth/session";
import { ConnectorSettingsForm } from "@/components/ConnectorSettingsForm";
import { LogoutButton } from "@/components/LogoutButton";
import { getConnectorSettingsSummary } from "@/lib/connector-settings";
import { getDashboardData } from "@/lib/live-data";
import {
  getBoardSummary,
  getCompetitorDigest,
  getPlatformScores,
  getRecommendations,
} from "@/lib/scoring/recommendations";
import {
  contentTypes,
  mediaFormats,
  publishWindows,
  storylineClusters,
} from "@/lib/tags/content-taxonomy";

const platformLabel = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function percentage(value: number) {
  return `${value.toFixed(1)}%`;
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default async function DashboardPage() {
  const currentUser = await requireUserContext();
  const connectorSettingsFields = await getConnectorSettingsSummary(currentUser);
  const {
    activeEvent,
    competitorPosts,
    connectors,
    dataSourceMap,
    experimentLog,
    ownedPosts,
    roadmap,
  } = await getDashboardData(currentUser);
  const boardSummary = getBoardSummary(ownedPosts, activeEvent);
  const competitorDigest = getCompetitorDigest(competitorPosts);
  const platformScores = getPlatformScores(ownedPosts, activeEvent);
  const recommendations = getRecommendations(ownedPosts, competitorPosts, activeEvent);

  return (
    <main className="shell">
      <div className="page">
        <section className="hero">
          <span className="eyebrow">Race-week operator dashboard</span>
          <div className="hero-grid">
            <div>
              <h1>NHRA content intelligence, tuned like a race-day pit wall.</h1>
              <p>
                This version implements the first complete scoreboard from the plan:
                event-day performance, competitor pattern spotting, and a
                recommendation feed for what NHRA should post next.
              </p>
              <div className="hero-actions">
                <span className="pill" data-tone="success">
                  {currentUser.displayName}
                </span>
                <span className="pill">{currentUser.workspaceName}</span>
                <LogoutButton />
              </div>
              <div className="pill-row connector-pill-row">
                {connectors.map((connector) => (
                  <span
                    className="pill"
                    key={connector.id}
                    data-tone={connector.status === "live" ? "success" : "warning"}
                  >
                    {connector.name}: {titleCase(connector.status)}
                  </span>
                ))}
              </div>
              <div className="hero-actions">
                <Link className="button" href="#recommendations">
                  Jump to recommendations
                </Link>
                <Link className="button-secondary" href="#data-map">
                  Review data map
                </Link>
              </div>
            </div>

            <div className="panel">
              <div className="section-title">
                <h2>{activeEvent.name}</h2>
                <span className="pill" data-tone="warning">
                  {titleCase(activeEvent.stage)}
                </span>
              </div>
              <p className="copy">
                {activeEvent.location} · {activeEvent.dateRange}
              </p>
              <p className="copy">{activeEvent.headline}</p>
              <div className="pill-row">
                {activeEvent.classes.map((raceClass) => (
                  <span className="pill" key={raceClass}>
                    {raceClass}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ConnectorSettingsForm initialFields={connectorSettingsFields} />

        <section className="panel" id="scoreboard">
          <div className="section-title">
            <div>
              <h2>Event-day board</h2>
              <p>What is working for NHRA right now, weighted toward the active race window.</p>
            </div>
            <span className="pill" data-tone="success">
              Now score {boardSummary.nowScore}
            </span>
          </div>

          <div className="metric-grid">
            <div className="metric">
              <p className="metric-label">Owned views</p>
              <p className="metric-value">{compactNumber(boardSummary.totalViews)}</p>
              <p className="metric-note">Across current owned posts from live or fallback connectors</p>
            </div>
            <div className="metric">
              <p className="metric-label">Engagements</p>
              <p className="metric-value">{compactNumber(boardSummary.totalEngagements)}</p>
              <p className="metric-note">Blended reactions, comments, shares, and saves</p>
            </div>
            <div className="metric">
              <p className="metric-label">Conversions</p>
              <p className="metric-value">{compactNumber(boardSummary.totalConversions)}</p>
              <p className="metric-note">Clicks that turned into meaningful actions</p>
            </div>
            <div className="metric">
              <p className="metric-label">Leading package</p>
              <p className="metric-value">{boardSummary.leadingPost.mediaFormat}</p>
              <p className="metric-note">{boardSummary.leadingPost.headline}</p>
            </div>
          </div>

          <div className="cards-3 platform-cards">
            {platformScores.map((score) => (
              <article className="accent-card" key={score.platform}>
                <p className="metric-label">{platformLabel[score.platform]}</p>
                <p className="metric-value">{score.score}</p>
                <p className="metric-note">
                  Winning now: {titleCase(score.winningTheme)} via{" "}
                  {titleCase(score.winningFormat)}
                </p>
                <div className="pill-row score-pill-row">
                  <span className="pill">Engagement {percentage(score.engagementRate)}</span>
                  <span className="pill">Conversion {percentage(score.conversionRate)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="split" id="recommendations">
          <div className="panel">
            <div className="section-title">
              <div>
                <h2>Recommendation feed</h2>
                <p>What NHRA should post next, with rationale and evidence.</p>
              </div>
            </div>

            <div className="list">
              {recommendations.map((recommendation) => (
                <article className="list-item" key={recommendation.id}>
                  <div className="section-title">
                    <h3>{recommendation.title}</h3>
                    <span
                      className="pill"
                      data-tone={recommendation.priority === "high" ? "success" : "warning"}
                    >
                      {recommendation.confidence}% confidence
                    </span>
                  </div>
                  <p>{recommendation.rationale}</p>
                  <p className="small">
                    <strong>Next action:</strong> {recommendation.nextAction}
                  </p>
                  <div className="list-meta">
                    <span>{platformLabel[recommendation.focusPlatform]}</span>
                    {recommendation.supportingSignals.map((signal) => (
                      <span key={signal}>{signal}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="stack">
            <section className="panel">
              <div className="section-title">
                <div>
                  <h2>Top owned post</h2>
                  <p>The strongest weighted content package in the current live dataset.</p>
                </div>
              </div>
              <div className="accent-card">
                <p className="metric-label">{platformLabel[boardSummary.leadingPost.platform]}</p>
                <h3>{boardSummary.leadingPost.headline}</h3>
                <p className="copy">{boardSummary.leadingPost.summary}</p>
                <div className="pill-row">
                  <span className="pill">{titleCase(boardSummary.leadingPost.contentType)}</span>
                  <span className="pill">{titleCase(boardSummary.leadingPost.mediaFormat)}</span>
                  <span className="pill">{boardSummary.leadingPost.driver}</span>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="section-title">
                <div>
                  <h2>Experiment log</h2>
                  <p>The controlled autoresearch loop for what to repeat, refine, or pause.</p>
                </div>
              </div>
              <div className="list">
                {experimentLog.map((entry) => (
                  <article className="list-item" key={entry.id}>
                    <div className="section-title">
                      <h3>{entry.hypothesis}</h3>
                      <span
                        className="pill"
                        data-tone={
                          entry.result === "winning"
                            ? "success"
                            : entry.result === "promising"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {titleCase(entry.result)}
                      </span>
                    </div>
                    <p>{entry.learning}</p>
                    <p className="small mono">{entry.testWindow}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <div>
              <h2>Competitor digest</h2>
              <p>Who is moving quickly, what format they use, and where NHRA can counterpunch.</p>
            </div>
          </div>

          <div className="cards-3">
            {competitorDigest.map((item) => (
              <article className="list-item" key={item.id}>
                <div className="section-title">
                  <h3>{item.account}</h3>
                  <span className="pill">{platformLabel[item.platform]}</span>
                </div>
                <p>{item.hook}</p>
                <div className="list-meta">
                  <span>{titleCase(item.mediaFormat)}</span>
                  <span>{titleCase(item.contentType)}</span>
                  <span>{compactNumber(item.visibleEngagements)} visible engagements</span>
                  <span>{item.engagementVelocity}/hr engagement velocity</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="split" id="data-map">
          <section className="panel">
            <div className="section-title">
              <div>
                <h2>Data source inventory</h2>
                <p>The first inputs needed to keep recommendations current and evidence-based.</p>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Cadence</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {dataSourceMap.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <strong>{source.name}</strong>
                      <div className="small">{source.notes}</div>
                    </td>
                    <td>{titleCase(source.status)}</td>
                    <td>{source.cadence}</td>
                    <td>{source.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="stack">
            <div className="panel">
              <div className="section-title">
                <div>
                  <h2>Connector health</h2>
                  <p>Live source status for Meta, YouTube, and NHRA event context.</p>
                </div>
              </div>
              <div className="list">
                {connectors.map((connector) => (
                  <article className="list-item" key={connector.id}>
                    <div className="section-title">
                      <h3>{connector.name}</h3>
                      <span
                        className="pill"
                        data-tone={connector.status === "live" ? "success" : "warning"}
                      >
                        {titleCase(connector.status)}
                      </span>
                    </div>
                    <p>{connector.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="section-title">
                <div>
                  <h2>Taxonomy</h2>
                  <p>The shared schema that lets the system compare race-day posts apples-to-apples.</p>
                </div>
              </div>
              <div className="stack">
                <div>
                  <p className="metric-label">Content types</p>
                  <div className="pill-row">
                    {Object.keys(contentTypes).map((item) => (
                      <span className="pill" key={item}>
                        {titleCase(item)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="metric-label">Media formats</p>
                  <div className="pill-row">
                    {Object.keys(mediaFormats).map((item) => (
                      <span className="pill" key={item}>
                        {titleCase(item)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="metric-label">Publish windows</p>
                  <div className="pill-row">
                    {Object.keys(publishWindows).map((item) => (
                      <span className="pill" key={item}>
                        {titleCase(item)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="metric-label">Storyline clusters</p>
                  <div className="pill-row">
                    {storylineClusters.map((item) => (
                      <span className="pill" key={item}>
                        {titleCase(item)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="section-title">
                <div>
                  <h2>Build roadmap</h2>
                  <p>The stack and milestone breakdown from ingestion through autoresearch.</p>
                </div>
              </div>
              <div className="list">
                {roadmap.map((milestone) => (
                  <article className="list-item" key={milestone.id}>
                    <div className="section-title">
                      <h3>{milestone.title}</h3>
                      <span
                        className="pill"
                        data-tone={
                          milestone.status === "now"
                            ? "success"
                            : milestone.status === "next"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {titleCase(milestone.status)}
                      </span>
                    </div>
                    <p>{milestone.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </section>

        <p className="footer-note">
          Stack direction: Next.js app router, API ingestion endpoints, shared scoring
          library, and scheduled jobs layered in next.
        </p>
      </div>
    </main>
  );
}
