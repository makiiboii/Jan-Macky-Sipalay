# Jan Macky Sipalay — Portfolio

Next.js 15 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · deployed on Railway.
Videos live on Google Drive. Railway only hosts the app and the database.

## Folder structure

```
prisma/
  schema.prisma                 Project, ProjectImage, Category and Role enums
  migrations/                   SQL migration committed to git (applied by `prisma migrate deploy`)
  seed.ts                       Sample projects (clearly labelled as sample content)
public/samples/                 Placeholder SVG images used by the seed
src/
  config/site.ts                Name, copy, about text, email and social links
  middleware.ts                 Redirects /admin/* to the login page without a valid session
  lib/
    drive.ts                    getGoogleDriveEmbedUrl(), getGoogleDriveFileId(), resolveImageUrl()
    validation.ts               Zod schemas for API input
    projects.ts                 Database queries and unique-slug generation
    auth.ts / session.ts        Password check, signed session cookie (JWT, HTTP-only)
    api.ts                      Admin guard, origin check, error mapping
    rate-limit.ts, slug.ts, prisma.ts, constants.ts, utils.ts
  app/
    layout.tsx, globals.css, error.tsx, not-found.tsx, robots.ts, sitemap.ts
    (site)/                     Public pages: layout, template (page fade), page.tsx, projects/[slug]/page.tsx
    admin/login/                Login page
    admin/(dashboard)/          Protected dashboard: project list, new, edit
    api/
      projects/route.ts         GET, POST
      projects/[id]/route.ts    GET, PUT, PATCH (publish/feature toggles), DELETE
      auth/login|logout|me/     POST, POST, GET
      health/route.ts           Railway health check
  components/                   Nav, Hero, FeaturedWork, Portfolio, ProjectCard, About, Contact,
                                Footer, VideoEmbed, Gallery, Cover, Reveal
  components/admin/             LoginForm, LogoutButton, ProjectForm, ProjectRowActions
railway.json, .env.example, package.json, tailwind.config.ts, next.config.mjs, tsconfig.json
```

## Run locally

Requirements: Node 20+ and a PostgreSQL database (local, Docker, or a Railway database).

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/janmacky
ADMIN_PASSWORD=choose-a-long-passphrase
SESSION_SECRET=<output of: openssl rand -base64 48>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Create the tables and add sample data:

```bash
npx prisma migrate deploy     # applies prisma/migrations
npm run db:seed               # adds 6 sample projects (safe to run again)
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin.

If you change `prisma/schema.prisma`, create a new migration with `npx prisma migrate dev --name describe_change` and commit the generated folder.

## Deploy on Railway

1. **Create a project.** Push this folder to a GitHub repository. In Railway choose *New Project → Deploy from GitHub repo* and pick it.
2. **Add PostgreSQL.** In the project canvas choose *New → Database → Add PostgreSQL*.
3. **Connect the app to the database.** Open your app service → *Variables* → *New Variable* → *Add Reference*, and reference `DATABASE_URL` from the Postgres service.
4. **Set environment variables** on the app service: `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ random characters), and `NEXT_PUBLIC_SITE_URL` (your final URL, for example `https://janmacky.com`; set it before the build because it is baked in at build time).
5. **Migrations.** `railway.json` runs `npx prisma migrate deploy` on every start, so tables are created or updated automatically.
6. **Seed (optional, once).** Install the CLI (`npm i -g @railway/cli`), run `railway login` and `railway link`, then run `railway run npm run db:seed`. This needs the database's *public* connection URL locally, so if it fails to connect, copy `DATABASE_PUBLIC_URL` from the Postgres service and run `DATABASE_URL="<that value>" npm run db:seed`. Delete the sample projects in the admin once you have real ones.
7. **Deploy.** Railway builds and deploys on every push. Under *Settings → Networking* click *Generate Domain* to get a public URL.
8. **Custom domain.** *Settings → Networking → Custom Domain*, enter your domain, then add the CNAME record Railway shows at your domain registrar. HTTPS is issued automatically. Update `NEXT_PUBLIC_SITE_URL` to the new domain and redeploy.

## Using the admin

Go to `/admin`, log in with `ADMIN_PASSWORD`.

**Add a project.** *Add project*, fill in title, category, year, roles, and description, add a thumbnail URL, then tick *Published* and save. The page address (slug) is generated from the title; if it is already used, `-2`, `-3`, and so on is added. Editing the title later does not change the address unless you edit the address field.

**Add a Google Drive video.**
1. Upload the video to Google Drive.
2. Right-click → *Share* → General access → *Anyone with the link* (Viewer).
3. Copy the link, which looks like `https://drive.google.com/file/d/FILE_ID/view`.
4. Paste it in *Google Drive Video URL*. A live preview appears when the link is valid.
Visitors only load the player on the project page.

**Add photography.** Set the category to Photography. Photos are added by URL, so nothing is stored on Railway. Host each image on Google Drive (share as *Anyone with the link*, then paste the file link; the site converts it) or on any image host that gives an `https://` link. Paste many links at once, one per line, then reorder with Up/Down and add captions. Thumbnails work the same way.

**Publish, feature, delete.** Use the buttons on each row of the project list. The homepage Featured section shows the most recently updated published project marked Featured, and hides itself if there is none.

## Customise

- **Name, about text, contact intro, email, social links:** edit `src/config/site.ts`. Empty links show as "Not set yet".
- **Profile photo:** put a file in `public/` and change `profileImage` in `src/config/site.ts`.
- **Site title and description:** `src/config/site.ts` (used for search and social previews).
- **Colors:** `tailwind.config.ts` (`bone`, `smoke`, `line`) and the base colors in `src/app/globals.css`.
- **Fonts:** `src/app/layout.tsx` (Archivo for headings, Hanken Grotesk for text).
- **Hero text:** `src/components/Hero.tsx`.
- **Animations:** `src/app/globals.css`. They turn off automatically for visitors with reduced-motion enabled.
- **Roles or categories:** update the enum in `prisma/schema.prisma`, add a migration, and update `src/lib/constants.ts` to match.

## Security notes

Passwords are compared in constant time and never stored in code. Sessions are signed JWTs in HTTP-only, SameSite=Lax cookies (Secure in production). Every write endpoint checks the session and the request origin. Input is validated with Zod, image URLs must be `https://` or site-relative, descriptions are rendered as plain text (no HTML), and login attempts are rate limited per IP (in memory, so it resets on restart). Database errors are logged on the server and never shown to visitors.
