export interface AboutData {
  title: string;
  tagline: string;
  heroImage: string;
  heroGallery: string[];
  myStory: {
    heading: string;
    paragraphs: string[];
    galleryImages: string[];
  };
  philosophyQuote: string;
  behindTheLens: {
    heading: string;
    tagline: string;
    leftImages: string[];
    centerImage: string;
    rightImages: string[];
    description: string;
  };
  teamPhoto: string;
  teamDescription: string;
  cta: {
    heading: string;
    subheading: string;
    buttonText: string;
  };
}

export const aboutData: AboutData = {
  title: "I'M WIDYMOTRET",
  tagline: "A passionate photographer with an eye for honest, powerful moments",
  heroImage: "/portrait/portrait (1).png",
  heroGallery: [
    "/landscape/landscape (2).png",
    "/landscape/landscape (3).png",
  ],
  myStory: {
    heading: "My story",
    paragraphs: [
      "My love for photography started with a borrowed camera and a sunset.",
      "Since then, I've chased light, laughter, and the in-between moments that make life feel real.",
      "I photograph to preserve stories—the ones you're living right now.",
    ],
    galleryImages: [
      "/portrait/portrait (2).png",
      "/portrait/portrait (3).png",
    ],
  },
  philosophyQuote: "I believe great photography happens when people feel seen, not posed.",
  behindTheLens: {
    heading: "Behind the Lens",
    tagline: "When I'm not behind the camera, I'm hiking, sipping coffee, or chasing sunsets.",
    leftImages: [
      "/landscape/landscape (1).png",
      "/landscape/landscape (2).png",
      "/landscape/landscape (3).png",
    ],
    centerImage: "/portrait/portrait (2).png",
    rightImages: [
      "/landscape/landscape (4).png",
      "/portrait/portrait (3).png",
      "/portrait/portrait (4).png",
    ],
    description: "Every moment captured is a story preserved for a lifetime.",
  },
  teamPhoto: "/landscape/landscape (2).png",
  teamDescription: "Meet the creative minds behind every stunning shot. Our dedicated team brings passion, expertise, and a commitment to capturing your most precious moments.",
  cta: {
    heading: "Made up your mind yet?",
    subheading: "Let's talk about your visions and how I can bring them to life",
    buttonText: "Contact me",
  },
};
