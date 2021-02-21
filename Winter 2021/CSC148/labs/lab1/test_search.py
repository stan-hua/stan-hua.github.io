"""CSC148 Lab 1

=== CSC148 Winter 2021 ===
Department of Computer Science,
University of Toronto

=== Module description ===
This module illustrates a simple unit test for our binary_search function.
"""
from search import binary_search


def test_search() -> None:
    """Simple test for binary_search."""
    assert binary_search([0, 5, 10, 15, 20, 25, 30, 35, 40], 5) == 1

def test_single_item() -> None:
    "Test binary_search on a list with a single item."
    assert binary_search([5], 5) == 0

def test_single_item_v2() -> None:
    "Test binary_search on a list with a single item."
    assert binary_search([5], 6) == -1

def test_last_item() -> None:
    "Test binary_search on a list with length >1 for last item."
    assert binary_search([0, 5, 10, 15, 20, 25, 30, 35, 40], 40) == 8

def test_middle_item() -> None:
    "Test binary_search on a list with length >1 for middle item."
    assert binary_search([0, 5, 10, 15, 20, 25, 30, 40], 20) == 4

def test_near_middle_item() -> None:
    "Test binary_search on a list with length >1 for near but not middle item."
    assert binary_search([0, 5, 10, 15, 20, 25, 30, 40], 25) == 5

def test_single_item() -> None:
    "Test binary_search on an empty list."
    assert binary_search([], 5) == 0

if __name__ == '__main__':
    import pytest
    pytest.main(['test_search.py'])
