from __future__ import annotations

"""Subscription manager using linked list, queue, stack, searching, and sorting."""

from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Callable, Iterable, List, Optional


@dataclass
class Subscription:
    id: str
    name: str
    category: str
    price: float
    renewal_date: datetime
    billing_cycle: str = "monthly"
    reminder_days_before: int = 3
    cancelled: bool = False


@dataclass
class Reminder:
    subscription_id: str
    subscription_name: str
    renewal_date: datetime
    remind_at: datetime


class LinkedListNode:
    def __init__(self, value: Subscription) -> None:
        self.value = value
        self.next: Optional[LinkedListNode] = None


class SubscriptionLinkedList:
    def __init__(self) -> None:
        self.head: Optional[LinkedListNode] = None

    def append(self, value: Subscription) -> None:
        node = LinkedListNode(value)
        if self.head is None:
            self.head = node
            return

        current = self.head
        while current.next is not None:
            current = current.next
        current.next = node

    def find_by_id(self, sub_id: str) -> Optional[Subscription]:
        current = self.head
        while current is not None:
            if current.value.id == sub_id:
                return current.value
            current = current.next
        return None

    def update(self, sub_id: str, updater: Callable[[Subscription], Subscription]) -> bool:
        current = self.head
        while current is not None:
            if current.value.id == sub_id:
                current.value = updater(current.value)
                return True
            current = current.next
        return False

    def remove_by_id(self, sub_id: str) -> Optional[Subscription]:
        current = self.head
        previous: Optional[LinkedListNode] = None

        while current is not None:
            if current.value.id == sub_id:
                removed = current.value
                if previous is None:
                    self.head = current.next
                else:
                    previous.next = current.next
                return removed
            previous = current
            current = current.next
        return None

    def to_list(self) -> List[Subscription]:
        result: List[Subscription] = []
        current = self.head
        while current is not None:
            result.append(current.value)
            current = current.next
        return result


class Stack:
    def __init__(self) -> None:
        self._items: List[tuple[str, Subscription]] = []

    def push(self, item: tuple[str, Subscription]) -> None:
        self._items.append(item)

    def pop(self) -> Optional[tuple[str, Subscription]]:
        if not self._items:
            return None
        return self._items.pop()

    def is_empty(self) -> bool:
        return not self._items


class QueueNode:
    def __init__(self, value: Reminder) -> None:
        self.value = value
        self.next: Optional[QueueNode] = None


class Queue:
    def __init__(self) -> None:
        self.head: Optional[QueueNode] = None
        self.tail: Optional[QueueNode] = None

    def enqueue(self, value: Reminder) -> None:
        node = QueueNode(value)
        if self.tail is None:
            self.head = node
            self.tail = node
            return
        self.tail.next = node
        self.tail = node

    def dequeue(self) -> Optional[Reminder]:
        if self.head is None:
            return None

        value = self.head.value
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        return value

    def peek(self) -> Optional[Reminder]:
        if self.head is None:
            return None
        return self.head.value

    def is_empty(self) -> bool:
        return self.head is None


