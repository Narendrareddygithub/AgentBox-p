<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Product Requirements Document (PRD) v3.0

## AgentBox - Self-Evolving, Test-Driven AI Agent Sandbox with Real-Time Transparency


***

## 1. Document Information

| **Field** | **Details** |
| :-- | :-- |
| **Project Name** | AgentBox - Self-Evolving AI Agent Sandbox |
| **Version** | 3.0.0 (Major Pivot - Test-Driven + Real-Time Transparency) |
| **Date** | October 26, 2025 |
| **Author** | Software Architect |
| **Development Setup** | Perplexity Spaces + GitHub + Claude 3.5 Sonnet (Extended Thinking) |
| **Status** | Ready for Development |
| **Architecture** | Web Application (React + Supabase + E2B) |


***

## 2. Executive Summary

**AgentBox** is a production-grade web application where AI agents autonomously create tools, execute complex tasks, and operate within sandboxed environments—**with every line of code validated through comprehensive automated testing and every action streamed live to users in real-time**.[^1][^2][^3]

### The Three Pillars of AgentBox

**1. Meta-Tooling Intelligence**
The agent possesses ONE meta-tool (`tool_creator`) that can dynamically generate any tool needed for a task, building a growing library of capabilities across sessions.[^4]

**2. Test-Driven Everything** *(NEW - Critical Feature)*
Every single line of agent-generated code is automatically tested before execution using comprehensive test suites (unit, integration, functional, security, performance). **No code runs without passing tests—period**.[^5][^3][^6][^7][^1]

**3. Real-Time Radical Transparency** *(NEW - Critical Feature)*
Users see **exactly** what the agent is doing in real-time—no mock animations, no simulations, just authentic live streaming of terminal output, browser activity, code generation, test execution, and tool creation.[^2][^8][^9]

***

## 3. Core Principles (Project DNA)

### Principle 1: Meta-Tooling First

*"The agent doesn't need tools; it needs the ability to create tools"*

The agent starts with ONE meta-tool that can create any other tool, save it to a persistent library, and reuse it across sessions.[^10][^4]

### Principle 2: Test-Driven Code Generation (TDG) - MANDATORY

*"Untested code is not code; it's a liability"*

**Why This Is Non-Negotiable:**

- **AI Hallucination Protection**: LLMs can generate syntactically correct but logically broken code[^6][^1]
- **Complex Project Survival**: Without tests, complex projects built by AI collapse under their own weight[^3][^5]
- **Trust \& Reliability**: Users must trust that agent-generated code works before it touches their data[^7][^6]

**All Code Requires Tests:**

- Agent-created tool code → automated test suite generated **before** tool is saved[^1]
- Task execution scripts → validated against acceptance criteria[^5]
- API integrations → contract testing with mocked responses[^5]
- File operations → simulated filesystem tests[^3]

**Testing Pyramid (Mandatory by Design):**

```
       ╱╲
      ╱  ╲
     ╱ E2E╲         ← End-to-end (10% of tests)
    ╱──────╲
   ╱        ╲
  ╱Integration╲    ← Integration tests (30% of tests)
 ╱────────────╲
╱              ╲
│  Unit Tests  │   ← Unit tests (60% of tests)
└──────────────┘
```

**Test Coverage Targets** :[^6][^1]

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All tool-to-tool interactions
- **Functional Tests**: Every user story acceptance criteria
- **Security Tests**: Input validation, injection prevention
- **Performance Tests**: Load/stress testing for production readiness


### Principle 3: Real-Time Transparency - NO MOCKING EVER

*"Show the real work, or don't show anything at all"*

**Why Fake Progress Kills Products:**

- **User Trust Erosion**: Repeated loading animations without real activity make users skeptical[^2]
- **Debugging Blindness**: Without seeing actual execution, users can't understand failures[^8]
- **Competitive Disadvantage**: Modern users expect live visibility into AI reasoning (like Claude Thinking, Perplexity Deep Research)[^11]

**Real-Time Streaming Requirements** :[^9][^8][^2]

- **Terminal Output**: Every bash command executed → streamed character-by-character (<100ms latency)[^2]
- **Code Generation**: As LLM generates tool code → shown line-by-line with syntax highlighting
- **Test Execution**: Test suite runs → live output of pass/fail for each test case[^5]
- **Browser Activity**: Web scraping tasks → live screenshots every 2 seconds
- **Agent Reasoning**: LLM chain-of-thought → streamed as model generates it[^11]

**Forbidden Practices:**

- ❌ Generic "Processing..." spinners without real work underneath
- ❌ Progress bars that don't reflect actual task completion
- ❌ Mock terminal output that doesn't match real execution
- ❌ Delayed/batched log updates (all logs stream in <5 seconds)[^8][^2]


### Principle 4: Google Gemini + Perplexity Development Stack

*"Leverage free-tier AI and modern dev workflows"*

**LLM Ecosystem:**

- **Gemini 2.0 Flash**: Free tier, function calling, multimodal[^12][^13]
- **Claude 3.5 Sonnet**: Via Perplexity Pro API for complex reasoning[^14][^15][^11]

**Development Workflow:**

- **Perplexity Spaces**: Primary IDE for codebase development with GitHub integration[^16][^17]
- **Claude Extended Thinking**: Deep reasoning for architecture decisions, complex algorithms[^15][^11]
- **GitHub Integration**: Direct commits from Perplexity to repository[^16]

***

## 4. Problem Statement

### The AI Code Generation Crisis

**Current Reality:**

- AI-generated code often looks correct but fails in production (hallucinations, edge cases, security vulnerabilities)[^1][^6]
- Complex projects built with AI assistants collapse without rigorous testing[^3][^5]
- Users don't trust AI agents because they can't see what's happening in real-time[^2]

**Existing "Solutions" Fall Short:**

- **AutoGPT/OpenDevin**: No mandatory testing, opaque execution, frequent failures[^18]
- **AI Coding Assistants**: Generate code but don't validate it automatically[^5]
- **Traditional Sandboxes**: Show terminal output but no test-driven validation[^19]


### Our Differentiated Solution

**AgentBox** is the **first** AI agent platform where:

1. **Every line of code is test-driven** → agents write tests before code[^6][^1]
2. **Every action is live-streamed** → users see real execution, not mock progress[^9][^2]
3. **Tool libraries evolve** → agents build reusable, tested tools across sessions[^4]

***

## 5. Critical Features Deep Dive

### Feature 1: Comprehensive Test-Driven Development (TDD)

#### 5.1 Test Categories (All Mandatory)

**A. Testing Levels**

**Unit Testing**[^1][^5]

- **Scope**: Individual functions/methods in isolation
- **Generated For**: Every tool function, utility helper, data transformer
- **Example (Simple)**:

```python
# Agent creates tool: csv_reader
def csv_reader(file_path: str) -> List[Dict]:
    """Read CSV and return list of dicts"""
    # Implementation code here
    pass

# AUTO-GENERATED UNIT TESTS:
def test_csv_reader_valid_file():
    result = csv_reader('test_data.csv')
    assert len(result) == 5
    assert result[^0]['name'] == 'John'

def test_csv_reader_missing_file():
    with pytest.raises(FileNotFoundError):
        csv_reader('nonexistent.csv')

def test_csv_reader_empty_file():
    result = csv_reader('empty.csv')
    assert result == []
```

- **Example (Complex)**:

```python
# Agent creates tool: data_transformer with nested logic
def data_transformer(data: List[Dict], rules: Dict) -> List[Dict]:
    """Apply transformation rules to data"""
    # Complex implementation with conditionals, loops, edge cases
    pass

# AUTO-GENERATED UNIT TESTS (20+ test cases):
def test_transform_with_valid_rules():
    # Test normal case

def test_transform_with_empty_data():
    # Edge case: no data

def test_transform_with_invalid_rule_syntax():
    # Error handling

def test_transform_preserves_original_data():
    # Immutability check

# ... 16 more test cases covering all branches
```


