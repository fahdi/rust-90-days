---
title: "Day 12 - Modules Basics"
description: "Learn about modules basics in Rust"
---

# Day 12: Modules Basics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Organize code into modules with `mod`, control visibility with `pub`, and shorten paths with `use`, so your programs stop being one giant pile of functions in `main.rs`.

## 📚 The Concept (3 min)

So far, every program you've written has lived in one flat namespace: all functions side by side in a single file. That works for a temperature converter, but real projects have dozens of types and hundreds of functions. Rust's answer is **modules**.

Think of a module as a labeled drawer in a filing cabinet. The `mod` keyword creates the drawer, and everything inside it is grouped under that drawer's name. To reach an item, you write the path through the drawers: `drawer::item`, or for nested drawers, `drawer::inner_drawer::item`. The `::` is Rust's path separator, exactly like `/` in a file path.

Here's where Rust differs from most languages: **everything in a module is private by default**. A function, struct, or nested module inside `mod foo` is invisible to the outside world unless you mark it `pub`. This is the opposite of Python or JavaScript, where everything is reachable unless you hide it. Rust makes you opt in to exposing things, which forces you to think about your module's public API: what callers *should* use, versus internal helpers they shouldn't depend on.

Privacy applies to struct fields too, and independently of the struct itself. A `pub struct` can still have private fields, meaning outside code can hold the struct but can only touch it through the `pub` methods you provide. That's genuine encapsulation, enforced by the compiler.

Finally, `use` creates a shortcut. Writing `bank::Account::new()` everywhere gets tedious; `use bank::Account;` lets you write `Account::new()` instead. Important distinction: `mod` *defines* where code lives, `use` merely *shortens the path* to it.

::: tip Key Insight
In Rust, everything inside a module is **private by default**. You must explicitly mark items `pub` to expose them, the compiler enforces your module's public API boundary.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
mod greetings {
    pub fn hello() {
        println!("Hello from the greetings module!");
    }

    pub mod formal {
        pub fn good_morning() {
            println!("Good morning, esteemed colleague.");
        }
    }
}

fn main() {
    // Path: module_name::function_name
    greetings::hello();

    // Nested modules chain with ::
    greetings::formal::good_morning();
}
```

Note that `formal` needed `pub` too, a public function inside a private module is still unreachable, because you can't walk through a locked drawer.

### Example 2: Practical Application

```rust
mod bank {
    pub struct Account {
        owner: String,
        balance: f64, // private: only code inside `bank` can touch this
    }

    impl Account {
        pub fn new(owner: &str) -> Account {
            Account {
                owner: owner.to_string(),
                balance: 0.0,
            }
        }

        pub fn deposit(&mut self, amount: f64) {
            if amount > 0.0 {
                self.balance += amount;
            }
        }

        pub fn summary(&self) -> String {
            format!("{} has ${:.2}", self.owner, self.balance)
        }
    }
}

use bank::Account; // shortcut so we can write `Account` instead of `bank::Account`

fn main() {
    let mut account = Account::new("Amina");
    account.deposit(250.0);
    account.deposit(74.50);

    println!("{}", account.summary());
    // account.balance = 1_000_000.0; // ERROR: `balance` is private
}
```

The struct is `pub`, but its fields are not. `main` can create and use an `Account`, yet it *cannot* set `balance` directly, the only way in is through `deposit`, which validates the amount. Uncomment the last line and the compiler refuses with "field `balance` of struct `Account` is private."

::: details Output
```
Hello from the greetings module!
Good morning, esteemed colleague.
```

Example 2:

```
Amina has $324.50
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `mod name { ... }` groups related code; access items with `name::item` and nest paths with `::`  
✅ Everything in a module is private by default, add `pub` to functions, structs, and nested modules you want callers to reach  
✅ `pub struct` with private fields gives compiler-enforced encapsulation: outsiders must go through your `pub` methods  
✅ `mod` defines where code lives; `use` only creates a shorter path to it

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting `pub` on the path's middle links.** Marking a function `pub` isn't enough if it sits inside a private nested module, every module along the path must be `pub` too. The error "module `formal` is private" means the drawer, not the item, is locked.
- **Expecting `use` to define a module.** Writing `use bank::Account;` without a `mod bank` anywhere fails with "unresolved import." `use` never brings code into existence; it only shortens the path to code that `mod` (or a dependency) already declared.
- **Making a struct `pub` and assuming its fields are too.** `pub struct Account` with a plain `balance: f64` field means outside code can hold an `Account` but writing `account.balance = 5.0;` does NOT compile, field visibility is separate, and each field needs its own `pub` if you truly want it exposed.
:::

## ✅ Quick Challenge

Refactor yesterday's temperature converter into a module. Create a module `converter` with two public functions, `to_celsius` and `to_fahrenheit`, then call them from `main` using module paths.

```rust
// Starter code
// TODO: Create a module `converter` with two public functions:
//   to_celsius(f: f64) -> f64      => (f - 32.0) * 5.0 / 9.0
//   to_fahrenheit(c: f64) -> f64   => c * 9.0 / 5.0 + 32.0

fn main() {
    // Uncomment once your module works:
    // println!("212F = {}C", converter::to_celsius(212.0));
    // println!("100C = {}F", converter::to_fahrenheit(100.0));
}
```

<details>
<summary>💡 Hint</summary>

Wrap both functions in `mod converter { ... }` and put `pub` in front of each `fn`. In `main`, call them with the full path `converter::to_celsius(...)`, no `use` statement is required when you write the full path.

</details>

<details>
<summary>✅ Solution</summary>

```rust
mod converter {
    pub fn to_celsius(f: f64) -> f64 {
        (f - 32.0) * 5.0 / 9.0
    }

    pub fn to_fahrenheit(c: f64) -> f64 {
        c * 9.0 / 5.0 + 32.0
    }
}

fn main() {
    println!("212F = {}C", converter::to_celsius(212.0));
    println!("100C = {}F", converter::to_fahrenheit(100.0));
}
```

Output:

```
212F = 100C
100C = 212F
```

</details>

## 📖 Additional Resources

- [The Rust Book - Managing Growing Projects with Packages, Crates, and Modules](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [Rust by Example - Modules](https://doc.rust-lang.org/rust-by-example/mod.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-11">← Day 11: Project: Temperature Converter</a>
  <a href="/week-02/day-13">Day 13: Cargo Fundamentals →</a>
</div>
