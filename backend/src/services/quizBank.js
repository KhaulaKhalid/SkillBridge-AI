// Static quiz question bank — 5 MCQs per career category.
// coding-heavy categories get type: "coding-theory"
// non-coding categories get type: "theory"
// These are used when the DB has no seeded questions, or as a seed source.

const CODING_CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "AI / Machine Learning",
  "Cybersecurity",
  "Cloud / DevOps",
  "Game Development",
];

const QUIZ_BANK = {
  "Web Development": [
    {
      skill: "HTML/CSS",
      question: "Which HTML element is used to define the most important heading on a page?",
      options: ["<heading>", "<h6>", "<h1>", "<title>"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "JavaScript",
      question: "What does the '===' operator check in JavaScript?",
      options: ["Value only", "Type only", "Value and type", "Reference only"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "React",
      question: "In React, what hook is used to manage component-level state?",
      options: ["useEffect", "useState", "useRef", "useContext"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "APIs",
      question: "Which HTTP method is idempotent and used to update/replace a resource?",
      options: ["POST", "PATCH", "PUT", "DELETE"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "CSS",
      question: "Which CSS property creates a flexible box layout?",
      options: ["display: block", "display: flex", "display: grid", "display: inline"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
  ],

  "Mobile App Development": [
    {
      skill: "React Native",
      question: "What is the core component used for rendering lists efficiently in React Native?",
      options: ["ScrollView", "FlatList", "ListView", "View"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Mobile Architecture",
      question: "What is the main advantage of using a cross-platform framework like Flutter?",
      options: [
        "Better native performance than Swift/Kotlin",
        "Single codebase for iOS and Android",
        "No need for app store approval",
        "Automatic push notification support",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "State Management",
      question: "Which state management solution is commonly used with Flutter?",
      options: ["Redux", "Vuex", "Provider / Riverpod", "MobX only"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Mobile Security",
      question: "What is the recommended way to store sensitive tokens on a mobile device?",
      options: ["localStorage", "AsyncStorage plain text", "Secure storage / Keychain", "Hardcode in app"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Mobile APIs",
      question: "What format is most commonly used for mobile API communication?",
      options: ["XML", "JSON", "YAML", "SOAP"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
  ],

  "Data Science": [
    {
      skill: "Python",
      question: "Which Python library is primarily used for data manipulation and analysis?",
      options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Statistics",
      question: "What statistical measure represents the middle value in a sorted dataset?",
      options: ["Mean", "Mode", "Median", "Standard Deviation"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Machine Learning",
      question: "Which type of learning uses labeled training data?",
      options: ["Unsupervised", "Reinforcement", "Supervised", "Semi-supervised"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Data Visualization",
      question: "Which Python library is the standard for creating statistical visualizations?",
      options: ["Pandas", "Seaborn", "TensorFlow", "NLTK"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "SQL",
      question: "Which SQL clause is used to filter groups created by GROUP BY?",
      options: ["WHERE", "HAVING", "FILTER", "GROUP FILTER"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
  ],

  "AI / Machine Learning": [
    {
      skill: "Neural Networks",
      question: "What activation function is commonly used in the output layer for binary classification?",
      options: ["ReLU", "Tanh", "Sigmoid", "Softmax"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Deep Learning",
      question: "What technique prevents overfitting by randomly dropping neurons during training?",
      options: ["Batch Normalization", "Dropout", "Early Stopping", "Data Augmentation"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "NLP",
      question: "What does BERT stand for in NLP?",
      options: [
        "Binary Encoding Representation Tool",
        "Bidirectional Encoder Representations from Transformers",
        "Basic Entity Recognition Technology",
        "Batched Encoder Recurrent Transformer",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "hard",
    },
    {
      skill: "Model Evaluation",
      question: "Which metric is best for evaluating a classifier on imbalanced datasets?",
      options: ["Accuracy", "F1-Score", "Mean Squared Error", "R-squared"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Frameworks",
      question: "Which framework was developed by Google for deep learning?",
      options: ["PyTorch", "TensorFlow", "Scikit-learn", "Caffe"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
  ],

  "Cybersecurity": [
    {
      skill: "Networking",
      question: "Which protocol operates at the Transport Layer (Layer 4) of the OSI model?",
      options: ["HTTP", "IP", "TCP", "DNS"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Encryption",
      question: "What type of encryption uses the same key for both encryption and decryption?",
      options: ["Asymmetric", "Symmetric", "Hashing", "Digital Signature"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Web Security",
      question: "Which attack injects malicious scripts into web pages viewed by other users?",
      options: ["SQL Injection", "XSS (Cross-Site Scripting)", "CSRF", "DDoS"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Authentication",
      question: "What does MFA stand for in cybersecurity?",
      options: ["Main Firewall Access", "Multi-Factor Authentication", "Managed File Allocation", "Master Frequency Algorithm"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Penetration Testing",
      question: "What tool is commonly used for network scanning and vulnerability detection?",
      options: ["Wireshark", "Nmap", "Metasploit", "Burp Suite"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
  ],

  "Cloud / DevOps": [
    {
      skill: "AWS",
      question: "Which AWS service provides serverless compute capabilities?",
      options: ["EC2", "Lambda", "S3", "RDS"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Docker",
      question: "What file is used to define a Docker container's configuration?",
      options: ["docker-compose.yml", "Dockerfile", ".dockerignore", "container.json"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "CI/CD",
      question: "What does CI/CD stand for?",
      options: [
        "Code Integration / Code Delivery",
        "Continuous Integration / Continuous Deployment",
        "Central Infrastructure / Central Database",
        "Container Integration / Container Delivery",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Kubernetes",
      question: "What is the smallest deployable unit in Kubernetes?",
      options: ["Node", "Cluster", "Pod", "Service"],
      correctIndex: 2,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Infrastructure",
      question: "What is Infrastructure as Code (IaC)?",
      options: [
        "Writing code inside infrastructure",
        "Managing infrastructure through machine-readable configuration files",
        "Coding on cloud servers directly",
        "Using AI to write infrastructure",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
  ],

  "Game Development": [
    {
      skill: "Game Engines",
      question: "Which game engine uses C# as its primary scripting language?",
      options: ["Unreal Engine", "Unity", "Godot", "CryEngine"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Game Physics",
      question: "What is a 'rigidbody' in game development?",
      options: [
        "A 3D model with no movement",
        "An object that simulates physics like gravity and collisions",
        "A static background element",
        "A type of texture mapping",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Rendering",
      question: "What does FPS stand for in game development?",
      options: ["First Person Shooter", "Frames Per Second", "File Processing System", "Function Per Scope"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "easy",
    },
    {
      skill: "Game Design",
      question: "What design pattern is commonly used for managing game object states?",
      options: ["Observer Pattern", "State Machine", "Singleton", "Factory Pattern"],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "medium",
    },
    {
      skill: "Graphics",
      question: "What is a 'shader' in game development?",
      options: [
        "A tool for darkening textures",
        "A program that runs on the GPU to calculate rendering effects",
        "A type of game asset",
        "A debugging tool for graphics",
      ],
      correctIndex: 1,
      type: "coding-theory",
      difficulty: "hard",
    },
  ],

  "UI/UX Design": [
    {
      skill: "Design Principles",
      question: "What design principle refers to the visual weight distribution in a layout?",
      options: ["Contrast", "Balance", "Hierarchy", "Proximity"],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "User Research",
      question: "What is a 'persona' in UX design?",
      options: [
        "The actual user of the product",
        "A fictional representation of a target user group",
        "A type of wireframe",
        "The brand identity of a product",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "Prototyping",
      question: "What is the difference between a wireframe and a prototype?",
      options: [
        "They are the same thing",
        "Wireframes are low-fidelity layouts; prototypes are interactive simulations",
        "Prototypes are always hand-drawn",
        "Wireframes include final visual design",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "Usability",
      question: "What does 'affordance' mean in UI design?",
      options: [
        "The cost of building a UI",
        "A visual clue that suggests how an element can be used",
        "The loading speed of a page",
        "The amount of white space in a design",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "Accessibility",
      question: "What does WCAG stand for?",
      options: [
        "Web Content Accessibility Guidelines",
        "World Computer Application Guide",
        "Website Creation and Graphics",
        "Web Code And Governance",
      ],
      correctIndex: 0,
      type: "theory",
      difficulty: "medium",
    },
  ],

  "Digital Marketing": [
    {
      skill: "SEO",
      question: "What does SEO stand for?",
      options: ["Site Engine Optimization", "Search Engine Optimization", "Social Engagement Outreach", "Search Entry Output"],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "Content Marketing",
      question: "What is the primary goal of content marketing?",
      options: [
        "Direct selling",
        "Creating valuable content to attract and retain an audience",
        "Buying ad space",
        "Spam email campaigns",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "Analytics",
      question: "Which metric measures the percentage of visitors who leave after viewing only one page?",
      options: ["Conversion Rate", "Click-Through Rate", "Bounce Rate", "Impression Rate"],
      correctIndex: 2,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "Social Media",
      question: "What is 'engagement rate' in social media marketing?",
      options: [
        "Total followers divided by posts",
        "Interactions (likes, comments, shares) relative to audience size",
        "Number of ads run per month",
        "Cost per click on ads",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "PPC",
      question: "What does PPC stand for in digital advertising?",
      options: ["Pay Per Customer", "Pay Per Click", "Post Per Channel", "Product Per Campaign"],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
  ],

  "Business Analysis": [
    {
      skill: "Requirements",
      question: "What is a 'user story' in business analysis?",
      options: [
        "A fictional narrative for entertainment",
        "A short description of a feature from the end user's perspective",
        "A company history document",
        "A marketing case study",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "Methodology",
      question: "Which methodology uses sprints and iterative development?",
      options: ["Waterfall", "Agile / Scrum", "V-Model", "Spiral only"],
      correctIndex: 1,
      type: "theory",
      difficulty: "easy",
    },
    {
      skill: "Documentation",
      question: "What does BRD stand for in business analysis?",
      options: [
        "Business Review Document",
        "Business Requirements Document",
        "Budget Report Document",
        "Baseline Resource Database",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "Stakeholder Management",
      question: "What technique is used to visually map all stakeholders and their influence?",
      options: ["SWOT Analysis", "Stakeholder Matrix / Power-Interest Grid", "Fishbone Diagram", "Gantt Chart"],
      correctIndex: 1,
      type: "theory",
      difficulty: "medium",
    },
    {
      skill: "Process Modeling",
      question: "What does BPMN stand for?",
      options: [
        "Business Process Management Network",
        "Business Process Model and Notation",
        "Business Planning Method Notation",
        "Business Performance Measurement Network",
      ],
      correctIndex: 1,
      type: "theory",
      difficulty: "hard",
    },
  ],
};

function getQuestionsForCategory(category, limit = 5) {
  const questions = QUIZ_BANK[category];
  if (!questions) return [];

  // Return all questions deterministically (no shuffle) so that
  // GET and POST use the same ordering for grading.
  return questions.slice(0, limit).map((q, i) => ({
    _id: "seed_" + category.replace(/\s+/g, "_") + "_" + i,
    ...q,
    category,
  }));
}

function isCodingCategory(category) {
  return CODING_CATEGORIES.includes(category);
}

module.exports = { QUIZ_BANK, CODING_CATEGORIES, getQuestionsForCategory, isCodingCategory };