**Integration Testing**[^3][^5]

- **Scope**: How multiple tools/components work together
- **Generated For**: Tool chains, API + database interactions, multi-step workflows
- **Example (Simple)**:

```python
# Task: "Download file and process it"
# Agent creates two tools: file_downloader + csv_processor

# INTEGRATION TEST:
def test_download_and_process_pipeline():
    # Step 1: Download file
    download_result = file_downloader('https://example.com/data.csv')
    assert download_result.status == 'success'
    
    # Step 2: Process downloaded file
    processed = csv_processor(download_result.file_path)
    assert len(processed) > 0
    assert processed[^0]['status'] == 'valid'
```

- **Example (Complex)**:

```python
# Task: "Scrape website, analyze sentiment, store in database, send email"
# Agent creates: web_scraper + sentiment_analyzer + db_writer + email_sender

# INTEGRATION TEST SUITE (10+ tests):
def test_full_pipeline_happy_path():
    # Test entire workflow end-to-end
    scraped_data = web_scraper('https://news.site')
    sentiments = sentiment_analyzer(scraped_data)
    db_ids = db_writer(sentiments)
    email_result = email_sender(db_ids)
    
    assert len(email_result.recipients) == 5
    assert email_result.success_rate == 1.0

def test_pipeline_with_scraper_failure():
    # What happens if scraping fails?
    with mock.patch('web_scraper', side_effect=TimeoutError):
        result = run_pipeline()
        assert result.status == 'partial_failure'
        assert result.error_step == 'web_scraper'

# ... more failure scenarios
```


**System Testing**[^5]

- **Scope**: Complete task execution in sandbox environment
- **Generated For**: Full agent task workflows, sandbox resource usage, timeout handling
- **Example**: Testing "Generate PDF report from web data" task end-to-end in isolated sandbox

**Acceptance Testing (UAT)**[^3][^5]

- **Scope**: Validate against user-provided requirements
- **Generated For**: Every user task has acceptance criteria converted to automated tests
- **Example**:

```
User Request: "Scrape product prices from Amazon, filter <$50, save to CSV"

AUTO-GENERATED ACCEPTANCE TESTS:
- GIVEN Amazon search URL
- WHEN scraper runs
- THEN CSV contains only products under $50
- AND CSV has columns: name, price, url
- AND all prices are numeric values
```


**B. Functional Testing**

**Regression Testing**[^5]

- **Triggered**: When any tool is modified/updated
- **Purpose**: Ensure changes don't break existing functionality
- **Example**: Agent updates `web_scraper` to handle JavaScript → all 15 previous use cases must still pass

**Smoke Testing**[^5]

- **Triggered**: After sandbox creation, before task execution
- **Purpose**: Verify basic environment functionality
- **Tests**: Python installed? Network accessible? File system writable?

**API Testing**[^5]

- **Generated For**: Tools that call external APIs
- **Example**:

```python
# Tool: weather_fetcher (calls OpenWeatherMap API)

# API CONTRACT TESTS:
def test_weather_api_response_structure():
    response = weather_fetcher('London')
    assert 'temp' in response
    assert 'humidity' in response
    assert isinstance(response['temp'], (int, float))

def test_weather_api_rate_limiting():
    # Make 61 requests (API limit is 60/min)
    for i in range(61):
        response = weather_fetcher('London')
    # Should handle rate limit gracefully
    assert last_response.status != 'error_unhandled'
```


**C. Non-Functional Testing**

**Performance Testing**[^3][^5]

- **Load Testing**: Can tool handle expected data volumes?
- **Stress Testing**: What's the breaking point?
- **Example (Simple)**:

```python
def test_csv_processor_performance():
    # Tool should process 10K rows in <5 seconds
    large_file = generate_csv(rows=10000)
    start = time.time()
    result = csv_processor(large_file)
    duration = time.time() - start
    assert duration < 5.0
```

- **Example (Complex)**:

```python
def test_web_scraper_under_load():
    # Scrape 100 URLs concurrently
    urls = [f'https://example.com/page{i}' for i in range(100)]
    start = time.time()
    results = asyncio.run(web_scraper.scrape_all(urls))
    duration = time.time() - start
    
    # Performance assertions
    assert duration < 30  # Complete in 30s
    assert len(results) == 100  # No dropped URLs
    assert sum(r.success for r in results) >= 95  # 95% success rate
```


**Security Testing**[^6][^5]

- **Input Validation**: Prevent SQL injection, XSS, command injection
- **Example**:

```python
# Tool: database_query

# SECURITY TESTS:
def test_sql_injection_prevention():
    # Try malicious input
    malicious_input = "'; DROP TABLE users; --"
    result = database_query(malicious_input)
    # Should sanitize, not execute
    assert 'error' in result or result == []
    # Verify table still exists
    assert database.table_exists('users')

def test_file_path_traversal_prevention():
    # Try to access files outside sandbox
    malicious_path = "../../../etc/passwd"
    with pytest.raises(SecurityError):
        file_reader(malicious_path)
```


**Usability Testing**[^5]

- **Generated For**: User-facing tool outputs
- **Example**: Does CSV have human-readable column names? Is error message clear?

**D. Testing Techniques**

**Black-Box Testing**[^5]

- **Approach**: Test tool behavior without knowing internal implementation
- **Used For**: Acceptance testing, API testing

**White-Box Testing**[^1][^3]

- **Approach**: Test internal logic, code paths, branches
- **Used For**: Unit testing, code coverage analysis
- **Example**: Ensure all `if/else` branches are tested

**Gray-Box Testing**[^5]

- **Approach**: Partial knowledge of internals
- **Used For**: Integration testing, debugging edge cases

**Exploratory Testing**[^5]

- **Approach**: Agent tries random valid inputs to discover edge cases
- **Example**: Agent generates 100 random CSV files with varying formats to test `csv_processor`


#### 5.2 Test Case Generation Workflow

**Step 1: User Provides Task**

```
User: "Create a tool that scrapes product reviews from Amazon"
```

**Step 2: Agent Analyzes Requirements**

```
Agent (using Gemini):
- Required capability: web scraping
- Input: Amazon product URL
- Output: List of reviews (text, rating, date)
- Edge cases: No reviews, pagination, JavaScript rendering
- Security: Respect robots.txt, rate limiting
```

**Step 3: Agent Generates Test Suite FIRST**[^6][^1]

