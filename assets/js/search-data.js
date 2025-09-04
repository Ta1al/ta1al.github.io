// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Some of my repositories on GitHub.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-what-is-cybersecurity",
        
          title: "What is Cybersecurity?",
        
        description: "An introduction to cybersecurity, its importance, key terms, common attack types, and the CIA Triad.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/what-is-cybersecurity/";
          
        },
      },{id: "post-cyber-espionage-incident-2022",
        
          title: "Cyber Espionage Incident 2022",
        
        description: "A detailed account and analysis of the 2022 cyber espionage incident, a task from the Buildables Fellowship.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/cyber-espionage-incident-2022/";
          
        },
      },{id: "post-completing-thm-soc-path",
        
          title: "completing thm soc path",
        
        description: "The journey through the TryHackMe SOC path",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/completing-thm-soc-path/";
          
        },
      },{id: "post-first-post",
        
          title: "first post",
        
        description: "i finally updated my website",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/first-post/";
          
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6D%61%69%6C@%74%61%31%61%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/Ta1al", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/ta1al", "_blank");
        },
      },{
        id: 'social-discord',
        title: 'Discord',
        section: 'Socials',
        handler: () => {
          window.open("https://discord.gg/sQzVNpB6fs", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
