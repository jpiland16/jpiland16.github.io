#!/usr/bin/python
import os, shutil, re, textwrap

HTML_TARGET_RE = re.compile("(\s*)<!-- TARGET FOR NON-TEMPLATE HTML INSERTION -->")

BUILD_DIR = "build"

def main():
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.mkdir(BUILD_DIR)

    with open("src/index.html", "r") as file:
        index_html = file.read()

    index_lines = index_html.splitlines()

    indentation = 0
    match = None

    for line in index_lines:
        search = HTML_TARGET_RE.search(line)
        if search:
            indentation = len(search.group(1))
            match = search.group(0)

    if not match:
        raise ValueError("MATCH FOR TEMPLATE INSERTION NOT FOUND IN index.html")

    with open("src/home.html", "r") as file:
        home_html = file.read()

    with open("build/index.html", "w") as file:
        file.write(index_html.replace(
            match, textwrap.indent(home_html, " " * indentation)))


    shutil.copytree("src/static", "build/static")


if __name__ == "__main__":
    main()