```python
# GENERATED BEFORE ANY CODE IS WRITTEN:

import pytest
from unittest.mock import Mock

# Acceptance Tests (derived from requirements)
def test_scraper_returns_list_of_reviews():
    """GIVEN valid Amazon URL, WHEN scraper runs, THEN returns list"""
    url = "https://amazon.com/product/B00EXAMPLE"
    reviews = amazon_scraper(url)
    assert isinstance(reviews, list)
    assert len(reviews) > 0

def test_review_has_required_fields():
    """Each review must have text, rating, date"""
    reviews = amazon_scraper("https://amazon.com/product/B00EXAMPLE")
    for review in reviews:
        assert 'text' in review
        assert 'rating' in review
        assert 'date' in review
        assert 1 <= review['rating'] <= 5

# Edge Case Tests
def test_scraper_handles_no_reviews():
    """Product with zero reviews returns empty list"""
    url_no_reviews = "https://amazon.com/product/B00NOREVIEWS"
    reviews = amazon_scraper(url_no_reviews)
    assert reviews == []

def test_scraper_handles_pagination():
    """Products with 100+ reviews should fetch all pages"""
    url_many_reviews = "https://amazon.com/product/B00POPULAR"
    reviews = amazon_scraper(url_many_reviews)
    assert len(reviews) >= 100

# Security Tests
def test_scraper_respects_robots_txt():
    """Should not scrape if robots.txt disallows"""
    # (Implementation depends on real robots.txt check)
    pass

def test_scraper_rate_limits_requests():
    """No more than 10 requests per second"""
    start = time.time()
    for i in range(20):
        amazon_scraper(f"https://amazon.com/product/B00TEST{i}")
    duration = time.time() - start
    assert duration >= 2.0  # 20 requests should take at least 2 seconds

# Performance Tests
def test_scraper_completes_within_timeout():
    """Should complete within 30 seconds"""
    start = time.time()
    reviews = amazon_scraper("https://amazon.com/product/B00EXAMPLE")
    duration = time.time() - start
    assert duration < 30

# Error Handling Tests
def test_scraper_handles_invalid_url():
    with pytest.raises(ValueError):
        amazon_scraper("not-a-valid-url")

def test_scraper_handles_network_timeout():
    with mock.patch('requests.get', side_effect=Timeout):
        result = amazon_scraper("https://amazon.com/product/B00EXAMPLE")
        assert result == []  # Graceful degradation

# Integration Tests (if tool uses other tools)
def test_scraper_works_with_html_parser():
    """Verify integration with html parsing tool"""
    html = "<html>Mock Amazon page</html>"
    parsed = html_parser(html)
    assert parsed is not None
```

**Step 4: Agent Writes Code to Pass Tests**[^1][^3]

```python
def amazon_scraper(url: str) -> List[Dict]:
    """
    Scrape product reviews from Amazon.
    Auto-generated to satisfy test suite above.
    """
    # Validate URL
    if not url.startswith('https://amazon.com'):
        raise ValueError("Invalid Amazon URL")
    
    # Respect robots.txt
    if not check_robots_txt(url):
        return []
    
    # Fetch with rate limiting
    rate_limiter.wait()
    response = requests.get(url, timeout=30)
    
    # Parse reviews
    soup = BeautifulSoup(response.content, 'html.parser')
    reviews = []
    
    for review_div in soup.find_all('div', class_='review'):
        reviews.append({
            'text': review_div.find('span', class_='review-text').text,
            'rating': int(review_div.find('i', class_='review-rating').text[^0]),
            'date': review_div.find('span', class_='review-date').text
        })
    
    # Handle pagination
    if soup.find('a', class_='next-page'):
        next_url = soup.find('a', class_='next-page')['href']
        reviews.extend(amazon_scraper(next_url))
    
    return reviews
```

**Step 5: Agent Runs Test Suite**[^8][^2]

```
RUNNING TESTS... (live streamed to user)

test_scraper_returns_list_of_reviews ... ✅ PASSED
test_review_has_required_fields ... ✅ PASSED
test_scraper_handles_no_reviews ... ✅ PASSED
test_scraper_handles_pagination ... ✅ PASSED
test_scraper_respects_robots_txt ... ✅ PASSED
test_scraper_rate_limits_requests ... ✅ PASSED
test_scraper_completes_within_timeout ... ✅ PASSED
test_scraper_handles_invalid_url ... ✅ PASSED
test_scraper_handles_network_timeout ... ✅ PASSED
test_scraper_works_with_html_parser ... ✅ PASSED

===========================================
10/10 tests passed (100% coverage)
Tool 'amazon_scraper' is PRODUCTION-READY ✅
Saving to tool library...
```

**Step 6: Only PASSING Code is Saved**

- If any test fails, agent iterates and fixes code[^3]
- Tool is **never** saved to library with failing tests[^6]
- User sees real-time test output, not mock progress[^2]


#### 5.3 Continuous Testing During Task Execution

**Real-Time Validation:**

- Before executing any tool, run its test suite (cached results used if no code changes)
- During multi-step tasks, validate intermediate outputs
- After task completion, run full integration test

**Example: "Generate PDF Report" Task**

```
User: "Download sales data, create charts, generate PDF report"

AGENT EXECUTION (live-streamed):

Step 1: Checking tool library...
        Found tool 'csv_downloader' (45 tests, all passing ✅)
        
Step 2: Running csv_downloader tests...
        [23:45:01] test_download_valid_url ... ✅
        [23:45:02] test_download_large_file ... ✅
        ... (43 more tests)
        All tests passed. Executing tool...

Step 3: Downloading sales_data.csv...
        [23:45:10] Downloaded 15,234 rows
        Validating output against schema... ✅

Step 4: No chart generator tool found. Creating new tool...
        [23:45:15] Generating test suite for 'chart_generator'...
        [23:45:20] Generated 18 unit tests, 5 integration tests
        [23:45:22] Writing chart_generator code...
        [23:45:35] Running tests...
                   test_creates_bar_chart ... ✅
                   test_handles_empty_data ... ✅
                   ... (21 more tests)
        [23:45:50] All tests passed. Tool saved to library.

Step 5: Generating charts...
        [23:46:00] Created bar_chart.png (validated ✅)
        [23:46:05] Created line_chart.png (validated ✅)

Step 6: Found tool 'pdf_generator' (32 tests, all passing ✅)
        Running pdf_generator tests... (all passed in 2.3s)
        
Step 7: Generating PDF report...
        [23:46:30] PDF created: sales_report.pdf (3.2 MB)
        Running output validation tests...
        - PDF is readable ✅
        - Contains 2 images ✅
        - Page count: 5 ✅

✅ TASK COMPLETE
   - All tools tested (123 total tests, 100% passed)
   - Output validated against requirements
   - Download: sales_report.pdf
```


#### 5.4 Manual Testing Override (Optional for Production)

**Default Behavior**: All tests MUST pass before tool is used[^6]

**Optional Override** (for experienced users):

- User can set "Skip Test Enforcement: true" in settings
- Agent still generates and runs tests, but doesn't block on failures
- User sees test results and can manually decide to proceed
- **NOT recommended for production deployments**[^7]

**Use Case**: Rapid prototyping where "good enough" is acceptable

***

### Feature 2: Real-Time Agent Activity Streaming

#### 2.1 Live Streaming Architecture

**Data Flow** :[^9][^8][^2]

```
E2B Sandbox → WebSocket Bridge → Supabase Realtime → React Frontend
     (command execution)     (streaming logs)      (UI rendering)
     
Latency Target: <100ms from execution to user screen
Update Frequency: Real-time (no batching)
```

**Streaming Channels** :[^2]

1. **Terminal Output**: Character-by-character stdout/stderr from sandbox
2. **Code Generation**: Token-by-token LLM code output (via streaming API)
3. **Test Execution**: Live test runner output (pytest with real-time plugin)
4. **File Operations**: Real-time file tree updates
5. **Network Activity**: HTTP requests/responses logged live
6. **Agent Reasoning**: LLM chain-of-thought streamed as generated

#### 2.2 Real-Time Visualization Examples

**Example 1 (Simple Task): "Create PDF about Latest Agentic AI Use Cases"**

**User sees (in real-time, not mocked):**

