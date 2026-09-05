// Coding challenges for coding-heavy categories.
// Each challenge has a problem statement, starter code, and test cases.
// Judge0 language IDs: 63=JavaScript(Node), 71=Python3, 62=Java, 54=C++

const CODING_CHALLENGES = {
  "Web Development": {
    title: "FizzBuzz API Response",
    description: "Write a function that takes a number n and returns a JSON-stringified array of strings from 1 to n. For multiples of 3, return 'Fizz'. For multiples of 5, return 'Buzz'. For multiples of both, return 'FizzBuzz'. Example: fizzBuzz(5) should print [\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"] (use JSON.stringify).",
    difficulty: "Easy",
    language: "javascript",
    languageId: 63,
    starterCode: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return JSON.stringify(result);
}

// Judge0 passes the input via stdin. Read it and call your function.
const input = require("fs").readFileSync(0, "utf-8").trim();
console.log(fizzBuzz(parseInt(input)));
`,
    testCases: [
      { input: "5", expectedOutput: '["1","2","Fizz","4","Buzz"]' },
      { input: "15", expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
    ],
    solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return JSON.stringify(result);
}
console.log(fizzBuzz(parseInt(process.argv[2] || readStdin())));
`,
  },

  "Mobile App Development": {
    title: "Contact List Filter",
    description: "Write a function that takes an array of contact objects (each with 'name' and 'phone') and a search string. Return only contacts whose name starts with the search string (case-insensitive).",
    difficulty: "Easy",
    language: "javascript",
    languageId: 63,
    starterCode: `function filterContacts(contacts, search) {
  // contacts is an array of {name, phone} objects
  // search is a string to filter by (name starts with)
  // Return the filtered array
}
`,
    testCases: [
      {
        input: JSON.stringify({ contacts: [{ name: "Ali", phone: "123" }, { name: "Ahmed", phone: "456" }, { name: "Bilal", phone: "789" }], search: "A" }),
        expectedOutput: JSON.stringify([{ name: "Ali", phone: "123" }, { name: "Ahmed", phone: "456" }]),
      },
    ],
    solution: `function filterContacts(contacts, search) {
  return contacts.filter(c => c.name.toLowerCase().startsWith(search.toLowerCase()));
}
const input = JSON.parse(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(JSON.stringify(filterContacts(input.contacts, input.search)));
`,
  },

  "Data Science": {
    title: "Calculate Mean and Standard Deviation",
    description: "Write a Python function that takes a list of numbers and returns a dictionary with 'mean' and 'std_dev' (population standard deviation, rounded to 2 decimal places).",
    difficulty: "Medium",
    language: "python",
    languageId: 71,
    starterCode: `import json, sys

def analyze(data):
    # Calculate mean and population standard deviation
    # Return {"mean": x, "std_dev": y} both rounded to 2 decimals
    pass

data = json.loads(input())
result = analyze(data)
print(json.dumps(result))
`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: '{"mean": 3.0, "std_dev": 1.41}' },
      { input: "[10, 20, 30]", expectedOutput: '{"mean": 20.0, "std_dev": 8.16}' },
    ],
    solution: `import json, math, sys

def analyze(data):
    n = len(data)
    mean = sum(data) / n
    variance = sum((x - mean) ** 2 for x in data) / n
    std_dev = math.sqrt(variance)
    return {"mean": round(mean, 2), "std_dev": round(std_dev, 2)}

data = json.loads(input())
result = analyze(data)
print(json.dumps(result))
`,
  },

  "AI / Machine Learning": {
    title: "Sigmoid Activation Function",
    description: "Implement the sigmoid activation function. Given a number x, return 1 / (1 + e^(-x)), rounded to 4 decimal places.",
    difficulty: "Easy",
    language: "python",
    languageId: 71,
    starterCode: `import json, math

def sigmoid(x):
    # Implement sigmoid function
    # Return result rounded to 4 decimal places
    pass

x = float(input())
print(round(sigmoid(x), 4))
`,
    testCases: [
      { input: "0", expectedOutput: "0.5" },
      { input: "1", expectedOutput: "0.7311" },
      { input: "-1", expectedOutput: "0.2689" },
    ],
    solution: `import json, math

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

x = float(input())
print(round(sigmoid(x), 4))
`,
  },

  "Cybersecurity": {
    title: "Caesar Cipher Encryption",
    description: "Implement a Caesar cipher that shifts each letter in a string by a given key. Only shift alphabetic characters; keep spaces and punctuation unchanged.",
    difficulty: "Medium",
    language: "python",
    languageId: 71,
    starterCode: `import json

def caesar_cipher(text, shift):
    # Encrypt text using Caesar cipher with given shift
    # Only shift alphabetic characters
    pass

data = json.loads(input())
print(caesar_cipher(data["text"], data["shift"]))
`,
    testCases: [
      { input: '{"text": "Hello World", "shift": 3}', expectedOutput: "Khoor Zruog" },
      { input: '{"text": "abc", "shift": 1}', expectedOutput: "bcd" },
    ],
    solution: `import json

def caesar_cipher(text, shift):
    result = []
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)

data = json.loads(input())
print(caesar_cipher(data["text"], data["shift"]))
`,
  },

  "Cloud / DevOps": {
    title: "Log Parser - Error Counter",
    description: "Write a function that takes an array of log strings and returns a count of ERROR, WARNING, and INFO level logs as a JSON object.",
    difficulty: "Easy",
    language: "javascript",
    languageId: 63,
    starterCode: `function countLogLevels(logs) {
  // logs is an array of strings like "ERROR: disk full", "INFO: started", "WARNING: low memory"
  // Return { ERROR: number, WARNING: number, INFO: number }
}
`,
    testCases: [
      {
        input: '["ERROR: disk full","INFO: started","WARNING: low memory","ERROR: timeout","INFO: connected"]',
        expectedOutput: '{"ERROR":2,"WARNING":1,"INFO":2}',
      },
    ],
    solution: `function countLogLevels(logs) {
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  logs.forEach(log => {
    const level = log.split(":")[0].trim();
    if (counts[level] !== undefined) counts[level]++;
  });
  return counts;
}
const input = JSON.parse(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(JSON.stringify(countLogLevels(input)));
`,
  },

  "Game Development": {
    title: "2D Distance Calculator",
    description: "Write a function that calculates the Euclidean distance between two 2D points. Given objects {x1, y1, x2, y2}, return the distance rounded to 2 decimal places.",
    difficulty: "Easy",
    language: "javascript",
    languageId: 63,
    starterCode: `function distance(p) {
  // p has x1, y1, x2, y2
  // Return Euclidean distance rounded to 2 decimal places
}
`,
    testCases: [
      { input: '{"x1":0,"y1":0,"x2":3,"y2":4}', expectedOutput: "5" },
      { input: '{"x1":1,"y1":1,"x2":4,"y2":5}', expectedOutput: "5" },
    ],
    solution: `function distance(p) {
  return Math.round(Math.sqrt((p.x2-p.x1)**2 + (p.y2-p.y1)**2) * 100) / 100;
}
const input = JSON.parse(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(distance(input));
`,
  },
};

function getChallengeForCategory(category) {
  return CODING_CHALLENGES[category] || null;
}

module.exports = { CODING_CHALLENGES, getChallengeForCategory };
