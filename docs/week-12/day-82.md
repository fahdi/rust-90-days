---
title: "Day 82 - Memory Leaks Prevention"
description: "Learn about memory leaks prevention in Rust"
---

# Day 82: Memory Leaks Prevention

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Understand how memory leaks happen in safe Rust, reference cycles, `mem::forget`, unbounded growth, and the concrete techniques to detect and prevent them.

## 📚 The Concept (3 min)

"Rust can't leak memory" is a myth worth killing today. Rust guarantees memory *safety* (no use-after-free, no data races), but leaking is explicitly considered safe: `std::mem::forget` and `Box::leak` are safe functions, and `Rc` cycles leak without a single `unsafe` block. The difference matters, a leak wastes memory but never corrupts it.

The most common accidental leak is yesterday's villain: an `Rc<RefCell<T>>` cycle. Object A holds a strong reference to B, B holds one back to A. When your last handle drops, each still has strong count 1, the destructors never run and the allocation lives until the process exits. In a long-running server that builds such structures per-request, memory climbs forever.

Prevention is mostly design discipline:

1. **Make ownership a DAG.** Draw your strong references; if there's a loop, demote one edge to `Weak<T>` (child → parent, observer → subject, cache entry → owner).
2. **Prefer plain ownership over `Rc`.** Many "shared" designs can use a single owner plus borrowed access, or indices into a `Vec` (the arena pattern used by graph libraries), indices can't form ownership cycles.
3. **Bound your collections.** A `HashMap` cache that only ever grows is a leak in practice, even with perfect ownership. Evict.

Detection: instrument with `Rc::strong_count` in tests, implement `Drop` with a log line to prove destructors fire, and on Linux run the binary under tools like valgrind or heaptrack. If a `Drop` you expect never prints, you've found your cycle.

::: tip Key Insight
Leaks in safe Rust come from *ownership loops and unbounded growth*, not from forgetting to call free. If your strong-reference graph is acyclic and your collections are bounded, you cannot leak by accident.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Demonstrating a real cycle leak, watch which `Drop` never runs:

```rust
use std::cell::RefCell;
use std::rc::Rc;

struct Node {
    name: &'static str,
    next: RefCell<Option<Rc<Node>>>,
}

impl Drop for Node {
    fn drop(&mut self) {
        println!("dropping {}", self.name);
    }
}

fn main() {
    // Acyclic: both nodes drop normally
    {
        let b = Rc::new(Node { name: "b (acyclic)", next: RefCell::new(None) });
        let _a = Rc::new(Node { name: "a (acyclic)", next: RefCell::new(Some(b)) });
    }

    // Cyclic: a -> b -> a. Neither Drop ever runs. LEAK.
    {
        let a = Rc::new(Node { name: "a (cycle)", next: RefCell::new(None) });
        let b = Rc::new(Node { name: "b (cycle)", next: RefCell::new(Some(Rc::clone(&a))) });
        *a.next.borrow_mut() = Some(Rc::clone(&b));
        println!("a strong = {}", Rc::strong_count(&a)); // 2
    }
    println!("end of main (cycle nodes were never dropped)");
}
```

### Example 2: Practical Application

The fix: break the loop with `Weak`, and verify destructors fire:

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Node {
    name: &'static str,
    next: RefCell<Option<Rc<Node>>>,
    prev: RefCell<Weak<Node>>, // back-edge is weak
}

impl Drop for Node {
    fn drop(&mut self) {
        println!("dropping {}", self.name);
    }
}

fn main() {
    {
        let a = Rc::new(Node {
            name: "a",
            next: RefCell::new(None),
            prev: RefCell::new(Weak::new()),
        });
        let b = Rc::new(Node {
            name: "b",
            next: RefCell::new(None),
            prev: RefCell::new(Rc::downgrade(&a)), // weak back-pointer
        });
        *a.next.borrow_mut() = Some(Rc::clone(&b));

        println!("a strong = {}", Rc::strong_count(&a)); // 1: only our handle
        println!("b strong = {}", Rc::strong_count(&b)); // 2: our handle + a.next
    }
    println!("end of scope: both nodes dropped");
}
```

::: details Output
Example 1:
```
dropping a (acyclic)
dropping b (acyclic)
a strong = 2
end of main (cycle nodes were never dropped)
```

Example 2:
```
a strong = 1
b strong = 2
dropping a
dropping b
end of scope: both nodes dropped
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Safe Rust prevents memory *unsafety*, not memory *leaks*, `Rc` cycles, `mem::forget`, and `Box::leak` all leak safely  
✅ Keep the strong-ownership graph acyclic; demote back-edges to `Weak<T>`  
✅ Arena/index patterns (`Vec` + `usize` handles) sidestep cycles entirely for graph-like data  
✅ Verify with `Rc::strong_count` assertions and `Drop` logging in tests, a destructor that never fires is a leak found

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Doubly-linked structures with `Rc` in both directions, the textbook cycle; one direction must be `Weak`
- Ever-growing caches or event-listener lists with no eviction/removal, a "logical leak" no smart pointer can save you from
- Assuming `Drop` always runs: `mem::forget`, cycles, and `std::process::exit` all skip destructors, don't put correctness-critical logic (only cleanup) in `Drop`
:::

## ✅ Quick Challenge

The starter code below leaks: `Owner` and `Gadget` point at each other strongly. Change one edge to `Weak` so both `Drop` messages print.

```rust
use std::cell::RefCell;
use std::rc::Rc;

struct Owner {
    gadget: RefCell<Option<Rc<Gadget>>>,
}
struct Gadget {
    owner: RefCell<Option<Rc<Owner>>>, // <- make this weak
}

impl Drop for Owner {
    fn drop(&mut self) { println!("owner dropped"); }
}
impl Drop for Gadget {
    fn drop(&mut self) { println!("gadget dropped"); }
}

fn main() {
    let owner = Rc::new(Owner { gadget: RefCell::new(None) });
    let gadget = Rc::new(Gadget { owner: RefCell::new(Some(Rc::clone(&owner))) });
    *owner.gadget.borrow_mut() = Some(Rc::clone(&gadget));
    // Currently prints nothing on drop - fix it!
}
```

<details>
<summary>💡 Hint</summary>

Change the field type to `RefCell<Weak<Owner>>`, initialize with `Rc::downgrade(&owner)`, and import `std::rc::Weak`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Owner {
    gadget: RefCell<Option<Rc<Gadget>>>,
}
struct Gadget {
    owner: RefCell<Weak<Owner>>, // weak back-edge breaks the cycle
}

impl Drop for Owner {
    fn drop(&mut self) { println!("owner dropped"); }
}
impl Drop for Gadget {
    fn drop(&mut self) { println!("gadget dropped"); }
}

fn main() {
    let owner = Rc::new(Owner { gadget: RefCell::new(None) });
    let gadget = Rc::new(Gadget { owner: RefCell::new(Rc::downgrade(&owner)) });
    *owner.gadget.borrow_mut() = Some(Rc::clone(&gadget));
    // Output:
    // owner dropped
    // gadget dropped
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Reference Cycles Can Leak Memory](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html)
- [Rustonomicon - Leaking](https://doc.rust-lang.org/nomicon/leaking.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-81">← Day 81: Weak&lt;T&gt; References</a>
  <a href="/week-12/day-83">Day 83: Project: Graph Data Structure →</a>
</div>
