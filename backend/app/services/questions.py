"""Question bank service — single source of truth for backend question data."""

from __future__ import annotations

import random
from typing import List, Optional

from app.models.schemas import Difficulty, InterviewType, Question, TopicKey

# ─── Question bank ────────────────────────────────────────────────────────────
# Keep in sync with frontend/src/data/questions.ts

QUESTION_BANK: List[Question] = [
    # ── Java ──
    Question(id="java-001", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is the difference between an abstract class and an interface in Java? When would you use each?",
             tags=["oop", "abstraction"], concepts=["abstract class", "interface", "OOP abstraction", "polymorphism"]),
    Question(id="java-002", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="Explain the four principles of Object-Oriented Programming with examples from Java.",
             tags=["oop", "fundamentals"], concepts=["encapsulation", "inheritance", "polymorphism", "abstraction"]),
    Question(id="java-003", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What is the Java Memory Model? Explain the heap vs stack, and how garbage collection works.",
             tags=["memory", "jvm"], concepts=["heap memory", "stack memory", "garbage collection", "JVM"]),
    Question(id="java-004", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Explain Java generics. What is type erasure? Why are generics useful?",
             tags=["generics"], concepts=["generics", "type erasure", "type safety"]),
    Question(id="java-005", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What are Java Collections? Compare ArrayList, LinkedList, HashMap, and HashSet.",
             tags=["collections"], concepts=["ArrayList", "LinkedList", "HashMap", "HashSet"]),
    Question(id="java-006", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain Java concurrency. What are threads, synchronized blocks, and volatile? How does the Executor framework help?",
             tags=["concurrency"], concepts=["threads", "synchronization", "volatile", "Executor"]),
    Question(id="java-007", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="What are Java 8 streams and lambda expressions? Give an example that filters, maps, and collects a list.",
             tags=["java8", "streams"], concepts=["lambda expressions", "streams API", "functional interfaces"]),
    Question(id="java-008", topic=TopicKey.java, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is the difference between == and .equals() in Java? Why does it matter for Strings?",
             tags=["equality"], concepts=["reference equality", "value equality", "String pool"]),

    # ── DSA ──
    Question(id="dsa-001", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is Big-O notation? Explain time and space complexity with examples.",
             tags=["complexity"], concepts=["Big-O notation", "time complexity", "space complexity"]),
    Question(id="dsa-002", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="Explain how binary search works. What are its preconditions and time complexity?",
             tags=["searching"], concepts=["binary search", "sorted array", "O(log n)"]),
    Question(id="dsa-003", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Compare merge sort and quicksort in terms of time/space complexity and use cases.",
             tags=["sorting"], concepts=["merge sort", "quicksort", "divide and conquer"]),
    Question(id="dsa-004", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Explain hash tables. How do they handle collisions? What is average and worst-case lookup complexity?",
             tags=["hash-table"], concepts=["hash table", "hash function", "collision resolution"]),
    Question(id="dsa-005", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What is a binary search tree (BST)? What are its properties and complexity for basic operations?",
             tags=["trees"], concepts=["binary search tree", "BST properties", "balanced tree"]),
    Question(id="dsa-006", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain dynamic programming. What is memoization vs tabulation? Give an example problem.",
             tags=["dp"], concepts=["dynamic programming", "memoization", "tabulation", "optimal substructure"]),
    Question(id="dsa-007", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain BFS and DFS graph traversals. When would you use each?",
             tags=["graphs"], concepts=["BFS", "DFS", "graph traversal"]),
    Question(id="dsa-008", topic=TopicKey.dsa, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is a stack and a queue? Describe their operations and give a real-world use case for each.",
             tags=["stack", "queue"], concepts=["stack", "queue", "LIFO", "FIFO"]),

    # ── DBMS ──
    Question(id="dbms-001", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What are the ACID properties of a database transaction? Explain each with an example.",
             tags=["transactions"], concepts=["atomicity", "consistency", "isolation", "durability"]),
    Question(id="dbms-002", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is database normalization? Explain 1NF, 2NF, and 3NF with an example.",
             tags=["normalization"], concepts=["normalization", "1NF", "2NF", "3NF"]),
    Question(id="dbms-003", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Explain SQL joins: INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with examples.",
             tags=["sql", "joins"], concepts=["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"]),
    Question(id="dbms-004", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What are database indexes? How do they improve query performance, and what are their trade-offs?",
             tags=["indexes"], concepts=["database index", "B-tree index", "query optimization"]),
    Question(id="dbms-005", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
             tags=["sql-vs-nosql"], concepts=["SQL databases", "NoSQL databases", "CAP theorem"]),
    Question(id="dbms-006", topic=TopicKey.dbms, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain transaction isolation levels. What problems do they prevent?",
             tags=["isolation"], concepts=["isolation levels", "dirty read", "non-repeatable read", "phantom read"]),

    # ── OS ──
    Question(id="os-001", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is the difference between a process and a thread? What resources do they share?",
             tags=["processes"], concepts=["process", "thread", "shared memory", "context switching"]),
    Question(id="os-002", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="Explain CPU scheduling algorithms: FCFS, SJF, Round Robin, and Priority Scheduling.",
             tags=["scheduling"], concepts=["FCFS", "SJF", "Round Robin", "Priority Scheduling"]),
    Question(id="os-003", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What is a deadlock? What are the four Coffman conditions? How can deadlock be prevented?",
             tags=["deadlock"], concepts=["deadlock", "mutual exclusion", "hold and wait", "circular wait"]),
    Question(id="os-004", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Explain virtual memory and paging. What is a page fault? What is thrashing?",
             tags=["memory"], concepts=["virtual memory", "paging", "page fault", "thrashing", "TLB"]),
    Question(id="os-005", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="What are semaphores and mutexes? How do they solve the critical section problem?",
             tags=["synchronization"], concepts=["semaphore", "mutex", "critical section", "producer-consumer"]),
    Question(id="os-006", topic=TopicKey.os, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain contiguous allocation, paging, and segmentation. Compare their advantages.",
             tags=["memory-allocation"], concepts=["contiguous allocation", "paging", "segmentation", "fragmentation"]),

    # ── Networks ──
    Question(id="networks-001", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="Explain the OSI model. Name each layer and describe its primary responsibility.",
             tags=["osi"], concepts=["OSI model", "physical layer", "network layer", "application layer"]),
    Question(id="networks-002", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.easy,
             text="What is the difference between TCP and UDP? When would you use each?",
             tags=["tcp", "udp"], concepts=["TCP", "UDP", "reliable transmission", "connection-oriented"]),
    Question(id="networks-003", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="Explain the HTTP request-response cycle. What happens from URL entry to page display?",
             tags=["http"], concepts=["DNS resolution", "TCP handshake", "HTTP request", "HTTP response"]),
    Question(id="networks-004", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.medium,
             text="What is the difference between HTTP and HTTPS? How does TLS/SSL work at a high level?",
             tags=["https", "tls"], concepts=["HTTPS", "TLS", "SSL", "encryption", "certificates"]),
    Question(id="networks-005", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="Explain TCP's three-way handshake and four-way termination. What is a SYN flood?",
             tags=["tcp"], concepts=["three-way handshake", "SYN", "ACK", "FIN", "SYN flood"]),
    Question(id="networks-006", topic=TopicKey.networks, type=InterviewType.technical, difficulty=Difficulty.hard,
             text="What are REST API design principles? What makes an API RESTful? How does REST compare to GraphQL?",
             tags=["rest"], concepts=["REST principles", "stateless", "HTTP methods", "GraphQL"]),

    # ── Behavioral ──
    Question(id="behavioral-001", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.easy,
             text="Tell me about yourself. What drives your interest in software engineering?",
             tags=["introduction"], concepts=["self-introduction", "motivation", "career goals"]),
    Question(id="behavioral-002", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.easy,
             text="Describe a challenging project you worked on. What was your role and what was the outcome?",
             tags=["project-experience"], concepts=["STAR method", "problem-solving", "project experience"]),
    Question(id="behavioral-003", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.medium,
             text="Tell me about a time you disagreed with a teammate or manager. How did you handle it?",
             tags=["conflict"], concepts=["conflict resolution", "communication", "empathy"]),
    Question(id="behavioral-004", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.medium,
             text="Describe a time when you had to learn a new technology quickly. How did you approach it?",
             tags=["learning"], concepts=["learning agility", "adaptability", "growth mindset"]),
    Question(id="behavioral-005", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.medium,
             text="Where do you see yourself in 5 years? What are your short and long-term career goals?",
             tags=["career-goals"], concepts=["career planning", "goal setting", "professional growth"]),
    Question(id="behavioral-006", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.hard,
             text="Tell me about a time you failed. What did you learn from it and how did you recover?",
             tags=["failure"], concepts=["failure acknowledgment", "resilience", "growth mindset"]),
    Question(id="behavioral-007", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.hard,
             text="How do you prioritize tasks when you have multiple deadlines and competing demands?",
             tags=["time-management"], concepts=["prioritization", "time management", "decision-making"]),
    Question(id="behavioral-008", topic=TopicKey.behavioral, type=InterviewType.behavioral, difficulty=Difficulty.easy,
             text="What are your greatest strengths and weaknesses? How are you working to address your weaknesses?",
             tags=["self-awareness"], concepts=["self-awareness", "self-improvement", "honest reflection"]),
]


def get_questions(
    topic: Optional[TopicKey] = None,
    difficulty: Optional[Difficulty] = None,
    interview_type: Optional[InterviewType] = None,
    count: Optional[int] = None,
) -> List[Question]:
    """Filter and sample questions from the bank."""
    pool = list(QUESTION_BANK)

    if topic:
        pool = [q for q in pool if q.topic == topic]
    if difficulty:
        pool = [q for q in pool if q.difficulty == difficulty]
    if interview_type and interview_type != InterviewType.mixed:
        pool = [q for q in pool if q.type == interview_type]

    random.shuffle(pool)
    if count is not None:
        pool = pool[:count]

    return pool


def get_question_by_id(question_id: str) -> Optional[Question]:
    return next((q for q in QUESTION_BANK if q.id == question_id), None)
