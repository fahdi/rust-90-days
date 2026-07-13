---
title: "Day 40 - Project: Config Parser"
description: "Learn about project: config parser in Rust"
---

# Day 40: Project: Config Parser

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Build a small but real config parser: read `key = value` text into a `HashMap`, then layer typed, error-aware accessors on top so callers get a `u16` port or a `bool` flag instead of raw strings.

## 📚 The Concept (3 min)

Almost every program you will ever ship reads configuration: a database URL, a port number, a feature flag. The file format is usually trivial, lines of `key = value`, maybe comments starting with `#`. The interesting engineering is not the format; it's the *boundary* it represents. A config file is untrusted text arriving from outside your program, and today's project is about turning that untrusted text into trusted, typed values.

Think of the parser as an airport with two checkpoints. Checkpoint one is **structural**: split each line at the first `=`, trim whitespace, skip blanks and comments. Everything that passes lands in a `HashMap<String, String>`, the raw arrivals hall. Checkpoint two is **semantic**: when the application asks for `port`, we don't hand back the string `"8080"`; we parse it into a `u16` and return a `Result`, because the file might say `port = banana`.

This project pulls together several tools from earlier weeks:

- `str::split_once('=')` gives an `Option<(&str, &str)>`, one clean split at the *first* `=`, so values like `url = http://x?a=b` stay intact.
- `HashMap` stores the raw pairs.
- A custom `ConfigError` enum (with `Display`) distinguishes "key missing" from "value unparseable", callers can react differently to each.
- A generic method `get_as` bounded by `FromStr` means one function handles `u16`, `u32`, `bool`, `f64`, and any type you implement `FromStr` for. That's the same trait `"42".parse()` uses under the hood.

Notice the layering: parsing structure and interpreting values are separate steps. Real-world crates like `toml` and `serde` follow exactly this split, today you're building the miniature version by hand.

::: tip Key Insight
Parse at the boundary, then trust the types. Convert stringly-typed input into typed values (with `Result` for what can fail) in one place, so the rest of your program never touches raw strings.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A minimal parser: skip comments and blank lines, split each remaining line at the first `=`, and collect the trimmed pairs into a `HashMap`.

```rust
use std::collections::HashMap;

fn parse_config(input: &str) -> HashMap<String, String> {
    let mut config = HashMap::new();
    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue; // skip blanks and comments
        }
        if let Some((key, value)) = line.split_once('=') {
            config.insert(key.trim().to_string(), value.trim().to_string());
        }
    }
    config
}

fn main() {
    let raw = "\
# Server settings
host = localhost
port = 8080

# Feature flags
debug = true";

    let config = parse_config(raw);
    println!("host  -> {:?}", config.get("host"));
    println!("port  -> {:?}", config.get("port"));
    println!("debug -> {:?}", config.get("debug"));
}
```

### Example 2: Practical Application

Now wrap the map in a `Config` type with typed accessors. `get_as` is generic over any `T: FromStr`, and a custom error enum tells callers exactly what went wrong.

```rust
use std::collections::HashMap;
use std::fmt;
use std::str::FromStr;

#[derive(Debug)]
enum ConfigError {
    MissingKey(String),
    InvalidValue { key: String, value: String },
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::MissingKey(key) => write!(f, "missing key: {}", key),
            ConfigError::InvalidValue { key, value } => {
                write!(f, "invalid value {:?} for key: {}", value, key)
            }
        }
    }
}

struct Config {
    values: HashMap<String, String>,
}

impl Config {
    fn parse(input: &str) -> Self {
        let mut values = HashMap::new();
        for line in input.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((k, v)) = line.split_once('=') {
                values.insert(k.trim().to_string(), v.trim().to_string());
            }
        }
        Config { values }
    }

    fn get(&self, key: &str) -> Result<&str, ConfigError> {
        self.values
            .get(key)
            .map(|s| s.as_str())
            .ok_or_else(|| ConfigError::MissingKey(key.to_string()))
    }

    /// Fetch a value and parse it into any type that implements FromStr.
    fn get_as<T: FromStr>(&self, key: &str) -> Result<T, ConfigError> {
        let raw = self.get(key)?;
        raw.parse().map_err(|_| ConfigError::InvalidValue {
            key: key.to_string(),
            value: raw.to_string(),
        })
    }
}

fn main() {
    let raw = "\
host = 127.0.0.1
port = 8080
max_connections = 512
tls = false";

    let config = Config::parse(raw);

    let host = config.get("host").unwrap();
    let port: u16 = config.get_as("port").unwrap();
    let max_conns: u32 = config.get_as("max_connections").unwrap();
    let tls: bool = config.get_as("tls").unwrap();

    println!("Connecting to {}:{} (tls: {})", host, port, tls);
    println!("Connection pool size: {}", max_conns);

    // Missing keys become errors, not panics
    match config.get_as::<u32>("timeout") {
        Ok(t) => println!("timeout: {}", t),
        Err(e) => println!("Error: {}", e),
    }
}
```

