---
title: "Day 90 - Final Project: Micro Web Server"
description: "Learn about final project: micro web server in Rust"
---

# Day 90: Final Project: Micro Web Server

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Expert</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Cap the course by building a working HTTP server from nothing but the standard library: parse requests, route them, write valid responses over raw TCP, and prove it works with an in-process client.

## 📚 The Concept (3 min)

Every web framework you will ever use, Actix, Axum, Rocket, bottoms out in the same three steps: accept a TCP connection, parse the bytes as HTTP, write bytes back. Building that loop once by hand permanently demystifies the stack, and it exercises nearly everything from the last 90 days: ownership across threads, `Result` error handling, traits (`Read`/`Write`), pattern matching, string parsing, and iterators.

HTTP/1.1 is refreshingly simple at its core. A request is plain text: a request line (`GET /hello HTTP/1.1`), then header lines, then a blank line. A response mirrors it: a status line (`HTTP/1.1 200 OK`), headers, `Content-Length` is the important one, so the client knows when the body ends, a blank line, then the body.

The server skeleton is:

1. `TcpListener::bind("127.0.0.1:7878")` claims a port.
2. `listener.incoming()` yields a `TcpStream` per connection.
3. Read the request, parse the method and path, match on the path to choose a handler.
4. Format and write the response, flush, drop the stream (which closes the connection).

A single-threaded loop handles one request at a time, one slow client stalls everyone. The classic fix (Rust Book chapter 21) is a thread pool; the modern fix is the async runtime from Days 85-86, where each connection becomes a cheap task. Our version below stays single-threaded for the server loop but spawns the *client* on a thread so one program can demonstrate both ends of the socket deterministically.

::: tip Key Insight
HTTP is just structured text over TCP. If you can parse `"GET /path HTTP/1.1"` and remember to send `Content-Length` plus the `\r\n\r\n` separator, you have a real web server that Firefox, curl, and load balancers will happily talk to.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Parsing a raw HTTP request, the pure logic, no sockets yet.

```rust
#[derive(Debug)]
struct Request {
    method: String,
    path: String,
}

fn parse_request(raw: &str) -> Option<Request> {
    let request_line = raw.lines().next()?;
    let mut parts = request_line.split_whitespace();
    let method = parts.next()?.to_string();
    let path = parts.next()?.to_string();
    let version = parts.next()?;
    if !version.starts_with("HTTP/") {
        return None;
    }
    Some(Request { method, path })
}

fn route(req: &Request) -> (u16, String) {
    match (req.method.as_str(), req.path.as_str()) {
        ("GET", "/") => (200, String::from("Welcome to the micro server!")),
        ("GET", "/health") => (200, String::from("ok")),
        _ => (404, String::from("not found")),
    }
}

fn main() {
    let raw = "GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n";
    let req = parse_request(raw).expect("valid request");
    println!("parsed: {:?}", req);
    let (status, body) = route(&req);
    println!("status {} body {:?}", status, body);

    let bad = parse_request("TOTAL GARBAGE");
    println!("garbage parses to: {:?}", bad.is_some());
}
```

### Example 2: Practical Application

The full server over real TCP, with an in-process client so the program is self-contained and exits on its own.

