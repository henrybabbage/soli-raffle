import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Create Sanity client directly
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aibflqfk",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // You'll need to add this to .env.local if you want to write
});

// Current raffle items data from the frontend
const raffleItems = [
  {
    title: "Private Qigong Session",
    description:
      "Lingji will offer a 1 hour online private qigong session. This session will offer techniques for grounding and regeneration with Zhan Zhuang (qi absorption postures) to bring the body into alignment and relaxation, and Taoist breathing techniques to cleanse and circulate energy.",
    instructor:
      "Lingji Hon 韓靈芝 is a Berlin based Taiji Quan and Qigong teacher.",
    details:
      "Lingji will offer a 1 hour online private qigong session. This session will offer techniques for grounding and regeneration with Zhan Zhuang (qi absorption postures) to bring the body into alignment and relaxation, and Taoist breathing techniques to cleanse and circulate energy.",
    value: "100€",
    contact: [
      { label: "@wudongtaiji", href: "https://instagram.com/wudongtaiji" },
      { label: "www.wudongtaiji.com", href: "https://www.wudongtaiji.com" },
    ],
    image: "/images/1_Lingji.jpg",
    order: 1,
  },
  {
    title: "60-Minute Private Training Session",
    description:
      "Elias offers 1 x 60min private training sessions for either boxing, strength and conditioning, self defence, and kick boxing.",
    instructor: "Elias, boxing coach and MMA practitioner.",
    details:
      "Elias offers 1 x 60min private training sessions for either boxing, strength and conditioning, self defence, and kick boxing.",
    value: "120€",
    contact: [
      { label: "@stillelias", href: "https://instagram.com/stillelias" },
    ],
    image: "/images/2_.jpg",
    order: 2,
  },
  {
    title: "Black and White Film Developing Workshop",
    description:
      "Queer Analog Darkroom offers a Black and White Film Developing Workshop (3 hours).",
    instructor:
      "Queer Analog Darkroom is a self-organized collective committed to a more collaborative approach to visual arts and to resisting the depoliticization of photography.",
    details:
      "Black and White Film Developing Workshop (3 hours). At the core of their work is the darkroom, which works towards the redistribution of knowledge, increasing accessibility and mutual empowerment—both spatially and through shared learning.",
    value: "65€",
    contact: [
      {
        label: "@queeranalogdarkroom",
        href: "https://instagram.com/queeranalogdarkroom",
      },
      { label: "@jetphoto", href: "https://instagram.com/jetphoto" },
    ],
    image: "/images/3_.jpg",
    order: 3,
  },
  {
    title: "60-Minute Personal Training Session",
    description:
      "Eliza offers a 60-minute personal training session with focus on strength training fundamentals, barbell technique, and building mobility and control.",
    instructor:
      "Eliza Cumming – Personal Trainer & Biomechanics Coach. Eliza is a strength and mobility coach based in Berlin, working primarily with FLINTA clients.",
    details:
      "1 x 60-minute personal training session with Eliza. Includes a full-body strength session tailored to your goals, technique coaching, and guidance around mobility or lifting basics.",
    value: "105€",
    contact: [
      { label: "@elizacumming", href: "https://instagram.com/elizacumming" },
    ],
    image: "/images/4_.jpg",
    order: 4,
  },
  {
    title: "Relaxing Facial Skincare Treatment",
    description:
      "A 60 minute facial skincare & relaxation treatment including cleanse, tone, exfoliate, masque and massage options.",
    instructor:
      "A trans* practitioner trained in cosmetic and massage, neurodiversity aware and ready to hear your sensory or access needs.",
    details:
      "60 minute facial skincare & relaxation treatment. Includes: cleanse, tone, exfoliate, masque + options for hand & arm, neck & shoulder massage, and a lymphatic drainage facial massage. Choice of scent: lavender, rosemary or bergamot.",
    value: "50€",
    contact: [{ label: "@qttherapy", href: "https://instagram.com/qttherapy" }],
    image: "/images/5_.jpg",
    order: 5,
  },
  {
    title: "Restorative Massage Ritual",
    description:
      "Varis intuitively combines elements of Ayurvedic and classical massage into a ritual shaped by your individual needs. Flowing oil massage combined with deeper attention to areas where you are storing tension will leave you feeling more relaxed in body & mind. All massages are done using high quality organic oils.",
    instructor: "Varis Lis (they/them).",
    details:
      "Varis intuitively combines elements of Ayurvedic and classical massage into a ritual shaped by your individual needs. Flowing oil massage combined with deeper attention to areas where you are storing tension will leave you feeling more relaxed in body & mind. All massages are done using high quality organic oils.\n\nAccessibility: The sessions Varis offers center on a dialogue around your needs, possible physical injuries, limitations and boundaries you may have. This is always a safer space for comrades, queer and trans babes, BIPOC, sex workers and neurodivergent peeps. Please come tested for COVID and reschedule if you are sick. Unfortunately the space is not wheelchair accessible.",
    value: "150€",
    contact: [
      {
        label: "@existential_moss_moan._",
        href: "https://instagram.com/existential_moss_moan._",
      },
    ],
    image: "/images/6_.jpg",
    order: 6,
  },
  {
    title: "Birth Chart Reading",
    description:
      "Maximilian will offer a one hour online birth chart reading; a place of soulful conversation & engagement with one's personal birth horoscope to illuminate the deeper archetypal patterns of our psyche & life, with a focus on the growth lessons you are currently moving through.",
    instructor: "Maximilian Juno is an evolutionary astrologer & guide.",
    details:
      "Maximilian will offer a one hour online birth chart reading; a place of soulful conversation & engagement with one's personal birth horoscope to illuminate the deeper archetypal patterns of our psyche & life, with a focus on the growth lessons you are currently moving through.",
    value: "130€",
    contact: [
      {
        label: "@skywalker.astrology",
        href: "https://instagram.com/skywalker.astrology",
      },
      {
        label: "www.skywalkerastrology.com",
        href: "https://www.skywalkerastrology.com",
      },
    ],
    image: "/images/7_Maximillian_Juno.jpg",
    order: 7,
  },
  {
    title: "Holistic Bodywork Session",
    description:
      "Denise offers a 1.5hr session of classical swedish massage with lomi lomi influence and thai yoga massage.",
    instructor:
      "Denise is attuned to the body's energetic motions, weaving the art of touch into holistic bodywork sessions that release tension, create space for energy flow, and realign the body with mind and spirit.",
    details:
      "1.5hr session of classical swedish massage with a lomi lomi influence and thai yoga massage. She implements an intuitive approach, tuning into each client's responses and adjusting pressure and techniques accordingly.",
    value: "100€",
    contact: [
      { label: "www.deniseagua.com", href: "https://www.deniseagua.com" },
    ],
    image: "/images/8_Denise.jpg",
    order: 8,
  },
  {
    title: "Craniosacral Therapy Session",
    description:
      "Oly offers a 70 minute craniosacral therapy session to support nervous system regulation and healing.",
    instructor:
      "Oly McDowell (they/them) is a licensed heilpraktiker, biodynamic craniosacral therapist and acupuncturist in training.",
    details:
      "70 minute craniosacral therapy session. Cranio is a somatic touch based therapy that supports people to regulate their nervous system and tune into the healing forces of their body.",
    value: "85€",
    contact: [
      { label: "www.beinginthebody.de", href: "https://www.beinginthebody.de" },
    ],
    image: "/images/9_Oly.jpg",
    order: 9,
  },
  {
    title: "Online Breathwork & Meditation Session",
    description:
      "Diana offers a 1-hour online private session combining pranayama, somatic breathwork, and guided meditation.",
    instructor:
      "Diana Farhat is a Beirut-based holistic psychologist (BA Psychology), Ayurvedic therapist, and senior yoga teacher (500hr) with over 10 years of experience.",
    details:
      "1-hour online private session combining pranayama, somatic breathwork, and guided meditation. Drawing from psychology and Rebirthing Breathwork, the session supports nervous system regulation, emotional release, and deep inner clarity.",
    value: "100€",
    contact: [
      {
        label: "@integratedhealingtherapy",
        href: "https://instagram.com/integratedhealingtherapy",
      },
    ],
    image: "/images/10_Diana.jpg",
    order: 10,
  },
  {
    title: "60-Minute Bodywork Session",
    description:
      "Rachel offers a 1-hour 1:1 Bodywork Session focused on mindful touch, presence, and deep listening.",
    instructor:
      "Rachel Helmbrecht is a Berlin based Bodyworker and Physiotherapist.",
    details:
      "1-hour 1:1 Bodywork Session. It is a space of mindful touch, presence, and deep listening, which can create a sense of grounding, deeper relaxation, and renewed vitality.",
    value: "90€",
    contact: [
      {
        label: "@rachelhelmbrecht",
        href: "https://instagram.com/rachelhelmbrecht",
      },
      {
        label: "www.koerpertherapie-helmbrecht.de",
        href: "https://www.koerpertherapie-helmbrecht.de",
      },
    ],
    image: "/images/11_Rachel.jpg",
    order: 11,
  },
  {
    title: "Somatic & Bodywork Session",
    description:
      "Tara offers a 1.5 hour somatic/bodywork based session exploring your needs through hands-on techniques and somatic exercises.",
    instructor:
      "Tara is a Berlin based Bodyworker and Somatic facilitator. Her pillars of work are one-on-one and group somatic coaching, tantric bodywork, and tantric and intimacy coaching.",
    details:
      "1.5 hour somatic/bodywork based session, where we will explore your needs through various hands on techniques and somatic exercises.",
    value: "180€",
    contact: [
      { label: "@tara_embodied", href: "https://instagram.com/tara_embodied" },
      {
        label: "www.sensuali.com/tara-18880/",
        href: "https://www.sensuali.com/tara-18880/",
      },
    ],
    image: "/images/12_Tara.jpg",
    order: 12,
  },
];

