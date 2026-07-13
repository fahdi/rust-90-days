---
title: "Day 32 - Tuple Structs"
description: "Learn about tuple structs in Rust"
---

# Day 32: Tuple Structs

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Define and use tuple structs, structs with positional fields instead of named ones, and apply the newtype pattern to make the compiler catch unit and ID mix-ups for you.

## 📚 The Concept (3 min)

You already know two ways to group data: tuples like `(255, 0, 0)` and structs with named fields like `struct Color { r: u8, g: u8, b: u8 }`. A **tuple struct** sits between them: it has a name, but its fields are positional.

```rust
struct Color(u8, u8, u8);
struct Point(i32, i32);
```

Why would you want a struct without field names? Because the *type name* itself carries the meaning. A plain tuple `(u8, u8, u8)` could be anything, a color, a date, a version number. But `Color(255, 127, 80)` is unmistakably a color, and crucially, the compiler agrees: even though `Color` and a hypothetical `Version(u8, u8, u8)` have identical field layouts, they are completely different types. You cannot pass one where the other is expected.

You access fields with dot-index syntax (`color.0`, `color.1`), the same as tuples, and you can destructure them with `let Color(r, g, b) = ...`.

The most important use is the **newtype pattern**: a tuple struct with exactly one field that wraps another type. Think of it like putting a labeled envelope around a value. `Meters(3.0)` and `Feet(3.0)` both contain an `f64`, but the envelope label makes them incompatible. NASA lost the Mars Climate Orbiter in 1999 because one team used metric units and another used imperial, both were "just numbers" to the software. With newtypes, that class of bug becomes a compile error instead of a crash landing.

Tuple structs support `impl` blocks too, so you can hang methods like `to_feet()` off them, just like regular structs.

::: tip Key Insight
Two tuple structs with identical field types are still **different types**. That's the whole point: `Meters(5.0)` and `Feet(5.0)` both wrap an `f64`, but the compiler will refuse to mix them up, turning silent logic bugs into loud compile errors.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
// A tuple struct: named type, unnamed fields
struct Color(u8, u8, u8);
struct Point(i32, i32);

fn main() {
    let coral = Color(255, 127, 80);
    let origin = Point(0, 0);

    // Access fields by index, just like tuples
    println!("Coral RGB: ({}, {}, {})", coral.0, coral.1, coral.2);
    println!("Origin: ({}, {})", origin.0, origin.1);

    // Destructure a tuple struct
    let Point(x, y) = Point(3, 7);
    println!("Destructured: x = {}, y = {}", x, y);
}
```

### Example 2: Practical Application

```rust
// The "newtype" pattern: wrap a primitive to get a distinct type
struct Meters(f64);
struct Feet(f64);

impl Meters {
    fn to_feet(&self) -> Feet {
        Feet(self.0 * 3.28084)
    }
}

impl Feet {
    fn to_meters(&self) -> Meters {
        Meters(self.0 / 3.28084)
    }
}

// This function ONLY accepts Meters — passing Feet is a compile error
fn describe_altitude(altitude: Meters) {
    println!("Flying at {:.1} m ({:.1} ft)", altitude.0, altitude.to_feet().0);
}

fn main() {
    let cruising = Meters(10668.0);
    describe_altitude(cruising);

    let runway = Feet(9800.0);
    println!("Runway length: {:.1} m", runway.to_meters().0);
}
```

::: details Output
```
Coral RGB: (255, 127, 80)
Origin: (0, 0)
Destructured: x = 3, y = 7
```

```
Flying at 10668.0 m (35000.0 ft)
Runway length: 2987.0 m
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Tuple structs combine a named type with positional fields: `struct Point(i32, i32);`  
✅ Access fields with `.0`, `.1`, ... or destructure with `let Point(x, y) = p;`  
✅ Identical layouts don't mean identical types, `Meters(f64)` and `Feet(f64)` can never be swapped by accident  
✅ The single-field "newtype" pattern is the idiomatic way to give raw numbers and strings domain meaning (units, IDs, validated input)

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the semicolon after the definition.** `struct Point(i32, i32)` without a trailing `;` does NOT compile, unlike a `struct Point { ... }` block, a tuple struct definition is a statement that needs one.
- **Trying to assign one wrapper to another because "they're both f64".** `let m: Meters = Feet(5.0);` does NOT compile, that's mismatched types, which is exactly the protection you wanted. Convert explicitly (`feet.to_meters()`) or unwrap with `.0`.
- **Reaching for a tuple struct when fields need names.** `Rect(f64, f64)`, is that width-then-height or height-then-width? With 3+ fields or ambiguous ordering, a regular struct with named fields is the clearer choice. Tuple structs shine when position is obvious (x/y, RGB) or there's only one field.
:::

## ✅ Quick Challenge

Define a `to_fahrenheit` method on `Celsius` that returns a `Fahrenheit` tuple struct, then print the boiling point of water in both units.

```rust
// Starter code
struct Celsius(f64);
struct Fahrenheit(f64);

fn main() {
    let boiling = Celsius(100.0);
    // TODO: convert `boiling` to Fahrenheit and print it
    // Formula: F = C * 9/5 + 32
    println!("Water boils at {} degrees C", boiling.0);
}
```

<details>
<summary>💡 Hint</summary>

Add an `impl Celsius` block with `fn to_fahrenheit(&self) -> Fahrenheit`. Inside, read the wrapped value with `self.0` and return `Fahrenheit(...)` with the converted number. Use floating-point literals (`9.0 / 5.0`, not `9 / 5`, integer division would give you `1`).

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Celsius(f64);
struct Fahrenheit(f64);

impl Celsius {
    fn to_fahrenheit(&self) -> Fahrenheit {
        Fahrenheit(self.0 * 9.0 / 5.0 + 32.0)
    }
}

fn main() {
    let boiling = Celsius(100.0);
    let f = boiling.to_fahrenheit();
    println!("Water boils at {} degrees C = {} degrees F", boiling.0, f.0);

    let body = Celsius(37.0);
    println!("Body temperature: {} degrees F", body.to_fahrenheit().0);
}
```

Output:

```
Water boils at 100 degrees C = 212 degrees F
Body temperature: 98.6 degrees F
```

</details>

## 📖 Additional Resources

- [The Rust Book - Using Tuple Structs Without Named Fields](https://doc.rust-lang.org/book/ch05-01-defining-structs.html#using-tuple-structs-without-named-fields-to-create-different-types)
- [Rust by Example - Structures](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-31">← Day 31: Associated Functions</a>
  <a href="/week-05/day-33">Day 33: Enums Basics →</a>
</div>