```rust
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;

fn handle(mut stream: TcpStream) {
    let mut reader = BufReader::new(&mut stream);
    let mut request_line = String::new();
    if reader.read_line(&mut request_line).is_err() {
        return;
    }

    let path = request_line.split_whitespace().nth(1).unwrap_or("/");
    let (status_line, body) = match path {
        "/" => ("HTTP/1.1 200 OK", "hello from rust-90-days"),
        "/health" => ("HTTP/1.1 200 OK", "ok"),
        _ => ("HTTP/1.1 404 NOT FOUND", "not found"),
    };

    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        body.len(),
        body
    );
    stream.write_all(response.as_bytes()).unwrap();
}

fn main() {
    // Port 0 asks the OS for any free port -- no collisions when testing.
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();

    let client = thread::spawn(move || {
        for path in ["/", "/health", "/missing"] {
            let mut stream = TcpStream::connect(addr).unwrap();
            let req = format!("GET {} HTTP/1.1\r\nHost: localhost\r\n\r\n", path);
            stream.write_all(req.as_bytes()).unwrap();
            let mut response = String::new();
            stream.read_to_string(&mut response).unwrap();
            let status = response.lines().next().unwrap_or("").to_string();
            let body = response.rsplit("\r\n\r\n").next().unwrap_or("").to_string();
            println!("GET {:9} -> {} | {}", path, status, body);
        }
    });

    // Serve exactly three requests, then exit.
    for stream in listener.incoming().take(3) {
        handle(stream.unwrap());
    }
    client.join().unwrap();
    println!("server done -- course complete!");
}
```

::: details Output
Example 1:
```
parsed: Request { method: "GET", path: "/health" }
status 200 body "ok"
garbage parses to: false
```

Example 2:
```
GET /         -> HTTP/1.1 200 OK | hello from rust-90-days
GET /health   -> HTTP/1.1 200 OK | ok
GET /missing  -> HTTP/1.1 404 NOT FOUND | not found
server done -- course complete!
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A web server is a loop: `TcpListener::bind` → `incoming()` → parse request text → match on path → write status line, `Content-Length`, blank line, body  
✅ The `\r\n\r\n` separator and an accurate `Content-Length` header are what make your bytes valid HTTP that real clients accept  
✅ Separating pure parsing/routing (Example 1) from I/O (Example 2) makes the logic unit-testable without sockets, the same discipline frameworks enforce with handler functions  
✅ Single-threaded serving blocks on slow clients; the production answers are a thread pool or the async tasks you built on Days 85-86, you now understand the full stack down to the bytes

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Forgetting `Content-Length` (or the blank line before the body): browsers and curl will hang waiting for more data or report a malformed response
- Using `read_to_string` on the *server* side for a keep-alive connection, it blocks until the client closes; read the request line/headers instead
- Binding a hardcoded port in tests or demos, "address already in use" errors; bind port 0 and read `local_addr()` as in Example 2
:::

## ✅ Quick Challenge

Extend the router from Example 1 with a dynamic route: any path of the form `/greet/<name>` should return `(200, "Hello, <name>!")`. Everything else keeps its current behavior.

```rust
// Starter code
fn route(method: &str, path: &str) -> (u16, String) {
    match (method, path) {
        ("GET", "/") => (200, String::from("Welcome!")),
        // handle GET /greet/<name> before the fallback
        _ => (404, String::from("not found")),
    }
}

fn main() {
    println!("{:?}", route("GET", "/"));
    println!("{:?}", route("GET", "/greet/ferris")); // (200, "Hello, ferris!")
    println!("{:?}", route("GET", "/nope"));
}
```

<details>
<summary>💡 Hint</summary>

Match guards or `strip_prefix` work well: `if let Some(name) = path.strip_prefix("/greet/")` gives you the remainder of the path; reject the empty-name case if you want to be strict.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn route(method: &str, path: &str) -> (u16, String) {
    if method == "GET" {
        if let Some(name) = path.strip_prefix("/greet/") {
            if !name.is_empty() {
                return (200, format!("Hello, {}!", name));
            }
        }
    }
    match (method, path) {
        ("GET", "/") => (200, String::from("Welcome!")),
        _ => (404, String::from("not found")),
    }
}

fn main() {
    println!("{:?}", route("GET", "/"));              // (200, "Welcome!")
    println!("{:?}", route("GET", "/greet/ferris"));  // (200, "Hello, ferris!")
    println!("{:?}", route("GET", "/greet/"));        // (404, "not found")
    println!("{:?}", route("GET", "/nope"));          // (404, "not found")
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/day-89">← Day 89: Unsafe Rust Intro</a>
  
</div>