::: details Output
Example 1:
```
host  -> Some("localhost")
port  -> Some("8080")
debug -> Some("true")
```

Example 2:
```
Connecting to 127.0.0.1:8080 (tls: false)
Connection pool size: 512
Error: missing key: timeout
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `split_once('=')` splits at the *first* `=` only, so values containing `=` (URLs, connection strings) survive intact  
✅ Parse structure first into `HashMap<String, String>`, then convert to typed values in a separate step, the same layering `toml`/`serde` use  
✅ One generic `get_as` method bounded by `FromStr` handles `u16`, `bool`, `f64`, and any custom type, no per-type accessor needed  
✅ A two-variant error enum (`MissingKey` vs `InvalidValue`) lets callers apply defaults for missing keys but reject corrupt ones

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting to `trim()`**, the line `port = 8080` splits into `"port "` and `" 8080"`. Without trimming, `config.get("port")` returns `None` and `" 8080".parse::<u16>()` fails, because `parse` does not skip surrounding whitespace for you.
- **Using `split('=')` and taking two pieces**, `database_url = postgres://u:p@host?tls=true` contains a second `=`, so a naive two-part split silently truncates the value at `tls`. `split_once` exists precisely for this.
- **Unwrapping every lookup**, `config.get_as::<u16>("port").unwrap()` turns a one-character typo in a user's config file into a panic with a backtrace. Return the `ConfigError` up to `main` and print a message that names the bad key and value instead. (Also note `bool::from_str` is strict: `"true"` parses, `"True"` and `"yes"` do not.)
:::

## ✅ Quick Challenge

Extend the basic parser to support INI-style section headers. A line like `[server]` should make every following key store as `server.key`, so `host = localhost` under `[server]` is retrievable as `config.get("server.host")`. Keys before any section header keep their plain names.

```rust
// Starter code
use std::collections::HashMap;

fn parse_config(input: &str) -> HashMap<String, String> {
    let mut config = HashMap::new();
    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        // TODO: detect [section] headers and prefix keys as "section.key"
        if let Some((key, value)) = line.split_once('=') {
            config.insert(key.trim().to_string(), value.trim().to_string());
        }
    }
    config
}

fn main() {
    let raw = "[server]\nhost = localhost\nport = 8080";
    let config = parse_config(raw);
    // Should print Some("localhost") once sections are supported:
    println!("{:?}", config.get("server.host"));
}
```

<details>
<summary>💡 Hint</summary>

Keep a `let mut section = String::new();` outside the loop. When a line starts with `[` and ends with `]`, slice out the middle with `line[1..line.len() - 1]`, store it in `section`, and `continue`. When inserting a key, build the full name with `format!("{}.{}", section, key)`, unless `section.is_empty()`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::collections::HashMap;

fn parse_config(input: &str) -> HashMap<String, String> {
    let mut config = HashMap::new();
    let mut section = String::new();

    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        // Section header: remember it for the lines that follow
        if line.starts_with('[') && line.ends_with(']') {
            section = line[1..line.len() - 1].trim().to_string();
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            let full_key = if section.is_empty() {
                key.trim().to_string()
            } else {
                format!("{}.{}", section, key.trim())
            };
            config.insert(full_key, value.trim().to_string());
        }
    }
    config
}

fn main() {
    let raw = "\
[server]
host = localhost
port = 8080

[logging]
level = debug";

    let config = parse_config(raw);
    println!("{:?}", config.get("server.host"));
    println!("{:?}", config.get("server.port"));
    println!("{:?}", config.get("logging.level"));
}
```

Output:

```
Some("localhost")
Some("8080")
Some("debug")
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 8.3: Hash Maps](https://doc.rust-lang.org/book/ch08-03-hash-maps.html)
- [The Rust Book - Ch. 9: Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [std docs: str::split_once](https://doc.rust-lang.org/std/primitive.str.html#method.split_once)
- [std docs: FromStr trait](https://doc.rust-lang.org/std/str/trait.FromStr.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-39">← Day 39: Builder Pattern</a>
  <a href="/week-06/day-41">Day 41: Error Handling Strategies →</a>
</div>
