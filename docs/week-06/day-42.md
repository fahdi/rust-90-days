---
title: "Day 42 - Project: JSON-like Data Structure"
description: "Learn about project: json-like data structure in Rust"
---

# Day 42: Project: JSON-like Data Structure

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Build a recursive `Json` enum that can represent any JSON document, nulls, booleans, numbers, strings, arrays, and objects, and write code that walks and serializes it. This is the capstone that ties together enums, pattern matching, collections, and traits from the past two weeks.

## 📚 The Concept (3 min)

JSON is the perfect stress test for Rust's type system, because a JSON value can be one of six completely different things: `null`, a boolean, a number, a string, an array of *more JSON values*, or an object mapping strings to *more JSON values*. In a dynamically typed language you'd just use whatever comes back. In Rust, you need one type that can hold any of them, and that's exactly what an enum is for.

Think of the enum as a labeled shipping box. Every box has a sticker on the outside (`Null`, `Bool`, `Number`, `String`, `Array`, `Object`) telling you what's inside, and `match` forces you to check the sticker before you open it. You can never accidentally treat a string as a number, because the compiler makes you handle every variant.

The interesting twist is *recursion*: the `Array` variant holds a `Vec<Json>` and the `Object` variant holds a map of `String` to `Json`, the type refers to itself. That's legal because `Vec` and maps store their contents on the heap, so the compiler always knows the size of a `Json` value itself. (A variant holding a bare `Json` directly would be infinitely sized, that's why self-referencing enums always go through `Vec`, `Box`, or a map.)

This design is not a toy. The most-downloaded crate in the Rust ecosystem, `serde_json`, defines its `Value` type in almost exactly this shape. Once you've built this by hand, reading real-world Rust that manipulates `serde_json::Value` feels completely natural. Functions that operate on the tree, serializing, counting, searching, are all written the same way: `match` on the variant, handle leaves directly, and recurse into `Array` and `Object`.

::: tip Key Insight
An enum whose variants contain `Vec<Self>` or a map of `Self` gives you a *recursive tree type*: one `Json` value can represent an arbitrarily nested document, and `match` + recursion is how you process it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Define the enum (objects come in Example 2) and classify values with `match`:

```rust
#[derive(Debug)]
enum Json {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Json>),
}

fn describe(value: &Json) -> String {
    match value {
        Json::Null => "null".to_string(),
        Json::Bool(b) => format!("bool: {}", b),
        Json::Number(n) => format!("number: {}", n),
        Json::String(s) => format!("string: \"{}\"", s),
        Json::Array(items) => format!("array with {} items", items.len()),
    }
}

fn main() {
    let values = vec![
        Json::Null,
        Json::Bool(true),
        Json::Number(42.5),
        Json::String("hello".to_string()),
        Json::Array(vec![Json::Number(1.0), Json::Number(2.0), Json::Null]),
    ];

    for v in &values {
        println!("{}", describe(v));
    }
}
```

### Example 2: Practical Application

Add the `Object` variant, a real serializer via the `Display` trait, and a `get` helper for navigating objects. We use `BTreeMap` so keys serialize in a stable order:

```rust
use std::collections::BTreeMap;
use std::fmt;

#[derive(Debug)]
enum Json {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Json>),
    Object(BTreeMap<String, Json>),
}

impl fmt::Display for Json {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Json::Null => write!(f, "null"),
            Json::Bool(b) => write!(f, "{}", b),
            Json::Number(n) => write!(f, "{}", n),
            Json::String(s) => write!(f, "\"{}\"", s),
            Json::Array(items) => {
                let parts: Vec<String> = items.iter().map(|v| v.to_string()).collect();
                write!(f, "[{}]", parts.join(","))
            }
            Json::Object(map) => {
                let parts: Vec<String> = map
                    .iter()
                    .map(|(k, v)| format!("\"{}\":{}", k, v))
                    .collect();
                write!(f, "{{{}}}", parts.join(","))
            }
        }
    }
}

impl Json {
    /// Look up a key if this value is an object.
    fn get(&self, key: &str) -> Option<&Json> {
        match self {
            Json::Object(map) => map.get(key),
            _ => None,
        }
    }
}

fn main() {
    let mut user = BTreeMap::new();
    user.insert("name".to_string(), Json::String("Ada".to_string()));
    user.insert("age".to_string(), Json::Number(36.0));
    user.insert("admin".to_string(), Json::Bool(true));
    user.insert("nickname".to_string(), Json::Null);
    user.insert(
        "languages".to_string(),
        Json::Array(vec![
            Json::String("Rust".to_string()),
            Json::String("SQL".to_string()),
        ]),
    );

    let doc = Json::Object(user);

    // Serialize the whole tree
    println!("{}", doc);

    // Navigate into it
    if let Some(name) = doc.get("name") {
        println!("name field = {}", name);
    }
    println!("missing field = {:?}", doc.get("email"));
}
```