```
[10:23:01] 🧠 AGENT THINKING...
           "I need to research agentic AI use cases"
           
[10:23:03] 🔍 Searching tool library...
           No 'web_researcher' tool found.
           
[10:23:04] 🛠️ CREATING TOOL: web_researcher
           ├─ Generating test suite...
           │  ├─ test_research_returns_results ... (pending)
           │  ├─ test_handles_no_results ... (pending)
           │  └─ test_validates_sources ... (pending)
           │  
           ├─ Writing tool code...
           │  [Live code appears line-by-line with syntax highlighting]
           │  
           │  def web_researcher(query: str, num_results: int = 10):
           │      """Search web and return validated sources"""
           │      results = []
           │      for url in search_engine(query):
           │          content = fetch_url(url)
           │          if validate_source(content):
           │              results.append({...})
           │      return results
           │  
           └─ Running tests...
              [10:23:25] test_research_returns_results ... ✅ PASSED (0.8s)
              [10:23:26] test_handles_no_results ... ✅ PASSED (0.3s)
              [10:23:27] test_validates_sources ... ✅ PASSED (1.2s)
              
              ✅ Tool 'web_researcher' ready (3/3 tests passed)

[10:23:30] 🌐 EXECUTING: web_researcher("latest agentic AI use cases")
           ├─ Querying search engine...
           ├─ Found 47 results
           ├─ Fetching URL: https://arxiv.org/latest-agentic-ai
           │  └─ Response: 200 OK (2.1s)
           ├─ Fetching URL: https://medium.com/agentic-ai-2025
           │  └─ Response: 200 OK (1.8s)
           │  ... (45 more URLs)
           └─ Extracted 10 high-quality sources

[10:24:15] 📝 CREATING TOOL: pdf_generator
           [Similar process: tests → code → validation]

[10:25:30] 📄 GENERATING PDF...
           ├─ Processing content (3,245 words)
           ├─ Formatting sections...
           │  ├─ Introduction (done)
           │  ├─ Use Case 1: Autonomous Customer Service (done)
           │  ├─ Use Case 2: Coding Assistants (done)
           │  ... (8 more sections)
           └─ Rendering PDF...
              [10:26:00] PDF created: agentic_ai_use_cases.pdf (2.7 MB)

[10:26:05] ✅ TASK COMPLETE
           Download: agentic_ai_use_cases.pdf
           Tools Created: 2 (web_researcher, pdf_generator)
           Tests Run: 47 (100% passed)
           Duration: 3 minutes 4 seconds
```

**What user SEES on screen (real-time UI):**

- Left panel: Agent reasoning updates every 1-2 seconds
- Center panel: Live terminal with scrolling command output
- Right panel: Test results updating as they run
- Bottom: Progress bar showing actual completion % (not simulated)

**Example 2 (Complex Task): "Build a Web Dashboard for Stock Analysis"**

**User sees (over 30+ minutes, all real-time):**

```
[14:00:00] 🧠 AGENT ANALYZING TASK...
           "Need to: fetch stock data, analyze trends, create visualizations, build web UI"
           Breaking down into 5 major components...

[14:00:10] 📦 CHECKING TOOL LIBRARY...
           ├─ stock_data_fetcher ... ❌ NOT FOUND
           ├─ trend_analyzer ... ❌ NOT FOUND
           ├─ chart_builder ... ❌ NOT FOUND
           ├─ web_app_generator ... ❌ NOT FOUND
           └─ Need to create 4 new tools

[14:00:15] 🛠️ CREATING TOOL 1/4: stock_data_fetcher
           ├─ Generating 25 unit tests...
           │  [14:00:20] test_fetch_single_stock ... (pending)
           │  [14:00:21] test_fetch_multiple_stocks ... (pending)
           │  ... (23 more)
           │  
           ├─ Writing implementation (streaming line-by-line)...
           │  import yfinance as yf
           │  def stock_data_fetcher(symbols: List[str], period: str = "1y"):
           │      """Fetch historical stock data"""
           │      data = {}
           │      for symbol in symbols:
           │          ticker = yf.Ticker(symbol)
           │          data[symbol] = ticker.history(period=period)
           │      return data
           │  
           ├─ Running tests...
           │  [14:02:00] test_fetch_single_stock ... ✅ PASSED
           │  [14:02:05] test_fetch_multiple_stocks ... ✅ PASSED
           │  ... (25 tests, 3 minutes to complete)
           │  
           └─ ✅ Tool ready (25/25 tests, 92% coverage)

[14:05:00] 🛠️ CREATING TOOL 2/4: trend_analyzer
           [Similar detailed process: 32 tests, 5 minutes]

[14:10:00] 🛠️ CREATING TOOL 3/4: chart_builder
           [Similar process: 18 tests, 3 minutes]

[14:13:00] 🛠️ CREATING TOOL 4/4: web_app_generator
           ├─ This is complex, generating 45 tests...
           │  - 20 unit tests (component rendering)
           │  - 15 integration tests (data flow)
           │  - 10 E2E tests (user interactions)
           │  
           ├─ Writing React components (streaming code)...
           │  [User sees React code appearing line-by-line]
           │  
           ├─ Running test suite...
           │  [14:18:00] Unit Tests (20/20 passed) ✅
           │  [14:19:30] Integration Tests (15/15 passed) ✅
           │  [14:22:00] E2E Tests (10/10 passed) ✅
           │  
           └─ ✅ Tool ready (45/45 tests, 88% coverage)

[14:23:00] 🏗️ ASSEMBLING DASHBOARD...
           ├─ Fetching data for AAPL, GOOGL, MSFT...
           │  [User sees real API calls happening]
           │  ├─ AAPL: 252 days of data fetched
           │  ├─ GOOGL: 252 days of data fetched
           │  └─ MSFT: 252 days of data fetched
           │  
           ├─ Analyzing trends...
           │  [Real-time analysis output]
           │  ├─ AAPL: +23% YoY, bullish trend
           │  ├─ GOOGL: +15% YoY, neutral trend
           │  └─ MSFT: +31% YoY, bullish trend
           │  
           ├─ Generating charts...
           │  [14:25:00] Line chart: ✅ created
           │  [14:25:10] Candlestick chart: ✅ created
           │  [14:25:20] Volume chart: ✅ created
           │  
           └─ Building web UI...
              [14:27:00] HTML/CSS/JS files created
              [14:27:30] Starting local server on http://localhost:3000
              [14:27:31] Dashboard is LIVE! 🎉

[14:27:35] 🧪 RUNNING INTEGRATION TESTS...
           ├─ test_dashboard_loads ... ✅ PASSED
           ├─ test_data_updates_on_refresh ... ✅ PASSED
           ├─ test_charts_render_correctly ... ✅ PASSED
           ... (10 more integration tests)

[14:30:00] ✅ TASK COMPLETE
           Dashboard URL: http://localhost:3000
           Tools Created: 4 (all tested & validated)
           Total Tests Run: 120 (100% passed)
           Code Coverage: 89%
           Duration: 30 minutes
           
           📦 Tool Library Updated:
           - stock_data_fetcher (25 tests)
           - trend_analyzer (32 tests)
           - chart_builder (18 tests)
           - web_app_generator (45 tests)
```

**UI During This Complex Task:**

- **Top Bar**: Real-time progress (Tool 2/4 creating, Tests 15/32 running)
- **Left Panel**: Agent reasoning log (scrolls automatically)
- **Center Panel (Tabs)**:
    - Terminal: Live command execution
    - Code: Generated code with syntax highlighting
    - Tests: Test results dashboard (pie chart: passed/failed/running)
    - Browser: If web scraping, live screenshots every 2s
- **Right Panel**:
    - Tool Library: Updates when new tools are saved
    - Resource Usage: CPU/Memory graph (real Sandbox metrics)
    - Task Timeline: Visual timeline of what's been completed

**Why This Transparency Matters:**

- **Trust**: Users see actual work happening, not placeholders[^2]
- **Learning**: Users understand how agents solve problems[^8]
- **Debugging**: If something fails, users see exact failure point[^8]
- **Engagement**: Real-time updates keep users engaged for long tasks[^9]


#### 2.3 Technical Implementation

**WebSocket Streaming** :[^8][^2]

