---
title: "Day 39 - Builder Pattern"
description: "Learn about builder pattern in Rust"
---

# Day 39: Builder Pattern

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Construct complex structs step by step using the builder pattern, with sensible defaults, a fluent chaining API, and a `build()` method that can validate required fields before handing you the final value.

## 📚 The Concept (3 min)

Rust has no constructor overloading, no optional parameters, and no named arguments. So how do you create a struct with ten fields where most have sensible defaults and only one or two are required? Calling `Config::new(a, b, c, d, e, f, ...)` is unreadable, and making every field public invites half-initialized values. The builder pattern is Rust's idiomatic answer.

Think of ordering a coffee. You don't recite every parameter of the drink, you start from a default ("a latte") and customize only what you care about ("oat milk, extra shot"). The barista assembles the final cup only when you finish ordering. A builder works the same way: a separate `FooBuilder` struct holds work-in-progress state initialized to defaults, each method tweaks one aspect and returns the builder (that's the method chaining you learned on Day 38), and a final `build()` consumes the builder and produces the real `Foo`.

The pattern has two big payoffs. First, ergonomics: callers write only the settings that differ from the defaults, in any order, and the code reads like a sentence. Second, safety: the target struct can keep its fields private and only ever exist in a fully-valid state, because `build()` is the single gate where validation happens. If a required field is missing, `build()` can return `Result::Err` instead of a broken object.

You've already used this everywhere in real Rust: `std::process::Command`, `std::thread::Builder`, and `reqwest::Client::builder()` are all builders. Today you'll write your own.

::: tip Key Insight
A builder separates *configuring* a value from *using* it: chainable methods accumulate settings on a throwaway builder struct, and `build()` is the one checkpoint where defaults are applied and required fields are validated, so the finished struct is always in a valid state.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A `ServerBuilder` with defaults for every field. Each method takes `mut self` by value and returns `Self`, enabling the chain:

```rust
#[derive(Debug)]
struct Server {
    host: String,
    port: u16,
    threads: usize,
}

struct ServerBuilder {
    host: String,
    port: u16,
    threads: usize,
}

impl ServerBuilder {
    fn new() -> Self {
        ServerBuilder {
            host: String::from("localhost"),
            port: 8080,
            threads: 4,
        }
    }

    fn host(mut self, host: &str) -> Self {
        self.host = host.to_string();
        self
    }

    fn port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    fn threads(mut self, threads: usize) -> Self {
        self.threads = threads;
        self
    }

    fn build(self) -> Server {
        Server {
            host: self.host,
            port: self.port,
            threads: self.threads,
        }
    }
}

fn main() {
    let default_server = ServerBuilder::new().build();
    println!("Default: {:?}", default_server);

    let custom_server = ServerBuilder::new()
        .host("0.0.0.0")
        .port(3000)
        .threads(16)
        .build();
    println!("Custom:  {:?}", custom_server);
}
```

### Example 2: Practical Application

A realistic HTTP request builder. The URL is *required*, so it's stored as `Option<String>` inside the builder and `build()` returns a `Result`, missing required data becomes a recoverable error, not a broken struct:

```rust
#[derive(Debug)]
struct HttpRequest {
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

struct HttpRequestBuilder {
    method: String,
    url: Option<String>,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

impl HttpRequestBuilder {
    fn new() -> Self {
        HttpRequestBuilder {
            method: String::from("GET"),
            url: None,
            headers: Vec::new(),
            body: None,
        }
    }

    fn method(mut self, method: &str) -> Self {
        self.method = method.to_string();
        self
    }

    fn url(mut self, url: &str) -> Self {
        self.url = Some(url.to_string());
        self
    }

    fn header(mut self, key: &str, value: &str) -> Self {
        self.headers.push((key.to_string(), value.to_string()));
        self
    }

    fn body(mut self, body: &str) -> Self {
        self.body = Some(body.to_string());
        self
    }

    fn build(self) -> Result<HttpRequest, String> {
        let url = self.url.ok_or("url is required")?;
        Ok(HttpRequest {
            method: self.method,
            url,
            headers: self.headers,
            body: self.body,
        })
    }
}

fn main() {
    let request = HttpRequestBuilder::new()
        .method("POST")
        .url("https://api.example.com/users")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer token123")
        .body(r#"{"name": "Alice"}"#)
        .build();

    match request {
        Ok(req) => {
            println!("{} {}", req.method, req.url);
            for (key, value) in &req.headers {
                println!("  {}: {}", key, value);
            }
            if let Some(body) = &req.body {
                println!("  body: {}", body);
            }
        }
        Err(e) => println!("Failed to build request: {}", e),
    }

    // Forgot the required url - build() catches it
    let bad = HttpRequestBuilder::new().method("GET").build();
    match bad {
        Ok(req) => println!("{} {}", req.method, req.url),
        Err(e) => println!("Failed to build request: {}", e),
    }
}
```

