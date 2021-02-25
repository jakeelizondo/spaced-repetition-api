class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    // if there are no items in list, insert as first
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      //move through list until find the end and insert

      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      //once you get to the end, insert new node
      tempNode.next = new _Node(item, null);
    }
  }

  insertBefore(item, keyVal) {
    //start at list head
    let currNode = this.head;

    //if no head, list is empty
    if (!currNode) {
      return null;
    }

    // if the head contains the value to insert before, just insert first
    if (currNode.value === keyVal) {
      this.insertFirst(item);
      return;
    }

    // find the node with the value to insert before, once it is next insert before
    while (currNode.next.value !== keyVal && currNode.next.next !== null) {
      currNode = currNode.next;
    }

    if (currNode.next.value === keyVal) {
      let tempNode = new _Node(item, currNode.next);
      currNode.next = tempNode;
    } else {
      //item to insert before was not found
      return;
    }
  }

  insertAfter(item, keyVal) {
    // start at list head
    let currNode = this.head;
    //if no head, list is empty
    if (!currNode) {
      return null;
    }

    //find node with keyVal
    while (currNode.value !== keyVal && currNode.next !== null) {
      currNode = currNode.next;
    }

    //if node to insert after is the last node, just insert last
    if (currNode.value === keyVal && currNode.next === null) {
      this.insertLast(item);
      return;
    }

    // otherwise, once found, insert item after the current node and adjust pointers
    if (currNode.value === keyVal) {
      let tempNode = new _Node(item, currNode.next);
      currNode.next = tempNode;
    } else {
      //item not found
      return null;
    }
  }

  find(item) {
    //start at list head
    let currNode = this.head;
    // if no head, then list is empty
    if (!this.head) {
      return null;
    }
    //check the value of current node for the item
    while (currNode.value !== item) {
      // return null if reach end without finding item
      if (currNode.next === null) {
        return null;
      } else {
        //move to next node
        currNode = currNode.next;
      }
    }

    //sweet, found it

    return currNode;
  }

  remove(item) {
    // if list is empty return null
    if (!this.head) {
      return null;
    }

    // if node to remove its head, make next node the new head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }

    // start at the head otherwise
    let currNode = this.head;
    //keep track of previous node to re-route next value once on correct node to delete
    let previousNode = this.head;
    // find right node
    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    // if currNode is null you hit the end of the list
    if (currNode === null) {
      console.log('item not found');
      return null;
    } else {
      //otherwise, set the previous node to point to the next node, dropping out the node to delete
      previousNode.next = currNode.next;
    }
  }
}

module.exports = { LinkedList };
