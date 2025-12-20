## PureMVC MultiCore Pipes Utility — Developer Guide

Create synchronous pipelines that pass messages between PureMVC MultiCore Cores. This guide explains the key concepts and fittings, and shows end‑to‑end TypeScript examples that you can copy into your app.

### What are Pipes?

- A pipeline is a one‑way chain of `IPipeFitting`s.
- You write an `IPipeMessage` into one end, and each fitting synchronously handles and forwards it to the next.
- Fittings include: `Pipe`, `Filter`, `Queue`, `TeeSplit`, `TeeMerge`, and `PipeListener`.
- Between Cores, you typically manage named pipelines with a `Junction` and use a `JunctionMediator` to accept pipes and handle incoming messages.

### Install

```bash
npm install @puremvc/puremvc-typescript-multicore-framework
npm install @puremvc/puremvc-typescript-util-pipes
```

### Imports (ESM) 

```ts
import {
  // fittings
  Pipe,
  Filter,
  Queue,
  TeeSplit,
  TeeMerge,
  PipeListener,
  // junctions
  Junction,
  JunctionMediator,
  JunctionType,
  JunctionMediatorNotification,
  // messages & types
  IPipeMessage,
  PipeMessageType,
  FilterControlMessage,
  FilterControlMessageType,
  QueueControlMessage,
  QueueControlMessageType,
  FilterControlFunction,
  PropBag,
} from "@puremvc/puremvc-typescript-util-pipes";
```

---

## Core Concepts

### IPipeMessage

The payload you write into a pipeline.

```ts
const msg: IPipeMessage = {
  type: PipeMessageType.NORMAL,
  header: { topic: "orders" },
  body:   { id: 123, status: "NEW" },
  // optional: numeric priority, used by Queue when sorting
  priority: 10,
};
```

Notes:
- `type` is `PipeMessageType.NORMAL` for standard messages.
- Control messages (for `Filter` or `Queue`) use specialized `type` enums shown later.

### Junction and JunctionMediator

- `Junction` stores named INPUT/OUTPUT pipes for a Core.
- `JunctionMediator` is a base Mediator that handles notifications to accept pipes and provides a hook to handle inbound messages.

You will typically subclass `JunctionMediator` for your Core to:
1) Accept named input/output pipes when other Cores offer them.
2) Handle incoming `IPipeMessage`s from input pipes.

---

## Pipe Fittings Overview

### Pipe

The simplest fitting. It can connect one output and forward messages.

API highlights:
- `new Pipe(output?)`
- `connect(output: IPipeFitting)`
- `disconnect(): IPipeFitting | undefined`
- `write(message: IPipeMessage): boolean`

Use when you just need to join fittings or build a simple pipeline.

### PipeListener

Terminal fitting that invokes your callback.

```ts
const listener = new PipeListener((m) => {
  // handle final message
  console.log("Listener received:", m);
});
```

Great for tests, logging sinks, or delivering messages into application code that isn’t itself a fitting.

### Filter

Transforms or screens messages. Can be controlled at runtime via control messages.

Constructor:
```ts
const filter = new Filter({
  name: "OrderFilter",
  output: someOutputFitting,
  filter: (message, params) => {
    // mutate or inspect message
    if (message.body && params["uppercase"]) {
      const text = String(message.body["note"] ?? "");
      message.body["note"] = text.toUpperCase();
    }
    return true; // returning boolean is conventional; errors should throw
  },
  params: { uppercase: true } as PropBag,
});
```

Runtime control messages:

```ts
// Update params
const setParams: FilterControlMessage = {
  name: "OrderFilter",
  type: FilterControlMessageType.SET_PARAMS,
  params: { uppercase: false },
};

// Update filter function
const newFn: FilterControlFunction = (msg, params) => {
  if (msg.header) msg.header["seenBy"] = "newFn";
  return true;
};
const setFilter: FilterControlMessage = {
  name: "OrderFilter",
  type: FilterControlMessageType.SET_FILTER,
  filter: newFn,
};

// Toggle modes
const bypass:  FilterControlMessage = { name: "OrderFilter", type: FilterControlMessageType.BYPASS };
const enforce: FilterControlMessage = { name: "OrderFilter", type: FilterControlMessageType.FILTER };

// Send control messages through the pipeline just like normal
// You can write them to the Filter itself (it extends Pipe)
filter.write(setParams);
filter.write(setFilter);
filter.write(bypass);
filter.write(enforce);
```

