// All portfolio content lives here. Edit this file to update the site —
// both the game and the classic view render from it.

export const profile = {
  name: 'Mauricio Godoy',
  handle: 'Keston',
  titles: ['Software Engineer', 'Full Stack Developer', 'Tech Enthusiast'],
  location: 'Córdoba, Argentina',
  email: 'godoy.hmauricio@gmail.com',
  phone: '+54 (351) 3430 693',
  photo: '/img/user-photo.jpg',
  resume: '/files/Mauricio_Godoy_Resume.pdf',
  yearsExperience: '10+',

  socials: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/mauricio-godoy-37a30565' },
    { label: 'WhatsApp', url: 'https://wa.me/+5493513430693' },
    { label: 'Telegram', url: 'https://telegram.me/GodoyHMauricio' },
  ],

  about: [
    "Hello! I'm Mauricio Godoy, a Software Engineer who is passionate about delivering the best solutions. Something I love about my career is the opportunity to work with a variety of new technologies, which has sharpened my ability to learn fast. It also gives me the opportunity to work with many different people and departments. As a person who loves building new relationships, it's great to come together with other professionals and listen to their perspectives.",
    'I have a couple of hobbies, but what I like the most is playing sports and travelling. One of my favorite things to do is reading about and trying new technologies.',
  ],

  interests: [
    { icon: '🎵', label: 'Music' },
    { icon: '✈️', label: 'Travelling' },
    { icon: '💻', label: 'Coding' },
    { icon: '🎬', label: 'Movies' },
    { icon: '🔧', label: 'Technology' },
    { icon: '📚', label: 'Reading' },
    { icon: '🎮', label: 'Video games' },
    { icon: '⚽', label: 'Sports' },
  ],

  experience: [
    {
      role: 'Full Stack Developer',
      company: 'Dexteel',
      period: 'May 2023 – Present',
      current: true,
      project: '',
      summary: [
        'Responsible for the analysis, design, and implementation of high-quality, scalable solutions that meet client requirements.',
        'Work spans both front-end and back-end development, with a focus on seamless, user-friendly interfaces that enhance user experience.',
        'Drive continuous improvement by proposing innovative solutions to optimize performance and usability.',
      ],
      tech: ['JavaScript', 'C#', 'React', 'Backbone.js', 'Jenkins', 'Git', 'SQL Server', 'Stored procedures'],
    },
    {
      role: 'Software Engineer',
      company: 'TEAM International',
      period: 'Apr 2022 – May 2023',
      current: false,
      project: 'Basis Technology — Machine Learning / Event Analysis products',
      summary: [
        'Analysis and development of solutions using different types of technologies.',
        'Improvement of code and existing solutions.',
        'Implementation of CI/CD using GitLab pipelines.',
      ],
      tech: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'SonarQube', 'GitLab', 'PL/SQL (Oracle)', 'Spring Cloud', 'Docker', 'Kubernetes', 'Helm', 'Kafka'],
    },
    {
      role: 'Software Engineer',
      company: 'Intive',
      period: 'May 2021 – Apr 2022',
      current: false,
      project: 'CoinMe — Cryptocurrency wallet',
      summary: ['Responsible for developing assigned requirements end to end, from development and testing to production deployment.'],
      tech: ['Java', 'Spring Boot', 'Blockchain', 'Event-driven architecture', 'Maven', 'Redis', 'Axon', 'Reactive programming', 'Kafka', 'Spring Cloud', 'Docker', 'Kubernetes', 'Git'],
    },
    {
      role: 'Solutions Architect',
      company: 'Telecom Personal',
      period: 'Jan 2020 – May 2021',
      current: false,
      project: '',
      summary: [
        'Responsible for architecting and developing requirements.',
        'Built proofs of concept to bring a clear approach of the solution to the client.',
        'Ensured a secure and efficient software development cycle.',
      ],
      tech: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'SonarQube', 'Bitbucket', 'PL/SQL (Oracle)', '.NET Core', '.NET Framework', 'C#', 'OpenShift', 'AWS', 'Lambda'],
    },
    {
      role: 'Integration Expert',
      company: 'TECLAB',
      period: 'Aug 2019 – Jan 2020',
      current: false,
      project: 'Education-tech online platform',
      summary: [
        'Designed and developed an education-tech online platform.',
        'Developed microservices to enable communication between systems.',
        'Implemented CI/CD using GitLab pipelines.',
      ],
      tech: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'SonarQube', 'GitLab', 'PL/SQL (Oracle)'],
    },
  ],

  education: [
    { degree: 'Software Engineer', school: 'Universidad Siglo 21', period: '2014 – 2019', status: 'Graduated' },
    { degree: 'Systems Analyst', school: 'Universidad Siglo 21', period: '2014 – 2017', status: 'Graduated' },
  ],

  certifications: [
    {
      title: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      description: 'Overall understanding of the AWS Cloud independent of specific technical roles: cloud concepts, AWS services, security, architecture, pricing, and support.',
    },
    {
      title: 'AWS: Architecting Serverless Solutions',
      issuer: 'Amazon Web Services',
      description: 'Event-driven serverless architecture: planning for failure management, performance testing, application auditing, and deploying and updating serverless applications without downtime.',
    },
    {
      title: 'AWS Technical Professional',
      issuer: 'Amazon Web Services',
      description: 'Fundamental technical knowledge of AWS cloud computing and its supporting infrastructure.',
    },
    {
      title: 'Red Hat Delivery Specialist — Container Platform Application Deployment',
      issuer: 'Red Hat',
      description: 'Using container technology to deploy and manage business applications on the OpenShift container orchestration engine with CI/CD tooling.',
    },
  ],

  skills: [
    { name: 'Software Development', level: 88 },
    { name: 'Analysis & Design', level: 86 },
    { name: 'Software Architecture', level: 85 },
  ],

  techSkills: [
    { name: 'Java', level: 88 },
    { name: 'C#', level: 86 },
    { name: 'DevOps / CI-CD', level: 85 },
    { name: 'React', level: 85 },
    { name: 'Python', level: 84 },
    { name: 'AWS', level: 84 },
    { name: 'Next.js', level: 83 },
    { name: 'AI', level: 83 },
  ],

  process: [
    { step: '01', title: 'Analysis', text: 'Analyze the problem or idea to extract requirements.' },
    { step: '02', title: 'Design', text: 'Based on the requirements, design an efficient solution.' },
    { step: '03', title: 'Develop', text: 'Choose the right technologies for the designed solution and its scenarios.' },
    { step: '04', title: 'Deliver', text: 'Deliver right-sized solutions to the client.' },
  ],
};
