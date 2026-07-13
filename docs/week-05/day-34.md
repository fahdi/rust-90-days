---
title: "Day 34 - Option T "
description: "Learn about option t  in Rust"
---

# Day 34: Option&lt;T&gt;

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Use Option&lt;T&gt; to model values that may or may not exist, and safely extract them with `match`, `if let`, `unwrap_or`, and `map`, without ever risking a null-pointer-style crash.

## 📚 The Concept (3 min)

Most languages answer "what if there's no value?" with `null`, a special value that can hide inside any variable and blow up the moment you touch it. Tony Hoare, who invented null references, famously called them his "billion-dollar mistake." Rust simply doesn't have null. Instead, it has Option&lt;T&gt;, an enum from the standard library that you already have the tools to understand after yesterday's lesson on enums:

```rust
enum Option<T> {
    Some(T),  // a value of type T is present
    None,     // no value
}
```

Think of Option&lt;T&gt; as a labeled box. A `Some(42)` is a box with a sticker saying "contains an i32", but you still have to open the box to get the 42. A `None` is an empty box with the same sticker. Crucially, an `i32` and an Option&lt;i32&gt; are **different types**: the compiler will not let you add an Option&lt;i32&gt; to an `i32`, so you can never accidentally use a "maybe missing" value as if it definitely exists. Absence stops being a runtime surprise and becomes a compile-time conversation.

You've already met Option&lt;T&gt; without realizing it: `Vec::get` returns Option&lt;&amp;T&gt; instead of panicking on a bad index, `str::find` returns Option&lt;usize&gt;, and HashMap lookups return Option&lt;&amp;V&gt;. The standard library uses it everywhere a value might legitimately be missing.

Because `Some` and `None` are so common, Rust brings them into scope automatically, you write `Some(5)` and `None`, not `Option::Some(5)`.

::: tip Key Insight
Option&lt;T&gt; forces the "value might be missing" case into the type system. The compiler makes you handle `None` before you can touch the inner value, so an entire class of null-reference bugs cannot compile.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A function that searches for a character. It might find one (`Some(index)`) or it might not (`None`), the return type says so honestly:

```rust
fn find_char(s: &str, target: char) -> Option<usize> {
    for (i, c) in s.chars().enumerate() {
        if c == target {
            return Some(i);
        }
    }
    None
}

fn main() {
    let word = "rustacean";

    match find_char(word, 'c') {
        Some(index) => println!("'c' found at index {}", index),
        None => println!("'c' not found"),
    }

    match find_char(word, 'z') {
        Some(index) => println!("'z' found at index {}", index),
        None => println!("'z' not found"),
    }
}
```

### Example 2: Practical Application

An inventory lookup showing the three idioms you'll use daily: `if let` when you only care about the `Some` case, `unwrap_or` for defaults, and `map` to transform the inner value without unpacking it:

```rust
struct Inventory {
    items: Vec<(String, u32)>,
}

impl Inventory {
    fn stock_of(&self, name: &str) -> Option<u32> {
        self.items
            .iter()
            .find(|(item, _)| item == name)
            .map(|(_, qty)| *qty)
    }
}

fn main() {
    let inventory = Inventory {
        items: vec![
            (String::from("laptop"), 4),
            (String::from("mouse"), 25),
            (String::from("webcam"), 0),
        ],
    };

    // if let: run code only when a value exists
    if let Some(qty) = inventory.stock_of("mouse") {
        println!("Mice in stock: {}", qty);
    }

    // unwrap_or: fall back to a default for missing items
    let keyboards = inventory.stock_of("keyboard").unwrap_or(0);
    println!("Keyboards in stock: {}", keyboards);

    // map: transform the inner value without unwrapping
    let report = inventory
        .stock_of("laptop")
        .map(|qty| format!("{} laptop(s) available", qty))
        .unwrap_or_else(|| String::from("laptop: unknown item"));
    println!("{}", report);
}
```

::: details Output
```
'c' found at index 5
'z' not found
Mice in stock: 25
Keyboards in stock: 0
4 laptop(s) available
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Rust has no null, Option&lt;T&gt; (an enum with `Some(T)` and `None`) is how you say "this value might be missing"  
✅ Option&lt;T&gt; and T are different types, so the compiler forces you to handle the `None` case before using the inner value  
✅ Use `match` for exhaustive handling, `if let` when only the `Some` case matters, and `unwrap_or` / `unwrap_or_else` for defaults  
✅ `map` transforms the value inside a `Some` while passing `None` straight through, no manual unpacking needed

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Reaching for `.unwrap()` everywhere.** `unwrap()` panics on `None`, so it just recreates the null-pointer crash Option was designed to prevent. Fine in quick experiments; in real code prefer `match`, `if let`, or `unwrap_or`. If a `None` truly indicates a bug, use `.expect("stock list should contain laptop")` so the panic message explains itself.
- **Trying to use an Option&lt;T&gt; as a T.** Writing `Some(5) + 1` does NOT compile, the box and its contents are different types. You must extract the value first (`match`, `unwrap_or`, etc.). This error surprises newcomers, but it's exactly the safety check working.
- **Forgetting that `match` on an Option must be exhaustive.** A `match` that handles only `Some(x)` and omits `None` does NOT compile. Either add a `None` arm or switch to `if let Some(x) = ...` to say "I intentionally ignore the None case."
:::

## ✅ Quick Challenge

Write `first_even`, a function that returns the first even number in a slice as Option&lt;i32&gt;, `Some(n)` if one exists, `None` otherwise.

```rust
fn first_even(numbers: &[i32]) -> Option<i32> {
    // TODO: return Some(first even number) or None if there isn't one
    None
}

fn main() {
    let nums = [3, 7, 10, 15, 22];
    match first_even(&nums) {
        Some(n) => println!("First even number: {}", n),
        None => println!("No even numbers found"),
    }
}
```

<details>
<summary>💡 Hint</summary>

Loop over the slice with `for &n in numbers` and check `n % 2 == 0`. The moment you find a match, `return Some(n);`, and after the loop ends without finding one, return `None`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn first_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let nums = [3, 7, 10, 15, 22];
    match first_even(&nums) {
        Some(n) => println!("First even number: {}", n),
        None => println!("No even numbers found"),
    }

    let odds = [1, 3, 5];
    match first_even(&odds) {
        Some(n) => println!("First even number: {}", n),
        None => println!("No even numbers found"),
    }
}
```

Output:

```
First even number: 10
No even numbers found
```

</details>

## 📖 Additional Resources

- [The Rust Book - The Option Enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html#the-option-enum-and-its-advantages-over-null-values)
- [Rust by Example - Option](https://doc.rust-lang.org/rust-by-example/std/option.html)
- [std::option API docs](https://doc.rust-lang.org/std/option/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-33">← Day 33: Enums Basics</a>
  <a href="/week-05/day-35">Day 35: Result&lt;T, E&gt; →</a>
</div>
