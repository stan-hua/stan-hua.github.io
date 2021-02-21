"""CSC148 - Welcome file

Welcome to CSC148! This is a sample Python file that you should be able to
run after you have completed the steps in the Software Guide on Quercus

To run this file in PyCharm, go to Run -> Run...
and select 'welcome' in the popup menu.
After you've run this program for the first time, you'll be able to re-run it
easily by pressing the green arrow in the toolbar.
"""
import sys

MY_NAME = 'Stan'


def _check_python_version() -> None:
    """This will raise an error if you have not installed python3.9"""
    version = sys.version_info
    if version < (3, 9, 0):
        raise Exception(f'Oh no! You have installed python version '
                        f'{version.major}.{version.minor}.{version.micro} '
                        f'You need to install version 3.9.0')


def greet(name: str) -> str:
    """Return a welcome message for the given person.

    >>> greet('Diane')
    'Hello, Diane! Welcome to CSC148. Hope you have a great time this term. :)'
    """
    return f'Hello, {name}! Welcome to CSC148. ' \
           f'Hope you have a great time this term. :)'


if __name__ == '__main__':
    _check_python_version()
    print(greet(MY_NAME))

    # Uncomment the code below to run our code checking tool, python_ta.
    # You should have downloaded and installed this library in PyCharm
    # as part of following the Software Guide.

    import python_ta
    python_ta.check_all(config={'extra-imports': ['sys']})
