import { describe, it, expect, beforeEach } from "bun:test";
import { ElementAndState } from "../util.js";

// Mock DOM element
class MockElement {
  constructor() {
    this.classList = {
      classes: new Set(),
      add: function(className) {
        this.classes.add(className);
      },
      remove: function(className) {
        this.classes.delete(className);
      },
      contains: function(className) {
        return this.classes.has(className);
      },
      get length() {
        return this.classes.size
      }
    };
  }
}

describe("ElementAndState", () => {
  let element;

  beforeEach(() => {
    element = new MockElement();
  });

  const binary_states = {
    ACTIVE: "active",
    INACTIVE: "inactive"
  }

  const fruit_states = {
    A: "apple",
    B: "banana",
    C: "cherry", 
    D: "date"
  }

  describe("construction", () => {
    it("sets states to the values of an object", () => {
      const example = new ElementAndState(element, binary_states)
      expect(example).toBeDefined
      expect(example.el).toBe(element)
      expect(example.states).toEqual(Object.values(binary_states))
    })

    it("does not set a state", () => {
      const example = new ElementAndState(element, binary_states)
      expect(example).toBeDefined()
      expect(element.classList.contains("active")).toBeFalse
      expect(element.classList.contains("inactive")).toBeFalse
    })
  })

  describe("setState", () => {
    it("Adds a state", () => {
      const example = new ElementAndState(element, binary_states)
      example.setState(binary_states.ACTIVE)
      expect(element.classList.contains("active")).toBeTrue
      expect(element.classList.contains("inactive")).toBeFalse
    })

    it("Removes an existing class and adds a new class", () => {
      element.classList.add(fruit_states.B);

      // Test the test, make sure the setup is as we expect.
      expect(element.classList.contains(fruit_states.A)).toBeFalse();
      expect(element.classList.contains(fruit_states.B)).toBeTrue();
      expect(element.classList.contains(fruit_states.C)).toBeFalse();
      expect(element.classList.contains(fruit_states.D)).toBeFalse();

      const lns = new ElementAndState(element, fruit_states)
      lns.setState(fruit_states.D);
      
      expect(element.classList.contains(fruit_states.A)).toBeFalse();
      expect(element.classList.contains(fruit_states.B)).toBeFalse();
      expect(element.classList.contains(fruit_states.C)).toBeFalse();
      expect(element.classList.contains(fruit_states.D)).toBeTrue();
    })

    it("Works when setting to the state that's already set.", () => {
      element.classList.add("banana");

      // Test the test, make sure the setup is as we expect.
      expect(element.classList.contains("apple")).toBeFalse();
      expect(element.classList.contains("banana")).toBeTrue();
      expect(element.classList.contains("cherry")).toBeFalse();
      expect(element.classList.contains("date")).toBeFalse();

      const lns = new ElementAndState(element, fruit_states)
      lns.setState(fruit_states.B);
      
      expect(element.classList.contains("apple")).toBeFalse();
      expect(element.classList.contains("banana")).toBeTrue();
      expect(element.classList.contains("cherry")).toBeFalse();
      expect(element.classList.contains("date")).toBeFalse();
    })

    it("Removes more than one existing class.", () => {
      element.classList.add(fruit_states.A)
      element.classList.add(fruit_states.B);

      // Test the test, make sure the setup is as we expect.
      expect(element.classList.contains(fruit_states.A)).toBeTrue();
      expect(element.classList.contains(fruit_states.B)).toBeTrue();
      expect(element.classList.contains(fruit_states.C)).toBeFalse();
      expect(element.classList.contains(fruit_states.D)).toBeFalse();
      expect(element.classList.length).toEqual(2);

      const lns = new ElementAndState(element, fruit_states)
      lns.setState(fruit_states.C);
      expect(element.classList.length).toEqual(1)
      // Test the test, make sure the setup is as we expect.
      expect(element.classList.contains(fruit_states.A)).toBeFalse();
      expect(element.classList.contains(fruit_states.B)).toBeFalse();
      expect(element.classList.contains(fruit_states.C)).toBeTrue();
      expect(element.classList.contains(fruit_states.D)).toBeFalse();
    })
    it("Throws an error when setting an invalid state.", () => {
      const example = new ElementAndState(element, binary_states)
      expect(() => example.setState("state-that-does-not-exist")).toThrow("ElementAndState: Attempted to set an invalid state.");

    })
  })

  describe("getState", () => {
    it("Returns current state", () => {
      const example = new ElementAndState(element, binary_states)
      example.setState(binary_states.ACTIVE)
      expect(example.getState()).toBe(binary_states.ACTIVE);
    });

    it("Returns undefined when no state is set", () => {
      const example = new ElementAndState(element, binary_states)
      expect(example.getState()).toBeUndefined();
    });

    it("Returns undefined when more than one state is set", () => {
      const example = new ElementAndState(element, binary_states)
      element.classList.add(binary_states.ACTIVE)
      element.classList.add(binary_states.INACTIVE);
      expect(example.getState()).toBeUndefined();
    });

    it("Returns undefined when an invalid state is set", () => {
      const example = new ElementAndState(element, binary_states)
      element.classList.add("invalid-state-is-set")
      expect(example.getState()).toBeUndefined();
    });
  });

  describe("toggleState", () => {
    it("Switches between two states", () => {
      const example = new ElementAndState(element, binary_states)
      example.setState(binary_states.ACTIVE)
      example.toggleState();
      expect(example.getState()).toEqual(binary_states.INACTIVE)

      example.toggleState();
      expect(example.getState()).toEqual(binary_states.ACTIVE)
    });

    it("Throws error when not exactly 2 states", () => {
      const example = new ElementAndState(element, fruit_states);
      expect(() => example.toggleState()).toThrow("ElementAndState: Can only toggle state when there are exactly two.");
    });

    it("Throws when no state is set", () => {
      const example = new ElementAndState(element, binary_states)
      expect(() => example.toggleState()).toThrow("ElementAndState: toggleState() invoked when no state was set");
    });
  });
});

