import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Reveal } from "@/components/Reveal";
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

  return (
    <>
      <Hero />
      {featuredProjects.length > 0 && <FeaturedWork projects={featuredProjects} />}

      <section id="work" className="scroll-mt-16 border-t border-line px-5 py-24 md:px-10 md:py-32 max-w-full overflow-hidden">
        <Reveal>
          <h2 className="font-display mb-12 text-[clamp(2.2rem,7.5vw,7.5rem)] leading-[0.9] break-words">Selected work</h2>
        </Reveal>
        {unavailable ? (
          <p className="text-smoke">Projects can&rsquo;t be loaded right now. Please try again in a few minutes.</p>
        ) : projects.length === 0 ? (
          <p className="text-smoke">No projects have been published yet.</p>
        ) : (
          <Portfolio projects={projects} />
        )}
      </section>

      <About />
      <Contact />
    </>
  );
}