```typescript
// Frontend: React hook for real-time logs
const useAgentStream = (sandboxId: string) => {
  const [logs, setLogs] = useState<Log[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`sandbox:${sandboxId}`)
      .on('broadcast', { event: 'log' }, (payload) => {
        // NEW LOG ARRIVES - UPDATE UI IMMEDIATELY
        setLogs(prev => [...prev, payload.log]);
      })
      .subscribe();
      
    return () => channel.unsubscribe();
  }, [sandboxId]);
  
  return logs;
};

// Backend: E2B sandbox stdout streamed to Supabase
const streamSandboxOutput = async (sandbox, taskId) => {
  const process = await sandbox.process.start({
    cmd: 'python agent_task.py',
    onStdout: (data) => {
      // STREAM EVERY CHARACTER IMMEDIATELY (<100ms latency)
      supabase.channel(`sandbox:${sandbox.id}`).send({
        type: 'broadcast',
        event: 'log',
        log: {
          timestamp: Date.now(),
          type: 'stdout',
          content: data.line,
          task_id: taskId
        }
      });
    },
    onStderr: (data) => {
      // ALSO STREAM ERRORS IN REAL-TIME
      supabase.channel(`sandbox:${sandbox.id}`).send({
        type: 'broadcast',
        event: 'log',
        log: {
          timestamp: Date.now(),
          type: 'stderr',
          content: data.line,
          task_id: taskId
        }
      });
    }
  });
};
```

**Test Execution Streaming** :[^8][^5]

```python
# Custom pytest plugin for real-time test streaming
import pytest
from supabase import create_client

class RealtimeTestPlugin:
    def __init__(self, supabase_client, sandbox_id):
        self.supabase = supabase_client
        self.sandbox_id = sandbox_id
    
    def pytest_runtest_protocol(self, item):
        # BEFORE TEST RUNS
        self.supabase.channel(f'sandbox:{self.sandbox_id}').send({
            'event': 'test_start',
            'test_name': item.name,
            'timestamp': time.time()
        })
    
    def pytest_runtest_logreport(self, report):
        if report.when == 'call':
            # TEST COMPLETED - STREAM RESULT IMMEDIATELY
            self.supabase.channel(f'sandbox:{self.sandbox_id}').send({
                'event': 'test_result',
                'test_name': report.nodeid,
                'outcome': report.outcome,  # 'passed', 'failed', 'skipped'
                'duration': report.duration,
                'error': str(report.longrepr) if report.failed else None,
                'timestamp': time.time()
            })

# Usage in agent code:
plugin = RealtimeTestPlugin(supabase, sandbox_id)
pytest.main(['-v', 'test_tool.py'], plugins=[plugin])
# USER SEES EACH TEST RESULT AS IT FINISHES, NO BATCHING
```

**LLM Streaming (Code Generation)** :[^13][^11]

```python
# Stream Gemini code generation token-by-token
async def generate_tool_code_streaming(tool_spec, sandbox_id):
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(
        prompt=f"Generate Python code for: {tool_spec}",
        stream=True  # ← ENABLE STREAMING
    )
    
    code_buffer = ""
    for chunk in response:
        token = chunk.text
        code_buffer += token
        
        # SEND EVERY TOKEN TO FRONTEND IMMEDIATELY
        await supabase.channel(f'sandbox:{sandbox_id}').send({
            'event': 'code_generation',
            'token': token,
            'timestamp': time.time()
        })
    
    return code_buffer
```


***

### Feature 3: Absolute Zero Tolerance for Mocking/Simulation

#### 3.1 Banned Patterns (Never Allowed)

**❌ FORBIDDEN: Fake Progress Indicators**

```javascript
// THIS CODE IS BANNED FROM OUR CODEBASE:
const FakeProgress = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulating progress without real work
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <ProgressBar value={progress} />; // ← LIES TO USER
};
```

**✅ REQUIRED: Real Progress Tracking**

```javascript
const RealProgress = ({ taskId }) => {
  const { data: task } = useRealtimeTask(taskId);
  
  // Progress comes from ACTUAL completed steps
  const progress = (task.completed_steps / task.total_steps) * 100;
  
  return (
    <div>
      <ProgressBar value={progress} />
      <p>Step {task.completed_steps}/{task.total_steps}: {task.current_action}</p>
      {/* Shows REAL current action like "Running test_scraper_handles_pagination" */}
    </div>
  );
};
```

**❌ FORBIDDEN: Mock Terminal Output**

```javascript
// BANNED: Pre-scripted fake terminal output
const FakeTerminal = () => {
  const mockLogs = [
    { time: 0, text: "Initializing..." },
    { time: 2000, text: "Processing data..." },
    { time: 4000, text: "Complete!" }
  ];
  
  const [currentLog, setCurrentLog] = useState(0);
  useEffect(() => {
    // Replaying fake logs on a timer
    const timer = setInterval(() => {
      setCurrentLog(i => i + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);
  
  return <div>{mockLogs[currentLog]?.text}</div>; // ← SIMULATION
};
```

**✅ REQUIRED: Real Sandbox Stdout**

```javascript
const RealTerminal = ({ sandboxId }) => {
  const logs = useAgentStream(sandboxId); // WebSocket from E2B
  
  return (
    <Terminal>
      {logs.map((log, i) => (
        <LogLine key={i} timestamp={log.timestamp} type={log.type}>
          {log.content} {/* ACTUAL stdout from sandbox */}
        </LogLine>
      ))}
    </Terminal>
  );
};
```

**❌ FORBIDDEN: Static Test Results**

```javascript
// BANNED: Hard-coded test pass rates
const FakeTestResults = () => {
  return (
    <TestSummary
      total={25}
      passed={23}  // ← MADE UP NUMBERS
      failed={2}
      coverage={87}
    />
  );
};
```

**✅ REQUIRED: Live Test Execution**

```javascript
const RealTestResults = ({ toolId }) => {
  const { data: testRun } = useRealtimeTestRun(toolId);
  
  // Data comes from ACTUAL pytest execution via WebSocket
  return (
    <TestSummary
      total={testRun.total_tests}
      passed={testRun.passed_tests}
      failed={testRun.failed_tests}
      coverage={testRun.coverage_percent}
      duration={testRun.duration_seconds}
    />
  );
};
```


#### 3.2 Enforcement Mechanisms

**Code Review Checklist:**

- [ ] All progress indicators tied to real backend events?
- [ ] All terminal output from actual sandbox stdout?
- [ ] All test results from real test runner?
- [ ] No `setTimeout` used to simulate async work?
- [ ] No hard-coded mock data displayed as real data?

**Automated Detection:**

```javascript
// ESLint rule to detect suspicious patterns
{
  rules: {
    'no-fake-progress': 'error', // Flags setInterval/setTimeout on progress state
    'no-mock-data-in-ui': 'error', // Flags hard-coded arrays/objects in components
    'require-realtime-source': 'error' // Enforces useRealtimeX hooks for dynamic data
  }
}
```


#### 3.3 Why This Matters (Business Impact)

**User Trust Erosion Example:**

- **Scenario**: User starts task "Analyze 10,000 rows of data"
- **With Mocking**: Progress bar fills to 80% in 10 seconds, then stalls for 5 minutes
    - User thinks: "Is it actually working? Is it frozen?"
    - **Result**: User refreshes page, loses progress, leaves bad review[^2]
- **With Real Streaming**:

```
[10:00:00] Loading data... (10,000 rows)
[10:00:15] Processing row 1,000/10,000 (10%)
[10:00:30] Processing row 2,000/10,000 (20%)
... (user sees continuous progress)
[10:05:00] Processing row 10,000/10,000 (100%)
[10:05:05] Analysis complete!
```

    - User thinks: "I can see exactly what's happening. It's working!"
    - **Result**: User waits patiently, gets results, becomes loyal customer[^8][^2]

**Debugging Efficiency Example:**

- **With Mocking**: Task fails with generic "Error occurred"
    - User has NO idea what failed or why
    - Developer has NO logs to debug
