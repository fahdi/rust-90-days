---
title: "Day 30 - Struct Methods"
description: "Learn about struct methods in Rust"
---

# Day 30: Struct Methods

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Attach behavior to the structs you defined yesterday by writing methods in an `impl` block, and choose correctly between `&self`, `&mut self`, and `self` receivers.

## 📚 The Concept (3 min)

Yesterday's structs held data but couldn't *do* anything — every operation lived in a free function like `describe(&book)`. **Methods** move that behavior onto the type itself, so callers write `book.describe()` and all the logic for a type lives in one place.

Methods go inside an `impl` block (short for *implementation*): `impl Rectangle { ... }`. A method looks like a normal function except its first parameter is a *receiver* — some form of `self`, which is the instance the method was called on. The receiver you pick is a promise about what the method does:

- `&self` — "I only read the data." This is by far the most common. Borrowing rules from Week 3 apply: many readers can coexist.
- `&mut self` — "I modify the data." The instance must be stored in a `mut` binding, and no other borrows can be active.
- `self` — "I consume the instance." The value is moved into the method and the caller can't use it afterwards. Rare, but useful for conversions and builder patterns.

The analogy: a struct is a machine's parts list; the `impl` block is its control panel. `temperature()` is a read-only gauge (`&self`), `set_target()` is a dial that changes state (`&mut self`), and `into_scrap_metal()` destroys the machine to produce something else (`self`).

Method calls use dot syntax, and Rust automatically references or dereferences for you — `rect.area()` works whether `rect` is a value, a `&Rectangle`, or a `&mut Rectangle`. That's why Rust has no need for an arrow operator like C's `->`. Methods can also take extra parameters after `self`, including references to other instances of the same struct, as you'll see with `can_hold`.

::: tip Key Insight
The receiver type is documentation the compiler enforces: `&self` methods can never mutate, `&mut self` methods require exclusive access, and `self` methods consume the value. Read a method signature and you already know its side effects.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };

    println!("Area: {} square pixels", rect.area());
    println!("Is square? {}", rect.is_square());
}
```

::: details Output
```
Area: 1500 square pixels
Is square? false
```
:::

### Example 2: Practical Application

```rust
struct BankAccount {
    owner: String,
    balance: f64,
}

impl BankAccount {
    // &mut self: this method modifies the struct
    fn deposit(&mut self, amount: f64) {
        self.balance += amount;
        println!("Deposited ${:.2}", amount);
    }

    fn withdraw(&mut self, amount: f64) -> bool {
        if amount <= self.balance {
            self.balance -= amount;
            println!("Withdrew ${:.2}", amount);
            true
        } else {
            println!("Insufficient funds for ${:.2}", amount);
            false
        }
    }

    // &self: read-only access is enough here
    fn summary(&self) -> String {
        format!("{}'s balance: ${:.2}", self.owner, self.balance)
    }
}

fn main() {
    let mut account = BankAccount {
        owner: String::from("Amina"),
        balance: 100.0,
    };

    account.deposit(50.0);
    account.withdraw(30.0);
    account.withdraw(500.0);
    println!("{}", account.summary());
}
```

::: details Output
```
Deposited $50.00
Withdrew $30.00
Insufficient funds for $500.00
Amina's balance: $120.00
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Methods live in `impl StructName { ... }` blocks and are called with dot syntax: `rect.area()`  
✅ Choose the receiver deliberately: `&self` to read, `&mut self` to modify, `self` to consume  
✅ Calling a `&mut self` method requires the instance to be in a `let mut` binding  
✅ Rust auto-references on method calls, so `rect.area()` works for values and references alike — no `->` operator needed

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Calling a `&mut self` method on an immutable binding.** `let account = ...; account.deposit(50.0);` fails with "cannot borrow `account` as mutable". The fix is at the binding: `let mut account`.
- **Forgetting `self.` inside a method.** Writing `width * height` instead of `self.width * self.height` fails with "cannot find value `width` in this scope" — fields are not in scope as bare names.
- **Consuming when you meant to borrow.** If you declare `fn summary(self)` instead of `fn summary(&self)`, the first call moves the struct and a second use fails with "borrow of moved value". This does NOT compile: `account.summary(); account.summary();` when `summary` takes `self` by value.
:::

## ✅ Quick Challenge

Extend the `Rectangle` below with two methods: `scale(&mut self, factor: u32)` multiplies both dimensions by `factor`, and `can_hold(&self, other: &Rectangle) -> bool` returns whether `self` fully contains `other`. Then scale a rectangle by 3 and test `can_hold` against a smaller one.

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // TODO: add `scale(&mut self, factor: u32)`
    // TODO: add `can_hold(&self, other: &Rectangle) -> bool`
}

fn main() {
    let rect = Rectangle { width: 10, height: 20 };
    println!("Area: {}", rect.area());
}
```

<details>
<summary>💡 Hint</summary>

`scale` changes the struct, so it needs `&mut self` — and `rect` in `main` must become `let mut rect`. For `can_hold`, compare both dimensions: `self.width > other.width && self.height > other.height`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn scale(&mut self, factor: u32) {
        self.width *= factor;
        self.height *= factor;
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let mut rect = Rectangle { width: 10, height: 20 };
    let small = Rectangle { width: 5, height: 8 };

    println!("Area before: {}", rect.area());
    rect.scale(3);
    println!("Area after scaling by 3: {}", rect.area());
    println!("Can hold small rect? {}", rect.can_hold(&small));
}
```

Output:

```
Area before: 200
Area after scaling by 3: 1800
Can hold small rect? true
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 5.3: Method Syntax](https://doc.rust-lang.org/book/ch05-03-method-syntax.html)
- [Rust by Example - Methods](https://doc.rust-lang.org/rust-by-example/fn/methods.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-29">← Day 29: Defining Structs</a>
  <a href="/week-05/day-31">Day 31: Associated Functions →</a>
</div>
