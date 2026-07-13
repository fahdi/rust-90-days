---
title: "Day 79 - Rc RefCell T   Pattern"
description: "Learn about rc refcell t   pattern in Rust"
---

# Day 79: Rc&lt;RefCell&lt;T&gt;&gt; Pattern

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Combine `Rc<T>` and `RefCell<T>` into the `Rc<RefCell<T>>` pattern: shared ownership of data that multiple owners can all mutate.

## 📚 The Concept (3 min)

You've met the two halves separately. `Rc<T>` gives multiple owners of the same heap value, but only immutable access, `Rc` hands out shared references, and shared means read-only. `RefCell<T>` gives mutation through a shared reference, but doesn't help with ownership. Real programs often need both at once.

Consider a text editor where three UI panels all display the same document, and any panel can edit it. Who owns the document? Nobody exclusively, so `Rc` for shared ownership. Who can mutate it? Everybody, so `RefCell` for interior mutability. Stack them: `Rc<RefCell<Document>>`. Each panel holds an `Rc` clone (cheap, it only bumps a reference count), and any of them can call `.borrow_mut()` to edit.

The layering order matters. `Rc<RefCell<T>>` means "many owners of one mutable cell". The reverse, `RefCell<Rc<T>>`, would mean "one mutable slot that can be repointed at different `Rc`s", a different, much rarer thing.

The costs carry over from both parts: reference counting overhead from `Rc`, runtime borrow tracking from `RefCell`, and the whole construct is single-threaded. The thread-safe sibling is `Arc<Mutex<T>>`, which you'll meet tomorrow. Also note that shared mutable data reintroduces a hazard Rust normally prevents at compile time: two parts of your code holding borrows at the same instant now panics at runtime instead. Keep borrow scopes short.

::: tip Key Insight
`Rc` answers "who owns it?" (everyone), `RefCell` answers "who can mutate it?" (anyone, one at a time, checked at runtime). Stacked together they emulate shared mutable state in a single thread.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

    let a = Rc::clone(&shared);
    let b = Rc::clone(&shared);

    a.borrow_mut().push(4);
    b.borrow_mut().push(5);

    println!("data = {:?}", shared.borrow());
    println!("owners = {}", Rc::strong_count(&shared));
}
```

### Example 2: Practical Application

A shared bank account that two holders (e.g., partners on a joint account) can both deposit into:

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Account {
    balance: i64,
}

struct Holder {
    name: String,
    account: Rc<RefCell<Account>>,
}

impl Holder {
    fn deposit(&self, amount: i64) {
        self.account.borrow_mut().balance += amount;
        println!("{} deposited {}", self.name, amount);
    }
}

fn main() {
    let account = Rc::new(RefCell::new(Account { balance: 0 }));

    let alice = Holder { name: "Alice".to_string(), account: Rc::clone(&account) };
    let bob = Holder { name: "Bob".to_string(), account: Rc::clone(&account) };

    alice.deposit(100);
    bob.deposit(250);

    println!("final balance = {}", account.borrow().balance);
}
```

::: details Output
Example 1:
```
data = [1, 2, 3, 4, 5]
owners = 3
```

Example 2:
```
Alice deposited 100
Bob deposited 250
final balance = 350
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Rc<RefCell<T>>` = multiple owners + runtime-checked mutation; the standard single-threaded shared-mutable pattern  
✅ `Rc::clone` copies the pointer and bumps a counter, it never deep-copies the data  
✅ The nesting order is meaningful: `Rc<RefCell<T>>`, not `RefCell<Rc<T>>`  
✅ For multithreaded code, swap in `Arc<Mutex<T>>`, `Rc` and `RefCell` are both `!Send`/`!Sync`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Writing `shared.clone()` on a large structure believing it deep-copies, on an `Rc` it doesn't, and on a plain struct it does; prefer explicit `Rc::clone(&shared)` for clarity
- Holding one holder's `borrow_mut()` guard while another path borrows the same cell, runtime panic
- Creating `Rc<RefCell<T>>` cycles (A points to B, B back to A), the reference counts never hit zero and memory leaks (Day 81/82 cover the fix: `Weak`)
:::

## ✅ Quick Challenge

Create a shared `Vec<String>` playlist owned by two "apps" (just two `Rc` clones). Have each add one song, then print the playlist and the strong count.

```rust
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let playlist: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));
    // 1. Make two clones: phone and laptop
    // 2. Push one song from each
    // 3. Print the playlist and Rc::strong_count
    println!("{:?}", playlist.borrow());
}
```

<details>
<summary>💡 Hint</summary>

`Rc::clone(&playlist)` makes another owner; `clone.borrow_mut().push("song".to_string())` mutates. `Rc::strong_count(&playlist)` reports the owner count.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let playlist: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));

    let phone = Rc::clone(&playlist);
    let laptop = Rc::clone(&playlist);

    phone.borrow_mut().push("Bohemian Rhapsody".to_string());
    laptop.borrow_mut().push("Stairway to Heaven".to_string());

    println!("playlist = {:?}", playlist.borrow());
    println!("owners = {}", Rc::strong_count(&playlist)); // 3
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Having Multiple Owners of Mutable Data](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html#allowing-multiple-owners-of-mutable-data-by-combining-rct-and-refcellt)
- [Rust by Example - Rc](https://doc.rust-lang.org/rust-by-example/std/rc.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-78">← Day 78: RefCell&lt;T&gt; & Interior Mutability</a>
  <a href="/week-12/day-80">Day 80: Arc&lt;T&gt; for Threading →</a>
</div>