async function migrateToSanity() {
  console.log("Starting migration to Sanity...");
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);

  // Check if we have a write token
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.log("\n⚠️  Warning: No SANITY_API_WRITE_TOKEN found in .env.local");
    console.log("You may need to add a write token to create documents.");
    console.log(
      "Get a token from: https://www.sanity.io/manage/project/aibflqfk/api"
    );
    console.log(
      "Then add it to .env.local as: SANITY_API_WRITE_TOKEN=your-token-here\n"
    );
  }

  try {
    for (const item of raffleItems) {
      console.log(`Migrating: ${item.title}`);

      // Note: The image field will need to be handled separately
      // as Sanity requires images to be uploaded first
      const document = {
        _type: "raffleItem",
        title: item.title,
        description: item.description,
        instructor: item.instructor,
        details: item.details,
        value: item.value,
        contact: item.contact,
        // Commenting out image for now as it needs special handling
        // image: {
        //   _type: "image",
        //   asset: {
        //     _type: "reference",
        //     _ref: item.image,
        //   },
        // },
        isActive: true,
        order: item.order,
        slug: {
          _type: "slug",
          current: item.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        },
      };

      const result = await client.create(document);
      console.log(`✅ Created: ${item.title} with ID: ${result._id}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📝 Note: Images were not migrated. You'll need to:");
    console.log("1. Upload the images to Sanity Studio manually");
    console.log("2. Update each raffle item with the correct image reference");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    if (error.statusCode === 401) {
      console.error(
        "\n🔑 Authentication error. Please add a write token to .env.local:"
      );
      console.error("SANITY_API_WRITE_TOKEN=your-token-here");
      console.error(
        "\nGet a token from: https://www.sanity.io/manage/project/aibflqfk/api"
      );
    }
  }
}

// Run the migration
migrateToSanity();
