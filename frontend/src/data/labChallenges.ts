/**
 * Engineering Lab challenge bank.
 * Coding challenges, debugging problems, and system design prompts.
 * All problems are static — no live code execution (security).
 * AI evaluates the candidate's reasoning explanation, not code output.
 */

export type LabTrack = 'coding' | 'debugging' | 'system_design'
export type LabDifficulty = 'easy' | 'medium' | 'hard'

// ─── Coding challenges ────────────────────────────────────────────────────────

export interface CodingChallenge {
  id: string
  track: 'coding'
  title: string
  difficulty: LabDifficulty
  tags: string[]
  description: string
  constraints: string[]
  examples: Array<{ input: string; output: string; explanation?: string }>
  starterCode: Record<string, string>  // language → starter code
  testCases: Array<{ input: string; expected: string }>
  hints: string[]
  timeComplexity: string
  spaceComplexity: string
  concepts: string[]
}

// ─── Debugging challenges ─────────────────────────────────────────────────────

export interface DebuggingChallenge {
  id: string
  track: 'debugging'
  title: string
  difficulty: LabDifficulty
  tags: string[]
  language: string
  buggyCode: string
  description: string
  symptoms: string[]  // what the bug causes
  bugDescription: string   // shown AFTER submission
  fixedCode: string        // shown AFTER submission
  concepts: string[]
}

// ─── System design ────────────────────────────────────────────────────────────

export interface SystemDesignChallenge {
  id: string
  track: 'system_design'
  title: string
  difficulty: LabDifficulty
  tags: string[]
  scenario: string
  requirements: string[]
  constraints: string[]
  evaluationCriteria: string[]
  keyComponents: string[]
  concepts: string[]
  hints: string[]
}

export type LabChallenge = CodingChallenge | DebuggingChallenge | SystemDesignChallenge

// ─── Coding challenge bank ─────────────────────────────────────────────────────

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'code-001',
    track: 'coding',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['array', 'hash-map'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

You may assume each input has exactly one solution, and you may not use the same element twice.`,
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      'Exactly one valid answer exists',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]' },
      { input: 'nums = [3,3], target = 6',        output: '[0,1]' },
    ],
    starterCode: {
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
};`,
    },
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6',     expected: '[1,2]' },
      { input: '[3,3], 6',       expected: '[0,1]' },
    ],
    hints: [
      'A brute-force O(n²) solution checks all pairs.',
      'Can you reduce to O(n) using a hash map?',
      'For each element, check if (target - element) is already in the map.',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    concepts: ['hash map', 'array traversal', 'complement lookup'],
  },
  {
    id: 'code-002',
    track: 'coding',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'string'],
    description: `Given a string \`s\` containing only characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

A string is valid if:
- Open brackets are closed by the same type of bracket.
- Open brackets are closed in the correct order.
- Every closing bracket has a corresponding open bracket.`,
    constraints: [
      '1 ≤ s.length ≤ 10⁴',
      's consists of parentheses only',
    ],
    examples: [
      { input: 's = "()"',      output: 'true' },
      { input: 's = "()[]{}"',  output: 'true' },
      { input: 's = "(]"',      output: 'false', explanation: '( requires ) to close' },
    ],
    starterCode: {
      java: `class Solution {
    public boolean isValid(String s) {
        // Your solution here
    }
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your solution here
        pass`,
      javascript: `var isValid = function(s) {
    // Your solution here
};`,
    },
    testCases: [
      { input: '"()"',     expected: 'true' },
      { input: '"()[]{}"', expected: 'true' },
      { input: '"(]"',     expected: 'false' },
      { input: '"([)]"',   expected: 'false' },
    ],
    hints: [
      'Think about what data structure helps you track the last unmatched opening bracket.',
      'A stack is perfect — push open brackets, pop and match on close.',
      'If the stack is empty when you see a closing bracket, return false.',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    concepts: ['stack', 'bracket matching', 'string processing'],
  },
  {
    id: 'code-003',
    track: 'coding',
    title: 'Binary Search',
    difficulty: 'easy',
    tags: ['binary-search', 'array'],
    description: `Given a sorted array of distinct integers \`nums\` and a target value, return the index of \`target\` if it is in the array, or \`-1\` if it is not.

You must write an algorithm with **O(log n)** runtime complexity.`,
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'Array is sorted in ascending order', 'All values are distinct'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists at index 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist' },
    ],
    starterCode: {
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your solution here
    }
}`,
      python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        # Your solution here
        pass`,
      javascript: `var search = function(nums, target) {
    // Your solution here
};`,
    },
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expected: '4' },
      { input: '[-1,0,3,5,9,12], 2', expected: '-1' },
    ],
    hints: [
      'Maintain left and right pointers.',
      'At each step, check the middle element.',
      'Eliminate half the remaining elements based on comparison.',
    ],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    concepts: ['binary search', 'divide and conquer', 'sorted arrays'],
  },
  {
    id: 'code-004',
    track: 'coding',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: ['dynamic-programming', 'array', 'kadane'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.`,
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' },
      { input: 'nums = [1]',                       output: '1' },
      { input: 'nums = [5,4,-1,7,8]',              output: '23' },
    ],
    starterCode: {
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
    }
}`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Your solution here
        pass`,
      javascript: `var maxSubArray = function(nums) {
    // Your solution here
};`,
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[1]',                       expected: '1' },
      { input: '[5,4,-1,7,8]',              expected: '23' },
    ],
    hints: [
      "Kadane's algorithm: at each position decide whether to extend the current subarray or start fresh.",
      'currentMax = max(nums[i], currentMax + nums[i])',
      'Track the global maximum as you iterate.',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    concepts: ["Kadane's algorithm", 'dynamic programming', 'subarray problems'],
  },
  {
    id: 'code-005',
    track: 'coding',
    title: 'Reverse a Linked List',
    difficulty: 'easy',
    tags: ['linked-list', 'pointers'],
    description: `Given the head of a singly linked list, reverse the list and return the reversed list's head.`,
    constraints: ['0 ≤ number of nodes ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]',       output: '[2,1]' },
      { input: 'head = []',          output: '[]' },
    ],
    starterCode: {
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your solution here
    }
}`,
      python: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Your solution here
        pass`,
      javascript: `var reverseList = function(head) {
    // Your solution here
};`,
    },
    testCases: [
      { input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
      { input: '[1,2]',       expected: '[2,1]' },
    ],
    hints: [
      'Use three pointers: prev, curr, next.',
      'At each step: save next, reverse the pointer, advance both prev and curr.',
      'Can also be solved recursively.',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) iterative, O(n) recursive',
    concepts: ['linked list', 'pointer manipulation', 'iteration vs recursion'],
  },
]

