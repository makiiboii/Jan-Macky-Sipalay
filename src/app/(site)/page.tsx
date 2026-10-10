import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Hero } from "@/components/Hero";
import { LocationJourney } from "@/components/LocationJourney";
import { Portfolio } from "@/components/Portfolio";
import { Reveal } from "@/components/Reveal";
import { ToolsShowcase } from "@/components/ToolsShowcase";
import { getFeaturedProjects, getPublishedProjects, type ProjectCardData } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredProjects: ProjectCardData[] = [];
  let projects: ProjectCardData[] = [];
  let unavailable = false;

  try {
    const [loadedFeaturedProjects, publishedProjects] = await Promise.all([
      getFeaturedProjects(),
      getPublishedProjects(),
    ]);
    featuredProjects = loadedFeaturedProjects;
    projects = publishedProjects;
  } catch (error) {
    console.error("Failed to load projects", error);
    unavailable = true;
  }

  // Only show projects explicitly marked as Featured (up to MAX_FEATURED = 4)
  const featuredList = featuredProjects.slice(0, 4);

  const photographySeed = Math.floor(Math.random() * 1_000_000);

  return (
    <>
      <Hero projects={projects} />

      <About />

      {!unavailable && featuredList.length > 0 && <FeaturedWork projects={featuredList} />}

      <section id="work" className="scroll-mt-16 border-t border-line px-5 py-20 md:px-10 md:py-28 max-w-full overflow-x-clip">
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-line pb-7 md:mb-14 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-smoke">03 / Selected Work</p>
              <h2 className="font-display text-5xl leading-none sm:text-6xl">Project Archive</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-smoke md:text-right">
              Browse by category — video editing, 9:16 portrait videos, still photography, posters & graphics, and AI productions.
            </p>
          </div>
        </Reveal>
        {unavailable ? (
          <p className="text-smoke">Projects can&rsquo;t be loaded right now. Please try again in a few minutes.</p>
        ) : projects.length === 0 ? (
          <p className="text-smoke">No projects have been published yet.</p>
        ) : (
          <Portfolio projects={projects} photographySeed={photographySeed} />
        )}
      </section>

      <ToolsShowcase />
      <LocationJourney />
      <Contact />
    </>
  );
}
