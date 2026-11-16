import type { Question } from '@/types'

/**
 * Curated starter question bank.
 * Each question is tagged with concepts it tests so evaluations can map
 * demonstrated and missing concepts accurately.
 *
 * Keep this file as the single source of truth for questions.
 * Add more questions here to expand the bank — no UI changes required.
 */
export const QUESTION_BANK: Question[] = [

  // ─── Java ──────────────────────────────────────────────────────────────────
  {
    id: 'java-001',
    topic: 'java',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is the difference between an abstract class and an interface in Java? When would you use each?',
    tags: ['oop', 'abstraction', 'design'],
    concepts: ['abstract class', 'interface', 'OOP abstraction', 'polymorphism'],
  },
  {
    id: 'java-002',
    topic: 'java',
    type: 'technical',
    difficulty: 'easy',
    text: 'Explain the four principles of Object-Oriented Programming with examples from Java.',
    tags: ['oop', 'fundamentals'],
    concepts: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'],
  },
  {
    id: 'java-003',
    topic: 'java',
    type: 'technical',
    difficulty: 'medium',
    text: 'What is the Java Memory Model? Explain the heap vs stack, and how garbage collection works.',
    tags: ['memory', 'jvm', 'gc'],
    concepts: ['heap memory', 'stack memory', 'garbage collection', 'JVM', 'memory management'],
  },
  {
    id: 'java-004',
    topic: 'java',
    type: 'technical',
    difficulty: 'medium',
    text: 'Explain Java generics. What is type erasure? Why are generics useful?',
    tags: ['generics', 'type-safety'],
    concepts: ['generics', 'type erasure', 'type safety', 'collections'],
  },
  {
    id: 'java-005',
    topic: 'java',
    type: 'technical',
    difficulty: 'medium',
    text: 'What are Java Collections? Compare ArrayList, LinkedList, HashMap, and HashSet — when would you choose each?',
    tags: ['collections', 'data-structures'],
    concepts: ['ArrayList', 'LinkedList', 'HashMap', 'HashSet', 'Collections framework'],
  },
  {
    id: 'java-006',
    topic: 'java',
    type: 'technical',
    difficulty: 'hard',
    text: 'Explain Java concurrency. What are threads, synchronized blocks, and the volatile keyword? How does the Executor framework help?',
    tags: ['concurrency', 'threads', 'multithreading'],
    concepts: ['threads', 'synchronization', 'volatile', 'Executor', 'concurrency', 'deadlock'],
  },
  {
    id: 'java-007',
    topic: 'java',
    type: 'technical',
    difficulty: 'hard',
    text: 'What are Java 8 streams and lambda expressions? Write an example that filters, maps, and collects a list of integers.',
    tags: ['java8', 'streams', 'functional'],
    concepts: ['lambda expressions', 'streams API', 'functional interfaces', 'method references'],
  },
  {
    id: 'java-008',
    topic: 'java',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is the difference between == and .equals() in Java? Why does it matter for Strings?',
    tags: ['equality', 'strings'],
    concepts: ['reference equality', 'value equality', 'String pool', 'equals method'],
  },

  // ─── DSA ──────────────────────────────────────────────────────────────────
  {
    id: 'dsa-001',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is Big-O notation? Explain time and space complexity with examples. What is the difference between O(n) and O(n²)?',
    tags: ['complexity', 'analysis'],
    concepts: ['Big-O notation', 'time complexity', 'space complexity', 'algorithmic analysis'],
  },
  {
    id: 'dsa-002',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'easy',
    text: 'Explain how binary search works. What are its preconditions and what is its time complexity?',
    tags: ['searching', 'binary-search'],
    concepts: ['binary search', 'sorted array', 'O(log n)', 'divide and conquer'],
  },
  {
    id: 'dsa-003',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'medium',
    text: 'Compare merge sort and quicksort. What are their time/space complexities in best, average, and worst cases? When would you prefer one over the other?',
    tags: ['sorting', 'algorithms'],
    concepts: ['merge sort', 'quicksort', 'divide and conquer', 'sorting algorithms', 'pivot selection'],
  },
  {
    id: 'dsa-004',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'medium',
    text: 'Explain hash tables. How do they handle collisions? What is the average and worst-case complexity for lookup?',
    tags: ['hash-table', 'hashing'],
    concepts: ['hash table', 'hash function', 'collision resolution', 'chaining', 'open addressing'],
  },
  {
    id: 'dsa-005',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'medium',
    text: 'What is a binary search tree (BST)? What are its properties and the time complexity of search, insert, and delete?',
    tags: ['trees', 'bst'],
    concepts: ['binary search tree', 'tree traversal', 'BST properties', 'balanced tree'],
  },
  {
    id: 'dsa-006',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'hard',
    text: 'Explain dynamic programming. What is memoization vs tabulation? Give an example problem like the Fibonacci sequence or coin change.',
    tags: ['dynamic-programming', 'optimization'],
    concepts: ['dynamic programming', 'memoization', 'tabulation', 'overlapping subproblems', 'optimal substructure'],
  },
  {
    id: 'dsa-007',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'hard',
    text: 'Explain BFS and DFS graph traversals. When would you use each? What are their time and space complexities?',
    tags: ['graphs', 'traversal'],
    concepts: ['BFS', 'DFS', 'graph traversal', 'queue', 'stack', 'visited nodes'],
  },
  {
    id: 'dsa-008',
    topic: 'dsa',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is a stack and a queue? Describe their operations and give a real-world use case for each.',
    tags: ['stack', 'queue', 'basics'],
    concepts: ['stack', 'queue', 'LIFO', 'FIFO', 'push', 'pop', 'enqueue', 'dequeue'],
  },

  // ─── DBMS ─────────────────────────────────────────────────────────────────
  {
    id: 'dbms-001',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'easy',
    text: 'What are the ACID properties of a database transaction? Explain each property with an example.',
    tags: ['transactions', 'acid'],
    concepts: ['atomicity', 'consistency', 'isolation', 'durability', 'ACID properties'],
  },
  {
    id: 'dbms-002',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is database normalization? Explain 1NF, 2NF, and 3NF with an example.',
    tags: ['normalization', 'schema-design'],
    concepts: ['normalization', '1NF', '2NF', '3NF', 'functional dependencies', 'redundancy elimination'],
  },
  {
    id: 'dbms-003',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'medium',
    text: 'Explain SQL joins. What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN? Give examples.',
    tags: ['sql', 'joins'],
    concepts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'SQL queries'],
  },
  {
    id: 'dbms-004',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'medium',
    text: 'What are database indexes? How do they improve query performance, and what are their trade-offs?',
    tags: ['indexes', 'performance'],
    concepts: ['database index', 'B-tree index', 'query optimization', 'index trade-offs', 'clustered index'],
  },
  {
    id: 'dbms-005',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'hard',
    text: 'What is the difference between SQL and NoSQL databases? When would you choose one over the other? Give examples of each.',
    tags: ['sql-vs-nosql', 'database-types'],
    concepts: ['SQL databases', 'NoSQL databases', 'schema flexibility', 'scalability', 'CAP theorem'],
  },
  {
    id: 'dbms-006',
    topic: 'dbms',
    type: 'technical',
    difficulty: 'hard',
    text: 'Explain transaction isolation levels. What are the problems they prevent (dirty read, non-repeatable read, phantom read)?',
    tags: ['transactions', 'isolation'],
    concepts: ['isolation levels', 'dirty read', 'non-repeatable read', 'phantom read', 'serializable', 'read committed'],
  },

  // ─── Operating Systems ────────────────────────────────────────────────────
  {
    id: 'os-001',
    topic: 'os',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is the difference between a process and a thread? What resources do they share?',
    tags: ['processes', 'threads'],
    concepts: ['process', 'thread', 'shared memory', 'process vs thread', 'context switching'],
  },
  {
    id: 'os-002',
    topic: 'os',
    type: 'technical',
    difficulty: 'easy',
    text: 'Explain CPU scheduling algorithms. Compare FCFS, SJF, Round Robin, and Priority Scheduling.',
    tags: ['scheduling', 'cpu'],
    concepts: ['FCFS', 'SJF', 'Round Robin', 'Priority Scheduling', 'CPU scheduling', 'preemptive scheduling'],
  },
  {
    id: 'os-003',
    topic: 'os',
    type: 'technical',
    difficulty: 'medium',
    text: 'What is a deadlock? What are the four necessary conditions (Coffman conditions) for deadlock to occur? How can it be prevented?',
    tags: ['deadlock', 'concurrency'],
    concepts: ['deadlock', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'deadlock prevention'],
  },
  {
    id: 'os-004',
    topic: 'os',
    type: 'technical',
    difficulty: 'medium',
    text: 'Explain virtual memory and paging. What is a page fault? What is thrashing?',
    tags: ['virtual-memory', 'paging'],
    concepts: ['virtual memory', 'paging', 'page fault', 'page replacement', 'thrashing', 'TLB'],
  },
  {
    id: 'os-005',
    topic: 'os',
    type: 'technical',
    difficulty: 'hard',
    text: 'What are semaphores and mutexes? How do they solve the critical section problem? Explain the producer-consumer problem.',
    tags: ['synchronization', 'semaphores'],
    concepts: ['semaphore', 'mutex', 'critical section', 'producer-consumer', 'synchronization primitives'],
  },
  {
    id: 'os-006',
    topic: 'os',
    type: 'technical',
    difficulty: 'hard',
    text: 'Explain the different types of OS memory allocation: contiguous allocation, paging, and segmentation. Compare their advantages and disadvantages.',
    tags: ['memory', 'allocation'],
    concepts: ['contiguous allocation', 'paging', 'segmentation', 'memory fragmentation', 'memory management'],
  },

  // ─── Computer Networks ────────────────────────────────────────────────────
  {
    id: 'networks-001',
    topic: 'networks',
    type: 'technical',
    difficulty: 'easy',
    text: 'Explain the OSI model. Name each layer and describe its primary responsibility.',
    tags: ['osi', 'networking-basics'],
    concepts: ['OSI model', 'physical layer', 'data link layer', 'network layer', 'transport layer', 'application layer'],
  },
  {
    id: 'networks-002',
    topic: 'networks',
    type: 'technical',
    difficulty: 'easy',
    text: 'What is the difference between TCP and UDP? When would you use each?',
    tags: ['tcp', 'udp', 'transport'],
    concepts: ['TCP', 'UDP', 'reliable transmission', 'connection-oriented', 'connectionless', 'use cases'],
  },
  {
    id: 'networks-003',
    topic: 'networks',
    type: 'technical',
    difficulty: 'medium',
    text: 'Explain the HTTP request-response cycle. What happens from when you type a URL to when the page appears in your browser?',
    tags: ['http', 'dns', 'request-response'],
    concepts: ['DNS resolution', 'TCP handshake', 'HTTP request', 'HTTP response', 'URL parsing', 'browser rendering'],
  },
  {
    id: 'networks-004',
    topic: 'networks',
    type: 'technical',
    difficulty: 'medium',
    text: 'What is the difference between HTTP and HTTPS? How does TLS/SSL work at a high level?',
    tags: ['https', 'tls', 'security'],
    concepts: ['HTTPS', 'TLS', 'SSL', 'encryption', 'certificates', 'public key infrastructure'],
  },
  {
    id: 'networks-005',
    topic: 'networks',
    type: 'technical',
    difficulty: 'hard',
    text: "Explain TCP's three-way handshake and four-way termination. What is a SYN flood and how is it mitigated?",
    tags: ['tcp', 'handshake', 'security'],
    concepts: ['three-way handshake', 'SYN', 'ACK', 'FIN', 'connection establishment', 'SYN flood', 'DoS'],
  },
  {
    id: 'networks-006',
    topic: 'networks',
    type: 'technical',
    difficulty: 'hard',
    text: 'What are REST API design principles? What makes an API RESTful? What is the difference between REST and GraphQL?',
    tags: ['rest', 'api-design'],
    concepts: ['REST principles', 'stateless', 'HTTP methods', 'resources', 'GraphQL', 'API design'],
  },

  // ─── HR & Behavioral ─────────────────────────────────────────────────────
  {
    id: 'behavioral-001',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'easy',
    text: 'Tell me about yourself. What drives your interest in software engineering?',
    tags: ['introduction', 'motivation'],
    concepts: ['self-introduction', 'motivation', 'career goals', 'personal branding'],
  },
  {
    id: 'behavioral-002',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'easy',
    text: 'Describe a challenging project you worked on. What was your role, what challenges did you face, and what was the outcome?',
    tags: ['project-experience', 'problem-solving'],
    concepts: ['STAR method', 'problem-solving', 'project experience', 'teamwork', 'outcome orientation'],
  },
  {
    id: 'behavioral-003',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'medium',
    text: 'Tell me about a time you disagreed with a teammate or manager. How did you handle it?',
    tags: ['conflict-resolution', 'communication'],
    concepts: ['conflict resolution', 'communication', 'empathy', 'professional disagreement', 'team dynamics'],
  },
  {
    id: 'behavioral-004',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'medium',
    text: 'Describe a time when you had to learn a new technology or skill quickly. How did you approach it?',
    tags: ['learning', 'adaptability'],
    concepts: ['learning agility', 'adaptability', 'self-directed learning', 'growth mindset'],
  },
  {
    id: 'behavioral-005',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'medium',
    text: 'Where do you see yourself in 5 years? What are your short-term and long-term career goals?',
    tags: ['career-goals', 'ambition'],
    concepts: ['career planning', 'goal setting', 'professional growth', 'ambition alignment'],
  },
  {
    id: 'behavioral-006',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'hard',
    text: 'Tell me about a time you failed. What did you learn from it and how did you recover?',
    tags: ['failure', 'resilience'],
    concepts: ['failure acknowledgment', 'resilience', 'learning from mistakes', 'growth mindset', 'accountability'],
  },
  {
    id: 'behavioral-007',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'hard',
    text: 'How do you prioritize tasks when you have multiple deadlines and competing demands?',
    tags: ['time-management', 'prioritization'],
    concepts: ['prioritization', 'time management', 'task management', 'decision-making under pressure'],
  },
  {
    id: 'behavioral-008',
    topic: 'behavioral',
    type: 'behavioral',
    difficulty: 'easy',
    text: 'What are your greatest strengths and weaknesses? How are you working to address your weaknesses?',
    tags: ['self-awareness', 'improvement'],
    concepts: ['self-awareness', 'self-improvement', 'honest reflection', 'professional development'],
  },
]

/**
 * Returns questions filtered by topic, difficulty, and/or type.
 * Randomly samples up to `count` questions from the matching pool.
 */
export function getQuestions(params: {
  topic?: string
  difficulty?: string
  type?: string
  count?: number
}): Question[] {
  let pool = [...QUESTION_BANK]

  if (params.topic) {
    pool = pool.filter(q => q.topic === params.topic)
  }
  if (params.difficulty) {
    pool = pool.filter(q => q.difficulty === params.difficulty)
  }
  if (params.type && params.type !== 'mixed') {
    pool = pool.filter(q => q.type === params.type)
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, params.count ?? pool.length)
}