- **With Real Streaming**: User sees exact failure point

```
[14:23:45] Running test_scraper_handles_pagination...
[14:23:47] ❌ FAILED: AssertionError at line 45
            Expected 100 reviews, got 50
            Pagination logic appears broken
```

    - User knows exactly what failed
    - Developer has full stack trace and context
    - Fix is deployed in minutes, not days[^8]

***

## 6. User Stories (Updated with Testing \& Transparency)

### Core User Stories

**As a user, I want to:**

1. **Start Instantly with Full Visibility** *(P0)*
    - Visit site → Click "New Task" → Sandbox ready in <10s
    - See live terminal immediately (no "loading" placeholder)
    - Watch agent boot up in real-time (installing packages, etc.)
2. **Assign Task with Auto-Generated Tests** *(P0)*
    - Type task description
    - Agent analyzes and generates test cases automatically[^1][^5]
    - I review test cases before agent starts coding
    - Option to add/modify test cases manually
3. **Watch Real-Time Test-Driven Development** *(P0)*
    - See agent write test suite first[^3]
    - Watch tests run (each test result appears as it finishes)[^2]
    - See agent write code to pass tests[^1]
    - If tests fail, watch agent debug and retry[^6]
4. **Monitor Every Agent Action Live** *(P0)*
    - Terminal output streams character-by-character[^2][^8]
    - Code generation appears line-by-line (syntax highlighted)
    - Test execution shows real-time pass/fail[^5]
    - No mock animations or fake progress bars
5. **Trust Agent-Generated Code** *(P0)*
    - Every tool has 80%+ test coverage[^1]
    - All tests must pass before tool is saved[^6]
    - View test results and code coverage reports
    - Download test logs for audit/compliance
6. **Access Tested Tool Library** *(P0)*
    - Browse all tools with test results displayed
    - See test coverage percentage for each tool
    - Re-run tests on existing tools anytime
    - View test history (when tests last ran, any recent failures)
7. **Debug Failed Tasks Easily** *(P1)*
    - If task fails, see exact failure point in real-time logs[^8]
    - Click on failed test to see full error trace
    - Agent suggests fixes based on test failures
    - Option to retry with agent improvements
8. **Configure Testing Requirements** *(P1)*
    - Set minimum test coverage (default: 80%)
    - Enable/disable specific test categories (e.g., performance tests)
    - Set test timeout limits
    - Toggle "strict mode" (no tool saved without 100% passing tests)

***

## 7. Technical Architecture (Updated)

### 7.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                 Frontend (React + Vite)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Task Input   │  │ Real-Time    │  │ Test Dashboard   │   │
│  │ & Test       │  │ Terminal +   │  │ (Live Results)   │   │
│  │ Review       │  │ Code View    │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│         Shadcn UI + Tailwind CSS + Monaco Editor              │
└─────────────────────┬─────────────────────────────────────────┘
                      │ WebSocket (Supabase Realtime)
┌─────────────────────▼─────────────────────────────────────────┐
│              Supabase Backend                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ PostgreSQL   │  │ Realtime     │  │ Edge Functions   │   │
│  │ (Tool DB +   │  │ (WebSocket   │  │ (Agent           │   │
│  │  Test        │  │  Streaming)  │  │  Orchestration)  │   │
│  │  Results)    │  │              │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────┬────────────┬────────────────────────────┘
                      │            │
        ┌─────────────▼──────┐  ┌─▼──────────────────────┐
        │  Gemini 2.0 Flash  │  │  E2B Sandboxes         │
        │  (Google AI)       │  │  (Code Execution +     │
        │  - Code gen        │  │   Test Running)        │
        │  - Test gen        │  │                        │
        │  - Reasoning       │  │  ┌──────────────────┐  │
        └────────────────────┘  │  │ Pytest Runner    │  │
                                │  │ (Real-Time       │  │
                                │  │  Streaming)      │  │
                                │  └──────────────────┘  │
                                └────────────────────────┘
```


### 7.2 Test-Driven Workflow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS TASK                                        │
│    "Create tool to analyze sentiment in customer reviews"  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AGENT ANALYZES REQUIREMENTS                              │
│    Gemini extracts:                                         │
│    - Input: List of review texts                            │
│    - Output: Sentiment scores (-1 to 1)                     │
│    - Edge cases: Empty reviews, non-English text           │
│    - Performance: Handle 10K reviews in <10s                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. GENERATE TEST SUITE (BEFORE CODE)                        │
│    Agent uses Gemini to create pytest tests:                │
│    ┌─────────────────────────────────────────────────┐     │
│    │ test_sentiment_analyzer.py                      │     │
│    │                                                 │     │
│    │ def test_positive_review():                     │     │
│    │     result = sentiment_analyzer("Great!")       │     │
│    │     assert result['score'] > 0.5                │     │
│    │                                                 │     │
│    │ def test_negative_review():                     │     │
│    │     result = sentiment_analyzer("Terrible")     │     │
│    │     assert result['score'] < -0.5               │     │
│    │                                                 │     │
│    │ def test_empty_input():                         │     │
│    │     with pytest.raises(ValueError):             │     │
│    │         sentiment_analyzer("")                  │     │
│    │ ... (15 more tests)                             │     │
│    └─────────────────────────────────────────────────┘     │
│    Tests saved to E2B sandbox /tests/ directory             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. USER REVIEWS TESTS (Optional)                            │
│    UI shows generated test cases                            │
│    User can add/modify/approve                              │
│    Click "Proceed" to continue                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GENERATE IMPLEMENTATION CODE                             │
│    Agent writes code to pass tests (streaming to UI):       │
│    ┌─────────────────────────────────────────────────┐     │
│    │ sentiment_analyzer.py                           │     │
│    │                                                 │     │
│    │ from transformers import pipeline               │     │
│    │                                                 │     │
│    │ def sentiment_analyzer(text: str) -> dict:      │     │
│    │     if not text:                                │     │
│    │         raise ValueError("Empty input")         │     │
│    │     model = pipeline("sentiment-analysis")      │     │
│    │     result = model(text)[^0]                     │     │
│    │     return {                                    │     │
│    │         'score': result['score'],               │     │
│    │         'label': result['label']                │     │
│    │     }                                           │     │
│    └─────────────────────────────────────────────────┘     │
│    Code generated line-by-line (user sees typing effect)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RUN TEST SUITE (LIVE STREAMING)                          │
│    E2B Sandbox executes: pytest test_sentiment_analyzer.py  │
│    ┌─────────────────────────────────────────────────┐     │
│    │ [12:34:56] test_positive_review ... ✅ PASSED   │     │
│    │ [12:34:57] test_negative_review ... ✅ PASSED   │     │
│    │ [12:34:58] test_empty_input ... ✅ PASSED       │     │
│    │ [12:34:59] test_performance_10k_reviews ...     │     │
│    │            ⏳ RUNNING (3.2s elapsed)            │     │
│    │ [12:35:02] test_performance_10k_reviews ...     │     │
│    │            ✅ PASSED (5.8s)                      │     │
│    │ ... (15 more tests)                             │     │
│    │ ===================================             │     │
│    │ 18/18 tests passed (100%)                       │     │
│    │ Coverage: 87%                                   │     │
│    └─────────────────────────────────────────────────┘     │
│    Each test result streamed to UI as it completes          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │  ALL TESTS PASSED?        │
        └─────┬────────────┬────────┘
              │ YES        │ NO
              ▼            ▼
     ┌────────────────┐  ┌────────────────────────────────┐
     │ 7. SAVE TOOL   │  │ 7. DEBUG & RETRY               │
     │    TO LIBRARY  │  │    Agent analyzes failures     │
     │                │  │    Modifies code               │
     │    Tool ready  │  │    Re-runs tests               │
     │    for use ✅  │  │    (Max 5 retry attempts)      │
     └────────────────┘  └────────────┬───────────────────┘
                                      │
                                      └──────► Goto Step 5
```