::: details Output
```
Example 1:
Default: Server { host: "localhost", port: 8080, threads: 4 }
Custom:  Server { host: "0.0.0.0", port: 3000, threads: 16 }

Example 2:
POST https://api.example.com/users
  Content-Type: application/json
  Authorization: Bearer token123
  body: {"name": "Alice"}
Failed to build request: url is required
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A builder is a separate struct that holds work-in-progress state with defaults; `build()` consumes it and produces the final, always-valid value  
✅ The consuming style, `fn port(mut self, ...) -> Self`, takes ownership so each call moves the builder into the next, making one-expression chains natural  
✅ Store *required* fields as `Option<T>` in the builder and have `build()` return `Result`, turning "forgot a field" into a compile-visible, handleable error  
✅ The standard library uses this pattern itself, `std::process::Command` and `std::thread::Builder` are builders you already call

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Reusing a consumed builder.** With `mut self` methods the builder is *moved* on every call, so `let b = ServerBuilder::new(); b.port(80); b.build();` fails with "use of moved value", `b.port(80)` consumed `b`. Either keep the whole chain in one expression or rebind: `let b = b.port(80);`.
- **Mixing up the receiver styles.** Writing `fn port(&mut self, ...) -> Self` doesn't compile without cloning, because you can't move fields out of a `&mut` borrow. Pick one style consistently: `mut self -> Self` (consuming, chains in one expression) or `&mut self -> &mut Self` (mutating, works in loops/conditionals but `build()` must clone or take the fields).
- **Skipping validation because "the types allow it."** If `build()` just copies fields across, an unset required field silently becomes a default like an empty `String`, and the bug surfaces far away at use time. Keep required fields as `Option` in the builder and fail fast in `build()`.
:::

## ✅ Quick Challenge

Write a `PizzaBuilder` for the `Pizza` struct below. Defaults: size `"medium"`, cheese on, no toppings. It needs `size()`, `no_cheese()`, a `topping()` method that can be called multiple times, and `build()`.

```rust
// Starter code
#[derive(Debug)]
struct Pizza {
    size: String,
    cheese: bool,
    toppings: Vec<String>,
}

// TODO: Create a PizzaBuilder with:
// - new()            -> defaults: size "medium", cheese true, no toppings
// - size(self, &str) -> Self
// - no_cheese(self)  -> Self
// - topping(self, &str) -> Self (callable multiple times)
// - build(self)      -> Pizza

fn main() {
    // Uncomment once your builder is ready:
    // let pizza = PizzaBuilder::new()
    //     .size("large")
    //     .topping("mushrooms")
    //     .topping("olives")
    //     .build();
    // println!("{:?}", pizza);
}
```

<details>
<summary>💡 Hint</summary>

Give `PizzaBuilder` the same three fields as `Pizza`, initialized to the defaults in `new()`. Every setter should follow the pattern `fn name(mut self, ...) -> Self { /* mutate a field */ self }`. For `topping()`, push onto the builder's `Vec` instead of replacing it, that's what lets callers stack multiple toppings.

</details>

<details>
<summary>✅ Solution</summary>

```rust
#[derive(Debug)]
struct Pizza {
    size: String,
    cheese: bool,
    toppings: Vec<String>,
}

struct PizzaBuilder {
    size: String,
    cheese: bool,
    toppings: Vec<String>,
}

impl PizzaBuilder {
    fn new() -> Self {
        PizzaBuilder {
            size: String::from("medium"),
            cheese: true,
            toppings: Vec::new(),
        }
    }

    fn size(mut self, size: &str) -> Self {
        self.size = size.to_string();
        self
    }

    fn no_cheese(mut self) -> Self {
        self.cheese = false;
        self
    }

    fn topping(mut self, topping: &str) -> Self {
        self.toppings.push(topping.to_string());
        self
    }

    fn build(self) -> Pizza {
        Pizza {
            size: self.size,
            cheese: self.cheese,
            toppings: self.toppings,
        }
    }
}

fn main() {
    let pizza = PizzaBuilder::new()
        .size("large")
        .topping("mushrooms")
        .topping("olives")
        .build();
    println!("{:?}", pizza);

    let vegan = PizzaBuilder::new().no_cheese().topping("peppers").build();
    println!("{:?}", vegan);
}
```

Output:

```
Pizza { size: "large", cheese: true, toppings: ["mushrooms", "olives"] }
Pizza { size: "medium", cheese: false, toppings: ["peppers"] }
```

</details>

## 📖 Additional Resources

- [The Rust Book - Method Syntax](https://doc.rust-lang.org/book/ch05-03-method-syntax.html)
- [Rust API Guidelines - Builders](https://rust-lang.github.io/api-guidelines/type-safety.html#builders-enable-construction-of-complex-values-c-builder)
- [Rust Design Patterns - Builder](https://rust-unofficial.github.io/patterns/patterns/creational/builder.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-38">← Day 38: Method Chaining</a>
  <a href="/week-06/day-40">Day 40: Project: Config Parser →</a>
</div>
