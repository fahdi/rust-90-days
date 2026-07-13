---
title: "Day 73 - Lifetime Elision Rules"
description: "Learn about lifetime elision rules in Rust"
---

# Day 73: Lifetime Elision Rules

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Learn the three elision rules the compiler applies to fill in lifetimes automatically, so you know exactly when you can omit `'a`, and why some signatures still demand it.

## 📚 The Concept (3 min)

If every reference needs a lifetime, why did `fn first_word(s: &str) -> &str` compile on Day 71 with no annotations? Because early Rust programmers wrote the same obvious annotations over and over, the team baked those patterns into the compiler as **elision rules**. When a signature matches the patterns, the compiler fills in lifetimes for you; when it doesn't, you get the "missing lifetime specifier" error and must annotate by hand.

The three rules, applied in order:

1. **Each input reference gets its own lifetime parameter.** `fn f(x: &str, y: &str)` is treated as `fn f<'a, 'b>(x: &'a str, y: &'b str)`.
2. **If there is exactly one input lifetime, it is assigned to all output references.** That's why `first_word(s: &str) -> &str` works: one input, so the output obviously borrows from it.
3. **If one of the inputs is `&self` or `&mut self` (a method), the lifetime of `self` is assigned to all outputs.** This is why methods returning references almost never need annotations, the compiler assumes the output borrows from `self`.

Run the rules on `longest(x: &str, y: &str) -> &str`: rule 1 gives `'a` and `'b`; rule 2 doesn't apply (two inputs); rule 3 doesn't apply (no `self`). The output lifetime is still unknown, elision fails, and you must annotate. That's not the compiler being lazy; with two candidate sources it genuinely cannot guess your intent.

Elision is purely syntactic sugar. The lifetimes are still there, still checked, still enforced. You're just spared the typing in the common cases.

::: tip Key Insight
Elision fails exactly when the output's source is ambiguous: multiple input references and no `&self`. If you can point at the one input the output borrows from, so can the compiler, and you can omit the annotations.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Rule 2 in action, one input, elided everywhere:

```rust
// What you write:
fn trim_prefix(s: &str) -> &str {
    s.trim_start_matches("- ")
}

// What the compiler sees:
fn trim_prefix_explicit<'a>(s: &'a str) -> &'a str {
    s.trim_start_matches("- ")
}

fn main() {
    let line = String::from("- buy milk");
    println!("elided:   {}", trim_prefix(&line));
    println!("explicit: {}", trim_prefix_explicit(&line));
}
```

### Example 2: Practical Application

Rule 3, methods borrow from `self`, so even multi-argument methods elide cleanly:

```rust
struct Logger {
    prefix: String,
}

impl Logger {
    // Two references (&self and msg), but rule 3 assigns
    // self's lifetime to the output. No annotations needed.
    fn prefix_for(&self, msg: &str) -> &str {
        if msg.is_empty() { "(empty)" } else { &self.prefix }
    }
}

fn main() {
    let logger = Logger { prefix: String::from("[app]") };
    println!("{} starting up", logger.prefix_for("boot"));
    println!("{}", logger.prefix_for(""));
}
```

Note the subtlety: rule 3 means the compiler assumes the output borrows from `self`, returning `msg` here would *not* compile without explicit lifetimes.

::: details Output
```
elided:   buy milk
explicit: buy milk
```
Example 2:
```
[app] starting up
(empty)
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Rule 1: every input reference gets its own fresh lifetime parameter  
✅ Rule 2: exactly one input lifetime → it's assigned to all outputs (covers most free functions)  
✅ Rule 3: `&self`/`&mut self` present → self's lifetime is assigned to all outputs (covers most methods)  
✅ If the rules leave any output lifetime undetermined, you get `E0106` and must annotate manually, elision is sugar, not a different checking model

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Assuming a method can return a reference to a *non-self* argument without annotations, rule 3 ties outputs to `self`, so you'll get a lifetime mismatch and need explicit `'a`
- Reading `E0106: missing lifetime specifier` as a bug in your logic, it usually just means the signature has two-plus input references and needs an explicit annotation
- Thinking elided and explicit signatures behave differently, they're identical; you can always write the elided form out longhand to debug an error
:::

## ✅ Quick Challenge

For each signature, decide: does elision succeed, and if so what does the compiler write? Then verify your answer for (c) by making it compile with explicit lifetimes.

```rust
// (a) fn f(s: &str) -> &str
// (b) fn f(x: &str, y: &str) -> &str
// (c) shown below, currently a compile error if you delete the lifetimes:
fn pick<'a>(primary: &'a str, fallback: &'a str) -> &'a str {
    if primary.is_empty() { fallback } else { primary }
}

fn main() {
    println!("{}", pick("", "default"));
    println!("{}", pick("value", "default"));
}
```

<details>
<summary>💡 Hint</summary>

(a): one input, rule 2 applies. (b): two inputs, no self, rules exhausted, elision fails. (c) is exactly case (b), fixed with a shared `'a`.

</details>

<details>
<summary>✅ Solution</summary>

- (a) Elision succeeds: `fn f<'a>(s: &'a str) -> &'a str` (rule 2).
- (b) Elision fails: two input lifetimes, no `self`, output ambiguous → `E0106`.
- (c) Fixed form, since the output may come from either input, both must share `'a`:

```rust
fn pick<'a>(primary: &'a str, fallback: &'a str) -> &'a str {
    if primary.is_empty() { fallback } else { primary }
}

fn main() {
    println!("{}", pick("", "default"));
    println!("{}", pick("value", "default"));
}
```

Output:
```
default
value
```

</details>

## 📖 Additional Resources

- [The Rust Book - Lifetime Elision](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html#lifetime-elision)
- [Rust Reference - Lifetime Elision](https://doc.rust-lang.org/reference/lifetime-elision.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-72">← Day 72: Lifetime Syntax</a>
  <a href="/week-11/day-74">Day 74: Struct Lifetimes →</a>
</div>
