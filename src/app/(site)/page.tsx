import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Reveal } from "@/components/Reveal";
import { getFeaturedProject, getPublishedProjects, type ProjectCardData } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: ProjectCardData[] = [];
  let featured: ProjectCardData | null = null;
  let unavailable = false;

  try {
    [featured, projects] = await Promise.all([getFeaturedProject(), getPublishedProjects()]);
  } catch (error) {
    console.error("Failed to load projects", error);
    unavailable = true;
  }

  return (
    <>
      <Hero />
      {featured && <FeaturedWork project={featured} />}

      <section id="work" className="scroll-mt-16 border-t border-line px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <h2 className="font-display mb-12 text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.9]">Selected work</h2>
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
