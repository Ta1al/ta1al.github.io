import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const stripMarkup = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function buildAchievements({ preferLocalImages = true } = {}) {
  const [
    personal,
    credlySnapshot,
    courseSnapshot,
    specializationSnapshot,
    thmBadgeSnapshot,
    thmCertificateSnapshot,
  ] = await Promise.all([
    readJson("data/personal-achievements.json"),
    readJson("data/credly-badges.json"),
    readJson("data/coursera-courses.json"),
    readJson("data/coursera-specializations.json"),
    readJson("data/tryhackme-badges.json"),
    readJson("data/tryhackme-certs.json"),
  ]);

  const credly = credlySnapshot.data;
  const courses =
    courseSnapshot[0].data.Certificate.getMyCertificatesPaginated.elements;
  const specializations =
    specializationSnapshot[0].data.Certificate.getMyCertificatesPaginated
      .elements;
  const thmBadges = thmBadgeSnapshot.data.docs;
  const thmCertificates = thmCertificateSnapshot.data.docs;
  const certificateTitles = {
    loveatfirstbreach: "Love at First Breach",
    "pathway-soclevel1legacy": "SOC Level 1",
    HackfinityBattle: "Hackfinity Battle",
  };

  const achievements = personal.map((item, index) => ({
    id: `personal-${slug(item.title)}`,
    provider: "distinctions",
    kind:
      item.category === "Professional certification"
        ? "Certification"
        : "Academic distinction",
    title:
      item.title === "Bronze Medal" ? "Bronze Medal and 3.8 CGPA" : item.title,
    detailTitle: item.title,
    issuer: item.institution,
    subtitle: `${item.institution} // ${item.degree}`,
    period: item.period,
    image: { src: item.image, alt: item.imageAlt },
    description: item.description,
    details: item.importance ? [item.importance] : [],
    metrics: [
      { label: item.metricLabel, value: item.metric },
      ...(item.facts ?? []),
    ],
    credential: item.url
      ? {
          url: item.url,
          label: item.linkLabel ?? "View credential",
        }
      : undefined,
    curated: true,
    curatedOrder: index + 1,
    showInAll: true,
  }));

  achievements.push({
    id: "personal-nsct-top-0-2",
    provider: "distinctions",
    kind: "National ranking",
    title: "NSCT top 0.2%",
    issuer: "National Skills Competency Test",
    description:
      "Placed among the highest-scoring participants in Pakistan’s National Skills Competency Test.",
    metrics: [
      { label: "Nationwide rank", value: "65" },
      { label: "Percentile", value: "Top 0.2%" },
    ],
    credential: {
      url: "https://www.hec.gov.pk/english/scholarshipsgrants/Pages/Sites/NSCT-Students.aspx#:~:text=Muhammad%20Talal%20Ahmed,University%20of%20Sargodha",
      label: "View result",
    },
    curated: true,
    curatedOrder: 3,
    showInAll: false,
  });

  for (const badge of credly) {
    const issuer =
      badge.issuer?.entities?.[0]?.entity?.name?.trim() || "Credly";
    achievements.push({
      id: slug(`credly-${badge.id}`),
      provider: "credly",
      kind: "Credly",
      title: badge.badge_template.name,
      issuer,
      image: {
        src: badge.image_url,
        alt: `${badge.badge_template.name} badge`,
      },
      description: badge.badge_template.description,
      date: badge.issued_at,
      expiresAt: badge.expires_at,
      metrics: [
        { label: "Issued", value: badge.issued_at, format: "date" },
        ...(badge.expires_at
          ? [{ label: "Expires", value: badge.expires_at, format: "date" }]
          : []),
      ],
      skills: (badge.badge_template.skills ?? [])
        .slice(0, 6)
        .map((skill) => skill.name),
      credential: {
        url: `https://www.credly.com/badges/${badge.id}/public_url`,
        label: "Verify badge",
      },
      showInAll: true,
    });
  }

  for (const [items, kind] of [
    [specializations, "Specialization"],
    [courses, "Course"],
  ]) {
    for (const certificate of items) {
      const issuer = certificate.product.partners?.[0]?.name ?? "Coursera";
      const professional =
        certificate.product.productVariant === "PROFESSIONAL_CERTIFICATE_S12N";
      const specialization = kind === "Specialization";
      const title = certificate.product.name;
      achievements.push({
        id: slug(`coursera-${certificate.verifyCode}`),
        provider: "coursera",
        kind: professional ? "Professional certificate" : kind,
        title,
        issuer,
        image: certificate.product.partners?.[0]?.squareLogo
          ? {
              src: certificate.product.partners[0].squareLogo.replace(
                "http://",
                "https://",
              ),
              alt: `${issuer} logo`,
            }
          : undefined,
        date: certificate.grantedAt,
        metrics: [
          {
            label: "Completed",
            value: certificate.grantedAt,
            format: "date",
          },
        ],
        credential: {
          url: specialization
            ? `https://www.coursera.org/account/accomplishments/specialization/${certificate.verifyCode}`
            : `https://www.coursera.org/account/accomplishments/verify/${certificate.verifyCode}`,
          label: "View credential",
        },
        curated: title === "Google Cybersecurity",
        curatedOrder: title === "Google Cybersecurity" ? 6 : undefined,
        showInAll: true,
      });
    }
  }

  for (const certificate of thmCertificates) {
    const title =
      certificate.title ??
      certificateTitles[certificate.name] ??
      certificate.name.replaceAll("-", " ");
    achievements.push({
      id: slug(`tryhackme-certificate-${certificate.name}`),
      provider: "tryhackme",
      kind: "Certificate",
      title,
      issuer: "TryHackMe",
      image: certificate.imageUrl
        ? {
            src: certificate.imageUrl,
            alt: `${title} certificate preview`,
          }
        : undefined,
      description: stripMarkup(certificate.description) || undefined,
      date: certificate.achieved,
      metrics: [
        {
          label: "Achieved",
          value: certificate.achieved,
          format: "date",
        },
      ],
      credential: { url: certificate.url, label: "Open certificate" },
      curated: certificate.name === "pathway-soclevel1legacy",
      curatedOrder:
        certificate.name === "pathway-soclevel1legacy" ? 4 : undefined,
      showInAll: true,
    });
  }

  for (const badge of thmBadges) {
    achievements.push({
      id: slug(`tryhackme-badge-${badge.name}`),
      provider: "tryhackme",
      kind: "Badge",
      title: badge.title ?? badge.name.replaceAll("-", " "),
      issuer: "TryHackMe",
      image: badge.image
        ? { src: badge.image, alt: `${badge.title ?? badge.name} badge` }
        : undefined,
      description: badge.description,
      date: badge.earnedAt,
      rarity: {
        tier: badge.rarityTier,
        percent: badge.rarityPercent,
      },
      metrics: [
        ...(badge.earnedAt
          ? [{ label: "Earned", value: badge.earnedAt, format: "date" }]
          : []),
        { label: "Rarity", value: `${badge.rarityPercent}%` },
      ],
      curated: badge.name === "365-day-streak",
      curatedOrder: badge.name === "365-day-streak" ? 5 : undefined,
      showInAll: true,
    });
  }

  if (preferLocalImages) {
    const localImages = await readJson("data/achievement-images.json").catch(
      () => ({}),
    );
    for (const item of achievements) {
      if (item.image && localImages[item.id]) {
        item.image.src = localImages[item.id];
      }
    }
  }

  return achievements.sort((a, b) => a.id.localeCompare(b.id));
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const outputPath = resolve("data/achievements.json");
  const serialized = `${JSON.stringify(await buildAchievements(), null, 2)}\n`;

  if (process.argv.includes("--check")) {
    const current = await readFile(outputPath, "utf8").catch(() => "");
    if (current !== serialized) {
      console.error(
        "data/achievements.json is stale; run npm run normalize:achievements",
      );
      process.exitCode = 1;
    }
  } else {
    await writeFile(outputPath, serialized, "utf8");
    console.log(
      "Normalized achievement data written to data/achievements.json",
    );
  }
}
