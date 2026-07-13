---
title: "Day 83 - Project: Graph Data Structure"
description: "Learn about project: graph data structure in Rust"
---

# Day 83: Project: Graph Data Structure

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Apply this week's smart-pointer knowledge by building a graph two ways: the arena/index style idiomatic Rust favors, and an `Rc<RefCell<...>>` node style for comparison.

## 📚 The Concept (3 min)

Graphs are where Rust's ownership model gets tested. A graph node can be referenced by many other nodes, edges can form cycles, and nothing "owns" anything cleanly, the exact opposite of the tree-shaped ownership Rust loves. There are two mainstream ways to model this.

**Arena/index graphs**: store all nodes in a `Vec<Node>` owned by a `Graph` struct, and represent edges as `usize` indices into that vector. There are no smart pointers at all, the `Vec` is the single owner, and indices are just numbers, so cycles are trivially fine and nothing can leak. This is how petgraph and most production Rust graph code works. The trade-off: an index can go stale if you remove nodes (you must decide a strategy, e.g., tombstones), and the compiler can't stop you from using an index with the wrong graph.

**Pointer graphs**: each node is an `Rc<RefCell<Node>>` and edges are `Rc` clones (or `Weak` for back-edges). This feels like the textbook linked-structure approach from other languages. It works, but you inherit everything from this week: runtime borrow panics if you're careless, reference-count overhead, and, for cyclic graphs, guaranteed leaks unless you carefully use `Weak` for cycle-closing edges.

For today's project we build a small social network graph with the arena style, implement breadth-first search over it, and then look at a minimal `Rc`-based variant so you can feel the difference. The lesson generalizes: in Rust, *reach for indices before smart pointers* whenever data is many-to-many.

::: tip Key Insight
When ownership won't form a tree, don't fight the borrow checker with `Rc` everywhere, flatten the structure into a `Vec` arena and connect things with indices. Cheap, cycle-proof, cache-friendly.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Arena-style directed graph with BFS:

```rust
use std::collections::VecDeque;

struct Graph {
    names: Vec<String>,
    edges: Vec<Vec<usize>>, // adjacency list, indices into names
}

impl Graph {
    fn new() -> Self {
        Graph { names: Vec::new(), edges: Vec::new() }
    }

    fn add_node(&mut self, name: &str) -> usize {
        self.names.push(name.to_string());
        self.edges.push(Vec::new());
        self.names.len() - 1
    }

    fn add_edge(&mut self, from: usize, to: usize) {
        self.edges[from].push(to);
    }

    fn bfs(&self, start: usize) -> Vec<String> {
        let mut visited = vec![false; self.names.len()];
        let mut order = Vec::new();
        let mut queue = VecDeque::new();
        visited[start] = true;
        queue.push_back(start);
        while let Some(node) = queue.pop_front() {
            order.push(self.names[node].clone());
            for &next in &self.edges[node] {
                if !visited[next] {
                    visited[next] = true;
                    queue.push_back(next);
                }
            }
        }
        order
    }
}

fn main() {
    let mut g = Graph::new();
    let alice = g.add_node("Alice");
    let bob = g.add_node("Bob");
    let carol = g.add_node("Carol");
    let dave = g.add_node("Dave");

    g.add_edge(alice, bob);
    g.add_edge(alice, carol);
    g.add_edge(bob, dave);
    g.add_edge(dave, alice); // cycle - no problem with indices

    println!("BFS from Alice: {:?}", g.bfs(alice));
}
```

### Example 2: Practical Application

The same idea with `Rc<RefCell<...>>` nodes, note how much ceremony appears:

