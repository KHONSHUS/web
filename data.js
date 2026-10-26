// ==========================================================
// YOUR DETAILS. Edit the text between the quotes, save, refresh.
// Image paths point to your "assets" folder. Leave "" for none.
// ==========================================================
const PORTFOLIO = {

  site: {
    title: "Ardy | Web Developer",
    description: "Portfolio of Ardy, a developer who enjoys coding and building websites & mobile apps.",
    brand: "Ardy"
  },

  // Loading screen: the page title shown in the code and the name that gets typed
  preloader: {
    pageTitle: "MY PORTFOLIO",
    name: "ARDY MANGANTI"
  },

  // Menu links (the href must match a section id)
  nav: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Achievements", href: "#achievements" },
    { label: "Contact", href: "#contact" }
  ],

  hero: {
    topLeft: "Ardy, portfolio",
    topRight: "2026",
    role: "Web & Mobile Developer · Enjoying code & building things",
    headline: "Hi, I'm Ardy. I build websites that make everyday tasks simpler.",
    pitch: "I design and code mobile apps with Flutter, and I'm always enjoying coding, learning, and shipping real projects.",
    ctaProjects: "See projects",
    ctaResume: "Download resume",
    scrollLeft: "Scroll to explore",
    scrollRight: "About, projects, contact"
  },

  // Swipeable cards in the hero (use 3 to 5)
  heroImages: [
    { title: "Attendly", image: "./attendly.jpg" },
    { title: "Manila City Library", image: "./mcl.jpg" },
    { title: "DSWD", image: "./4Ps.png" },
  ],

  about: {
    heading: "About",
    number: "§ 01",
    photo: "./PFP.jpg",
    photoAlt: "Photo of Ardy",
    caption: "Ardy, 2026",
    lede: "A developer who enjoys coding and turns small, everyday problems into simple, usable apps.",
    body: "I build mobile apps with Flutter and Dart, and I also work with C#, HTML, and CSS. I care about apps that are clear to use, and I like writing down how things work so others can follow. I'm open to new opportunities, collaborations, and freelance projects.",
    columns: [
      { label: "What I do", text: "Mobile app development, UI implementation, IT support, and technical documentation." },
      { label: "What I am into", text: "Gaming, space, Marvel lore, and philosophy." }
    ]
  },

  // github / demo: leave "" and the button shows a "coming soon" message
  projects: {
    heading: "Projects",
    number: "§ 02",
    items: [
      {
        title: "Attendly",
        description: "An attendance app where students and teachers sign in with their own role. It replaces paper attendance sheets with a quick tap.",
        role: "Developer",
        stack: "Flutter, Dart",
        image: "./attendly.jpg",
        github: "",
        demo: ""
      },
      {
        title: "Manila City Library",
        description: "A barcode-based library system where borrowers and staff scan their IDs to borrow, return, and log attendance. It replaces paper logbooks with a quick scan.",
        role: "Developer",
        stack: "HTML, CSS, JAVSCRIPT, PHP, PYTHON",
        image: "./mcl.jpg",
        github: "",
        demo: ""
      },
      {
        title: "DSWD - 4Ps",
        description: "A dashboard for DSWD built on the Frappe framework during my OJT at Xurpas. I built the front-end from the team's UI design using HTML, CSS, and JavaScript.",
        role: "Front End",
        stack: "HTML, CSS, JAVSCRIPT",
        image: "./4Ps.png",
        github: "",
        demo: ""
      }
    ]
  },

  skills: {
    heading: "Skills",
    number: "§ 03",
    groups: [
      { label: "Programming", items: ["Flutter and Dart", "C#", "HTML and CSS", "JavaScript" , "PHP" , "Python"] },
      { label: "Tools", items: ["Git and GitHub", "VS Code", "Figma", "Firebase" , "Hostinger" , "Fruitask"] },
      { label: "Working with people", items: ["IT support", "Technical documentation", "Teamwork", "Communication"] }
    ]
  },

  experience: {
    heading: "Experience",
    number: "§ 04",
    items: [
      {
        year: "2025",
        title: "OJT, Xurpas Inc.",
        description: "We worked in the BENCH Python/Frappe department. I built front-end components for DSWD dashboards, created report templates, and configured the Asset Management module."
      },
      {
        year: "2025",
        title: "GAPK Library System",
        description: "An RFID-based library system for borrowing and returning books. It replaces manual recording with a quick card tap. 3rd place CITExpo."
      }
    ]
  },

  // Add a certificate = add one line to items. Everything else is automatic.
  // image: landscape picture in assets/. If missing, a text preview is shown.
  achievements: {
    heading: "Achievements",
    number: "§ 05",
    speed: 60,
    items: [
      { title: "Hour of code session", issuer: "SmartCT / ", year: "2025", image: "./ARA.jpg" },
      { title: "Ethical Hacking and Responsible Disclosure", issuer: "West Visayas State University", year: "2025", image: "./WVSU.jpg" },
      { title: "Company Proposal and System Showcase", issuer: "PHINMA - Saint Jude College Manila", year: "2024", image: "./CPSS.jpg" }
    ]
  },

  contact: {
    heading: "Contact",
    number: "§ 06",
    lede: "Want to work together? Send me a message.",
    formspree: "https://formspree.io/f/xeaaakwp",
    email: "mangantiardy6@example.com",
    linkedin: "https://www.linkedin.com/in/ardymanganti/",
    github: "https://github.com/KHONSHUS",
    resume: "assets/Ardy Manganti - CV.pdf"
  },

  footer: {
    name: "Ardy"
  },

  // Small labels and messages used around the page
  ui: {
    skipToContent: "Skip to content",
    dark: "Dark",
    light: "Light",
    menu: "Menu",
    close: "Close",
    preloaderSkip: "Skip [Esc]",
    imagePlaceholder: "Image",
    photoPlaceholder: "Your photo",
    projectPlaceholder: "Screenshot or demo",
    role: "Role",
    stack: "Stack",
    github: "GitHub",
    demo: "Live demo",
    linkedin: "LinkedIn",
    resume: "Resume (PDF)",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    sent: "Message sent — thank you!",
    sendError: "Something went wrong. Please try again or email me directly.",
    copy: "Copy",
    copied: "✓ Copied!",
    backToTop: "Back to top",
    comingSoon: "Coming soon — currently working on this!",
    comingSoonSuffix: " — coming soon, working on it!",
    lightboxHint: "Press [Esc] or click outside to close",
    certLabel: "Certificate",
    certHover: "Hover to inspect",
    certLandscape: "Landscape Certificate",
    certExpand: "Click to expand"
  }
};