When in BYPASS mode, normal messages pass through unchanged.

### Queue

Buffers incoming normal messages until FLUSH, and can optionally sort by `priority`.

```ts
const q = new Queue();
q.connect(listener); // where listener is a PipeListener or other fitting

// enqueue some messages
q.write({ type: PipeMessageType.NORMAL, body: { n: 1 }, priority: 5 });
q.write({ type: PipeMessageType.NORMAL, body: { n: 2 }, priority: 1 });

// sort subsequently received messages by ascending priority
const sortMsg: QueueControlMessage = { type: QueueControlMessageType.SORT };
q.write(sortMsg);

// enqueue another (will be considered in sorted order)
q.write({ type: PipeMessageType.NORMAL, body: { n: 3 }, priority: 9 });

// flush to downstream output
const flush: QueueControlMessage = { type: QueueControlMessageType.FLUSH };
q.write(flush);

// optional: return to FIFO mode for future enqueues
q.write({ type: QueueControlMessageType.FIFO });
```

Notes:
- Sorting is stable only for messages received after SORT was enabled.
- Multiple `Queue`s in a single serial chain are not recommended; the first handles control messages.

### TeeSplit

Forks the stream to multiple outputs.

```ts
const a = new PipeListener((m) => console.log("A", m));
const b = new PipeListener((m) => console.log("B", m));

const tee = new TeeSplit(a, b);
// You may add more later
// tee.connect(anotherOutput);

tee.write({ type: PipeMessageType.NORMAL, body: { fanout: true } });
```

If any output write returns false, the call returns false after attempting to write all outputs.

### TeeMerge

Converges multiple input pipelines into one output.

```ts
const out = new PipeListener((m) => console.log("Merged", m));

// Create two inputs, pass them to the constructor
const input1 = new Pipe();
const input2 = new Pipe();
const merge  = new TeeMerge(input1, input2);

// Connect the single downstream output once
merge.connect(out);

// Later, connect more inputs if needed
// merge.connectInput(anotherInputPipe);

// Write via each input
input1.write({ type: PipeMessageType.NORMAL, body: { from: 1 } });
input2.write({ type: PipeMessageType.NORMAL, body: { from: 2 } });
```

---

## Building Pipelines Between Cores

This section shows how to “plumb” two PureMVC Cores (modules) together.

### 1) Create a Junction and JunctionMediator in each Core

```ts
import { INotification } from "@puremvc/puremvc-typescript-multicore-framework";

class OrdersJunctionMediator extends JunctionMediator {
  public static NAME = "OrdersJunctionMediator";

  constructor() {
    super(OrdersJunctionMediator.NAME, new Junction());
  }

  // Handle incoming messages for this Core
  public override handlePipeMessage(message: IPipeMessage): void {
    if (message.type === PipeMessageType.NORMAL) {
      // Route to appropriate Proxies/Mediators within this Core
      // e.g., this.facade.sendNotification("ORDER_MESSAGE", message.body)
      console.log("Orders core received:", message);
    }
  }

  // Optionally override listNotificationInterests/handleNotification
  // to respond to additional app notifications.
}
```

`JunctionMediator` already handles two standard notifications to accept pipes:
- `JunctionMediatorNotification.ACCEPT_INPUT_PIPE`
- `JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE`

When it receives those notifications, it registers the pipe in its `Junction` and, for input pipes, automatically adds a `PipeListener` to call `handlePipeMessage`.

### 2) Offering and accepting pipes between Cores

From a composer/shell Core (or one of the modules) you can create a pipeline and offer the endpoints to the other Core’s `JunctionMediator` by sending the appropriate notifications.

```ts
import { Facade } from "@puremvc/puremvc-typescript-multicore-framework";

// Build a simple output pipeline from Orders -> Inventory
const ordersToInventory = new Pipe();
const filter = new Filter({ name: "Audit", output: new PipeListener(() => {}) });
ordersToInventory.connect(filter);

// Build the input side on the Inventory core
const inventoryInput = new Pipe();

// Send notifications to Inventory's JunctionMediator to accept pipes
const facade = Facade.getInstance("InventoryCoreKey");

facade.sendNotification(
  JunctionMediatorNotification.ACCEPT_INPUT_PIPE,
  inventoryInput,                 // body: IPipeFitting
  "orders-in",                   // type: input pipe name
);

facade.sendNotification(
  JunctionMediatorNotification.ACCEPT_OUTPUT_PIPE,
  ordersToInventory,              // body: IPipeFitting
  "orders-out",                  // type: output pipe name
);

// Internally, Inventory's OrdersJunctionMediator will register these
// with its Junction under the given names.
```

