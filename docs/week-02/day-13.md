---
title: "Day 13 - Cargo Fundamentals"
description: "Learn about cargo fundamentals in Rust"
---

# Day 13: Cargo Fundamentals

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Create, build, and run a Rust project with Cargo, and understand what `Cargo.toml`, `Cargo.lock`, and the `target/` directory are for.

## 📚 The Concept (3 min)

So far you could get away with compiling single files using `rustc`, but real Rust projects are never one file. They have multiple modules (like yesterday's lesson), dependencies on other people's code, tests, and different build configurations. **Cargo** is the tool that manages all of it — it's Rust's build system *and* package manager in one, and it ships with every Rust installation.

Think of Cargo as a project manager for your code. You don't tell it *how* to compile — you describe *what* your project is in a small manifest file called `Cargo.toml`, and Cargo figures out the rest: which files to compile, in what order, which third-party libraries (called **crates**) to download from [crates.io](https://crates.io), and which versions of them are compatible.

The commands you'll use every day:

- `cargo new my_app` — creates a new project: a `Cargo.toml` manifest plus `src/main.rs` with a Hello World.
- `cargo build` — compiles your project into `target/debug/`.
- `cargo run` — builds (if needed) and runs in one step. This is your main loop.
- `cargo check` — type-checks without producing a binary. Much faster; use it constantly while writing code.
- `cargo build --release` — optimized build in `target/release/` for when speed matters.
- `cargo add serde` — adds the `serde` crate to your dependencies.

Two files matter: `Cargo.toml` is *yours* — you edit it to declare your package name, version, and dependencies. `Cargo.lock` is *Cargo's* — it records the exact versions that were resolved, so every machine builds identically. You commit both, but never hand-edit the lock file.

::: tip Key Insight
Cargo is declarative: you describe *what* your project needs in `Cargo.toml`, and Cargo handles *how* — compiling, dependency resolution, and reproducible builds via `Cargo.lock`. From today on, forget `rustc` and use `cargo run`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Run `cargo new hello_cargo`, and Cargo generates this layout:

```
hello_cargo/
├── Cargo.toml
└── src/
    └── main.rs
```

The generated `Cargo.toml`:

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2021"

[dependencies]
```

Replace `src/main.rs` with this, then run `cargo run` from inside the project folder:

```rust
fn main() {
    println!("Hello from a Cargo project!");
    println!("Cargo built, ran, and managed this for me.");
}
```

::: details Output
```
   Compiling hello_cargo v0.1.0 (/path/to/hello_cargo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/hello_cargo`
Hello from a Cargo project!
Cargo built, ran, and managed this for me.
```
:::

### Example 2: Practical Application

Cargo injects information from `Cargo.toml` into your program as compile-time environment variables. This program reads its own package name and version, and detects whether it was built in debug or release mode — the same trick real CLI tools use for their `--version` flag. Create it with `cargo new build_info` and put this in `src/main.rs`:

```rust
fn main() {
    // Cargo injects these environment variables at compile time.
    let name = option_env!("CARGO_PKG_NAME").unwrap_or("unknown");
    let version = option_env!("CARGO_PKG_VERSION").unwrap_or("0.0.0");

    let profile = if cfg!(debug_assertions) {
        "debug (fast compile, no optimizations)"
    } else {
        "release (optimized)"
    };

    println!("Package : {name} v{version}");
    println!("Profile : {profile}");
}
```

::: details Output
Running `cargo run`:
```
Package : build_info v0.1.0
Profile : debug (fast compile, no optimizations)
```

Running `cargo run --release`:
```
Package : build_info v0.1.0
Profile : release (optimized)
```
:::

Notice: the values come straight from `Cargo.toml` — rename the package there, rebuild, and the output changes. No code edits needed.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Cargo is both Rust's build system and its package manager — `cargo new`, `cargo run`, and `cargo check` cover most of your daily workflow  
✅ `Cargo.toml` is the manifest you edit (name, version, dependencies); `Cargo.lock` records exact resolved versions and should never be hand-edited  
✅ Debug builds land in `target/debug/` (fast to compile), release builds in `target/release/` (optimized with `--release`)  
✅ Cargo passes package metadata into your code via compile-time env vars like `CARGO_PKG_NAME` and `CARGO_PKG_VERSION`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Running `cargo run` from the wrong directory.** Cargo looks for `Cargo.toml` in the current directory (and its parents). If you're one level above your project, you'll get `error: could not find Cargo.toml` — `cd` into the project folder first.
- **Hand-editing `Cargo.lock` or adding it to `.gitignore` for a binary.** The lock file is what makes builds reproducible across machines. Commit it for applications; Cargo regenerates it only when `Cargo.toml` changes.
- **Benchmarking a debug build.** `cargo build` produces an unoptimized binary that can be 10–100x slower than the real thing. If you're measuring performance, always use `cargo run --release`.
:::

## ✅ Quick Challenge

Build a `--version`-style banner for a CLI tool. Create a project with `cargo new my-tool`, then make it print exactly one line in the format `my-tool v0.1.0 (debug build)` — pulling the name and version from Cargo's env vars, and choosing `debug` or `release` based on how it was compiled. Verify both `cargo run` and `cargo run --release` print the right mode.

```rust
// Starter code
fn main() {
    // TODO: print a banner like:
    // my-tool v0.1.0 (debug build)
    let name = option_env!("CARGO_PKG_NAME");
    let _ = name; // remove this once you use `name`
}
```

<details>
<summary>💡 Hint</summary>

`option_env!("CARGO_PKG_NAME")` gives you an `Option<&str>` — chain `.unwrap_or("my-tool")` to get a plain string with a fallback. For the build mode, `cfg!(debug_assertions)` evaluates to `true` in debug builds and `false` in release builds, so an `if`/`else` picks the label.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let name = option_env!("CARGO_PKG_NAME").unwrap_or("my-tool");
    let version = option_env!("CARGO_PKG_VERSION").unwrap_or("0.1.0");
    let mode = if cfg!(debug_assertions) { "debug" } else { "release" };

    println!("{name} v{version} ({mode} build)");
}
```

With `cargo run` this prints `my-tool v0.1.0 (debug build)`; with `cargo run --release` it prints `my-tool v0.1.0 (release build)`.

</details>

## 📖 Additional Resources

- [The Rust Book - Hello, Cargo!](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust by Example - Cargo](https://doc.rust-lang.org/rust-by-example/cargo.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-12">← Day 12: Modules Basics</a>
  <a href="/week-02/day-14">Day 14: Project: CLI Calculator →</a>
</div>
