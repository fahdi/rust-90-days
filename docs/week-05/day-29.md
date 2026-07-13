---
title: "Day 29 - Defining Structs"
description: "Learn about defining structs in Rust"
---

# Day 29: Defining Structs

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Define your own struct types with named fields, create instances of them, and use struct update syntax and field init shorthand to build new values from existing ones.

## 📚 The Concept (3 min)

So far you've stored related data in separate variables or in tuples. That works, but it gets fragile fast: a tuple like `(String, String, u64, bool)` gives you no clue which field means what. A **struct** solves this by grouping related data under one name, with a *label* on every field.

Think of a struct as a custom form you design once and fill out many times. A `User` form has slots for `username`, `email`, `sign_in_count`, and `active`. Every instance of `User` is a filled-out copy of that form — the shape is guaranteed by the compiler, and you access data by name (`user.email`) instead of by position (`tuple.1`).

Defining a struct uses the `struct` keyword, a name in PascalCase, and a list of `field: Type` pairs. Creating an instance means providing a value for *every* field — Rust never leaves fields uninitialized. Mutability is all-or-nothing: if the binding is `mut`, you can change any field; there is no way to mark just one field as mutable.

Two ergonomic features come up constantly in real code:

- **Field init shorthand** — when a variable has the same name as a field, `User { email, .. }` works instead of `email: email`.
- **Struct update syntax** — `..other_instance` fills in every field you didn't mention from another instance. Great for "same as before, but with these changes" configuration.

One ownership note: if you move a `String` field out of one struct into another via `..`, the old instance can no longer be used as a whole (you learned why in Week 3).

::: tip Key Insight
A struct is a compiler-enforced contract: every instance always has every field, and you refer to data by meaningful names instead of positions. Design the shape once, and the compiler polices it everywhere.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let mut user1 = User {
        username: String::from("ferris"),
        email: String::from("ferris@rust-lang.org"),
        sign_in_count: 1,
        active: true,
    };

    println!("Username: {}", user1.username);
    println!("Email: {}", user1.email);

    // The whole instance is mutable, so we can update any field
    user1.sign_in_count += 1;
    println!("Sign-ins: {}", user1.sign_in_count);
    println!("Active: {}", user1.active);
}
```

::: details Output
```
Username: ferris
Email: ferris@rust-lang.org
Sign-ins: 2
Active: true
```
:::

### Example 2: Practical Application

```rust
struct ServerConfig {
    host: String,
    port: u16,
    max_connections: u32,
    use_tls: bool,
}

// Field init shorthand: `host` instead of `host: host`
fn build_config(host: String, port: u16) -> ServerConfig {
    ServerConfig {
        host,
        port,
        max_connections: 100,
        use_tls: false,
    }
}

fn main() {
    let dev = build_config(String::from("localhost"), 8080);

    // Struct update syntax: copy remaining fields from `dev`
    let prod = ServerConfig {
        host: String::from("api.example.com"),
        port: 443,
        use_tls: true,
        ..dev
    };

    println!("Prod server: {}:{}", prod.host, prod.port);
    println!("Max connections: {}", prod.max_connections);
    println!("TLS enabled: {}", prod.use_tls);
}
```

::: details Output
```
Prod server: api.example.com:443
Max connections: 100
TLS enabled: true
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `struct Name { field: Type, ... }` defines a new type; every instance must initialize every field  
✅ Access and update fields by name with dot syntax: `config.port`, `user.email`  
✅ Mutability applies to the whole instance (`let mut`) — you cannot make a single field mutable  
✅ Field init shorthand (`host,`) and struct update syntax (`..other`) cut boilerplate when building instances

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting a field at creation.** `User { username: ..., email: ... }` without `sign_in_count` and `active` does NOT compile — Rust reports "missing fields". Unlike some languages, there are no implicit defaults.
- **Trying `let user = ...; user.active = false;` without `mut`.** The binding controls mutability, so this fails with "cannot assign to `user.active`". Declare `let mut user` instead.
- **Using struct update syntax with owned fields, then touching the old instance.** `..dev` *moves* `dev`'s remaining `String` fields, so using `dev.max_connections` afterwards is fine (it's `Copy`) but `dev.host`-style access on a moved `String` field is a compile error. This does NOT compile: `let prod = ServerConfig { port: 443, ..dev }; println!("{}", dev.host);`
:::

## ✅ Quick Challenge

Define a `Book` struct with fields `title` (String), `author` (String), `pages` (u32), and `available` (bool). Create one instance and write a `describe` function that takes a reference to a `Book` and returns a one-line summary string.

```rust
// TODO: Define a `Book` struct with fields:
// title (String), author (String), pages (u32), available (bool)

fn main() {
    // TODO: Create a Book instance and print a description of it
}
```

<details>
<summary>💡 Hint</summary>

Have `describe` take `&Book` (a reference) so the book isn't moved into the function — you can still print or reuse it afterwards. Use `format!` to build the summary string.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Book {
    title: String,
    author: String,
    pages: u32,
    available: bool,
}

fn describe(book: &Book) -> String {
    let status = if book.available { "available" } else { "checked out" };
    format!("'{}' by {} ({} pages) - {}", book.title, book.author, book.pages, status)
}

fn main() {
    let book = Book {
        title: String::from("The Rust Programming Language"),
        author: String::from("Klabnik & Nichols"),
        pages: 560,
        available: true,
    };
    println!("{}", describe(&book));
}
```

Output:

```
'The Rust Programming Language' by Klabnik & Nichols (560 pages) - available
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 5.1: Defining and Instantiating Structs](https://doc.rust-lang.org/book/ch05-01-defining-structs.html)
- [Rust by Example - Structures](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/">← Week 5 Overview</a>
  <a href="/week-05/day-30">Day 30: Struct Methods →</a>
</div>