You can do the symmetric setup on the Orders core to accept Inventory’s output, etc.

### 3) Sending messages through a Junction

Once registered, you can send via the `Junction` by name, or by writing into the upstream pipe that is connected to the output.

```ts
// Assuming inside a JunctionMediator subclass, you have this.junction
this.junction.sendMessage("orders-out", {
  type: PipeMessageType.NORMAL,
  body: { action: "ALLOCATE", orderId: 42 },
});

// Or outside, if you kept the fitting reference, write directly:
ordersToInventory.write({
  type: PipeMessageType.NORMAL,
  body: { action: "ALLOCATE", orderId: 42 },
});
```

### 4) Fan‑out and fan‑in between Cores

- Use a `TeeSplit` to send the same message to multiple Cores:

```ts
// Split outgoing messages from Orders to both Inventory and Billing
const toInventory = new Pipe();
const toBilling   = new Pipe();

const split = new TeeSplit(toInventory, toBilling);

// upstream chain -> split
const upstream = new Pipe();
upstream.connect(split);

// register toInventory and toBilling as OUTPUT pipes with names
// (using JunctionMediator notifications as shown above)
```

- Use a `TeeMerge` to consolidate multiple inputs into one downstream output within a Core:

```ts
const merged = new TeeMerge(new Pipe(), new Pipe());
const sink   = new PipeListener((m) => console.log("got", m));
merged.connect(sink);

// elsewhere connect sources to merged
const src1 = new Pipe();
const src2 = new Pipe();
src1.connect(merged);
src2.connect(merged);
```

---

## Putting It All Together — Mini Example

Goal: Orders Core sends messages to Inventory Core via a filtered, queued pipeline.

```ts
// Build pipeline: Orders -> Filter(name=OrderFilter) -> Queue -> Inventory listener
const inventoryIn = new PipeListener((m) => console.log("Inventory received", m));

const q = new Queue();
q.connect(inventoryIn);

const orderFilter = new Filter({
  name: "OrderFilter",
  output: q,
  filter: (msg, params) => {
    // drop messages without an id
    if (!msg.body || typeof msg.body["id"] !== "number") {
      throw new Error("Missing id");
    }
    // add a tag
    msg.header = { ...(msg.header || {}), tagged: true };
    return true;
  },
  params: {},
});

const ordersOut = new Pipe(orderFilter);

// Control the Queue and Filter at runtime
orderFilter.write({ name: "OrderFilter", type: FilterControlMessageType.FILTER });
q.write({ type: QueueControlMessageType.SORT });

// Send some messages
ordersOut.write({ type: PipeMessageType.NORMAL, body: { id: 1 }, priority: 5 });
ordersOut.write({ type: PipeMessageType.NORMAL, body: { id: 2 }, priority: 1 });

// Flush to deliver to Inventory
q.write({ type: QueueControlMessageType.FLUSH });
```

---

## Tips and Best Practices

- Keep filter `name`s unique within a pipeline; control messages target by name.
- Prefer numeric `priority` values for `Queue` sorting (ascending).
- Avoid multiple `Queue`s in one serial chain; the first handles control messages.
- `TeeSplit`/`TeeMerge` constructors take two fittings for convenience; you can add more via `connect`/`connectInput` as needed.
- When bridging Cores, centralize junction wiring in shell/composer code, and keep message handling logic inside each Core’s `JunctionMediator#handlePipeMessage`.
- All writes are synchronous. If a downstream write returns `false` or a `Filter` throws, handle rollback in the caller as appropriate.

---

## API Reference

Generated API docs are under `docs/` in this repo. Key source files:
- `src/plumbing/Pipe.ts`
- `src/plumbing/Filter.ts`
- `src/plumbing/Queue.ts`
- `src/plumbing/TeeSplit.ts`
- `src/plumbing/TeeMerge.ts`
- `src/plumbing/PipeListener.ts`
- `src/plumbing/Junction.ts`
- `src/plumbing/JunctionMediator.ts`
- `src/types/message.ts`, `src/types/pipe.ts`, `src/types/enum.ts`