class SubscriptionManager:
    """Simple in-memory manager for subscription operations and reminders."""

    def __init__(self) -> None:
        self.subscriptions = SubscriptionLinkedList()
        self.undo_stack = Stack()
        self.reminder_queue = Queue()

    def add_subscription(self, subscription: Subscription) -> None:
        self.subscriptions.append(subscription)

    def edit_subscription(self, sub_id: str, **updates) -> bool:
        def updater(sub: Subscription) -> Subscription:
            return replace(sub, **updates)

        return self.subscriptions.update(sub_id, updater)

    def delete_subscription(self, sub_id: str) -> bool:
        removed = self.subscriptions.remove_by_id(sub_id)
        if removed is None:
            return False
        self.undo_stack.push(("deleted", removed))
        return True

    def cancel_subscription(self, sub_id: str) -> bool:
        original = self.subscriptions.find_by_id(sub_id)
        if original is None or original.cancelled:
            return False

        self.undo_stack.push(("cancelled", replace(original)))
        return self.subscriptions.update(sub_id, lambda sub: replace(sub, cancelled=True))

    def undo_last(self) -> bool:
        action = self.undo_stack.pop()
        if action is None:
            return False

        action_type, subscription = action
        if action_type == "deleted":
            self.subscriptions.append(subscription)
            return True

        if action_type == "cancelled":
            return self.subscriptions.update(
                subscription.id,
                lambda sub: replace(sub, cancelled=subscription.cancelled),
            )

        return False

    def list_subscriptions(self) -> List[Subscription]:
        return self.subscriptions.to_list()

    def search_by_name(self, query: str) -> List[Subscription]:
        search_text = query.lower().strip()
        return [
            sub
            for sub in self.subscriptions.to_list()
            if search_text in sub.name.lower()
        ]

    def sort_subscriptions(self, by: str = "renewal_date") -> List[Subscription]:
        items = self.subscriptions.to_list()
        if by == "price":
            return sorted(items, key=lambda sub: sub.price)
        if by == "category":
            return sorted(items, key=lambda sub: (sub.category, sub.name))
        return sorted(items, key=lambda sub: sub.renewal_date)

    def expiring_soon(self, within_days: int = 7) -> List[Subscription]:
        now = datetime.now()
        end = now + timedelta(days=within_days)
        return [
            sub
            for sub in self.subscriptions.to_list()
            if (not sub.cancelled) and now <= sub.renewal_date <= end
        ]

    def set_reminder_before_renewal(self, sub_id: str, days_before: int) -> bool:
        if days_before < 0:
            return False
        return self.subscriptions.update(
            sub_id,
            lambda sub: replace(sub, reminder_days_before=days_before),
        )

    def total_monthly_cost(self) -> float:
        factor = {
            "weekly": 4,
            "monthly": 1,
            "yearly": 1 / 12,
        }

        total = 0.0
        for sub in self.subscriptions.to_list():
            if sub.cancelled:
                continue
            total += sub.price * factor.get(sub.billing_cycle, 1)
        return round(total, 2)

    def build_reminder_queue(self, now: Optional[datetime] = None) -> None:
        current_time = now or datetime.now()
        self.reminder_queue = Queue()

        reminders: List[Reminder] = []
        for sub in self.subscriptions.to_list():
            if sub.cancelled:
                continue

            remind_at = sub.renewal_date - timedelta(days=sub.reminder_days_before)
            if remind_at >= current_time:
                reminders.append(
                    Reminder(
                        subscription_id=sub.id,
                        subscription_name=sub.name,
                        renewal_date=sub.renewal_date,
                        remind_at=remind_at,
                    )
                )

        for reminder in sorted(reminders, key=lambda item: item.remind_at):
            self.reminder_queue.enqueue(reminder)

    def pop_due_reminders(self, now: Optional[datetime] = None) -> List[Reminder]:
        current_time = now or datetime.now()
        due: List[Reminder] = []

        while True:
            head = self.reminder_queue.peek()
            if head is None or head.remind_at > current_time:
                break
            next_due = self.reminder_queue.dequeue()
            if next_due is not None:
                due.append(next_due)

        return due


def print_subscriptions(title: str, items: Iterable[Subscription]) -> None:
    print(f"\n{title}")
    for sub in items:
        status = "cancelled" if sub.cancelled else "active"
        print(
            f"- {sub.name:<10} | {sub.category:<13} | ${sub.price:<6} | "
            f"{sub.renewal_date.date()} | {status}"
        )


def run_example() -> None:
    manager = SubscriptionManager()
    now = datetime.now()

    manager.add_subscription(
        Subscription(
            id="s1",
            name="Netflix",
            category="Entertainment",
            price=12.99,
            renewal_date=now + timedelta(days=4),
            billing_cycle="monthly",
        )
    )
    manager.add_subscription(
        Subscription(
            id="s2",
            name="Notion",
            category="Productivity",
            price=8.00,
            renewal_date=now + timedelta(days=10),
            billing_cycle="monthly",
        )
    )
    manager.add_subscription(
        Subscription(
            id="s3",
            name="Duolingo",
            category="Education",
            price=84.00,
            renewal_date=now + timedelta(days=30),
            billing_cycle="yearly",
        )
    )

    print_subscriptions("All subscriptions", manager.list_subscriptions())

    manager.edit_subscription("s2", price=10.00)
    print_subscriptions("After editing Notion", manager.list_subscriptions())

    manager.delete_subscription("s3")
    print_subscriptions("After deleting Duolingo", manager.list_subscriptions())

    manager.undo_last()
    print_subscriptions("After undo delete", manager.list_subscriptions())

    manager.cancel_subscription("s1")
    print_subscriptions("After cancelling Netflix", manager.list_subscriptions())

    print_subscriptions("Search: 'no'", manager.search_by_name("no"))
    print_subscriptions("Sort by renewal date", manager.sort_subscriptions("renewal_date"))
    print_subscriptions("Sort by price", manager.sort_subscriptions("price"))
    print_subscriptions("Sort by category", manager.sort_subscriptions("category"))
    print_subscriptions("Expiring in next 7 days", manager.expiring_soon(within_days=7))

    manager.set_reminder_before_renewal("s2", 3)
    manager.build_reminder_queue(now=now)
    due = manager.pop_due_reminders(now=now + timedelta(days=7))

    print("\nDue reminders")
    for reminder in due:
        print(
            f"- {reminder.subscription_name} | remind at {reminder.remind_at} | "
            f"renews on {reminder.renewal_date}"
        )

    print(f"\nTotal monthly cost: ${manager.total_monthly_cost()}")


if __name__ == "__main__":
    run_example()
