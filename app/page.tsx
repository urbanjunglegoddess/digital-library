import Link from "next/link";
import "styles\home.css";
import {
  ALL_STYLES,
  getAllComponents,
  getCategories,
} from "@/lib/content";

/**
 * Home / landing — the "spec sheet" front door.
 * Light ground, numbered sections, real counts read from content/docs.
 * The composer lives behind the primary CTA; the portal is at /portal.
 */

const DOMAINS = [
  {
    name: "Websites & marketing",
    blurb:
      "Hero, nav, cards, forms, footer. The shapes a client site is actually made of.",
    categories: ["Marketing & Content", "Navigation", "Layout & Structure"],
  },
  {
    name: "Data reports & dashboards",
    blurb:
      "Metrics, tables, tabs, filters, status. The reporting spine, wired to your data.",
    categories: ["Data Display", "Feedback & Status"],
  },
  {
    name: "Mobile apps",
    blurb:
      "Tab bars, sheets, toasts, switches — with 44px targets held at every size.",
    categories: ["Actions", "Inputs & Forms", "Overlays & Popouts"],
  },
];

const ENTRIES = [
  {
    key: "A",
    name: "Pick assets",
    blurb:
      "Browse, add to the build, set skin and target per piece. Deliberate, and the fastest to audit afterward.",
  },
  {
    key: "B",
    name: "Describe the intent",
    blurb:
      "A sentence in, a proposed asset list out. Approve, cut, generate. Best when the shape isn't decided yet.",
  },
  {
    key: "C",
    name: "Start from a template",
    blurb:
      "A known shape with the parts pre-chosen. Swap what differs. Best when the job rhymes with the last one.",
  },
];

const PLANNED_TOTAL = 51;
const TARGET_COUNT = 12;

export default function Home() {
  const components = getAllComponents();
  const categories = getCategories();

  const written = components.length;
  const audited = components.filter(
    (c) => c.status === "audited" || c.status === "reusable",
  ).length;
  const countIn = (names: string[]) =>
    components.filter((c) => names.includes(c.category)).length;

  return (
    <main className="lp">
      <section className="lp-hero">
        <div className="lp-hero__lead">
          <p className="lp-eyebrow">01 · What this is</p>
          <h1 className="lp-h1">One library. Three ways in. Four things out.</h1>
          <p className="lp-pull">
            I stopped rebuilding the same button and started building the thing
            that builds it.
          </p>
          <p className="lp-body">
            Every component in here is documented to a seventeen-section bar,
            audited for accessibility, and written in {TARGET_COUNT} language
            targets across {ALL_STYLES.length} visual skins. Choosing is the
            work. The code is already done.
          </p>
          <div className="lp-cta">
            <Link href="/catalog" className="btn btn--primary btn--lg lp-btn">
              Start an Adventure
            </Link>
            <Link href="/catalog" className="lp-link">
              Read the specs →
            </Link>
          </div>
        </div>

        <aside className="lp-manifest">
          <p className="lp-eyebrow lp-eyebrow--tight">The manifest</p>
          <dl className="lp-manifest__list">
            <div>
              <dt>Component specs</dt>
              <dd>
                {written} / {PLANNED_TOTAL}
              </dd>
            </div>
            <div>
              <dt>Visual skins</dt>
              <dd>{ALL_STYLES.length}</dd>
            </div>
            <div>
              <dt>Language targets</dt>
              <dd>{TARGET_COUNT}</dd>
            </div>
            <div>
              <dt>Categories seeded</dt>
              <dd>{categories.length} / 10</dd>
            </div>
            <div>
              <dt>Status ladder</dt>
              <dd className="lp-manifest__ladder">Idea → Reusable</dd>
            </div>
          </dl>
          <div className="lp-meter">
            <div className="lp-meter__head">
              <span>Written and audited</span>
              <span>{Math.round((audited / PLANNED_TOTAL) * 100)}%</span>
            </div>
            <div className="lp-meter__track">
              <div
                className="lp-meter__fill"
                style={{ width: `${(audited / PLANNED_TOTAL) * 100}%` }}
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="lp-section">
        <p className="lp-eyebrow">02 · How you drive it</p>
        <div className="lp-entries">
          {ENTRIES.map((e) => (
            <div key={e.key} className="lp-entry">
              <span className="lp-entry__key">{e.key}</span>
              <h3 className="lp-h3">{e.name}</h3>
              <p className="lp-body lp-body--sm">{e.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <p className="lp-eyebrow">03 · What it builds</p>
        <div className="lp-domains">
          {DOMAINS.map((d) => (
            <Link key={d.name} href="/catalog" className="lp-domain">
              <h3 className="lp-h3">{d.name}</h3>
              <p className="lp-body lp-body--sm">{d.blurb}</p>
              <span className="lp-domain__count">
                {countIn(d.categories)} parts ready
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="lp-section lp-section--last">
        <p className="lp-eyebrow">04 · What you get back</p>
        <ul className="lp-outputs">
          <li className="lp-chip lp-chip--solid">Runnable scaffold · .zip</li>
          <li className="lp-chip">Spec document · .md</li>
          <li className="lp-chip">Assembled code · {TARGET_COUNT} targets</li>
          <li className="lp-chip lp-chip--outline">Pushed repo · git</li>
        </ul>
        <p className="lp-pull lp-pull--closing">
          Most libraries hand you a picture of the thing. This one hands you the
          thing.
        </p>
        <Link href="/portal" className="lp-link lp-link--portal">
          Already running builds? Open the portal →
        </Link>
      </section>
    </main>
  );
}