Notice how `Display` for `Array` and `Object` calls `to_string()` on child values, which calls `Display` again. The recursion in the type is mirrored by recursion in the code.

::: details Output
Example 1:
```
null
bool: true
number: 42.5
string: "hello"
array with 3 items
```

Example 2:
```
{"admin":true,"age":36,"languages":["Rust","SQL"],"name":"Ada","nickname":null}
name field = "Ada"
missing field = None
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A recursive enum (variants holding `Vec<Json>` or a map of `Json`) can model arbitrarily nested data like JSON documents  
✅ Self-reference is only legal through heap-backed containers (`Vec`, `Box`, maps), a variant holding a bare `Json` would have infinite size  
✅ Implementing `Display` with a recursive `match` gives you a full serializer in ~20 lines; the recursion in the code mirrors the recursion in the type  
✅ Helper methods like `get` that return `Option<&Json>` make "wrong shape" (asking an array for a key) a safe `None` instead of a crash

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Trying `Nested(Json)` as a variant.** A variant containing the enum directly makes the type infinitely sized, and the compiler rejects it with "recursive type has infinite size." Wrap the self-reference in `Vec`, `Box`, or a map so the variant stores a fixed-size pointer instead.
- **Moving values out while matching.** Writing `match value { Json::String(s) => ... }` on a `Json` you still need later moves the `String` out and consumes the value. Match on `&value` (or take `&Json` as the parameter, as `describe` does) so you bind references instead.
- **Expecting `HashMap` keys to serialize in insertion order.** `HashMap` iteration order is effectively random, so the same document can serialize differently on every run, which breaks tests that compare output strings. Use `BTreeMap` (sorted keys) when you need deterministic output.
:::

## ✅ Quick Challenge

Write `count_values`, which returns the total number of `Json` values in a tree, counting the containers themselves *and* everything nested inside them. The starter compiles and runs but always answers `1`; make it recurse.

```rust
// Starter code
#[derive(Debug)]
enum Json {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Json>),
}

// TODO: implement count_values so it returns the total number of
// Json values in the tree, counting nested array elements too.
fn count_values(value: &Json) -> usize {
    1 // placeholder: fix me
}

fn main() {
    let data = Json::Array(vec![
        Json::Number(1.0),
        Json::Array(vec![Json::Bool(true), Json::Null]),
        Json::String("end".to_string()),
    ]);

    // Should print 6: the outer array, 1.0, the inner array, true, null, "end"
    println!("total values: {}", count_values(&data));
}
```

<details>
<summary>💡 Hint</summary>

Match on the variant. Every leaf (`Null`, `Bool`, `Number`, `String`) counts as `1`. An `Array` counts as `1` for itself, plus the counts of all its items, `items.iter().map(count_values).sum::<usize>()` does the recursion in one line.

</details>

<details>
<summary>✅ Solution</summary>

```rust
#[derive(Debug)]
enum Json {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Json>),
}

fn count_values(value: &Json) -> usize {
    match value {
        // Every leaf counts as exactly one value
        Json::Null | Json::Bool(_) | Json::Number(_) | Json::String(_) => 1,
        // An array counts as itself plus everything inside it (recursion!)
        Json::Array(items) => 1 + items.iter().map(count_values).sum::<usize>(),
    }
}

fn main() {
    let data = Json::Array(vec![
        Json::Number(1.0),
        Json::Array(vec![Json::Bool(true), Json::Null]),
        Json::String("end".to_string()),
    ]);

    println!("total values: {}", count_values(&data));
}
```

Output: `total values: 6`

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 6: Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html)
- [The Rust Book - Ch. 15.1: Using Box to Point to Data on the Heap (recursive types)](https://doc.rust-lang.org/book/ch15-01-box.html)
- [Rust by Example - Enums](https://doc.rust-lang.org/rust-by-example/custom_types/enum.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-41">← Day 41: Error Handling Strategies</a>
  <a href="/week-07/">Week 7 Overview →</a>
</div>
