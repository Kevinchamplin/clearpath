import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — ClearPath",
  description:
    "Why ClearPath exists: the May 2026 Mendota train blockage, the 4th Avenue Viaduct problem, and our mission to give first responders a heads-up before crossings close.",
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroHeading}>When Trains Stop, So Does Everything Else</h1>
        <p className={styles.heroSub}>
          ClearPath was built in response to a real incident — and a growing national problem.
        </p>
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>The May 28, 2026 Incident</h2>
          <p>
            On May 28, 2026, a BNSF freight train stopped and blocked every downtown rail crossing in
            Mendota, Illinois for nearly four hours. During that time, emergency vehicles could not
            cross. The only alternative route — the 4th Avenue Viaduct — cannot accommodate larger
            fire trucks, which means a structure fire or cardiac arrest on the wrong side of the
            tracks could turn into a tragedy.
          </p>
          <p>
            Mendota Fire Chief Dennis Rutishauser described the situation plainly in an interview
            with the LaSalle NewsTribune on June 23, 2026:
          </p>
          <blockquote className={styles.quote}>
            "Whenever trains are stopped, all downtown crossings are blocked for a considerable
            amount of time."
            <cite>— Chief Dennis Rutishauser, Mendota Fire Department</cite>
          </blockquote>
        </section>

        <section className={styles.section}>
          <h2>A Region-Wide Problem</h2>
          <p>
            Mendota is not alone. The same freight corridors that cut through Mendota also run
            through Ottawa, Princeton, Streator, and La Salle — every Illinois Valley community that
            depends on rail crossings for emergency access faces the same vulnerability.
          </p>
          <p>
            Ottawa Fire Chief Brian Bressner has observed the problem evolving over time: trains are
            simply getting longer. Princeton Fire Chief Scott Etheridge put the stakes in stark
            terms:
          </p>
          <blockquote className={styles.quote}>
            "Fire can sometimes quadruple in size every minute."
            <cite>— Chief Scott Etheridge, Princeton Fire Department</cite>
          </blockquote>
          <p>
            A 2019 Government Accountability Office report found that the average freight train
            length increased approximately 25% between 2008 and 2017. Longer trains mean longer
            blockages — and fewer seconds for first responders to react.
          </p>
        </section>

        <section className={styles.section}>
          <h2>The 4th Avenue Viaduct Problem</h2>
          <p>
            Mendota has one alternative crossing: the 4th Avenue Viaduct. But it has a clearance
            limitation that prevents larger fire apparatus — ladder trucks and heavy rescue
            vehicles — from passing through. When freight blocks the downtown crossings, those
            trucks have no viable route.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            ClearPath gives first responders and dispatchers a 10–20 minute heads-up before a
            passenger train reaches a crossing. That window is enough to stage apparatus on the
            correct side of the tracks, reroute a response, or alert mutual aid before the
            crossing closes.
          </p>
          <p>
            We start with Amtrak's California Zephyr — whose schedule and real-time GPS position
            are publicly available — and build toward a community-reporting layer that captures
            freight train blockages as they happen.
          </p>
          <p>
            ClearPath is free, open source, and built for the communities that need it most.
          </p>
          <p className={styles.githubLink}>
            <a
              href="https://github.com/Kevinchamplin/clearpath"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the source on GitHub →
            </a>
          </p>
        </section>

        <footer className={styles.source}>
          <p>
            Source: LaSalle NewsTribune, June 23, 2026 — reporting by the Illinois Valley news
            team on grade crossing safety and the May 28 Mendota blockage.
          </p>
        </footer>
      </div>
    </main>
  );
}
