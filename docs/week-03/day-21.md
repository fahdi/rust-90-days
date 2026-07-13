---
title: "Day 21 - Mutable References"
description: "Learn about mutable references in Rust"
---

# Day 21: Mutable References

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

By the end of this lesson you'll be able to modify data through a `&mut` reference — letting functions change values they don't own — and explain why Rust allows only one mutable reference to a value at a time.

## 📚 The Concept (3 min)

Yesterday you learned that a reference (`&T`) lets you *look at* a value without taking ownership. But looking isn't always enough — sometimes a function needs to *change* the caller's data. That's what a **mutable reference** (`&mut T`) is for.

Think of it like lending out a notebook. A shared reference (`&`) is a photocopy pass: any number of people can read it at the same time, but nobody may write in it. A mutable reference (`&mut`) is handing over the actual notebook with a pen: the borrower can edit it — but only **one person** can hold it at a time. If two people could scribble in the notebook simultaneously (or one person edits while others read stale photocopies), chaos follows. Rust enforces this rule at compile time.

Creating a mutable reference has two requirements:

1. The original variable must be declared `let mut` — you can't lend write access you don't have.
2. You borrow with `&mut value`, and the receiving side declares the type as `&mut T`.

To read or write the value *behind* the reference, you use the dereference operator `*`. So `*value += 100` means "add 100 to the thing this reference points to." (Method calls like `v.push(...)` dereference automatically, which is why you don't see `*` everywhere.)

The famous restriction: while a mutable reference is alive, you can have **no other references** to that value — not even shared ones. This is the rule that eliminates data races and iterator invalidation bugs at compile time instead of at 3 AM in production.

::: tip Key Insight
`&mut T` gives temporary, *exclusive* write access: at any moment a value can have either one mutable reference OR any number of shared references — never both.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let mut score = 10;
    println!("Before: {}", score);

    let score_ref = &mut score;
    *score_ref += 5;

    println!("After: {}", score);

    // Passing a mutable reference to a function
    add_bonus(&mut score);
    println!("With bonus: {}", score);
}

fn add_bonus(value: &mut i32) {
    *value += 100;
}
```

### Example 2: Practical Application

```rust
fn main() {
    let mut inventory: Vec<String> = vec![
        String::from("sword"),
        String::from("shield"),
    ];

    add_item(&mut inventory, "potion");
    add_item(&mut inventory, "map");
    rename_first(&mut inventory, "iron sword");

    println!("Inventory ({} items):", inventory.len());
    for item in &inventory {
        println!("- {}", item);
    }
}

fn add_item(items: &mut Vec<String>, name: &str) {
    items.push(String::from(name));
}

fn rename_first(items: &mut Vec<String>, new_name: &str) {
    if let Some(first) = items.first_mut() {
        *first = String::from(new_name);
    }
}
```

::: details Output
```
Before: 10
After: 15
With bonus: 115
Inventory (4 items):
- iron sword
- shield
- potion
- map
```
:::

Notice that `main` keeps ownership of `inventory` the whole time — the helper functions borrow it, mutate it, and hand it back automatically when they return.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `&mut T` lets a function modify a value it doesn't own — no ownership transfer, no returning the value back  
✅ The original binding must be `let mut` before you can create a `&mut` borrow of it  
✅ Use `*reference` to read or assign the value behind the reference (e.g. `*value += 100`)  
✅ Exclusivity rule: one `&mut` reference OR many `&` references — never both at once

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Borrowing `&mut` from a non-`mut` variable.** `let x = 5; let r = &mut x;` — this does NOT compile ("cannot borrow `x` as mutable"). Mutability starts at the binding: declare `let mut x` first.
- **Two mutable borrows alive at once.** `let a = &mut s; let b = &mut s; a.push('!');` — this does NOT compile. The compiler rejects the second borrow because `a` is still used afterward. Finish with one borrow before starting the next.
- **Mutating a collection while iterating over it.** Calling `items.push(...)` inside `for item in &items { ... }` does NOT compile: the loop holds a shared borrow, and `push` needs a mutable one. Collect changes first, then apply them after the loop.
:::

## ✅ Quick Challenge

Build a tiny thermostat. Complete `increase` (add `amount` to the temperature behind the reference) and `reset` (set it back to `68.0`), then call them from `main` so the output shows the temperature warming to 77°F and then resetting.

```rust
// Starter code
fn main() {
    let mut temperature = 72.0;
    println!("Current: {}°F", temperature);

    // TODO: call increase(&mut temperature, 5.0)
    // TODO: call reset(&mut temperature)

    println!("Final: {}°F", temperature);
}

fn increase(temp: &mut f64, amount: f64) {
    // TODO: add `amount` to the value behind `temp`
    let _ = (temp, amount);
}

fn reset(temp: &mut f64) {
    // TODO: set the value behind `temp` back to 68.0
    let _ = temp;
}
```

<details>
<summary>💡 Hint</summary>

Inside the functions, use the dereference operator: `*temp += amount` modifies the value the reference points to, and `*temp = 68.0` replaces it. In `main`, pass the variable with `&mut temperature`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let mut temperature = 72.0;
    println!("Current: {}°F", temperature);

    increase(&mut temperature, 5.0);
    println!("Warmed up: {}°F", temperature);

    reset(&mut temperature);
    println!("Final: {}°F", temperature);
}

fn increase(temp: &mut f64, amount: f64) {
    *temp += amount;
}

fn reset(temp: &mut f64) {
    *temp = 68.0;
}
```

Output:

```
Current: 72°F
Warmed up: 77°F
Final: 68°F
```

</details>

## 📖 Additional Resources

- [The Rust Book - References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
- [Rust by Example - Mutability (Borrowing)](https://doc.rust-lang.org/rust-by-example/scope/borrow/mut.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-20">← Day 20: References & Borrowing</a>
  <a href="/week-04/">Week 4 Overview →</a>
</div>