// ─── Debugging challenge bank ─────────────────────────────────────────────────

export const DEBUGGING_CHALLENGES: DebuggingChallenge[] = [
  {
    id: 'debug-001',
    track: 'debugging',
    title: 'Off-by-One in Binary Search',
    difficulty: 'easy',
    tags: ['binary-search', 'off-by-one'],
    language: 'java',
    description: 'This binary search implementation has a bug that causes it to loop forever or miss the target on certain inputs. Find and explain the bug.',
    symptoms: ['Infinite loop on some inputs', 'Returns -1 when element exists'],
    buggyCode: `public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length;  // Bug is here
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid;
    }
    return -1;
}`,
    bugDescription: `The bug is on line 1: \`right = nums.length\` should be \`right = nums.length - 1\`.

With \`right = nums.length\`, \`nums[mid]\` can access \`nums[nums.length - 1]\` normally but the loop condition \`left < right\` means right never equals the last valid index properly in all cases.

More critically, when \`right = nums.length\` and the loop uses \`right = mid\` (not \`right = mid - 1\`), this loop style is for half-open intervals [left, right). If using that style, the access \`nums[mid]\` where mid could equal \`nums.length - 1\` is fine, but the exit condition and the return must also match. The inconsistency causes missed elements.

**Fix:** Use \`right = nums.length - 1\` with the closed interval [left, right] style already used in the loop body (\`right = mid\` for the else branch should be \`right = mid - 1\`).`,
    fixedCode: `public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;  // Fixed
    while (left <= right) {                   // Fixed: <= not <
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;                 // Fixed
    }
    return -1;
}`,
    concepts: ['binary search', 'off-by-one error', 'loop invariants', 'array bounds'],
  },
  {
    id: 'debug-002',
    track: 'debugging',
    title: 'Null Pointer in Linked List Traversal',
    difficulty: 'easy',
    tags: ['linked-list', 'null-pointer'],
    language: 'java',
    description: 'This method finds the length of a linked list but throws a NullPointerException at runtime. Find the bug.',
    symptoms: ['NullPointerException at runtime', 'Crashes on non-empty lists'],
    buggyCode: `public int getLength(ListNode head) {
    int count = 0;
    ListNode current = head;
    while (current.next != null) {  // Bug is here
        count++;
        current = current.next;
    }
    return count;
}`,
    bugDescription: `The bug is in the while condition: \`current.next != null\` should be \`current != null\`.

**Problem:** When \`head\` is \`null\` (empty list), the first iteration immediately calls \`current.next\` on a null reference → NullPointerException.

Even for non-null lists, the condition \`current.next != null\` stops one node early — it doesn't count the last node. So a list [1,2,3] returns length 2, not 3.

**Fix:** Change the condition to \`current != null\` and move the increment inside:`,
    fixedCode: `public int getLength(ListNode head) {
    int count = 0;
    ListNode current = head;
    while (current != null) {  // Fixed
        count++;
        current = current.next;
    }
    return count;
}`,
    concepts: ['null pointer', 'linked list traversal', 'loop termination', 'edge cases'],
  },
  {
    id: 'debug-003',
    track: 'debugging',
    title: 'Stack Overflow in Fibonacci',
    difficulty: 'medium',
    tags: ['recursion', 'stack-overflow', 'memoization'],
    language: 'java',
    description: 'This recursive Fibonacci implementation has two bugs: one causes wrong output, one causes a StackOverflowError for large n. Identify both.',
    symptoms: ['Wrong output for n ≥ 2', 'StackOverflowError for large inputs'],
    buggyCode: `public int fibonacci(int n) {
    if (n == 0) return 1;      // Bug 1
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
    // No memoization — Bug 2 for large n
}`,
    bugDescription: `**Bug 1:** Base case \`n == 0\` returns 1, but fib(0) should return 0. The Fibonacci sequence is 0, 1, 1, 2, 3, 5... so fib(0) = 0, fib(1) = 1. This shifts all results by one.

**Bug 2:** No memoization. The naive recursive Fibonacci has O(2ⁿ) time complexity — exponential. For n ≥ 40 or so, it's extremely slow and may cause a stack overflow due to deeply nested recursion.

**Fix:** Correct the base case and add memoization (or use iterative DP):`,
    fixedCode: `private Map<Integer, Integer> memo = new HashMap<>();

public int fibonacci(int n) {
    if (n == 0) return 0;  // Fixed base case
    if (n == 1) return 1;
    if (memo.containsKey(n)) return memo.get(n);  // Memoization
    int result = fibonacci(n - 1) + fibonacci(n - 2);
    memo.put(n, result);
    return result;
}`,
    concepts: ['recursion', 'memoization', 'base cases', 'dynamic programming', 'stack overflow'],
  },
  {
    id: 'debug-004',
    track: 'debugging',
    title: 'ConcurrentModificationException',
    difficulty: 'medium',
    tags: ['collections', 'concurrent-modification', 'iterator'],
    language: 'java',
    description: 'This method tries to remove all even numbers from a list but throws ConcurrentModificationException. Find and fix the bug.',
    symptoms: ['ConcurrentModificationException at runtime', 'Works sometimes but fails inconsistently'],
    buggyCode: `public void removeEvens(List<Integer> numbers) {
    for (Integer num : numbers) {        // Bug: modifying during iteration
        if (num % 2 == 0) {
            numbers.remove(num);
        }
    }
}`,
    bugDescription: `**Bug:** Modifying a collection (using \`remove()\`) while iterating over it with a for-each loop throws \`ConcurrentModificationException\`. Java's enhanced for-each uses an iterator internally, and the iterator tracks a \`modCount\`. When you call \`list.remove()\` directly, the modCount changes but the iterator's expected modCount doesn't, triggering the exception.

**Fix 1:** Use an explicit iterator and call \`iterator.remove()\`:
**Fix 2:** Use \`removeIf()\` (Java 8+) — cleaner and safe:`,
    fixedCode: `// Fix 1: Iterator approach
public void removeEvens(List<Integer> numbers) {
    Iterator<Integer> it = numbers.iterator();
    while (it.hasNext()) {
        if (it.next() % 2 == 0) {
            it.remove();  // Safe removal during iteration
        }
    }
}

// Fix 2: removeIf (preferred in modern Java)
public void removeEvens(List<Integer> numbers) {
    numbers.removeIf(num -> num % 2 == 0);
}`,
    concepts: ['ConcurrentModificationException', 'iterator', 'Java collections', 'removeIf'],
  },
  {
    id: 'debug-005',
    track: 'debugging',
    title: 'SQL N+1 Query Problem',
    difficulty: 'hard',
    tags: ['sql', 'n+1-problem', 'performance'],
    language: 'java',
    description: 'This Java/Hibernate code fetches all orders and their items. It works correctly but is catastrophically slow for large datasets. Identify the performance bug.',
    symptoms: ['Correct output but very slow', 'Database CPU spikes', 'Thousands of queries for a simple request'],
    buggyCode: `// Entity: Order has a @OneToMany List<OrderItem> items (LAZY loaded)
public List<OrderSummary> getOrderSummaries() {
    List<Order> orders = orderRepository.findAll();  // 1 query
    List<OrderSummary> summaries = new ArrayList<>();
    
    for (Order order : orders) {
        // This triggers a NEW query for EACH order! N+1 problem
        int itemCount = order.getItems().size();
        summaries.add(new OrderSummary(order.getId(), itemCount));
    }
    return summaries;
}`,
    bugDescription: `**Bug:** This is the classic **N+1 query problem**.

1. \`findAll()\` executes 1 SQL query to load all orders.
2. \`order.getItems()\` with LAZY loading fires a **separate SQL query for every single order**.

If there are 1000 orders, this executes **1001 queries** instead of 1-2. At scale, this destroys database performance.

**Root cause:** JPA/Hibernate lazy-loads \`@OneToMany\` relationships by default. Accessing them inside a loop triggers per-entity queries.

**Fixes:**
1. Use JOIN FETCH in the repository query
2. Use \`@EntityGraph\`
3. Use a projection DTO directly from SQL`,
    fixedCode: `// Fix 1: JOIN FETCH (JPQL)
@Query("SELECT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();

// Fix 2: Use a DTO projection — most efficient
@Query("SELECT new OrderSummary(o.id, SIZE(o.items)) FROM Order o GROUP BY o.id")
List<OrderSummary> getOrderSummaries();

// Fix 3: @EntityGraph on repository method
@EntityGraph(attributePaths = {"items"})
List<Order> findAll();`,
    concepts: ['N+1 query problem', 'JPA lazy loading', 'JOIN FETCH', 'query optimization', 'ORM performance'],
  },
]

