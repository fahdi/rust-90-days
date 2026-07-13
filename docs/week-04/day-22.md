---
title: "Day 22 - Borrowing Rules"
description: "Learn about borrowing rules in Rust"
---

# Day 22: Borrowing Rules

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Understand Rust's two borrowing rules and use shared (`&`) and mutable (`&mut`) references correctly in functions without triggering compiler errors.

## 📚 The Concept (3 min)

Last week you learned that ownership means every value has exactly one owner. But constantly moving values around (or cloning them) would be exhausting. *Borrowing* lets you lend access to a value without giving up ownership, like lending a book to a friend: they can read it, but the book is still yours and comes back.

Rust enforces exactly two rules about references:

1. **At any given time, you can have EITHER any number of shared references (`&T`) OR exactly one mutable reference (`&mut T`)**, never both at once.
2. **References must always be valid**, they can never outlive the value they point to (more on this on Day 26).

Why so strict? Think of a shared spreadsheet. If ten people are *reading* it, everything is fine. But if one person starts *editing* while others read, readers see half-finished garbage. Rust's rule is the compiler-enforced version of "readers and writers can't overlap": many readers, or one writer, never both. This single rule eliminates data races and a whole class of "value changed under my feet" bugs, at compile time, with zero runtime cost.

The good news: since Rust 2018, borrows end at their *last use*, not at the end of the scope (this is called non-lexical lifetimes). So you can read with shared references, finish, and then take a mutable reference in the same block without any ceremony.

::: tip Key Insight
Many readers OR one writer, never both. If you can explain your code's borrows in those terms, the borrow checker will agree with you.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let city = String::from("Lahore");

    // Rule 1: any number of shared (read-only) references at once
    let r1 = &city;
    let r2 = &city;
    println!("{} and {} both read fine", r1, r2);

    // Rule 2: exactly ONE mutable reference at a time
    let mut score = 10;
    let m = &mut score;
    *m += 5;
    println!("score after mutable borrow: {}", score);
}
```

### Example 2: Practical Application

```rust
fn add_task(list: &mut Vec<String>, task: &str) {
    list.push(task.to_string());
}

fn report(list: &Vec<String>) -> String {
    format!("{} task(s), next up: {}", list.len(), list[0])
}

fn main() {
    let mut todo = Vec::new();
    add_task(&mut todo, "Review borrowing rules");
    add_task(&mut todo, "Practice slices");

    println!("{}", report(&todo));

    add_task(&mut todo, "Build text analyzer");
    println!("{}", report(&todo));
}
```

::: details Output
```
Lahore and Lahore both read fine
score after mutable borrow: 15
2 task(s), next up: Review borrowing rules
3 task(s), next up: Review borrowing rules
```
:::

Notice how `main` keeps ownership of `todo` the whole time, the functions only borrow it, mutably to write and immutably to read.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `&value` creates a shared borrow (read-only); `&mut value` creates a mutable borrow (read-write)  
✅ You can have many shared references OR one mutable reference, never both at the same time  
✅ Borrows end at their last use, so sequential read-then-write code compiles fine  
✅ Functions that borrow (`&T` / `&mut T`) let the caller keep ownership, no moves, no clones

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Holding a shared reference while mutating.** `let r = &v; v.push(1); println!("{}", r);` fails with E0502 because `r` is still in use when `push` needs exclusive access. Finish reading before you mutate.
- **Forgetting `mut` in two places.** To take `&mut x`, the variable itself must be declared `let mut x` AND you must write `&mut` at the call site. Missing either one is a compile error.
- **Taking two mutable references "just to be safe."** `let a = &mut v; let b = &mut v;` fails with E0499 if both are used. One writer at a time, restructure so each mutable borrow ends before the next begins.
:::

## ✅ Quick Challenge

Write two functions for the inventory below: `count_items` should take a shared borrow and return how many items there are; `add_item` should take a mutable borrow and push a new item. Then use both from `main`.

```rust
fn main() {
    let mut inventory = vec![String::from("sword"), String::from("shield")];

    // TODO: write `count_items` that borrows inventory immutably
    // TODO: write `add_item` that borrows inventory mutably and pushes "potion"

    println!("{:?}", inventory);
}
```

<details>
<summary>💡 Hint</summary>

`count_items` needs the signature `fn count_items(items: &Vec<String>) -> usize`, while `add_item` needs `&mut Vec<String>`. At the call site, pass `&inventory` and `&mut inventory` respectively.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn count_items(items: &Vec<String>) -> usize {
    items.len()
}

fn add_item(items: &mut Vec<String>, item: &str) {
    items.push(item.to_string());
}

fn main() {
    let mut inventory = vec![String::from("sword"), String::from("shield")];

    add_item(&mut inventory, "potion");
    println!("{} items: {:?}", count_items(&inventory), inventory);
}
```

Output: `3 items: ["sword", "shield", "potion"]`

</details>

## 📖 Additional Resources

- [The Rust Book - References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
- [Rust by Example - Borrowing](https://doc.rust-lang.org/rust-by-example/scope/borrow.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/">← Week 4 Overview</a>
  <a href="/week-04/day-23">Day 23: Slices →</a>
</div>
