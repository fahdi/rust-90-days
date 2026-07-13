---
title: "Day 81 - Weak T  References"
description: "Learn about weak t  references in Rust"
---

# Day 81: Weak&lt;T&gt; References

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Learn `Weak<T>`: a non-owning reference into `Rc`/`Arc` data that lets you build parent-child structures without reference cycles.

## 📚 The Concept (3 min)

`Rc<T>` frees its data when the strong count reaches zero. That works beautifully, until you make a cycle. Picture a tree: a parent holds `Rc`s to its children, and each child holds an `Rc` back to its parent. Now the parent keeps the child alive and the child keeps the parent alive; when your last outside handle drops, both counts are still 1 and the memory is never freed. Rust's compile-time guarantees don't cover this: leaking via `Rc` cycles is safe code, just wasteful.

`Weak<T>` breaks the cycle. Calling `Rc::downgrade(&rc)` produces a `Weak<T>` that points at the same allocation but does not count toward the strong count. A weak reference expresses "I'd like to see this value if it still exists, but I don't keep it alive." The allocation tracks a separate weak count purely so the bookkeeping metadata sticks around.

Because the target may already be gone, you can't dereference a `Weak` directly. You call `.upgrade()`, which returns `Option<Rc<T>>`: `Some(rc)` (temporarily bumping the strong count) if the value is alive, `None` if it has been dropped. This forced check is the whole safety story, no dangling pointers, ever.

Design rule: ownership flows one direction, back-pointers are weak. Parents strongly own children; children weakly point at parents. Caches, observer lists, and graph back-edges follow the same recipe. `Arc` has an identical `Weak` in `std::sync` for threaded code.

::: tip Key Insight
Strong references (`Rc`) express ownership; weak references (`Weak`) express acquaintance. If two objects must know about each other, exactly one direction should be strong, the other is `Weak` and pays for it with an `upgrade()` check.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::rc::Rc;

fn main() {
    let strong = Rc::new(String::from("hello"));
    let weak = Rc::downgrade(&strong);

    println!("strong = {}, weak = {}", Rc::strong_count(&strong), Rc::weak_count(&strong));

    // Upgrading works while the value is alive
    match weak.upgrade() {
        Some(v) => println!("upgrade ok: {}", v),
        None => println!("value is gone"),
    }

    drop(strong); // last strong reference dies -> value dropped

    match weak.upgrade() {
        Some(v) => println!("upgrade ok: {}", v),
        None => println!("value is gone"),
    }
}
```

### Example 2: Practical Application

A tree node with a weak back-pointer to its parent, no cycle, no leak:

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Node {
    name: String,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let root = Rc::new(Node {
        name: "root".to_string(),
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(Vec::new()),
    });

    let leaf = Rc::new(Node {
        name: "leaf".to_string(),
        parent: RefCell::new(Rc::downgrade(&root)),
        children: RefCell::new(Vec::new()),
    });

    root.children.borrow_mut().push(Rc::clone(&leaf));

    let parent_name = leaf
        .parent
        .borrow()
        .upgrade()
        .map(|p| p.name.clone())
        .unwrap_or_else(|| "<none>".to_string());

    println!("leaf's parent: {}", parent_name);
    println!("root strong = {}, weak = {}", Rc::strong_count(&root), Rc::weak_count(&root));
    println!("leaf strong = {}, weak = {}", Rc::strong_count(&leaf), Rc::weak_count(&leaf));
}
```

::: details Output
Example 1:
```
strong = 1, weak = 1
upgrade ok: hello
value is gone
```

Example 2:
```
leaf's parent: root
root strong = 1, weak = 1
leaf strong = 2, weak = 0
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Weak<T>` points at `Rc`/`Arc` data without keeping it alive, it doesn't affect the strong count  
✅ Access is only via `.upgrade() -> Option<Rc<T>>`, forcing you to handle "already dropped"  
✅ Standard tree shape: parent → child is `Rc` (owns), child → parent is `Weak` (back-pointer)  
✅ `Weak::new()` creates a detached weak reference that always upgrades to `None`, handy as a default

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Making both directions strong (`Rc` both ways), compiles fine, leaks silently
- Calling `.upgrade().unwrap()` on the assumption the target still exists, that's just a delayed panic; match on the `Option`
- Forgetting that a successful `upgrade()` returns a new `Rc` that bumps the strong count while you hold it, don't stash it long-term if you meant the link to stay weak
:::

## ✅ Quick Challenge

Create an `Rc<i32>`, downgrade it to a `Weak`, and write a function `describe(weak: &Weak<i32>) -> String` returning either `"alive: N"` or `"dead"`. Call it before and after dropping the strong reference.

```rust
use std::rc::{Rc, Weak};

fn describe(weak: &Weak<i32>) -> String {
    // Your code here
    String::new()
}

fn main() {
    let strong = Rc::new(42);
    let weak = Rc::downgrade(&strong);
    println!("{}", describe(&weak));
    drop(strong);
    println!("{}", describe(&weak));
}
```

<details>
<summary>💡 Hint</summary>

`match weak.upgrade()`, the `Some(rc)` arm formats `"alive: {}"` with `*rc`, the `None` arm returns `"dead"`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::rc::{Rc, Weak};

fn describe(weak: &Weak<i32>) -> String {
    match weak.upgrade() {
        Some(rc) => format!("alive: {}", *rc),
        None => "dead".to_string(),
    }
}

fn main() {
    let strong = Rc::new(42);
    let weak = Rc::downgrade(&strong);
    println!("{}", describe(&weak)); // alive: 42
    drop(strong);
    println!("{}", describe(&weak)); // dead
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Preventing Reference Cycles with Weak](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html)
- [std::rc::Weak docs](https://doc.rust-lang.org/std/rc/struct.Weak.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-80">← Day 80: Arc&lt;T&gt; for Threading</a>
  <a href="/week-12/day-82">Day 82: Memory Leaks Prevention →</a>
</div>
