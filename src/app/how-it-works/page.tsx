import type { Metadata } from "next";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = {
  title: "How It Works — ClearPath",
  description:
    "ClearPath polls Amtrak train positions every 30 seconds, calculates ETAs to each Mendota grade crossing, and alerts first responders when a train is within 20 minutes.",
};

const steps = [
  {
    number: "01",
    title: "Amtrak Data Polling",
    body: "We query api.amtraker.com every 30 seconds to retrieve the real-time GPS position, speed, and bearing of the California Zephyr (Amtrak trains 5 and 6). This is publicly available data — no scraping, no workarounds.",
    tag: "Data source",
  },
  {
    number: "02",
    title: "ETA Calculation",
    body: "Using the Haversine formula, we calculate the great-circle distance from the train's current position to each monitored grade crossing. That distance divided by the train's reported speed gives us an estimated arrival time in minutes. ETAs update with every poll.",
    tag: "Math",
  },
  {
    number: "03",
    title: "Alert Threshold",
    body: "When a train is within 20 minutes of any crossing, the crossing card turns red and an alert is surfaced. That 10–20 minute window is enough for dispatchers to stage apparatus on the correct side of the tracks or reroute a response before the crossing closes.",
    tag: "Alerting",
  },
  {
    number: "04",
    title: "Community Reports",
    body: "Residents and first responders can submit freight train blockages manually via the Report a Blockage form. Reports include the crossing location, blockage time, and estimated duration. Confirmed reports are surfaced on the main map immediately.",
    tag: "Community layer",
  },
  {
    number: "05",
    title: "Dispatch View",
    body: "The Dispatch View (/dispatch) is a stripped-down, high-contrast screen designed for tablets mounted in fire trucks. It shows only the most time-critical information: which crossings are blocked, ETAs, and active community reports — no map clutter.",
    tag: "First responders",
  },
];

export default function HowItWorksPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroHeading}>How ClearPath Works</h1>
        <p className={styles.heroSub}>
          Real-time train positions, ETA math, and a community reporting layer — all in one place.
        </p>
      </section>

      <div className={styles.content}>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepBody}>
                <span className={styles.stepTag}>{step.tag}</span>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepText}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className={styles.caveat}>
          <h2>The Freight Gap</h2>
          <p>
            BNSF, Union Pacific, and other Class I freight carriers do not share real-time train
            position data with the public. This is a significant limitation — the May 28, 2026
            Mendota blockage was caused by a BNSF freight train, not an Amtrak passenger train.
          </p>
          <p>
            Community reports fill this gap. When a freight train blocks a crossing, a resident or
            first responder can submit a report in under 30 seconds. Those reports become the
            freight layer on the ClearPath map until official data is available.
          </p>
          <p>
            We are actively exploring partnerships and open-data advocacy to close this gap at the
            policy level.
          </p>
        </section>

        <section className={styles.stack}>
          <h2>Technical Stack</h2>
          <ul className={styles.stackList}>
            <li>
              <strong>Frontend:</strong> Next.js 14 App Router, TypeScript, custom CSS — deployed
              on Vercel
            </li>
            <li>
              <strong>Train data:</strong>{" "}
              <a
                href="https://api.amtraker.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                api.amtraker.com
              </a>{" "}
              (unofficial Amtrak API, 30-second polling)
            </li>
            <li>
              <strong>Map:</strong> Leaflet.js with OpenStreetMap tiles
            </li>
            <li>
              <strong>ETA math:</strong> Haversine formula, client-side calculation
            </li>
            <li>
              <strong>Source:</strong>{" "}
              <a
                href="https://github.com/Kevinchamplin/clearpath"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/Kevinchamplin/clearpath
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
