import { Link } from "react-router-dom";
import { ContextSummary } from "../components/ContextSummary";
import { Layout } from "../components/Layout";
import { CATALOG } from "../data/catalog";
import { rankTop } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";

export function ShortlistPage() {
  const { context } = useSession();
  if (!context) return null;
  const ranked = rankTop(context, CATALOG);

  return (
    <Layout>
      <section className="page-intro">
        <h1>Top {ranked.length}</h1>
        <p>Same context and catalog always produce this order. Open a row for the score breakdown and one next step.</p>
      </section>
      <ContextSummary context={context} />
      <ol className="shortlist" data-testid="shortlist">
        {ranked.map((row, index) => (
          <li key={row.item.id} data-testid="shortlist-row">
            <Link className="shortlist-row" to={`/items/${row.item.id}`}>
              <span className="rank">{index + 1}</span>
              <span className="shortlist-copy">
                <span className="shortlist-name">{row.item.name}</span>
                <span className="reason">{row.reason}</span>
              </span>
              <span className="score">{row.score}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Layout>
  );
}