```rust
use std::cell::RefCell;
use std::rc::Rc;

type NodeRef = Rc<RefCell<Node>>;

struct Node {
    name: String,
    neighbors: Vec<NodeRef>,
}

fn node(name: &str) -> NodeRef {
    Rc::new(RefCell::new(Node { name: name.to_string(), neighbors: Vec::new() }))
}

fn main() {
    let alice = node("Alice");
    let bob = node("Bob");
    let carol = node("Carol");

    alice.borrow_mut().neighbors.push(Rc::clone(&bob));
    alice.borrow_mut().neighbors.push(Rc::clone(&carol));
    bob.borrow_mut().neighbors.push(Rc::clone(&carol));

    // Print Alice's neighborhood
    let a = alice.borrow();
    print!("{} knows:", a.name);
    for n in &a.neighbors {
        print!(" {}", n.borrow().name);
    }
    println!();
    println!("Carol's ref count: {}", Rc::strong_count(&carol));
}
```

::: details Output
Example 1:
```
BFS from Alice: ["Alice", "Bob", "Carol", "Dave"]
```

Example 2:
```
Alice knows: Bob Carol
Carol's ref count: 3
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Arena + indices is the idiomatic Rust graph: one owner (`Vec`), edges are plain `usize`, cycles are harmless  
✅ `Rc<RefCell<Node>>` graphs work but carry runtime borrow checks, count overhead, and leak risk on cycles  
✅ BFS/DFS over an arena needs only a `visited` vector and a queue/stack, no lifetime gymnastics  
✅ This trade-off (handles vs pointers) recurs across Rust: ECS game engines, compilers, and petgraph all pick indices

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- In the `Rc` version, chaining `alice.borrow()` while iterating and calling `borrow_mut()` on the same node, runtime panic
- Removing nodes from the arena with `swap_remove` invalidates indices held elsewhere, use tombstones (`Option<Node>`) or generational indices
- Forgetting the `visited` set in BFS/DFS on a cyclic graph, infinite loop in either representation
:::

## ✅ Quick Challenge

Extend the arena graph with a method `degree(&self, node: usize) -> usize` returning the number of outgoing edges, and a method `most_connected(&self) -> Option<&str>` returning the name of the node with the highest degree.

```rust
struct Graph {
    names: Vec<String>,
    edges: Vec<Vec<usize>>,
}

impl Graph {
    // ... assume new/add_node/add_edge from Example 1 ...
    fn degree(&self, node: usize) -> usize {
        0 // Your code here
    }
}

fn main() {
    println!("implement degree() and most_connected()");
}
```

<details>
<summary>💡 Hint</summary>

`degree` is just `self.edges[node].len()`. For `most_connected`, iterate `0..self.names.len()`, track the max degree index, and map it to `self.names[i].as_str()`; return `None` when the graph is empty.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Graph {
    names: Vec<String>,
    edges: Vec<Vec<usize>>,
}

impl Graph {
    fn new() -> Self {
        Graph { names: Vec::new(), edges: Vec::new() }
    }
    fn add_node(&mut self, name: &str) -> usize {
        self.names.push(name.to_string());
        self.edges.push(Vec::new());
        self.names.len() - 1
    }
    fn add_edge(&mut self, from: usize, to: usize) {
        self.edges[from].push(to);
    }
    fn degree(&self, node: usize) -> usize {
        self.edges[node].len()
    }
    fn most_connected(&self) -> Option<&str> {
        (0..self.names.len())
            .max_by_key(|&i| self.degree(i))
            .map(|i| self.names[i].as_str())
    }
}

fn main() {
    let mut g = Graph::new();
    let a = g.add_node("Alice");
    let b = g.add_node("Bob");
    let c = g.add_node("Carol");
    g.add_edge(a, b);
    g.add_edge(a, c);
    g.add_edge(b, c);

    println!("Alice's degree: {}", g.degree(a));            // 2
    println!("most connected: {:?}", g.most_connected());   // Some("Alice")
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Smart Pointers](https://doc.rust-lang.org/book/ch15-00-smart-pointers.html)
- [Rust by Example - Rc](https://doc.rust-lang.org/rust-by-example/std/rc.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-82">← Day 82: Memory Leaks Prevention</a>
  <a href="/week-12/day-84">Day 84: Smart Pointer Patterns →</a>
</div>