### 7.3 Realtime Streaming Implementation

**Supabase Realtime Channels** :[^2]

```typescript
// Channel naming convention:
sandbox:{sandbox_id}:terminal     → Terminal stdout/stderr
sandbox:{sandbox_id}:code_gen     → LLM code generation tokens
sandbox:{sandbox_id}:tests        → Test execution results
sandbox:{sandbox_id}:agent_think  → Agent reasoning logs
sandbox:{sandbox_id}:files        → File system changes
```

**Frontend Consumers**:

```typescript
// Real-time terminal component
const Terminal = ({ sandboxId }) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`sandbox:${sandboxId}:terminal`)
      .on('broadcast', { event: 'stdout' }, (payload) => {
        setLines(prev => [...prev, {
          type: 'stdout',
          content: payload.content,
          timestamp: payload.timestamp
        }]);
      })
      .on('broadcast', { event: 'stderr' }, (payload) => {
        setLines(prev => [...prev, {
          type: 'stderr',
          content: payload.content,
          timestamp: payload.timestamp
        }]);
      })
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [sandboxId]);
  
  return (
    <XTerm lines={lines} />
  );
};

// Real-time test results component
const TestResults = ({ sandboxId }) => {
  const [tests, setTests] = useState<TestResult[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`sandbox:${sandboxId}:tests`)
      .on('broadcast', { event: 'test_start' }, (payload) => {
        setTests(prev => [...prev, {
          name: payload.test_name,
          status: 'running',
          startTime: payload.timestamp
        }]);
      })
      .on('broadcast', { event: 'test_result' }, (payload) => {
        setTests(prev => prev.map(t => 
          t.name === payload.test_name
            ? { ...t, status: payload.outcome, duration: payload.duration }
            : t
        ));
      })
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [sandboxId]);
  
  return (
    <TestDashboard tests={tests} />
  );
};
```

**Backend Streaming** (E2B → Supabase):

```python
# In E2B sandbox agent runtime
import subprocess
import supabase

def run_tool_tests_streaming(tool_name, sandbox_id):
    """Run pytest with real-time streaming"""
    
    # Custom pytest plugin streams each test result
    process = subprocess.Popen(
        ['pytest', f'test_{tool_name}.py', '-v', '--tb=short'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1  # Line-buffered
    )
    
    # Stream stdout line-by-line
    for line in iter(process.stdout.readline, ''):
        if not line:
            break
        
        # Parse pytest output
        if '::test_' in line:
            test_name = line.split('::')[^1].split(' ')[^0]
            status = 'PASSED' if 'PASSED' in line else 'FAILED'
            
            # SEND TO SUPABASE IMMEDIATELY
            supabase.channel(f'sandbox:{sandbox_id}:tests').send({
                'event': 'test_result',
                'test_name': test_name,
                'outcome': status.lower(),
                'timestamp': time.time(),
                'raw_output': line.strip()
            })
        
        # Also stream raw terminal output
        supabase.channel(f'sandbox:{sandbox_id}:terminal').send({
            'event': 'stdout',
            'content': line,
            'timestamp': time.time()
        })
    
    process.wait()
    return process.returncode == 0  # All tests passed?
```


***

## 8. Development Setup (Perplexity + GitHub + Claude)

### 8.1 Workflow

**Primary Development Environment: Perplexity Spaces**[^17][^16]

**Why Perplexity Spaces?**

- **GitHub Integration**: Direct commits to repository[^16]
- **Claude 3.5 Sonnet Access**: Via Perplexity Pro API for complex reasoning[^14][^11]
- **Context-Aware Coding**: Can reference entire codebase + docs[^17]
- **Multi-Model Support**: Switch between Gemini, Claude, GPT-4 as needed[^16]

**Development Flow:**

```
1. Open Perplexity Space connected to GitHub repo
   ├─ Repo: github.com/yourusername/agentbox
   ├─ Branch: main (or feature branches)
   └─ Auto-sync enabled

2. Use Claude 3.5 Sonnet for complex features
   Example prompts:
   - "Implement test generation system following PRD section 5.1"
   - "Create real-time WebSocket streaming as per architecture diagram"
   - "Write pytest plugin for live test result streaming"

3. Claude generates code with:
   ├─ Full implementation
   ├─ Comprehensive tests (following our TDD principles)
   ├─ Documentation
   └─ Type hints (TypeScript/Python)

4. Review code in Perplexity interface
   ├─ Check against PRD requirements
   ├─ Verify tests are included
   └─ Ensure no mocking/simulation

5. Commit directly to GitHub from Perplexity
   ├─ Write clear commit messages
   ├─ Tag with PRD section (e.g., "feat: #5.1 test generation")
   └─ Auto-deploy via Vercel/Supabase webhooks
```


### 8.2 Tech Stack (Final)

**Frontend:**

- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS + Shadcn UI
- Monaco Editor (code display)
- XTerm.js (terminal emulator)
- TanStack Query (server state)

**Backend:**

- Supabase (PostgreSQL + Realtime + Auth + Storage + Edge Functions)
- E2B SDK (sandbox management)
- Google Gemini 2.0 Flash (primary LLM)[^12][^13]
- Claude 3.5 Sonnet via Perplexity (complex reasoning)[^15][^11]

**Testing:**

- Pytest (Python unit/integration tests)
- Jest + React Testing Library (frontend tests)
- Playwright (E2E tests)
- Custom pytest plugin (real-time streaming)

**DevOps:**

- GitHub (version control)
- Vercel (frontend hosting)
- Supabase Cloud (backend hosting)
- GitHub Actions (CI/CD with mandatory test runs)


### 8.3 Project Structure

```
agentbox/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── terminal/        # Real-time terminal component
│   │   │   ├── code-editor/     # Monaco-based code viewer
│   │   │   ├── test-dashboard/  # Live test results
│   │   │   └── task-input/      # Task submission form
│   │   ├── hooks/
│   │   │   ├── useRealtimeStream.ts  # WebSocket hooks
│   │   │   ├── useSandbox.ts         # Sandbox management
│   │   │   └── useToolLibrary.ts     # Tool CRUD
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   └── types.ts         # TypeScript types
│   │   └── pages/
│   │       ├── Landing.tsx
│   │       ├── Sandbox.tsx      # Main 3-panel interface
│   │       └── ToolLibrary.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Supabase Edge Functions
│   ├── functions/
│   │   ├── create-sandbox/      # E2B sandbox creation
│   │   ├── execute-task/        # Agent orchestration
│   │   ├── generate-tests/      # TDD test generation
│   │   ├── run-tests/           # Test execution
│   │   └── stream-logs/         # WebSocket log streaming
│   └── supabase/
│       ├── migrations/          # DB schema
│       └── config.toml
├── agent/                       # Agent runtime (runs in E2B sandbox)
│   ├── meta_tool_agent.py       # Main agent class
│   ├── tool_creator.py          # Meta-tooling system
│   ├── test_generator.py        # Auto-test creation
│   ├── realtime_streamer.py     # Log streaming to Supabase
│   └── pytest_plugin.py         # Custom pytest real-time plugin
├── tests/                       # Our own test suite
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── PRD.md                   # This document
│   ├── API.md                   # API documentation
│   └── DEVELOPMENT.md           # Setup guide
└── README.md
```


### 8.4 GitHub Actions CI/CD

```yaml
# .github/workflows/test-and-deploy.yml
name: Test & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/ --cov=. --cov-report=xml
      
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm install
          npm run test:coverage
      
      - name: Fail if coverage < 80%
        run: |
          # Enforce 80% coverage requirement
          coverage report --fail-under=80
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel deploy --prod
      
      - name: Deploy Supabase Functions
        run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```


