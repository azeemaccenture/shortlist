import { Link } from "react-router-dom";
import { ContextSummary } from "../components/ContextSummary";
import { Layout } from "../components/Layout";
import { CATALOG } from "../data/catalog";
import { formatWhen, effortLabel } from "../format";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS } from "../types";

export function CatalogPage() {
  const { context, syncJira, syncSalesforce } = useSession();
  if (!context) return null;

  const jira = context.sources.jiraMock;
  const salesforce = context.sources.salesforceMock;

  return (
    <Layout>
      <section className="page-intro">
        <h1>Candidate pool</h1>
        <p>Eight Salesforce features, scored only from this session. Syncs are optional.</p>
      </section>
      <ContextSummary context={context} />

      <section className="panel" aria-label="Mock syncs">
        <h2>Enrich context</h2>
        <p className="muted">Mock Jira pairs bottlenecks to release features. Mock Salesforce adds CRM hints. No live APIs.</p>
        <div className="row-actions">
          <button type="button" className="secondary" data-testid="sync-jira" onClick={syncJira}>
            Sync Jira mock
          </button>
          <button type="button" className="secondary" data-testid="sync-salesforce" onClick={syncSalesforce}>
            Sync Salesforce mock
          </button>
          <Link className="primary link-button" to="/shortlist" data-testid="see-top-5">
            See top 5
          </Link>
        </div>
        {jira ? (
          <div data-testid="jira-sync">
            <p className="file-name">Jira synced {formatWhen(jira.syncedAt)}</p>
            <ul>
              {jira.bottlenecks.map((bottleneck) => (
                <li key={bottleneck.id}>
                  {bottleneck.id}: {bottleneck.summary} → {bottleneck.pairedFeature}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {salesforce ? (
          <div data-testid="salesforce-sync">
            <p className="file-name">Salesforce synced {formatWhen(salesforce.syncedAt)}</p>
            <ul>
              {salesforce.records.map((record) => (
                <li key={record.id}>
                  {record.type} · {record.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <ul className="catalog-grid" data-testid="catalog-list">
        {CATALOG.map((item) => (
          <li key={item.id}>
            <Link className="catalog-card" to={`/items/${item.id}`}>
              <h2>{item.name}</h2>
              <p>{item.blurb}</p>
              <ul className="chips">
                <li>{effortLabel(item.effort)} effort</li>
                {item.roles.map((role) => (
                  <li key={role}>{ROLE_LABELS[role]}</li>
                ))}
                {item.themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