// ─── System design challenge bank ────────────────────────────────────────────

export const SYSTEM_DESIGN_CHALLENGES: SystemDesignChallenge[] = [
  {
    id: 'design-001',
    track: 'system_design',
    title: 'Design a URL Shortener',
    difficulty: 'easy',
    tags: ['url-shortener', 'hashing', 'database', 'caching'],
    scenario: 'Design a URL shortening service like bit.ly. Users submit a long URL and receive a short URL (e.g., https://short.ly/abc123). When a user visits the short URL, they are redirected to the original long URL.',
    requirements: [
      'Shorten a long URL to a unique short code',
      'Redirect from short URL to original URL with low latency',
      'Handle high read traffic (redirects >> writes)',
      'Short codes must be unique and URL-safe',
      'Support at least 100M URLs',
    ],
    constraints: [
      '100M URLs stored',
      '10:1 read-to-write ratio',
      'Short codes should be 7-8 characters',
      'Links should not expire (by default)',
    ],
    evaluationCriteria: [
      'Correctly identifies the short code generation strategy (hash vs. base62 counter)',
      'Addresses the read-heavy nature with caching (Redis)',
      'Database choice — explains SQL vs. NoSQL trade-offs',
      'Handles collision detection',
      'Considers CDN or edge caching for redirect performance',
    ],
    keyComponents: [
      'API Layer (POST /shorten, GET /:code)',
      'Short code generator (Base62 of auto-increment ID, or MD5/SHA256 truncated)',
      'Key-Value store for code→URL mapping (Redis cache + DB)',
      'SQL or NoSQL database (PostgreSQL or DynamoDB)',
      'Redirect service (301 vs 302 trade-offs)',
    ],
    concepts: ['hashing', 'base62 encoding', 'caching', 'database design', 'CAP theorem'],
    hints: [
      'Should short codes be generated randomly or deterministically?',
      'What HTTP status code should a redirect use — 301 or 302, and why does it matter?',
      'How do you handle the case where two different long URLs hash to the same short code?',
    ],
  },
  {
    id: 'design-002',
    track: 'system_design',
    title: 'Design a Notification System',
    difficulty: 'medium',
    tags: ['notifications', 'message-queue', 'push', 'email', 'scale'],
    scenario: 'Design a notification system for a large social media platform. The system must send notifications via email, SMS, and push notifications when triggered by user events (likes, follows, comments).',
    requirements: [
      'Support email, SMS, and push notification channels',
      'Deliver notifications reliably — at-least-once delivery',
      'Handle notification preferences per user per channel',
      'Support 10M+ users with high event volume',
      'Degrade gracefully when a third-party provider is down',
    ],
    constraints: [
      '10M+ daily active users',
      'Events can spike (viral content)',
      'Different latency requirements: push < 1s, email < 30s',
      'Third-party services: Twilio (SMS), FCM (push), SendGrid (email)',
    ],
    evaluationCriteria: [
      'Uses message queues to decouple event producers from notification senders',
      'Explains retry logic and dead-letter queues for failed deliveries',
      'Addresses user preference filtering before sending',
      'Handles rate limiting for third-party APIs',
      'Considers idempotency to avoid duplicate notifications',
    ],
    keyComponents: [
      'Event producers (like service, follow service, comment service)',
      'Notification service (receives events, checks preferences)',
      'Message queue (Kafka or SQS) for async processing',
      'Per-channel workers (email worker, SMS worker, push worker)',
      'User preference store',
      'Third-party provider integrations with circuit breakers',
    ],
    concepts: ['message queues', 'async processing', 'idempotency', 'circuit breaker', 'fan-out'],
    hints: [
      'What happens if the email provider is down? How do you retry without duplicating?',
      'How do you fan out a single event to 1M followers efficiently?',
      'Where do user notification preferences get checked — before or after the queue?',
    ],
  },
  {
    id: 'design-003',
    track: 'system_design',
    title: 'Design a Rate Limiter',
    difficulty: 'medium',
    tags: ['rate-limiter', 'algorithms', 'redis', 'api-gateway'],
    scenario: 'Design a rate limiter for an API gateway. The system must limit how many requests a client can make within a time window to prevent abuse and ensure fair usage.',
    requirements: [
      'Support per-IP and per-API-key rate limiting',
      'Multiple rate limit tiers (e.g., 100 req/min for free, 1000 req/min for paid)',
      'Low latency overhead (< 10ms per check)',
      'Distribute across multiple API gateway instances',
      'Return informative headers (X-RateLimit-Remaining, Retry-After)',
    ],
    constraints: [
      'Must work across a fleet of API servers (distributed)',
      'High availability — rate limiter failure must not block all requests',
      'Sub-10ms latency budget',
    ],
    evaluationCriteria: [
      'Explains at least two rate-limiting algorithms and their trade-offs',
      'Addresses the distributed synchronization problem',
      'Uses Redis (atomic operations) for shared state',
      'Handles race conditions correctly',
      'Explains what happens if the rate limiter itself is unavailable',
    ],
    keyComponents: [
      'Rate limit algorithm (Token Bucket, Sliding Window Log, Fixed Window Counter)',
      'Redis for shared atomic counters (INCR + EXPIRE, or Lua scripts)',
      'API Gateway middleware to intercept requests',
      'Config store for rate limit rules per tier',
    ],
    concepts: ['token bucket', 'sliding window', 'Redis atomic operations', 'distributed systems', 'fail-open vs fail-closed'],
    hints: [
      'What is the trade-off between Token Bucket and Fixed Window Counter algorithms?',
      'How do you prevent a race condition between checking the counter and incrementing it?',
      'Should your rate limiter fail-open (allow requests) or fail-closed (block) when Redis is unavailable?',
    ],
  },
]

// ─── All challenges combined ───────────────────────────────────────────────────

export const ALL_LAB_CHALLENGES: LabChallenge[] = [
  ...CODING_CHALLENGES,
  ...DEBUGGING_CHALLENGES,
  ...SYSTEM_DESIGN_CHALLENGES,
]

export function getLabChallenges(track?: LabTrack, difficulty?: LabDifficulty): LabChallenge[] {
  let pool = ALL_LAB_CHALLENGES
  if (track) pool = pool.filter(c => c.track === track)
  if (difficulty) pool = pool.filter(c => c.difficulty === difficulty)
  return pool
}