***

## 9. Success Metrics (Updated)

### Development Velocity

- **PRD → MVP Timeline**: 6 weeks (using Perplexity + Claude)[^11][^15]
- **Features Shipped per Week**: 3-5 major features
- **Code Review Time**: <2 hours (AI-assisted reviews)


### Code Quality (Mandatory Metrics)

- **Test Coverage**: 80%+ across all codebases[^1][^6]
- **Test Pass Rate**: 100% before any deployment[^7][^6]
- **Code Generation Success**: 90%+ of agent-created tools pass all tests on first try[^3]


### User Trust \& Engagement

- **Real-Time Visibility**: 100% of agent actions visible to users[^2]
- **Task Transparency Score**: User survey rating (target: 4.5+/5) on "I understood what the agent was doing"
- **Debug Success Rate**: 95%+ of failed tasks can be debugged from logs[^8]


### Performance

- **Sandbox Boot Time**: <10 seconds[^19]
- **Test Execution Streaming Latency**: <100ms from sandbox to UI[^8][^2]
- **Code Generation Speed**: 50+ lines/second streamed to UI[^13]


### Business Metrics

- **User Retention (7-day)**: 60%+ (high trust → high retention)
- **Task Success Rate**: 80%+ tasks complete without errors[^6]
- **Tool Reuse Rate**: 70%+ tasks use existing tested tools from library

***

## 10. Risk Mitigation

| **Risk** | **Impact** | **Mitigation** |
| :-- | :-- | :-- |
| **AI generates broken tests** | High | Human review step before code generation; agent validates tests are runnable [^1] |
| **Test execution too slow** | Medium | Parallel test execution; cache test results; optimize sandbox performance [^8] |
| **Real-time streaming fails** | Critical | Fallback to polling; error recovery; store logs in DB as backup [^2] |
| **Users skip test review** | Medium | Default to "agent proceeds after 30s" if no input; highlight critical tests |
| **Test coverage < 80%** | High | Automated coverage checks; block tool save if below threshold [^6] |
| **Perplexity/Claude API costs** | Medium | Use Gemini free tier for routine tasks; Claude only for complex reasoning [^12] |
| **Complex tasks timeout** | Medium | Increase E2B sandbox limits; implement task checkpointing/resumption [^20] |


***

## 11. Appendix

### 11.1 Example PRD Usage (Perplexity Workflow)

**Prompt to Claude 3.5 Sonnet in Perplexity Space:**

```
You are building AgentBox according to the PRD v3.0.

Task: Implement the test generation system (Section 5.2)

Requirements from PRD:
- Generate comprehensive test suites before any code
- Support all test categories (unit, integration, functional, security, performance)
- Tests must be runnable in E2B sandbox
- Stream test generation progress to user via Supabase Realtime

Please provide:
1. Python implementation of test_generator.py
2. Comprehensive unit tests for the test generator itself (meta!)
3. Integration with Gemini 2.0 Flash API
4. Real-time streaming hooks for progress updates
5. Example test suite generated for a sample tool (web scraper)

Follow TDD principles: write tests for test_generator.py first!
```

**Claude Response (Streamed to Perplexity):**

```python
# Claude generates full implementation with:
# - Test generator code
# - Tests for the test generator (meta-testing!)
# - Documentation
# - Example outputs

# All code includes comprehensive type hints, error handling,
# and real-time streaming integration as per PRD requirements
```

**Commit from Perplexity to GitHub:**

```
feat: #5.2 test generation system

- Implemented test_generator.py with Gemini integration
- Added 32 unit tests (100% coverage)
- Real-time streaming via Supabase channels
- Supports all PRD-defined test categories

Closes #PRD-5.2
```


### 11.2 Testing Philosophy (Summary)

**"Every Line Tested, Every Action Visible"**

1. **No untested code runs** → AI can't hallucinate its way into production[^1][^6]
2. **No fake progress** → Users see real work or nothing at all[^2]
3. **Transparency builds trust** → Live streaming converts skeptics to believers[^8]
4. **Tests are documentation** → Passing tests prove code works as intended[^3]

***

## 12. Conclusion

**AgentBox v3.0** is not just an AI agent platform—it's a **production-grade, test-driven, radically transparent system** that sets a new standard for trustworthy AI automation.[^6][^1][^2]

By combining:

- **Meta-tooling** (agents that evolve)[^4]
- **Test-Driven Development** (AI code that's actually reliable)[^3][^1][^6]
- **Real-Time Transparency** (no secrets, no mocking)[^9][^2][^8]

We create an experience where users **trust** the agent, **understand** its actions, and **rely** on its outputs for mission-critical tasks.

**Next Steps:**

1. Set up Perplexity Space + GitHub integration[^16]
2. Bootstrap Supabase project with database schema
3. Implement Phase 1: Test generation system (Week 1-2)
4. Implement Phase 2: Real-time streaming infrastructure (Week 3-4)
5. Integrate meta-tooling with TDD (Week 5-6)
6. Beta launch with 10 trusted users (Week 7)

***

**Document Version:** 3.0.0
**Last Updated:** October 26, 2025
**Status:** READY FOR DEVELOPMENT ✅
**Total Estimated Dev Time:** 6-8 weeks
**Development Stack:** Perplexity Spaces + Claude 3.5 Sonnet + GitHub

***

**END OF DOCUMENT**
<span style="display:none">[^21][^22][^23][^24][^25][^26][^27]</span>

<div align="center">⁂</div>

[^1]: https://arxiv.org/abs/2402.13521

[^2]: https://www.confluent.io/blog/introducing-streaming-agents/

[^3]: https://www.builder.io/blog/test-driven-development-ai

[^4]: https://strandsagents.com/latest/documentation/docs/examples/python/meta_tooling/

[^5]: https://www.qodo.ai/blog/ai-code-assistants-test-driven-development/

[^6]: https://ecosystem4engineering.substack.com/p/the-raising-importance-of-test-driven

[^7]: https://www.servicenow.com/community/developer-articles/test-driven-code-generation/ta-p/3130610

[^8]: https://docs.newrelic.com/docs/apm/agents/manage-apm-agents/agent-data/real-time-streaming/

[^9]: https://www.xenonstack.com/blog/streaming-data-visualizations

[^10]: https://github.com/madhurprash/meta-tools-and-agents

[^11]: https://www.youtube.com/watch?v=CaR7Kw-sKuY

[^12]: https://ai.google.dev/gemini-api/docs/pricing

[^13]: https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/

[^14]: https://www.perplexity.ai/page/anthropic-launches-claude-sonn-cvFe07jCRi2_ILL9NGEOvQ

[^15]: https://www.anthropic.com/claude/sonnet

[^16]: https://github.com/helallao/perplexity-ai

[^17]: https://github.com/BCG-X-Official/artkit/issues/102

[^18]: https://aicompetence.org/superagi-vs-autogpt-vs-opendevin-agent-tools/

[^19]: https://e2b.dev

[^20]: https://e2b.dev/pricing

[^21]: https://www.youtube.com/watch?v=_JjQRZEOOY8

[^22]: https://memgraph.com/blog/streaming-analytics-tools

[^23]: https://www.ibex.co/technology/heatmap

[^24]: https://www.reddit.com/r/GithubCopilot/comments/1mnagsg/is_perplexity_mcp_server_integration_worth_it/

[^25]: https://learn.microsoft.com/en-ie/answers/questions/2245298/exercise-create-a-real-time-data-visualization

[^26]: https://www.readysetcloud.io/blog/allen.helton/tdd-with-ai/

[^27]: https://pixelplex.io/blog/real-time-data-visualization/

